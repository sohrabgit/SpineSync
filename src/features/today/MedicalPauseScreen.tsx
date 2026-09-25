import { PhoneCall, ShieldAlert } from 'lucide-react'
import { RED_FLAGS } from '@/data/redFlags'
import type { RedFlagId } from '@/types/recovery'
import { Button } from '@/components/ui/Button'

export function MedicalPauseScreen({ flags, onEdit }: { flags: RedFlagId[]; onEdit: () => void }) {
  return (
    <section className="animate-pop overflow-hidden rounded-3xl border border-danger/50 bg-danger/12 p-5 text-ink" aria-labelledby="pause-title">
      <span className="knob grid size-12 place-items-center bg-danger text-bg">
        <ShieldAlert className="size-6" aria-hidden />
      </span>
      <h2 id="pause-title" className="mt-3 text-xl font-bold text-ink">
        Exercises paused for your safety
      </h2>
      <p className="mt-1 text-sm text-ink/80">You reported symptoms that need urgent medical assessment:</p>
      <ul className="mt-3 space-y-1.5 text-sm">
        {RED_FLAGS.filter((f) => flags.includes(f.id)).map((f) => (
          <li key={f.id} className="rounded-lg border border-danger/30 bg-panel px-3 py-2">
            {f.label}
          </li>
        ))}
      </ul>
      <div className="mt-4 rounded-xl bg-panel p-3 text-sm text-ink/90">
        <p className="font-semibold text-danger">What to do now</p>
        <ul className="mt-1 list-disc space-y-0.5 pl-5">
          <li>Contact your doctor or an urgent care clinic today.</li>
          <li>If symptoms are sudden or severe, or you lose bladder or bowel control, call your local emergency number.</li>
          <li>Rest with your neck supported. Don’t do any exercises.</li>
        </ul>
      </div>
      <div className="mt-4 grid gap-2">
        <a href="tel:112" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-danger bg-danger text-sm font-bold tracking-[0.04em] text-bg uppercase press active:scale-[0.97]">
          <PhoneCall className="size-4" /> Call emergency (112)
        </a>
        <Button variant="ghost" onClick={onEdit}>
          I logged this by mistake: edit check-in
        </Button>
      </div>
    </section>
  )
}
