import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("Seeding database...")

  const password = await bcrypt.hash("test1234", 12)

  const users = await Promise.all([
    prisma.user.create({
      data: {
        username: "testuser1",
        email: "test1@example.com",
        password,
        bio: "Arcaea 10.5，目标全曲 PM",
        preferences: {
          create: {
            games: ["Arcaea", "Phigros"],
            skillLevel: { Arcaea: 10.5, Phigros: 14.2 },
            favGenres: ["hardcore", "trance"],
            devices: ["iPad Pro"],
          },
        },
        trustRole: { create: { level: 2 } },
      },
    }),
    prisma.user.create({
      data: {
        username: "testuser2",
        email: "test2@example.com",
        password,
        bio: "舞萌玩家，紫谱修行中",
        preferences: {
          create: {
            games: ["舞萌", "Arcaea"],
            skillLevel: { "舞萌": 13, Arcaea: 9.5 },
            favGenres: ["j-pop", "anime"],
            devices: ["iPad"],
          },
        },
        trustRole: { create: { level: 1 } },
      },
    }),
    prisma.user.create({
      data: {
        username: "testuser3",
        email: "test3@example.com",
        password,
        bio: "全平台音游玩家",
        preferences: {
          create: {
            games: ["Arcaea", "Phigros", "舞萌"],
            skillLevel: { Arcaea: 11.2, Phigros: 15.0, "舞萌": 14 },
            favGenres: ["hardcore", "electronic"],
            devices: ["iPad Pro", "键盘"],
          },
        },
        trustRole: { create: { level: 3 } },
      },
    }),
  ])

  const scores = [
    { userId: users[0]!.id, game: "Arcaea", songTitle: "Grievous Lady", chartType: "FTR", chartLevel: "11", score: 9900000, grade: "PM", perfectCount: 1100, missCount: 0 },
    { userId: users[0]!.id, game: "Arcaea", songTitle: "Axium Crisis", chartType: "FTR", chartLevel: "10+", score: 9850000, grade: "EX+", perfectCount: 1050, missCount: 1 },
    { userId: users[0]!.id, game: "Arcaea", songTitle: "Fracture Ray", chartType: "FTR", chartLevel: "11", score: 9750000, grade: "EX", perfectCount: 1020, missCount: 5 },
    { userId: users[0]!.id, game: "Phigros", songTitle: "Igallta", chartType: "IN", chartLevel: "15", score: 960000, grade: "EX", perfectCount: 900, missCount: 3 },
    { userId: users[0]!.id, game: "Phigros", songTitle: "Spasmodic", chartType: "IN", chartLevel: "15", score: 930000, grade: "AA", perfectCount: 850, missCount: 8 },
    { userId: users[1]!.id, game: "舞萌", songTitle: "PANDORA PARADOXXX", chartType: "MASTER", chartLevel: "14", score: 1007500, grade: "SSS+", perfectCount: 1500, missCount: 0 },
    { userId: users[1]!.id, game: "舞萌", songTitle: "AstroDX", chartType: "EXPERT", chartLevel: "13", score: 995000, grade: "SS", perfectCount: 1200, missCount: 2 },
    { userId: users[2]!.id, game: "Arcaea", songTitle: "Tempestissimo", chartType: "BYD", chartLevel: "12", score: 9900000, grade: "PM", perfectCount: 1200, missCount: 0 },
    { userId: users[2]!.id, game: "Arcaea", songTitle: "#1f1e33", chartType: "FTR", chartLevel: "11", score: 9780000, grade: "EX+", perfectCount: 1100, missCount: 2 },
    { userId: users[2]!.id, game: "舞萌", songTitle: "Titania", chartType: "MASTER", chartLevel: "14", score: 1002000, grade: "SSS", perfectCount: 1400, missCount: 1 },
  ]

  await Promise.all(scores.map(s => prisma.score.create({ data: s })))

  const posts = [
    { userId: users[0]!.id, category: "rhythm", title: "Arcaea 10.5 瓶颈突破经验分享", content: "练了三个月终于从 10.5 升到 10.7，核心心得：1. 每天练 Axium Crisis 当热身 2. 集中练蛇形+单键协调 3. 多看高分段手元学指法。重点是不要越级，先把 10 级的 EX+ 刷完再冲 11。", tags: ["Arcaea", "进阶", "心得"], game: "Arcaea" },
    { userId: users[1]!.id, category: "chart_discuss", title: "舞萌 AstroDX MASTER 谱面难点拆解", content: "1:05-1:15 的交互段是整谱最难的地方，需要左手主导全押。建议先练 1:05 开始的右手单键+左手滑条组合。1:45 的蛇形段要用左右交替指法，不要试图单手硬接。", tags: ["舞萌", "谱面分析", "指法"], game: "舞萌" },
    { userId: users[2]!.id, category: "rhythm", title: "Phigros 16.0 全新体验", content: "终于爬到 16.0 了！分享一下冲分路线：15.0→15.5 刷 IN15 全曲，15.5→16.0 重点攻克 AT16 的判定。关键是在 IN15 先稳住 accuracy，然后才是 reads speed。", tags: ["Phigros", "冲分", "Rating"], game: "Phigros" },
  ]

  await Promise.all(posts.map(p =>
    prisma.post.create({
      data: {
        ...p,
        comments: {
          create: [
            { userId: users[1]!.id, content: "太强了！请问 Axium Crisis 每天练多久合适？" },
            { userId: users[0]!.id, content: "我一般练 20 分钟热身，状态好再加 10 分钟。" },
          ],
        },
      },
    })
  ))

  const gameSongs = [
    { game: "Arcaea", title: "Grievous Lady", artist: "Team Grimoire vs Laur", bpm: 210, difficulty: { FTR: 11, BYD: 12 }, genre: "hardcore", packName: "Vicious Labyrinth" },
    { game: "Arcaea", title: "Fracture Ray", artist: "Sakuzyo", bpm: 200, difficulty: { FTR: 11 }, genre: "hardcore", packName: "Luminous Sky" },
    { game: "Arcaea", title: "Axium Crisis", artist: "ak+q", bpm: 170, difficulty: { FTR: "10+" }, genre: "electronic", packName: "Vicious Labyrinth" },
    { game: "Arcaea", title: "Tempestissimo", artist: "t+pazolite", bpm: 231, difficulty: { FTR: 11, BYD: 12 }, genre: "hardcore" },
    { game: "Arcaea", title: "#1f1e33", artist: "Camellia", bpm: 186, difficulty: { FTR: 11 }, genre: "hardcore" },
    { game: "Phigros", title: "Igallta", artist: "Se-U-Ra", bpm: 200, difficulty: { IN: 15, AT: 16 }, genre: "hardcore" },
    { game: "Phigros", title: "Spasmodic", artist: "姜米條", bpm: 175, difficulty: { IN: 15 }, genre: "electronic" },
    { game: "Phigros", title: "Rrhar'il", artist: "Team Grimoire", bpm: 210, difficulty: { IN: 15, AT: 16 }, genre: "hardcore" },
    { game: "舞萌", title: "PANDORA PARADOXXX", artist: "削除", bpm: 180, difficulty: { MASTER: 14, "Re:MASTER": 15 }, genre: "electronic" },
    { game: "舞萌", title: "Titania", artist: "xi", bpm: 212, difficulty: { MASTER: 14 }, genre: "hardcore" },
  ]

  await Promise.all(gameSongs.map(s => prisma.gameSong.create({ data: s })))

  console.log("Seed complete!")
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
