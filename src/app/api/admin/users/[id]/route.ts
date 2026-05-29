import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"
import { verifyAccessToken } from "@/lib/auth/jwt"

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = request.headers.get("cookie")?.match(/(?:^|;\s*)accessToken=([^;]+)/)?.[1]
  if (!token) return NextResponse.json({ error: "未登录" }, { status: 401 })
  const payload = verifyAccessToken(token)
  if (!payload) return NextResponse.json({ error: "登录已过期" }, { status: 401 })

  const admin = await prisma.user.findUnique({ where: { id: payload.userId }, include: { trustRole: true } })
  if (!admin?.trustRole || admin.trustRole.level < 3) return NextResponse.json({ error: "无权限" }, { status: 403 })

  const { id } = await params
  const { level } = await request.json()

  await prisma.trustRole.upsert({
    where: { userId: id },
    create: { userId: id, level: level || 0 },
    update: { level: level || 0 },
  })

  return NextResponse.json({ success: true })
}
