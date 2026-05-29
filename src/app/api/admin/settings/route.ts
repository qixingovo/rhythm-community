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

export async function GET(request: NextRequest) {
  if (!await checkAdmin(request)) return NextResponse.json({ error: "无权限" }, { status: 403 })
  const configs = await prisma.siteConfig.findMany()
  const map: Record<string, string> = {}
  configs.forEach(c => { map[c.key] = c.value })
  return NextResponse.json(map)
}

export async function PUT(request: NextRequest) {
  if (!await checkAdmin(request)) return NextResponse.json({ error: "无权限" }, { status: 403 })
  const data = await request.json()
  for (const [key, value] of Object.entries(data)) {
    await prisma.siteConfig.upsert({ where: { key }, create: { key, value: String(value) }, update: { value: String(value) } })
  }
  return NextResponse.json({ success: true })
}
