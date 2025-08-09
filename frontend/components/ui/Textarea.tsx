import * as React from 'react'
import clsx from 'classnames'

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={clsx(
        'flex min-h-[80px] w-full rounded-md border border-white/10 bg-[#0b0b0d] px-3 py-2 text-sm placeholder:text-white/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
        className
      )}
      {...props}
    />
  )
)
Textarea.displayName = 'Textarea'


