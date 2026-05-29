const BASE_URL = "https://maimai.lxns.net/api/v0"

function getApiKey(): string {
  return process.env.MAIMAI_API_KEY || ""
}

function authHeaders(): Record<string, string> {
  return { Authorization: getApiKey() }
}

async function mxFetch(path: string) {
  const res = await fetch(`${BASE_URL}${path}`, { headers: authHeaders() })
  if (!res.ok) {
    throw new Error(`maimai API ${res.status}: ${await res.text().catch(() => "unknown")}`)
  }
  return res.json()
}

export interface MaimaiPlayer {
  name: string
  rating: number
  friend_code: number
}

export interface MaimaiScore {
  song_title: string
  difficulty: string
  level: string
  level_index: number
  achievements: number
  dx_score: number
  fc: string
  fs: string
  rate: string
  type: string
}

/** 获取玩家基本信息 */
export function getPlayer(friendCode: string | number): Promise<MaimaiPlayer> {
  return mxFetch(`/maimai/player/${friendCode}`)
}

/** 获取 Best 50 */
export function getBests(friendCode: string | number): Promise<{ bests: MaimaiScore[] }> {
  return mxFetch(`/maimai/player/${friendCode}/bests`)
}

/** 获取 Recent 50 */
export function getRecents(friendCode: string | number): Promise<{ recents: MaimaiScore[] }> {
  return mxFetch(`/maimai/player/${friendCode}/recents`)
}

/** 获取 DX Rating 趋势 */
export function getTrend(friendCode: string | number): Promise<{ trend: { date: string; rating: number }[] }> {
  return mxFetch(`/maimai/player/${friendCode}/trend`)
}

/** 上传成绩 */
export function uploadScores(friendCode: string | number, scores: Record<string, unknown>[]): Promise<unknown> {
  return mxFetch(`/maimai/player/${friendCode}/scores`)
}
