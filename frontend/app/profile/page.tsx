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
    <main className="py-4 sm:py-6 px-4 sm:px-6 min-h-screen safe-area-inset">
      <div className="glass rounded-2xl p-4 sm:p-6 max-w-2xl mx-auto">
        <h1 className="text-lg sm:text-xl font-semibold">Profile</h1>
        <div className="mt-3 sm:mt-4 text-sm sm:text-base text-white/80">
          Total credits used: <span className="font-semibold text-primary">{credits}</span>
        </div>
        <div className="mt-4 sm:mt-6">
          <a href="/" className="text-sm text-primary hover:text-primary/80 transition-colors touch-manipulation">
            ← Back to chat
          </a>
        </div>
      </div>
    </main>
  )
}


