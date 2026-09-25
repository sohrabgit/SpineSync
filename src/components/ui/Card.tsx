import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from './cn'

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm shadow-slate-900/[0.03]', className)} {...props} />
}

export function SectionTitle({ title, action, className }: { title: string; action?: ReactNode; className?: string }) {
  return (
    <div className={cn('mb-2 flex items-center justify-between px-1', className)}>
      <h2 className="text-xs font-semibold tracking-wider text-slate-500 uppercase">{title}</h2>
      {action}
    </div>
  )
}
