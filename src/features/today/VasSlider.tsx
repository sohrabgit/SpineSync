import { useId } from 'react'
import { vasColor } from '@/components/ui/tone'
import { vasBand } from '@/lib/metrics'
import { useI18n } from '@/i18n'

export function VasSlider({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const id = useId()
  const color = vasColor(value)
  const { m, n } = useI18n()
  const label = m.vas[vasBand(value)]
  return (
    <div>
      <div className="flex items-end justify-between">
        <label htmlFor={id} className="text-sm font-semibold text-ink">
          {m.checkin.painNow}
          <span className="block text-xs font-normal text-mute">{m.checkin.scale}</span>
        </label>
        <div className="text-end" aria-hidden>
          <span className="text-4xl font-bold tabular-nums transition-colors duration-200" style={{ color }}>
            {n(value)}
          </span>
          <span className="text-sm text-dim">/{n(10)}</span>
          <p className="text-xs font-semibold transition-colors" style={{ color }}>
            {label}
          </p>
        </div>
      </div>
      <input
        id={id}
        type="range"
        min={0}
        max={10}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-valuetext={m.checkin.valueText(value, label)}
        className="vas-range mt-4"
        style={{ ['--thumb' as string]: color }}
      />
      <div className="mt-1.5 flex justify-between px-[6px] text-[10px] font-medium text-dim tabular-nums" aria-hidden>
        {Array.from({ length: 11 }, (_, i) => (
          <span key={i} className={i === value ? 'font-bold text-ink' : undefined}>
            {n(i)}
          </span>
        ))}
      </div>
    </div>
  )
}
