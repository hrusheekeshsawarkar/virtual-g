"use client"
import { useState, useEffect } from 'react'
import { Plus, MessageCircle, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { apiGet, apiPost, apiDelete } from '@/lib/api'

interface ChatSession {
  id: string
  title: string
  lastMessage: string
  timestamp: string
  messageCount: number
}

interface RightSidebarProps {
  selectedSession: string | null
  onSessionSelect: (sessionId: string) => void
  onNewChat: () => void
  onSessionsChange: () => void
}

export function RightSidebar({ selectedSession, onSessionSelect, onNewChat, onSessionsChange }: RightSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSessions()
  }, [])

  const loadSessions = async () => {
    try {
      setLoading(true)
      const data = await apiGet<{ sessions: ChatSession[] }>('/sessions')
      setSessions(data.sessions)
    } catch (error) {
      console.error('Failed to load sessions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleNewChat = async () => {
    try {
      const data = await apiPost<{ session_id: string }>('/sessions', {})
      await loadSessions() // Refresh sessions list
      onSessionsChange() // Notify parent
      onNewChat() // Clear current chat
      onSessionSelect(data.session_id) // Select new session
    } catch (error) {
      console.error('Failed to create new chat:', error)
    }
  }

  const handleDeleteSession = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await apiDelete(`/sessions/${sessionId}`)
      await loadSessions() // Refresh sessions list
      onSessionsChange() // Notify parent
      if (selectedSession === sessionId) {
        onNewChat() // Clear current chat if deleted session was selected
      }
    } catch (error) {
      console.error('Failed to delete session:', error)
    }
  }

  if (isCollapsed) {
    return (
      <div className="flex h-full w-12 flex-col bg-card border-l border-white/10">
        <button 
          onClick={() => setIsCollapsed(false)}
          className="flex h-12 items-center justify-center border-b border-white/10 hover:bg-white/5 transition-colors"
        >
          <ChevronLeft size={16} className="text-white/60" />
        </button>
        <div className="flex-1 flex flex-col items-center gap-3 p-2">
          <button 
            onClick={handleNewChat}
            className="p-2 rounded-lg bg-primary hover:opacity-90 transition-opacity"
          >
            <Plus size={16} />
          </button>
          {sessions.map((session) => (
            <button
              key={session.id}
              onClick={() => onSessionSelect(session.id)}
              className={`p-2 rounded-lg transition-colors ${
                selectedSession === session.id 
                  ? 'bg-primary/20 ring-1 ring-primary' 
                  : 'bg-white/5 hover:bg-white/10'
              }`}
            >
              <MessageCircle size={16} className="text-white/70" />
            </button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full w-80 flex-col bg-card border-l border-white/10">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <h2 className="text-lg font-semibold text-white">Chat Sessions</h2>
        <button 
          onClick={() => setIsCollapsed(true)}
          className="p-1 rounded hover:bg-white/10 transition-colors"
        >
          <ChevronRight size={16} className="text-white/60" />
        </button>
      </div>

      {/* New Chat Button */}
      <div className="p-4 border-b border-white/10">
        <Button onClick={handleNewChat} className="w-full" size="sm">
          <Plus size={16} className="mr-2" />
          New Chat
        </Button>
      </div>

      {/* Sessions List */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        <div className="p-2 space-y-2">
          {loading ? (
            <div className="text-center text-white/60 text-sm p-4">Loading sessions...</div>
          ) : sessions.length === 0 ? (
            <div className="text-center text-white/60 text-sm p-4">No chat sessions yet</div>
          ) : (
            sessions.map((session) => (
              <div
                key={session.id}
                onClick={() => onSessionSelect(session.id)}
                className={`group relative rounded-lg p-3 cursor-pointer transition-all ${
                  selectedSession === session.id 
                    ? 'bg-primary/10 ring-1 ring-primary/30' 
                    : 'hover:bg-white/5'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-sm font-medium text-white truncate pr-2">
                    {session.title}
                  </h3>
                  <button 
                    onClick={(e) => handleDeleteSession(session.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-500/20 transition-all"
                  >
                    <Trash2 size={12} className="text-red-400" />
                  </button>
                </div>
                
                <p className="text-xs text-white/60 line-clamp-2 mb-2">
                  {session.lastMessage || 'No messages yet'}
                </p>
                
                <div className="flex items-center justify-between text-xs">
                  <span className="text-primary font-medium">{session.messageCount} msgs</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-white/10">
        <div className="text-xs text-white/40 text-center">
          {sessions.length} chat sessions
        </div>
      </div>
    </div>
  )
}
