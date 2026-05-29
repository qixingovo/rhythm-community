import { cookies } from "next/headers"
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"
import { verifyAccessToken } from "@/lib/auth/jwt"

async function getUserId(): Promise<string | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get("accessToken")?.value
  if (!token) return null
  const payload = verifyAccessToken(token)
  return payload?.userId ?? null
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get("category") || undefined
  const game = searchParams.get("game") || undefined
  const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100)
  const offset = parseInt(searchParams.get("offset") || "0")

  try {
    const where: Record<string, unknown> = {}
    if (category) where.category = category
    if (game) where.game = game

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
        include: {
          author: { select: { id: true, username: true, avatar: true } },
          _count: { select: { comments: true } },
        },
      }),
      prisma.post.count({ where }),
    ])

    return NextResponse.json({ posts, total })
  } catch (error) {
    console.error("Get posts error:", error)
    return NextResponse.json({ error: "获取帖子失败" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const userId = await getUserId()
  if (!userId) {
    return NextResponse.json({ error: "未登录" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { title, content, category, tags, game } = body

    if (!title || !content) {
      return NextResponse.json({ error: "请填写标题和内容" }, { status: 400 })
    }

    const post = await prisma.post.create({
      data: {
        userId,
        title,
        content,
        category: category || "rhythm",
        tags: tags || [],
        game: game || null,
      },
      include: {
        author: { select: { id: true, username: true, avatar: true } },
      },
    })

    return NextResponse.json(post, { status: 201 })
  } catch (error) {
    console.error("Create post error:", error)
    return NextResponse.json({ error: "发帖失败" }, { status: 500 })
  }
}
