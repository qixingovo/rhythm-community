"use client"
import { useState, useEffect } from "react"
import Link from "next/link"

export default function AdminPosts() {
  const [posts, setPosts] = useState<any[]>([])

  useEffect(() => {
    fetch("/api/admin/posts").then(r => r.json()).then(d => setPosts(d.posts || [])).catch(() => {})
  }, [])

  const deletePost = async (id: string) => {
    if (!confirm("确定删除？")) return
    await fetch(`/api/admin/posts/${id}`, { method: "DELETE" })
    setPosts(prev => prev.filter(p => p.id !== id))
  }

  const togglePin = async (id: string, pinned: boolean) => {
    await fetch(`/api/admin/posts/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ pinned: !pinned }) })
    setPosts(prev => prev.map(p => p.id === id ? { ...p, pinned: !pinned } : p))
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4 p-6">
      <div className="flex items-center gap-4">
        <Link href="/admin" className="text-muted-foreground hover:text-foreground">← 返回</Link>
        <h1 className="text-xl font-bold">帖子管理</h1>
      </div>
      {posts.map(p => (
        <div key={p.id} className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="font-medium">{p.title} {p.pinned && "📌"}</div>
            <span className="text-xs text-muted-foreground">{p.author?.username} · {new Date(p.createdAt).toLocaleDateString()} · {p._count?.comments || 0}评 · {p._count?.likes || 0}赞</span>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{p.content}</p>
          <div className="flex gap-2">
            <button onClick={() => togglePin(p.id, p.pinned)} className="text-xs px-3 py-1 rounded border border-border hover:bg-muted">{p.pinned ? "取消置顶" : "置顶"}</button>
            <button onClick={() => deletePost(p.id)} className="text-xs px-3 py-1 rounded border border-red-200 text-red-600 hover:bg-red-50">删除</button>
          </div>
        </div>
      ))}
    </div>
  )
}
