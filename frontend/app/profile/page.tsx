"use client"
import { useEffect, useState } from 'react'
import { apiGet } from '@/lib/api'
import { useRouter } from 'next/navigation'

export default function ProfilePage() {
  const [credits, setCredits] = useState<number>(0)
  const router = useRouter()

  useEffect(() => {
    apiGet<{ credits_used: number }>(`/usage`)
      .then((d) => setCredits(d.credits_used))
      .catch(() => router.push('/login'))
  }, [router])

  return (
    <main className="py-6">
      <div className="glass rounded-2xl p-6">
        <h1 className="text-xl font-semibold">Profile</h1>
        <div className="mt-4 text-white/80">Total credits used: <span className="font-semibold text-primary">{credits}</span></div>
        <div className="mt-6">
          <a href="/" className="text-sm text-primary">Back to chat</a>
        </div>
      </div>
    </main>
  )
}


