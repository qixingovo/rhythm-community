"use client"

import { useState, useEffect } from "react"
import { MainLayout } from "@/components/MainLayout"
import {
  Search, Zap, Trophy, TrendingUp, Music, Gamepad2, Disc, Calendar,
} from "lucide-react"

interface Post {
  id: string
  title: string
  content: string
  category: string
  tags: string[]
  game: string | null
  createdAt: string
  author: { id: string; username: string; avatar: string | null }
  _count: { comments: number }
}

interface Score {
  id: string
  songTitle: string
  game: string
  chartType: string | null
  chartLevel: string
  score: number
  grade: string | null
  createdAt: string
  user: { id: string; username: string; avatar: string | null }
}

export default function Home() {
  const [activeView, setActiveView] = useState<"all" | "friends" | "featured">("all")
  const [posts, setPosts] = useState<Post[]>([])
  const [recentScores, setRecentScores] = useState<Score[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const [postsRes, scoresRes] = await Promise.all([
          fetch("/api/posts?limit=10"),
          fetch("/api/scores?limit=5"),
        ])
        if (postsRes.ok) {
          const data = await postsRes.json()
          setPosts(data.posts)
        }
        if (scoresRes.ok) {
          const data = await scoresRes.json()
          setRecentScores(data.scores)
        }
      } catch (e) {
        console.error("Failed to load feed:", e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

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

  const getRankColor = (grade: string | null) => {
    if (!grade) return ""
    if (grade.includes("PM") || grade.includes("SSS")) return "bg-green-100 text-green-800"
    if (grade.includes("EX")) return "bg-purple-100 text-purple-800"
    if (grade.includes("AA")) return "bg-blue-100 text-blue-800"
    return "bg-gray-100 text-gray-700"
  }

  const getGameIcon = (game: string) => {
    if (game === "Arcaea") return "🎹"
    if (game === "Phigros") return "🎵"
    if (game === "舞萌") return "🌀"
    return "🎮"
  }

  const trimContent = (content: string, max = 120) =>
    content.length > max ? content.slice(0, max) + "..." : content

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="搜索歌曲、谱面、用户..."
            className="w-full bg-muted border-none rounded-lg pl-10 pr-4 py-3 text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        <div className="bg-gradient-to-r from-primary/20 via-accent to-secondary rounded-xl p-6 border border-primary/20">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-5 h-5 text-primary" />
                <span className="text-sm font-semibold text-primary">限时活动</span>
              </div>
              <h2 className="text-xl font-bold text-foreground mb-2">夏季挑战赛</h2>
              <p className="text-muted-foreground text-sm mb-4">
                参与挑战，赢取限定徽章！挑战时间：7月1日 - 7月31日
              </p>
              <button className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity">
                立即参加
              </button>
            </div>
            <Calendar className="w-16 h-16 text-primary/30" />
          </div>
        </div>

        <div className="flex gap-2 border-b border-border">
          {[
            { key: "all" as const, label: "全部" },
            { key: "friends" as const, label: "好友" },
            { key: "featured" as const, label: "精选" },
          ].map((view) => (
            <button
              key={view.key}
              onClick={() => setActiveView(view.key)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeView === view.key
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {view.label}
            </button>
          ))}
        </div>

        <div className="space-y-6">
          {loading ? (
            <div className="p-12 text-center text-muted-foreground">加载中...</div>
          ) : (
            <>
              {recentScores.length === 0 && posts.length === 0 && (
                <div className="p-12 text-center text-muted-foreground">
                  暂无动态。去社区发帖或录入成绩吧！
                </div>
              )}

              {recentScores.map((s) => (
                <div key={s.id} className="bg-card rounded-xl p-5 border border-border shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-lg shrink-0">
                      {getGameIcon(s.game)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <span className="font-semibold text-foreground">{s.user.username}</span>
                          <span className="text-muted-foreground text-sm ml-2">
                            {formatDate(s.createdAt)}
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground">{s.game}</span>
                      </div>
                      <div className="bg-muted rounded-lg p-4 mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <Disc className="w-5 h-5 text-primary" />
                            <div>
                              <p className="font-medium text-foreground">{s.songTitle}</p>
                              <p className="text-sm text-muted-foreground">
                                {s.chartType ? `${s.chartType} ` : ""}{s.chartLevel}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-primary">
                              {s.score.toLocaleString()}
                            </p>
                            {s.grade && (
                              <span
                                className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${getRankColor(s.grade)}`}
                              >
                                {s.grade}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {posts.map((p) => (
                <div key={p.id} className="bg-card rounded-xl p-5 border border-border shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-accent-foreground font-semibold shrink-0">
                      {p.author.username[0] || "?"}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <span className="font-semibold text-foreground">{p.author.username}</span>
                          {p.game && (
                            <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded ml-2">
                              {p.game}
                            </span>
                          )}
                          <span className="text-muted-foreground text-sm ml-2">
                            {formatDate(p.createdAt)}
                          </span>
                        </div>
                      </div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">{p.title}</h3>
                      <p className="text-muted-foreground text-sm mb-4">{trimContent(p.content)}</p>
                      {p.tags.length > 0 && (
                        <div className="flex gap-2 mb-4">
                          {p.tags.map((t) => (
                            <span
                              key={t}
                              className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded"
                            >
                              #{t}
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="flex items-center gap-6 text-sm text-muted-foreground">
                        <span>💬 {p._count.comments}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </MainLayout>
  )
}
