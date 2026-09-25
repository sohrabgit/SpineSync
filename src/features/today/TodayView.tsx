import { useState } from 'react'
import { ArrowRight, ClipboardList, Pencil, Radio } from 'lucide-react'
import { formatDose } from '@/data/exercises'
import { vasBand } from '@/lib/metrics'
import { progressFraction } from '@/lib/exerciseProgress'
import { dueNdiCheckpoint, PHASES, PROGRAM_DAYS } from '@/lib/program'
import { useRecoveryStore } from '@/store/useRecoveryStore'
import type { TabId } from '@/components/layout/tabs'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, SectionTitle } from '@/components/ui/Card'
import { ProgressRing } from '@/components/ui/ProgressRing'
import { LEVEL_TONE, vasColor } from '@/components/ui/tone'
import { useI18n } from '@/i18n'
import { EXERCISE_ICONS } from '@/features/exercises/exerciseIcons'
import { CoachInsights } from './CoachInsights'
import { DailyPainCheckin } from './DailyPainCheckin'
import { DaySchedule } from './DaySchedule'
import { MedicalPauseScreen } from './MedicalPauseScreen'
import { NdiAssessment } from './NdiAssessment'

export function TodayView({ onNavigate }: { onNavigate: (t: TabId) => void }) {
  const log = useRecoveryStore((s) => s.daily_log)
  const day = useRecoveryStore((s) => s.current_day)
  const phase = useRecoveryStore((s) => s.phase)
  const assessments = useRecoveryStore((s) => s.ndi_assessments)
  const [editing, setEditing] = useState(false)
  const [ndiOpen, setNdiOpen] = useState(false)
  const { m, n, date } = useI18n()
  const t = m.today

  const checkin = log.pain_checkin
  const level = log.adapted_plan_level
  const ndiDue = dueNdiCheckpoint(day, assessments)
  const compliance = log.daily_compliance_percentage
  const upNext = log.exercises_completed.filter((e) => e.status === 'pending' || e.status === 'in_progress').slice(0, 3)

  return (
    <div className="space-y-5">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl border border-line/70 bg-panel p-5">
        <div className="pointer-events-none absolute -top-16 -end-12 size-48 rounded-full bg-brand/10 blur-2xl" aria-hidden />
        <div className="relative flex items-center gap-4">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-mute">{date(log.date, { weekday: 'long', month: 'long', day: 'numeric' })}</p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-ink">
              {t.day} {n(day)}
              <span className="text-base font-medium text-dim"> / {n(PROGRAM_DAYS)}</span>
            </h1>
            <p className="mt-0.5 text-sm text-mute">
              {t.phase(phase, m.phases[PHASES[phase].phase].name)}
            </p>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-panel-2" aria-hidden>
              <div className="h-full rounded-full bg-brand transition-all duration-700" style={{ width: `${(Math.min(day, PROGRAM_DAYS) / PROGRAM_DAYS) * 100}%` }} />
            </div>
          </div>
          <ProgressRing value={compliance / 100} size={84} stroke={8} color="#5cc8b0" track="#2c3140" label={t.adherenceAria(`${compliance}%`)}>
            <div className="text-center leading-none">
              <span className="text-lg font-bold text-ink tabular-nums">{n(`${Math.round(compliance)}%`)}</span>
              <span className="mt-0.5 block text-[9px] font-bold tracking-[0.1em] text-mute uppercase">{t.todayShort}</span>
            </div>
          </ProgressRing>
        </div>
      </section>

      {/* Safety gate */}
      {level === 'medical_pause' && checkin && !editing && <MedicalPauseScreen flags={checkin.red_flags} onEdit={() => setEditing(true)} />}

      {/* Check-in */}
      {(!checkin || editing) && (
        <Card className="animate-fade-in">
          <div className="mb-4 flex items-center gap-2">
            <Radio className="size-4 text-brand" aria-hidden />
            <h2 className="text-base font-bold text-ink">{checkin ? t.updateCheckin : t.morningCheckin}</h2>
          </div>
          <DailyPainCheckin initial={checkin} onDone={() => setEditing(false)} onCancel={checkin ? () => setEditing(false) : undefined} />
        </Card>
      )}

      {checkin && level && !editing && level !== 'medical_pause' && (
        <Card key={level} className="animate-pop">
          <div className="flex items-center gap-4">
            <div className="grid size-16 shrink-0 place-items-center rounded-2xl" style={{ backgroundColor: `${vasColor(checkin.vas_score)}1f` }}>
              <span className="text-2xl font-bold tabular-nums" style={{ color: vasColor(checkin.vas_score) }}>
                {n(checkin.vas_score)}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-mute">{t.todaysPain(m.vas[vasBand(checkin.vas_score)])}</p>
              <div className="mt-1">
                <Badge tone={LEVEL_TONE[level]} pulse={level === 'flare_up'}>
                  {m.levels[level].label}
                </Badge>
              </div>
              <div className="mt-1.5 flex flex-wrap gap-1">
                {checkin.radiating_pain && <Badge tone="critical">{t.armPain}</Badge>}
                {checkin.numbness_present && <Badge tone="warning">{t.numbness}</Badge>}
              </div>
            </div>
            <button type="button" onClick={() => setEditing(true)} className="grid size-11 place-items-center rounded-full text-dim hover:bg-panel-2 hover:text-ink" aria-label={t.editCheckin}>
              <Pencil className="size-4" />
            </button>
          </div>
          <p className="mt-3 text-sm text-mute">{m.levels[level].description}</p>
        </Card>
      )}

      {/* NDI checkpoint */}
      {ndiDue !== null && (
        <Card className="flex items-center gap-3 border-info/30 bg-info/8">
          <div className="knob grid size-11 shrink-0 place-items-center bg-info text-bg">
            <ClipboardList className="size-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-ink">{m.ndi.dueTitle}</p>
            <p className="text-xs text-mute">{m.ndi.dueBody(ndiDue)}</p>
          </div>
          <Button className="px-3" onClick={() => setNdiOpen(true)}>
            {m.common.start}
          </Button>
          <NdiAssessment open={ndiOpen} onClose={() => setNdiOpen(false)} checkpoint={ndiDue} />
        </Card>
      )}

      <CoachInsights />

      {/* Up next */}
      {checkin && upNext.length > 0 && level !== 'medical_pause' && (
        <section>
          <SectionTitle
            title={t.upNext}
            action={
              <button type="button" onClick={() => onNavigate('exercises')} className="inline-flex items-center gap-1 text-xs font-semibold text-brand">
                {t.allExercises} <ArrowRight className="size-3.5 rtl:-scale-x-100" />
              </button>
            }
          />
          <Card className="divide-y divide-line p-0">
            {upNext.map((e) => {
              const { icon: Icon, fg, color } = EXERCISE_ICONS[e.exercise_id]
              return (
                <button key={e.exercise_id} type="button" onClick={() => onNavigate('exercises')} className="flex w-full items-center gap-3 px-4 py-3 text-start">
                  <ProgressRing value={progressFraction(e)} size={36} stroke={4} color={color}>
                    <Icon className={`size-3.5 ${fg}`} aria-hidden />
                  </ProgressRing>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-ink">{m.exercises[e.exercise_id].name}</p>
                    <p className="text-xs text-mute">
                      {formatDose(e, m)}
                      {e.effort_note ? ` · ${m.effort[e.effort_note]}` : ''}
                    </p>
                  </div>
                  <ArrowRight className="size-4 text-dim rtl:-scale-x-100" aria-hidden />
                </button>
              )
            })}
          </Card>
        </section>
      )}

      <DaySchedule />
    </div>
  )
}
