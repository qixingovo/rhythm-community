import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/db/prisma"
import { hashPassword } from "@/lib/auth/password"
import { signAccessToken, signRefreshToken } from "@/lib/auth/jwt"

const registerSchema = z.object({
  username: z.string().min(3).max(20),
  email: z.string().email(),
  password: z.string().min(8),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = registerSchema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 })

    const { username, email, password } = parsed.data

    if (await prisma.user.findUnique({ where: { email } })) return NextResponse.json({ error: "该邮箱已被注册" }, { status: 400 })
    if (await prisma.user.findUnique({ where: { username } })) return NextResponse.json({ error: "该用户名已被使用" }, { status: 400 })

    const user = await prisma.user.create({ data: { username, email, password: await hashPassword(password) } })
    const accessToken = signAccessToken({ userId: user.id, username: user.username })
    const refreshToken = signRefreshToken({ userId: user.id, username: user.username })

    const res = NextResponse.json({ success: true, user: { id: user.id, username: user.username, email: user.email, avatar: user.avatar, bio: user.bio, createdAt: user.createdAt } })
    res.cookies.set("accessToken", accessToken, { path: "/", maxAge: 86400, httpOnly: true, sameSite: "lax" })
    res.cookies.set("refreshToken", refreshToken, { path: "/", maxAge: 604800, httpOnly: true, sameSite: "lax" })
    return res
  } catch (error) {
    console.error("Register error:", error)
    return NextResponse.json({ error: "注册失败" }, { status: 500 })
  }
}
