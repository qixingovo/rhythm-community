import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"
import { verifyAccessToken } from "@/lib/auth/jwt"

export async function POST(request: NextRequest) {
  const token = request.headers.get("cookie")?.match(/(?:^|;\s*)accessToken=([^;]+)/)?.[1]
  if (!token) return NextResponse.json({ error: "未登录" }, { status: 401 })
  const payload = verifyAccessToken(token)
  if (!payload) return NextResponse.json({ error: "登录已过期" }, { status: 401 })

  try {
    const { game, goal } = await request.json()
    if (!game || !goal) return NextResponse.json({ error: "请选择游戏和目标" }, { status: 400 })

    const recentScores = await prisma.score.findMany({
      where: { userId: payload.userId, game },
      orderBy: { createdAt: "desc" },
      take: 10,
    })
    const levelContext = recentScores.map(s => `${s.songTitle} (${s.chartLevel}): ${s.grade}`).join(", ")

    const prompt = `为用户生成一个7天音游训练计划：
游戏: ${game}
目标: ${goal}
最近成绩: ${levelContext || "无数据"}

请以JSON格式回复：{"title":"计划标题","days":[{"day":1,"task":"训练任务描述","target":"目标"},...]}`

    const res = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY || ""}` },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: "你是音游教练，给出结构化训练计划。只输出JSON。" },
          { role: "user", content: prompt },
        ],
        temperature: 0.5,
        max_tokens: 1500,
        response_format: { type: "json_object" },
      }),
    })

    const json = await res.json()
    const plan = JSON.parse(json.choices?.[0]?.message?.content || "{}")

    // 保存到数据库
    const saved = await prisma.trainingPlan.create({
      data: {
        userId: payload.userId,
        game,
        title: plan.title || `${game} 训练计划`,
        goal,
        dailyPlan: plan.days || [],
        startDate: new Date(),
      },
    })

    return NextResponse.json({ plan: saved })
  } catch (error) {
    console.error("Plan error:", error)
    return NextResponse.json({ error: "生成失败" }, { status: 500 })
  }
}
