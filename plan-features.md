# 踏乐行 — 功能实现计划

## Phase 1: 基础体验

### 1.1 帖子点赞
- **Schema**: `Like` 表 `(userId + postId, unique)`
- **API**: `POST /api/posts/[id]/like` → toggle 点赞 → 返回 `{ liked: bool, count: int }`
- **前端**: 帖子详情页 ❤️ 按钮替换为真实调用，PostCard 显示点赞数

### 1.2 个人资料编辑
- **API**: `PUT /api/users/me` → body `{ bio, avatar? }`
- **前端**: profile 页"编辑资料"按钮 → 弹窗 → 改 bio + 换头像（URL输入）
- **图片上传（简单版）**: `<input type="text">` 输入图片 URL 存到 avatar 字段

### 1.3 图片上传（帖子里发图）
- **API**: `POST /api/upload` → 接收 `FormData`，存到本地 `public/uploads/`，返回 URL
- **前端**: 发帖表单加 `<input type=file accept=image/*>`，上传后插入 `![](url)` 到正文

---

## Phase 2: Agent 能力

### 2.1 Agent 成绩分析
- **API**: `POST /api/agent/analyze`（已存在，需完善）
  - 入参: `{ scoreId }` → 查 Score → 加载用户近 20 条同游戏成绩 → DeepSeek 分析 → JSON mode
  - 返回: 弱点/强项/建议/推荐曲
- **前端**: 成绩卡片旁增加"AI 分析"按钮 → 侧边栏弹出分析结果

### 2.2 训练计划生成
- **API**: `POST /api/agent/plan`（已存在，需完善）
  - 入参: `{ game, goal }` → DeepSeek → 生成 7 天计划 `[{ day, task }]`
- **前端**: Agent 侧边栏"计划"tab → 选游戏+目标 → 展示 7 天任务列表 → 每日打卡按钮

---

## Phase 3: 可视化

### 3.1 b50 图表生成
- **纯前端 Canvas**: 读 Score 数据 → 10×5 色块矩阵（绿=PM/SSS+, 蓝=EX+, 黄=EX, 橙=AA）
- **导出**: Canvas.toDataURL → 下载 PNG
- **位置**: profile 页底部的"生成 b50 图"按钮

---

## Phase 4: 管理后台

### 4.1 Schema
```prisma
model SiteConfig {
  key   String @id
  value String
}
```
User 表加 `isAdmin Boolean @default(false)`

### 4.2 API（7 个）
| API | 方法 | 说明 | 权限 |
|------|------|------|------|
| `/api/admin/stats` | GET | 用户/帖子/成绩总数 | admin |
| `/api/admin/users` | GET | 用户列表 + 搜索 | admin |
| `/api/admin/users/[id]` | PUT | 修改信任等级 | admin |
| `/api/admin/posts` | GET | 全部帖子（含已删） | admin |
| `/api/admin/posts/[id]` | DELETE | 删帖 | admin |
| `/api/admin/posts/[id]` | PUT | 修改/置顶 | admin |
| `/api/admin/settings` | GET/PUT | 标题、公告等 | admin |

### 4.3 前端页面（4 个）
| 页面 | 功能 |
|------|------|
| `/admin` | 仪表盘：总用户/总帖子/今日新增 |
| `/admin/users` | 用户表：搜索、改等级 |
| `/admin/posts` | 帖子表：删除、置顶 |
| `/admin/settings` | 表单：网站标题、公告文字 |

### 4.4 权限守卫
- middleware 放行 `/admin/*`
- 每个 admin API 内校验 `user.trustLevel >= 3`
- 前端 `/admin` 页判断未登录 → 重定向

---

## 执行顺序

```
Phase 1 (点赞→编辑→上传) → Phase 2 (分析→计划)
    → Phase 3 (b50) → Phase 4 (管理后台)
```

**17 个文件变更**，4 个新 API，1 张新表，6 个前端页面更新。
