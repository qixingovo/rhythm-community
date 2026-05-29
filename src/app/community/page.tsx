"use client"

import Link from "next/link"
import { Gamepad2, Disc, Palette, Calendar, MessageSquare } from "lucide-react"

const sections = [
  { href: "/community-rhythm", icon: Gamepad2, label: "音游区", desc: "成绩分享、心得交流" },
  { href: "/community-charts", icon: Disc, label: "谱面讨论", desc: "攻略、手元、谱面分析" },
  { href: "/community-art", icon: Palette, label: "联动创作", desc: "写谱、作曲、曲绘企划" },
  { href: "/community-events", icon: Calendar, label: "活动比赛", desc: "参与活动，赢取奖励" },
]

export default function CommunityPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">社区广场</h1>
        <p className="text-muted-foreground mt-1">选择你感兴趣的板块</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sections.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className="bg-card rounded-xl border border-border p-6 shadow-sm hover:shadow-md hover:border-primary/30 transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <s.icon className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">{s.label}</h3>
                <p className="text-sm text-muted-foreground">{s.desc}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
