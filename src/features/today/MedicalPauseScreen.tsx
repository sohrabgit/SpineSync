import { PhoneCall, ShieldAlert } from 'lucide-react'
import { RED_FLAGS } from '@/data/redFlags'
import type { RedFlagId } from '@/types/recovery'
import { Button } from '@/components/ui/Button'

export function MedicalPauseScreen({ flags, onEdit }: { flags: RedFlagId[]; onEdit: () => void }) {
  return (
    <section className="animate-pop overflow-hidden rounded-3xl bg-gradient-to-br from-rose-600 to-rose-700 p-5 text-white shadow-lg shadow-rose-900/25" aria-labelledby="pause-title">
      <ShieldAlert className="size-9" aria-hidden />
      <h2 id="pause-title" className="mt-3 text-xl font-bold">
        Exercises paused for your safety
      </h2>
      <p className="mt-1 text-sm text-rose-50">You reported symptoms that need urgent medical assessment:</p>
      <ul className="mt-3 space-y-1.5 text-sm">
        {RED_FLAGS.filter((f) => flags.includes(f.id)).map((f) => (
          <li key={f.id} className="rounded-lg bg-white/10 px-3 py-2">
            {f.label}
          </li>
        ))}
      </ul>
      <div className="mt-4 rounded-xl bg-white p-3 text-sm text-rose-900">
        <p className="font-semibold">What to do now</p>
        <ul className="mt-1 list-disc space-y-0.5 pl-5">
          <li>Contact your doctor or an urgent care clinic today.</li>
          <li>If symptoms are sudden or severe, or you lose bladder or bowel control, call your local emergency number.</li>
          <li>Rest with your neck supported. Don’t do any exercises.</li>
        </ul>
      </div>
      <div className="mt-4 grid gap-2">
        <a href="tel:112" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-white text-sm font-semibold text-rose-700 active:scale-[0.98]">
          <PhoneCall className="size-4" /> Call emergency (112)
        </a>
        <Button variant="ghost" className="text-white hover:bg-white/10 active:bg-white/20" onClick={onEdit}>
          I logged this by mistake: edit check-in
        </Button>
      </div>
    </section>
  )
}
