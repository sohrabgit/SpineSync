import { useId } from 'react'
import { vasColor, vasLabel } from '@/components/ui/tone'

export function VasSlider({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const id = useId()
  const color = vasColor(value)
  return (
    <div>
      <div className="flex items-end justify-between">
        <label htmlFor={id} className="text-sm font-semibold text-ink">
          Neck pain right now
          <span className="block text-xs font-normal text-mute">0 = no pain · 10 = unbearable</span>
        </label>
        <div className="text-right" aria-hidden>
          <span className="text-4xl font-bold tabular-nums transition-colors duration-200" style={{ color }}>
            {value}
          </span>
          <span className="text-sm text-dim">/10</span>
          <p className="text-xs font-semibold transition-colors" style={{ color }}>
            {vasLabel(value)}
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
        aria-valuetext={`${value} out of 10, ${vasLabel(value)}`}
        className="vas-range mt-4"
        style={{ ['--thumb' as string]: color }}
      />
      <div className="mt-1.5 flex justify-between px-[6px] text-[10px] font-medium text-dim tabular-nums" aria-hidden>
        {Array.from({ length: 11 }, (_, i) => (
          <span key={i} className={i === value ? 'font-bold text-ink' : undefined}>
            {i}
          </span>
        ))}
      </div>
    </div>
  )
}
