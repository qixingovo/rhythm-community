# 音游社区平台 — 实现计划

> **目标消费方：Coze（扣子）AI 开发平台**
> **关联 Spec：** `docs/superpowers/specs/2026-05-26-rhythm-community-design.md`
> **说明：** 本计划面向 Coze 执行。每个 Task 描述了要创建/修改的文件、关键代码结构、数据流和验证方法。不要求 TDD（Coze 不适合做 TDD），但每个 Task 完成后需有明确的验证方式。

**Goal:** 构建一个 Next.js 全栈音游社区平台，内置 DeepSeek API 驱动的 AI 陪练 Agent。

**Architecture:** 单体 Next.js 15 App Router 应用，XState 5 管理复杂状态（Agent 对话流、成绩录入向导），Prisma + PostgreSQL 数据层，TailwindCSS 4 赛博音游风 UI，Agent 通过 SSE 流式响应。

**Tech Stack:** Next.js 15, TypeScript strict, XState 5, TailwindCSS 4, Prisma + PostgreSQL, DeepSeek API, bcrypt + JWT, Canvas API (b50 图表)

**Phase 顺序：** Phase 1 (MVP) → Phase 2 (社区) → Phase 3 (Agent 进阶) → Phase 4 (生态)

---

# Phase 1：核心 MVP

> 目标：认证 + Agent 对话 + 成绩录入。Phase 1 结束后应用可部署、可用。

---

### Task 1.1: 项目初始化与环境配置

**文件：**
- 创建：项目根目录（`rhythm-community/` 下全部初始化文件）
- 创建：`package.json`
- 创建：`tsconfig.json`
- 创建：`tailwind.config.ts`
- 创建：`.env.example`
- 创建：`lib/db/schema.prisma`

**步骤：**

- [ ] **Step 1: 初始化 Next.js 项目**

执行：
```bash
npx create-next-app@latest rhythm-community --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*"
cd rhythm-community
```

- [ ] **Step 2: 安装依赖**

```bash
npm install prisma @prisma/client xstate@5 @xstate/react deepseek-ai bcryptjs jsonwebtoken zod
npm install -D @types/bcryptjs @types/jsonwebtoken
```

- [ ] **Step 3: 配置 TypeScript strict mode**

`tsconfig.json` 确保以下字段：
```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noPropertyAccessFromIndexSignature": true,
    "exactOptionalPropertyTypes": false,
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "moduleResolution": "bundler"
  }
}
```

- [ ] **Step 4: 配置 TailwindCSS 赛博音游风主题**

`tailwind.config.ts`:
```typescript
import type { Config } from "tailwindcss"

const config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: "#0a0a0f",
          secondary: "#12121a",
          tertiary: "#1a1a2e",
        },
        neon: {
          cyan: "#00f0ff",
          purple: "#b347ea",
          orange: "#ff6b35",
          blue: "#00bfff",
          pink: "#ff69b4",
        },
        text: {
          primary: "#e0e0e0",
          secondary: "#a0a0b0",
          dim: "#6b6b7a",
        },
        border: "#1e1e30",
        success: "#00ff88",
        warning: "#ffcc00",
        error: "#ff4444",
      },
      boxShadow: {
        "neon-cyan": "0 0 12px rgba(0, 240, 255, 0.3)",
        "neon-purple": "0 0 12px rgba(179, 71, 234, 0.3)",
        "neon-orange": "0 0 12px rgba(255, 107, 53, 0.3)",
      },
      backdropBlur: {
        navbar: "12px",
      },
    },
  },
  plugins: [],
} satisfies Config

export default config
```

- [ ] **Step 5: 初始化 Prisma**

将 Spec 中的完整 Prisma Schema 写入 `lib/db/schema.prisma`，然后执行：
```bash
npx prisma generate
```

数据库 migration 在后续 Task（数据库 seed）中执行。

- [ ] **Step 6: 创建 .env.example**

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

- [ ] **Step 7: 验证**

```bash
npx prisma validate
npx next build
```

预期：Prisma schema 校验通过，Next.js 能成功编译（页面为空但无报错）。

---

### Task 1.2: 认证系统（bcrypt + JWT + middleware）

**文件：**
- 创建：`lib/db/prisma.ts`
- 创建：`lib/auth/password.ts`
- 创建：`lib/auth/jwt.ts`
- 创建：`lib/auth/middleware.ts`
- 创建：`app/api/auth/register/route.ts`
- 创建：`app/api/auth/login/route.ts`
- 创建：`app/api/auth/me/route.ts`
- 创建：`(auth)/layout.tsx`
- 创建：`(auth)/login/page.tsx`
- 创建：`(auth)/register/page.tsx`
- 创建：`middleware.ts`（根目录）

**步骤：**

- [ ] **Step 1: Prisma Client 单例**

`lib/db/prisma.ts`:
```typescript
import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
```

- [ ] **Step 2: bcrypt 工具**

`lib/auth/password.ts`:
```typescript
import bcrypt from "bcryptjs"

const SALT_ROUNDS = 12

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}
```

- [ ] **Step 3: JWT 工具**

`lib/auth/jwt.ts`:
```typescript
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET!
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!
const ACCESS_TOKEN_EXPIRY = "24h"
const REFRESH_TOKEN_EXPIRY = "7d"

export interface JWTPayload {
  userId: string
  username: string
}

export function signAccessToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY })
}

export function signRefreshToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY })
}

export function verifyAccessToken(token: string): JWTPayload {
  return jwt.verify(token, JWT_SECRET) as JWTPayload
}

export function verifyRefreshToken(token: string): JWTPayload {
  return jwt.verify(token, JWT_REFRESH_SECRET) as JWTPayload
}
```

- [ ] **Step 4: 注册 API**

`app/api/auth/register/route.ts`:
- POST handler，接收 `{ username, email, password }`
- Zod 校验：username 3-20 字符，email 合法格式，password 8+ 字符
- 检查 username/email 唯一性
- hashPassword → prisma.user.create
- 返回 `{ accessToken, refreshToken }`，设置 httpOnly cookie

- [ ] **Step 5: 登录 API**

`app/api/auth/login/route.ts`:
- POST handler，接收 `{ email, password }`
- prisma.user.findUnique → verifyPassword
- 返回 JWT tokens
- 失败返回 401 `{ error: "邮箱或密码错误" }`

- [ ] **Step 6: 获取当前用户 API**

`app/api/auth/me/route.ts`:
- GET handler
- 从 cookie 中取 accessToken → verifyAccessToken
- prisma.user.findUnique（include trustRole, preferences）
- 返回用户信息（不含 passwordHash）

- [ ] **Step 7: Auth Middleware**

`middleware.ts`（项目根目录）:
```typescript
import { NextRequest, NextResponse } from "next/server"
import { verifyAccessToken } from "@/lib/auth/jwt"

const PUBLIC_PATHS = ["/login", "/register", "/api/auth/login", "/api/auth/register"]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (PUBLIC_PATHS.some(p => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  const token = request.cookies.get("accessToken")?.value
  if (!token) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "未登录" }, { status: 401 })
    }
    return NextResponse.redirect(new URL("/login", request.url))
  }

  try {
    verifyAccessToken(token)
    return NextResponse.next()
  } catch {
    const response = pathname.startsWith("/api/")
      ? NextResponse.json({ error: "token 过期" }, { status: 401 })
      : NextResponse.redirect(new URL("/login", request.url))
    response.cookies.delete("accessToken")
    return response
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
```

- [ ] **Step 8: 登录/注册页面**

`app/(auth)/login/page.tsx` — 登录表单（email + password），POST 到 `/api/auth/login`，成功后跳转首页。
`app/(auth)/register/page.tsx` — 注册表单（username + email + password），POST 到 `/api/auth/register`，成功后跳转首页。

表单组件用 TailwindCSS 暗色主题样式：深底、霓虹 cyan 边框 focus 发光。

`app/(auth)/layout.tsx` — 认证页面布局：居中卡片 + 粒子背景。

- [ ] **Step 9: 验证**

```bash
# 注册
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@test.com","password":"test1234"}'
# 预期：返回 accessToken + refreshToken

# 登录
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test1234"}'
# 预期：返回 accessToken

# 未登录访问受保护页面
curl http://localhost:3000/api/auth/me
# 预期：401 "未登录"
```

---

### Task 1.3: 数据库 Migration & Seed

**文件：**
- 创建：`prisma/migrations/`（Prisma 自动生成）
- 创建：`prisma/seed.ts`

**步骤：**

- [ ] **Step 1: 运行首次 migration**

```bash
npx prisma migrate dev --name init
```

- [ ] **Step 2: 编写 seed 脚本**

`prisma/seed.ts` 插入：
- 3 个测试用户（testuser1/2/3，密码都是 "test1234"）
- 30 条测试成绩（覆盖 Arcaea/Phigros/舞萌）
- 50 条 GameSong 测试数据（每种游戏各 15-20 首，包含 FTR/IN/MASTER 难度）
- 1 个测试训练计划
- 5 条测试帖子 + 10 条评论
- 每个用户设置 UserPreference

`package.json` 添加：
```json
{
  "prisma": {
    "seed": "tsx prisma/seed.ts"
  }
}
```

- [ ] **Step 3: 运行 seed**

```bash
npx prisma db seed
```

- [ ] **Step 4: 验证**

```bash
npx prisma studio
# 浏览器打开确认所有表有数据
```

---

### Task 1.4: 全局布局壳 + 赛博音游风基础组件

**文件：**
- 创建：`app/layout.tsx`（覆盖默认）
- 创建：`app/page.tsx`（首页占位）
- 创建：`components/ui/NeonCard.tsx`
- 创建：`components/ui/Button.tsx`
- 创建：`components/ui/Input.tsx`
- 创建：`components/ui/Modal.tsx`
- 创建：`components/ui/ParticleBackground.tsx`
- 创建：`components/ui/TrustBadge.tsx`
- 创建：`components/layout/AppShell.tsx`
- 创建：`components/layout/Navbar.tsx`
- 创建：`components/layout/MobileTabBar.tsx`
- 创建：`app/globals.css`（全局样式 + CSS 变量）

**步骤：**

- [ ] **Step 1: 全局 CSS 变量**

`app/globals.css` 定义所有 CSS 自定义属性（Spec 第 7.1 节），加上：
- `body` 默认 bg-primary text-primary
- 滚动条样式（暗色细条）
- `@keyframes glow-pulse` 霓虹脉冲动画
- `@keyframes particle-float` 粒子浮动动画

- [ ] **Step 2: 粒子背景组件**

`components/ui/ParticleBackground.tsx`:
- Canvas 全屏固定背景层
- 渲染 50-80 个缓慢浮动的发光小圆点
- 粒子间距离 < 150px 时绘制半透明连接线
- `pointer-events-none` 不阻挡交互
- 使用 `requestAnimationFrame` 循环
- Canvas resize 监听窗口大小变化

- [ ] **Step 3: 基础 UI 组件**

`components/ui/NeonCard.tsx`:
```typescript
interface NeonCardProps {
  children: React.ReactNode
  className?: string
  accentColor?: "cyan" | "purple" | "orange" | "blue" | "pink"
  hoverGlow?: boolean
  onClick?: () => void
}
```
- 默认 bg-secondary，border border-border，rounded-lg
- hoverGlow 为 true 时 hover 添加对应颜色的 neon shadow
- 用 `satisfies` 关键字做 accentColor 的样式映射

`components/ui/Button.tsx`:
- variant: "primary"（neon cyan 填充）| "secondary"（透明+边框）| "ghost"
- size: "sm" | "md" | "lg"
- disabled 状态灰色
- loading 状态显示 spinner

`components/ui/Input.tsx`:
- 暗底 + border，focus 时 border-neon/cyan + glow
- error 时 border-error
- 支持 label、helperText、leftIcon

`components/ui/TrustBadge.tsx`:
- 接收 level: 0-3
- 显示对应徽章：灰/铜/银/金色 + 等级名称

- [ ] **Step 4: 导航组件**

`components/layout/Navbar.tsx`:
```
桌面端（>= 768px）：
[Logo] [社区] [谱面讨论] [排行榜] ──────────── [🔔][💬 Agent][👤 头像]

移动端（< 768px）：
隐藏，用 MobileTabBar 替代
```
- Logo 用 neon cyan 色字体
- 当前页面链接高亮
- 通知图标显示未读红点
- 用户头像点击展开下拉菜单（我的主页 / 设置 / 退出）

`components/layout/MobileTabBar.tsx`:
- 固定在底部的 5 个 tab：[首页] [社区] [录入+] [通知] [我的]
- 中间的"录入+"按钮用 neon cyan 圆形突出
- `md:hidden` 仅在移动端显示

- [ ] **Step 5: AppShell**

`components/layout/AppShell.tsx`:
```typescript
// 布局结构
<div className="min-h-screen bg-bg-primary">
  <ParticleBackground />
  <Navbar />
  <main className="...">
    {children}
  </main>
  <MobileTabBar />
  {/* AgentSidebar 占位，Phase 1 后续 Task 实现 */}
</div>
```

- [ ] **Step 6: 覆写 layout.tsx**

`app/layout.tsx`:
```typescript
import type { Metadata } from "next"
import { AppShell } from "@/components/layout/AppShell"
import "./globals.css"

export const metadata: Metadata = {
  title: "Rhythm Community — 音游玩家社区",
  description: "AI 陪练 · 成绩分析 · 谱面推荐 · 音游交流",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  )
}
```

`app/(main)/layout.tsx`:
```typescript
// 登录用户的布局：包含 AgentSidebar
// Phase 1 后续 Task 实现
export default function MainLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</> // 当前占位，后续加 AgentSidebar
}
```

- [ ] **Step 7: 查看效果**

```bash
npx next dev
# 打开 http://localhost:3000
# 确认：暗色背景、粒子动画、导航栏可见
```

---

### Task 1.5: DeepSeek Agent 核心封装

**文件：**
- 创建：`lib/agent/client.ts`
- 创建：`lib/agent/prompts/coach.txt`

**步骤：**

- [ ] **Step 1: DeepSeek Client 封装**

`lib/agent/client.ts`:
```typescript
// 基于 openai-compatible SDK（DeepSeek 兼容 OpenAI 格式）
// 使用 fetch 直接调用 DeepSeek API（避免额外依赖）

const DEEPSEEK_BASE_URL = "https://api.deepseek.com/v1"
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY!

interface ChatMessage {
  role: "system" | "user" | "assistant"
  content: string
}

interface ChatCompletionOptions {
  model?: string           // 默认 "deepseek-chat"
  temperature?: number     // 默认 0.7
  maxTokens?: number       // 默认 2048
  stream?: boolean         // 默认 false
  jsonMode?: boolean       // 默认 false
}

export async function createChatCompletion(
  messages: ChatMessage[],
  options: ChatCompletionOptions = {}
): Promise<Response> {
  // POST https://api.deepseek.com/v1/chat/completions
  // Authorization: Bearer $DEEPSEEK_API_KEY
  // body: { model, messages, temperature, max_tokens, stream, response_format }
  // jsonMode 时 response_format: { type: "json_object" }
  // stream 时返回原始 Response（SSE ReadableStream）
  // 非 stream 时返回 Response.json()
}
```

关键实现细节：
- 使用 `fetch()` API（Next.js 原生支持，无需额外库）
- 错误处理：DeepSeek API 返回非 2xx 时，抛出带状态码的错误
- 超时设置：30s
- 流式模式：返回 Response 对象，由 API Route 的 ReadableStream 消费

- [ ] **Step 2: 陪练 System Prompt**

`lib/agent/prompts/coach.txt`:
```
你是一个音游进阶陪练 AI，精通以下游戏：
- Arcaea（韵律源点）：单键/长条/蛇形/天键，PST/PRS/FTR/ETR/BYD 难度
- Phigros（扉格若斯）：下落式 + 判定线移动，EZ/HD/IN/AT 难度
- 舞萌（maimai DX）：触摸屏圆形判定，BASIC/ADVANCED/EXPERT/MASTER/Re:MASTER

你的能力：
1. 解释音游术语和黑话（如"越级""纵连""交互""出张""全押""癖"等）
2. 分析打歌成绩，找出失误集中段落和提升技巧
3. 针对具体谱面给出指法优化建议
4. 根据用户水平推荐适合练习的曲目

回复规则：
- 简洁直接，给出可操作建议
- 引用具体谱面段落时标注时间戳（如"1:05-1:15 段落的纵连用右手主导"）
- 如果用户没说游戏/难度，先问清楚再给建议
- 不要给出"多练"这种废话，要具体到练哪首曲、练什么手法

当前用户信息：
{userProfile}
```

- [ ] **Step 3: 测试 Agent 调用**

```bash
# 手工 curl 测试 DeepSeek API 连通性
curl https://api.deepseek.com/v1/chat/completions \
  -H "Authorization: Bearer $DEEPSEEK_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model":"deepseek-chat","messages":[{"role":"user","content":"解释音游术语越级是什么意思"}],"stream":false}'
# 预期：返回 JSON，choices[0].message.content 包含解释
```

---

### Task 1.6: Agent 对话 API（SSE 流式）+ 前端侧边栏

**文件：**
- 创建：`app/api/agent/chat/route.ts`
- 创建：`components/layout/AgentSidebar.tsx`
- 创建：`components/agent/AgentFab.tsx`
- 创建：`components/agent/AgentChat.tsx`
- 创建：`components/agent/AgentMessage.tsx`
- 创建：`components/agent/ModeTabs.tsx`
- 创建：`machines/agentChat.machine.ts`
- 创建：`types/agent.ts`
- 修改：`app/(main)/layout.tsx`

**步骤：**

- [ ] **Step 1: 类型定义**

`types/agent.ts`:
```typescript
export type AgentMode = "coach" | "analysis" | "recommend" | "plan"

export interface AgentMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: number
}

export interface AgentSession {
  id: string
  mode: AgentMode
  messages: AgentMessage[]
}
```

- [ ] **Step 2: Agent 聊天状态机**

`machines/agentChat.machine.ts`:
```typescript
import { setup, assign } from "xstate"

interface AgentChatContext {
  sessionId: string | null
  messages: AgentMessage[]
  mode: AgentMode
  error: string | null
}

type AgentChatEvent =
  | { type: "SWITCH_MODE"; mode: AgentMode }
  | { type: "SEND_MESSAGE"; content: string }
  | { type: "RECEIVE_CHUNK"; content: string }
  | { type: "COMPLETE" }
  | { type: "ERROR"; message: string }
  | { type: "CLEAR_ERROR" }

export const agentChatMachine = setup({
  types: {} as { context: AgentChatContext; events: AgentChatEvent },
  actions: {
    addUserMessage: assign({
      messages: ({ context, event }) => {
        if (event.type !== "SEND_MESSAGE") return context.messages
        return [...context.messages, {
          id: crypto.randomUUID(),
          role: "user",
          content: event.content,
          timestamp: Date.now(),
        }]
      },
    }),
    appendChunk: assign({
      messages: ({ context, event }) => {
        if (event.type !== "RECEIVE_CHUNK") return context.messages
        const msgs = [...context.messages]
        const last = msgs[msgs.length - 1]
        if (last && last.role === "assistant") {
          msgs[msgs.length - 1] = { ...last, content: last.content + event.content }
        }
        return msgs
      },
    }),
    setError: assign({
      error: (_, event: { message: string }) => event.message,
    }),
    clearError: assign({
      error: null,
    }),
    clearMessages: assign({
      messages: [],
      sessionId: null,
    }),
  },
}).createMachine({
  id: "agentChat",
  initial: "idle",
  context: {
    sessionId: null,
    messages: [],
    mode: "coach",
    error: null,
  },
  states: {
    idle: {
      on: {
        SWITCH_MODE: {
          actions: assign({ mode: ({ event }) => event.mode }),
        },
        SEND_MESSAGE: {
          target: "streaming",
          actions: "addUserMessage",
        },
      },
    },
    streaming: {
      on: {
        RECEIVE_CHUNK: {
          actions: "appendChunk",
        },
        COMPLETE: {
          target: "idle",
        },
        ERROR: {
          target: "idle",
          actions: "setError",
        },
      },
    },
  },
})
```

- [ ] **Step 3: Agent 聊天 API Route**

`app/api/agent/chat/route.ts`:
```
POST handler:
  1. 从 cookie 获取用户 → prisma.user.findUnique (include preferences)
  2. 解析 body: { mode, message, sessionId? }
  3. 如果没有 sessionId，创建新 AgentSession
  4. 从 UserPreference 构建用户画像文本
  5. 读取 lib/agent/prompts/coach.txt，替换 {userProfile} 占位符
  6. 从 AgentSession.messages 加载历史
  7. 调用 createChatCompletion(messages, { stream: true })
  8. 返回 SSE ReadableStream:
     data: {"chunk": "..."}\n\n
     data: [DONE]\n\n
  9. 流结束后保存消息到 AgentSession
```

关键实现：
- Next.js Route Handler 返回 `new Response(stream)`，Content-Type: text/event-stream
- stream 通过 async generator 逐块 yield DeepSeek 返回的 SSE chunk
- 每一块格式化为 `data: {"chunk":"..."}\n\n`
- 结束发送 `data: [DONE]\n\n`

- [ ] **Step 4: Agent 前端组件**

`components/agent/AgentChat.tsx`:
- 使用 `useMachine(agentChatMachine)` hook
- messages 列表渲染，自动滚动到最新
- 底部输入框 + 发送按钮
- 发送消息时 fetch `/api/agent/chat` 并消费 SSE stream
- 通过 `EventSource` 或 fetch ReadableStream 读取 chunk → RECEIVE_CHUNK → COMPLETE

`components/agent/AgentMessage.tsx`:
- 用户消息：右对齐，bg-tertiary，圆角气泡
- Agent 消息：左对齐，带小头像图标，Markdown 渲染（使用 react-markdown 或简单文本）
- 时间戳显示相对时间

`components/agent/ModeTabs.tsx`:
- 4 个 tab：陪练 / 分析 / 推荐 / 计划
- 点击发送 SWITCH_MODE 事件

`components/agent/AgentFab.tsx`:
- 右下角悬浮按钮（侧边栏关闭时显示）
- 赛博 cyan 发光圆形按钮，内嵌 💬 图标
- 点击打开 AgentSidebar
- 仅在 `lg:hidden` 且 AgentSidebar 关闭时显示

- [ ] **Step 5: Agent 侧边栏**

`components/layout/AgentSidebar.tsx`:
```typescript
// Props
interface AgentSidebarProps {
  open: boolean
  onClose: () => void
}
```
- 桌面端（>= 1024px）：固定在右侧，宽度 380px
- 移动端（< 1024px）：全屏 Sheet，从底部上滑，高度 80vh
- 有 open/close 动画（slide in/out）
- 内部渲染 AgentChat
- 关闭按钮（桌面端：侧边栏顶部的 X；移动端：下滑手势 + 顶部 handle bar）

- [ ] **Step 6: 修改主布局**

`app/(main)/layout.tsx`:
```typescript
"use client"

import { useState } from "react"
import { AgentSidebar } from "@/components/layout/AgentSidebar"
import { AgentFab } from "@/components/agent/AgentFab"

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const [agentOpen, setAgentOpen] = useState(false)

  return (
    <>
      {children}
      <AgentFab onClick={() => setAgentOpen(true)} />
      <AgentSidebar open={agentOpen} onClose={() => setAgentOpen(false)} />
    </>
  )
}
```

- [ ] **Step 7: 验证**

```bash
npx next dev
# 1. 登录后看到右侧 Agent 侧边栏（或 FAB 按钮）
# 2. 打开 Agent，输入"什么是纵连"
# 3. 确认流式返回 AI 回复
# 4. 切到移动端视口确认底部 Sheet
```

---

### Task 1.7: 成绩录入向导（XState 状态机）

**文件：**
- 创建：`machines/scoreEntry.machine.ts`
- 创建：`app/api/scores/route.ts`
- 创建：`components/profile/ScoreEntryWizard.tsx`
- 创建：`app/(main)/profile/scores/page.tsx`

**步骤：**

- [ ] **Step 1: 分数录入状态机**

`machines/scoreEntry.machine.ts`:
```
states: selectGame → selectSong → enterScore → attachMedia → preview → submitting → done
```
- selectGame: 选择游戏（Arcaea/Phigros/舞萌），存入 context.game
- selectSong: 输入曲名（自动补全，查 GameSong 表），存入 context.songTitle
- enterScore: 分数（纯数字）、精度（Perfect/Great/Miss）、段位（AA/EX/PM），存入 context
- attachMedia: 可选，输入 YouTube/B站 链接 + 分数截图 URL
- preview: 展示所有已填信息，确认
- submitting: POST /api/scores，loading 状态
- done: 成功提示 + 询问是否让 Agent 分析

各步骤支持 BACK 事件返回上一步。

- [ ] **Step 2: 成绩 CRUD API**

`app/api/scores/route.ts`:
- GET: `?game=&limit=20&offset=0` → prisma.score.findMany
- POST: 创建成绩，body 用 Zod 校验

- [ ] **Step 3: 成绩录入向导组件**

`components/profile/ScoreEntryWizard.tsx`:
- 使用 `useMachine(scoreEntryMachine)`
- 步骤指示器（顶部的横向进度条，4 个点）
- 每一步渲染对应表单：
  - selectGame: 3 个游戏卡片（带游戏 logo/图标），点击选择
  - selectSong: 搜索输入框 + 下拉建议（防抖 300ms 查 GameSong）
  - enterScore: 大号数字输入 + Perfect/Great/Miss 三个 mini 输入 + Grade 下拉
  - attachMedia: 两个 URL 输入框（录像链接、截图链接）
  - preview: 结构化预览卡片（模拟最终展示效果）
- 底部 fixed 的"上一步"/"下一步"/"提交"按钮

- [ ] **Step 4: 成绩列表页**

`app/(main)/profile/scores/page.tsx`:
- 以卡片网格展示所有成绩
- 卡片：游戏名 + 曲名 + 分数 + Grade 徽章 + 日期
- 顶部筛选：游戏、时间范围

- [ ] **Step 5: 验证**

```bash
# API 测试
curl -X POST http://localhost:3000/api/scores \
  -H "Content-Type: application/json" \
  -H "Cookie: accessToken=..." \
  -d '{"game":"Arcaea","songTitle":"Grievous Lady","chartType":"FTR","chartLevel":"11","score":9900000,"grade":"EX","perfectCount":1100,"missCount":3,"isPublic":true}'
# 预期：201 + 返回创建的 Score 对象
```

---

### Task 1.8: Phase 1 整合验证

**验证清单：**

- [ ] 新用户可注册 → 收到 JWT → 自动跳转首页
- [ ] 已注册用户可登录 → 进入 (main) 布局
- [ ] 未登录访问 /profile → 重定向到 /login
- [ ] Agent 侧边栏可打开 → 输入问题 → 收到流式回复
- [ ] 成绩录入向导完整走通 → 成绩出现在列表中
- [ ] 移动端（Chrome DevTools 模拟 iPhone/iPad）所有功能可用
- [ ] `npm run build` 无报错

---

# Phase 2：社区基础

---

### Task 2.1: 帖子 CRUD + 评论区

**文件：**
- 创建：`app/api/posts/route.ts`
- 创建：`app/api/posts/[id]/route.ts`
- 创建：`app/api/posts/[id]/comments/route.ts`
- 创建：`components/community/PostCard.tsx`
- 创建：`components/community/CommentSection.tsx`
- 创建：`app/(main)/community/page.tsx`
- 创建：`app/(main)/community/[postId]/page.tsx`

**要点：**
- PostCard: 标题、摘要（前 150 字）、标签 chips、作者+时间、评论数
- 帖子详情页：全文 + 评论区 + 发表评论
- 评论支持嵌套回复（一级嵌套）
- 发帖/评论需要 >= 信任等级 1

---

### Task 2.2: 成绩分享卡片 + 谱面讨论区

**文件：**
- 创建：`components/community/ScoreCard.tsx`
- 创建：`components/community/ChartDiscussion.tsx`
- 修改：`app/(main)/community/rhythm/page.tsx`
- 创建：`app/(main)/community/charts/page.tsx`
- 创建：`app/(main)/community/charts/[songId]/page.tsx`

**要点：**
- ScoreCard: 结构化展示（游戏图标 + 曲名 + 难度标签 + 分数 + Grade + 判定线装饰条）
- 谱面讨论区：按游戏筛选 → 曲目列表 → 点击进入单曲讨论页
- 单曲讨论页：曲目信息顶部固定 + 帖子流（仅该谱面的讨论）
- ScoreCard 可嵌入到普通帖子中（类似微博的"分享卡片"）

---

### Task 2.3: 关注 + 动态流

**文件：**
- 创建：`app/api/users/follow/route.ts`
- 修改：`app/page.tsx`（改为动态流）
- 创建：`components/community/Feed.tsx`

**要点：**
- Feed 聚合关注用户的行为：新成绩（公开）、新帖子、打卡记录
- 按时间倒序，支持按类型筛选
- 关注按钮出现在用户头像旁、个人主页

---

### Task 2.4: 信任等级系统 + 通知

**文件：**
- 创建：`lib/trust/levels.ts`
- 创建：`app/api/notifications/route.ts`
- 创建：`components/ui/TrustBadge.tsx`（如果未完全实现则完成）
- 修改：`components/layout/Navbar.tsx`（通知红点）

**要点：**
- `lib/trust/levels.ts` 导出 `checkLevelUp(userId)` 函数
- 在关键操作（发帖、录入成绩、收到赞）后调用 checkLevelUp
- 升级时自动创建通知
- 通知列表页：按未读优先排列，支持一键全部已读

---

# Phase 3：Agent 进阶

---

### Task 3.1: 成绩分析（DeepSeek Vision）

**文件：**
- 创建：`app/api/agent/analyze/route.ts`
- 创建：`lib/agent/analyzer.ts`
- 创建：`lib/agent/prompts/analyzer.txt`

**要点：**
- POST 接收 { scoreId, screenshotUrl? }
- 加载 Score 数据 + 用户最近的同游戏成绩
- 如果有截图 URL，将图片以 base64 传给 deepseek-vision
- 构建分析 prompt → 调用 Agent → JSON mode 返回结构化分析
- 结果缓存到 Score.agentAnalysis
- 在 AgentChat 中以卡片形式渲染分析结果

---

### Task 3.2: 训练计划生成 + 打卡

**文件：**
- 创建：`app/api/agent/plan/route.ts`
- 创建：`lib/agent/planner.ts`
- 创建：`lib/agent/prompts/planner.txt`
- 创建：`machines/trainingPlan.machine.ts`
- 创建：`app/(main)/agent/plan/page.tsx`

**要点：**
- 用户选择游戏 → 目标（冲分/爬段/收歌）→ 周期（7/14/30 天）
- Agent 生成日计划（每天 2-3 个任务 + 目标曲目）
- TrainingPlanMachine 管理生命周期
- 打卡：从成绩列表"关联到计划"或独立打卡
- 进度条 + 连续打卡天数统计

---

### Task 3.3: 智能推荐引擎

**文件：**
- 创建：`app/api/agent/recommend/route.ts`
- 创建：`lib/agent/recommender.ts`
- 创建：`lib/agent/prompts/recommender.txt`
- 创建：`machines/recommendation.machine.ts`

**要点：**
- 分析用户最近 20 条成绩 → 找短板模式
- 查 GameSong 表找出适合练习的曲目
- Agent 综合推荐 + 解释推荐理由
- 推荐结果可保存、可分享

---

### Task 3.4: 用户记忆自动学习 + 主动推送

**文件：**
- 创建：`lib/agent/memory.ts`
- 创建：`lib/agent/tasks.ts`
- 修改：`app/api/agent/chat/route.ts`（对话结束触发记忆提取）

**要点：**
- memory.ts: 对话结束后异步调用 deepseek-chat (JSON mode) 提取偏好 → 更新 UserPreference
- tasks.ts: 实现两个 cron 函数：
  - 每日推荐: 检查最近成绩 → 发现瓶颈 → 创建 AgentTask → 推送通知
  - 每周资讯: 爬取音游 RSS/API → 按用户游戏过滤 → 推送
- Next.js 不支持内置 cron，使用 Vercel Cron Jobs（`vercel.json` 配置）或简单的 setInterval 在 custom server 中

---

# Phase 4：生态完善

---

### Task 4.1: b50 成绩图生成

**文件：**
- 创建：`app/api/scores/b50/route.ts`
- 创建：`components/profile/B50Chart.tsx`
- 创建：`components/profile/SkillRadar.tsx`

**要点：**
- b50: 取某游戏下用户 Top 50 分数 → Canvas 绘制矩形网格（每首歌一个色块，颜色对应段位）
- SkillRadar: 5 维度雷达图（准确度/节奏感/速度/耐力/读谱）→ 从成绩数据推算
- 图片导出：Canvas.toDataURL → 下载按钮

---

### Task 4.2: 排行榜

**文件：**
- 创建：`app/api/leaderboard/route.ts`
- 创建：`components/leaderboard/RankingTable.tsx`
- 创建：`app/(main)/leaderboard/page.tsx`

**要点：**
- 按游戏 + 谱面维度排名
- 定时刷新（每 30 分钟重算）
- 段位徽章系统

---

### Task 4.3: 私信系统

**文件：**
- 创建：`app/api/messages/route.ts`
- 创建：`app/(main)/messages/page.tsx`

**要点：**
- 会话列表 + 单聊界面
- 新消息即时推送通知
- 简单实现（无需 WebSocket，轮询或 Server Actions 刷新）

---

### Task 4.4: 联动创作板块

**文件：**
- 创建：`app/(main)/community/art/page.tsx`
- 创建：`components/community/CollabProjectCard.tsx`
- 创建：`app/api/collabs/route.ts`

**要点：**
- 项目类型：写谱 / 作曲 / 曲绘 / 混合
- 招募状态：recruiting → in_progress → done
- 成员角色展示 + 申请加入功能

---

### Task 4.5: 曲目数据库导入 + 活动/比赛

**文件：**
- 创建：`lib/games/metadata.ts`
- 创建：`lib/games/songs.ts`
- 创建：`app/(main)/community/events/page.tsx`

**要点：**
- metadata.ts: 从第三方 API 批量导入曲目数据
- songs.ts: 社区编辑接口（信任等级 3 可编辑）
- 活动页：发布/报名/结果展示

---

## 附录：环境变量完整清单

```env
DATABASE_URL="postgresql://user:pass@localhost:5432/rhythm_community"
DEEPSEEK_API_KEY="sk-..."
JWT_SECRET="..."
JWT_REFRESH_SECRET="..."
OSS_ENDPOINT=""
OSS_BUCKET=""
OSS_ACCESS_KEY=""
OSS_SECRET_KEY=""
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

## 附录：关键命令速查

```bash
# 开发
npx next dev

# 数据库
npx prisma studio
npx prisma migrate dev --name <name>
npx prisma db seed
npx prisma generate

# 构建 & 部署
npx next build
npx next start

# 类型检查
npx tsc --noEmit
```
