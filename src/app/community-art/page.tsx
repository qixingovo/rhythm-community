"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Heart, MessageSquare } from "lucide-react"

interface CollabProject {
  id: string
  title: string
  type: string
  desc: string
  status: string
  createdAt: string
}

export default function CommunityArtPage() {
  const [projects, setProjects] = useState<CollabProject[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("all")

  const types = [
    { id: "all", name: "全部" },
    { id: "chart", name: "写谱" },
    { id: "music", name: "作曲" },
    { id: "art", name: "曲绘" },
    { id: "mixed", name: "混合" },
  ]

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const res = await fetch("/api/collabs")
        if (res.ok) {
          const data = await res.json()
          setProjects(data.projects || [])
        }
      } catch (e) {
        console.error("Failed to load collabs:", e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const filtered = filter === "all" ? projects : projects.filter((p) => p.type === filter)

  const typeLabels: Record<string, string> = { chart: "写谱", music: "作曲", art: "曲绘", mixed: "混合" }
  const statusLabels: Record<string, string> = { recruiting: "招募中", in_progress: "进行中", done: "已完成" }
  const statusColors: Record<string, string> = {
    recruiting: "bg-green-100 text-green-700",
    in_progress: "bg-blue-100 text-blue-700",
    done: "bg-gray-100 text-gray-600",
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">联动创作</h1>
        <p className="text-muted-foreground mt-1">谱面 + 原创曲 + 曲绘企划招募</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {types.map((t) => (
          <button
            key={t.id}
            onClick={() => setFilter(t.id)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              filter === t.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-accent"
            }`}
          >
            {t.name}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="p-12 text-center text-muted-foreground">加载中...</div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center text-muted-foreground">暂无联动项目</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((p) => (
            <div key={p.id} className="bg-card rounded-xl p-5 border border-border shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-3">
                <span className="bg-primary/10 text-primary text-xs font-medium px-2 py-0.5 rounded">
                  {typeLabels[p.type] || p.type}
                </span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded ${statusColors[p.status] || "bg-gray-100 text-gray-600"}`}>
                  {statusLabels[p.status] || p.status}
                </span>
              </div>
              <h3 className="font-semibold text-foreground mb-2">{p.title}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{p.desc}</p>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span>{new Date(p.createdAt).toLocaleDateString("zh-CN")}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
