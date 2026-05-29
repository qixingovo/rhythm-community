import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"
import { verifyAccessToken } from "@/lib/auth/jwt"

async function checkAdmin(request: NextRequest) {
  const token = request.headers.get("cookie")?.match(/(?:^|;\s*)accessToken=([^;]+)/)?.[1]
  if (!token) return null
  const payload = verifyAccessToken(token)
  if (!payload) return null
  const admin = await prisma.user.findUnique({ where: { id: payload.userId }, include: { trustRole: true } })
  return (admin?.trustRole?.level ?? 0) >= 3
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!await checkAdmin(request)) return NextResponse.json({ error: "无权限" }, { status: 403 })
  const { id } = await params
  await prisma.post.delete({ where: { id } })
  return NextResponse.json({ success: true })
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!await checkAdmin(request)) return NextResponse.json({ error: "无权限" }, { status: 403 })
  const { id } = await params
  const { pinned } = await request.json()
  await prisma.post.update({ where: { id }, data: { pinned } })
  return NextResponse.json({ success: true })
}
