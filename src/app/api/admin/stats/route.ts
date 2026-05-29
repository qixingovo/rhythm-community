import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"
import { verifyAccessToken } from "@/lib/auth/jwt"

export async function GET(request: NextRequest) {
  const token = request.headers.get("cookie")?.match(/(?:^|;\s*)accessToken=([^;]+)/)?.[1]
  if (!token) return NextResponse.json({ error: "未登录" }, { status: 401 })
  const payload = verifyAccessToken(token)
  if (!payload) return NextResponse.json({ error: "登录已过期" }, { status: 401 })

  try {
    const user = await prisma.user.findUnique({ where: { id: payload.userId }, include: { trustRole: true } })
    if (!user?.trustRole || user.trustRole.level < 3) return NextResponse.json({ error: "无权限" }, { status: 403 })

    const [userCount, postCount, scoreCount, todayUsers] = await Promise.all([
      prisma.user.count(),
      prisma.post.count(),
      prisma.score.count(),
      prisma.user.count({ where: { createdAt: { gte: new Date(Date.now() - 86400000) } } }),
    ])

    return NextResponse.json({ userCount, postCount, scoreCount, todayUsers })
  } catch (e) {
    return NextResponse.json({ error: "获取失败" }, { status: 500 })
  }
}
