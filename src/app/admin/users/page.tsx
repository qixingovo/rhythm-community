"use client"
import { useState, useEffect } from "react"
import Link from "next/link"

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([])
  const [q, setQ] = useState("")

  const load = (search: string) => {
    fetch(`/api/admin/users?q=${search}`).then(r => r.json()).then(d => setUsers(d.users || [])).catch(() => {})
  }
  useEffect(() => { load("") }, [])

  const changeLevel = async (userId: string, level: number) => {
    await fetch(`/api/admin/users/${userId}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ level }) })
    load(q)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4 p-6">
      <div className="flex items-center gap-4">
        <Link href="/admin" className="text-muted-foreground hover:text-foreground">← 返回</Link>
        <h1 className="text-xl font-bold">用户管理</h1>
      </div>
      <input value={q} onChange={e => setQ(e.target.value)} onKeyDown={e => e.key === "Enter" && load(q)} placeholder="搜索用户名或邮箱..." className="w-full bg-muted border border-border rounded-xl px-4 py-2 text-sm" />
      <div className="space-y-2">
        {users.map(u => (
          <div key={u.id} className="bg-card rounded-lg border border-border p-4 flex items-center justify-between">
            <div>
              <div className="font-medium">{u.username}</div>
              <div className="text-xs text-muted-foreground">{u.email} · {new Date(u.createdAt).toLocaleDateString()}</div>
            </div>
            <select value={u.trustRole?.level || 0} onChange={e => changeLevel(u.id, parseInt(e.target.value))} className="bg-muted border border-border rounded-lg px-3 py-1 text-sm">
              <option value={0}>Lv0 新手</option>
              <option value={1}>Lv1 玩家</option>
              <option value={2}>Lv2 资深</option>
              <option value={3}>Lv3 协管</option>
            </select>
          </div>
        ))}
      </div>
    </div>
  )
}
