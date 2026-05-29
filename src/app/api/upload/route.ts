import { NextRequest, NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import path from "path"

export async function POST(request: NextRequest) {
  const token = request.headers.get("cookie")?.match(/(?:^|;\s*)accessToken=([^;]+)/)?.[1]
  if (!token) return NextResponse.json({ error: "未登录" }, { status: 401 })

  try {
    const formData = await request.formData()
    const file = formData.get("file") as File | null
    if (!file) return NextResponse.json({ error: "未选择文件" }, { status: 400 })

    const ext = file.name.split(".").pop() || "png"
    const filename = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`
    const uploadDir = path.join(process.cwd(), "public", "uploads")
    await mkdir(uploadDir, { recursive: true })
    const buffer = Buffer.from(await file.arrayBuffer())
    await writeFile(path.join(uploadDir, filename), buffer)

    const url = `/uploads/${filename}`
    return NextResponse.json({ url })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: "上传失败" }, { status: 500 })
  }
}
