import { useState } from 'react'
import { ChevronLeft } from 'lucide-react'
import type { NdiAnswer, NdiCheckpoint } from '@/types/recovery'
import { NDI_SECTIONS } from '@/data/ndi'
import { ndiBand, ndiScore } from '@/lib/metrics'
import { useRecoveryStore } from '@/store/useRecoveryStore'
import { Sheet } from '@/components/ui/Sheet'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/components/ui/cn'

const EMPTY: NdiAnswer[] = Array(NDI_SECTIONS.length).fill(null)

export function NdiAssessment({ open, onClose, checkpoint }: { open: boolean; onClose: () => void; checkpoint: NdiCheckpoint }) {
  const saveNdi = useRecoveryStore((s) => s.saveNdi)
  const [answers, setAnswers] = useState<NdiAnswer[]>(EMPTY)
  const [index, setIndex] = useState(0)

  const close = () => {
    onClose()
    setAnswers(EMPTY)
    setIndex(0)
  }

  const reviewing = index >= NDI_SECTIONS.length
  const section = NDI_SECTIONS[index]
  const score = ndiScore(answers)
  const answeredCount = answers.filter((a) => a !== null).length

  const choose = (value: NdiAnswer) => {
    setAnswers((a) => a.map((v, i) => (i === index ? value : v)))
    window.setTimeout(() => setIndex((i) => i + 1), 180)
  }

  return (
    <Sheet
      open={open}
      onClose={close}
      title={`Neck Disability Index · Day ${checkpoint}`}
      subtitle={reviewing ? 'Review your result' : `Section ${index + 1} of ${NDI_SECTIONS.length}`}
      footer={
        reviewing ? (
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setIndex(NDI_SECTIONS.length - 1)}>
              <ChevronLeft className="size-4" /> Back
            </Button>
            <Button
              className="flex-1"
              disabled={score === null}
              onClick={() => {
                saveNdi(answers)
                close()
              }}
            >
              Save assessment
            </Button>
          </div>
        ) : (
          <div className="flex gap-2">
            <Button variant="secondary" disabled={index === 0} onClick={() => setIndex((i) => i - 1)}>
              <ChevronLeft className="size-4" /> Back
            </Button>
            <Button
              variant="ghost"
              className="flex-1"
              onClick={() => {
                setAnswers((a) => a.map((v, i) => (i === index ? null : v)))
                setIndex((i) => i + 1)
              }}
            >
              Skip section
            </Button>
          </div>
        )
      }
    >
      <div className="mb-4 h-1.5 overflow-hidden rounded-full bg-panel-2" aria-hidden>
        <div className="h-full rounded-full bg-brand transition-all duration-300" style={{ width: `${(Math.min(index, NDI_SECTIONS.length) / NDI_SECTIONS.length) * 100}%` }} />
      </div>

      {section && !reviewing && (
        <fieldset key={index} className="animate-fade-in">
          <legend className="mb-3 text-base font-semibold text-ink">{section.title}</legend>
          <div className="space-y-2">
            {section.options.map((label, value) => {
              const selected = answers[index] === value
              return (
                <button
                  key={label}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => choose(value as NdiAnswer)}
                  className={cn(
                    'flex min-h-12 w-full items-center gap-3 rounded-xl border px-3 py-2 text-left text-sm transition',
                    selected ? 'border-brand bg-brand/12 text-ink' : 'border-line bg-panel-2 text-ink/90 hover:border-line-strong',
                  )}
                >
                  <span className={cn('knob grid size-7 shrink-0 place-items-center text-xs font-bold', selected ? 'bg-brand text-bg' : 'bg-panel text-mute')}>{value}</span>
                  {label}
                </button>
              )
            })}
          </div>
        </fieldset>
      )}

      {reviewing && (
        <div className="animate-pop py-4 text-center">
          {score === null ? (
            <p className="text-sm text-mute">Answer at least one section to calculate your score.</p>
          ) : (
            <>
              <p className="text-5xl font-bold text-ink tabular-nums">{score}%</p>
              <div className="mt-2">
                <Badge tone={ndiBand(score).tone}>{ndiBand(score).label}</Badge>
              </div>
              <p className="mt-4 text-sm text-mute">
                Based on {answeredCount} of {NDI_SECTIONS.length} sections. Lower is better. You’ll repeat this on days 15 and 30 to track change.
              </p>
            </>
          )}
        </div>
      )}
    </Sheet>
  )
}
