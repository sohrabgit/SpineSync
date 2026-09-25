import { useMemo, useState } from 'react'
import { ChevronDown, ShieldAlert, Zap } from 'lucide-react'
import type { PainCheckin, RedFlagId } from '@/types/recovery'
import { RED_FLAGS } from '@/data/redFlags'
import { decidePlanLevel, previousVas } from '@/lib/adaptive'
import { useRecoveryStore } from '@/store/useRecoveryStore'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Toggle } from '@/components/ui/Toggle'
import { LEVEL_META } from '@/components/ui/tone'
import { cn } from '@/components/ui/cn'
import { VasSlider } from './VasSlider'

interface Props {
  initial?: PainCheckin | null
  onDone?: () => void
  onCancel?: () => void
}

/** Morning check-in: VAS + symptom flags, with a live preview of the adaptive decision. */
export function DailyPainCheckin({ initial, onDone, onCancel }: Props) {
  const submitCheckin = useRecoveryStore((s) => s.submitCheckin)
  const history = useRecoveryStore((s) => s.history)
  const logDate = useRecoveryStore((s) => s.daily_log.date)

  const [vas, setVas] = useState(initial?.vas_score ?? 3)
  const [radiating, setRadiating] = useState(initial?.radiating_pain ?? false)
  const [numbness, setNumbness] = useState(initial?.numbness_present ?? false)
  const [flags, setFlags] = useState<RedFlagId[]>(initial?.red_flags ?? [])
  const [flagsOpen, setFlagsOpen] = useState((initial?.red_flags.length ?? 0) > 0)

  const prevVas = useMemo(() => previousVas(history, logDate), [history, logDate])
  const checkin: PainCheckin = { vas_score: vas, radiating_pain: radiating, numbness_present: numbness, red_flags: flags }
  const preview = decidePlanLevel(checkin, prevVas)
  const meta = LEVEL_META[preview]

  const toggleFlag = (id: RedFlagId) => setFlags((fs) => (fs.includes(id) ? fs.filter((f) => f !== id) : [...fs, id]))

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        submitCheckin(checkin)
        onDone?.()
      }}
      className="space-y-5"
    >
      <VasSlider value={vas} onChange={setVas} />
      {prevVas !== null && (
        <p className="-mt-2 text-xs text-slate-500">
          Last check-in: <span className="font-semibold text-slate-700">{prevVas}/10</span>
          {vas !== prevVas && <span className={vas > prevVas ? 'text-amber-700' : 'text-emerald-700'}> ({vas > prevVas ? '+' : ''}{vas - prevVas})</span>}
        </p>
      )}

      <div className="divide-y divide-slate-100 rounded-xl border border-slate-200">
        <label className="flex items-center justify-between gap-3 p-3">
          <span className="text-sm">
            <span className="font-medium text-slate-800">Pain spreading into the arm</span>
            <span className="block text-xs text-slate-500">Shooting or burning pain below the shoulder</span>
          </span>
          <Toggle checked={radiating} onChange={setRadiating} label="Radiating arm pain" tone="rose" />
        </label>
        <label className="flex items-center justify-between gap-3 p-3">
          <span className="text-sm">
            <span className="font-medium text-slate-800">Numbness or tingling</span>
            <span className="block text-xs text-slate-500">In the arm, hand or fingers</span>
          </span>
          <Toggle checked={numbness} onChange={setNumbness} label="Numbness present" />
        </label>
      </div>

      <div className={cn('rounded-xl border', flags.length ? 'border-rose-300 bg-rose-50/60' : 'border-slate-200')}>
        <button type="button" onClick={() => setFlagsOpen((o) => !o)} aria-expanded={flagsOpen} className="flex w-full items-center gap-2 p-3 text-left text-sm">
          <ShieldAlert className={cn('size-4', flags.length ? 'text-rose-600' : 'text-slate-400')} aria-hidden />
          <span className="flex-1 font-medium text-slate-800">Red-flag symptoms</span>
          {flags.length ? <Badge tone="critical">{flags.length} reported</Badge> : <span className="text-xs text-slate-500">None</span>}
          <ChevronDown className={cn('size-4 text-slate-400 transition-transform', flagsOpen && 'rotate-180')} aria-hidden />
        </button>
        {flagsOpen && (
          <ul className="animate-fade-in space-y-1 px-3 pb-3">
            {RED_FLAGS.map((f) => (
              <li key={f.id}>
                <label className="flex cursor-pointer items-start gap-3 rounded-lg p-2 text-sm text-slate-700 hover:bg-white">
                  <input type="checkbox" checked={flags.includes(f.id)} onChange={() => toggleFlag(f.id)} className="mt-0.5 size-5 shrink-0 accent-rose-600" />
                  {f.label}
                </label>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div key={preview} className="flex animate-fade-in items-center gap-2 rounded-xl bg-slate-50 p-3 text-xs text-slate-600">
        <Zap className="size-4 shrink-0 text-teal-600" aria-hidden />
        <span className="flex-1">
          Today’s plan will be: <Badge tone={meta.tone}>{meta.label}</Badge>
        </span>
      </div>

      <div className="flex gap-2">
        {onCancel && (
          <Button variant="secondary" onClick={onCancel} className="flex-1">
            Cancel
          </Button>
        )}
        <Button type="submit" className="flex-[2]" variant={preview === 'medical_pause' ? 'danger' : 'primary'}>
          {initial ? 'Update check-in' : 'Save check-in'}
        </Button>
      </div>
    </form>
  )
}
