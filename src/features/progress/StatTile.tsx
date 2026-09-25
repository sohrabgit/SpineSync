import type { LucideIcon } from 'lucide-react'
import { Card } from '@/components/ui/Card'

interface Props {
  label: string
  value: string
  hint?: string
  icon: LucideIcon
  iconClass?: string
}

export function StatTile({ label, value, hint, icon: Icon, iconClass = 'bg-teal-50 text-teal-700' }: Props) {
  return (
    <Card className="p-3">
      <div className="flex items-center gap-2">
        <span className={`grid size-7 place-items-center rounded-lg ${iconClass}`}>
          <Icon className="size-3.5" aria-hidden />
        </span>
        <p className="text-xs font-medium text-slate-500">{label}</p>
      </div>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">{value}</p>
      {hint && <p className="mt-0.5 text-[11px] text-slate-500">{hint}</p>}
    </Card>
  )
}
