import { useState } from 'react'
import { ArrowRight, Check, HeartPulse, ShieldAlert, ShieldCheck, Sparkles, Stethoscope } from 'lucide-react'
import type { ErgoCategoryId } from '@/types/recovery'
import { RED_FLAGS } from '@/data/redFlags'
import { DEFAULT_ACTIVE_CATEGORIES, ERGO_CATEGORIES } from '@/data/ergonomics'
import { addDays, appToday } from '@/lib/date'
import { PHASES } from '@/lib/program'
import { useRecoveryStore } from '@/store/useRecoveryStore'
import { Button } from '@/components/ui/Button'
import { cn } from '@/components/ui/cn'
import { CATEGORY_ICONS } from '@/features/ergonomics/categoryIcons'

type Step = 'welcome' | 'safety' | 'blocked' | 'setup'

export function Onboarding() {
  const completeOnboarding = useRecoveryStore((s) => s.completeOnboarding)
  const [step, setStep] = useState<Step>('welcome')
  const [acknowledged, setAcknowledged] = useState(false)
  const today = appToday()
  const [startDate, setStartDate] = useState(today)
  const [categories, setCategories] = useState<ErgoCategoryId[]>(DEFAULT_ACTIVE_CATEGORIES)

  const toggleCategory = (id: ErgoCategoryId) =>
    setCategories((cs) => (cs.includes(id) ? cs.filter((c) => c !== id) : [...cs, id]))

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col bg-bg px-5 pt-[max(2rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))]">
      <div key={step} className="flex flex-1 animate-fade-in flex-col">
        {step === 'welcome' && (
          <>
            <div className="flex items-center gap-3">
              <img src={`${import.meta.env.BASE_URL}favicon.svg`} alt="" className="size-12 rounded-2xl" />
              <div>
                <p className="text-xl font-bold tracking-tight text-ink">SpineSync</p>
                <p className="text-sm text-mute">30-day cervical recovery</p>
              </div>
            </div>
            <h1 className="mt-10 text-3xl leading-tight font-bold tracking-tight text-ink">
              A calmer neck,
              <br />
              <span className="text-brand">one day at a time.</span>
            </h1>
            <p className="mt-3 text-mute">Check in each morning. SpineSync adjusts your exercises, ergonomics and rest to how your neck feels that day.</p>
            <ol className="mt-8 space-y-3">
              {Object.values(PHASES).map((p) => (
                <li key={p.phase} className="flex items-start gap-3 rounded-2xl border border-line/60 bg-panel p-3">
                  <span className="knob grid size-8 shrink-0 place-items-center bg-brand text-sm font-bold text-bg">{p.phase}</span>
                  <div>
                    <p className="text-sm font-semibold text-ink">
                      {p.name} <span className="font-normal text-mute">· Days {p.startDay}–{p.endDay}</span>
                    </p>
                    <p className="text-xs text-mute">{p.focus}</p>
                  </div>
                </li>
              ))}
            </ol>
            <div className="mt-auto pt-8">
              <Button className="w-full" onClick={() => setStep('safety')}>
                Get started <ArrowRight className="size-4" />
              </Button>
            </div>
          </>
        )}

        {step === 'safety' && (
          <>
            <div className="knob grid size-12 place-items-center bg-danger text-bg">
              <ShieldAlert className="size-6" strokeWidth={2.2} />
            </div>
            <h1 className="mt-5 text-2xl font-bold tracking-tight text-ink">Safety check</h1>
            <p className="mt-2 text-sm text-mute">Before you start, confirm that you have <strong className="text-ink">none</strong> of these symptoms:</p>
            <ul className="mt-4 space-y-2">
              {RED_FLAGS.map((f) => (
                <li key={f.id} className="flex gap-3 rounded-xl border border-line/60 bg-panel p-3 text-sm text-ink/90">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-danger" aria-hidden />
                  {f.label}
                </li>
              ))}
            </ul>
            <div className="mt-5 flex gap-3 rounded-xl bg-well p-3 text-xs text-mute">
              <Stethoscope className="size-4 shrink-0 text-dim" aria-hidden />
              <p>SpineSync is a self-management companion and does not replace professional medical advice. Check with your doctor or physiotherapist before starting any exercise program.</p>
            </div>
            <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-xl p-1">
              <input type="checkbox" checked={acknowledged} onChange={(e) => setAcknowledged(e.target.checked)} className="mt-0.5 size-5 accent-brand" />
              <span className="text-sm text-ink/90">I have none of the symptoms above, and I understand this app is not medical advice.</span>
            </label>
            <div className="mt-auto grid gap-2 pt-8">
              <Button disabled={!acknowledged} onClick={() => setStep('setup')}>
                <ShieldCheck className="size-4" /> Continue
              </Button>
              <Button variant="danger" onClick={() => setStep('blocked')}>
                I have one or more of these symptoms
              </Button>
            </div>
          </>
        )}

        {step === 'blocked' && (
          <>
            <div className="knob grid size-12 place-items-center bg-danger text-bg">
              <HeartPulse className="size-6" strokeWidth={2.2} />
            </div>
            <h1 className="mt-5 text-2xl font-bold tracking-tight text-ink">Please see a doctor first</h1>
            <p className="mt-3 text-mute">
              These symptoms can mean nerve or spinal cord compression, which needs medical assessment before any exercise. Contact your doctor today. If symptoms are sudden or severe, call your local emergency number.
            </p>
            <div className="mt-auto pt-8">
              <Button variant="secondary" className="w-full" onClick={() => setStep('safety')}>
                Back
              </Button>
            </div>
          </>
        )}

        {step === 'setup' && (
          <>
            <div className="knob grid size-12 place-items-center bg-brand text-bg">
              <Sparkles className="size-6" strokeWidth={2.2} />
            </div>
            <h1 className="mt-5 text-2xl font-bold tracking-tight text-ink">Personalise your plan</h1>
            <label className="mt-6 block">
              <span className="text-sm font-semibold text-ink">Program start date</span>
              <span className="block text-xs text-mute">Pick an earlier date if you’ve already started.</span>
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
              <legend className="text-sm font-semibold text-ink">Which of these are part of your day?</legend>
              <p className="text-xs text-mute">They’ll be added to your daily ergonomics checklist. You can change this later.</p>
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
                          <span className="absolute -top-0.5 -right-0.5 grid size-4 place-items-center rounded-full border-2 border-bg bg-ink text-bg" aria-hidden>
                            <Check className="size-2.5" strokeWidth={4} />
                          </span>
                        )}
                      </span>
                      <span className={cn('text-[10px] leading-tight font-bold tracking-[0.06em] uppercase', on ? 'text-ink' : 'text-dim')}>{c.name}</span>
                    </button>
                  )
                })}
              </div>
            </fieldset>
            <div className="mt-auto pt-8">
              <Button className="w-full" onClick={() => completeOnboarding({ start_date: startDate, active_ergo_categories: categories })}>
                Start my program <ArrowRight className="size-4" />
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
