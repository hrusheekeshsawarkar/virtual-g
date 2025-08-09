"use client"
import { useRef, useState } from 'react'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import { Image as ImageIcon, Send } from 'lucide-react'

export function ChatInput({ onSend }: { onSend: (text: string | null, file: File | null) => Promise<void> }) {
  const [text, setText] = useState('')
  const [isSending, setIsSending] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!text && !fileRef.current?.files?.[0]) return
    try {
      setIsSending(true)
      await onSend(text || null, fileRef.current?.files?.[0] || null)
      setText('')
      if (fileRef.current) fileRef.current.value = ''
    } finally {
      setIsSending(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-3 rounded-xl bg-card/50 p-3">
      <label className="inline-flex cursor-pointer items-center justify-center rounded-lg border border-white/10 bg-white/5 p-2 hover:bg-white/10 transition-colors">
        <ImageIcon size={18} className="text-white/70" />
        <input ref={fileRef} type="file" accept="image/*" className="hidden" />
      </label>
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type something sweet..."
        className="min-h-[48px] flex-1 resize-none"
        rows={1}
      />
      <Button type="submit" disabled={isSending} size="sm" className="h-12 px-4">
        <Send size={16} className={isSending ? "mr-2" : ""} />
        {isSending ? "Sending..." : "Send"}
      </Button>
    </form>
  )
}


