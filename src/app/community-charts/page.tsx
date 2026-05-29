"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Search, FileText, Trophy, Users, Video } from "lucide-react"

interface Post {
  id: string
  title: string
  content: string
  tags: string[]
  game: string | null
  category: string
  createdAt: string
  author: { id: string; username: string; avatar: string | null }
  _count: { comments: number }
}

export default function CommunityChartsPage() {
  const [activeGame, setActiveGame] = useState("all")
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  const games = [
    { id: "all", name: "全部" },
    { id: "Arcaea", name: "Arcaea" },
    { id: "Phigros", name: "Phigros" },
    { id: "舞萌", name: "舞萌" },
  ]

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const params = new URLSearchParams({ category: "chart_discuss", limit: "20" })
        if (activeGame !== "all") params.set("game", activeGame)
        const res = await fetch(`/api/posts?${params}`)
        if (res.ok) {
          const data = await res.json()
          setPosts(data.posts)
        }
      } catch (e) {
        console.error("Failed to load charts:", e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [activeGame])

  const formatDate = (d: string) => {
    const date = new Date(d)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 60) return `${mins}分钟前`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours}小时前`
    return date.toLocaleDateString("zh-CN")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">谱面讨论</h1>
        <p className="text-muted-foreground mt-1">攻略、手元、谱面分析</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {games.map((g) => (
          <button
            key={g.id}
            onClick={() => setActiveGame(g.id)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeGame === g.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-accent"
            }`}
          >
            {g.name}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="p-12 text-center text-muted-foreground">加载中...</div>
      ) : posts.length === 0 ? (
        <div className="p-12 text-center text-muted-foreground">暂无谱面讨论</div>
      ) : (
        <div className="space-y-4">
          {posts.map((p) => (
            <Link
              key={p.id}
              href={`/community/${p.id}`}
              className="block bg-card rounded-2xl p-6 shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold shrink-0">
                  {p.author.username[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    {p.game && (
                      <span className="bg-primary/10 text-primary text-xs font-medium px-2 py-0.5 rounded">
                        {p.game}
                      </span>
                    )}
                    {p.tags.slice(0, 2).map((t) => (
                      <span key={t} className="bg-muted text-muted-foreground text-xs px-2 py-0.5 rounded">
                        #{t}
                      </span>
                    ))}
                    <span className="text-muted-foreground text-sm">{p.author.username}</span>
                    <span className="text-muted-foreground/60 text-sm ml-auto">{formatDate(p.createdAt)}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{p.title}</h3>
                  <p className="text-muted-foreground text-sm line-clamp-2">{p.content}</p>
                  <div className="flex items-center gap-4 mt-3 text-muted-foreground text-sm">
                    <span className="flex items-center gap-1"><Users className="w-4 h-4" /> {p._count.comments} 回复</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
