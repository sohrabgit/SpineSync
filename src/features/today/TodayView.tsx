import { useState, type ReactNode } from 'react'
import { Check, ChevronRight, ClipboardList, Lock, Pencil, Play } from 'lucide-react'
import { BREAK_GOAL, BREAKS_TASK_ID } from '@/data/ergonomics'
import { isErgoTaskDone, scheduledErgoTasks, vasBand } from '@/lib/metrics'
import { nextOpenExercise } from '@/lib/exerciseProgress'
import { dueNdiCheckpoint, PHASES, PROGRAM_DAYS } from '@/lib/program'
import { useRecoveryStore } from '@/store/useRecoveryStore'
import type { TabId } from '@/components/layout/tabs'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, SectionTitle } from '@/components/ui/Card'
import { ProgressRing } from '@/components/ui/ProgressRing'
import { cn } from '@/components/ui/cn'
import { LEVEL_TONE, vasColor } from '@/components/ui/tone'
import { useI18n } from '@/i18n'
import { useExerciseSheet } from '@/features/exercises/exerciseSheetStore'
import { CoachInsights } from './CoachInsights'
import { DailyPainCheckin } from './DailyPainCheckin'
import { DaySchedule } from './DaySchedule'
import { MedicalPauseScreen } from './MedicalPauseScreen'
import { NdiAssessment } from './NdiAssessment'

type StepState = 'todo' | 'done' | 'locked'

/** Today is a short, ordered plan: check in → exercises → posture, each showing what's left and the next action. */
export function TodayView({ onNavigate }: { onNavigate: (t: TabId) => void }) {
  const log = useRecoveryStore((s) => s.daily_log)
  const day = useRecoveryStore((s) => s.current_day)
  const phase = useRecoveryStore((s) => s.phase)
  const assessments = useRecoveryStore((s) => s.ndi_assessments)
  const activeCats = useRecoveryStore((s) => s.program.active_ergo_categories)
  const openSession = useExerciseSheet((s) => s.open)
  const [editing, setEditing] = useState(false)
  const [ndiOpen, setNdiOpen] = useState(false)
  const { m } = useI18n()
  const t = m.today

  const checkin = log.pain_checkin
  const level = log.adapted_plan_level
  const paused = level === 'medical_pause'
  const ndiDue = dueNdiCheckpoint(day, assessments)

  const exercises = log.exercises_completed
  const exDone = exercises.filter((e) => e.status === 'completed').length
  const nextEx = nextOpenExercise(exercises)

  const scheduled = scheduledErgoTasks(activeCats)
  const habits = scheduled.filter((id) => id !== BREAKS_TASK_ID)
  const habitsDone = habits.filter((id) => isErgoTaskDone(log.ergonomics_checklist, id)).length
  const breaks = log.ergonomics_checklist.hourly_breaks_count

  const checkinState: StepState = checkin ? 'done' : 'todo'
  const exState: StepState = !checkin || paused ? 'locked' : nextEx ? 'todo' : 'done'
  const postureState: StepState = scheduled.every((id) => isErgoTaskDone(log.ergonomics_checklist, id)) ? 'done' : 'todo'
  const stepsDone = [checkinState, exState, postureState].filter((s) => s === 'done').length

  return (
    <div className="space-y-5">
      <Hero day={day} phase={phase} compliance={log.daily_compliance_percentage} />

      {paused && checkin && !editing && <MedicalPauseScreen flags={checkin.red_flags} onEdit={() => setEditing(true)} />}

      <section aria-label={t.planTitle}>
        <SectionTitle
          title={t.planTitle}
          action={
            <span className={cn('text-xs font-semibold tabular-nums', stepsDone === 3 ? 'text-success' : 'text-mute')}>{t.stepsDone(stepsDone, 3)}</span>
          }
        />
        <ol className="space-y-2">
          {/* 1 · Check-in */}
          <li>
            {!checkin || editing ? (
              <Card className="animate-fade-in">
                <StepHeader index={1} state="todo" title={checkin ? t.updateCheckin : t.morningCheckin} subtitle={checkin ? undefined : t.checkinWhy} />
                <div className="mt-4">
                  <DailyPainCheckin initial={checkin} onDone={() => setEditing(false)} onCancel={checkin ? () => setEditing(false) : undefined} />
                </div>
              </Card>
            ) : (
              <StepRow
                index={1}
                state="done"
                title={t.morningCheckin}
                subtitle={
                  <span className="flex flex-wrap items-center gap-1.5">
                    <span className="font-semibold tabular-nums" style={{ color: vasColor(checkin.vas_score) }}>
                      {t.painSummary(checkin.vas_score, m.vas[vasBand(checkin.vas_score)])}
                    </span>
                    {level && (
                      <Badge tone={LEVEL_TONE[level]} pulse={level === 'flare_up'}>
                        {m.levels[level].short}
                      </Badge>
                    )}
                    {checkin.radiating_pain && <Badge tone="critical">{t.armPain}</Badge>}
                    {checkin.numbness_present && <Badge tone="warning">{t.numbness}</Badge>}
                  </span>
                }
                action={
                  <button type="button" onClick={() => setEditing(true)} className="grid size-10 place-items-center rounded-full text-dim hover:bg-panel-2 hover:text-ink" aria-label={t.editCheckin}>
                    <Pencil className="size-4" />
                  </button>
                }
              />
            )}
          </li>

          {/* NDI checkpoint slots in as an extra, clearly optional step when due */}
          {ndiDue !== null && checkin && !editing && !paused && (
            <li>
              <StepRow
                icon={<ClipboardList className="size-4" aria-hidden />}
                state="todo"
                accent
                title={m.ndi.dueTitle}
                subtitle={m.ndi.dueBody(ndiDue)}
                action={
                  <Button variant="secondary" className="min-h-10 px-3 text-xs" onClick={() => setNdiOpen(true)}>
                    {m.common.start}
                  </Button>
                }
              />
              <NdiAssessment open={ndiOpen} onClose={() => setNdiOpen(false)} checkpoint={ndiDue} />
            </li>
          )}

          {/* 2 · Exercises */}
          <li>
            <StepRow
              index={2}
              state={exState}
              title={t.exercisesTitle}
              subtitle={
                !checkin
                  ? t.exercisesLocked
                  : paused
                    ? t.exercisesPaused
                    : t.exercisesSummary(exDone, exercises.length)
              }
              progress={checkin && !paused && exercises.length ? exDone / exercises.length : undefined}
              onClick={checkin ? () => onNavigate('exercises') : undefined}
              action={
                exState === 'todo' && nextEx ? (
                  <Button className="min-h-10 px-3 text-xs" onClick={() => openSession(nextEx.exercise_id)}>
                    <Play className="size-3.5 rtl:-scale-x-100" aria-hidden /> {exDone > 0 || nextEx.status === 'in_progress' ? m.common.continue : m.common.start}
                  </Button>
                ) : undefined
              }
            />
          </li>

          {/* 3 · Posture & breaks */}
          <li>
            <StepRow
              index={3}
              state={postureState}
              title={t.postureTitle}
              subtitle={t.postureSummary(habitsDone, habits.length, Math.min(breaks, BREAK_GOAL), BREAK_GOAL)}
              progress={scheduled.length ? scheduled.filter((id) => isErgoTaskDone(log.ergonomics_checklist, id)).length / scheduled.length : undefined}
              onClick={() => onNavigate('ergonomics')}
            />
          </li>
        </ol>
      </section>

      {/* The check-in step and the pause screen already say these. */}
      <CoachInsights hide={['checkin', 'red-flag']} />

      <DaySchedule />
    </div>
  )
}

/** Program position: day counter, phase name, a four-phase journey bar, and today's completion ring. */
function Hero({ day, phase, compliance }: { day: number; phase: 1 | 2 | 3 | 4; compliance: number }) {
  const { m, n } = useI18n()
  const t = m.today
  const shown = Math.min(day, PROGRAM_DAYS)
  return (
    <section className="relative overflow-hidden rounded-3xl border border-line/70 bg-panel p-5">
      <div className="pointer-events-none absolute -top-16 -end-12 size-48 rounded-full bg-brand/10 blur-2xl" aria-hidden />
      <div className="relative flex items-center gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-3xl font-bold tracking-tight text-ink">
            {t.day} {n(day)}
            <span className="text-base font-medium text-dim"> / {n(PROGRAM_DAYS)}</span>
          </p>
          <p className="mt-0.5 text-sm text-mute">{t.phase(phase, m.phases[PHASES[phase].phase].name)}</p>
          <div className="mt-3 flex gap-1" aria-hidden>
            {([1, 2, 3, 4] as const).map((p) => {
              const { startDay, endDay } = PHASES[p]
              const fill = Math.min(1, Math.max(0, (shown - startDay + 1) / (endDay - startDay + 1)))
              return (
                <span key={p} className="h-1.5 overflow-hidden rounded-full bg-panel-2" style={{ flex: endDay - startDay + 1 }}>
                  <span className={cn('block h-full rounded-full transition-all duration-700', p === phase ? 'bg-brand' : 'bg-brand/50')} style={{ width: `${fill * 100}%` }} />
                </span>
              )
            })}
          </div>
        </div>
        <ProgressRing value={compliance / 100} size={76} stroke={7} color="#5cc8b0" track="#2c3140" label={t.adherenceAria(`${compliance}%`)}>
          <div className="text-center leading-none">
            <span className="text-base font-bold text-ink tabular-nums">{n(`${Math.round(compliance)}%`)}</span>
            <span className="mt-0.5 block text-[9px] font-bold tracking-[0.1em] text-mute uppercase">{t.todayShort}</span>
          </div>
        </ProgressRing>
      </div>
    </section>
  )
}

/** Step marker: a number while to-do, a check when done, a lock when not yet available. */
function StepMarker({ index, icon, state, accent, progress }: { index?: number; icon?: ReactNode; state: StepState; accent?: boolean; progress?: number }) {
  const { n } = useI18n()
  const marker = (
    <span
      className={cn(
        'grid size-8 shrink-0 place-items-center rounded-full text-sm font-bold transition-colors',
        state === 'done' && 'bg-success text-bg',
        state === 'locked' && 'bg-panel-2 text-dim',
        state === 'todo' && (accent ? 'bg-info text-bg' : 'bg-brand/15 text-brand'),
      )}
      aria-hidden
    >
      {state === 'done' ? <Check className="size-4" strokeWidth={3} /> : state === 'locked' ? <Lock className="size-3.5" /> : (icon ?? n(index ?? 0))}
    </span>
  )
  if (state !== 'todo' || progress === undefined || progress === 0) return <span className="grid size-10 shrink-0 place-items-center">{marker}</span>
  return (
    <ProgressRing value={progress} size={40} stroke={3}>
      {marker}
    </ProgressRing>
  )
}

function StepHeader({ index, state, title, subtitle }: { index: number; state: StepState; title: string; subtitle?: string }) {
  return (
    <div className="flex items-center gap-3">
      <StepMarker index={index} state={state} />
      <div className="min-w-0">
        <h3 className="text-base font-bold text-ink">{title}</h3>
        {subtitle && <p className="text-xs text-mute">{subtitle}</p>}
      </div>
    </div>
  )
}

interface StepRowProps {
  index?: number
  icon?: ReactNode
  state: StepState
  accent?: boolean
  title: string
  subtitle: ReactNode
  progress?: number
  action?: ReactNode
  onClick?: () => void
}

/** A collapsed plan step. The body navigates (when `onClick` is set); `action` holds the step's primary button. */
function StepRow({ index, icon, state, accent, title, subtitle, progress, action, onClick }: StepRowProps) {
  const body = (
    <>
      <StepMarker index={index} icon={icon} state={state} accent={accent} progress={progress} />
      <span className="min-w-0 flex-1">
        <span className={cn('block text-sm font-semibold', state === 'locked' ? 'text-mute' : 'text-ink')}>{title}</span>
        <span className="mt-0.5 block text-xs text-mute">{subtitle}</span>
      </span>
    </>
  )
  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-2xl border p-3 transition-colors',
        state === 'done' ? 'border-success/25 bg-success/[0.05]' : accent ? 'border-info/30 bg-info/8' : 'border-line/60 bg-panel',
        state === 'locked' && 'bg-well',
      )}
    >
      {onClick ? (
        <button type="button" onClick={onClick} className="flex min-w-0 flex-1 items-center gap-3 text-start">
          {body}
          {!action && <ChevronRight className="size-4 shrink-0 text-dim rtl:-scale-x-100" aria-hidden />}
        </button>
      ) : (
        <div className="flex min-w-0 flex-1 items-center gap-3">{body}</div>
      )}
      {action}
    </div>
  )
}
