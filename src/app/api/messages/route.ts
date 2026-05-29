import { cookies } from "next/headers"
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"
import { verifyAccessToken } from "@/lib/auth/jwt"

export async function GET(request: NextRequest) {
  const cookieStore = await cookies()
  const token = cookieStore.get("accessToken")?.value
  if (!token) return NextResponse.json({ error: "未登录" }, { status: 401 })
  const payload = verifyAccessToken(token)
  if (!payload) return NextResponse.json({ error: "登录已过期" }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const otherUserId = searchParams.get("userId")
  const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 200)

  try {
    if (otherUserId) {
      const messages = await prisma.message.findMany({
        where: {
          OR: [
            { senderId: payload.userId, receiverId: otherUserId },
            { senderId: otherUserId, receiverId: payload.userId },
          ],
        },
        orderBy: { createdAt: "asc" },
        take: limit,
      })
      return NextResponse.json({ messages })
    }

    const conversations = await prisma.message.groupBy({
      by: ["senderId", "receiverId"],
      where: {
        OR: [{ senderId: payload.userId }, { receiverId: payload.userId }],
      },
    })

    return NextResponse.json({ conversations })
  } catch (error) {
    console.error("Get messages error:", error)
    return NextResponse.json({ error: "获取消息失败" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const cookieStore = await cookies()
  const token = cookieStore.get("accessToken")?.value
  if (!token) return NextResponse.json({ error: "未登录" }, { status: 401 })
  const payload = verifyAccessToken(token)
  if (!payload) return NextResponse.json({ error: "登录已过期" }, { status: 401 })

  try {
    const { receiverId, content } = await request.json()

    if (!receiverId || !content) {
      return NextResponse.json({ error: "请填写接收人和内容" }, { status: 400 })
    }

    const message = await prisma.message.create({
      data: {
        senderId: payload.userId,
        receiverId,
        content,
      },
    })

    return NextResponse.json(message, { status: 201 })
  } catch (error) {
    console.error("Send message error:", error)
    return NextResponse.json({ error: "发送失败" }, { status: 500 })
  }
}
