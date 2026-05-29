import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const game = searchParams.get("game") || undefined
  const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100)

  try {
    const where: Record<string, unknown> = { isPublic: true }
    if (game) where.game = game

    const topScores = await prisma.score.findMany({
      where,
      orderBy: { score: "desc" },
      take: limit,
      include: {
        user: { select: { id: true, username: true, avatar: true } },
      },
    })

    const entries = topScores.map((s, i) => ({
      rank: i + 1,
      userId: s.user.id,
      username: s.user.username,
      avatar: s.user.avatar,
      songTitle: s.songTitle,
      game: s.game,
      chartLevel: s.chartLevel,
      score: s.score,
      grade: s.grade,
    }))

    return NextResponse.json({ entries })
  } catch (error) {
    console.error("Leaderboard error:", error)
    return NextResponse.json({ error: "获取排行榜失败" }, { status: 500 })
  }
}
