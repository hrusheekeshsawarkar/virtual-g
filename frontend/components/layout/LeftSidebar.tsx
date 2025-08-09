"use client"
import Image from 'next/image'
import { Heart, Settings, User } from 'lucide-react'

export function LeftSidebar() {
  return (
    <div className="flex h-full w-64 flex-col bg-card border-r border-white/10">
      {/* Avatar Section */}
      <div className="flex flex-col items-center p-6 border-b border-white/10">
        <div className="relative mb-4">
          <Image 
            src="/avatar.png" 
            alt="Virtual-G" 
            width={80} 
            height={80} 
            className="rounded-full shadow-glow ring-2 ring-primary/30" 
          />
          <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-green-500 border-2 border-card"></div>
        </div>
        <h2 className="text-xl font-semibold text-white">Virtual-G</h2>
        <p className="text-sm text-white/60 text-center mt-1">Your flirty AI companion</p>
        <div className="flex items-center gap-1 mt-2 text-xs text-primary">
          <Heart size={12} className="fill-current" />
          <span>Always here for you</span>
        </div>
      </div>

      {/* Stats Section */}
      <div className="p-4 border-b border-white/10">
        <h3 className="text-sm font-medium text-white/80 mb-3">Your Connection</h3>
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-white/60">Messages sent</span>
            <span className="text-primary font-medium">127</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-white/60">Days together</span>
            <span className="text-primary font-medium">3</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-white/60">Mood level</span>
            <span className="text-green-400 font-medium">Flirty 💕</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="p-4 flex-1">
        <h3 className="text-sm font-medium text-white/80 mb-3">Quick Actions</h3>
        <div className="space-y-2">
          <button className="flex w-full items-center gap-3 rounded-lg bg-white/5 p-3 text-left text-sm hover:bg-white/10 transition-colors">
            <User size={16} className="text-primary" />
            <span className="text-white/80">Profile</span>
          </button>
          <button className="flex w-full items-center gap-3 rounded-lg bg-white/5 p-3 text-left text-sm hover:bg-white/10 transition-colors">
            <Settings size={16} className="text-primary" />
            <span className="text-white/80">Settings</span>
          </button>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="p-4 border-t border-white/10">
        <div className="text-xs text-white/40 text-center">
          Virtual-G v1.0
        </div>
      </div>
    </div>
  )
}
