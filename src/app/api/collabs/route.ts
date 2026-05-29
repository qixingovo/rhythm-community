import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"

export async function GET() {
  try {
    const projects = await prisma.collabProject.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
    })
    return NextResponse.json({ projects })
  } catch (error) {
    console.error("Get collabs error:", error)
    return NextResponse.json({ error: "获取联动项目失败" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const token = request.cookies.get("accessToken")?.value
  if (!token) return NextResponse.json({ error: "未登录" }, { status: 401 })

  try {
    const { title, type, desc } = await request.json()
    if (!title || !type) {
      return NextResponse.json({ error: "请填写项目名称和类型" }, { status: 400 })
    }

    const project = await prisma.collabProject.create({
      data: { title, type, desc: desc || "" },
    })

    return NextResponse.json(project, { status: 201 })
  } catch (error) {
    console.error("Create collab error:", error)
    return NextResponse.json({ error: "创建项目失败" }, { status: 500 })
  }
}
