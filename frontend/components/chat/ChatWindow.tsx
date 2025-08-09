"use client"
import { useEffect, useRef, useState } from 'react'
import { apiGet, apiPost } from '@/lib/api'
import { ChatInput } from './ChatInput'
import { MessageList } from './MessageList'

type Message = {
  role: 'user' | 'ai'
  content: string
  timestamp: string
  type: 'text' | 'image'
}

interface ChatWindowProps {
  sessionId: string | null
  onSessionChange?: () => void
}

export function ChatWindow({ sessionId, onSessionChange }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const messagesRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (sessionId) {
      apiGet<{ session_id: string; messages: Message[] }>(`/sessions/${sessionId}/history`)
        .then((data) => setMessages(data.messages))
        .catch(() => setMessages([]))
    } else {
      // Load default session or clear messages
      apiGet<{ session_id: string; messages: Message[] }>(`/chat/history`)
        .then((data) => setMessages(data.messages))
        .catch(() => setMessages([]))
    }
  }, [sessionId])

  useEffect(() => {
    messagesRef.current?.scrollTo({ top: messagesRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  async function handleSend(text: string | null, file: File | null) {
    let image_url: string | undefined
    if (file) {
      const form = new FormData()
      form.append('file', file)
      const upload = await apiPost<{ url: string }>(`/upload`, form, true)
      image_url = upload.url
      setMessages((prev) => [
        ...prev,
        { role: 'user', content: upload.url, timestamp: new Date().toISOString(), type: 'image' },
      ])
    } else if (text) {
      setMessages((prev) => [
        ...prev,
        { role: 'user', content: text, timestamp: new Date().toISOString(), type: 'text' },
      ])
    }

    const url = sessionId ? `/chat?session_id=${sessionId}` : '/chat'
    const data = await apiPost<{ reply: Message }>(url, { text, image_url })
    setMessages((prev) => [...prev, data.reply])
    onSessionChange?.() // Notify parent that session may have changed
  }

  return (
    <div className="flex h-full flex-col">
      <div ref={messagesRef} className="flex-1 overflow-y-auto scrollbar-thin p-4">
        <MessageList messages={messages} />
      </div>
      <div className="border-t border-white/10 p-4">
        <ChatInput onSend={handleSend} />
      </div>
    </div>
  )
}


