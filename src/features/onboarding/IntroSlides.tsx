import { useRef, useState, type ReactNode } from 'react'
import { ArrowLeft, ArrowRight, LockKeyhole } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/components/ui/cn'
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher'
import { useI18n } from '@/i18n'
import { CheckinVisual, ErgoVisual, ProgramVisual, Stage, WelcomeVisual } from './IntroVisuals'

interface Slide {
  visual: (active: boolean) => ReactNode
  title: ReactNode
  body: string
  extra?: ReactNode
}

/** Swipeable intro carousel shown before the safety check. Native scroll-snap, so RTL just works. */
export function IntroSlides({ onDone }: { onDone: () => void }) {
  const { m } = useI18n()
  const t = m.onboarding
  const trackRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)

  const slides: Slide[] = [
    {
      visual: (a) => <WelcomeVisual active={a} />,
      title: (
        <>
          {t.heroA} <span className="text-brand">{t.heroB}</span>
        </>
      ),
      body: t.intro,
      extra: <LanguageSwitcher className="mt-5" />,
    },
    { visual: (a) => <CheckinVisual active={a} />, title: t.checkinTitle, body: t.checkinBody },
    { visual: (a) => <ProgramVisual active={a} />, title: t.programTitle, body: t.programBody },
    {
      visual: (a) => <ErgoVisual active={a} />,
      title: t.ergoTitle,
      body: t.ergoBody,
      extra: (
        <p className="mt-4 flex items-center gap-2 text-xs font-semibold text-mute">
          <LockKeyhole className="size-3.5 shrink-0 text-brand" aria-hidden />
          {t.privacy}
        </p>
      ),
    },
  ]
  const last = slides.length - 1

  const goTo = (i: number) => {
    trackRef.current?.children[i]?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
  }

  // scrollLeft is negative in RTL, so compare magnitudes.
  const onScroll = () => {
    const el = trackRef.current
    if (!el || !el.clientWidth) return
    setActive(Math.min(last, Math.round(Math.abs(el.scrollLeft) / el.clientWidth)))
  }

  return (
    <>
      <div className="flex h-10 items-center gap-4">
        <div className="flex flex-1 gap-1.5">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={t.slideOf(i + 1, slides.length)}
              aria-current={i === active ? 'step' : undefined}
              onClick={() => goTo(i)}
              className="group flex h-6 flex-1 items-center"
            >
              <span className="h-1 w-full overflow-hidden rounded-full bg-line">
                <span className={cn('block h-full rounded-full bg-brand transition-all duration-500', i <= active ? 'w-full' : 'w-0')} />
              </span>
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={onDone}
          className={cn('text-sm font-bold text-mute transition hover:text-ink', active === last && 'invisible')}
        >
          {t.skip}
        </button>
      </div>

      <div ref={trackRef} onScroll={onScroll} className="no-scrollbar -mx-5 mt-3 flex flex-1 snap-x snap-mandatory overflow-x-auto">
        {slides.map((s, i) => (
          <section
            key={i}
            aria-label={t.slideOf(i + 1, slides.length)}
            aria-hidden={i !== active}
            inert={i !== active}
            className="flex w-full shrink-0 snap-center snap-always flex-col px-5"
          >
            <Stage>{s.visual(i === active)}</Stage>
            <div className={cn('pt-7 transition-all duration-500', i === active ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0')}>
              {i === 0 && <p className="cap mb-2 text-brand">SpineSync · {t.tagline}</p>}
              <h1 className="text-[1.75rem] leading-tight font-bold tracking-tight text-ink">{s.title}</h1>
              <p className="mt-3 text-[15px] text-mute">{s.body}</p>
              {s.extra}
            </div>
          </section>
        ))}
      </div>

      <div className="flex gap-3 pt-6">
        {active > 0 && (
          <Button variant="secondary" aria-label={m.common.back} onClick={() => goTo(active - 1)} className="w-12 shrink-0 animate-fade-in px-0">
            <ArrowLeft className="size-4 rtl:-scale-x-100" />
          </Button>
        )}
        <Button className="flex-1" onClick={() => (active === last ? onDone() : goTo(active + 1))}>
          {active === last ? t.getStarted : t.next} <ArrowRight className="size-4 rtl:-scale-x-100" />
        </Button>
      </div>
    </>
  )
}
