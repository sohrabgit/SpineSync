import type { ReactNode } from 'react'
import { ArrowRight, Check, Dumbbell, Gauge, LineChart, Monitor, RefreshCw, Timer } from 'lucide-react'
import type { ErgoCategoryId, Phase } from '@/types/recovery'
import { PHASES, PROGRAM_DAYS } from '@/lib/program'
import { vasBand } from '@/lib/metrics'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/components/ui/cn'
import { ProgressRing } from '@/components/ui/ProgressRing'
import { LEVEL_TONE, vasColor } from '@/components/ui/tone'
import { useI18n } from '@/i18n'
import { CATEGORY_ICONS } from '@/features/ergonomics/categoryIcons'

/*
 * Decorative mock-ups for the intro slides. They are built from the app's own
 * pieces so the first run previews what the app looks like. `active` plays the
 * entry animation when the slide scrolls into view. Screen readers skip them;
 * the slide text carries the meaning.
 */

/** Glowing panel that hosts a slide's visual. */
export function Stage({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      aria-hidden
      className={cn('relative flex h-[min(22rem,48dvh)] shrink-0 items-center justify-center overflow-hidden rounded-[28px] border border-line/60 bg-panel', className)}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,color-mix(in_oklab,var(--color-brand)_20%,transparent),transparent_70%)]" />
      <div className="relative w-full p-4">{children}</div>
    </div>
  )
}

/** Staggered fade-and-rise used by the mock rows. */
function reveal(active: boolean, index: number) {
  return {
    className: cn('transition-all duration-500 ease-out', active ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'),
    style: { transitionDelay: active ? `${150 + index * 120}ms` : '0ms' },
  }
}

const Card = ({ children, className }: { children: ReactNode; className?: string }) => (
  <div className={cn('rounded-2xl border border-line/50 bg-well/90 p-3 shadow-[0_8px_24px_rgb(0_0_0/0.25)]', className)}>{children}</div>
)

// ── Slide 1 ─────────────────────────────────────────────────────────────

/** Vertebrae start out of line and settle into a straight stack. */
const VERTEBRAE = [
  { x: 24, y: 10, w: 16, h: 8, o: 0.55, shift: -7 },
  { x: 23, y: 21, w: 18, h: 8, o: 0.7, shift: 6 },
  { x: 22, y: 32, w: 20, h: 8, o: 0.85, shift: -4 },
  { x: 21, y: 43, w: 22, h: 9, o: 1, shift: 3 },
]

export function WelcomeVisual({ active }: { active: boolean }) {
  const { m } = useI18n()
  const chips = [
    { icon: Gauge, label: m.tabs.today, color: 'text-success', pos: 'top-2 start-0', delay: '0s' },
    { icon: Dumbbell, label: m.tabs.exercises, color: 'text-best', pos: 'top-10 end-0', delay: '-1s' },
    { icon: Monitor, label: m.tabs.ergonomics, color: 'text-info', pos: 'bottom-10 start-1', delay: '-2s' },
    { icon: LineChart, label: m.tabs.progress, color: 'text-warning', pos: 'bottom-2 end-2', delay: '-3s' },
  ]
  return (
    <div className="relative mx-auto h-56 max-w-xs">
      <div className="absolute inset-0 grid place-items-center">
        <span className="absolute size-52 animate-pulse-soft rounded-full border border-brand/10" />
        <span className="absolute size-40 rounded-full border border-brand/15" />
        <span className="absolute size-28 rounded-full bg-brand/10 blur-xl" />
        <svg viewBox="0 0 64 64" className="relative size-24 drop-shadow-[0_10px_30px_rgb(92_200_176/0.25)]">
          <rect width="64" height="64" rx="16" fill="var(--color-panel-2)" />
          {VERTEBRAE.map((v, i) => (
            <rect
              key={i}
              x={v.x}
              y={v.y}
              width={v.w}
              height={v.h}
              rx={v.h / 2}
              fill="var(--color-brand)"
              opacity={v.o}
              style={{
                transform: active ? 'none' : `translateX(${v.shift}px)`,
                transition: 'transform 900ms cubic-bezier(0.2, 0.8, 0.2, 1)',
                transitionDelay: active ? `${300 + i * 90}ms` : '0ms',
              }}
            />
          ))}
        </svg>
      </div>
      {chips.map(({ icon: Icon, label, color, pos, delay }) => (
        <div key={label} className={cn('absolute', pos)}>
          <span
            className="flex animate-float items-center gap-1.5 rounded-full border border-line/70 bg-panel-2/90 px-3 py-1.5 text-xs font-bold text-ink shadow-[0_6px_18px_rgb(0_0_0/0.35)] backdrop-blur"
            style={{ animationDelay: delay }}
          >
            <Icon className={cn('size-3.5', color)} strokeWidth={2.4} />
            {label}
          </span>
        </div>
      ))}
    </div>
  )
}

// ── Slide 2 ─────────────────────────────────────────────────────────────

const SAMPLE_VAS = 2

export function CheckinVisual({ active }: { active: boolean }) {
  const { m, n } = useI18n()
  const t = m.onboarding
  const outcomes = [
    { label: t.calmDay, level: 'standard', dot: 'bg-success' },
    { label: t.soreDay, level: 'reduced', dot: 'bg-warning' },
    { label: t.redFlag, level: 'medical_pause', dot: 'bg-danger' },
  ] as const
  return (
    <div className="mx-auto max-w-xs space-y-2.5">
      <Card>
        <p className="text-xs font-semibold text-mute">{t.checkinQuestion}</p>
        <div className="mt-1 flex items-baseline gap-2">
          <span className="text-3xl font-bold tabular-nums" style={{ color: vasColor(SAMPLE_VAS) }}>
            {n(active ? SAMPLE_VAS : 0)}
          </span>
          <span className="text-sm font-semibold text-ink">{m.vas[vasBand(active ? SAMPLE_VAS : 0)]}</span>
        </div>
        <div className="relative mt-3 h-2 rounded-full bg-[linear-gradient(90deg,#72d39c_0%,#f2c86b_40%,#f3a66a_65%,#f2706b_100%)] rtl:bg-[linear-gradient(270deg,#72d39c_0%,#f2c86b_40%,#f3a66a_65%,#f2706b_100%)]">
          <span
            className="absolute top-1/2 -ms-2.5 size-5 -translate-y-1/2 rounded-full border-[3px] border-well bg-ink shadow-md"
            style={{ insetInlineStart: active ? `${SAMPLE_VAS * 10}%` : '0%', transition: 'inset-inline-start 900ms cubic-bezier(0.2, 0.8, 0.2, 1) 200ms' }}
          />
        </div>
      </Card>
      {outcomes.map((o, i) => {
        const r = reveal(active, i + 2)
        return (
          <div key={o.level} className={cn('flex items-center gap-2.5 rounded-xl border border-line/50 bg-well/80 px-3 py-2', r.className)} style={r.style}>
            <span className={cn('size-2 shrink-0 rounded-full', o.dot)} />
            <span className="flex-1 text-xs font-semibold text-ink">{o.label}</span>
            <ArrowRight className="size-3.5 text-dim rtl:-scale-x-100" />
            <Badge tone={LEVEL_TONE[o.level]}>{m.levels[o.level].short}</Badge>
          </div>
        )
      })}
    </div>
  )
}

// ── Slide 3 ─────────────────────────────────────────────────────────────

const PHASE_COLORS: Record<Phase, string> = { 1: 'bg-brand', 2: 'bg-info', 3: 'bg-best', 4: 'bg-warning' }

export function ProgramVisual({ active }: { active: boolean }) {
  const { m, n } = useI18n()
  const t = m.onboarding
  const phases = Object.values(PHASES)
  return (
    <div className="mx-auto max-w-xs space-y-2.5">
      <Card>
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-semibold text-mute">{t.days(1, PROGRAM_DAYS)}</p>
          <Badge tone="positive">{t.today}</Badge>
        </div>
        <div className="relative mt-4 flex gap-1">
          {phases.map((p, i) => (
            <div key={p.phase} className="relative h-2.5 overflow-hidden rounded-full bg-panel-2" style={{ flexGrow: p.endDay - p.startDay + 1 }}>
              <span
                className={cn('absolute inset-y-0 start-0 rounded-full', PHASE_COLORS[p.phase])}
                style={{ width: active ? '100%' : '0%', transition: 'width 500ms ease-out', transitionDelay: active ? `${250 + i * 350}ms` : '0ms' }}
              />
            </div>
          ))}
          {/* "You are here" pin on day 1 */}
          <span className="absolute -top-1 start-0 size-4.5 rounded-full border-[3px] border-well bg-ink shadow-md" />
        </div>
        <ul className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1.5">
          {phases.map((p) => (
            <li key={p.phase} className="flex min-w-0 items-center gap-1.5 text-[11px] text-mute">
              <span className={cn('grid size-4 shrink-0 place-items-center rounded-full text-[9px] font-bold text-bg', PHASE_COLORS[p.phase])}>{n(p.phase)}</span>
              <span className="truncate">{m.phases[p.phase].name}</span>
            </li>
          ))}
        </ul>
      </Card>
      <Card className={cn('flex items-center gap-3', reveal(active, 4).className)}>
        <ProgressRing value={active ? 0.65 : 0} size={48} stroke={5}>
          <RefreshCw className="size-4 text-brand" strokeWidth={2.4} />
        </ProgressRing>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-ink">{m.exercises.chin_tuck.name}</p>
          <p className="truncate text-xs text-mute">{m.dose.reps(3, 10, 5, null)}</p>
        </div>
      </Card>
    </div>
  )
}

// ── Slide 4 ─────────────────────────────────────────────────────────────

const SAMPLE_CATEGORIES: ErgoCategoryId[] = ['desk', 'devices', 'sleep']
/** A calm, downward pain trend for the sparkline (0–10, higher = worse). */
const TREND = [6, 6.5, 5, 5.5, 4, 4.5, 3, 2.5, 3, 2]

export function ErgoVisual({ active }: { active: boolean }) {
  const { m } = useI18n()
  const points = TREND.map((v, i) => `${(i / (TREND.length - 1)) * 100},${4 + (1 - v / 10) * 32}`).join(' ')
  return (
    <div className="mx-auto max-w-xs space-y-2.5">
      <Card className="space-y-2">
        {SAMPLE_CATEGORIES.map((id, i) => {
          const Icon = CATEGORY_ICONS[id]
          const done = active && i < 2
          return (
            <div key={id} className="flex items-center gap-2.5">
              <span className="grid size-7 shrink-0 place-items-center rounded-full bg-panel-2 text-mute">
                <Icon className="size-3.5" strokeWidth={2.2} />
              </span>
              <span className="flex-1 truncate text-xs font-semibold text-ink">{m.ergoCategories[id].name}</span>
              <span
                className={cn(
                  'grid size-5 place-items-center rounded-full border transition-all duration-300',
                  done ? 'scale-100 border-success bg-success text-bg' : 'scale-90 border-line-strong text-transparent',
                )}
                style={{ transitionDelay: active ? `${300 + i * 250}ms` : '0ms' }}
              >
                <Check className="size-3" strokeWidth={3.5} />
              </span>
            </div>
          )
        })}
      </Card>
      <div className="grid grid-cols-2 gap-2.5">
        <Card className="flex flex-col items-center gap-2 text-center">
          <ProgressRing value={active ? 0.75 : 0} size={52} stroke={5} color="#7fa9f5">
            <Timer className="size-4 text-info" strokeWidth={2.4} />
          </ProgressRing>
          <p className="text-[11px] leading-tight font-semibold text-mute">{m.workMode.sheet.title}</p>
        </Card>
        <Card className="flex flex-col justify-between gap-2">
          <p className="text-[11px] leading-tight font-semibold text-mute">{m.progress.painTrend}</p>
          {/* SVG coordinates ignore dir, so the trend runs left to right in every language, like the app's charts. */}
          <svg viewBox="0 0 100 40" preserveAspectRatio="none" className="h-14 w-full overflow-visible">
            <polyline
              points={points}
              fill="none"
              stroke="var(--color-success)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
              pathLength={1}
              strokeDasharray={1}
              style={{ strokeDashoffset: active ? 0 : 1, transition: 'stroke-dashoffset 1200ms ease-out 300ms' }}
            />
          </svg>
        </Card>
      </div>
    </div>
  )
}
