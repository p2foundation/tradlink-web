'use client'

import { useEffect, useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Users,
  TrendingUp,
  DollarSign,
  Package,
  CheckCircle2,
  AlertCircle,
  Search,
  Plus,
  Eye,
  MapPin,
  Calendar,
  Star,
  BarChart3,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { useCurrency } from '@/contexts/currency-context'
import apiClient from '@/lib/api-client'
import { useToast } from '@/hooks/use-toast'
import { Skeleton } from '@/components/ui/skeleton'
import { FilterBar, FilterOption } from '@/components/ui/filter-bar'
import Link from 'next/link'

interface SupplierNetwork {
  id: string
  farmer: {
    id: string
    businessName?: string
    location: string
    district: string
    region: string
    certifications: string[]
    user: {
      id: string
      firstName: string
      lastName: string
      email: string
      phone?: string
      verified: boolean
    }
    listings: Array<{
      id: string
      cropType: string
      quantity: number
      pricePerUnit: number
      status: string
    }>
  }
  status: string
  relationshipType?: string
  totalDeals: number
  totalValue: number
  qualityScore?: number
  reliabilityScore?: number
  lastDealDate?: string
  addedAt: string
  metrics?: {
    totalDeals: number
    totalValue: number
    qualityScore?: number
    reliabilityScore?: number
    lastDealDate?: string
    activeListings: number
  }
}

export default function SupplierNetworkPage() {
  const { toast } = useToast()
  const { formatCurrency } = useCurrency()
  const [networks, setNetworks] = useState<SupplierNetwork[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [stats, setStats] = useState({
    totalSuppliers: 0,
    activeSuppliers: 0,
    totalDeals: 0,
    totalValue: 0,
  })
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  })

  useEffect(() => {
    fetchNetworks()
    fetchStats()
  }, [statusFilter, pagination.page])

  const fetchNetworks = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (statusFilter !== 'ALL') params.append('status', statusFilter)
      params.append('page', pagination.page.toString())
      params.append('limit', pagination.limit.toString())

      const response = await apiClient.get(`/supplier-networks?${params.toString()}`)
      setNetworks(response.data.data || [])
      
      if (response.data.meta) {
        setPagination({
          page: response.data.meta.page || pagination.page,
          limit: response.data.meta.limit || pagination.limit,
          total: response.data.meta.total || 0,
          totalPages: response.data.meta.totalPages || 0,
        })
      }
    } catch (error: any) {
      console.error('Failed to fetch supplier networks:', error)
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.response?.data?.message || 'Failed to load supplier network',
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await apiClient.get('/supplier-networks/stats')
      setStats(response.data || stats)
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    }
  }

  const filteredNetworks = useMemo(() => {
    const term = search.toLowerCase().trim()
    if (!term) return networks

    return networks.filter((network) => {
      const searchableText = [
        network.farmer.businessName,
        network.farmer.user.firstName,
        network.farmer.user.lastName,
        network.farmer.user.email,
        network.farmer.location,
        network.farmer.district,
        network.farmer.region,
      ].join(' ').toLowerCase()
      return searchableText.includes(term)
    })
  }, [networks, search])

  const statusOptions: FilterOption[] = [
    { label: 'All', value: 'ALL' },
    { label: 'Active', value: 'ACTIVE' },
    { label: 'Inactive', value: 'INACTIVE' },
    { label: 'Pending', value: 'PENDING' },
    { label: 'Suspended', value: 'SUSPENDED' },
  ]

  if (loading && networks.length === 0) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    )
  }

  return (
    <div className="space-y-6 text-slate-100">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Supplier Network</h1>
          <p className="text-gray-300 mt-1">
            Manage your connected farmers, track deals, and monitor performance
          </p>
        </div>
        <Link href="/dashboard/farmers">
          <Button className="shadow-glow">
            <Plus className="h-4 w-4 mr-2" />
            Add Supplier
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-slate-900 border-white/10 hover:shadow-glow transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Total Suppliers</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.totalSuppliers}</div>
            <p className="text-xs text-gray-400 mt-1">In your network</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-white/10 hover:shadow-glow transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Active Suppliers</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.activeSuppliers}</div>
            <p className="text-xs text-gray-400 mt-1">Currently active</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-white/10 hover:shadow-glow transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Total Deals</CardTitle>
            <Package className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.totalDeals}</div>
            <p className="text-xs text-gray-400 mt-1">All-time transactions</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-white/10 hover:shadow-glow transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Total Value</CardTitle>
            <DollarSign className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{formatCurrency(stats.totalValue)}</div>
            <p className="text-xs text-gray-400 mt-1">Cumulative value</p>
          </CardContent>
        </Card>
      </div>

      <FilterBar
        searchPlaceholder="Search suppliers by name, location, email..."
        searchValue={search}
        onSearchChange={setSearch}
        filters={[
          {
            id: 'status',
            label: 'Status',
            options: statusOptions,
            active: statusFilter,
            onChange: (val) => {
              setStatusFilter(val)
              setPagination((prev) => ({ ...prev, page: 1 }))
            },
          },
        ]}
        onClearAll={() => {
          setStatusFilter('ALL')
          setSearch('')
        }}
      />

      {/* Supplier Network List */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredNetworks.map((network) => {
          const metrics = network.metrics || {
            totalDeals: network.totalDeals,
            totalValue: network.totalValue,
            qualityScore: network.qualityScore,
            reliabilityScore: network.reliabilityScore,
            activeListings: network.farmer.listings.length,
          }

          return (
            <Card
              key={network.id}
              className="bg-slate-900 border-white/10 hover:shadow-glow transition-all"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-white text-lg">
                      {network.farmer.businessName ||
                        `${network.farmer.user.firstName} ${network.farmer.user.lastName}`}
                    </CardTitle>
                    <p className="text-sm text-gray-400 mt-1">
                      {network.farmer.user.firstName} {network.farmer.user.lastName}
                    </p>
                  </div>
                  <Badge
                    variant={
                      network.status === 'ACTIVE'
                        ? 'success'
                        : network.status === 'SUSPENDED'
                        ? 'destructive'
                        : 'warning'
                    }
                  >
                    {network.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Location */}
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span>
                    {network.farmer.district}, {network.farmer.region}
                  </span>
                </div>

                {/* Performance Metrics */}
                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/10">
                  <div>
                    <p className="text-xs text-gray-400">Total Deals</p>
                    <p className="text-lg font-semibold text-white">{metrics.totalDeals}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Total Value</p>
                    <p className="text-lg font-semibold text-emerald-400">
                      {formatCurrency(metrics.totalValue)}
                    </p>
                  </div>
                  {metrics.qualityScore && (
                    <div>
                      <p className="text-xs text-gray-400">Quality Score</p>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                        <p className="text-lg font-semibold text-white">
                          {metrics.qualityScore.toFixed(0)}%
                        </p>
                      </div>
                    </div>
                  )}
                  {metrics.reliabilityScore && (
                    <div>
                      <p className="text-xs text-gray-400">Reliability</p>
                      <p className="text-lg font-semibold text-white">
                        {metrics.reliabilityScore.toFixed(0)}%
                      </p>
                    </div>
                  )}
                </div>

                {/* Active Listings */}
                {metrics.activeListings > 0 && (
                  <div className="pt-2 border-t border-white/10">
                    <p className="text-xs text-gray-400 mb-2">Active Listings</p>
                    <div className="flex flex-wrap gap-1">
                      {network.farmer.listings.slice(0, 3).map((listing) => (
                        <Badge key={listing.id} variant="outline" className="text-xs">
                          {listing.cropType}
                        </Badge>
                      ))}
                      {metrics.activeListings > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{metrics.activeListings - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* Certifications */}
                {network.farmer.certifications.length > 0 && (
                  <div className="pt-2 border-t border-white/10">
                    <p className="text-xs text-gray-400 mb-1">Certifications</p>
                    <div className="flex flex-wrap gap-1">
                      {network.farmer.certifications.slice(0, 2).map((cert, idx) => (
                        <Badge key={idx} variant="success" className="text-xs">
                          {cert}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Last Deal */}
                {metrics.lastDealDate && (
                  <div className="flex items-center gap-2 text-xs text-gray-400 pt-2 border-t border-white/10">
                    <Calendar className="h-3 w-3" />
                    <span>Last deal: {formatDate(metrics.lastDealDate)}</span>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-2 border-t border-white/10">
                  <Link href={`/dashboard/supplier-network/${network.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </Link>
                  <Link href={`/dashboard/farmers/${network.farmer.id}`}>
                    <Button variant="outline" size="sm">
                      <BarChart3 className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredNetworks.length === 0 && !loading && (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-gray-500 mx-auto mb-4" />
          <p className="text-gray-400 mb-2">No suppliers in your network yet</p>
          <Link href="/dashboard/farmers">
            <Button variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Supplier
            </Button>
          </Link>
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <div className="text-sm text-gray-400">
            Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}{' '}
            suppliers
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

