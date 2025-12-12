'use client'

import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Handshake, Sparkles } from 'lucide-react'
import { useCurrency } from '@/contexts/currency-context'
import { MatchStatus } from '@/types'

export type MatchCardProps = {
  id: string
  farmerName: string
  buyerName: string
  crop: string
  quantity: string
  compatibilityScore: number
  estimatedValue: number
  status: MatchStatus
  reasons?: string[]
  onUpdateStatus?: (id: string, status: MatchStatus) => void
}

const statusVariant: Record<MatchStatus, 'default' | 'secondary' | 'warning' | 'success' | 'outline'> = {
  [MatchStatus.SUGGESTED]: 'default',
  [MatchStatus.CONTACTED]: 'secondary',
  [MatchStatus.NEGOTIATING]: 'warning',
  [MatchStatus.CONTRACT_SIGNED]: 'success',
  [MatchStatus.COMPLETED]: 'success',
  [MatchStatus.CANCELLED]: 'outline',
}

export function MatchCard({
  id,
  farmerName,
  buyerName,
  crop,
  quantity,
  compatibilityScore,
  estimatedValue,
  status,
  reasons = [],
  onUpdateStatus,
}: MatchCardProps) {
  const router = useRouter()
  const { formatCurrency } = useCurrency()

  const handleStartNegotiation = () => {
    if (onUpdateStatus) {
      onUpdateStatus(id, MatchStatus.NEGOTIATING)
    }
    router.push(`/dashboard/negotiations/${id}`)
  }

  return (
    <Card className="hover:shadow-glow transition-shadow bg-slate-900 border-white/10 text-slate-100">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <Handshake className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">
                  {farmerName} ↔ {buyerName}
                </h3>
                <p className="text-sm text-gray-400">
                  {crop} • {quantity}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div>
                <span className="font-medium">Compatibility:</span>{' '}
                <span className="text-primary font-semibold">{compatibilityScore.toFixed(1)}%</span>
              </div>
              <div>
                <span className="font-medium">Estimated Value:</span> {formatCurrency(estimatedValue)}
              </div>
            </div>
            {reasons.length > 0 && (
              <div className="mt-3 p-3 bg-blue-900/30 border border-blue-800/50 rounded-lg text-sm">
                <p className="font-medium mb-1 flex items-center gap-2 text-blue-300">
                  <Sparkles className="h-4 w-4 text-blue-400" />
                  AI Reasons
                </p>
                <p className="text-gray-300 line-clamp-2">{reasons.join(', ')}</p>
              </div>
            )}
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge variant={statusVariant[status]}>{status}</Badge>
            {status === MatchStatus.SUGGESTED && onUpdateStatus && (
              <Button size="sm" onClick={() => onUpdateStatus(id, MatchStatus.CONTACTED)}>
                Contact
              </Button>
            )}
            {status === MatchStatus.CONTACTED && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleStartNegotiation}
              >
                Start Negotiation
              </Button>
            )}
            {status === MatchStatus.NEGOTIATING && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => router.push(`/dashboard/negotiations/${id}`)}
              >
                View Negotiation
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

