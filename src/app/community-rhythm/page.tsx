"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Gamepad2, Music, Trophy, Users, Plus, Search } from "lucide-react"

interface Post {
  id: string
  title: string
  content: string
  tags: string[]
  game: string | null
  createdAt: string
  author: { id: string; username: string; avatar: string | null }
  _count: { comments: number }
}

export default function CommunityRhythmPage() {
  const [activeGame, setActiveGame] = useState("all")
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  const games = [
    { id: "all", name: "全部", icon: Gamepad2 },
    { id: "Arcaea", name: "Arcaea", icon: Music },
    { id: "Phigros", name: "Phigros", icon: Trophy },
    { id: "舞萌", name: "舞萌", icon: Users },
  ]

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const params = new URLSearchParams({ category: "rhythm", limit: "20" })
        if (activeGame !== "all") params.set("game", activeGame)

        const res = await fetch(`/api/posts?${params}`)
        if (res.ok) {
          const data = await res.json()
          setPosts(data.posts)
        }
      } catch (e) {
        console.error("Failed to load posts:", e)
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
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">音游区</h1>
          <p className="text-muted-foreground mt-1">分享心得，讨论谱面，一起进步</p>
        </div>
        <Link
          href="/community-rhythm/new"
          className="bg-primary text-primary-foreground rounded-xl px-5 py-2.5 font-medium flex items-center gap-2 hover:opacity-90 transition-opacity"
        >
          <Plus className="w-5 h-5" />
          发帖
        </Link>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {games.map((g) => (
          <button
            key={g.id}
            onClick={() => setActiveGame(g.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeGame === g.id
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-accent"
            }`}
          >
            <g.icon className="w-4 h-4" />
            {g.name}
          </button>
        ))}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="搜索帖子..."
          className="w-full bg-muted border border-border rounded-lg pl-10 pr-4 py-2.5 text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      {loading ? (
        <div className="p-12 text-center text-muted-foreground">加载中...</div>
      ) : posts.length === 0 ? (
        <div className="p-12 text-center text-muted-foreground">暂无讨论帖，来发第一帖吧</div>
      ) : (
        <div className="space-y-4">
          {posts.map((p) => (
            <Link
              key={p.id}
              href={`/community/${p.id}`}
              className="block bg-card rounded-xl p-5 border border-border shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold shrink-0">
                  {p.author.username[0] || "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-medium text-foreground">{p.author.username}</span>
                    {p.game && (
                      <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded">
                        {p.game}
                      </span>
                    )}
                    {p.tags.slice(0, 3).map((t) => (
                      <span key={t} className="text-xs text-muted-foreground">#{t}</span>
                    ))}
                    <span className="text-xs text-muted-foreground ml-auto">
                      {formatDate(p.createdAt)}
                    </span>
                  </div>
                  <h3 className="font-semibold text-foreground mb-1">{p.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">{p.content}</p>
                  <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                    <span>💬 {p._count.comments} 回复</span>
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
