import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"
import { verifyAccessToken } from "@/lib/auth/jwt"

function getUserId(request: NextRequest): string | null {
  const token = request.cookies.get("accessToken")?.value
  if (!token) return null
  const payload = verifyAccessToken(token)
  return payload?.userId ?? null
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = getUserId(request)
  if (!userId) {
    return NextResponse.json({ error: "未登录" }, { status: 401 })
  }

  const { id } = await params

  try {
    const score = await prisma.score.findUnique({ where: { id } })
    if (!score || score.userId !== userId) {
      return NextResponse.json({ error: "成绩不存在" }, { status: 404 })
    }
    return NextResponse.json(score)
  } catch (error) {
    console.error("Get score error:", error)
    return NextResponse.json({ error: "获取成绩失败" }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = getUserId(request)
  if (!userId) {
    return NextResponse.json({ error: "未登录" }, { status: 401 })
  }

  const { id } = await params

  try {
    const existing = await prisma.score.findUnique({ where: { id } })
    if (!existing || existing.userId !== userId) {
      return NextResponse.json({ error: "成绩不存在" }, { status: 404 })
    }

    const body = await request.json()
    const { songTitle, game, chartType, chartLevel, score, grade, perfectCount, greatCount, missCount, recordingUrl, screenshotUrl, notes, isPublic } = body

    const updated = await prisma.score.update({
      where: { id },
      data: {
        songTitle,
        game,
        chartType,
        chartLevel,
        score: score ? parseInt(String(score)) : undefined,
        grade,
        perfectCount: perfectCount ? parseInt(String(perfectCount)) : undefined,
        greatCount: greatCount ? parseInt(String(greatCount)) : undefined,
        missCount: missCount ? parseInt(String(missCount)) : undefined,
        recordingUrl,
        screenshotUrl,
        notes,
        isPublic,
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("Update score error:", error)
    return NextResponse.json({ error: "更新成绩失败" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = getUserId(request)
  if (!userId) {
    return NextResponse.json({ error: "未登录" }, { status: 401 })
  }

  const { id } = await params

  try {
    const existing = await prisma.score.findUnique({ where: { id } })
    if (!existing || existing.userId !== userId) {
      return NextResponse.json({ error: "成绩不存在" }, { status: 404 })
    }

    await prisma.score.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete score error:", error)
    return NextResponse.json({ error: "删除成绩失败" }, { status: 500 })
  }
}
