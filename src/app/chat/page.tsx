"use client"

import { useState, useEffect, useRef } from "react"
import { MainLayout } from "@/components/MainLayout"
import { Send } from "lucide-react"

interface Message {
  id: string
  content: string
  senderId: string
  receiverId: string
  read: boolean
  createdAt: string
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(true)
  const [currentUserId, setCurrentUserId] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function init() {
      const res = await fetch("/api/auth/me")
      if (res.ok) {
        const d = await res.json()
        setCurrentUserId(d.user.id)
      }
      try {
        const msgRes = await fetch("/api/messages?limit=100")
        if (msgRes.ok) {
          const d = await msgRes.json()
          if (Array.isArray(d.messages)) {
            setMessages(d.messages)
          }
        }
      } catch (e) {
        console.error("Failed to load messages:", e)
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSend = async () => {
    if (!input.trim()) return
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiverId: currentUserId, content: input }),
      })
      if (res.ok) {
        const msg = await res.json()
        setMessages((prev) => [...prev, msg])
        setInput("")
      }
    } catch (e) {
      console.error("Send failed:", e)
    }
  }

  const formatTime = (d: string) =>
    new Date(d).toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto space-y-4">
        <h1 className="text-xl font-bold text-foreground">私信</h1>
        <div className="bg-card rounded-xl border border-border shadow-sm flex flex-col" style={{ height: "calc(100vh - 220px)" }}>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {loading ? (
              <div className="p-12 text-center text-muted-foreground">加载中...</div>
            ) : messages.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground">暂无消息</div>
            ) : (
              messages.map((m) => {
                const isMine = m.senderId === currentUserId
                return (
                  <div key={m.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[70%] rounded-lg px-4 py-2 ${isMine ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                      <p className="text-sm">{m.content}</p>
                      <p className={`text-xs mt-1 ${isMine ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                        {formatTime(m.createdAt)}
                      </p>
                    </div>
                  </div>
                )
              })
            )}
            <div ref={messagesEndRef} />
          </div>
          <div className="p-4 border-t border-border">
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="输入消息..."
                className="flex-1 bg-muted border-none rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <button onClick={handleSend} disabled={!input.trim()} className="bg-primary text-primary-foreground p-2 rounded-lg hover:opacity-90 disabled:opacity-50">
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
