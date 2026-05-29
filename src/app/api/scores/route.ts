import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"
import { verifyAccessToken } from "@/lib/auth/jwt"

function getUserId(request: NextRequest): string | null {
  const token = request.cookies.get("accessToken")?.value
  if (!token) return null
  const payload = verifyAccessToken(token)
  return payload?.userId ?? null
}

export async function GET(request: NextRequest) {
  const userId = getUserId(request)
  if (!userId) {
    return NextResponse.json({ error: "未登录" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const game = searchParams.get("game") || undefined
  const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100)
  const offset = parseInt(searchParams.get("offset") || "0")

  try {
    const where: Record<string, unknown> = { userId }
    if (game && game !== "all") {
      where.game = game
    }

    const [scores, total] = await Promise.all([
      prisma.score.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
        include: {
          user: { select: { id: true, username: true, avatar: true } },
        },
      }),
      prisma.score.count({ where }),
    ])

    return NextResponse.json({ scores, total })
  } catch (error) {
    console.error("Get scores error:", error)
    return NextResponse.json({ error: "获取成绩失败" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const userId = getUserId(request)
  if (!userId) {
    return NextResponse.json({ error: "未登录" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { songTitle, game, chartType, chartLevel, score, grade, perfectCount, greatCount, missCount, recordingUrl, screenshotUrl, notes, isPublic } = body

    if (!songTitle || !game || !chartLevel || score === undefined) {
      return NextResponse.json({ error: "缺少必填字段：songTitle, game, chartLevel, score" }, { status: 400 })
    }

    const newScore = await prisma.score.create({
      data: {
        userId,
        game,
        songTitle,
        chartType: chartType || null,
        chartLevel,
        score: parseInt(String(score)),
        grade: grade || null,
        perfectCount: perfectCount ? parseInt(String(perfectCount)) : null,
        greatCount: greatCount ? parseInt(String(greatCount)) : null,
        missCount: missCount ? parseInt(String(missCount)) : null,
        recordingUrl: recordingUrl || null,
        screenshotUrl: screenshotUrl || null,
        notes: notes || null,
        isPublic: isPublic !== false,
      },
    })

    return NextResponse.json(newScore, { status: 201 })
  } catch (error) {
    console.error("Create score error:", error)
    return NextResponse.json({ error: "创建成绩失败" }, { status: 500 })
  }
}
