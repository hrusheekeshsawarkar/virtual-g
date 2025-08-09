"use client"
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { getAuthToken } from '@/lib/api'
import { LeftSidebar } from '@/components/layout/LeftSidebar'
import { RightSidebar } from '@/components/layout/RightSidebar'
import { ChatWindow } from '@/components/chat/ChatWindow'

export default function HomePage() {
  const router = useRouter()
  const [selectedSession, setSelectedSession] = useState<string | null>(null)
  const [sessionKey, setSessionKey] = useState(0) // Force re-render

  useEffect(() => {
    if (!getAuthToken()) router.push('/login')
  }, [router])

  const handleSessionSelect = (sessionId: string) => {
    setSelectedSession(sessionId)
  }

  const handleNewChat = () => {
    setSelectedSession(null)
    setSessionKey(prev => prev + 1) // Force ChatWindow to clear
  }

  const handleSessionsChange = () => {
    setSessionKey(prev => prev + 1) // Refresh sessions
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Left Sidebar */}
      <LeftSidebar />
      
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="flex items-center justify-between p-4 border-b border-white/10 bg-card/30">
          <div>
            <h1 className="text-lg font-semibold text-white">Chat with Virtual-G</h1>
            <p className="text-xs text-white/60">She's online and ready to chat 💕</p>
          </div>
          <nav className="flex items-center gap-4 text-sm">
            <a className="text-white/70 hover:text-primary transition-colors" href="/profile">
              Profile
            </a>
            <button
              className="text-white/70 hover:text-red-400 transition-colors"
              onClick={() => {
                localStorage.removeItem('vg_token')
                router.push('/login')
              }}
            >
              Logout
            </button>
          </nav>
        </header>
        
        {/* Chat Window */}
        <div className="flex-1 overflow-hidden">
          <ChatWindow 
            key={sessionKey}
            sessionId={selectedSession} 
            onSessionChange={handleSessionsChange}
          />
        </div>
      </div>
      
      {/* Right Sidebar */}
      <RightSidebar 
        selectedSession={selectedSession}
        onSessionSelect={handleSessionSelect}
        onNewChat={handleNewChat}
        onSessionsChange={handleSessionsChange}
      />
    </div>
  )
}


