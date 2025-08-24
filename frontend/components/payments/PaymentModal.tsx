'use client'

import { useState, useEffect } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'
import { Button } from '../ui/Button'
import { CreditPurchaseForm } from './CreditPurchaseForm'
import { apiGet } from '../../lib/api'

// Initialize Stripe
const stripePromise = loadStripe('pk_test_51RxVQCIcxomAZY1wJV8v9sFA5ICLnA2WQhYTQP5IRjPkuzqlfSNCzr9krE4WIY5Rmfk9lsLTAlVRK2uWqo45EQQO00Nba0FgxD')

interface CreditPackage {
  credits: number
  price_gbp: number
  popular: boolean
  discount?: string
}

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  currentBalance: number
}

export function PaymentModal({ isOpen, onClose, onSuccess, currentBalance }: PaymentModalProps) {
  const [packages, setPackages] = useState<CreditPackage[]>([])
  const [selectedPackage, setSelectedPackage] = useState<CreditPackage | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isOpen) {
      loadPackages()
    }
  }, [isOpen])

  const loadPackages = async () => {
    try {
      setLoading(true)
      const data = await apiGet<CreditPackage[]>('/payments/packages')
      setPackages(data)
    } catch (error) {
      console.error('Failed to load packages:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 z-50 touch-manipulation">
      <div className="bg-card border border-white/10 rounded-lg p-4 sm:p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto scrollbar-thin">
        <div className="flex justify-between items-center mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-white">Purchase Credits</h2>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white text-2xl touch-manipulation p-1"
          >
            ×
          </button>
        </div>

        <div className="mb-4 sm:mb-6">
          <p className="text-sm text-white/60 mb-2">Current Balance:</p>
          <p className="text-base sm:text-lg font-semibold text-white">{currentBalance.toLocaleString()} credits</p>
        </div>

        {loading ? (
          <div className="text-center py-6 sm:py-8">
            <p className="text-white/60">Loading packages...</p>
          </div>
        ) : selectedPackage ? (
          <Elements stripe={stripePromise}>
            <CreditPurchaseForm
              package={selectedPackage}
              onSuccess={onSuccess}
              onCancel={() => setSelectedPackage(null)}
            />
          </Elements>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-white">Choose a Credit Package</h3>
            {packages.map((pkg) => (
              <div
                key={pkg.credits}
                className={`border rounded-lg p-3 sm:p-4 cursor-pointer transition-colors touch-manipulation ${
                  pkg.popular
                    ? 'border-primary bg-primary/10'
                    : 'border-white/20 hover:border-white/30 bg-white/5'
                }`}
                onClick={() => setSelectedPackage(pkg)}
              >
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                  <div className="flex-1">
                    <h4 className="font-semibold text-base sm:text-lg text-white flex flex-wrap items-center gap-2">
                      <span>{pkg.credits.toLocaleString()} Credits</span>
                      {pkg.popular && (
                        <span className="text-xs bg-primary text-white px-2 py-1 rounded">
                          Popular
                        </span>
                      )}
                    </h4>
                    {pkg.discount && (
                      <p className="text-sm text-green-400 font-medium mt-1">{pkg.discount}</p>
                    )}
                    <p className="text-xs sm:text-sm text-white/60 mt-1">
                      {(pkg.price_gbp / pkg.credits * 1000).toFixed(2)}p per 1000 credits
                    </p>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-xl sm:text-2xl font-bold text-white">£{pkg.price_gbp.toFixed(2)}</p>
                    <Button 
                      variant="primary"
                      className="mt-2 w-full sm:w-auto touch-manipulation"
                      size="sm"
                    >
                      Select
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
