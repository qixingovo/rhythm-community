import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const game = searchParams.get("game") || "舞萌"

  try {
    const songs = await prisma.gameSong.findMany({
      where: { game },
      select: { id: true, title: true, level: true, constant: true, type: true, songId: true, artist: true },
      orderBy: { title: "asc" },
      take: 10000,
    })
    return NextResponse.json(songs)
  } catch (error) {
    console.error("Get songs error:", error)
    return NextResponse.json({ error: "获取曲目失败" }, { status: 500 })
  }
}
