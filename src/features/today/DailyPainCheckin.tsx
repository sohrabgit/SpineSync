import { useMemo, useState } from 'react'
import { ChevronDown, Hand, ShieldAlert, Zap } from 'lucide-react'
import type { PainCheckin, RedFlagId } from '@/types/recovery'
import { RED_FLAGS } from '@/data/redFlags'
import { decidePlanLevel, previousVas } from '@/lib/adaptive'
import { useRecoveryStore } from '@/store/useRecoveryStore'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Toggle } from '@/components/ui/Toggle'
import { LEVEL_ICON, LEVEL_TONE, TONE_STYLES } from '@/components/ui/tone'
import { cn } from '@/components/ui/cn'
import { useI18n } from '@/i18n'
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
  const { m, n } = useI18n()
  const t = m.checkin

  const [vas, setVas] = useState(initial?.vas_score ?? 3)
  const [radiating, setRadiating] = useState(initial?.radiating_pain ?? false)
  const [numbness, setNumbness] = useState(initial?.numbness_present ?? false)
  const [flags, setFlags] = useState<RedFlagId[]>(initial?.red_flags ?? [])
  const [flagsOpen, setFlagsOpen] = useState((initial?.red_flags.length ?? 0) > 0)

  const prevVas = useMemo(() => previousVas(history, logDate), [history, logDate])
  const checkin: PainCheckin = { vas_score: vas, radiating_pain: radiating, numbness_present: numbness, red_flags: flags }
  const preview = decidePlanLevel(checkin, prevVas)
  const PreviewIcon = LEVEL_ICON[preview]

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
        <p className="-mt-2 text-xs text-mute">
          {t.lastCheckin} <span className="font-semibold text-ink">{n(prevVas)}</span>
          {vas !== prevVas && (
            <span className={vas > prevVas ? 'text-warning' : 'text-success'} dir="ltr">
              {' '}({vas > prevVas ? '+' : '−'}{n(Math.abs(vas - prevVas))})
            </span>
          )}
        </p>
      )}

      <div className="divide-y divide-line rounded-xl border border-line bg-well">
        <label className="flex items-center gap-3 p-3">
          <Zap className={cn('size-4 shrink-0', radiating ? 'text-danger' : 'text-dim')} aria-hidden />
          <span className="flex-1 text-sm font-medium text-ink">{t.radiatingTitle}</span>
          <Toggle checked={radiating} onChange={setRadiating} label={t.radiatingLabel} tone="danger" />
        </label>
        <label className="flex items-center gap-3 p-3">
          <Hand className={cn('size-4 shrink-0', numbness ? 'text-warning' : 'text-dim')} aria-hidden />
          <span className="flex-1 text-sm font-medium text-ink">{t.numbTitle}</span>
          <Toggle checked={numbness} onChange={setNumbness} label={t.numbLabel} />
        </label>
      </div>

      <div className={cn('rounded-xl border', flags.length ? 'border-danger/50 bg-danger/10' : 'border-line bg-well')}>
        <button type="button" onClick={() => setFlagsOpen((o) => !o)} aria-expanded={flagsOpen} className="flex w-full items-center gap-2 p-3 text-start text-sm">
          <ShieldAlert className={cn('size-4', flags.length ? 'text-danger' : 'text-dim')} aria-hidden />
          <span className="flex-1 font-medium text-ink">{t.redFlags}</span>
          {flags.length > 0 && <Badge tone="critical">{t.reported(flags.length)}</Badge>}
          <ChevronDown className={cn('size-4 text-dim transition-transform', flagsOpen && 'rotate-180')} aria-hidden />
        </button>
        {flagsOpen && (
          <ul className="animate-fade-in space-y-1 px-3 pb-3">
            {RED_FLAGS.map((id) => (
              <li key={id}>
                <label className="flex cursor-pointer items-start gap-3 rounded-lg p-2 text-sm text-ink/90 hover:bg-panel-2">
                  <input type="checkbox" checked={flags.includes(id)} onChange={() => toggleFlag(id)} className="mt-0.5 size-5 shrink-0 accent-[#f2706b]" />
                  {m.redFlags[id]}
                </label>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Only worth a line when the check-in changes the plan. */}
      {preview !== 'standard' && (
        <div key={preview} className={cn('flex animate-fade-in items-center gap-2 rounded-xl border p-3 text-sm font-semibold', TONE_STYLES[LEVEL_TONE[preview]].bg, TONE_STYLES[LEVEL_TONE[preview]].border, TONE_STYLES[LEVEL_TONE[preview]].text)}>
          <PreviewIcon className="size-4 shrink-0" aria-hidden />
          {m.levels[preview].label}
        </div>
      )}

      <div className="flex gap-2">
        {onCancel && (
          <Button variant="secondary" onClick={onCancel} className="flex-1">
            {m.common.cancel}
          </Button>
        )}
        <Button type="submit" className="flex-[2]" variant={preview === 'medical_pause' ? 'danger' : 'primary'}>
          {initial ? t.update : t.save}
        </Button>
      </div>
    </form>
  )
}
