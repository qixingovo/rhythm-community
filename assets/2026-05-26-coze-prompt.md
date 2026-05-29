# 音游社区平台 — 完整开发文档（Coze 执行版）

> 本文档集成了产品方案、UI 设计系统、技术架构、数据模型和实现计划。Coze 按 Phase 顺序逐 Task 执行。

---

## Part A: 产品概述

垂直音游社区平台。核心卖点：内置 DeepSeek AI Agent（音游进阶陪练 & 数据分析）。

### 核心功能

1. **AI 音游陪练 Agent**（全局侧边栏）
   - 音游黑话/术语咨询
   - 录入打歌成绩，Agent 分析失误点、难点段落、提升技巧
   - 针对 Arcaea / Phigros / 舞萌 给出专项练歌计划、指法优化、难点拆解
   - 主动记忆用户偏好，越用越懂用户
   - 主动任务：智能推荐谱面 + 新游/赛事资讯推送

2. **社区功能**
   - 成绩分享卡片（结构化展示，非纯文本）
   - 谱面讨论区（按曲目集中讨论，含时间戳标注）
   - b50 成绩图生成（50 首最佳成绩色块矩阵图）
   - 活动/比赛板块
   - 联动创作（谱面 + 原创曲 + 曲绘企划招募）
   - 关注 & 动态流 + 通知 + 私信 + 排行榜
   - 信任等级自治（0-3 级，按活跃度解锁权限）

---

## Part B: UI 设计 — 赛博音游风

### B.1 设计总纲

**色彩系统：**

| 变量 | 色值 | 用途 |
|------|------|------|
| bg-primary | #0a0a0f | 最深背景 |
| bg-secondary | #12121a | 卡片底色 |
| bg-tertiary | #1a1a2e | 悬浮层/输入框 |
| neon-cyan | #00f0ff | 主强调色（全局交互、高亮） |
| Arcaea 紫 | #b347ea | Arcaea 标签/主题 |
| Phigros 橙 | #ff6b35 | Phigros 标签/主题 |
| 舞萌 蓝 | #00bfff | 舞萌 标签/主题 |
| text-primary | #e0e0e0 | 正文 |
| text-secondary | #a0a0b0 | 次要文字 |
| text-dim | #6b6b7a | 辅助/时间戳 |
| border | #1e1e30 | 所有边框 |
| success | #00ff88 | PM/成功 |
| warning | #ffcc00 | EX/警告 |
| error | #ff4444 | Miss/失败 |

**段位颜色编码（贯穿全站）：**

| 段位 | 颜色 | 说明 |
|------|------|------|
| AP (All Perfect) | 金色 #ffd700 | 最高成就 |
| PM (Pure Memory) | 绿色 #00ff88 | 满分 |
| EX+ (Excellent+) | 蓝色 #00ccff | 接近满分 |
| EX (Excellent) | 黄色 #ffcc00 | 优秀 |
| AA | 橙色 #ff8800 | 良好 |
| Track Lost | 红色 #ff4444 | 失败 |

**发光效果等级：**

- Default: 无发光，标准 card
- Hover: `box-shadow: 0 0 8px rgba(0,240,255,0.2)`，微弱青光环
- Active/Focus: `box-shadow: 0 0 16px rgba(0,240,255,0.3)` + border 变为 neon-cyan
- Emphasis: 内外双 glow，用于重点按钮/选中状态

**字体：**

- 显示/大数（分数、统计）：monospace (JetBrains Mono / Fira Code)，带 neon 发光 `text-shadow: 0 0 8px neon色`
- 标题：system-ui, weight 700-800
- 正文：system-ui, 13-14px, line-height 1.6
- 辅助文本：11px, text-dim

**视觉元素规范：**

**粒子背景**：全屏固定 Canvas 层，50-80 个缓慢漂浮发光粒子，间距 < 150px 时绘制半透明连接线，pointer-events: none

**判定线装饰**：每个成绩卡片左侧 3px 宽的垂直装饰条，颜色根据段位渐变（从上到下：浅→深），模拟音游判定线的视觉效果

**导航栏**：半透明磨砂玻璃效果 `backdrop-filter: blur(12px)`，底部 1px border

**卡片**：bg-secondary 背景，border 边框，rounded 8px。hover 时根据卡片关联的游戏/段位发出对应颜色的 neon shadow

**按钮**：
- primary：neon-cyan 渐变填充 + 白字
- secondary：透明底 + neon-cyan 边框
- ghost：无边框，hover 时 bg-tertiary 浮现

**输入框**：bg-tertiary 暗底 + border，focus 时 border 变 neon-cyan 并外发光

### B.2 页面布局

**桌面端（>= 1280px）三栏：**
```
┌──────────────────────────────────────────────┐
│  [Logo RHYTHM]  社区 谱面讨论 排行榜  [🔔][Agent][👤] │  ← 导航栏 56px
├──────────────────────────────────────────────┤
│                                    ┌────────┤
│    主内容区（动态流/社区/个人页）     │ Agent  │  ← 右侧 380px
│       flex: 1                       │ 侧边栏  │
│                                      │        │
│       左侧 2px 判定线装饰的成绩卡片    │ 聊天窗  │
│       霓虹 hover 发光的帖子卡片       │ 输入栏  │
│                                      └────────┤
└──────────────────────────────────────────────┘
```

**移动端（< 768px）：**
```
┌───────────────────┐
│  RHYTHM    [🔔][👤]│  ← 顶栏，无 Agent 侧边栏
├───────────────────┤
│                   │
│  全宽内容区        │
│                   │
│  紧凑成绩卡片      │
│                   │
├───────────────────┤
│ 🏠 📋 ＋ 🔔 👤  │  ← 底部 Tab Bar
└───────────────────┘
```
- 中间 "+" 按钮：圆形，neon-cyan 渐变填充，box-shadow 发光，margin-top: -10px 向上突出
- Agent 在移动端以底部 Sheet 形式展现，上滑展开 80vh

### B.3 关键页面

**首页动态流：**
- 混合时间线：关注者的新成绩卡片 + 帖子卡片 + 打卡记录
- 成绩卡片：左侧判定线 | 头像+用户名+时间+游戏tag | 曲名+难度 | 大号分数+段位 | P/G/M 小字
- 帖子卡片：头像+用户名+时间+分类tag | 标题+正文摘要(前150字) | 评论数+点赞数+话题标签
- 打卡卡片：渐变背景(青色到紫色 5%透明度) | 火焰图标+文字+连续天数

**Agent 侧边栏：**
- 顶部 ModeTabs：[陪练 | 分析 | 推荐 | 计划]，当前选中底部 2px neon-cyan 下划线
- 中间对话区：用户消息右对齐 bg-tertiary 气泡，Agent 消息左对齐 bg-secondary 气泡 + AI 小头像。流式输出中消息有 neon-cyan 左边框 + 闪烁光标
- 底部输入栏：暗底输入框 + 圆形发送按钮

**成绩录入向导（4 步进度条）：**
- 步骤 1 选游戏：3 张游戏卡片横排，选中发对应颜色光
- 步骤 2 录分数：大号居中数字输入 + P/G/M 三格并排 + Grade 横排选择按钮
- 步骤 3 附外链：录像 URL + 截图 URL 输入
- 步骤 4 预览：结构化预览卡片
- 底部固定："上一步"+"下一步/提交"按钮

**个人主页：**
- 头像+用户名+信任等级徽章+关注/粉丝数+编辑资料按钮
- Tabs：[成绩墙 | b50 图表 | 训练进度 | 帖子]
- 左侧图表区：技能雷达图（Canvas/SVG 五边形）+ b50 色块矩阵 (10x5 网格) + 训练进度条
- 右侧成绩墙：responsive grid 卡片瀑布流，每张卡片左侧判定线

**谱面讨论页：**
- 顶部曲目信息：封面图+游戏tag+曲名+曲师+BPM+难度标签+社区评分
- 下方帖子流：用户讨论帖，支持谱面时间戳标注（如 1:05-1:15），monospace 格式显示段落结构
- 用户头像边框颜色对应信任等级，显示 Lv 徽章

---

## Part C: 技术架构

**技术栈：**

| 层 | 选型 |
|------|------|
| 框架 | Next.js 15 App Router |
| 语言 | TypeScript strict mode |
| 状态管理 | XState 5（Agent 对话流、成绩录入向导、训练计划） |
| 样式 | TailwindCSS 4 + 自建赛博音游风主题 |
| AI | DeepSeek API（deepseek-chat + deepseek-vision） |
| 数据库 | PostgreSQL + Prisma ORM |
| 认证 | 自建 bcrypt(12 rounds) + JWT(access 24h/refresh 7d) |
| 存储 | OSS（头像） |
| 部署 | 单体 Next.js，Vercel/Docker |

**项目结构：**
```
rhythm-community/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # 根布局（ParticleBackground + Navbar + AppShell）
│   ├── page.tsx                  # 首页动态流
│   ├── (auth)/                   # 未登录路由组
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (main)/                   # 需登录路由组（middleware 保护）
│   │   ├── layout.tsx            # 主布局（AgentSidebar 容器）
│   │   ├── community/            # 社区：帖子广场、音游区、谱面讨论、活动、联动创作
│   │   ├── profile/              # 个人主页、成绩管理
│   │   ├── leaderboard/          # 排行榜
│   │   └── messages/             # 私信
│   └── api/                      # API Routes (auth/agent/scores/posts/users/notifications/messages)
│
├── lib/
│   ├── db/                       # Prisma Client + schema（完整定义见 Part E）
│   ├── auth/                     # bcrypt + JWT 工具 + middleware
│   ├── agent/                    # DeepSeek SDK 封装 + coach/analyzer/recommender/planner/memory/tasks
│   │   └── prompts/              # 4 个 system prompt 模板
│   ├── games/                    # 游戏元数据 + 曲目数据库操作
│   ├── trust/                    # 信任等级评估
│   └── utils/                    # 格式化工具
│
├── components/
│   ├── layout/                   # AppShell, Navbar, MobileTabBar, AgentSidebar
│   ├── agent/                    # AgentChat, AgentMessage, ModeTabs, AgentFab
│   ├── community/                # PostCard, ScoreCard, ChartDiscussion, CommentSection
│   ├── profile/                  # ScoreWall, B50Chart, SkillRadar, ProgressTimeline
│   ├── leaderboard/              # RankingTable
│   └── ui/                       # NeonCard, Button, Input, Modal, TrustBadge, ParticleBackground
│
├── machines/                     # XState 5 状态机 (auth, agentChat, scoreEntry, trainingPlan, recommendation)
└── types/                        # TypeScript 类型定义 (agent, game, score, user, community)
```

---

## Part D: DeepSeek Agent 架构

### D.1 Agent 模式

| 模式 | 功能 | System Prompt |
|------|------|---------------|
| 陪练 | 术语解释、指法指导、谱面拆解 | coach.txt — 注入用户画像 + 近 20 条成绩 |
| 分析 | 成绩数据分析 + 截图 Vision | analyzer.txt — JSON mode 输出结构化分析 |
| 推荐 | 根据段位/偏好/短板推荐谱面 | recommender.txt |
| 计划 | 生成 7/14/30 天训练计划 | planner.txt |

### D.2 Agent 记忆机制

每次对话结束后，异步调用 deepseek-chat (JSON mode) 从对话中提取用户偏好：
```json
{"game": "Arcaea", "level": 10.5, "genres": ["hardcore"], "device": "iPad Pro"}
```
增量更新到 UserPreference 表，下次对话注入为 system prompt。

### D.3 主动任务

- **每日智能推荐**：检查最近 7 天成绩 → 发现瓶颈 → Agent 推荐练习曲 → 推送通知
- **每周资讯**：爬取音游新闻源 → Agent 按游戏过滤 → 推送通知

### D.4 API 调用方式

使用 fetch() 直接调用 DeepSeek API（OpenAI 兼容格式）：
- Base URL: `https://api.deepseek.com/v1`
- 对话：`POST /chat/completions`，stream: true → SSE ReadableStream
- JSON 模式：`response_format: { type: "json_object" }`

---

## Part E: 数据模型（Prisma Schema 完整定义）

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id            String   @id @default(uuid())
  username      String   @unique
  email         String   @unique
  passwordHash  String
  avatar        String?
  bio           String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  preferences   UserPreference?
  scores        Score[]
  trainingPlans TrainingPlan[]
  checkIns      CheckIn[]
  posts         Post[]
  comments      Comment[]
  agentSessions AgentSession[]
  agentTasks    AgentTask[]
  trustRole     TrustRole?
  b50snapshots  B50Snapshot[]
  followers     Follow[]          @relation("following")
  following     Follow[]          @relation("follower")
  sentMessages  Message[]         @relation("sender")
  recvMessages  Message[]         @relation("receiver")
  collabMembers CollabMember[]
}

model UserPreference {
  id         String   @id @default(uuid())
  userId     String   @unique
  games      Json     @default("[]")
  skillLevel Json     @default("{}")
  favGenres  Json     @default("[]")
  devices    Json     @default("[]")
  playStyle  String?
  weeklyGoal String?
  updatedAt  DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model TrustRole {
  id         String   @id @default(uuid())
  userId     String   @unique
  level      Int      @default(0)
  unlockedAt DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model Score {
  id            String   @id @default(uuid())
  userId        String
  game          String
  songTitle     String
  chartType     String?
  chartLevel    String
  score         Int
  grade         String?
  perfectCount  Int?
  greatCount    Int?
  missCount     Int?
  recordingUrl  String?
  screenshotUrl String?
  notes         String?
  agentAnalysis Json?
  isPublic      Boolean  @default(true)
  createdAt     DateTime @default(now())

  user    User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  checkIn CheckIn?

  @@index([userId, game])
  @@index([userId, createdAt])
}

model B50Snapshot {
  id          String   @id @default(uuid())
  userId      String
  game        String
  imageUrl    String?
  data        Json
  generatedAt DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model TrainingPlan {
  id        String   @id @default(uuid())
  userId    String
  game      String
  title     String
  goal      String
  dailyPlan Json
  progress  Float    @default(0)
  startDate DateTime
  endDate   DateTime?
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())

  user     User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  checkIns CheckIn[]
}

model CheckIn {
  id        String   @id @default(uuid())
  userId    String
  planId    String?
  date      DateTime
  game      String?
  scoreId   String?
  note      String?
  createdAt DateTime @default(now())

  user  User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  plan  TrainingPlan? @relation(fields: [planId], references: [id])
  score Score?        @relation(fields: [scoreId], references: [id])
}

model Post {
  id        String   @id @default(uuid())
  userId    String
  category  String
  title     String
  content   String
  tags      String[] @default([])
  game      String?
  pinned    Boolean  @default(false)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user     User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  comments Comment[]

  @@index([category, createdAt])
}

model Comment {
  id        String   @id @default(uuid())
  postId    String
  userId    String
  content   String
  parentId  String?
  createdAt DateTime @default(now())

  post    Post      @relation(fields: [postId], references: [id], onDelete: Cascade)
  user    User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  parent  Comment?  @relation("CommentReplies", fields: [parentId], references: [id])
  replies Comment[] @relation("CommentReplies")
}

model Follow {
  id          String   @id @default(uuid())
  followerId  String
  followingId String
  createdAt   DateTime @default(now())

  follower  User @relation("follower", fields: [followerId], references: [id], onDelete: Cascade)
  following User @relation("following", fields: [followingId], references: [id], onDelete: Cascade)

  @@unique([followerId, followingId])
}

model Notification {
  id        String   @id @default(uuid())
  userId    String
  type      String
  content   String
  relatedId String?
  read      Boolean  @default(false)
  createdAt DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, read, createdAt])
}

model Message {
  id         String   @id @default(uuid())
  senderId   String
  receiverId String
  content    String
  read       Boolean  @default(false)
  createdAt  DateTime @default(now())

  sender   User @relation("sender", fields: [senderId], references: [id], onDelete: Cascade)
  receiver User @relation("receiver", fields: [receiverId], references: [id], onDelete: Cascade)

  @@index([senderId, receiverId])
  @@index([receiverId, read])
}

model CollabProject {
  id        String   @id @default(uuid())
  title     String
  type      String
  desc      String
  status    String   @default("recruiting")
  createdAt DateTime @default(now())

  members CollabMember[]
}

model CollabMember {
  id        String   @id @default(uuid())
  projectId String
  userId    String
  role      String

  project CollabProject @relation(fields: [projectId], references: [id], onDelete: Cascade)
  user    User          @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([projectId, userId])
}

model AgentSession {
  id        String   @id @default(uuid())
  userId    String
  mode      String
  messages  Json
  summary   String?
  createdAt DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model AgentTask {
  id        String    @id @default(uuid())
  userId    String
  type      String
  title     String
  detail    String?
  triggerAt DateTime?
  status    String    @default("pending")
  createdAt DateTime  @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model GameSong {
  id            String   @id @default(uuid())
  game          String
  title         String
  aliases       String[] @default([])
  artist        String
  bpm           Int?
  difficulty    Json
  genre         String?
  packName      String?
  sourceType    String   @default("api_import")
  communityNote String?
  createdAt     DateTime @default(now())

  @@unique([game, title])
  @@index([game, genre])
}

model LeaderboardEntry {
  id        String   @id @default(uuid())
  game      String
  chartId   String?
  entries   Json
  updatedAt DateTime @default(now())

  @@index([game, updatedAt])
}
```

---

## Part F: XState 状态机（5 个）

### AuthMachine
```
states: idle → loggingIn → authenticated | errored
        idle → registering → authenticated | errored
        authenticated → idle (LOGOUT)
context: { user: User | null, error: string | null }
```

### AgentChatMachine
```
states: idle ↔ streaming (SEND_MESSAGE / RECEIVE_CHUNK / COMPLETE / ERROR)
context: { sessionId, messages[], mode, userPreferences, currentGame, isStreaming }
```

### ScoreEntryMachine
```
states: selectGame → selectSong → enterScore → attachMedia(可选) → preview → submitting → done
每步支持 BACK 事件返回上一步
context: { game, songTitle, chartType, score, grade, recordingUrl, screenshotUrl }
```

### TrainingPlanMachine
```
states: empty → generating → review → active ⇄ paused → completed
context: { plan, checkIns[], progress }
```

### RecommendationMachine
```
states: idle → analyzing → presenting → saved | dismissed
```

---

## Part G: 信任等级系统

| 等级 | 名称 | 条件 | 权限 |
|------|------|------|------|
| 0 | 新手上路 | 注册 | 浏览，Agent 限 10 次/天 |
| 1 | 正式玩家 | 绑定 1 游戏 + 5 条成绩 | 发帖、评论、Agent 无限 |
| 2 | 资深触手 | 10 帖 + 20 赞 | 发图、b50 生成、发起联动企划 |
| 3 | 社区协管 | 活跃 90 天 + 无违规 | 编辑曲目库、审核举报、隐藏帖子 |

---

## Part H: API 接口

### 认证
- `POST /api/auth/register` — body: {username, email, password} → JWT
- `POST /api/auth/login` — body: {email, password} → JWT
- `GET /api/auth/me` — 返回当前用户信息

### Agent（SSE 流式响应）
- `POST /api/agent/chat` — body: {mode, message, sessionId?} → SSE stream
- `POST /api/agent/analyze` — body: {scoreId, screenshotUrl?} → 结构化分析 JSON
- `POST /api/agent/recommend` — body: {game} → 推荐列表
- `POST /api/agent/plan` — body: {game, goal, duration} → 训练计划

### 成绩
- `GET/POST /api/scores`
- `GET/PUT/DELETE /api/scores/:id`
- `GET /api/scores/b50?game=`

### 社区
- `GET/POST /api/posts`
- `GET /api/posts/:id`
- `GET/POST /api/posts/:id/comments`

### 社交
- `POST /api/users/follow` — {targetUserId}
- `GET /api/notifications?unread=&limit=`
- `PUT /api/notifications/:id/read`
- `GET/POST /api/messages`
- `GET /api/leaderboard?game=&chartId=`

### 认证中间件
- `middleware.ts` 对所有非公开路径校验 JWT cookie
- 公开路径：`/login`, `/register`, `/api/auth/login`, `/api/auth/register`
- API 未登录返回 401 JSON；页面未登录重定向到 /login

---

## Part I: 环境变量

```env
DATABASE_URL="postgresql://user:pass@localhost:5432/rhythm_community"
DEEPSEEK_API_KEY="sk-..."
JWT_SECRET="change-me-64-random-chars"
JWT_REFRESH_SECRET="change-me-64-random-chars"
OSS_ENDPOINT=""
OSS_BUCKET=""
OSS_ACCESS_KEY=""
OSS_SECRET_KEY=""
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

---

## Part J: 实现顺序（4 Phase，18 Task）

### Phase 1 — 核心 MVP
完成即可部署使用：认证 + Agent 对话 + 成绩录入

**Task 1.1: 项目初始化**
- `npx create-next-app@latest` 创建项目
- 安装依赖：prisma, @prisma/client, xstate@5, @xstate/react, deepseek-ai, bcryptjs, jsonwebtoken, zod
- 配置 tsconfig strict mode
- 配置 tailwind.config.ts（Part B 的色彩变量全部写入 theme.extend.colors）
- 写入 Part E 完整 Prisma Schema → `lib/db/schema.prisma`
- 创建 `.env.example`

**Task 1.2: 认证系统**
- `lib/db/prisma.ts` — Prisma Client 单例
- `lib/auth/password.ts` — bcrypt hash/verify
- `lib/auth/jwt.ts` — JWT sign/verify (access 24h + refresh 7d)
- `app/api/auth/register/route.ts` — Zod 校验 + 创建用户 + 返回 JWT
- `app/api/auth/login/route.ts` — 验证密码 + 返回 JWT
- `app/api/auth/me/route.ts` — 从 cookie 解析用户信息
- `middleware.ts` — JWT 校验，公开路径白名单
- `app/(auth)/login/page.tsx` + `app/(auth)/register/page.tsx` — 暗色表单页

**Task 1.3: 数据库 Seed**
- 运行 `npx prisma migrate dev --name init`
- `prisma/seed.ts` — 插入测试用户、50 条 GameSong、30 条 Score 样例

**Task 1.4: 全局布局 + 赛博 UI 组件**
- `app/globals.css` — CSS 变量 + body 样式 + 滚动条 + @keyframes glow-pulse
- `components/ui/ParticleBackground.tsx` — Canvas 粒子动画
- `components/ui/NeonCard.tsx`, `Button.tsx`, `Input.tsx`, `TrustBadge.tsx`
- `components/layout/Navbar.tsx` — 导航栏（桌面端 + 响应式）
- `components/layout/MobileTabBar.tsx` — 移动端底部 Tab（md:hidden）
- `components/layout/AppShell.tsx` — 全局壳组件
- 覆写 `app/layout.tsx` 使用 AppShell

**Task 1.5: DeepSeek Agent 封装**
- `lib/agent/client.ts` — fetch 封装，支持 stream 和 jsonMode
- `lib/agent/prompts/coach.txt` — 陪练 system prompt

**Task 1.6: Agent 对话 API + 前端侧边栏**
- `app/api/agent/chat/route.ts` — SSE 流式 POST handler
- `components/agent/AgentChat.tsx` — useMachine(agentChatMachine) 对话界面
- `components/agent/AgentMessage.tsx` — 消息气泡（左右对齐两种样式）
- `components/agent/ModeTabs.tsx` — 4 模式切换
- `components/agent/AgentFab.tsx` — 移动端悬浮按钮
- `components/layout/AgentSidebar.tsx` — 桌面端 380px 侧边栏 / 移动端底部 Sheet
- 修改 `app/(main)/layout.tsx` 挂载 AgentSidebar

**Task 1.7: 成绩录入向导**
- `app/api/scores/route.ts` — GET/POST API
- `machines/scoreEntry.machine.ts` — 4 步骤状态机
- `components/profile/ScoreEntryWizard.tsx` — 向导 UI（步骤指示器 + 每步表单）
- `app/(main)/profile/scores/page.tsx` — 成绩列表页

### Phase 2 — 社区基础

**Task 2.1: 帖子 CRUD + 评论区**
- `app/api/posts/route.ts` + `app/api/posts/[id]/comments/route.ts`
- `components/community/PostCard.tsx`, `CommentSection.tsx`
- `app/(main)/community/page.tsx` + `[postId]/page.tsx`

**Task 2.2: 成绩分享卡片 + 谱面讨论区**
- `components/community/ScoreCard.tsx` — 左侧判定线 + 结构化成绩
- `components/community/ChartDiscussion.tsx`
- `app/(main)/community/charts/page.tsx` + `charts/[songId]/page.tsx`

**Task 2.3: 关注 + 动态流**
- `app/api/users/follow/route.ts`
- 修改 `app/page.tsx` — 聚合关注者行为（成绩+帖子+打卡）

**Task 2.4: 信任等级 + 通知**
- `lib/trust/levels.ts` — checkLevelUp 逻辑
- `app/api/notifications/route.ts`
- Navbar 通知红点

### Phase 3 — Agent 进阶

**Task 3.1: 成绩分析**
- `lib/agent/analyzer.ts` + `lib/agent/prompts/analyzer.txt`
- `app/api/agent/analyze/route.ts` — JSON mode 结构化分析

**Task 3.2: 训练计划 + 打卡**
- `lib/agent/planner.ts` + `lib/agent/prompts/planner.txt`
- `machines/trainingPlan.machine.ts`
- `app/api/agent/plan/route.ts`

**Task 3.3: 智能推荐**
- `lib/agent/recommender.ts` + `lib/agent/prompts/recommender.txt`
- `machines/recommendation.machine.ts`
- `app/api/agent/recommend/route.ts`

**Task 3.4: 记忆学习 + 主动推送**
- `lib/agent/memory.ts` — 对话后异步提取偏好
- `lib/agent/tasks.ts` — cron 推荐 + 资讯推送

### Phase 4 — 生态完善

**Task 4.1: b50 成绩图 + 雷达图**
- Canvas 绘制 10x5 色块矩阵 + SVG 五边形雷达图
- `components/profile/B50Chart.tsx`, `SkillRadar.tsx`

**Task 4.2: 排行榜**
- `app/api/leaderboard/route.ts` + `components/leaderboard/RankingTable.tsx`

**Task 4.3: 私信**
- `app/api/messages/route.ts` + `app/(main)/messages/page.tsx`

**Task 4.4: 联动创作**
- `app/api/collabs/route.ts` + `app/(main)/community/art/page.tsx`

**Task 4.5: 曲目数据库 + 活动系统**
- `lib/games/` — 第三方 API 数据导入 + 社区 wiki 编辑
- `app/(main)/community/events/page.tsx`

---

## 附录：关键命令

```bash
npx next dev                           # 开发
npx prisma studio                      # 数据库 GUI
npx prisma migrate dev --name <name>   # 迁移
npx prisma db seed                     # 填充测试数据
npx next build                         # 构建
npx tsc --noEmit                       # 类型检查
```
