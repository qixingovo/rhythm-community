"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, ImagePlus } from "lucide-react"

export default function NewPostPage() {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [tags, setTags] = useState("")
  const [game, setGame] = useState("")
  const [error, setError] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [images, setImages] = useState<string[]>([])

  const uploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const fd = new FormData()
    fd.append("file", file)
    try {
      const res = await fetch("/api/upload", { method: "POST", body: fd })
      if (res.ok) {
        const d = await res.json()
        setImages(prev => [...prev, d.url])
        setContent(prev => prev + `\n![](${d.url})`)
      }
    } catch {}
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !content.trim()) {
      setError("标题和内容不能为空")
      return
    }
    setSubmitting(true)
    setError("")
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          category: "rhythm",
          tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
          game: game || null,
        }),
      })
      if (res.ok) {
        router.push("/community-rhythm")
      } else {
        const d = await res.json()
        setError(d.error || "发布失败")
      }
    } catch {
      setError("网络错误")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/community-rhythm" className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-xl font-bold text-foreground">发布帖子</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="bg-red-50 text-red-600 text-sm rounded-lg p-3">{error}</div>}

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">标题</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="起个吸引人的标题..."
            className="w-full bg-muted border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/30"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">内容</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="分享你的音游心得、成绩、问题..."
            rows={8}
            className="w-full bg-muted border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">关联游戏（可选）</label>
            <select
              value={game}
              onChange={(e) => setGame(e.target.value)}
              className="w-full bg-muted border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="">不关联</option>
              <option value="Arcaea">Arcaea</option>
              <option value="Phigros">Phigros</option>
              <option value="舞萌">舞萌</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">标签（逗号分隔）</label>
            <input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="如: 攻略,心得,求助"
              className="w-full bg-muted border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <label className="cursor-pointer flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground px-3 py-2 border border-border rounded-lg">
            <ImagePlus className="w-4 h-4" />
            插入图片
            <input type="file" accept="image/*" onChange={uploadImage} className="hidden" />
          </label>
          {images.length > 0 && <span className="text-xs text-muted-foreground">{images.length} 张</span>}
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-medium hover:opacity-90 disabled:opacity-50"
        >
          {submitting ? "发布中..." : "发布帖子"}
        </button>
      </form>
    </div>
  )
}
