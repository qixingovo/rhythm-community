import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"
import { verifyAccessToken } from "@/lib/auth/jwt"

export async function PUT(request: NextRequest) {
  const token = request.headers.get("cookie")?.match(/(?:^|;\s*)accessToken=([^;]+)/)?.[1]
  if (!token) return NextResponse.json({ error: "未登录" }, { status: 401 })
  const payload = verifyAccessToken(token)
  if (!payload) return NextResponse.json({ error: "登录已过期" }, { status: 401 })

  try {
    const { bio, avatar } = await request.json()
    const data: Record<string, string> = {}
    if (bio !== undefined) data.bio = bio
    if (avatar !== undefined) data.avatar = avatar

    const user = await prisma.user.update({
      where: { id: payload.userId },
      data,
    })

    return NextResponse.json({ success: true, user: { id: user.id, username: user.username, bio: user.bio, avatar: user.avatar } })
  } catch (error) {
    console.error("Update profile error:", error)
    return NextResponse.json({ error: "更新失败" }, { status: 500 })
  }
}
