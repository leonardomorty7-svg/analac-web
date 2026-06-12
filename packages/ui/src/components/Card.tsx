import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../utils/cn'

const cardVariants = cva('rounded-xl border bg-white transition-shadow', {
  variants: {
    variant: {
      default: 'border-gray-200 shadow-sm hover:shadow-md',
      elevated: 'border-transparent shadow-md hover:shadow-lg',
      outlined: 'border-gray-300 shadow-none',
      ghost: 'border-transparent bg-gray-50',
    },
    padding: {
      none: 'p-0',
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
    },
  },
  defaultVariants: {
    variant: 'default',
    padding: 'md',
  },
})

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, padding, ...props }, ref) => (
    <div ref={ref} className={cn(cardVariants({ variant, padding }), className)} {...props} />
  ),
)

Card.displayName = 'Card'
