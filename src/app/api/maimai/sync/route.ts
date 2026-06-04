import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"
import { verifyAccessToken } from "@/lib/auth/jwt"

export async function POST(request: NextRequest) {
  const token = request.headers.get("cookie")?.match(/(?:^|;\s*)accessToken=([^;]+)/)?.[1]
  if (!token) return NextResponse.json({ error: "未登录" }, { status: 401 })
  const payload = verifyAccessToken(token)
  if (!payload) return NextResponse.json({ error: "登录已过期" }, { status: 401 })

  try {
    const { username } = await request.json()
    if (!username) return NextResponse.json({ error: "请输入 maimai 用户名" }, { status: 400 })

    // 更新绑定
    await prisma.user.update({ where: { id: payload.userId }, data: { maimaiUsername: username } })

    // 从 diving-fish 拉取成绩
    const dfToken = process.env.DIVING_FISH_TOKEN || ""
    const res = await fetch(
      `https://www.diving-fish.com/api/maimaidxprober/dev/player/records?username=${encodeURIComponent(username)}`,
      { headers: { "Developer-Token": dfToken } }
    )
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      return NextResponse.json({ error: (err as any).msg || "获取失败，检查用户名是否正确" }, { status: 400 })
    }

    const data = await res.json() as { records: { title: string; type: string; level: string; achievements: number; rate: string; ds: number; ra: number; song_id: number }[]; rating: number }
    if (!data.records?.length) return NextResponse.json({ error: "该账号无成绩" }, { status: 400 })

    // 删除旧成绩
    await prisma.score.deleteMany({ where: { userId: payload.userId, game: "舞萌" } })

    // 批量导入
    const batch = data.records.map(r => ({
      userId: payload.userId,
      game: "舞萌",
      songTitle: r.title,
      chartType: r.type,
      chartLevel: r.level,
      score: Math.round(r.achievements * 10000),
      grade: r.rate,
      agentAnalysis: { ds: r.ds, ra: r.ra, songId: r.song_id },
      isPublic: true,
    }))

    await prisma.score.createMany({ data: batch })

    // 更新 bio
    await prisma.user.update({
      where: { id: payload.userId },
      data: { bio: `舞萌 Rating ${data.rating}` },
    })

    return NextResponse.json({ success: true, count: batch.length, rating: data.rating })
  } catch (error) {
    console.error("Sync error:", error)
    return NextResponse.json({ error: "同步失败" }, { status: 500 })
  }
}
