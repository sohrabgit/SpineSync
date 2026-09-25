import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, type TooltipContentProps } from 'recharts'
import { useI18n } from '@/i18n'
import { CHART, chartAxes, DAY_TICKS } from './chartTheme'
import { ChartTooltipBox } from './ChartTooltip'
import type { DayPoint } from './ProgressDashboard'

function AdherenceTooltip({ active, payload }: Partial<TooltipContentProps<number, string>>) {
  const p = payload?.[0]?.payload as DayPoint | undefined
  const { m, n } = useI18n()
  if (!active || !p || p.adherence === null) return null
  return (
    <ChartTooltipBox title={m.progress.dayN(p.day)}>
      <p>
        {m.progress.adherence} <strong className="text-ink">{n(`${p.adherence}%`)}</strong>
      </p>
    </ChartTooltipBox>
  )
}

export function AdherenceChart({ data, maxDay }: { data: DayPoint[]; maxDay: number }) {
  const { m, n, rtl } = useI18n()
  const axes = chartAxes(rtl)
  const points = data.filter((d) => d.adherence !== null)
  return (
    <div className="h-44 w-full" dir="ltr" role="img" aria-label={m.progress.adherenceAria(points.length)}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={points} margin={axes.margin} barCategoryGap={2}>
          <CartesianGrid vertical={false} stroke={CHART.grid} strokeWidth={1} />
          <XAxis
            dataKey="day"
            type="number"
            domain={[0.5, maxDay + 0.5]}
            ticks={DAY_TICKS.filter((t) => t <= maxDay)}
            reversed={axes.xReversed}
            tickFormatter={n}
            tick={CHART.tick}
            tickLine={false}
            axisLine={{ stroke: CHART.grid }}
          />
          <YAxis
            domain={[0, 100]}
            ticks={[0, 50, 100]}
            orientation={axes.yOrientation}
            tickFormatter={(v: number) => n(`${v}%`)}
            tick={CHART.tick}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip content={<AdherenceTooltip />} cursor={{ fill: CHART.seriesWash }} />
          <Bar dataKey="adherence" fill={CHART.series} radius={[4, 4, 0, 0]} maxBarSize={8} animationDuration={600} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
