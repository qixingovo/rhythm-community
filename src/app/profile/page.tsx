"use client"

import { useState, useEffect } from "react"
import { MainLayout } from "@/components/MainLayout"
import { ScoreWall } from "@/components/profile/ScoreWall"
import { B50Chart } from "@/components/profile/B50Chart"
import { Trophy, Edit, X } from "lucide-react"
import Link from "next/link"

interface UserData {
  id: string
  username: string
  email: string
  avatar: string | null
  bio: string | null
  createdAt: string
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
}

export default function Profile() {
  const [user, setUser] = useState<UserData | null>(null)
  const [scores, setScores] = useState<Score[]>([])
  const [scoreTotal, setScoreTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [editBio, setEditBio] = useState("")
  const [activeTab, setActiveTab] = useState<"scores" | "posts">("scores")

  useEffect(() => {
    async function load() {
      try {
        const [userRes, scoresRes] = await Promise.all([
          fetch("/api/auth/me"),
          fetch("/api/scores?limit=50"),
        ])
        if (userRes.ok) {
          const d = await userRes.json()
          setUser(d.user)
        }
        if (scoresRes.ok) {
          const d = await scoresRes.json()
          setScores(d.scores)
          setScoreTotal(d.total)
        }
      } catch (e) {
        console.error("Failed to load profile:", e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) {
    return (
      <MainLayout>
        <div className="max-w-4xl mx-auto p-12 text-center text-muted-foreground">加载中...</div>
      </MainLayout>
    )
  }

  if (!user) {
    return (
      <MainLayout>
        <div className="max-w-4xl mx-auto p-12 text-center text-muted-foreground">请先登录</div>
      </MainLayout>
    )
  }

  const bestScore = scores.length > 0 ? Math.max(...scores.map((s) => s.score)) : 0
  const joinDate = new Date(user.createdAt).toLocaleDateString("zh-CN")

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
          <div className="h-32 bg-gradient-to-r from-primary/20 to-accent" />
          <div className="px-6 pb-6">
            <div className="flex items-end justify-between -mt-12 mb-4">
              <div className="flex items-end gap-4">
                <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center text-primary text-3xl font-bold border-4 border-background shadow-sm">
                  {user.username[0]}
                </div>
                <div className="mb-2">
                  <h1 className="text-2xl font-bold text-foreground">{user.username}</h1>
                  <p className="text-muted-foreground text-sm">
                    {user.bio || "音游爱好者"} · {joinDate} 加入
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => { setEditing(true); setEditBio(user.bio || "") }}
                  className="flex items-center gap-1 px-3 py-2 rounded-lg border border-border text-sm hover:bg-muted transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  编辑资料
                </button>
                <Link
                  href="/profile-scores"
                  className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium text-sm hover:opacity-90 transition-opacity"
                >
                  管理成绩
                </Link>
              </div>
            </div>

            <div className="flex gap-8">
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground">{bestScore.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">最高分</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground">{scoreTotal}</p>
                <p className="text-xs text-muted-foreground">成绩数</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-2 border-b border-border">
          <button
            onClick={() => setActiveTab("scores")}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "scores" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Trophy className="w-4 h-4" />
            成绩
          </button>
        </div>

        {activeTab === "scores" && (
          <div className="space-y-3">
            {scores.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">暂无成绩</div>
            ) : (
              <>
                <ScoreWall scores={scores} />
                <div className="mt-6">
                  <h3 className="text-sm font-semibold text-foreground mb-3">b50 图表</h3>
                  <div className="bg-card rounded-xl border border-border p-4">
                    <B50Chart scores={scores} />
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setEditing(false)}>
          <div className="bg-card rounded-2xl p-6 w-full max-w-md border border-border shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">编辑资料</h2>
              <button onClick={() => setEditing(false)}><X className="w-5 h-5 text-muted-foreground" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">个人简介</label>
                <textarea value={editBio} onChange={e => setEditBio(e.target.value)} rows={3} className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="介绍一下自己..." />
              </div>
              <button
                onClick={async () => {
                  const res = await fetch("/api/users/me", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ bio: editBio }) })
                  if (res.ok) { window.location.reload() }
                }}
                className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-medium hover:opacity-90"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  )
}
