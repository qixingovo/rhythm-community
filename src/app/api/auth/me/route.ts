import { NextRequest, NextResponse } from "next/server"
import { verifyAccessToken } from "@/lib/auth/jwt"
import { prisma } from "@/lib/db/prisma"

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("accessToken")?.value

    if (!token) {
      return NextResponse.json({ error: "未登录" }, { status: 401 })
    }

    const payload = verifyAccessToken(token)
    if (!payload) {
      return NextResponse.json({ error: "登录已过期" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    })

    if (!user) {
      return NextResponse.json({ error: "用户不存在" }, { status: 404 })
    }

    return NextResponse.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
        createdAt: user.createdAt,
      },
    })
  } catch (error) {
    console.error("Get user error:", error)
    return NextResponse.json({ error: "获取用户信息失败" }, { status: 500 })
  }
}
