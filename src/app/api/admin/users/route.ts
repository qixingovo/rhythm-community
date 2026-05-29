import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"
import { verifyAccessToken } from "@/lib/auth/jwt"

async function checkAdmin(request: NextRequest) {
  const token = request.headers.get("cookie")?.match(/(?:^|;\s*)accessToken=([^;]+)/)?.[1]
  if (!token) return null
  const payload = verifyAccessToken(token)
  if (!payload) return null
  const user = await prisma.user.findUnique({ where: { id: payload.userId }, include: { trustRole: true } })
  return user?.trustRole?.level >= 3 ? user : null
}

export async function GET(request: NextRequest) {
  const admin = await checkAdmin(request)
  if (!admin) return NextResponse.json({ error: "无权限" }, { status: 403 })

  const { searchParams } = new URL(request.url)
  const q = searchParams.get("q") || ""
  const users = await prisma.user.findMany({
    where: q ? { OR: [{ username: { contains: q } }, { email: { contains: q } }] } : {},
    select: { id: true, username: true, email: true, bio: true, createdAt: true, trustRole: { select: { level: true } } },
    orderBy: { createdAt: "desc" },
    take: 50,
  })
  return NextResponse.json({ users })
}
