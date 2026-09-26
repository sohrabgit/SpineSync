import { useState, type ReactNode } from 'react'
import { Check, ChevronRight, ClipboardList, Footprints, Hand, ListChecks, Lock, Pencil, Play, Zap } from 'lucide-react'
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
import { LEVEL_ICON, LEVEL_TONE, TONE_STYLES, vasColor } from '@/components/ui/tone'
import { PainFace } from '@/components/ui/PainFace'
import { PHASE_ICONS } from '@/components/ui/phaseIcons'
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
  const { m, n } = useI18n()
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

  const exState: StepState = !checkin || paused ? 'locked' : nextEx ? 'todo' : 'done'
  const postureState: StepState = scheduled.every((id) => isErgoTaskDone(log.ergonomics_checklist, id)) ? 'done' : 'todo'
  const LevelIcon = level ? LEVEL_ICON[level] : null

  return (
    <div className="space-y-5">
      <Hero day={day} phase={phase} compliance={log.daily_compliance_percentage} />

      {paused && checkin && !editing && <MedicalPauseScreen flags={checkin.red_flags} onEdit={() => setEditing(true)} />}

      <section aria-label={t.planTitle}>
        <SectionTitle title={t.planTitle} />
        <ol className="space-y-2">
          {/* 1 · Check-in */}
          <li>
            {!checkin || editing ? (
              <Card className="animate-fade-in">
                <StepHeader index={1} state="todo" title={checkin ? t.updateCheckin : t.morningCheckin} />
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
                    <PainFace vas={checkin.vas_score} size={18} />
                    <span className="font-semibold tabular-nums" style={{ color: vasColor(checkin.vas_score) }}>
                      {t.painSummary(n(checkin.vas_score), m.vas[vasBand(checkin.vas_score)])}
                    </span>
                    {/* Standard days need no label; anything else shows its level. */}
                    {level && level !== 'standard' && LevelIcon && (
                      <Badge tone={LEVEL_TONE[level]} pulse={level === 'flare_up'}>
                        <LevelIcon className="size-3" aria-hidden />
                        {m.levels[level].short}
                      </Badge>
                    )}
                    {checkin.radiating_pain && (
                      <span className={cn('grid size-5 place-items-center rounded-full', TONE_STYLES.critical.bg)} title={t.armPain}>
                        <Zap className="size-3 text-danger" aria-label={t.armPain} />
                      </span>
                    )}
                    {checkin.numbness_present && (
                      <span className={cn('grid size-5 place-items-center rounded-full', TONE_STYLES.warning.bg)} title={t.numbness}>
                        <Hand className="size-3 text-warning" aria-label={t.numbness} />
                      </span>
                    )}
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
                subtitle={m.ndi.dueBody}
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
              subtitle={!checkin ? undefined : paused ? t.exercisesPaused : t.exercisesSummary(n(exDone), n(exercises.length))}
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
              subtitle={
                <span className="flex items-center gap-3 tabular-nums">
                  <span className="sr-only">{t.postureSummary(n(habitsDone), n(habits.length), n(Math.min(breaks, BREAK_GOAL)), n(BREAK_GOAL))}</span>
                  <span className="inline-flex items-center gap-1" aria-hidden>
                    <ListChecks className="size-3.5" /> {n(habitsDone)}/{n(habits.length)}
                  </span>
                  <span className="inline-flex items-center gap-1" aria-hidden>
                    <Footprints className="size-3.5" /> {n(Math.min(breaks, BREAK_GOAL))}/{n(BREAK_GOAL)}
                  </span>
                </span>
              }
              progress={scheduled.length ? scheduled.filter((id) => isErgoTaskDone(log.ergonomics_checklist, id)).length / scheduled.length : undefined}
              onClick={() => onNavigate('ergonomics')}
            />
          </li>
        </ol>
      </section>

      {/* Already said by the check-in step, the pause screen, the flare-up banner, the Posture step and the Work mode bar. */}
      <CoachInsights hide={['checkin', 'red-flag', 'flare', 'breaks', 'sitting']} limit={1} />

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
          <p className="mt-0.5 text-sm text-mute">{m.phases[PHASES[phase].phase].name}</p>
          {/* Journey bar: one segment per phase, sized by its length, with the phase glyph beneath. */}
          <div className="mt-3 flex gap-1" aria-hidden>
            {([1, 2, 3, 4] as const).map((p) => {
              const { startDay, endDay } = PHASES[p]
              const fill = Math.min(1, Math.max(0, (shown - startDay + 1) / (endDay - startDay + 1)))
              const Icon = PHASE_ICONS[p]
              return (
                <span key={p} className="flex min-w-0 flex-col items-center gap-1.5" style={{ flex: endDay - startDay + 1 }}>
                  <span className="block h-1.5 w-full overflow-hidden rounded-full bg-panel-2">
                    <span className={cn('block h-full rounded-full transition-all duration-700', p === phase ? 'bg-brand' : 'bg-brand/50')} style={{ width: `${fill * 100}%` }} />
                  </span>
                  <Icon className={cn('size-3.5', p === phase ? 'text-brand' : p < phase ? 'text-brand/50' : 'text-dim/60')} strokeWidth={2.2} />
                </span>
              )
            })}
          </div>
        </div>
        <ProgressRing value={compliance / 100} size={76} stroke={7} color="#5cc8b0" track="#2c3140" label={t.adherenceAria(`${compliance}%`)}>
          <span className="text-base font-bold text-ink tabular-nums">{n(`${Math.round(compliance)}%`)}</span>
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

function StepHeader({ index, state, title }: { index: number; state: StepState; title: string }) {
  return (
    <div className="flex items-center gap-3">
      <StepMarker index={index} state={state} />
      <h3 className="min-w-0 text-base font-bold text-ink">{title}</h3>
    </div>
  )
}

interface StepRowProps {
  index?: number
  icon?: ReactNode
  state: StepState
  accent?: boolean
  title: string
  subtitle?: ReactNode
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
        {subtitle && <span className="mt-0.5 block text-xs text-mute">{subtitle}</span>}
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
