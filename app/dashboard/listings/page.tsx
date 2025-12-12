'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, Grid, List, ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react'
import apiClient from '@/lib/api-client'
import { Listing } from '@/types'
import { formatDate } from '@/lib/utils'
import { useCurrency } from '@/contexts/currency-context'
import Link from 'next/link'
import { FilterBar, FilterOption } from '@/components/ui/filter-bar'
import { Skeleton } from '@/components/ui/skeleton'
import { getCommodityImage } from '@/lib/commodity-images'

export default function ListingsPage() {
  const router = useRouter()
  const { formatCurrency } = useCurrency()
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [cropFilter, setCropFilter] = useState<string | null>(null)
  const [gradeFilter, setGradeFilter] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string | null>('ACTIVE')
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  })

  useEffect(() => {
    // Reset to page 1 when filters or search change
    setPagination((prev) => ({ ...prev, page: 1 }))
  }, [cropFilter, gradeFilter, statusFilter, search])

  useEffect(() => {
    fetchListings()
  }, [cropFilter, gradeFilter, statusFilter, pagination.page])

  const fetchListings = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (cropFilter) params.append('cropType', cropFilter)
      if (gradeFilter) params.append('qualityGrade', gradeFilter)
      if (statusFilter) params.append('status', statusFilter)
      params.append('page', pagination.page.toString())
      params.append('limit', pagination.limit.toString())

      const response = await apiClient.get(`/listings?${params.toString()}`)
      setListings(response.data.data || [])
      if (response.data.meta) {
        setPagination({
          page: response.data.meta.page || pagination.page,
          limit: response.data.meta.limit || pagination.limit,
          total: response.data.meta.total || 0,
          totalPages: response.data.meta.totalPages || 0,
        })
      }
    } catch (error) {
      console.error('Failed to fetch listings:', error)
    } finally {
      setLoading(false)
    }
  }

  const cropOptions: FilterOption[] = [
    { label: 'Cocoa', value: 'Cocoa' },
    { label: 'Coffee', value: 'Coffee' },
    { label: 'Cashew', value: 'Cashew' },
    { label: 'Shea Nuts', value: 'Shea Nuts' },
  ]

  const gradeOptions: FilterOption[] = [
    { label: 'Premium', value: 'PREMIUM' },
    { label: 'Grade A', value: 'GRADE_A' },
    { label: 'Grade B', value: 'GRADE_B' },
    { label: 'Standard', value: 'STANDARD' },
  ]

  const statusOptions: FilterOption[] = [
    { label: 'Active', value: 'ACTIVE' },
    { label: 'Pending', value: 'PENDING' },
    { label: 'Sold', value: 'SOLD' },
    { label: 'Expired', value: 'EXPIRED' },
  ]

  const filteredListings = useMemo(() => {
    const term = search.toLowerCase().trim()
    if (!term) return listings
    
    return listings.filter((listing) => {
      // Search in multiple fields for better results
      const searchableText = [
        listing.cropType,
        listing.cropVariety,
        listing.description,
        listing.qualityGrade,
        listing.farmer?.region,
        listing.farmer?.district,
        listing.farmer?.businessName,
        listing.farmer?.user?.firstName,
        listing.farmer?.user?.lastName,
        listing.unit,
        listing.certifications?.join(' '),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      
      return searchableText.includes(term)
    })
  }, [listings, search])

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
          <h1 className="text-3xl font-bold text-white">Product Listings</h1>
          <p className="text-gray-300 mt-1">Browse and manage product listings</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setViewMode('grid')}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button onClick={() => router.push('/dashboard/listings/new')}>
            <Plus className="h-4 w-4 mr-2" />
            Add Listing
          </Button>
        </div>
      </div>

      <FilterBar
        searchPlaceholder="Search by crop, variety, location, farmer name..."
        searchValue={search}
        onSearchChange={setSearch}
        filters={[
          {
            id: 'crop',
            label: 'Crop',
            options: cropOptions,
            active: cropFilter,
            onChange: (val) => setCropFilter(val),
          },
          {
            id: 'grade',
            label: 'Grade',
            options: gradeOptions,
            active: gradeFilter,
            onChange: (val) => setGradeFilter(val),
          },
          {
            id: 'status',
            label: 'Status',
            options: statusOptions,
            active: statusFilter,
            onChange: (val) => setStatusFilter(val),
          },
        ]}
        onClearAll={() => {
          setCropFilter(null)
          setGradeFilter(null)
          setStatusFilter('ACTIVE')
        }}
      />

      {/* Listings Display */}
      {viewMode === 'grid' ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredListings.map((listing) => (
            <Link key={listing.id} href={`/dashboard/listings/${listing.id}`}>
              <Card className="hover:shadow-glow transition-all cursor-pointer border border-white/10 bg-slate-900 overflow-hidden group">
                {/* Product Image */}
                <div className="relative h-48 w-full overflow-hidden bg-slate-800">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={listing.images && listing.images.length > 0 ? listing.images[0] : getCommodityImage(listing.cropType)}
                    alt={listing.cropType || 'Commodity'}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
                  {(!listing.images || listing.images.length === 0) && (
                    <div className="absolute top-2 right-2">
                      <Badge variant="outline" className="bg-slate-900/80 border-white/20 text-xs">
                        Default Image
                      </Badge>
                    </div>
                  )}
                </div>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-lg text-white">{listing.cropType}</h3>
                      {listing.cropVariety && (
                        <p className="text-sm text-gray-400">{listing.cropVariety}</p>
                      )}
                    </div>
                    <Badge variant="outline" className="border-white/20 text-slate-200">
                      {listing.qualityGrade}
                    </Badge>
                  </div>
                  <div className="space-y-2 text-sm text-slate-200">
                    <p>
                      <span className="font-medium text-white">Quantity:</span> {listing.quantity.toLocaleString()}{' '}
                      {listing.unit}
                    </p>
                    <p>
                      <span className="font-medium text-white">Price:</span>{' '}
                      <span className="text-emerald-400 font-semibold">
                        {formatCurrency(listing.pricePerUnit)}/{listing.unit}
                      </span>
                    </p>
                    <p>
                      <span className="font-medium text-white">Available:</span>{' '}
                      {formatDate(listing.availableFrom)}
                    </p>
                    {listing.farmer && (
                      <p className="text-gray-400">
                        {listing.farmer.region}, {listing.farmer.district}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredListings.map((listing) => (
            <Link key={listing.id} href={`/dashboard/listings/${listing.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer border border-white/10 bg-slate-900">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    {/* Thumbnail Image */}
                    <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-slate-800">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={listing.images && listing.images.length > 0 ? listing.images[0] : getCommodityImage(listing.cropType)}
                        alt={listing.cropType || 'Commodity'}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-4">
                        <h3 className="font-semibold text-lg text-white">{listing.cropType}</h3>
                        <Badge variant="outline" className="border-white/20 text-slate-200">{listing.qualityGrade}</Badge>
                        <span className="text-sm text-gray-400">
                          {listing.quantity} {listing.unit}
                        </span>
                      </div>
                      <p className="text-sm text-gray-400 mt-1">
                        {formatCurrency(listing.pricePerUnit)}/{listing.unit} • Available from{' '}
                        {formatDate(listing.availableFrom)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-white">
                        {formatCurrency(listing.quantity * listing.pricePerUnit)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {filteredListings.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-gray-400 text-lg mb-2">No listings found</p>
          <p className="text-gray-500 text-sm">
            {search ? `No listings match "${search}"` : 'Try adjusting your filters or create a new listing'}
          </p>
          {search && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSearch('')}
              className="mt-4 bg-slate-800 border-slate-700 text-slate-100"
            >
              Clear Search
            </Button>
          )}
        </div>
      )}

      {/* Pagination */}
      {pagination.total > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-800">
          <div className="text-sm text-gray-400">
            Showing <span className="font-medium text-white">{(pagination.page - 1) * pagination.limit + 1}</span> to{' '}
            <span className="font-medium text-white">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of{' '}
            <span className="font-medium text-white">{pagination.total}</span> listings
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
              disabled={pagination.page === 1 || loading}
              className="bg-slate-800 border-slate-700 text-slate-100 hover:bg-slate-700"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            {pagination.totalPages > 1 && (
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
                      className="min-w-[40px] bg-slate-800 border-slate-700 text-slate-100 hover:bg-slate-700 data-[state=active]:bg-emerald-600"
                    >
                      {pageNum}
                    </Button>
                  )
                })}
              </div>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
              disabled={pagination.page === pagination.totalPages || loading}
              className="bg-slate-800 border-slate-700 text-slate-100 hover:bg-slate-700"
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

