"use client"
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { toApiAbsoluteUrl } from '@/lib/api'
import { FormattedMessage } from './FormattedMessage'

type Message = {
  role: 'user' | 'ai'
  content: string
  timestamp: string
  type: 'text' | 'image'
}

export function MessageList({ messages }: { messages: Message[] }) {
  return (
    <div className="space-y-3">
      <AnimatePresence initial={false}>
        {messages.map((m, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[90%] sm:max-w-[85%] rounded-2xl px-3 sm:px-4 py-2 sm:py-3 text-sm shadow-md ${
                m.role === 'user' ? 'bg-primary text-white' : 'bg-card text-white'
              }`}
            >
              {m.type === 'image' ? (
                <div className="space-y-2">
                  <Image 
                    src={toApiAbsoluteUrl(m.content)} 
                    alt="uploaded" 
                    width={280} 
                    height={280} 
                    className="rounded-lg w-full max-w-[280px] sm:max-w-[320px] h-auto" 
                  />
                </div>
              ) : (
                <FormattedMessage content={m.content} />
              )}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}


