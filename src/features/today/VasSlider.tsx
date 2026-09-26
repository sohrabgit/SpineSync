import { useId } from 'react'
import { vasColor } from '@/components/ui/tone'
import { PainFace } from '@/components/ui/PainFace'
import { vasBand } from '@/lib/metrics'
import { useI18n } from '@/i18n'

export function VasSlider({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const id = useId()
  const color = vasColor(value)
  const { m, n } = useI18n()
  const label = m.vas[vasBand(value)]
  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <label htmlFor={id} className="text-sm font-semibold text-ink">
          {m.checkin.painNow}
        </label>
        <div className="flex items-center gap-2.5" aria-hidden>
          <PainFace vas={value} size={42} />
          <div className="text-end leading-none">
            <span className="text-4xl font-bold tabular-nums transition-colors duration-200" style={{ color }}>
              {n(value)}
            </span>
            <p className="mt-1 text-xs font-semibold transition-colors" style={{ color }}>
              {label}
            </p>
          </div>
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
        className="vas-range mt-3"
        style={{ ['--thumb' as string]: color }}
      />
      <div className="mt-1.5 flex justify-between px-[6px] text-[11px] font-medium text-dim tabular-nums" aria-hidden>
        <span>{n(0)}</span>
        <span>{n(10)}</span>
      </div>
    </div>
  )
}
