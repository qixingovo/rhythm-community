"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

const GAMES = ["Arcaea", "Phigros", "舞萌"]
const GRADES = ["PM", "EX+", "EX", "AA", "A"]

export default function NewScorePage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [game, setGame] = useState("")
  const [songTitle, setSongTitle] = useState("")
  const [chartType, setChartType] = useState("")
  const [chartLevel, setChartLevel] = useState("")
  const [score, setScore] = useState("")
  const [grade, setGrade] = useState("")
  const [perfectCount, setPerfectCount] = useState("")
  const [greatCount, setGreatCount] = useState("")
  const [missCount, setMissCount] = useState("")
  const [recordingUrl, setRecordingUrl] = useState("")
  const [notes, setNotes] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async () => {
    if (!game || !songTitle || !chartLevel || !score) {
      setError("请填写游戏、曲名、难度和分数")
      return
    }
    setSubmitting(true)
    setError("")
    try {
      const res = await fetch("/api/scores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          game,
          songTitle,
          chartType: chartType || null,
          chartLevel,
          score: parseInt(score),
          grade: grade || null,
          perfectCount: perfectCount ? parseInt(perfectCount) : null,
          greatCount: greatCount ? parseInt(greatCount) : null,
          missCount: missCount ? parseInt(missCount) : null,
          recordingUrl: recordingUrl || null,
          notes: notes || null,
        }),
      })
      if (res.ok) {
        router.push("/profile-scores")
      } else {
        const d = await res.json()
        setError(d.error || "提交失败")
      }
    } catch {
      setError("网络错误")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/profile-scores" className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-foreground">录入成绩</h1>
          <p className="text-sm text-muted-foreground">步骤 {step}/4</p>
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        {[1, 2, 3, 4].map((s) => (
          <div
            key={s}
            className={`flex-1 h-1 rounded-full ${s <= step ? "bg-primary" : "bg-muted"}`}
          />
        ))}
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 text-sm rounded-lg p-3 text-center">{error}</div>
      )}

      {step === 1 && (
        <div className="space-y-4">
          <label className="block text-sm font-medium text-foreground">选择游戏</label>
          <div className="grid grid-cols-3 gap-3">
            {GAMES.map((g) => (
              <button
                key={g}
                onClick={() => { setGame(g); setStep(2) }}
                className={`p-4 rounded-xl border text-center font-medium transition-all ${
                  game === g ? "border-primary bg-primary/10 text-primary" : "border-border bg-card text-foreground hover:border-primary/50"
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <label className="block text-sm font-medium text-foreground">曲名</label>
          <input
            value={songTitle}
            onChange={(e) => setSongTitle(e.target.value)}
            placeholder="输入曲名"
            className="w-full bg-muted border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-foreground mb-1">谱面类型</label>
              <input
                value={chartType}
                onChange={(e) => setChartType(e.target.value)}
                placeholder="如 FTR"
                className="w-full bg-muted border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-foreground mb-1">难度等级</label>
              <input
                value={chartLevel}
                onChange={(e) => setChartLevel(e.target.value)}
                placeholder="如 11"
                className="w-full bg-muted border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setStep(1)} className="flex-1 py-3 bg-muted rounded-xl text-sm">上一步</button>
            <button onClick={() => setStep(3)} disabled={!songTitle || !chartLevel} className="flex-1 py-3 bg-primary text-primary-foreground rounded-xl text-sm disabled:opacity-50">下一步</button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <label className="block text-sm font-medium text-foreground">分数</label>
          <input
            type="number"
            value={score}
            onChange={(e) => setScore(e.target.value)}
            placeholder="输入分数"
            className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-2xl text-center font-mono focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">段位评级</label>
            <div className="flex gap-2 flex-wrap">
              {GRADES.map((g) => (
                <button
                  key={g}
                  onClick={() => setGrade(g)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border ${
                    grade === g ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground"
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Perfect</label>
              <input type="number" value={perfectCount} onChange={(e) => setPerfectCount(e.target.value)} className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Great</label>
              <input type="number" value={greatCount} onChange={(e) => setGreatCount(e.target.value)} className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Miss</label>
              <input type="number" value={missCount} onChange={(e) => setMissCount(e.target.value)} className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setStep(2)} className="flex-1 py-3 bg-muted rounded-xl text-sm">上一步</button>
            <button onClick={() => setStep(4)} disabled={!score} className="flex-1 py-3 bg-primary text-primary-foreground rounded-xl text-sm disabled:opacity-50">下一步</button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-4">
          <label className="block text-sm font-medium text-foreground">录像链接 (YouTube/B站)</label>
          <input value={recordingUrl} onChange={(e) => setRecordingUrl(e.target.value)} placeholder="可选" className="w-full bg-muted border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/30" />
          <label className="block text-sm font-medium text-foreground">备注</label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="可选" rows={3} className="w-full bg-muted border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/30" />
          <div className="bg-muted rounded-xl p-4 space-y-1 text-sm">
            <p><strong>游戏:</strong> {game}</p>
            <p><strong>曲名:</strong> {songTitle} {chartType} {chartLevel}</p>
            <p><strong>分数:</strong> {score} {grade}</p>
            {perfectCount && <p>Perfect: {perfectCount} | Great: {greatCount} | Miss: {missCount}</p>}
          </div>
          <div className="flex gap-3">
            <button onClick={() => setStep(3)} className="flex-1 py-3 bg-muted rounded-xl text-sm">上一步</button>
            <button onClick={handleSubmit} disabled={submitting} className="flex-1 py-3 bg-primary text-primary-foreground rounded-xl text-sm disabled:opacity-50">
              {submitting ? "提交中..." : "提交"}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
