import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from './cn'

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('rounded-2xl border border-line/60 bg-panel p-4', className)} {...props} />
}

export function SectionTitle({ title, action, className }: { title: string; action?: ReactNode; className?: string }) {
  return (
    <div className={cn('mb-2 flex items-end justify-between gap-3 px-1', className)}>
      <h2 className="cap text-mute">{title}</h2>
      {action}
    </div>
  )
}
