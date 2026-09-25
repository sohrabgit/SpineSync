import { Minus, Plus } from 'lucide-react'
import { useI18n } from '@/i18n'

export function Stepper({ value, onChange, label, min = 0, max = 24 }: { value: number; onChange: (v: number) => void; label: string; min?: number; max?: number }) {
  const { m, n } = useI18n()
  const btn = 'grid size-10 place-items-center rounded-full border border-line bg-panel-2 text-ink transition active:scale-95 disabled:opacity-40'
  return (
    <div className="flex items-center gap-3" role="group" aria-label={label}>
      <button type="button" className={btn} onClick={() => onChange(value - 1)} disabled={value <= min} aria-label={m.stepper.decrease(label)}>
        <Minus className="size-4" />
      </button>
      <span className="w-7 text-center text-xl font-bold tabular-nums text-ink" aria-live="polite">
        {n(value)}
      </span>
      <button type="button" className={btn} onClick={() => onChange(value + 1)} disabled={value >= max} aria-label={m.stepper.increase(label)}>
        <Plus className="size-4" />
      </button>
    </div>
  )
}
