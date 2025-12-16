'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { MessageSquareText, ArrowRight, Clock, CheckCircle2, XCircle, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react'
import apiClient from '@/lib/api-client'
import { formatDate } from '@/lib/utils'
import { useCurrency } from '@/contexts/currency-context'
import { useToast } from '@/hooks/use-toast'
import Link from 'next/link'

type NegotiationStatus = 'ACTIVE' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED' | 'CANCELLED'

interface Negotiation {
  id: string
  matchId: string
  status: NegotiationStatus
  initialPrice: number
  currentPrice: number
  quantity: number
  currency: string
  match?: {
    id: string
    listing?: {
      cropType: string
      cropVariety?: string
    }
    farmer?: {
      user?: {
        firstName: string
        lastName: string
      }
    }
    buyer?: {
      user?: {
        firstName: string
        lastName: string
      }
    }
  }
  createdAt: string
  updatedAt: string
}

export default function NegotiationsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { formatCurrency } = useCurrency()
  const [negotiations, setNegotiations] = useState<Negotiation[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  })

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    fetchNegotiations()
  }, [pagination.page])

  const fetchNegotiations = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      params.append('page', pagination.page.toString())
      params.append('limit', pagination.limit.toString())
      
      const response = await apiClient.get(`/negotiations?${params.toString()}`)
      setNegotiations(response.data.data || response.data || [])
      if (response.data.meta) {
        setPagination({
          page: response.data.meta.page || pagination.page,
          limit: response.data.meta.limit || pagination.limit,
          total: response.data.meta.total || 0,
          totalPages: response.data.meta.totalPages || 0,
        })
      }
    } catch (error: any) {
      console.error('Failed to fetch negotiations:', error)
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.response?.data?.message || 'Failed to load negotiations',
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: NegotiationStatus) => {
    const variants: Record<NegotiationStatus, { label: string; variant: 'default' | 'success' | 'destructive' | 'warning' | 'outline' }> = {
      ACTIVE: { label: 'Active', variant: 'default' },
      ACCEPTED: { label: 'Accepted', variant: 'success' },
      REJECTED: { label: 'Rejected', variant: 'destructive' },
      EXPIRED: { label: 'Expired', variant: 'warning' },
      CANCELLED: { label: 'Cancelled', variant: 'outline' },
    }
    const config = variants[status] || variants.ACTIVE
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const getStatusIcon = (status: NegotiationStatus) => {
    switch (status) {
      case 'ACTIVE':
        return <Clock className="h-4 w-4 text-blue-500" />
      case 'ACCEPTED':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case 'REJECTED':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'EXPIRED':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      default:
        return <MessageSquareText className="h-4 w-4 text-gray-500" />
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-5/6" />
      </div>
    )
  }

  return (
    <div className="space-y-6 text-slate-100">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Negotiations</h1>
          <p className="text-gray-300 mt-1">Manage your active negotiations and offers</p>
        </div>
      </div>

      {negotiations.length === 0 ? (
        <Card className="bg-slate-900 border-white/10">
          <CardContent className="p-12 text-center">
            <MessageSquareText className="h-16 w-16 mx-auto text-gray-500 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Negotiations Yet</h3>
            <p className="text-gray-400 mb-6">
              Start a negotiation by placing an order from a listing or accepting a buyer match.
            </p>
            <div className="flex gap-3 justify-center">
              <Link href="/dashboard/listings">
                <Button variant="outline">Browse Listings</Button>
              </Link>
              <Link href="/dashboard/matches">
                <Button>View Matches</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {negotiations.map((negotiation) => (
            <Card
              key={negotiation.id}
              className="bg-slate-900 border-white/10 hover:shadow-glow transition-all cursor-pointer"
              onClick={() => router.push(`/dashboard/negotiations/${negotiation.matchId}`)}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        {getStatusIcon(negotiation.status)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg text-white">
                          {negotiation.match?.listing?.cropType || 'Product'}
                          {negotiation.match?.listing?.cropVariety && ` - ${negotiation.match.listing.cropVariety}`}
                        </h3>
                        <p className="text-sm text-gray-400">
                          {negotiation.match?.farmer?.user
                            ? `${negotiation.match.farmer.user.firstName} ${negotiation.match.farmer.user.lastName}`
                            : 'Farmer'}{' '}
                          ↔{' '}
                          {negotiation.match?.buyer?.user
                            ? `${negotiation.match.buyer.user.firstName} ${negotiation.match.buyer.user.lastName}`
                            : 'Buyer'}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-400">Current Price</p>
                        <p className="font-semibold text-white">
                          {formatCurrency(negotiation.currentPrice)}/{negotiation.currency}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400">Quantity</p>
                        <p className="font-semibold text-white">
                          {negotiation.quantity.toLocaleString()} units
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400">Total Value</p>
                        <p className="font-semibold text-emerald-400">
                          {formatCurrency(negotiation.currentPrice * negotiation.quantity)}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400">Last Updated</p>
                        <p className="font-semibold text-white">{formatDate(negotiation.updatedAt)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-3 ml-4">
                    {getStatusBadge(negotiation.status)}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        router.push(`/dashboard/negotiations/${negotiation.matchId}`)
                      }}
                      className="bg-slate-800 border-slate-700 text-slate-100 hover:bg-slate-700"
                    >
                      View Details
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <div className="text-sm text-gray-400">
            Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} negotiations
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

