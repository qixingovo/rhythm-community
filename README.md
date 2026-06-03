# 踏乐行 — 音游社区平台

Next.js + TypeScript + Prisma + DeepSeek AI 陪练

## 快速启动

```bash
npm install
cp .env.example .env          # 编辑 .env 填入数据库和 API Key
npx prisma generate
npx prisma db push
npm run dev                    # http://localhost:3000
```

## 环境变量 (.env)

```
DATABASE_URL=postgresql://postgres:password@localhost:5432/rhythm_community
DEEPSEEK_API_KEY=sk-xxx
JWT_SECRET=your-secret
JWT_REFRESH_SECRET=your-refresh-secret
MAIMAI_API_KEY=xxx
```

## 功能

- AI 音游陪练（DeepSeek 流式对话）
- 成绩管理 + b50 展示（对接落雪咖啡屋 / diving-fish）
- 社区发帖 / 评论 / 点赞
- 游客模式 / 注册登录
- 管理后台（/admin）

## 技术栈

Next.js 16 · TypeScript · Prisma · PostgreSQL · DeepSeek API · TailwindCSS
