import { useState } from 'react'
import { Check, Lightbulb } from 'lucide-react'
import type { PostureIssue } from '@/types/recovery'
import { useRecoveryStore } from '@/store/useRecoveryStore'
import { Button } from '@/components/ui/Button'
import { Sheet } from '@/components/ui/Sheet'
import { cn } from '@/components/ui/cn'
import { useI18n } from '@/i18n'
import { ExerciseFigure, PostureFigure, type FigurePose } from '@/components/illustrations/NeckFigure'
import { useBreakSheet } from './breakSheetStore'

const ISSUES: PostureIssue[] = ['chin', 'shoulders', 'screen']
/** Figures for the three break moves, in the order of `m.workMode.sheet.moves`. */
const MOVE_POSES: FigurePose[] = ['stand_reach', 'chin_tuck', 'shoulder_rolls']

/** Two-step movement break: a few suggested moves, then a quick posture self-check. Finishing logs the break. */
export function BreakSheet() {
  const open = useBreakSheet((s) => s.open)
  const hide = useBreakSheet((s) => s.hide)
  const takeBreak = useRecoveryStore((s) => s.takeBreak)
  const logPostureCheck = useRecoveryStore((s) => s.logPostureCheck)
  const { m, n } = useI18n()
  const t = m.workMode.sheet

  const [step, setStep] = useState<'move' | 'posture'>('move')
  const [moved, setMoved] = useState<boolean[]>(() => t.moves.map(() => false))
  const [answers, setAnswers] = useState<Partial<Record<PostureIssue, boolean>>>({})

  const close = () => {
    hide()
    setStep('move')
    setMoved(t.moves.map(() => false))
    setAnswers({})
  }

  const finish = (withCheck: boolean) => {
    takeBreak()
    if (withCheck && ISSUES.some((i) => answers[i] !== undefined)) logPostureCheck(ISSUES.filter((i) => answers[i] === false))
    close()
  }

  const footer =
    step === 'move' ? (
      <Button className="w-full" onClick={() => setStep('posture')}>
        {t.movesDone}
      </Button>
    ) : (
      <div className="grid grid-cols-2 gap-2">
        <Button variant="ghost" onClick={() => finish(false)}>
          {t.skipCheck}
        </Button>
        <Button onClick={() => finish(true)}>{t.finish}</Button>
      </div>
    )

  return (
    <Sheet open={open} onClose={close} title={step === 'move' ? t.title : t.postureTitle} subtitle={step === 'move' ? t.subtitle : undefined} footer={footer}>
      {step === 'move' ? (
        <ol className="grid grid-cols-3 gap-2">
          {t.moves.map((move, i) => (
            <li key={move.title}>
              <button
                type="button"
                aria-pressed={moved[i]}
                title={move.detail}
                onClick={() => setMoved((prev) => prev.map((v, j) => (j === i ? !v : v)))}
                className={cn(
                  'relative flex h-full w-full flex-col items-center gap-1 rounded-2xl border px-1.5 pt-2 pb-3 text-center transition',
                  moved[i] ? 'border-success/50 bg-success/10' : 'border-line bg-panel-2 hover:border-line-strong',
                )}
              >
                <span
                  className={cn(
                    'absolute top-2 start-2 grid size-5 place-items-center rounded-full border text-[10px] font-bold',
                    moved[i] ? 'border-success bg-success text-bg' : 'border-line-strong text-mute',
                  )}
                  aria-hidden
                >
                  {moved[i] ? <Check className="size-3" strokeWidth={3} /> : n(i + 1)}
                </span>
                <ExerciseFigure pose={MOVE_POSES[i]!} size={84} />
                <span className="text-xs leading-tight font-semibold text-ink">{move.title}</span>
              </button>
            </li>
          ))}
        </ol>
      ) : (
        <ul className="space-y-2">
          {ISSUES.map((id) => {
            const q = t.questions[id]
            const answer = answers[id]
            return (
              <li key={id} className="rounded-2xl border border-line bg-panel-2 p-2.5">
                <div className="flex items-center gap-3">
                  <PostureFigure focus={id} size={76} className="shrink-0 rounded-xl bg-well" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-ink">{q.q}</p>
                    <div className="mt-2 grid grid-cols-2 gap-2" role="radiogroup" aria-label={q.q}>
                      {([true, false] as const).map((value) => (
                        <button
                          key={String(value)}
                          type="button"
                          role="radio"
                          aria-checked={answer === value}
                          onClick={() => setAnswers((prev) => ({ ...prev, [id]: value }))}
                          className={cn(
                            'min-h-9 rounded-lg border text-xs font-semibold transition',
                            answer === value ? (value ? 'border-success bg-success text-bg' : 'border-warning bg-warning text-bg') : 'border-line text-mute hover:text-ink',
                          )}
                        >
                          {value ? t.yes : t.notQuite}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                {answer === false && (
                  <p className="mt-2 flex animate-fade-in gap-2 text-xs text-ink/85">
                    <Lightbulb className="mt-0.5 size-3.5 shrink-0 text-warning" aria-hidden />
                    {q.fix}
                  </p>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </Sheet>
  )
}
