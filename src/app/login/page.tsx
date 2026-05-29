"use client"

import React, { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Music, Mail, Lock, Eye, EyeOff } from "lucide-react"

export default function Login() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      setError("请填写邮箱和密码")
      return
    }

    setLoading(true)
    setError("")

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (res.ok && data.success) {
        router.push("/")
      } else {
        setError(data.error || "登录失败")
      }
    } catch {
      setError("网络错误，请稍后重试")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Music className="text-primary w-10 h-10" />
            <h1 className="text-3xl font-bold text-primary">踏乐行</h1>
          </div>
          <p className="text-muted-foreground">欢迎回来！登录以继续</p>
        </div>

        <div className="bg-card rounded-2xl p-8 border border-border shadow-card">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 text-red-600 text-sm rounded-lg p-3 text-center">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                邮箱
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="请输入邮箱"
                  autoComplete="email"
                  className="w-full bg-muted border-none rounded-lg pl-10 pr-4 py-3 text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                密码
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="请输入密码"
                  autoComplete="current-password"
                  className="w-full bg-muted border-none rounded-lg pl-10 pr-12 py-3 text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? "登录中..." : "登录"}
            </button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-card text-muted-foreground">其他登录方式</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-3">
              {["QQ", "微信", "GitHub"].map((provider) => (
                <button
                  key={provider}
                  className="flex items-center justify-center gap-2 py-3 border border-border rounded-lg text-foreground hover:bg-muted transition-colors"
                >
                  <span className="text-sm font-medium">{provider}</span>
                </button>
              ))}
            </div>
          </div>

          <p className="mt-4 text-center text-sm text-muted-foreground">
            还没有账号？
            <Link href="/register" className="text-primary hover:underline ml-1">
              注册账号
            </Link>
          </p>

          <div className="mt-3 text-center">
            <button
              onClick={async () => {
                setLoading(true)
                try {
                  const res = await fetch("/api/auth/guest")
                  if (res.ok) {
                    router.push("/")
                  } else {
                    setError("游客模式暂时不可用")
                  }
                } catch {
                  setError("网络错误")
                } finally {
                  setLoading(false)
                }
              }}
              disabled={loading}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              跳过登录，先看看
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
