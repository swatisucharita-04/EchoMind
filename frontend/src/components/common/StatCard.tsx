import type { LucideIcon } from 'lucide-react'

interface Props {
  icon: LucideIcon
  label: string
  value: string | number
  sub?: string
  color?: string
}

export default function StatCard({ icon: Icon, label, value, sub, color = 'text-brand-600' }: Props) {
  return (
    <div className="card p-4 flex flex-col gap-2.5 hover:-translate-y-0.5 hover:shadow-md
      transition-all duration-150 cursor-default">
      <div className={`w-9 h-9 rounded-lg bg-gray-50 dark:bg-gray-800/80 flex items-center justify-center flex-shrink-0 ${color}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div>
        <p className="text-xl font-bold text-gray-900 dark:text-white tabular-nums">{value}</p>
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 leading-snug">{label}</p>
        {sub && <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}
