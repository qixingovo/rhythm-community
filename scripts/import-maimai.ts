/**
 * 从落雪咖啡屋 maimai API 拉取你的成绩，导入本地数据库
 * 用法: npx tsx scripts/import-maimai.ts <friendCode> <email> <password>
 */
const BASE = "http://localhost:3000"
const FRIEND_CODE = process.argv[2] || "959392354599565"
const EMAIL = process.argv[3] || "qixingovo@test.com"
const PASSWORD = process.argv[4] || "test1234"

async function main() {
  // 1. 登录获取 JWT
  console.log("Logging in...")
  const loginRes = await fetch(`${BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  })
  const setCookie = loginRes.headers.get("set-cookie") || ""
  const accessToken = setCookie.match(/accessToken=([^;]+)/)?.[1] || ""
  if (!accessToken) {
    console.error("Login failed")
    process.exit(1)
  }
  console.log("Login OK")

  // 2. 拉取 maimai best 50
  console.log("Fetching maimai bests...")
  const bestsRes = await fetch(
    `${BASE}/api/maimai?endpoint=bests&friendCode=${FRIEND_CODE}`,
    { headers: { Cookie: `accessToken=${accessToken}` } }
  )
  const bests = await bestsRes.json()
  if (!bests.success) {
    console.error("Fetch bests failed:", bests)
    process.exit(1)
  }

  const allScores = [...(bests.data.standard || []), ...(bests.data.dx || [])]
  console.log(`Got ${allScores.length} scores`)

  // 3. 逐个导入
  let imported = 0
  let skipped = 0

  for (const s of allScores) {
    const body = {
      game: "舞萌",
      songTitle: s.song_name,
      chartType: s.type === "dx" ? "DX" : "STANDARD",
      chartLevel: `${s.level}${s.level_index > 0 ? "+" : ""}`,
      score: Math.round(s.achievements * 10000),
      grade: s.rate?.toUpperCase() || null,
      isPublic: true,
    }

    try {
      const res = await fetch(`${BASE}/api/scores`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: `accessToken=${accessToken}`,
        },
        body: JSON.stringify(body),
      })

      if (res.ok) {
        imported++
        process.stdout.write(".")
      } else {
        skipped++
        process.stdout.write("x")
      }
    } catch {
      process.stdout.write("E")
    }
  }

  console.log(`\nDone: ${imported} imported, ${skipped} skipped (${allScores.length} total)`)
}

main()
