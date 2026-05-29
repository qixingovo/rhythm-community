"use client"

import { useState, useEffect } from "react"
import { MainLayout } from "@/components/MainLayout"
import { Trophy, Medal } from "lucide-react"

interface LeaderboardEntry {
  rank: number
  userId: string
  username: string
  avatar: string | null
  songTitle: string
  game: string
  chartLevel: string
  score: number
  grade: string | null
}

export default function Leaderboard() {
  const [selectedGame, setSelectedGame] = useState("all")
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)

  const games = [
    { id: "all", name: "全部游戏" },
    { id: "Arcaea", name: "Arcaea" },
    { id: "Phigros", name: "Phigros" },
    { id: "舞萌", name: "舞萌" },
  ]

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const params = new URLSearchParams({ limit: "20" })
        if (selectedGame !== "all") params.set("game", selectedGame)

        const res = await fetch(`/api/leaderboard?${params}`)
        if (res.ok) {
          const data = await res.json()
          setEntries(data.entries)
        }
      } catch (e) {
        console.error("Failed to load leaderboard:", e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [selectedGame])

  const getRankStyle = (rank: number) => {
    if (rank === 1)
      return "bg-gradient-to-r from-yellow-100 to-yellow-50 border-yellow-300"
    if (rank === 2)
      return "bg-gradient-to-r from-gray-100 to-gray-50 border-gray-300"
    if (rank === 3)
      return "bg-gradient-to-r from-orange-100 to-orange-50 border-orange-300"
    return "bg-card border-border"
  }

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Trophy className="w-6 h-6 text-yellow-500" />
              排行榜
            </h1>
            <p className="text-muted-foreground mt-1">看看谁才是真正的音游大神</p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {games.map((g) => (
            <button
              key={g.id}
              onClick={() => setSelectedGame(g.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedGame === g.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-accent"
              }`}
            >
              {g.name}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="p-12 text-center text-muted-foreground">加载中...</div>
        ) : entries.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">暂无排名数据</div>
        ) : (
          <div className="space-y-3">
            {entries.map((entry) => (
              <div
                key={`${entry.userId}-${entry.rank}`}
                className={`rounded-xl p-4 border shadow-sm flex items-center gap-4 ${getRankStyle(entry.rank)}`}
              >
                <div className="w-10 h-10 flex items-center justify-center font-bold text-lg">
                  {entry.rank <= 3 ? (
                    <Medal
                      className={`w-7 h-7 ${
                        entry.rank === 1
                          ? "text-yellow-500"
                          : entry.rank === 2
                            ? "text-gray-400"
                            : "text-orange-500"
                      }`}
                    />
                  ) : (
                    <span className="text-muted-foreground">#{entry.rank}</span>
                  )}
                </div>

                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold shrink-0">
                  {entry.username[0]}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground">{entry.username}</span>
                    <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded">
                      {entry.game}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {entry.songTitle} · {entry.chartLevel}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-xl font-bold text-foreground">
                    {entry.score.toLocaleString()}
                  </p>
                  {entry.grade && (
                    <span className="text-sm font-semibold text-primary">{entry.grade}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  )
}
