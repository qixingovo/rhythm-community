"use client"

import { useRef } from "react"

interface Score {
  score: number; grade: string | null
}

interface B50ChartProps { scores: Score[] }

const GRADE_COLORS: Record<string, string> = {
  SSSP: "#ffd700", "SSS+": "#ffd700", SSS: "#ff4444",
  "SS+": "#ff8844", SS: "#ffcc00", "S+": "#88cc44",
  S: "#44aa44", AAA: "#4488cc", AA: "#8844cc",
  A: "#888888", B: "#666666", C: "#444444",
}

function getColor(grade: string | null): string {
  if (!grade) return "#333333"
  const g = grade.toUpperCase()
  if (g.includes("SSS+") || g.includes("SSSP")) return "#ffd700"
  if (g.includes("SSS")) return "#ff4444"
  if (g.includes("SS+")) return "#ff8844"
  if (g.includes("SS")) return "#ffcc00"
  if (g.includes("S+") || g.includes("SP")) return "#88cc44"
  if (g.includes("S")) return "#44aa44"
  if (g.includes("AAA")) return "#4488cc"
  if (g.includes("AA")) return "#8844cc"
  return "#666666"
}

export function B50Chart({ scores }: B50ChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const top50 = [...scores].sort((a, b) => b.score - a.score).slice(0, 50)
  if (top50.length === 0) return <div className="p-8 text-center text-muted-foreground">无成绩数据</div>

  const draw = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const cols = 10
    const rows = Math.ceil(top50.length / cols)
    const cellSize = 40
    const gap = 2
    const w = cols * (cellSize + gap)
    const h = rows * (cellSize + gap)
    canvas.width = w
    canvas.height = h + 30

    ctx.fillStyle = "#12121a"
    ctx.fillRect(0, 0, w, h + 30)

    // Legend
    const legend = [
      { label: "SSS+", color: "#ffd700" }, { label: "SSS", color: "#ff4444" },
      { label: "SS", color: "#ffcc00" }, { label: "S", color: "#44aa44" },
      { label: "AAA", color: "#4488cc" }, { label: "AA", color: "#8844cc" },
    ]
    ctx.font = "10px monospace"
    let lx = 4
    legend.forEach((l) => {
      ctx.fillStyle = l.color
      ctx.fillRect(lx, h + 8, 10, 10)
      ctx.fillStyle = "#a0a0b0"
      ctx.fillText(l.label, lx + 13, h + 17)
      lx += 45
    })

    // Cells
    top50.forEach((s, i) => {
      const x = (i % cols) * (cellSize + gap)
      const y = Math.floor(i / cols) * (cellSize + gap)
      ctx.fillStyle = getColor(s.grade)
      ctx.fillRect(x, y, cellSize, cellSize)

      const ach = (s.score / 10000).toFixed(0)
      ctx.fillStyle = "#ffffff"
      ctx.font = "10px monospace"
      ctx.textAlign = "center"
      ctx.fillText(ach + "%", x + cellSize / 2, y + 26)
      ctx.textAlign = "start"
    })
  }

  const download = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const link = document.createElement("a")
    link.download = "b50-chart.png"
    link.href = canvas.toDataURL()
    link.click()
  }

  return (
    <div className="space-y-3">
      <canvas ref={el => { (canvasRef as any).current = el; if (el) setTimeout(draw, 100); }} />
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{top50.length} 首 · 色块 = 达成率</span>
        <button onClick={download} className="text-xs bg-primary text-primary-foreground px-3 py-1 rounded hover:opacity-90">
          下载 PNG
        </button>
      </div>
    </div>
  )
}
