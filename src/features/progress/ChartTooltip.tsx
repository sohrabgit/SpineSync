import type { ReactNode } from 'react'

export function ChartTooltipBox({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs shadow-lg shadow-slate-900/10">
      <p className="font-semibold text-slate-900">{title}</p>
      <div className="mt-0.5 space-y-0.5 text-slate-600">{children}</div>
    </div>
  )
}
