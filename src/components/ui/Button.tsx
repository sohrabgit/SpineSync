import type { ButtonHTMLAttributes } from 'react'
import { cn } from './cn'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success'

// Hello Again button language: solid fills with a tactile bottom edge, sentence-case semibold labels.
const VARIANTS: Record<Variant, string> = {
  primary: 'border border-brand bg-brand text-bg press hover:brightness-105 disabled:border-line disabled:bg-panel-2 disabled:text-dim disabled:shadow-none disabled:hover:brightness-100',
  secondary: 'border border-line bg-panel-2 text-ink hover:border-line-strong active:bg-panel disabled:text-dim',
  ghost: 'border border-line bg-transparent text-mute hover:text-ink active:bg-panel-2 disabled:text-dim',
  danger: 'border border-danger bg-transparent text-danger hover:bg-danger/10 active:bg-danger/15',
  success: 'border border-success bg-success text-bg press hover:brightness-105',
}

export function Button({ variant = 'primary', className, type = 'button', ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold transition-all duration-150 active:scale-[0.97] disabled:cursor-not-allowed disabled:active:scale-100',
        VARIANTS[variant],
        className,
      )}
      {...props}
    />
  )
}
