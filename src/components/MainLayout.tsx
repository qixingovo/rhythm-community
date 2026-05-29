"use client"

import React, { useState } from "react"
import { Header } from "@/components/Header"
import { AIAssistantSidebar } from "@/components/AIAssistantSidebar"
import { Sidebar } from "@/components/Sidebar"
import { MessageCircle, X } from "lucide-react"

interface MainLayoutProps {
  children: React.ReactNode
  showNav?: boolean
}

export function MainLayout({ children, showNav = true }: MainLayoutProps) {
  const [agentOpen, setAgentOpen] = useState(false)

  if (!showNav) {
    return <div className="min-h-screen bg-background">{children}</div>
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex" style={{ height: "calc(100vh - 4rem)" }}>
        <Sidebar />
        <main className="flex-1 min-w-0 overflow-y-auto p-6">
          {children}
        </main>
        {agentOpen && (
          <div className="w-80 shrink-0 border-l border-border relative">
            <button
              onClick={() => setAgentOpen(false)}
              className="absolute top-3 right-3 z-10 p-1 rounded-md hover:bg-muted"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
            <AIAssistantSidebar />
          </div>
        )}
        {!agentOpen && (
          <button
            onClick={() => setAgentOpen(true)}
            className="fixed bottom-6 right-6 z-50 w-12 h-12 bg-primary text-primary-foreground rounded-full shadow-lg flex items-center justify-center hover:opacity-90 transition-opacity"
            title="AI 陪练"
          >
            <MessageCircle className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  )
}
