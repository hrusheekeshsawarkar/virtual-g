import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import clsx from 'classnames'

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50 disabled:pointer-events-none',
  {
    variants: {
      variant: {
        default: 'bg-primary text-white hover:opacity-90 shadow-glow',
        primary: 'bg-blue-600 text-white hover:bg-blue-700',
        secondary: 'bg-white/10 text-white border border-white/20 hover:bg-white/15',
        ghost: 'bg-transparent hover:bg-muted',
        outline: 'border border-white/10 hover:bg-muted',
      },
      size: {
        sm: 'h-8 px-3',
        md: 'h-10 px-4',
        lg: 'h-12 px-6',
      },
    },
    defaultVariants: { variant: 'default', size: 'md' },
  }
)

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants>

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return <button className={clsx(buttonVariants({ variant, size }), className)} {...props} />
}


