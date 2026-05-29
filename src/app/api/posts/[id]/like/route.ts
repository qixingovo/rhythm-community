import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"
import { verifyAccessToken } from "@/lib/auth/jwt"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const token = request.headers.get("cookie")?.match(/(?:^|;\s*)accessToken=([^;]+)/)?.[1]
  if (!token) return NextResponse.json({ error: "未登录" }, { status: 401 })
  const payload = verifyAccessToken(token)
  if (!payload) return NextResponse.json({ error: "登录已过期" }, { status: 401 })

  try {
    const existing = await prisma.like.findUnique({
      where: { postId_userId: { postId: id, userId: payload.userId } },
    })

    if (existing) {
      await prisma.like.delete({ where: { id: existing.id } })
    } else {
      await prisma.like.create({ data: { postId: id, userId: payload.userId } })
    }

    const count = await prisma.like.count({ where: { postId: id } })
    return NextResponse.json({ liked: !existing, count })
  } catch (error) {
    console.error("Like error:", error)
    return NextResponse.json({ error: "操作失败" }, { status: 500 })
  }
}
