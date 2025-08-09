"use client"
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { getAuthToken } from '@/lib/api'
import { LeftSidebar } from '@/components/layout/LeftSidebar'
import { RightSidebar } from '@/components/layout/RightSidebar'
import { ChatWindow } from '@/components/chat/ChatWindow'
import { Menu, MessagesSquare, X } from 'lucide-react'

export default function HomePage() {
  const router = useRouter()
  const [selectedSession, setSelectedSession] = useState<string | null>(null)
  const [sessionKey, setSessionKey] = useState(0) // Force re-render
  const [showLeftMobile, setShowLeftMobile] = useState(false)
  const [showRightMobile, setShowRightMobile] = useState(false)

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
      {/* Left Sidebar (desktop) */}
      <div className="hidden md:block">
        <LeftSidebar />
      </div>
      
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="flex items-center justify-between p-4 border-b border-white/10 bg-card/30">
          <div className="flex items-center gap-3">
            {/* Mobile menu buttons */}
            <button
              className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
              onClick={() => setShowLeftMobile(true)}
              aria-label="Open avatar panel"
            >
              <Menu size={18} />
            </button>
            <h1 className="text-lg font-semibold text-white">Chat with Virtual-G</h1>
            <p className="text-xs text-white/60">She's online and ready to chat 💕</p>
          </div>
          <nav className="flex items-center gap-2 md:gap-4 text-sm">
            <button
              className="md:hidden inline-flex items-center gap-2 rounded-lg bg-primary/20 px-3 py-2 text-primary hover:bg-primary/30 transition-colors"
              onClick={() => setShowRightMobile(true)}
              aria-label="Open chat sessions"
            >
              <MessagesSquare size={16} />
              Sessions
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
      
      {/* Right Sidebar (desktop) */}
      <div className="hidden md:block">
        <RightSidebar 
          selectedSession={selectedSession}
          onSessionSelect={handleSessionSelect}
          onNewChat={handleNewChat}
          onSessionsChange={handleSessionsChange}
        />
      </div>

      {/* Left Sidebar (mobile overlay) */}
      {showLeftMobile && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm md:hidden" onClick={() => setShowLeftMobile(false)}>
          <div className="absolute left-0 top-0 h-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex h-12 items-center justify-end pr-2">
              <button
                className="m-2 inline-flex h-8 w-8 items-center justify-center rounded bg-white/10 hover:bg-white/20"
                onClick={() => setShowLeftMobile(false)}
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>
            <LeftSidebar />
          </div>
        </div>
      )}

      {/* Right Sidebar (mobile overlay) */}
      {showRightMobile && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm md:hidden" onClick={() => setShowRightMobile(false)}>
          <div className="absolute right-0 top-0 h-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex h-12 items-center justify-start pl-2">
              <button
                className="m-2 inline-flex h-8 w-8 items-center justify-center rounded bg-white/10 hover:bg-white/20"
                onClick={() => setShowRightMobile(false)}
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>
            <RightSidebar 
              selectedSession={selectedSession}
              onSessionSelect={(id) => { setShowRightMobile(false); handleSessionSelect(id) }}
              onNewChat={() => { setShowRightMobile(false); handleNewChat() }}
              onSessionsChange={handleSessionsChange}
            />
          </div>
        </div>
      )}
    </div>
  )
}


