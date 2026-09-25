import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, type TooltipContentProps } from 'recharts'
import { CHART, DAY_TICKS } from './chartTheme'
import { ChartTooltipBox } from './ChartTooltip'
import type { DayPoint } from './ProgressDashboard'

function AdherenceTooltip({ active, payload }: Partial<TooltipContentProps<number, string>>) {
  const p = payload?.[0]?.payload as DayPoint | undefined
  if (!active || !p || p.adherence === null) return null
  return (
    <ChartTooltipBox title={`Day ${p.day}`}>
      <p>
        Adherence: <strong className="text-slate-900">{p.adherence}%</strong>
      </p>
    </ChartTooltipBox>
  )
}

export function AdherenceChart({ data, maxDay }: { data: DayPoint[]; maxDay: number }) {
  const points = data.filter((d) => d.adherence !== null)
  return (
    <div className="h-44 w-full" role="img" aria-label={`Daily adherence bar chart across ${points.length} days`}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={points} margin={{ top: 8, right: 12, bottom: 0, left: -20 }} barCategoryGap={2}>
          <CartesianGrid vertical={false} stroke={CHART.grid} strokeWidth={1} />
          <XAxis
            dataKey="day"
            type="number"
            domain={[0.5, maxDay + 0.5]}
            ticks={DAY_TICKS.filter((t) => t <= maxDay)}
            tick={CHART.tick}
            tickLine={false}
            axisLine={{ stroke: CHART.grid }}
          />
          <YAxis domain={[0, 100]} ticks={[0, 50, 100]} tick={CHART.tick} tickLine={false} axisLine={false} unit="%" />
          <Tooltip content={<AdherenceTooltip />} cursor={{ fill: CHART.seriesWash }} />
          <Bar dataKey="adherence" fill={CHART.series} radius={[4, 4, 0, 0]} maxBarSize={8} animationDuration={600} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
