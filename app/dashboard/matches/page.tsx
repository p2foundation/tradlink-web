'use client'

import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Sparkles, ChevronLeft, ChevronRight } from 'lucide-react'
import apiClient from '@/lib/api-client'
import { Match, MatchStatus, UserRole } from '@/types'
import { MatchCard } from '@/components/matches/match-card'
import { FilterBar, FilterOption } from '@/components/ui/filter-bar'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'

export default function MatchesPage() {
  const { toast } = useToast()
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [statusFilter, setStatusFilter] = useState<MatchStatus | 'ALL'>('ALL')
  const [search, setSearch] = useState('')
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  })

  useEffect(() => {
    // Load current user to determine role
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    } else {
      // Fallback: fetch from API
      apiClient.get('/auth/me').then(res => setUser(res.data)).catch(console.error)
    }
  }, [])

  useEffect(() => {
    // Reset to page 1 when filters change
    setPagination((prev) => ({ ...prev, page: 1 }))
  }, [statusFilter])

  useEffect(() => {
    fetchMatches()
  }, [statusFilter, pagination.page])

  const fetchMatches = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (statusFilter !== 'ALL') params.append('status', statusFilter)
      params.append('page', pagination.page.toString())
      params.append('limit', pagination.limit.toString())

      const response = await apiClient.get(`/matches?${params.toString()}`)
      setMatches(response.data.data || [])
      if (response.data.meta) {
        setPagination({
          page: response.data.meta.page || pagination.page,
          limit: response.data.meta.limit || pagination.limit,
          total: response.data.meta.total || 0,
          totalPages: response.data.meta.totalPages || 0,
        })
      }
    } catch (error) {
      console.error('Failed to fetch matches:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSuggestMatches = async () => {
    try {
      setGenerating(true)
      const userRole = user?.role

      // Role-specific match generation
      if (userRole === UserRole.FARMER || userRole === UserRole.TRADER || userRole === UserRole.EXPORT_COMPANY) {
        // For farmers/traders/export companies: find buyers for their listings
        // Fetch all buyers first
        const buyersResponse = await apiClient.get('/buyers?limit=100')
        const buyers = buyersResponse.data.data || []
        
        if (buyers.length === 0) {
          toast({
            variant: 'warning',
            title: 'No Buyers Found',
            description: 'No buyers available for matching. Please try again later.',
          })
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
        
        if (totalGenerated > 0) {
          toast({
            variant: 'success',
            title: 'AI Suggestions Generated',
            description: `Generated ${totalGenerated} new match suggestions with buyers`,
          })
        } else {
          toast({
            variant: 'warning',
            title: 'No New Matches',
            description: 'No new matches were generated. Try again later.',
          })
        }
      } else if (userRole === UserRole.BUYER) {
        // For buyers: find suppliers/farmers for their requirements
        // This would need a different endpoint or logic
        toast({
          variant: 'info',
          title: 'Feature Coming Soon',
          description: 'Buyer match suggestions will be available soon.',
        })
      } else {
        toast({
          variant: 'warning',
          title: 'Not Available',
          description: 'Match suggestions are only available for farmers, traders, and buyers.',
        })
      }
    } catch (error) {
      console.error('Failed to generate suggestions:', error)
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to generate AI suggestions. Please try again.',
      })
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

  const filteredMatches = useMemo(() => {
    const term = search.toLowerCase()
    return matches.filter((m) => {
      const text = `${m.farmer?.user?.firstName ?? ''} ${m.farmer?.user?.lastName ?? ''} ${m.buyer?.user?.firstName ?? ''} ${m.buyer?.user?.lastName ?? ''} ${m.listing?.cropType ?? ''}`.toLowerCase()
      return term ? text.includes(term) : true
    })
  }, [matches, search])

  const statusOptions: FilterOption[] = [
    { label: 'Suggested', value: MatchStatus.SUGGESTED },
    { label: 'Contacted', value: MatchStatus.CONTACTED },
    { label: 'Negotiating', value: MatchStatus.NEGOTIATING },
    { label: 'Signed', value: MatchStatus.CONTRACT_SIGNED },
    { label: 'Completed', value: MatchStatus.COMPLETED },
  ]

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-64" />
        <div className="space-y-3">
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-5/6" />
          <Skeleton className="h-6 w-2/3" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Buyer-Seller Matches</h1>
          <p className="text-muted-foreground mt-1">AI-powered matching and deal pipeline</p>
        </div>
        <Button 
          onClick={handleSuggestMatches} 
          className="shadow-glow"
          disabled={generating || loading}
        >
          <Sparkles className="h-4 w-4 mr-2" />
          {generating ? 'Generating...' : 'Generate AI Suggestions'}
        </Button>
      </div>

      <FilterBar
        searchPlaceholder="Search matches..."
        searchValue={search}
        onSearchChange={setSearch}
        filters={[
          {
            id: 'status',
            label: 'Status',
            options: statusOptions,
            active: statusFilter === 'ALL' ? null : statusFilter,
            onChange: (val) => setStatusFilter((val as MatchStatus) ?? 'ALL'),
          },
        ]}
        onClearAll={() => setStatusFilter('ALL')}
      />

      <div className="space-y-4">
        {filteredMatches.map((match) => {
          let reasons: string[] = []
          try {
            const parsed = match.aiRecommendation ? JSON.parse(match.aiRecommendation) : null
            reasons = parsed?.reasons || []
          } catch {
            reasons = []
          }

          // Determine display names based on user role
          const userRole = user?.role
          let farmerName = `${match.farmer?.user?.firstName ?? ''} ${match.farmer?.user?.lastName ?? ''}`.trim() || match.farmer?.businessName || 'Farmer'
          let buyerName = `${match.buyer?.user?.firstName ?? ''} ${match.buyer?.user?.lastName ?? ''}`.trim() || match.buyer?.companyName || 'Buyer'

          // For farmers/traders: show buyer info prominently
          // For buyers: show farmer/supplier info prominently
          if (userRole === UserRole.BUYER) {
            // Buyer sees: Supplier/Farmer ↔ Buyer (themselves)
            // Show supplier name first
            const temp = farmerName
            farmerName = buyerName
            buyerName = temp
          }

          return (
            <MatchCard
              key={match.id}
              id={match.id}
              farmerName={farmerName}
              buyerName={buyerName}
              crop={match.listing?.cropType ?? '—'}
              quantity={
                match.listing
                  ? `${match.listing.quantity} ${match.listing.unit ?? ''}`
                  : '—'
              }
              compatibilityScore={match.compatibilityScore}
              estimatedValue={match.estimatedValue}
              status={match.status}
              reasons={reasons}
              listing={match.listing ? {
                id: match.listing.id,
                pricePerUnit: match.listing.pricePerUnit,
                quantity: match.listing.quantity,
                unit: match.listing.unit,
              } : null}
              onUpdateStatus={(id, status) => updateMatchStatus(id, status)}
              userRole={userRole}
            />
          )
        })}
      </div>

      {filteredMatches.length === 0 && !loading && (
        <div className="text-center py-12 text-muted-foreground">
          {user?.role === UserRole.BUYER 
            ? 'No supplier matches found. Generate AI suggestions to discover verified farmers and suppliers.'
            : user?.role === UserRole.FARMER || user?.role === UserRole.TRADER || user?.role === UserRole.EXPORT_COMPANY
            ? 'No buyer matches found. Generate AI suggestions to find potential international buyers.'
            : 'No matches found. Generate AI suggestions to find potential deals.'
          }
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="text-sm text-gray-400">
            Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} matches
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
              disabled={pagination.page === 1 || loading}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                let pageNum: number
                if (pagination.totalPages <= 5) {
                  pageNum = i + 1
                } else if (pagination.page <= 3) {
                  pageNum = i + 1
                } else if (pagination.page >= pagination.totalPages - 2) {
                  pageNum = pagination.totalPages - 4 + i
                } else {
                  pageNum = pagination.page - 2 + i
                }
                return (
                  <Button
                    key={pageNum}
                    variant={pagination.page === pageNum ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setPagination({ ...pagination, page: pageNum })}
                    disabled={loading}
                    className="min-w-[40px]"
                  >
                    {pageNum}
                  </Button>
                )
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
              disabled={pagination.page === pagination.totalPages || loading}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

