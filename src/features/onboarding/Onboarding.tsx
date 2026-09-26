import { useState } from 'react'
import { ArrowLeft, ArrowRight, Check, HeartPulse, ShieldAlert, ShieldCheck, Sparkles, Stethoscope } from 'lucide-react'
import type { ErgoCategoryId } from '@/types/recovery'
import { RED_FLAGS } from '@/data/redFlags'
import { DEFAULT_ACTIVE_CATEGORIES, ERGO_CATEGORIES } from '@/data/ergonomics'
import { addDays, appToday } from '@/lib/date'
import { useRecoveryStore } from '@/store/useRecoveryStore'
import { Button } from '@/components/ui/Button'
import { cn } from '@/components/ui/cn'
import { useI18n } from '@/i18n'
import { CATEGORY_ICONS } from '@/features/ergonomics/categoryIcons'
import { IntroSlides } from './IntroSlides'

type Step = 'intro' | 'safety' | 'blocked' | 'setup'

/** Back button plus a two-segment progress bar for the steps after the intro. */
function StepHeader({ step, onBack, backLabel }: { step: 1 | 2; onBack: () => void; backLabel: string }) {
  return (
    <div className="mb-6 flex h-10 items-center gap-4">
      <button
        type="button"
        onClick={onBack}
        aria-label={backLabel}
        className="-ms-2 grid size-10 place-items-center rounded-full text-mute transition hover:bg-panel-2 hover:text-ink"
      >
        <ArrowLeft className="size-5 rtl:-scale-x-100" />
      </button>
      <div className="flex flex-1 gap-1.5" aria-hidden>
        {[1, 2].map((i) => (
          <span key={i} className={cn('h-1 flex-1 rounded-full transition-colors duration-500', i <= step ? 'bg-brand' : 'bg-line')} />
        ))}
      </div>
    </div>
  )
}

export function Onboarding() {
  const completeOnboarding = useRecoveryStore((s) => s.completeOnboarding)
  const { m } = useI18n()
  const t = m.onboarding
  const [step, setStep] = useState<Step>('intro')
  const [acknowledged, setAcknowledged] = useState(false)
  const today = appToday()
  const [startDate, setStartDate] = useState(today)
  const [categories, setCategories] = useState<ErgoCategoryId[]>(DEFAULT_ACTIVE_CATEGORIES)

  const toggleCategory = (id: ErgoCategoryId) =>
    setCategories((cs) => (cs.includes(id) ? cs.filter((c) => c !== id) : [...cs, id]))

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col bg-bg px-5 pt-[max(2rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))]">
      <div key={step} className="flex flex-1 animate-fade-in flex-col">
        {step === 'intro' && <IntroSlides onDone={() => setStep('safety')} />}

        {step === 'safety' && (
          <>
            <StepHeader step={1} onBack={() => setStep('intro')} backLabel={m.common.back} />
            <div className="knob grid size-12 place-items-center bg-danger text-bg">
              <ShieldAlert className="size-6" strokeWidth={2.2} />
            </div>
            <h1 className="mt-5 text-2xl font-bold tracking-tight text-ink">{t.safetyTitle}</h1>
            <p className="mt-2 text-sm text-mute">
              {t.safetyLeadA} <strong className="text-ink">{t.safetyLeadNone}</strong> {t.safetyLeadB}
            </p>
            <ul className="mt-4 space-y-2">
              {RED_FLAGS.map((id) => (
                <li key={id} className="flex gap-3 rounded-xl border border-line/60 bg-panel p-3 text-sm text-ink/90">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-danger" aria-hidden />
                  {m.redFlags[id]}
                </li>
              ))}
            </ul>
            <div className="mt-5 flex gap-3 rounded-xl bg-well p-3 text-xs text-mute">
              <Stethoscope className="size-4 shrink-0 text-dim" aria-hidden />
              <p>{t.disclaimer}</p>
            </div>
            <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-xl p-1">
              <input type="checkbox" checked={acknowledged} onChange={(e) => setAcknowledged(e.target.checked)} className="mt-0.5 size-5 accent-brand" />
              <span className="text-sm text-ink/90">{t.acknowledge}</span>
            </label>
            <div className="mt-auto grid gap-2 pt-8">
              <Button disabled={!acknowledged} onClick={() => setStep('setup')}>
                <ShieldCheck className="size-4" /> {m.common.continue}
              </Button>
              <Button variant="danger" onClick={() => setStep('blocked')}>
                {t.haveSymptoms}
              </Button>
            </div>
          </>
        )}

        {step === 'blocked' && (
          <>
            <div className="knob grid size-12 place-items-center bg-danger text-bg">
              <HeartPulse className="size-6" strokeWidth={2.2} />
            </div>
            <h1 className="mt-5 text-2xl font-bold tracking-tight text-ink">{t.blockedTitle}</h1>
            <p className="mt-3 text-mute">{t.blockedBody}</p>
            <div className="mt-auto pt-8">
              <Button variant="secondary" className="w-full" onClick={() => setStep('safety')}>
                {m.common.back}
              </Button>
            </div>
          </>
        )}

        {step === 'setup' && (
          <>
            <StepHeader step={2} onBack={() => setStep('safety')} backLabel={m.common.back} />
            <div className="knob grid size-12 place-items-center bg-brand text-bg">
              <Sparkles className="size-6" strokeWidth={2.2} />
            </div>
            <h1 className="mt-5 text-2xl font-bold tracking-tight text-ink">{t.setupTitle}</h1>
            <label className="mt-6 block">
              <span className="text-sm font-semibold text-ink">{t.startDate}</span>
              <span className="block text-xs text-mute">{t.startDateHint}</span>
              <input
                type="date"
                value={startDate}
                min={addDays(today, -29)}
                max={today}
                onChange={(e) => e.target.value && setStartDate(e.target.value)}
                className="mt-2 h-12 w-full rounded-xl border border-line bg-panel px-3 text-ink"
              />
            </label>
            <fieldset className="mt-6">
              <legend className="text-sm font-semibold text-ink">{t.partOfDay}</legend>
              <p className="text-xs text-mute">{t.partOfDayHint}</p>
              <div className="mt-4 grid grid-cols-4 gap-x-2 gap-y-4">
                {ERGO_CATEGORIES.map((c) => {
                  const on = c.core || categories.includes(c.id)
                  const Icon = CATEGORY_ICONS[c.id]
                  return (
                    <button
                      key={c.id}
                      type="button"
                      disabled={c.core}
                      aria-pressed={on}
                      onClick={() => toggleCategory(c.id)}
                      className={cn('group flex flex-col items-center gap-1.5 text-center', c.core && 'opacity-80')}
                    >
                      <span
                        className={cn(
                          'knob relative grid size-12 place-items-center transition-all duration-200 group-active:scale-[0.93]',
                          on ? 'bg-brand text-bg' : 'bg-panel-2 text-mute group-hover:text-ink',
                        )}
                      >
                        <Icon className="size-5" strokeWidth={2.2} aria-hidden />
                        {on && (
                          <span className="absolute -top-0.5 -end-0.5 grid size-4 place-items-center rounded-full border-2 border-bg bg-ink text-bg" aria-hidden>
                            <Check className="size-2.5" strokeWidth={4} />
                          </span>
                        )}
                      </span>
                      <span className={cn('text-[10px] leading-tight font-bold tracking-[0.06em] uppercase', on ? 'text-ink' : 'text-dim')}>{m.ergoCategories[c.id].name}</span>
                    </button>
                  )
                })}
              </div>
            </fieldset>
            <div className="mt-auto pt-8">
              <Button className="w-full" onClick={() => completeOnboarding({ start_date: startDate, active_ergo_categories: categories })}>
                {t.startProgram} <ArrowRight className="size-4 rtl:-scale-x-100" />
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
