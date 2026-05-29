import { NextRequest } from "next/server"
import { createChatCompletion, type ChatMessage } from "@/lib/agent/client"

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json()

    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: "缺少 messages 参数" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    const systemPrompt = `你是一个音游进阶陪练 AI，精通以下游戏：
- Arcaea（韵律源点）：单键/长条/蛇形/天键，PST/PRS/FTR/ETR/BYD 难度
- Phigros（扉格若斯）：下落式 + 判定线移动，EZ/HD/IN/AT 难度
- 舞萌（maimai DX）：触摸屏圆形判定，BASIC/ADVANCED/EXPERT/MASTER/Re:MASTER

你的能力：
1. 解释音游术语和黑话（如"越级""纵连""交互""出张""全押""癖"等）
2. 分析打歌成绩，找出失误集中段落和提升技巧
3. 针对具体谱面给出指法优化建议
4. 根据用户水平推荐适合练习的曲目

回复规则：
- 简洁直接，给出可操作建议
- 引用具体谱面段落时标注时间戳
- 如果用户没说游戏/难度，先问清楚再给建议
- 不要给"多练"这种废话，要具体到练哪首曲、练什么手法`

    const chatMessages: ChatMessage[] = [
      { role: "system", content: systemPrompt },
      ...messages.map((m: { role: string; content: string }) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    ]

    const response = await createChatCompletion(chatMessages, {
      stream: true,
    })

    const encoder = new TextEncoder()
    const readable = new ReadableStream({
      async start(controller) {
        try {
          const reader = response.body?.getReader()
          if (!reader) {
            controller.close()
            return
          }

          const decoder = new TextDecoder()
          let buffer = ""

          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            buffer += decoder.decode(value, { stream: true })
            const lines = buffer.split("\n")
            buffer = lines.pop() || ""

            for (const line of lines) {
              const trimmed = line.trim()
              if (!trimmed || !trimmed.startsWith("data: ")) continue

              const data = trimmed.slice(6)
              if (data === "[DONE]") {
                controller.enqueue(encoder.encode("data: [DONE]\n\n"))
                continue
              }

              try {
                const parsed = JSON.parse(data)
                const delta = parsed.choices?.[0]?.delta?.content
                if (delta) {
                  controller.enqueue(
                    encoder.encode(`data: ${JSON.stringify({ content: delta })}\n\n`)
                  )
                }
              } catch {
                // skip unparseable chunks
              }
            }
          }

          controller.enqueue(encoder.encode("data: [DONE]\n\n"))
          controller.close()
        } catch (error) {
          console.error("Stream error:", error)
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ content: "抱歉，AI 服务暂时不可用，请稍后重试。" })}\n\n`
            )
          )
          controller.enqueue(encoder.encode("data: [DONE]\n\n"))
          controller.close()
        }
      },
    })

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    })
  } catch (error) {
    console.error("Chat API error:", error)
    return new Response(JSON.stringify({ error: "处理请求失败" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
