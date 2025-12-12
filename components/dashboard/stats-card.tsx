import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatsCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  trend?: number
  trendLabel?: string
  color?: 'green' | 'blue' | 'purple' | 'yellow' | 'red'
}

const colorClasses = {
  green: 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300',
  blue: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300',
  purple: 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300',
  yellow: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-300',
  red: 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300',
}

export function StatsCard({
  title,
  value,
  icon: Icon,
  trend,
  trendLabel,
  color = 'green',
}: StatsCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className={cn('rounded-full p-2', colorClasses[color])}>
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {trend !== undefined && trendLabel && (
          <p className="text-xs text-muted-foreground mt-1">
            <span className={trend >= 0 ? 'text-green-600' : 'text-red-600'}>
              {trend >= 0 ? '+' : ''}
              {trend}%
            </span>{' '}
            {trendLabel}
          </p>
        )}
      </CardContent>
    </Card>
  )
}

