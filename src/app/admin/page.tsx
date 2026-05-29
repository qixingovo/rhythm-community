"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { Users, FileText, Database, Settings } from "lucide-react"

export default function AdminDashboard() {
  const [stats, setStats] = useState({ userCount: 0, postCount: 0, scoreCount: 0, todayUsers: 0 })
  const [error, setError] = useState("")

  useEffect(() => {
    fetch("/api/admin/stats").then(r => r.json()).then(d => {
      if (d.error) setError(d.error)
      else setStats(d)
    }).catch(() => setError("加载失败"))
  }, [])

  if (error) return <div className="p-12 text-center"><p className="text-red-500 mb-4">{error}</p><Link href="/" className="text-primary">返回首页</Link></div>

  const cards = [
    { label: "总用户", value: stats.userCount, icon: Users, href: "/admin/users" },
    { label: "总帖子", value: stats.postCount, icon: FileText, href: "/admin/posts" },
    { label: "总成绩", value: stats.scoreCount, icon: Database },
    { label: "今日新增", value: stats.todayUsers, icon: Settings, href: "/admin/settings" },
  ]

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-6">
      <h1 className="text-2xl font-bold">管理后台</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map(c => (
          <Link key={c.label} href={c.href || "#"} className={`bg-card rounded-xl border border-border p-4 ${c.href ? "hover:shadow-md transition-shadow" : ""}`}>
            <c.icon className="w-6 h-6 text-primary mb-2" />
            <div className="text-2xl font-bold">{c.value}</div>
            <div className="text-sm text-muted-foreground">{c.label}</div>
          </Link>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Link href="/admin/users" className="bg-card rounded-xl border border-border p-6 hover:shadow-md">用户管理 →</Link>
        <Link href="/admin/posts" className="bg-card rounded-xl border border-border p-6 hover:shadow-md">帖子管理 →</Link>
        <Link href="/admin/settings" className="bg-card rounded-xl border border-border p-6 hover:shadow-md">系统设置 →</Link>
      </div>
    </div>
  )
}
