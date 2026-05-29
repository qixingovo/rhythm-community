"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Music, Bell, LogOut } from "lucide-react"

export function Header() {
  const [username, setUsername] = useState("")
  const [loaded, setLoaded] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        if (d.user?.username) setUsername(d.user.username)
      })
      .catch(() => {})
      .finally(() => setLoaded(true))
  }, [])

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    router.push("/login")
  }

  return (
    <header className="bg-card sticky top-0 z-40 h-16 flex items-center justify-between px-6 border-b border-border">
      <div className="flex items-center gap-3">
        <Music className="text-primary w-6 h-6" />
        <Link href="/" className="font-bold text-xl text-primary">
          踏乐行
        </Link>
      </div>
      <div className="flex items-center gap-4">
        {loaded && !username && (
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              登录
            </Link>
            <Link
              href="/register"
              className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
            >
              注册
            </Link>
          </div>
        )}
        {username && (
          <>
            <button className="p-2 rounded-md hover:bg-secondary transition-colors">
              <Bell className="w-5 h-5 text-muted-foreground" />
            </button>
            <Link href="/profile" className="flex items-center gap-3 hover:opacity-80">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold text-sm">
                {username[0]}
              </div>
              <span className="text-sm font-medium">{username}</span>
            </Link>
            <button
              onClick={handleLogout}
              className="p-2 rounded-md hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
              title="退出登录"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </>
        )}
      </div>
    </header>
  )
}
