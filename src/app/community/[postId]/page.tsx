"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { ArrowLeft, Send, Heart } from "lucide-react"

interface Post {
  id: string
  title: string
  content: string
  tags: string[]
  game: string | null
  category: string
  createdAt: string
  author: { id: string; username: string; avatar: string | null }
}

interface Comment {
  id: string
  content: string
  createdAt: string
  author: { id: string; username: string; avatar: string | null }
}

export default function PostDetailPage() {
  const { postId } = useParams<{ postId: string }>()
  const [post, setPost] = useState<Post | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [commentText, setCommentText] = useState("")
  const [loading, setLoading] = useState(true)
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)

  const toggleLike = async () => {
    try {
      const res = await fetch(`/api/posts/${postId}/like`, { method: "POST" })
      if (res.ok) {
        const d = await res.json()
        setLiked(d.liked)
        setLikeCount(d.count)
      }
    } catch {}
  }

  useEffect(() => {
    async function load() {
      try {
        const [postRes, commentsRes] = await Promise.all([
          fetch(`/api/posts/${postId}`),
          fetch(`/api/posts/${postId}/comments`),
        ])
        if (postRes.ok) {
          const d = await postRes.json()
          setPost(d)
        }
        if (commentsRes.ok) {
          const d = await commentsRes.json()
          setComments(d.comments || d || [])
        }
      } catch (e) {
        console.error("Failed to load post:", e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [postId])

  const handleComment = async () => {
    if (!commentText.trim()) return
    try {
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: commentText.trim() }),
      })
      if (res.ok) {
        const newComment = await res.json()
        setComments((prev) => [...prev, newComment])
        setCommentText("")
      }
    } catch (e) {
      console.error("Comment failed:", e)
    }
  }

  if (loading) return <div className="p-12 text-center text-muted-foreground">加载中...</div>
  if (!post) return <div className="p-12 text-center text-muted-foreground">帖子不存在</div>

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link href="/community-rhythm" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="w-4 h-4" />
        返回音游区
      </Link>

      <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-3 text-sm text-muted-foreground">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold text-xs">
            {post.author.username[0]}
          </div>
          <span className="text-foreground">{post.author.username}</span>
          <span>·</span>
          <span>{new Date(post.createdAt).toLocaleDateString("zh-CN")}</span>
          {post.game && <span className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded ml-auto">{post.game}</span>}
        </div>

        <h1 className="text-xl font-bold text-foreground mb-4">{post.title}</h1>
        <div className="text-foreground/80 whitespace-pre-wrap">{post.content}</div>

        <div className="flex items-center gap-4 mt-4 pt-3 border-t border-border">
          <button onClick={toggleLike} className={`flex items-center gap-1 text-sm transition-colors ${liked ? "text-red-500" : "text-muted-foreground hover:text-red-400"}`}>
            <Heart className={`w-4 h-4 ${liked ? "fill-current" : ""}`} />
            {likeCount > 0 && <span>{likeCount}</span>}
          </button>
          <span className="text-sm text-muted-foreground">{comments.length} 评论</span>
        </div>

        {post.tags.length > 0 && (
          <div className="flex gap-2 mt-4">
            {post.tags.map((t) => (
              <span key={t} className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded">#{t}</span>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">评论 ({comments.length})</h2>
        {comments.map((c) => (
          <div key={c.id} className="bg-card rounded-lg border border-border p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold text-xs">
                {c.author.username[0]}
              </div>
              <span className="text-sm font-medium text-foreground">{c.author.username}</span>
              <span className="text-xs text-muted-foreground">{new Date(c.createdAt).toLocaleDateString("zh-CN")}</span>
            </div>
            <p className="text-sm text-foreground/80">{c.content}</p>
          </div>
        ))}
        {comments.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">暂无评论，来坐沙发</p>}
      </div>

      <div className="flex gap-2">
        <input
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleComment()}
          placeholder="写下你的评论..."
          className="flex-1 bg-muted border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
        <button onClick={handleComment} disabled={!commentText.trim()} className="bg-primary text-primary-foreground px-4 rounded-xl hover:opacity-90 disabled:opacity-50">
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
