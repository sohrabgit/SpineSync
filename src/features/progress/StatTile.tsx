import type { LucideIcon } from 'lucide-react'
import { Card } from '@/components/ui/Card'

interface Props {
  label: string
  value: string
  hint?: string
  icon: LucideIcon
  iconClass?: string
}

export function StatTile({ label, value, hint, icon: Icon, iconClass = 'bg-brand text-bg' }: Props) {
  return (
    <Card className="p-3">
      <div className="flex items-center gap-2">
        <span className={`knob grid size-8 place-items-center ${iconClass}`}>
          <Icon className="size-4" strokeWidth={2.2} aria-hidden />
        </span>
        <p className="cap text-[11px] text-mute">{label}</p>
      </div>
      <p className="mt-2 text-2xl font-bold tracking-tight tabular-nums text-ink">{value}</p>
      {hint && <p className="mt-0.5 text-[11px] text-mute">{hint}</p>}
    </Card>
  )
}
