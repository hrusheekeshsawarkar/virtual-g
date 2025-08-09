"use client"
import { useState } from 'react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { login } from '@/lib/api'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    try {
      await login(email, password)
      router.push('/')
    } catch (err: any) {
      setError(err.message || 'Login failed')
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <form onSubmit={onSubmit} className="glass w-full max-w-sm space-y-4 rounded-xl p-6">
        <h1 className="text-xl font-semibold">Welcome back</h1>
        <div className="space-y-2">
          <label className="text-sm opacity-80">Email</label>
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <label className="text-sm opacity-80">Password</label>
          <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        {error && <div className="text-sm text-red-400">{error}</div>}
        <Button className="w-full" type="submit">Login</Button>
        <p className="text-center text-sm text-white/60">
          Don&apos;t have an account? <a className="text-primary" href="/register">Register</a>
        </p>
      </form>
    </main>
  )
}


