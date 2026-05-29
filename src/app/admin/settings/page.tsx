"use client"
import { useState, useEffect } from "react"
import Link from "next/link"

export default function AdminSettings() {
  const [title, setTitle] = useState("")
  const [notice, setNotice] = useState("")
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetch("/api/admin/settings").then(r => r.json()).then(d => {
      setTitle(d.site_title || "")
      setNotice(d.site_notice || "")
    }).catch(() => {})
  }, [])

  const save = async () => {
    await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ site_title: title, site_notice: notice }),
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 p-6">
      <div className="flex items-center gap-4">
        <Link href="/admin" className="text-muted-foreground hover:text-foreground">← 返回</Link>
        <h1 className="text-xl font-bold">系统设置</h1>
      </div>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">网站标题</label>
          <input value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-muted border border-border rounded-xl px-4 py-3" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">公告文字</label>
          <textarea value={notice} onChange={e => setNotice(e.target.value)} rows={3} className="w-full bg-muted border border-border rounded-xl px-4 py-3" />
        </div>
        <button onClick={save} className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-medium hover:opacity-90">
          {saved ? "已保存" : "保存"}
        </button>
      </div>
    </div>
  )
}
