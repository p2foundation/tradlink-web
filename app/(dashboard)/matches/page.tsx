'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Handshake, Sparkles } from 'lucide-react'
import apiClient from '@/lib/api-client'
import { Match, MatchStatus } from '@/types'
import { formatCurrency } from '@/lib/utils'

export default function MatchesPage() {
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [filter, setFilter] = useState<MatchStatus | 'ALL'>('ALL')

  useEffect(() => {
    fetchMatches()
  }, [filter])

  const fetchMatches = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (filter !== 'ALL') params.append('status', filter)

      const response = await apiClient.get(`/matches?${params.toString()}`)
      setMatches(response.data.data || [])
    } catch (error) {
      console.error('Failed to fetch matches:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSuggestMatches = async () => {
    try {
      setGenerating(true)
      // Fetch all buyers first
      const buyersResponse = await apiClient.get('/buyers?limit=100')
      const buyers = buyersResponse.data.data || []
      
      if (buyers.length === 0) {
        alert('No buyers found. Please add buyers first.')
        setGenerating(false)
        return
      }

      // Generate suggestions for all buyers
      let totalGenerated = 0
      for (const buyer of buyers) {
        try {
          const response = await apiClient.post(`/matches/suggest?buyerId=${buyer.id}&limit=10`)
          if (Array.isArray(response.data)) {
            totalGenerated += response.data.length
          }
        } catch (err) {
          console.error(`Failed to generate suggestions for buyer ${buyer.id}:`, err)
        }
      }

      // Refresh the matches list to show new suggestions
      await fetchMatches()
      
      alert(`Generated ${totalGenerated} AI match suggestions!`)
    } catch (error) {
      console.error('Failed to generate suggestions:', error)
      alert('Failed to generate suggestions. Please try again.')
    } finally {
      setGenerating(false)
    }
  }

  const updateMatchStatus = async (matchId: string, status: MatchStatus) => {
    try {
      await apiClient.patch(`/matches/${matchId}/status`, { status })
      fetchMatches()
    } catch (error) {
      console.error('Failed to update match status:', error)
    }
  }

  const getStatusColor = (status: MatchStatus) => {
    switch (status) {
      case MatchStatus.SUGGESTED:
        return 'default'
      case MatchStatus.CONTACTED:
        return 'secondary'
      case MatchStatus.NEGOTIATING:
        return 'warning'
      case MatchStatus.CONTRACT_SIGNED:
        return 'success'
      case MatchStatus.COMPLETED:
        return 'success'
      default:
        return 'outline'
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Buyer-Seller Matches</h1>
          <p className="text-gray-600 mt-1">AI-powered matching and deal pipeline</p>
        </div>
        <Button onClick={handleSuggestMatches} disabled={generating}>
          <Sparkles className="h-4 w-4 mr-2" />
          {generating ? 'Generating...' : 'Generate AI Suggestions'}
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <Button
          variant={filter === 'ALL' ? 'default' : 'outline'}
          onClick={() => setFilter('ALL')}
        >
          All
        </Button>
        <Button
          variant={filter === MatchStatus.SUGGESTED ? 'default' : 'outline'}
          onClick={() => setFilter(MatchStatus.SUGGESTED)}
        >
          Suggested
        </Button>
        <Button
          variant={filter === MatchStatus.CONTACTED ? 'default' : 'outline'}
          onClick={() => setFilter(MatchStatus.CONTACTED)}
        >
          Contacted
        </Button>
        <Button
          variant={filter === MatchStatus.NEGOTIATING ? 'default' : 'outline'}
          onClick={() => setFilter(MatchStatus.NEGOTIATING)}
        >
          Negotiating
        </Button>
        <Button
          variant={filter === MatchStatus.COMPLETED ? 'default' : 'outline'}
          onClick={() => setFilter(MatchStatus.COMPLETED)}
        >
          Completed
        </Button>
      </div>

      {/* Matches List */}
      <div className="space-y-4">
        {matches.map((match) => (
          <Card key={match.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-4">
                    <Handshake className="h-5 w-5 text-primary" />
                    <div>
                      <h3 className="font-semibold text-lg">
                        {match.farmer?.user?.firstName} {match.farmer?.user?.lastName} ↔{' '}
                        {match.buyer?.user?.firstName} {match.buyer?.user?.lastName}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {match.listing?.cropType} • {match.listing?.quantity}{' '}
                        {match.listing?.unit}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div>
                      <span className="font-medium">Compatibility:</span>{' '}
                      <span className="text-primary font-semibold">
                        {match.compatibilityScore.toFixed(1)}%
                      </span>
                    </div>
                    <div>
                      <span className="font-medium">Estimated Value:</span>{' '}
                      {formatCurrency(match.estimatedValue)}
                    </div>
                  </div>
                  {match.aiRecommendation && (
                    <div className="mt-3 p-3 bg-blue-50 rounded text-sm">
                      <p className="font-medium mb-1">AI Recommendation:</p>
                      <p className="text-gray-700">
                        {JSON.parse(match.aiRecommendation).reasons?.join(', ')}
                      </p>
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Badge variant={getStatusColor(match.status)}>{match.status}</Badge>
                  <div className="flex gap-2">
                    {match.status === MatchStatus.SUGGESTED && (
                      <Button
                        size="sm"
                        onClick={() => updateMatchStatus(match.id, MatchStatus.CONTACTED)}
                      >
                        Contact
                      </Button>
                    )}
                    {match.status === MatchStatus.CONTACTED && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateMatchStatus(match.id, MatchStatus.NEGOTIATING)}
                      >
                        Start Negotiation
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {matches.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No matches found. Generate AI suggestions to find potential deals.
        </div>
      )}
    </div>
  )
}

