import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const post = await prisma.post.findUnique({
      where: { id },
      include: { author: { select: { id: true, username: true, avatar: true } } },
    })
    if (!post) return NextResponse.json({ error: "帖子不存在" }, { status: 404 })
    return NextResponse.json(post)
  } catch (error) {
    console.error("Get post error:", error)
    return NextResponse.json({ error: "获取帖子失败" }, { status: 500 })
  }
}
