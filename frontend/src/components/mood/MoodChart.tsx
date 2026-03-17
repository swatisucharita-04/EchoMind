import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from 'recharts'
import { format, parseISO } from 'date-fns'
import type { WeeklyTrendPoint } from '@/types'
import { scoreToMood, getMoodConfig } from '@/lib/moodUtils'

interface Props {
  data: WeeklyTrendPoint[]
}

function CustomDot(props: any) {
  const { cx, cy, payload } = props
  const mood = scoreToMood(payload.avg_score)
  const cfg = getMoodConfig(mood)
  return (
    <circle
      cx={cx} cy={cy} r={5}
      fill={cfg.bg.replace('bg-', '')}
      stroke="#6366f1"
      strokeWidth={2}
    />
  )
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  const score = payload[0]?.value
  const mood = scoreToMood(score)
  const cfg = getMoodConfig(mood)
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-3 shadow-lg text-xs">
      <p className="font-semibold text-gray-700 dark:text-gray-300 mb-1">{label}</p>
      <p className={`font-bold ${cfg.color}`}>{cfg.emoji} {cfg.label}</p>
      <p className="text-gray-400">Score: {score?.toFixed(1)} / 10</p>
    </div>
  )
}

export default function MoodChart({ data }: Props) {
  const formatted = data.map((d) => ({
    ...d,
    label: (() => { try { return format(parseISO(d.date), 'EEE') } catch { return d.date } })(),
  }))

  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
        No mood data yet. Start chatting!
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={formatted} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
        <YAxis domain={[1, 10]} tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
        <Tooltip content={<CustomTooltip />} />
        <ReferenceLine y={5} stroke="#e5e7eb" strokeDasharray="4 4" />
        <Line
          type="monotone"
          dataKey="avg_score"
          stroke="#6366f1"
          strokeWidth={2.5}
          dot={<CustomDot />}
          activeDot={{ r: 7, fill: '#6366f1' }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
