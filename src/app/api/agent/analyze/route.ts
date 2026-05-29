import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"
import { verifyAccessToken } from "@/lib/auth/jwt"

export async function POST(request: NextRequest) {
  const token = request.headers.get("cookie")?.match(/(?:^|;\s*)accessToken=([^;]+)/)?.[1]
  if (!token) return NextResponse.json({ error: "未登录" }, { status: 401 })
  const payload = verifyAccessToken(token)
  if (!payload) return NextResponse.json({ error: "登录已过期" }, { status: 401 })

  try {
    const { scoreId } = await request.json()
    const score = await prisma.score.findUnique({ where: { id: scoreId } })
    if (!score) return NextResponse.json({ error: "成绩不存在" }, { status: 404 })

    // 加载该用户同游戏近 20 条成绩作参考
    const recentScores = await prisma.score.findMany({
      where: { userId: payload.userId, game: score.game, id: { not: scoreId } },
      orderBy: { createdAt: "desc" },
      take: 20,
    })

    const context = recentScores.map(s =>
      `${s.songTitle} ${s.chartLevel}: ${(s.score / 10000).toFixed(4)}% (${s.grade})`
    ).join("\n")

    const prompt = `分析这条打歌成绩并给出提升建议：
当前成绩：${score.songTitle} ${score.chartLevel} 分数 ${(score.score / 10000).toFixed(4)}% 评级 ${score.grade}
该游戏近20条成绩：
${context || "无历史数据"}

请以JSON格式回复：{"overall":"总体评价","strengths":["优势1","优势2"],"weaknesses":["弱点1","弱点2"],"suggestions":["建议1","建议2"],"drills":["练习曲推荐1","练习曲推荐2"]}`

    const res = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY || ""}` },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: "你是音游数据分析师，给出简洁专业的成绩分析和练习建议。只输出JSON，不输出其他内容。" },
          { role: "user", content: prompt },
        ],
        temperature: 0.3,
        max_tokens: 1000,
        response_format: { type: "json_object" },
      }),
    })

    const json = await res.json()
    const analysis = JSON.parse(json.choices?.[0]?.message?.content || "{}")

    // 缓存到 Score
    await prisma.score.update({ where: { id: scoreId }, data: { agentAnalysis: analysis } })

    return NextResponse.json({ analysis })
  } catch (error) {
    console.error("Analyze error:", error)
    return NextResponse.json({ error: "分析失败" }, { status: 500 })
  }
}
