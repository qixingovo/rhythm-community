/**
 * diving-fish (水鱼) maimai API 封装
 * 公共端点 + 开发者端点 (Developer-Token)
 */

const BASE = "https://www.diving-fish.com/api/maimaidxprober"
const DEV_TOKEN = process.env.DIVING_FISH_TOKEN || ""

function devHeaders(): Record<string, string> {
  return { "Developer-Token": DEV_TOKEN }
}

// ====== 公共端点 ======

export interface DivingFishSong {
  id: string; title: string; type: "SD" | "DX"
  ds: number[]; level: string[]; cids: number[]
  charts: { notes: number[]; charter: string }[]
  basic_info: { title: string; artist: string; genre: string; bpm: number }
}

let songCache: DivingFishSong[] | null = null

export async function getAllSongs(): Promise<DivingFishSong[]> {
  if (songCache) return songCache
  const res = await fetch(`${BASE}/music_data`)
  if (!res.ok) throw new Error(`diving-fish music_data ${res.status}`)
  songCache = await res.json()
  return songCache!
}

export function getCoverUrl(songId: string | number): string {
  return `https://www.diving-fish.com/covers/${songId}.png`
}

// ====== 开发者端点 ======

export interface PlayerRecord {
  achievements: number
  ds: number            // 定数
  dxScore: number
  fc: string
  fs: string
  level: string
  level_index: number
  level_label: string
  ra: number            // 单曲 Rating
  rate: string          // sssp, sss, ss, ...
  song_id: number
  title: string
  type: string          // SD 或 DX
}

export interface PlayerRecords {
  additional_rating: number
  nickname: string
  plate: string
  rating: number
  records: PlayerRecord[]
  username: string
}

/** 获取用户完整成绩 (Developer-Token) */
export async function getPlayerRecords(username: string): Promise<PlayerRecords> {
  const url = `${BASE}/dev/player/records?username=${encodeURIComponent(username)}`
  const res = await fetch(url, { headers: devHeaders() })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(`diving-fish records ${res.status}: ${JSON.stringify(err)}`)
  }
  return res.json()
}

/** 获取用户单曲成绩 */
export async function getPlayerRecord(username: string, musicId: number | number[]): Promise<PlayerRecord[]> {
  const res = await fetch(`${BASE}/dev/player/record`, {
    method: "POST",
    headers: { ...devHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({ username, music_id: musicId }),
  })
  if (!res.ok) throw new Error(`diving-fish record ${res.status}`)
  return res.json()
}
