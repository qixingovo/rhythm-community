/**
 * 从 diving-fish API 拉取全部曲目定数，导入 GameSong 表
 * 用法: npx tsx scripts/import-diving-fish.ts
 */
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

interface DfSong {
  id: string
  title: string
  type: string
  ds: number[]
  level: string[]
  basic_info: { artist: string; genre: string; bpm: number }
}

async function main() {
  console.log("Fetching diving-fish music data...")
  const res = await fetch("https://www.diving-fish.com/api/maimaidxprober/music_data")
  const songs: DfSong[] = await res.json()
  console.log(`Got ${songs.length} songs`)

  let imported = 0
  for (const s of songs) {
    // 每个难度一条记录
    for (let i = 0; i < s.level.length; i++) {
      const level = s.level[i]!
      const constant = s.ds[i]!

      await prisma.gameSong.upsert({
        where: { game_title_level: { game: "舞萌", title: s.title, level } },
        create: {
          game: "舞萌",
          title: s.title,
          level,
          constant,
          artist: s.basic_info.artist,
          bpm: s.basic_info.bpm,
          genre: s.basic_info.genre,
          songId: s.id,
          type: s.type,
          difficulty: {},
        },
        update: { constant, artist: s.basic_info.artist, bpm: s.basic_info.bpm, genre: s.basic_info.genre },
      })

      imported++
      if (imported % 500 === 0) console.log(`  ${imported} entries...`)
    }
  }

  console.log(`Done: ${imported} chart entries imported`)
}

main().catch(console.error).finally(() => prisma.$disconnect())
