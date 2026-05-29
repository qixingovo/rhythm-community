/**
 * 从 diving-fish 拉取用户完整成绩，导入本地 Score 表
 * 用法: npx tsx scripts/import-records-df.ts <username> <email>
 */
import { config } from "dotenv"
config({ path: ".env" })

import { PrismaClient } from "@prisma/client"
import * as df from "@/lib/games/diving-fish"

const prisma = new PrismaClient()
const USERNAME = process.argv[2] || "qixingovo"
const EMAIL = process.argv[3] || "qixingovo@test.com"

async function main() {
  const user = await prisma.user.findUnique({ where: { email: EMAIL } })
  if (!user) { console.error("User not found:", EMAIL); process.exit(1) }
  console.log(`User: ${user.username} (${user.id})`)

  // 1. 拉取 diving-fish 成绩
  console.log(`Fetching records from diving-fish for "${USERNAME}"...`)
  const data = await df.getPlayerRecords(USERNAME)
  console.log(`Got ${data.records.length} records | Rating: ${data.rating} | 段位: ${data.additional_rating}`)

  // 2. 删除旧成绩
  await prisma.score.deleteMany({ where: { userId: user.id, game: "舞萌" } })
  console.log("Old scores cleared")

  // 3. 批量导入
  let imported = 0
  const batchSize = 100
  const batches: Record<string, unknown>[][] = []
  let currentBatch: Record<string, unknown>[] = []

  for (const r of data.records) {
    currentBatch.push({
      userId: user.id,
      game: "舞萌",
      songTitle: r.title,
      chartType: r.type,
      chartLevel: r.level,
      score: Math.round(r.achievements * 10000),
      grade: r.rate.toUpperCase(),
      agentAnalysis: { ds: r.ds, ra: r.ra, songId: r.song_id },
      isPublic: true,
    })

    if (currentBatch.length >= batchSize) {
      batches.push(currentBatch)
      currentBatch = []
    }
  }
  if (currentBatch.length > 0) batches.push(currentBatch)

  for (const batch of batches) {
    await prisma.score.createMany({ data: batch as Parameters<typeof prisma.score.createMany>[0]["data"] })
    imported += batch.length
    console.log(`  ${imported}/${data.records.length}`)
  }

  // 4. 更新用户资料
  await prisma.user.update({
    where: { id: user.id },
    data: { bio: `舞萌 Rating ${data.rating} · ${data.plate} · ${data.nickname}` },
  })

  console.log(`Done: ${imported} scores imported`)
}

main().catch(console.error).finally(() => prisma.$disconnect())
