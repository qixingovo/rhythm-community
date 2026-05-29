"use client"

import { useState, useEffect } from "react"
import { calcDxRating, getChartConstant } from "@/lib/games/maimai-rating"

interface Score {
  id: string; songTitle: string; chartType: string | null
  chartLevel: string; score: number; grade: string | null; createdAt: string
  agentAnalysis?: { ds?: number; ra?: number; songId?: number } | null
}

interface SongEntry { id: string; title: string; level: string; constant: number; type: string | null; songId: string | null; artist: string }

function getRatingStyle(rate: string | null) {
  if (!rate) return { bg: "bg-gray-100", bar: "bg-gray-400", text: "text-gray-600" }
  const r = rate.toUpperCase()
  if (r.includes("SSS+") || r.includes("SSSP")) return { bg: "bg-yellow-100", bar: "bg-gradient-to-r from-yellow-400 via-pink-400 to-cyan-400", text: "text-yellow-800 font-bold" }
  if (r.includes("SSS")) return { bg: "bg-red-100", bar: "bg-red-500", text: "text-red-700 font-bold" }
  if (r.includes("SS+") || r.includes("SSP")) return { bg: "bg-orange-100", bar: "bg-orange-400", text: "text-orange-700 font-bold" }
  if (r.includes("SS")) return { bg: "bg-yellow-100", bar: "bg-yellow-400", text: "text-yellow-700" }
  if (r.includes("S+") || r.includes("SP")) return { bg: "bg-lime-100", bar: "bg-lime-400", text: "text-lime-700" }
  if (r.includes("S")) return { bg: "bg-green-100", bar: "bg-green-400", text: "text-green-700" }
  return { bg: "bg-gray-100", bar: "bg-gray-400", text: "text-gray-600" }
}

function getAchievement(s: Score) { return s.score / 10000 }

function getDiffColor(level: string) {
  const lv = parseInt(level) || 0
  if (lv >= 14) return "bg-red-100 text-red-700 border-red-300"
  if (lv >= 13) return "bg-orange-100 text-orange-700 border-orange-300"
  if (lv >= 12) return "bg-yellow-100 text-yellow-700 border-yellow-300"
  if (lv >= 10) return "bg-green-100 text-green-700 border-green-300"
  return "bg-blue-100 text-blue-700 border-blue-300"
}

function matchSongEntry(songs: SongEntry[], songTitle: string, chartLevel: string) {
  return songs.find((s) => s.title === songTitle && s.level === chartLevel)
    || songs.find((s) => s.title === songTitle && s.level === chartLevel.replace("+", ""))
    || null
}

const CoverImg = ({ songId, songTitle }: { songId?: string; songTitle: string }) => {
  const [failed, setFailed] = useState(false)
  if (!songId || failed) return <div className="w-10 h-10 rounded-md bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center shrink-0 border border-border"><span className="text-[10px] text-muted-foreground">{songTitle[0]}</span></div>
  return <img src={`https://www.diving-fish.com/covers/${songId}.png`} alt={songTitle} className="w-10 h-10 rounded-md object-cover shrink-0 border border-border" onError={() => setFailed(true)} />
}

export function ScoreWall({ scores }: { scores: Score[] }) {
  const [songMap, setSongMap] = useState<SongEntry[]>([])

  useEffect(() => {
    fetch("/api/songs?game=舞萌").then(r => r.json()).then(setSongMap).catch(() => {})
  }, [])

  if (scores.length === 0) return <div className="p-12 text-center text-muted-foreground">暂无成绩</div>

  const sorted = [...scores].sort((a, b) => b.score - a.score)
  const totalRa = sorted.reduce((sum, s) => sum + ((s.agentAnalysis as any)?.ra || 0), 0)

  const ScoreRow = ({ s, idx }: { s: Score; idx: number }) => {
    const match = matchSongEntry(songMap, s.songTitle, s.chartLevel)
    const style = getRatingStyle(s.grade)
    const ach = getAchievement(s)
    const ra = (s.agentAnalysis as any)?.ra || (match?.constant ? calcDxRating(match.constant, ach) : calcDxRating(getChartConstant(s.chartLevel), ach))
    const diffStyle = getDiffColor(s.chartLevel)
    const songId = (s.agentAnalysis as any)?.songId || match?.songId

    return (
      <div className="grid grid-cols-12 gap-2 px-3 py-2.5 items-center hover:bg-muted/30 rounded-lg transition-colors border-b border-border/30">
        <div className="col-span-1 text-center"><span className={`text-sm font-mono ${idx < 3 ? "text-primary font-bold" : "text-muted-foreground"}`}>{idx + 1}</span></div>
        <div className="col-span-4 flex items-center gap-3 min-w-0">
          <CoverImg songId={songId || undefined} songTitle={s.songTitle} />
          <div className="min-w-0"><p className="text-sm font-medium text-foreground truncate">{s.songTitle}</p>{match && <p className="text-[10px] text-muted-foreground">{match.artist}</p>}</div>
        </div>
        <div className="col-span-1 flex justify-center"><span className={`text-[11px] font-mono px-1.5 py-0.5 rounded border ${diffStyle}`}>{s.chartLevel}</span></div>
        <div className="col-span-3">
          <div className="flex items-center justify-between mb-0.5">
            <span className="text-[13px] font-mono font-bold text-foreground">{ach.toFixed(4)}%</span>
            <span className={`text-[11px] font-mono ${style.text}`}>{ra}</span>
          </div>
          <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden"><div className={`h-full rounded-full ${style.bar}`} style={{ width: `${Math.min(ach, 101)}%` }} /></div>
        </div>
        <div className="col-span-1 flex justify-center"><span className={`text-[11px] px-1.5 py-0.5 rounded font-bold ${style.bg} ${style.text}`}>{s.grade || "-"}</span></div>
        <div className="col-span-2 text-right"><span className="text-sm font-mono font-semibold text-primary">{ra}</span></div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="bg-card rounded-xl border border-border p-4">
        <div className="flex items-center justify-between"><h3 className="text-sm font-semibold text-foreground">B50 Rating</h3><span className="text-xl font-bold text-primary">{totalRa}</span></div>
        <div className="text-xs text-muted-foreground mt-1">{sorted.length} 首</div>
      </div>
      <div>
        <div className="flex items-center justify-between mb-2"><h4 className="text-sm font-semibold text-foreground">Best 50</h4><span className="text-xs text-muted-foreground">{sorted.length} 首</span></div>
        {sorted.map((s, i) => <ScoreRow key={s.id} s={s} idx={i} />)}
      </div>
    </div>
  )
}
