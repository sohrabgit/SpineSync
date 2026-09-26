import { PhoneCall, ShieldAlert } from 'lucide-react'
import { RED_FLAGS } from '@/data/redFlags'
import type { RedFlagId } from '@/types/recovery'
import { Button } from '@/components/ui/Button'
import { useI18n } from '@/i18n'

export function MedicalPauseScreen({ flags, onEdit }: { flags: RedFlagId[]; onEdit: () => void }) {
  const { m } = useI18n()
  const t = m.pause
  return (
    <section className="animate-pop overflow-hidden rounded-3xl border border-danger/50 bg-danger/12 p-5 text-ink" aria-labelledby="pause-title">
      <span className="knob grid size-12 place-items-center bg-danger text-bg">
        <ShieldAlert className="size-6" aria-hidden />
      </span>
      <h2 id="pause-title" className="mt-3 text-xl font-bold text-ink">
        {t.title}
      </h2>
      <p className="mt-1 text-sm text-ink/80">{t.lead}</p>
      <ul className="mt-3 space-y-1.5 text-sm">
        {RED_FLAGS.filter((id) => flags.includes(id)).map((id) => (
          <li key={id} className="rounded-lg border border-danger/30 bg-panel px-3 py-2">
            {m.redFlags[id]}
          </li>
        ))}
      </ul>
      <div className="mt-4 rounded-xl bg-panel p-3 text-sm text-ink/90">
        <p className="font-semibold text-danger">{t.whatNow}</p>
        <ul className="mt-1 list-disc space-y-0.5 ps-5">
          {t.steps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ul>
      </div>
      <div className="mt-4 grid gap-2">
        <a href="tel:112" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-danger bg-danger text-sm font-semibold text-bg press active:scale-[0.97]">
          <PhoneCall className="size-4" /> {t.call}
        </a>
        <Button variant="ghost" onClick={onEdit}>
          {t.mistake}
        </Button>
      </div>
    </section>
  )
}
