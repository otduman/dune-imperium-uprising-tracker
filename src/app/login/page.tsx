"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function LoginPage() {
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      })

      if (res.ok) {
        router.push("/")
        router.refresh()
      } else {
        setError("Wrong password.")
        setPassword("")
      }
    } catch {
      setError("Something went wrong.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-xs space-y-6">
        <div className="space-y-1">
          <h1 className="font-mono text-base font-semibold tracking-wide text-foreground">
            DUNE: IMPERIUM
          </h1>
          <p className="font-mono text-xs text-muted-foreground tracking-widest uppercase">
            Season 01 · Admin Access
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="font-mono bg-background border-input"
            autoFocus
          />
          {error && (
            <p className="text-xs font-mono text-destructive">{error}</p>
          )}
          <Button type="submit" className="w-full" disabled={loading || !password}>
            {loading ? "Checking…" : "Enter"}
          </Button>
        </form>
      </div>
    </main>
  )
}
