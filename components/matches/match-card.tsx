'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Handshake, Sparkles } from 'lucide-react'
import { useCurrency } from '@/contexts/currency-context'
import { MatchStatus, UserRole } from '@/types'
import apiClient from '@/lib/api-client'
import { useToast } from '@/hooks/use-toast'

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
  listing?: {
    id: string
    pricePerUnit: number
    quantity: number
    unit?: string
  } | null
  onUpdateStatus?: (id: string, status: MatchStatus) => void
  userRole?: UserRole
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
  listing,
  onUpdateStatus,
  userRole,
}: MatchCardProps) {
  const router = useRouter()
  const { formatCurrency } = useCurrency()
  const { toast } = useToast()
  const [contacting, setContacting] = useState(false)
  const [startingNegotiation, setStartingNegotiation] = useState(false)

  const handleContact = async () => {
    if (!listing) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Listing information is missing. Cannot contact farmer.',
      })
      return
    }

    try {
      setContacting(true)
      
      // Get current user
      const userStr = localStorage.getItem('user')
      if (!userStr) {
        toast({
          variant: 'destructive',
          title: 'Authentication Required',
          description: 'Please log in to contact the farmer.',
        })
        return
      }
      const user = JSON.parse(userStr)

      // Update match status to CONTACTED
      if (onUpdateStatus) {
        onUpdateStatus(id, MatchStatus.CONTACTED)
      }

      // Create negotiation to enable communication
      try {
        await apiClient.post('/negotiations', {
          matchId: id,
          initialPrice: listing.pricePerUnit,
          currentPrice: listing.pricePerUnit,
          quantity: listing.quantity,
          currency: 'USD',
          initiatedBy: String(user.id),
        })

        toast({
          variant: 'success',
          title: 'Farmer Contacted',
          description: 'Negotiation created. Redirecting to negotiation page...',
        })

        // Redirect to negotiation page after a short delay
        setTimeout(() => {
          router.push(`/dashboard/negotiations/${id}`)
        }, 1000)
      } catch (negotiationError: any) {
        // If negotiation already exists, that's fine - just redirect
        const errorMessage = negotiationError.response?.data?.message || ''
        if (errorMessage.includes('already exists') || errorMessage.includes('Active negotiation')) {
          toast({
            variant: 'success',
            title: 'Farmer Contacted',
            description: 'Redirecting to existing negotiation...',
          })
          setTimeout(() => {
            router.push(`/dashboard/negotiations/${id}`)
          }, 1000)
        } else {
          throw negotiationError
        }
      }
    } catch (error: any) {
      console.error('Failed to contact farmer:', error)
      toast({
        variant: 'destructive',
        title: 'Contact Failed',
        description: error.response?.data?.message || 'Failed to contact farmer. Please try again.',
      })
      // Revert status update on error
      if (onUpdateStatus) {
        onUpdateStatus(id, MatchStatus.SUGGESTED)
      }
    } finally {
      setContacting(false)
    }
  }

  const handleStartNegotiation = async () => {
    if (!listing) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Listing information is missing. Cannot start negotiation.',
      })
      return
    }

    try {
      setStartingNegotiation(true)
      
      // Get current user
      const userStr = localStorage.getItem('user')
      if (!userStr) {
        toast({
          variant: 'destructive',
          title: 'Authentication Required',
          description: 'Please log in to start negotiation.',
        })
        return
      }
      const user = JSON.parse(userStr)

      // Update match status to NEGOTIATING
      if (onUpdateStatus) {
        onUpdateStatus(id, MatchStatus.NEGOTIATING)
      }

      // Create or get negotiation
      try {
        await apiClient.post('/negotiations', {
          matchId: id,
          initialPrice: listing.pricePerUnit,
          currentPrice: listing.pricePerUnit,
          quantity: listing.quantity,
          currency: 'USD',
          initiatedBy: String(user.id),
        })
      } catch (negotiationError: any) {
        // If negotiation already exists, that's fine
        const errorMessage = negotiationError.response?.data?.message || ''
        if (!errorMessage.includes('already exists') && !errorMessage.includes('Active negotiation')) {
          throw negotiationError
        }
      }

      router.push(`/dashboard/negotiations/${id}`)
    } catch (error: any) {
      console.error('Failed to start negotiation:', error)
      toast({
        variant: 'destructive',
        title: 'Negotiation Failed',
        description: error.response?.data?.message || 'Failed to start negotiation. Please try again.',
      })
      // Revert status update on error
      if (onUpdateStatus) {
        onUpdateStatus(id, MatchStatus.CONTACTED)
      }
    } finally {
      setStartingNegotiation(false)
    }
  }

  return (
    <Card className="hover:shadow-glow transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <Handshake className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-foreground">
                  {userRole === UserRole.BUYER 
                    ? `${farmerName} ↔ You`
                    : userRole === UserRole.FARMER || userRole === UserRole.TRADER || userRole === UserRole.EXPORT_COMPANY
                    ? `You ↔ ${buyerName}`
                    : `${farmerName} ↔ ${buyerName}`
                  }
                </h3>
                <p className="text-sm text-muted-foreground">
                  {crop} • {quantity}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm text-foreground">
              <div>
                <span className="font-medium">Compatibility:</span>{' '}
                <span className="text-primary font-semibold">{compatibilityScore.toFixed(1)}%</span>
              </div>
              <div>
                <span className="font-medium">Estimated Value:</span> {formatCurrency(estimatedValue)}
              </div>
            </div>
            {reasons.length > 0 && (
              <div className="mt-3 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg text-sm">
                <p className="font-medium mb-1 flex items-center gap-2 text-blue-500">
                  <Sparkles className="h-4 w-4 text-blue-500" />
                  AI Reasons
                </p>
                <p className="text-foreground line-clamp-2">{reasons.join(', ')}</p>
              </div>
            )}
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge variant={statusVariant[status]}>{status}</Badge>
            {status === MatchStatus.SUGGESTED && onUpdateStatus && (
              <Button 
                size="sm" 
                onClick={handleContact}
                disabled={contacting || !listing}
              >
                {contacting ? 'Contacting...' : 'Contact'}
              </Button>
            )}
            {status === MatchStatus.CONTACTED && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleStartNegotiation}
                disabled={startingNegotiation || !listing}
              >
                {startingNegotiation ? 'Starting...' : 'Start Negotiation'}
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

