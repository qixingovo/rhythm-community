import { cookies } from "next/headers"
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"
import { verifyPassword } from "@/lib/auth/password"
import { signAccessToken, signRefreshToken } from "@/lib/auth/jwt"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()
    if (!email || !password) return NextResponse.json({ error: "请填写邮箱和密码" }, { status: 400 })

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) return NextResponse.json({ error: "邮箱或密码错误" }, { status: 401 })

    const valid = await verifyPassword(password, user.password)
    if (!valid) return NextResponse.json({ error: "邮箱或密码错误" }, { status: 401 })

    const accessToken = signAccessToken({ userId: user.id, username: user.username })
    const refreshToken = signRefreshToken({ userId: user.id, username: user.username })

    const cookieStore = await cookies()
    cookieStore.set("accessToken", accessToken, { httpOnly: true, secure: false, sameSite: "lax", maxAge: 86400, path: "/" })
    cookieStore.set("refreshToken", refreshToken, { httpOnly: true, secure: false, sameSite: "lax", maxAge: 604800, path: "/" })

    return NextResponse.json({ success: true, user: { id: user.id, username: user.username, email: user.email, avatar: user.avatar, bio: user.bio, createdAt: user.createdAt } })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "登录失败" }, { status: 500 })
  }
}
