'use client'

import { useState } from 'react'
import { 
  useStripe, 
  useElements, 
  CardElement,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement
} from '@stripe/react-stripe-js'
import { Button } from '../ui/Button'
import { apiPost } from '../../lib/api'

interface CreditPackage {
  credits: number
  price_gbp: number
  popular: boolean
  discount?: string
}

interface CreditPurchaseFormProps {
  package: CreditPackage
  onSuccess: () => void
  onCancel: () => void
}

export function CreditPurchaseForm({ package: pkg, onSuccess, onCancel }: CreditPurchaseFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!stripe || !elements) {
      return
    }

    setIsProcessing(true)
    setError(null)

    try {
      // Create payment intent
      const { client_secret } = await apiPost<{ client_secret: string }>('/payments/create-intent', {
        credits: pkg.credits
      })

      // Confirm payment
      const cardElement = elements.getElement(CardNumberElement)
      if (!cardElement) {
        throw new Error('Card element not found')
      }

      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(client_secret, {
        payment_method: {
          card: cardElement,
        }
      })

      if (stripeError) {
        setError(stripeError.message || 'Payment failed')
      } else if (paymentIntent?.status === 'succeeded') {
        // Payment succeeded, now confirm it with our backend
        try {
          await apiPost('/payments/confirm', {
            payment_intent_id: paymentIntent.id
          })
          onSuccess()
        } catch (confirmError: any) {
          setError(`Payment succeeded but failed to add credits: ${confirmError.message}`)
        }
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setIsProcessing(false)
    }
  }

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#ffffff',
        backgroundColor: 'transparent',
        '::placeholder': {
          color: '#ffffff60',
        },
      },
      invalid: {
        color: '#ff6b6b',
      },
    },
  }

  return (
    <div>
      <div className="mb-6 p-4 bg-white/5 border border-white/10 rounded-lg">
        <h3 className="font-semibold text-white">Order Summary</h3>
        <div className="flex justify-between mt-2">
          <span className="text-white/80">{pkg.credits.toLocaleString()} Credits</span>
          <span className="text-white font-semibold">£{pkg.price_gbp.toFixed(2)}</span>
        </div>
        {pkg.discount && (
          <p className="text-sm text-green-400 mt-1">{pkg.discount}</p>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Card Number
            </label>
            <div className="border border-white/20 bg-white/5 rounded-md p-3">
              <CardNumberElement options={cardElementOptions} />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Expiry Date
              </label>
              <div className="border border-white/20 bg-white/5 rounded-md p-3">
                <CardExpiryElement options={cardElementOptions} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                CVC
              </label>
              <div className="border border-white/20 bg-white/5 rounded-md p-3">
                <CardCvcElement options={cardElementOptions} />
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-md text-red-400 text-sm">
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={isProcessing}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={!stripe || isProcessing}
            className="flex-1"
          >
            {isProcessing ? 'Processing...' : `Pay £${pkg.price_gbp.toFixed(2)}`}
          </Button>
        </div>
      </form>

      <div className="mt-4 text-xs text-white/40">
        <p>Powered by Stripe. Your payment information is secure and encrypted.</p>
      </div>
    </div>
  )
}
