import { Minus, Plus } from 'lucide-react'

export function Stepper({ value, onChange, label, min = 0, max = 24 }: { value: number; onChange: (v: number) => void; label: string; min?: number; max?: number }) {
  const btn = 'grid size-10 place-items-center rounded-full border border-slate-200 bg-white text-slate-700 transition active:scale-95 disabled:opacity-40'
  return (
    <div className="flex items-center gap-3" role="group" aria-label={label}>
      <button type="button" className={btn} onClick={() => onChange(value - 1)} disabled={value <= min} aria-label={`Decrease ${label}`}>
        <Minus className="size-4" />
      </button>
      <span className="w-6 text-center text-lg font-bold tabular-nums text-slate-900" aria-live="polite">
        {value}
      </span>
      <button type="button" className={btn} onClick={() => onChange(value + 1)} disabled={value >= max} aria-label={`Increase ${label}`}>
        <Plus className="size-4" />
      </button>
    </div>
  )
}
