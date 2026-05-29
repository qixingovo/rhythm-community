import { NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"
import { signAccessToken } from "@/lib/auth/jwt"

export async function GET() {
  try {
    let guest = await prisma.user.findUnique({ where: { email: "guest@rhythm.dev" } })
    if (!guest) {
      guest = await prisma.user.create({
        data: { username: "guest_" + Date.now().toString(36), email: "guest@rhythm.dev", password: "" },
      })
    }

    const token = signAccessToken({ userId: guest.id, username: guest.username })
    const res = NextResponse.json({ success: true, user: { id: guest.id, username: guest.username } })
    res.cookies.set("accessToken", token, { path: "/", maxAge: 86400, httpOnly: true, sameSite: "lax" })
    return res
  } catch (e) {
    console.error("Guest login error:", String(e))
    return NextResponse.json({ error: "游客登录失败" }, { status: 500 })
  }
}
