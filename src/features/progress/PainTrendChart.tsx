import { CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis, type TooltipContentProps } from 'recharts'
import { FLARE_VAS_THRESHOLD } from '@/lib/adaptive'
import { LEVEL_META, vasLabel } from '@/components/ui/tone'
import { CHART, DAY_TICKS } from './chartTheme'
import { ChartTooltipBox } from './ChartTooltip'
import type { DayPoint } from './ProgressDashboard'

function PainTooltip({ active, payload }: Partial<TooltipContentProps<number, string>>) {
  const p = payload?.[0]?.payload as DayPoint | undefined
  if (!active || !p || p.vas === null) return null
  return (
    <ChartTooltipBox title={`Day ${p.day}`}>
      <p>
        Pain: <strong className="text-slate-900">{p.vas}/10</strong> · {vasLabel(p.vas)}
      </p>
      {p.level && <p>{LEVEL_META[p.level].label}</p>}
    </ChartTooltipBox>
  )
}

interface DotProps {
  cx?: number
  cy?: number
  payload?: DayPoint
}

function PainDot({ cx, cy, payload }: DotProps) {
  if (cx === undefined || cy === undefined || !payload) return null
  const flare = payload.level === 'flare_up' || payload.level === 'medical_pause'
  return <circle cx={cx} cy={cy} r={flare ? 5 : 4} fill={flare ? CHART.critical : CHART.series} stroke={CHART.surface} strokeWidth={2} />
}

export function PainTrendChart({ data, maxDay }: { data: DayPoint[]; maxDay: number }) {
  const points = data.filter((d) => d.vas !== null)
  return (
    <div className="h-52 w-full" role="img" aria-label={`Pain trend line chart across ${points.length} check-ins`}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={points} margin={{ top: 8, right: 12, bottom: 0, left: -20 }}>
          <CartesianGrid vertical={false} stroke={CHART.grid} strokeWidth={1} />
          <XAxis
            dataKey="day"
            type="number"
            domain={[1, maxDay]}
            ticks={DAY_TICKS.filter((t) => t <= maxDay)}
            tick={CHART.tick}
            tickLine={false}
            axisLine={{ stroke: CHART.grid }}
          />
          <YAxis domain={[0, 10]} ticks={[0, 2, 4, 6, 8, 10]} tick={CHART.tick} tickLine={false} axisLine={false} />
          <ReferenceLine
            y={FLARE_VAS_THRESHOLD}
            stroke={CHART.critical}
            strokeOpacity={0.5}
            strokeWidth={1}
            label={{ value: 'Flare threshold', position: 'insideTopRight', fontSize: 10, fill: CHART.axisText }}
          />
          <Tooltip content={<PainTooltip />} cursor={{ stroke: CHART.grid, strokeWidth: 1 }} />
          <Line
            type="monotone"
            dataKey="vas"
            stroke={CHART.series}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            dot={<PainDot />}
            activeDot={{ r: 6, stroke: CHART.surface, strokeWidth: 2, fill: CHART.series }}
            isAnimationActive
            animationDuration={700}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
