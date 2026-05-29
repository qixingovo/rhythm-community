"use client"

import { useState, useEffect, useCallback } from "react"
import { Plus, Search, Edit2, Trash2, Filter } from "lucide-react"

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

export default function ProfileScoresPage() {
  const [activeGame, setActiveGame] = useState("all")
  const [scores, setScores] = useState<Score[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)

  const games = [
    { id: "all", name: "全部游戏" },
    { id: "Arcaea", name: "Arcaea" },
    { id: "Phigros", name: "Phigros" },
    { id: "舞萌", name: "舞萌" },
  ]

  const fetchScores = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ limit: "50" })
      if (activeGame !== "all") params.set("game", activeGame)

      const res = await fetch(`/api/scores?${params}`)
      if (res.ok) {
        const data = await res.json()
        setScores(data.scores)
        setTotal(data.total)
      }
    } catch (error) {
      console.error("Failed to fetch scores:", error)
    } finally {
      setLoading(false)
    }
  }, [activeGame])

  useEffect(() => {
    fetchScores()
  }, [fetchScores])

  const handleDelete = async (id: string) => {
    if (!confirm("确定要删除这条成绩吗？")) return
    try {
      const res = await fetch(`/api/scores/${id}`, { method: "DELETE" })
      if (res.ok) {
        setScores((prev) => prev.filter((s) => s.id !== id))
      }
    } catch (error) {
      console.error("Delete failed:", error)
    }
  }

  const getRankColor = (rank: string | null) => {
    if (!rank) return "text-muted-foreground"
    if (rank.includes("PM") || rank.includes("SSS")) return "text-yellow-500 font-bold"
    if (rank.includes("EX")) return "text-purple-500 font-bold"
    if (rank.includes("AA") || rank.includes("S")) return "text-blue-500 font-bold"
    if (rank.includes("A")) return "text-green-500 font-bold"
    return "text-muted-foreground"
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("zh-CN")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">成绩管理</h1>
          <p className="text-muted-foreground mt-1">
            共 {total} 条成绩记录
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="bg-primary text-white rounded-xl px-5 py-2.5 font-medium flex items-center gap-2 hover:bg-primary/90 transition-all">
            <Plus className="w-5 h-5" />
            新增成绩
          </button>
        </div>
      </div>

      <div className="bg-card rounded-2xl p-4 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="搜索曲目..."
              className="w-full bg-muted border border-border rounded-xl px-12 py-2.5 text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
            />
          </div>
          <div className="flex items-center gap-2">
            <select
              value={activeGame}
              onChange={(e) => setActiveGame(e.target.value)}
              className="bg-muted border border-border rounded-xl px-4 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
            >
              {games.map((game) => (
                <option key={game.id} value={game.id}>
                  {game.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 text-center text-muted-foreground">加载中...</div>
          ) : scores.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              暂无成绩记录，点击"新增成绩"开始记录吧
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-foreground">曲目</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-foreground">游戏</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-foreground">难度</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-foreground">分数</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-foreground">评级</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-foreground">日期</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-foreground">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {scores.map((score) => (
                  <tr key={score.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-medium text-foreground">{score.songTitle}</span>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{score.game}</td>
                    <td className="px-6 py-4">
                      <span className="bg-primary/10 text-primary text-sm font-medium px-2.5 py-1 rounded-lg">
                        {score.chartType || ""} {score.chartLevel}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-foreground">
                      {score.score.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-lg ${getRankColor(score.grade)}`}>
                        {score.grade || "-"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground text-sm">
                      {formatDate(score.createdAt)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-all">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(score.id)}
                          className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
