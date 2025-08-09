"use client"
import { useRef, useState } from 'react'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import { Image as ImageIcon, Send } from 'lucide-react'

export function ChatInput({ onSend }: { onSend: (text: string | null, file: File | null) => Promise<void> }) {
  const [text, setText] = useState('')
  const [isSending, setIsSending] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  async function doSend() {
    if (!text && !fileRef.current?.files?.[0]) return
    try {
      setIsSending(true)
      // Clear input immediately while sending to give instant feedback
      const fileToSend = fileRef.current?.files?.[0] || null
      const textToSend = text || null
      setText('')
      if (fileRef.current) fileRef.current.value = ''
      await onSend(textToSend, fileToSend)
    } finally {
      setIsSending(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    await doSend()
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-3 rounded-xl bg-card/50 p-3">
      <label className={`inline-flex items-center justify-center rounded-lg border border-white/10 bg-white/5 p-2 transition-colors ${isSending ? 'opacity-50 pointer-events-none' : 'cursor-pointer hover:bg-white/10'}`}>
        <ImageIcon size={18} className="text-white/70" />
        <input ref={fileRef} type="file" accept="image/*" className="hidden" />
      </label>
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={async (e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            if (!isSending) {
              await doSend()
            }
          }
        }}
        placeholder="Type something sweet..."
        className="min-h-[48px] flex-1 resize-none"
        disabled={isSending}
        rows={1}
      />
      <Button type="submit" disabled={isSending} size="sm" className="h-12 px-4">
        <Send size={16} className={isSending ? "mr-2" : ""} />
        {isSending ? "Sending..." : "Send"}
      </Button>
    </form>
  )
}


