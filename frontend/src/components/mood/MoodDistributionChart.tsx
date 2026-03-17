import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import type { MoodDistribution } from '@/types'
import { MOOD_CONFIG, MOOD_CHART_COLORS } from '@/lib/moodUtils'

interface Props { data: MoodDistribution }

export default function MoodDistributionChart({ data }: Props) {
  const chartData = Object.entries(data)
    .filter(([, v]) => v > 0)
    .map(([mood, count]) => ({
      name: MOOD_CONFIG[mood as keyof typeof MOOD_CONFIG]?.label ?? mood,
      value: count,
      color: MOOD_CHART_COLORS[mood as keyof typeof MOOD_CHART_COLORS] ?? '#95a5a6',
      emoji: MOOD_CONFIG[mood as keyof typeof MOOD_CONFIG]?.emoji ?? '',
    }))

  if (!chartData.length) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
        No distribution data yet.
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%" cy="50%"
          innerRadius={55} outerRadius={80}
          paddingAngle={3}
          dataKey="value"
        >
          {chartData.map((entry) => (
            <Cell key={entry.name} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value, name) => [`${value} entries`, name]}
          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: '12px' }}
        />
        <Legend
          formatter={(value, entry: any) => `${entry.payload.emoji} ${value}`}
          iconType="circle" iconSize={8}
          wrapperStyle={{ fontSize: '12px' }}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
