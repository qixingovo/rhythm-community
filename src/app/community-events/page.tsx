"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Calendar, Users, Trophy } from "lucide-react"

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

export default function CommunityEventsPage() {
  const [activeTab, setActiveTab] = useState("all")
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  const tabs = [
    { id: "all", name: "全部" },
    { id: "ongoing", name: "进行中" },
    { id: "upcoming", name: "即将开始" },
  ]

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const res = await fetch("/api/posts?category=event&limit=20")
        if (res.ok) {
          const data = await res.json()
          setPosts(data.posts)
        }
      } catch (e) {
        console.error("Failed to load events:", e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const formatDate = (d: string) => new Date(d).toLocaleDateString("zh-CN")

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">活动 / 比赛</h1>
        <p className="text-muted-foreground mt-1">参与社区活动，赢取奖励</p>
      </div>

      <div className="flex gap-1 bg-card rounded-xl p-1 border border-border">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === t.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
            }`}
          >
            {t.name}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="p-12 text-center text-muted-foreground">加载中...</div>
      ) : posts.length === 0 ? (
        <div className="p-12 text-center text-muted-foreground">暂无活动</div>
      ) : (
        <div className="space-y-4">
          {posts.map((p) => (
            <Link
              key={p.id}
              href={`/community/${p.id}`}
              className="block bg-card rounded-xl border border-border shadow-sm hover:shadow-md transition-all overflow-hidden"
            >
              <div className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="w-4 h-4 text-primary" />
                  <span className="text-sm text-muted-foreground">{formatDate(p.createdAt)}</span>
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">{p.title}</h3>
                <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{p.content}</p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1"><Users className="w-4 h-4" /> {p._count.comments} 讨论</span>
                  {p.tags.length > 0 && (
                    <div className="flex gap-1">
                      {p.tags.map((t) => (
                        <span key={t} className="text-xs bg-muted px-2 py-0.5 rounded">#{t}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
