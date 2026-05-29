import { NextRequest, NextResponse } from "next/server"
import * as maimai from "@/lib/games/maimai"

/**
 * GET /api/maimai?endpoint=bests&friendCode=1234567890
 * 查询落雪咖啡屋 maimai DX 查分器的数据
 * API Key 仅存在于服务端，不暴露给前端
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const endpoint = searchParams.get("endpoint")
  const friendCode = searchParams.get("friendCode")

  if (!friendCode) {
    return NextResponse.json({ error: "缺少 friendCode 参数" }, { status: 400 })
  }

  try {
    let data: unknown

    switch (endpoint) {
      case "player":
        data = await maimai.getPlayer(friendCode)
        break
      case "bests":
        data = await maimai.getBests(friendCode)
        break
      case "recents":
        data = await maimai.getRecents(friendCode)
        break
      case "trend":
        data = await maimai.getTrend(friendCode)
        break
      default:
        return NextResponse.json({ error: `未知 endpoint: ${endpoint}` }, { status: 400 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("maimai API proxy error:", error)
    return NextResponse.json(
      { error: `查询失败: ${(error as Error).message}` },
      { status: 500 }
    )
  }
}
