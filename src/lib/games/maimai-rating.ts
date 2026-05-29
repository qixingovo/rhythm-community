/**
 * maimai DX Rating 公式: 定数 × 达成率系数
 * 定数范围 1.0-15.0，系数来自 diving-fish/水鱼标准
 */

const RANK_COEFFICIENTS: [number, number][] = [
  [100.5, 22.4],
  [100.0, 21.6],
  [99.5, 21.1],
  [99.0, 20.6],
  [98.0, 20.0],
  [97.0, 17.6],
  [96.0, 15.2],
  [95.0, 13.6],
  [94.0, 12.0],
  [90.0, 10.4],
  [80.0, 8.8],
  [0, 7.2],
]

export function getRankCoefficient(achievement: number): number {
  for (const [t, c] of RANK_COEFFICIENTS) {
    if (achievement >= t) return c
  }
  return 7.2
}

// 定数估算值 (1-15 尺度)，仅在无 diving-fish 数据时作为回退
const APPROX_CONSTANT: Record<string, number> = {
  "1": 1.0, "2": 2.0, "3": 3.0, "4": 4.0, "5": 5.0,
  "6": 6.0, "7": 7.0, "7+": 7.7,
  "8": 8.0, "8+": 8.7,
  "9": 9.0, "9+": 9.7,
  "10": 10.0, "10+": 10.7,
  "11": 11.0, "11+": 11.7,
  "12": 12.0, "12+": 12.7,
  "13": 13.0, "13+": 13.7,
  "14": 14.0, "14+": 14.7,
  "15": 15.0, "15+": 15.7,
}

export function getChartConstant(level: string | number): number {
  const lv = String(level)
  if (APPROX_CONSTANT[lv]) return APPROX_CONSTANT[lv]!
  const base = parseFloat(lv) || 10
  return base + (lv.includes("+") ? 0.7 : 0)
}

export function calcDxRating(chartConstant: number, achievementPercent: number): number {
  return Math.floor(chartConstant * getRankCoefficient(achievementPercent))
}

export function calcTotalRating(scores: { level: string; achievement: number; isDx: boolean }[]): {
  standard: number; dx: number; total: number
} {
  const std = scores.filter((s) => !s.isDx).map((s) => calcDxRating(getChartConstant(s.level), s.achievement)).sort((a, b) => b - a)
  const dx = scores.filter((s) => s.isDx).map((s) => calcDxRating(getChartConstant(s.level), s.achievement)).sort((a, b) => b - a)
  return {
    standard: std.slice(0, 35).reduce((a, b) => a + b, 0),
    dx: dx.slice(0, 15).reduce((a, b) => a + b, 0),
    total: 0,
  }
}
