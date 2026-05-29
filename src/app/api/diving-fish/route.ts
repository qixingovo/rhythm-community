import { NextRequest, NextResponse } from "next/server"
import * as df from "@/lib/games/diving-fish"

/**
 * GET /api/diving-fish?songs=true - 获取全部曲目数据（含定数）
 * GET /api/diving-fish?cover=204 - 获取封面图 URL
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const coverId = searchParams.get("cover")
  const wantSongs = searchParams.get("songs")

  try {
    if (coverId) {
      return NextResponse.json({ url: df.getCoverUrl(coverId) })
    }

    if (wantSongs) {
      const songs = await df.getAllSongs()
      return NextResponse.json(songs)
    }

    return NextResponse.json({ error: "缺少参数: cover=id 或 songs=true" }, { status: 400 })
  } catch (error) {
    console.error("diving-fish proxy error:", error)
    return NextResponse.json({ error: "获取数据失败" }, { status: 500 })
  }
}
