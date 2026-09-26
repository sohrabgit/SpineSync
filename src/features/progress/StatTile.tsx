import type { ReactNode } from 'react'
import { Card } from '@/components/ui/Card'

/** A labelled number with a small graphic beside it that shows what the number means. */
export function StatTile({ label, value, visual, valueClass = 'text-ink' }: { label: string; value: string; visual?: ReactNode; valueClass?: string }) {
  return (
    <Card className="p-3">
      <p className="cap text-mute">{label}</p>
      <div className="mt-2 flex items-center justify-between gap-2">
        <p className={`text-2xl font-bold tracking-tight tabular-nums ${valueClass}`}>{value}</p>
        {visual}
      </div>
    </Card>
  )
}
