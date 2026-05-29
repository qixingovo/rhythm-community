# 音游社区平台 — 完整设计方案

> 目标消费方：Coze（扣子）AI 开发平台
> 设计日期：2026-05-26

## 1. 产品概述

垂直音游社区平台，核心卖点为内置 AI Agent（音游进阶陪练 & 数据分析）。绘画/创作作为联动配套板块。

### 1.1 核心功能

1. **AI 音游陪练 Agent**（全局侧边栏）
   - 音游圈黑话/术语咨询
   - 录入打歌成绩，Agent 分析失误点、难点段落、提升技巧
   - 针对 Arcaea / Phigros / 舞萌 等不同音游给出专项练歌计划、指法优化、难点拆解
   - 主动记忆用户偏好（爱玩的游戏、擅长难度），越用越懂用户
   - 主动任务：智能推荐谱面 + 新游/赛事资讯推送

2. **谱面 & 曲目推荐**
   - 根据段位、偏好曲风、难度，精准推荐适配新歌、隐藏谱面、练习神曲

3. **分数 & 进度规划**
   - 冲分、爬段、收歌的长期成长路线
   - 每日打卡记录进度

4. **社区功能**
   - 成绩分享卡片、谱面讨论区、b50 成绩图生成
   - 活动/比赛板块
   - 联动创作（谱面 + 原创曲 + 曲绘企划）
   - 关注 & 动态流、通知系统、私信、排行榜 & 段位

---

## 2. 技术栈

| 层 | 选型 | 说明 |
|------|------|------|
| 前端框架 | Next.js 15 App Router | 全栈 React，SSR + Server Actions |
| 语言 | TypeScript (strict mode) | Matt Pocock 风格：类型安全贯穿全栈 |
| 状态管理 | XState 5 | 有限状态机管理 Agent 对话流、表单向导等复杂状态 |
| 样式 | TailwindCSS 4 | 响应式优先 + 自定义赛博音游风主题 |
| AI Agent | DeepSeek API | deepseek-chat (对话/分析) + deepseek-vision (截图分析) |
| 数据库 | PostgreSQL | 通过 Prisma ORM 访问 |
| 认证 | 自建 bcrypt + JWT | Next.js middleware 路由保护 |
| 文件存储 | OSS（阿里云/腾讯云） | 头像上传 |
| 部署 | Vercel / Docker 单容器 | 单体 Next.js，无需微服务 |

### 2.1 Matt Pocock 风格要点

项目代码遵循以下 TypeScript 最佳实践：
- 禁止 `any` 类型，全部使用精确类型
- 使用 `satisfies` 关键字做类型收窄，而非 `as` 断言
- Prisma schema → `zod` 验证 → 前端类型自动推导
- XState 状态机用 TypeScript 泛型完整标注 context/events
- `lib/` 下所有函数显式标注入参/返回值类型

---

## 3. 架构方案

全栈 Next.js 单体应用。所有代码在一个项目中：

```
rhythm-community/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # 根布局（导航 + Agent 侧边栏 + 用户状态）
│   ├── page.tsx                  # 首页（动态 feed）
│   │
│   ├── (auth)/                   # 认证路由组（未登录可见）
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   │
│   ├── (main)/                   # 主内容路由组（需登录）
│   │   │   └── layout.tsx        # 主布局：顶部导航 + 右侧 Agent 侧边栏
│   │   │
│   │   ├── community/            # 社区板块
│   │   │   ├── page.tsx          # 帖子广场（按分类 tab）
│   │   │   ├── rhythm/           # 音游区
│   │   │   ├── art/              # 联动创作区
│   │   │   ├── charts/           # 谱面讨论区
│   │   │   ├── events/           # 活动/比赛
│   │   │   └── [postId]/page.tsx # 帖子详情 + 评论
│   │   │
│   │   ├── profile/
│   │   │   ├── page.tsx          # 个人主页（成绩墙 + 进度 + b50）
│   │   │   ├── scores/           # 成绩录入 & 管理
│   │   │   └── [userId]/page.tsx # 他人主页
│   │   │
│   │   ├── leaderboard/          # 排行榜
│   │   │   └── page.tsx
│   │   │
│   │   └── messages/             # 私信
│   │       └── page.tsx
│   │
│   └── api/                      # API Routes
│       ├── auth/
│       │   ├── login/route.ts
│       │   ├── register/route.ts
│       │   └── me/route.ts
│       ├── agent/
│       │   ├── chat/route.ts     # Agent 对话 (SSE 流式)
│       │   ├── analyze/route.ts  # 成绩分析
│       │   ├── recommend/route.ts
│       │   └── plan/route.ts     # 训练计划生成
│       ├── scores/
│       │   ├── route.ts          # 成绩 CRUD
│       │   └── b50/route.ts      # b50 图表生成
│       ├── posts/
│       │   ├── route.ts          # 帖子 CRUD
│       │   └── [id]/comments/route.ts
│       ├── users/
│       │   ├── [id]/route.ts     # 用户资料
│       │   └── follow/route.ts   # 关注操作
│       ├── notifications/route.ts
│       ├── messages/route.ts
│       └── leaderboard/route.ts
│
├── lib/                          # 核心逻辑库
│   ├── db/
│   │   ├── prisma.ts             # Prisma Client 单例
│   │   └── schema.prisma         # 数据库 schema
│   ├── auth/
│   │   ├── password.ts           # bcrypt hash/verify
│   │   ├── jwt.ts                # JWT sign/verify
│   │   └── middleware.ts         # NextAuth middleware 逻辑
│   ├── agent/
│   │   ├── client.ts             # DeepSeek SDK 封装
│   │   ├── coach.ts              # 陪练对话逻辑
│   │   ├── analyzer.ts           # 成绩数据分析
│   │   ├── recommender.ts        # 谱面推荐引擎
│   │   ├── planner.ts            # 训练计划生成器
│   │   ├── memory.ts             # 用户偏好记忆管理
│   │   ├── tasks.ts              # 主动任务调度
│   │   └── prompts/
│   │       ├── coach.txt         # 陪练 system prompt
│   │       ├── analyzer.txt
│   │       ├── recommender.txt
│   │       └── planner.txt
│   ├── games/
│   │   ├── metadata.ts           # 游戏元数据（名称、难度体系、术语表）
│   │   └── songs.ts              # 曲目数据库操作
│   ├── trust/
│   │   └── levels.ts             # 信任等级评估逻辑
│   └── utils/
│       └── format.ts             # 分数格式化、时间格式化等
│
├── components/
│   ├── layout/
│   │   ├── AppShell.tsx          # 全局布局壳
│   │   ├── Navbar.tsx            # 顶部导航
│   │   ├── MobileTabBar.tsx      # 移动端底部导航
│   │   └── AgentSidebar.tsx      # Agent 侧边栏容器
│   ├── agent/
│   │   ├── AgentChat.tsx         # 对话界面
│   │   ├── AgentMessage.tsx      # 单条消息气泡
│   │   ├── ModeTabs.tsx          # 模式切换 tabs（陪练/分析/推荐/计划）
│   │   └── AgentFab.tsx          # 侧边栏关闭时的悬浮入口
│   ├── community/
│   │   ├── PostCard.tsx          # 帖子卡片
│   │   ├── ScoreCard.tsx         # 成绩分享卡片（结构化）
│   │   ├── ChartDiscussion.tsx   # 谱面讨论组件
│   │   └── CommentSection.tsx    # 评论区
│   ├── profile/
│   │   ├── ScoreWall.tsx         # 成绩墙
│   │   ├── B50Chart.tsx          # b50 成绩图（canvas/SVG）
│   │   ├── SkillRadar.tsx        # 技能雷达图
│   │   └── ProgressTimeline.tsx  # 成长时间线
│   ├── leaderboard/
│   │   └── RankingTable.tsx      # 排行榜表格
│   └── ui/                       # 通用 UI 组件
│       ├── Button.tsx
│       ├── Input.tsx
│       ├── Modal.tsx
│       ├── TrustBadge.tsx        # 信任等级徽章
│       └── NeonCard.tsx          # 赛博发光卡片基组件
│
├── machines/                     # XState 状态机
│   ├── auth.machine.ts           # 认证流程
│   ├── agentChat.machine.ts      # Agent 对话流
│   ├── scoreEntry.machine.ts     # 成绩录入向导
│   ├── trainingPlan.machine.ts   # 训练计划生命周期
│   └── recommendation.machine.ts # 推荐引擎状态
│
└── types/                        # 共享 TypeScript 类型
    ├── agent.ts
    ├── game.ts
    ├── score.ts
    ├── user.ts
    └── community.ts
```

---

## 4. 数据模型（Prisma Schema）

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

// ============ 用户体系 ============

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
  id         String @id @default(uuid())
  userId     String @unique
  games      Json   @default("[]")    // ["Arcaea","Phigros","舞萌"]
  skillLevel Json   @default("{}")    // {"Arcaea":10.5,"Phigros":14.2}
  favGenres  Json   @default("[]")    // ["hardcore","trance","j-pop"]
  devices    Json   @default("[]")    // ["iPad Pro","键盘"]
  playStyle  String?                   // "拇指"|"食指"|"多指"|"键盘"
  weeklyGoal String?                   // "每天1小时"|"周末集中"
  updatedAt DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model TrustRole {
  id         String   @id @default(uuid())
  userId     String   @unique
  level      Int      @default(0)   // 0=新手上路 1=正式玩家 2=资深触手 3=社区协管
  unlockedAt DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}

// ============ 成绩体系 ============

model Score {
  id            String   @id @default(uuid())
  userId        String
  game          String               // "Arcaea"|"Phigros"|"舞萌"
  songTitle     String
  chartType     String?              // "FTR"|"ETR"|"BYD"|"IN"|"AT"|"MASTER"
  chartLevel    String               // "10"|"15"|"13+"
  score         Int                  // 原始分数
  grade         String?              // "AA"|"EX"|"PM"|"AP"
  perfectCount  Int?
  greatCount    Int?
  missCount     Int?
  recordingUrl  String?              // YouTube/B站 外链
  screenshotUrl String?              // 分数截图
  notes         String?
  agentAnalysis Json?                // Agent 分析结果缓存
  isPublic      Boolean @default(true)
  createdAt     DateTime @default(now())

  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  checkIn    CheckIn?

  @@index([userId, game])
  @@index([userId, createdAt])
}

model B50Snapshot {
  id          String   @id @default(uuid())
  userId      String
  game        String
  imageUrl    String?               // 生成的 b50 图表图片 URL
  data        Json                   // Top50 分数原始数据
  generatedAt DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}

// ============ 训练体系 ============

model TrainingPlan {
  id            String   @id @default(uuid())
  userId        String
  game          String
  title         String
  goal          String               // "冲分"|"爬段"|"收歌"|"全曲PM"
  dailyPlan     Json                 // [{day:1, task:"...", targetScore:..., songId:...}, ...]
  progress      Float    @default(0) // 0-100
  startDate     DateTime
  endDate       DateTime?
  isActive      Boolean  @default(true)
  createdAt     DateTime @default(now())

  user     User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  checkIns CheckIn[]
}

model CheckIn {
  id       String   @id @default(uuid())
  userId   String
  planId   String?
  date     DateTime
  game     String?
  scoreId  String?              // 关联成绩
  note     String?
  createdAt DateTime @default(now())

  user  User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  plan  TrainingPlan? @relation(fields: [planId], references: [id])
  score Score?        @relation(fields: [scoreId], references: [id])
}

// ============ 社区体系 ============

model Post {
  id        String   @id @default(uuid())
  userId    String
  category  String               // "rhythm"|"chart_discuss"|"art"|"event"|"general"
  title     String
  content   String
  tags      String[] @default([])
  game      String?              // 关联音游
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
  parentId  String?              // 回复评论
  createdAt DateTime @default(now())

  post    Post      @relation(fields: [postId], references: [id], onDelete: Cascade)
  user    User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  parent  Comment?  @relation("CommentReplies", fields: [parentId], references: [id])
  replies Comment[] @relation("CommentReplies")
}

// ============ 社交体系 ============

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
  type      String               // "reply"|"mention"|"like"|"follow"|"system"|"agent_push"
  content   String
  relatedId String?              // 关联帖子/评论/用户 ID
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

// ============ 联动创作 ============

model CollabProject {
  id        String   @id @default(uuid())
  title     String
  type      String               // "chart"|"music"|"art"|"mixed"
  desc      String
  status    String   @default("recruiting")  // "recruiting"|"in_progress"|"done"
  createdAt DateTime @default(now())

  members CollabMember[]
}

model CollabMember {
  id        String   @id @default(uuid())
  projectId String
  userId    String
  role      String               // "creator"|"charter"|"composer"|"illustrator"

  project CollabProject @relation(fields: [projectId], references: [id], onDelete: Cascade)
  user    User          @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([projectId, userId])
}

// ============ Agent 体系 ============

model AgentSession {
  id        String   @id @default(uuid())
  userId    String
  mode      String               // "coach"|"analysis"|"recommend"|"plan"
  messages  Json                 // [{role, content, timestamp}]
  summary   String?              // 对话摘要，供快速回顾
  createdAt DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model AgentTask {
  id        String    @id @default(uuid())
  userId    String
  type      String                // "recommendation"|"news_push"|"plan_reminder"
  title     String
  detail    String?
  triggerAt DateTime?
  status    String    @default("pending")  // "pending"|"done"|"cancelled"
  createdAt DateTime  @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}

// ============ 曲目数据库 ============

model GameSong {
  id            String   @id @default(uuid())
  game          String
  title         String
  aliases       String[] @default([])  // 中文译名/俗称
  artist        String
  bpm           Int?
  difficulty    Json                   // {"FTR":10,"ETR":9,"BYD":11,...}
  genre         String?
  packName      String?               // 曲包名称
  sourceType    String   @default("api_import")  // "api_import"|"community"
  communityNote String?               // 玩家补充的说明
  createdAt     DateTime @default(now())

  @@unique([game, title])
  @@index([game, genre])
}

// ============ 排行榜 ============

model LeaderboardEntry {
  id        String   @id @default(uuid())
  game      String
  chartId   String?              // 可选按谱面排行
  entries   Json                 // [{userId, username, avatar, score, rank}]
  updatedAt DateTime @default(now())

  @@index([game, updatedAt])
}
```

---

## 5. XState 状态机设计

### 5.1 AuthMachine

```
states:
  idle
    ├── on LOGIN → loggingIn
    └── on REGISTER → registering
  loggingIn
    ├── on SUCCESS → authenticated (设置 JWT cookie)
    └── on ERROR → idle (显示错误)
  registering
    ├── on SUCCESS → authenticated
    └── on ERROR → idle
  authenticated
    └── on LOGOUT → idle (清除 JWT)

context: { user: User | null, error: string | null }
```

### 5.2 AgentChatMachine

```
states:
  idle                  # 等待用户输入
    └── on SEND_MESSAGE → streaming (发送消息到 /api/agent/chat)
  streaming             # SSE 流式接收
    ├── on RECEIVE_CHUNK → streaming (追加内容到当前消息)
    ├── on COMPLETE → idle (保存到 AgentSession)
    └── on ERROR → idle (显示错误，允许重试)

context: {
  sessionId: string,
  messages: Message[],
  mode: "coach"|"analysis"|"recommend"|"plan",
  userPreferences: UserPreference,
  currentGame: string | null,
  isStreaming: boolean
}
```

### 5.3 ScoreEntryMachine

```
states:
  selectGame            # 选游戏
    └── on NEXT → selectSong
  selectSong            # 选曲目（搜索/自动补全）
    └── on NEXT → enterScore
  enterScore            # 填分数详情
    └── on NEXT → attachMedia (可选)
    └── on SKIP → preview
  attachMedia           # 贴外链 / 截图
    └── on NEXT → preview
  preview               # 确认预览
    └── on SUBMIT → submitting
    └── on BACK → enterScore
  submitting
    ├── on SUCCESS → done
    └── on ERROR → preview

context: {
  game: string | null,
  songTitle: string | null,
  chartType: string | null,
  score: number | null,
  grade: string | null,
  recordingUrl: string | null,
  screenshotUrl: string | null
}
```

### 5.4 TrainingPlanMachine

```
states:
  empty
    └── on GENERATE → generating
  generating            # Agent 生成计划中
    ├── on RECEIVED → review
    └── on ERROR → empty
  review                # 用户确认/调整
    ├── on CONFIRM → active
    └── on REGENERATE → generating
  active                # 执行中
    ├── on CHECK_IN → active (记录打卡)
    ├── on UPDATE_PROGRESS → active
    ├── on PAUSE → paused
    └── on COMPLETE → completed
  paused
    └── on RESUME → active
  completed

context: {
  plan: TrainingPlan | null,
  checkIns: CheckIn[],
  progress: number
}
```

### 5.5 RecommendationMachine

```
states:
  idle
    └── on ANALYZE → analyzing
  analyzing             # Agent 分析用户数据
    ├── on PRESENT → presenting
    └── on ERROR → idle
  presenting            # 展示推荐结果
    ├── on SAVE → saved
    └── on DISMISS → idle
  saved
```

---

## 6. DeepSeek Agent 架构

### 6.1 API 调用封装

```
lib/agent/client.ts

功能：
- 初始化 DeepSeek 客户端（API Key 环境变量注入）
- 统一错误处理和重试
- 支持 streaming (SSE) 和 JSON mode
- 请求/响应日志

关键方法：
  createChatCompletion(messages, options): Promise<StreamingResponse>
  createJSONCompletion(messages, schema): Promise<T>
```

### 6.2 陪练对话（coach.ts）

系统提示词注入顺序：
1. 角色设定：音游进阶教练，精通 Arcaea / Phigros / 舞萌
2. 专业领域：术语解释、手法指导、谱面拆解
3. 用户画像：从 UserPreference 注入当前用户的游戏/段位/偏好
4. 近期成绩：最近 20 条 Score 记录注入上下文
5. 对话约束：简洁、专业、给出可操作建议

### 6.3 成绩分析（analyzer.ts）

输入：
- 成绩数据（分数、精度、Miss 分布）
- 可选：分数截图（deepseek-vision 分析）
- 可选：谱面录像链接（用户提供时间戳标注）

输出（JSON mode）：
```json
{
  "overall": "综合评价",
  "strengths": ["擅长段落", "优势手型"],
  "weaknesses": ["失误集中段落", "瓶颈模式"],
  "suggestions": ["针对性练习", "指法调整建议", "推荐练习曲"],
  "drillPlan": ["练习1: ...", "练习2: ..."]
}
```

### 6.4 谱面推荐（recommender.ts）

推荐策略：
1. 分析 UserPreference.skillLevel 定位段位
2. 分析最近 Score 找出高分曲（擅长风格）和低分曲（短板领域）
3. 结合 UserPreference.favGenres 偏好
4. 调用 deepseek-chat 生成推荐列表
5. 结果映射回 GameSong 表获取完整曲目信息

### 6.5 训练计划（planner.ts）

生成逻辑：
1. 用户设定目标（冲分 / 爬段 / 收歌 / 全曲PM）
2. Agent 分析当前 Skill Level 和目标差距
3. 输出 7/14/30 天计划：每日任务、目标曲目、预期提升
4. 用户确认后创建 TrainingPlan + CheckIn

### 6.6 用户记忆（memory.ts）

自动学习机制：
- 每次 Agent 对话结束后，提取用户透露的信息
- 调用 deepseek-chat (JSON mode) 提取结构化偏好：
  ```json
  { "game": "Arcaea", "level": 10.8, "genres": ["hardcore"], "device": "iPad" }
  ```
- 增量更新 UserPreference，保留已有数据
- 下次会话自动注入，无需用户重复说明

### 6.7 主动任务（tasks.ts）

两种触发方式：

**定时任务（cron）**：
- 每日智能推荐：检查用户最近 7 天成绩 → 发现瓶颈 → 生成推荐 → 推送通知
- 每周资讯聚合：爬取音游新闻源 → Agent 筛选用户相关 → 推送通知

**事件触发**：
- 用户录入新成绩后 → Agent 分析 → 即时反馈 + 推荐下一步
- 训练计划到期 → 提醒打卡
- 联动企划状态变更 → 通知参与者

### 6.8 System Prompt 模板

文件结构：
```
lib/agent/prompts/
├── coach.txt        # 陪练对话
├── analyzer.txt     # 成绩分析（含 JSON 输出格式）
├── recommender.txt  # 谱面推荐
└── planner.txt      # 训练计划生成
```

每个 prompt 模板文件包含：
- 角色定义
- 知识范围（音游专业术语表内嵌）
- 输出格式约束
- 示例问答（few-shot）

---

## 7. 赛博音游风 UI 设计系统

### 7.1 CSS 变量（TailwindCSS 主题）

```css
:root {
  --bg-primary:    #0a0a0f;   /* 最深背景 */
  --bg-secondary:  #12121a;   /* 卡片底色 */
  --bg-tertiary:   #1a1a2e;   /* 悬浮层 */
  --accent-neon:   #00f0ff;   /* 赛博青 — 主强调色 */
  --accent-purple: #b347ea;   /* Arcaea 意向 */
  --accent-orange: #ff6b35;   /* Phigros 意向 */
  --accent-blue:   #00bfff;   /* 舞萌意向 */
  --accent-pink:   #ff69b4;
  --text-primary:  #e0e0e0;
  --text-secondary:#a0a0b0;
  --text-dim:      #6b6b7a;
  --border:        #1e1e30;
  --success:       #00ff88;
  --warning:       #ffcc00;
  --error:         #ff4444;
  --glow-radius:   0 0 8px;
}
```

### 7.2 视觉元素

| 元素 | 实现方式 |
|------|----------|
| 全局粒子背景 | Canvas 层，缓慢流动的发光粒子 |
| 卡片 hover | box-shadow 霓虹发光，transition 150ms |
| 成绩卡片装饰 | 左侧垂直"判定线"装饰条，颜色对应成绩等级 |
| 分数动画 | CSS @keyframes 数字跳动 + 判定文字闪动 |
| 导航 | 半透明磨砂玻璃效果（backdrop-blur） |
| 标签/徽章 | 细边框 + neon 色，圆角 |
| 输入框 | 暗底 + 霓虹 focus 边框发光 |

### 7.3 响应式策略

| 断点 | 布局 |
|------|------|
| >= 1280px | 侧边导航 + 主内容 + Agent 侧边栏（380px）三栏 |
| 768px - 1279px | 顶部导航 + 主内容，Agent 侧边栏宽度 320px，可折叠 |
| < 768px | 底部 Tab Bar + 全宽内容，Agent 变为底部 Sheet，上滑展开 |

### 7.4 关键页面布局

**首页（/）**
```
┌──────────────────────────────────────────────────┐
│  [Logo] 社区  谱面讨论  排行榜  [Agent] [🔔][👤] │
├──────────────────────────────────────────────────┤
│  动态流（关注者的新成绩、发帖、打卡）              │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐             │
│  │ 成绩卡片 │ │ 谱面讨论 │ │ 联动招募 │             │
│  └─────────┘ └─────────┘ └─────────┘             │
│  ┌─────────┐ ┌─────────┐                         │
│  │ 打卡记录 │ │ 帖子    │                         │
│  └─────────┘ └─────────┘                         │
└──────────────────────────────────────────────────┘
```

**个人主页（/profile）**
```
┌──────────────────────────────────────────────────┐
│  [头像] 用户名  ⭐信任等级  关注/粉丝              │
│  ─────────────────────────────                    │
│  [Tab: 成绩墙 | b50图 | 训练进度 | 帖子]           │
│  ┌─────────────────────────────────────┐          │
│  │  Skill Radar 雷达图                 │          │
│  │         accuracy                    │          │
│  │     rhythm    /  \   speed          │          │
│  │             /    \                  │          │
│  │    reading /______\ stamina         │          │
│  │            accuracy                 │          │
│  └─────────────────────────────────────┘          │
│  ┌───┐ ┌───┐ ┌───┐ ┌───┐                        │
│  │PM │ │EX │ │AA │ │EX │  成绩卡片瀑布流          │
│  └───┘ └───┘ └───┘ └───┘                        │
└──────────────────────────────────────────────────┘
```

**Agent 侧边栏**
```
┌──────────────────────┐
│  [陪练|分析|推荐|计划] │  ← ModeTabs
├──────────────────────┤
│                      │
│  💬 AI: 你的 Phigros │
│  IN15 精度偏低，建议 │
│  先练交叉手基础功... │
│                      │
│  ──────────────────  │
│  10分钟前            │
│  👤: 我 Arcaea 10.5  │
│  瓶颈了，怎么突破？   │
│                      │
│  💬 AI: 10.5 突破    │
│  通常需要...         │
│                      │
├──────────────────────┤
│  [输入框________] [→]│
└──────────────────────┘
```

---

## 8. 信任等级系统

| 等级 | 名称 | 解锁条件 | 权限 |
|------|------|----------|------|
| 0 | 新手上路 | 注册 | 浏览、Agent 限 10 次/天 |
| 1 | 正式玩家 | 绑定 1 个游戏 + 录入 5 条成绩 | 发帖、评论、Agent 无限 |
| 2 | 资深触手 | 发帖 10 篇 + 收到 20 赞 | 发图片、生成 b50、发起联动企划 |
| 3 | 社区协管 | 活跃 90 天 + 无违规记录 | 编辑曲目库、审核举报、隐藏帖子 |

评估逻辑（`lib/trust/levels.ts`）：
- 每次关键操作后检查用户是否满足晋级条件
- 满足条件时自动升级 + 推送通知
- 协管（等级3）需要手动审核

---

## 9. API 接口设计

### 9.1 认证

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/auth/register | 注册（username, email, password → JWT） |
| POST | /api/auth/login | 登录（email, password → JWT） |
| GET | /api/auth/me | 获取当前用户信息 |

### 9.2 Agent（SSE 流式响应）

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/agent/chat | 对话（streaming SSE），body: { mode, message, sessionId? } |
| POST | /api/agent/analyze | 成绩分析，body: { scoreId, screenshotUrl? } |
| POST | /api/agent/recommend | 谱面推荐，body: { game } |
| POST | /api/agent/plan | 训练计划生成，body: { game, goal, duration } |

### 9.3 成绩

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/scores?game=&limit=&offset= | 列表 |
| POST | /api/scores | 录入 |
| GET | /api/scores/:id | 详情 |
| PUT | /api/scores/:id | 编辑 |
| DELETE | /api/scores/:id | 删除 |
| GET | /api/scores/b50?game= | 获取 b50 数据 |

### 9.4 社区

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/posts?category=&game=&limit= | 帖子列表 |
| POST | /api/posts | 发帖 |
| GET | /api/posts/:id | 帖子详情 |
| GET | /api/posts/:id/comments | 评论列表 |
| POST | /api/posts/:id/comments | 评论 |

### 9.5 社交

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/users/follow | 关注/取关，body: { targetUserId } |
| GET | /api/notifications?unread=&limit= | 通知列表 |
| PUT | /api/notifications/:id/read | 标记已读 |
| GET | /api/messages?userId= | 私信列表 |
| POST | /api/messages | 发送私信 |
| GET | /api/leaderboard?game=&chartId= | 排行榜 |

---

## 10. 安全措施

| 项目 | 实现 |
|------|------|
| 密码加密 | bcrypt，salt rounds = 12 |
| JWT | access token 24h + refresh token 7d，httpOnly cookie |
| API 鉴权 | middleware 校验 JWT，未登录返回 401 |
| XSS 防护 | 帖子内容输出时 HTML 实体转义 |
| SQL 注入 | Prisma ORM 参数化查询 |
| 频率限制 | API Routes 加 rate limiter（Agent 接口 30 req/min） |
| 文件上传 | 仅允许图片格式（jpg/png/webp），大小限制 5MB |
| CSRF | SameSite=Strict cookie + CSRF token |

---

## 11. 开发分期

### Phase 1 — 核心 MVP（优先实现）

- [ ] 认证系统（注册/登录/JWT/middleware）
- [ ] Agent 侧边栏 + 基础陪练对话（DE 流式）
- [ ] 成绩录入向导（XState 状态机）
- [ ] 成绩列表/详情
- [ ] Agent 成绩分析
- [ ] 数据库 migration + seed

### Phase 2 — 社区基础

- [ ] 帖子 CRUD + 评论
- [ ] 关注 + 动态流
- [ ] 谱面讨论区
- [ ] 信任等级系统
- [ ] 通知系统

### Phase 3 — Agent 进阶

- [ ] 训练计划生成 + 打卡
- [ ] 智能推荐引擎
- [ ] 主动资讯推送（cron）
- [ ] 用户记忆自动学习
- [ ] 分数截图分析（Vision API）

### Phase 4 — 生态完善

- [ ] b50 成绩图生成（Canvas/SVG）
- [ ] 排行榜
- [ ] 私信系统
- [ ] 联动创作板块
- [ ] 活动/比赛系统
- [ ] 曲目数据库（API 导入 + 社区编辑）
- [ ] Skill Radar 雷达图

---

## 12. 环境变量

```env
# 数据库
DATABASE_URL="postgresql://user:pass@localhost:5432/rhythm_community"

# DeepSeek API
DEEPSEEK_API_KEY="sk-..."
DEEPSEEK_BASE_URL="https://api.deepseek.com"

# JWT
JWT_SECRET="..."            # 随机 64 位字符串
JWT_REFRESH_SECRET="..."    # 随机 64 位字符串

# OSS（头像上传）
OSS_ENDPOINT="..."
OSS_BUCKET="..."
OSS_ACCESS_KEY="..."
OSS_SECRET_KEY="..."

# 应用
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```
