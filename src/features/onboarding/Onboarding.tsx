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
    <div className="mx-auto flex min-h-dvh max-w-md flex-col bg-gradient-to-b from-teal-50 via-slate-50 to-slate-50 px-5 pt-[max(2rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))]">
      <div key={step} className="flex flex-1 animate-fade-in flex-col">
        {step === 'welcome' && (
          <>
            <div className="flex items-center gap-3">
              <img src={`${import.meta.env.BASE_URL}favicon.svg`} alt="" className="size-12 rounded-2xl shadow-md shadow-teal-900/20" />
              <div>
                <p className="text-xl font-bold tracking-tight text-slate-900">SpineSync</p>
                <p className="text-sm text-slate-500">30-day cervical recovery</p>
              </div>
            </div>
            <h1 className="mt-10 text-3xl leading-tight font-bold tracking-tight text-slate-900">
              A calmer neck,
              <br />
              <span className="text-teal-700">one day at a time.</span>
            </h1>
            <p className="mt-3 text-slate-600">Check in each morning. SpineSync adjusts your exercises, ergonomics and rest to how your neck feels that day.</p>
            <ol className="mt-8 space-y-3">
              {Object.values(PHASES).map((p) => (
                <li key={p.phase} className="flex items-start gap-3 rounded-2xl border border-slate-200/80 bg-white/80 p-3">
                  <span className="grid size-8 shrink-0 place-items-center rounded-full bg-teal-700 text-sm font-bold text-white">{p.phase}</span>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {p.name} <span className="font-normal text-slate-500">· Days {p.startDay}–{p.endDay}</span>
                    </p>
                    <p className="text-xs text-slate-500">{p.focus}</p>
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
            <div className="grid size-12 place-items-center rounded-2xl bg-rose-100 text-rose-600">
              <ShieldAlert className="size-6" />
            </div>
            <h1 className="mt-5 text-2xl font-bold tracking-tight text-slate-900">Safety check</h1>
            <p className="mt-2 text-sm text-slate-600">Before you start, confirm that you have <strong>none</strong> of these symptoms:</p>
            <ul className="mt-4 space-y-2">
              {RED_FLAGS.map((f) => (
                <li key={f.id} className="flex gap-3 rounded-xl border border-rose-100 bg-white p-3 text-sm text-slate-700">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-rose-500" aria-hidden />
                  {f.label}
                </li>
              ))}
            </ul>
            <div className="mt-5 flex gap-3 rounded-xl bg-slate-100 p-3 text-xs text-slate-600">
              <Stethoscope className="size-4 shrink-0 text-slate-500" aria-hidden />
              <p>SpineSync is a self-management companion and does not replace professional medical advice. Check with your doctor or physiotherapist before starting any exercise program.</p>
            </div>
            <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-xl p-1">
              <input type="checkbox" checked={acknowledged} onChange={(e) => setAcknowledged(e.target.checked)} className="mt-0.5 size-5 accent-teal-700" />
              <span className="text-sm text-slate-700">I have none of the symptoms above, and I understand this app is not medical advice.</span>
            </label>
            <div className="mt-auto grid gap-2 pt-8">
              <Button disabled={!acknowledged} onClick={() => setStep('setup')}>
                <ShieldCheck className="size-4" /> Continue
              </Button>
              <Button variant="ghost" className="text-rose-700 hover:bg-rose-50" onClick={() => setStep('blocked')}>
                I have one or more of these symptoms
              </Button>
            </div>
          </>
        )}

        {step === 'blocked' && (
          <>
            <div className="grid size-12 place-items-center rounded-2xl bg-rose-600 text-white">
              <HeartPulse className="size-6" />
            </div>
            <h1 className="mt-5 text-2xl font-bold tracking-tight text-slate-900">Please see a doctor first</h1>
            <p className="mt-3 text-slate-600">
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
            <div className="grid size-12 place-items-center rounded-2xl bg-teal-100 text-teal-700">
              <Sparkles className="size-6" />
            </div>
            <h1 className="mt-5 text-2xl font-bold tracking-tight text-slate-900">Personalise your plan</h1>
            <label className="mt-6 block">
              <span className="text-sm font-semibold text-slate-800">Program start date</span>
              <span className="block text-xs text-slate-500">Pick an earlier date if you’ve already started.</span>
              <input
                type="date"
                value={startDate}
                min={addDays(today, -29)}
                max={today}
                onChange={(e) => e.target.value && setStartDate(e.target.value)}
                className="mt-2 h-12 w-full rounded-xl border border-slate-200 bg-white px-3 text-slate-900"
              />
            </label>
            <fieldset className="mt-6">
              <legend className="text-sm font-semibold text-slate-800">Which of these are part of your day?</legend>
              <p className="text-xs text-slate-500">They’ll be added to your daily ergonomics checklist. You can change this later.</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {ERGO_CATEGORIES.map((c) => {
                  const on = c.core || categories.includes(c.id)
                  return (
                    <button
                      key={c.id}
                      type="button"
                      disabled={c.core}
                      aria-pressed={on}
                      onClick={() => toggleCategory(c.id)}
                      className={cn(
                        'inline-flex min-h-10 items-center gap-1.5 rounded-full border px-3 text-sm font-medium transition',
                        on ? 'border-teal-600 bg-teal-600 text-white' : 'border-slate-200 bg-white text-slate-700',
                        c.core && 'opacity-80',
                      )}
                    >
                      {on && <Check className="size-3.5" />}
                      {c.name}
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
