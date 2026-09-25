import type { ButtonHTMLAttributes } from 'react'
import { cn } from './cn'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-teal-700 text-white shadow-sm shadow-teal-900/20 hover:bg-teal-800 active:bg-teal-900 disabled:bg-slate-300 disabled:shadow-none',
  secondary: 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 active:bg-slate-100 disabled:text-slate-400',
  ghost: 'text-teal-800 hover:bg-teal-50 active:bg-teal-100 disabled:text-slate-400',
  danger: 'bg-rose-600 text-white hover:bg-rose-700 active:bg-rose-800',
}

export function Button({ variant = 'primary', className, type = 'button', ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold transition-all duration-150 active:scale-[0.98] disabled:cursor-not-allowed disabled:active:scale-100',
        VARIANTS[variant],
        className,
      )}
      {...props}
    />
  )
}
