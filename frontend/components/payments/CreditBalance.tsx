'use client'

import { useState, useEffect } from 'react'
import { Button } from '../ui/Button'
import { PaymentModal } from './PaymentModal'
import { apiGet } from '../../lib/api'

interface UsageData {
  credits_used: number
  credits_available: number
  total_credits_purchased: number
}

interface CreditBalanceProps {
  className?: string
}

export function CreditBalance({ className }: CreditBalanceProps) {
  const [usage, setUsage] = useState<UsageData | null>(null)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadUsage()
  }, [])

  const loadUsage = async () => {
    try {
      const data = await apiGet<UsageData>('/usage')
      setUsage(data)
    } catch (error) {
      console.error('Failed to load usage:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePaymentSuccess = () => {
    setShowPaymentModal(false)
    loadUsage() // Refresh balance
    // Also refresh the entire page to update user session
    setTimeout(() => {
      window.location.reload()
    }, 1000)
  }

  if (loading) {
    return (
      <div className={`p-4 bg-card border border-white/10 rounded-lg ${className}`}>
        <p className="text-sm text-white/60">Loading balance...</p>
      </div>
    )
  }

  if (!usage) {
    return (
      <div className={`p-4 bg-red-500/10 border border-red-500/20 rounded-lg ${className}`}>
        <p className="text-sm text-red-400">Failed to load balance</p>
      </div>
    )
  }

  const isLowBalance = usage.credits_available < 100

  return (
    <>
      <div className={`p-4 bg-card border border-white/10 rounded-lg ${className} ${isLowBalance ? 'border-orange-400/30 bg-orange-500/5' : ''}`}>
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-semibold text-white">Credit Balance</h3>
            {isLowBalance && (
              <p className="text-sm text-orange-400 mt-1">
                Low balance! Purchase more credits to continue chatting.
              </p>
            )}
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowPaymentModal(true)}
          >
            Buy Credits
          </Button>
        </div>
        
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-white/60">Available:</span>
            <span className={`font-medium ${isLowBalance ? 'text-orange-400' : 'text-white'}`}>
              {usage.credits_available.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/60">Used:</span>
            <span className="text-white">{usage.credits_used.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/60">Total Purchased:</span>
            <span className="text-white">{usage.total_credits_purchased.toLocaleString()}</span>
          </div>
        </div>

        <div className="mt-3 bg-white/10 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all ${
              isLowBalance ? 'bg-orange-400' : 'bg-primary'
            }`}
            style={{ 
              width: `${Math.min(100, (usage.credits_available / Math.max(usage.total_credits_purchased, 1000)) * 100)}%` 
            }}
          />
        </div>
      </div>

      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onSuccess={handlePaymentSuccess}
        currentBalance={usage.credits_available}
      />
    </>
  )
}
