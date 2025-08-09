import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Virtual-G',
  description: 'Chat with your flirty virtual AI companion',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-black text-white overflow-hidden">
        {children}
      </body>
    </html>
  )
}


