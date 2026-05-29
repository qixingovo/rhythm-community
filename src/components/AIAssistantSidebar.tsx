"use client"

import { useState, useRef, useEffect } from "react"
import { Bot, Send } from "lucide-react"

interface Message {
  id: number
  role: "user" | "assistant"
  content: string
}

export function AIAssistantSidebar() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: "assistant",
      content: "你好！我是你的音游陪练。需要分析成绩、推荐谱面，还是制定训练计划？",
    },
  ])
  const [inputText, setInputText] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])

  const handleSend = async () => {
    if (!inputText.trim() || isTyping) return

    const userInputText = inputText
    const userMessage: Message = {
      id: Date.now(),
      role: "user",
      content: userInputText,
    }

    setMessages((prev) => [...prev, userMessage])
    setInputText("")
    setIsTyping(true)

    try {
      const apiMessages = [...messages, userMessage].map((m) => ({
        role: m.role,
        content: m.content,
      }))

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages }),
      })

      if (!response.ok) throw new Error("API request failed")

      const reader = response.body?.getReader()
      if (!reader) throw new Error("No response body")

      const decoder = new TextDecoder()
      let aiMessage: Message = { id: Date.now() + 1, role: "assistant", content: "" }
      setMessages((prev) => [...prev, aiMessage])

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split("\n")

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6)
            if (data === "[DONE]") continue
            try {
              const parsed = JSON.parse(data)
              if (parsed.content) {
                aiMessage.content += parsed.content
                setMessages((prev) =>
                  prev.map((m) => (m.id === aiMessage.id ? { ...aiMessage } : m))
                )
              }
            } catch {
              // skip
            }
          }
        }
      }
    } catch (error) {
      console.error("Chat error:", error)
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, role: "assistant", content: "抱歉，发生了一些错误，请稍后再试。" },
      ])
    } finally {
      setIsTyping(false)
    }
  }

  return (
    <aside className="h-full bg-card overflow-y-auto flex flex-col">
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2 mb-1">
          <Bot className="text-primary w-5 h-5" />
          <span className="font-semibold">AI 陪练</span>
        </div>
        <p className="text-xs text-muted-foreground">你的专属音游进阶教练</p>
      </div>
      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-lg p-3 ${
                message.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted"
              }`}
            >
              {message.role === "assistant" && (
                <div className="flex items-start gap-2">
                  <Bot className="text-primary w-4 h-4 mt-0.5 shrink-0" />
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
              )}
              {message.role === "user" && <p className="text-sm">{message.content}</p>}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-muted rounded-lg p-3">
              <div className="flex items-start gap-2">
                <Bot className="text-primary w-4 h-4 mt-0.5 shrink-0" />
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="输入你的问题..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            className="flex-1 bg-muted border-none rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <button
            onClick={handleSend}
            disabled={isTyping || !inputText.trim()}
            className="bg-primary text-primary-foreground p-2 rounded-md hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  )
}
