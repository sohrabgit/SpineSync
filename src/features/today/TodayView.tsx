import { useState } from 'react'
import { ArrowRight, ClipboardList, Pencil, Radio } from 'lucide-react'
import { formatDose, getExercise } from '@/data/exercises'
import { formatDate } from '@/lib/date'
import { progressFraction } from '@/lib/exerciseProgress'
import { dueNdiCheckpoint, PHASES, PROGRAM_DAYS } from '@/lib/program'
import { useRecoveryStore } from '@/store/useRecoveryStore'
import type { TabId } from '@/components/layout/tabs'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, SectionTitle } from '@/components/ui/Card'
import { ProgressRing } from '@/components/ui/ProgressRing'
import { LEVEL_META, vasColor, vasLabel } from '@/components/ui/tone'
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

  const checkin = log.pain_checkin
  const level = log.adapted_plan_level
  const phaseInfo = PHASES[phase]
  const ndiDue = dueNdiCheckpoint(day, assessments)
  const compliance = log.daily_compliance_percentage
  const upNext = log.exercises_completed.filter((e) => e.status === 'pending' || e.status === 'in_progress').slice(0, 3)

  return (
    <div className="space-y-5">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-700 to-emerald-700 p-5 text-white shadow-lg shadow-teal-900/20">
        <div className="pointer-events-none absolute -top-10 -right-10 size-40 rounded-full bg-white/10" aria-hidden />
        <div className="pointer-events-none absolute -right-4 -bottom-16 size-32 rounded-full bg-white/5" aria-hidden />
        <div className="relative flex items-center gap-4">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-teal-100">{formatDate(log.date, { weekday: 'long', month: 'long', day: 'numeric' })}</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight">
              Day {day}
              <span className="text-base font-medium text-teal-100"> / {PROGRAM_DAYS}</span>
            </h1>
            <p className="mt-0.5 text-sm text-teal-50">
              Phase {phase} · {phaseInfo.name}
            </p>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/20" aria-hidden>
              <div className="h-full rounded-full bg-white transition-all duration-700" style={{ width: `${(Math.min(day, PROGRAM_DAYS) / PROGRAM_DAYS) * 100}%` }} />
            </div>
          </div>
          <ProgressRing value={compliance / 100} size={84} stroke={8} color="#ffffff" track="rgba(255,255,255,0.2)" label={`Today's adherence ${compliance}%`}>
            <div className="text-center leading-none">
              <span className="text-lg font-bold tabular-nums">{Math.round(compliance)}%</span>
              <span className="mt-0.5 block text-[9px] font-medium tracking-wide text-teal-100 uppercase">today</span>
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
            <Radio className="size-4 text-teal-600" aria-hidden />
            <h2 className="text-base font-bold text-slate-900">{checkin ? 'Update check-in' : 'Morning check-in'}</h2>
          </div>
          <DailyPainCheckin initial={checkin} onDone={() => setEditing(false)} onCancel={checkin ? () => setEditing(false) : undefined} />
        </Card>
      )}

      {checkin && level && !editing && level !== 'medical_pause' && (
        <Card key={level} className="animate-pop">
          <div className="flex items-center gap-4">
            <div className="grid size-16 shrink-0 place-items-center rounded-2xl" style={{ backgroundColor: `${vasColor(checkin.vas_score)}1a` }}>
              <span className="text-2xl font-bold tabular-nums" style={{ color: vasColor(checkin.vas_score) }}>
                {checkin.vas_score}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-slate-500">Today’s pain · {vasLabel(checkin.vas_score)}</p>
              <div className="mt-1">
                <Badge tone={LEVEL_META[level].tone} pulse={level === 'flare_up'}>
                  {LEVEL_META[level].label}
                </Badge>
              </div>
              <div className="mt-1.5 flex flex-wrap gap-1">
                {checkin.radiating_pain && <Badge tone="critical">Arm pain</Badge>}
                {checkin.numbness_present && <Badge tone="warning">Numbness</Badge>}
              </div>
            </div>
            <button type="button" onClick={() => setEditing(true)} className="grid size-11 place-items-center rounded-full text-slate-400 hover:bg-slate-100" aria-label="Edit check-in">
              <Pencil className="size-4" />
            </button>
          </div>
          <p className="mt-3 text-sm text-slate-600">{LEVEL_META[level].description}</p>
        </Card>
      )}

      {/* NDI checkpoint */}
      {ndiDue !== null && (
        <Card className="flex items-center gap-3 border-teal-200 bg-teal-50/60">
          <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-teal-600 text-white">
            <ClipboardList className="size-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-slate-900">Neck Disability Index due</p>
            <p className="text-xs text-slate-600">Day {ndiDue} checkpoint · 10 quick questions, about 2 min</p>
          </div>
          <Button className="px-3" onClick={() => setNdiOpen(true)}>
            Start
          </Button>
          <NdiAssessment open={ndiOpen} onClose={() => setNdiOpen(false)} checkpoint={ndiDue} />
        </Card>
      )}

      <CoachInsights />

      {/* Up next */}
      {checkin && upNext.length > 0 && level !== 'medical_pause' && (
        <section>
          <SectionTitle
            title="Up next"
            action={
              <button type="button" onClick={() => onNavigate('exercises')} className="inline-flex items-center gap-1 text-xs font-semibold text-teal-700">
                All exercises <ArrowRight className="size-3.5" />
              </button>
            }
          />
          <Card className="divide-y divide-slate-100 p-0">
            {upNext.map((e) => {
              const def = getExercise(e.exercise_id)
              const { icon: Icon, fg } = EXERCISE_ICONS[e.exercise_id]
              return (
                <button key={e.exercise_id} type="button" onClick={() => onNavigate('exercises')} className="flex w-full items-center gap-3 px-4 py-3 text-left">
                  <ProgressRing value={progressFraction(e)} size={36} stroke={4}>
                    <Icon className={`size-3.5 ${fg}`} aria-hidden />
                  </ProgressRing>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-900">{def.name}</p>
                    <p className="text-xs text-slate-500">
                      {formatDose(e)}
                      {e.effort_note ? ` · ${e.effort_note}` : ''}
                    </p>
                  </div>
                  <ArrowRight className="size-4 text-slate-300" aria-hidden />
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
