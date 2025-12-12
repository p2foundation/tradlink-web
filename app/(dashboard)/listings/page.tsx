'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Search, Plus, Grid, List } from 'lucide-react'
import apiClient from '@/lib/api-client'
import { Listing, QualityGrade } from '@/types'
import { formatCurrency, formatDate } from '@/lib/utils'
import Link from 'next/link'

export default function ListingsPage() {
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [filters, setFilters] = useState({
    cropType: '',
    qualityGrade: '',
    status: 'ACTIVE',
  })

  useEffect(() => {
    fetchListings()
  }, [filters])

  const fetchListings = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (filters.cropType) params.append('cropType', filters.cropType)
      if (filters.qualityGrade) params.append('qualityGrade', filters.qualityGrade)
      params.append('status', filters.status)

      const response = await apiClient.get(`/listings?${params.toString()}`)
      setListings(response.data.data || [])
    } catch (error) {
      console.error('Failed to fetch listings:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredListings = listings.filter((listing) => {
    if (!search) return true
    const searchLower = search.toLowerCase()
    return (
      listing.cropType.toLowerCase().includes(searchLower) ||
      listing.cropVariety?.toLowerCase().includes(searchLower) ||
      listing.description?.toLowerCase().includes(searchLower)
    )
  })

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Product Listings</h1>
          <p className="text-gray-600 mt-1">Browse and manage product listings</p>
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
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Listing
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4 flex-wrap">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search listings..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          className="px-4 py-2 border rounded-md"
          value={filters.cropType}
          onChange={(e) => setFilters({ ...filters, cropType: e.target.value })}
        >
          <option value="">All Crops</option>
          <option value="Cocoa">Cocoa</option>
          <option value="Coffee">Coffee</option>
          <option value="Cashew">Cashew</option>
          <option value="Shea Nuts">Shea Nuts</option>
        </select>
        <select
          className="px-4 py-2 border rounded-md"
          value={filters.qualityGrade}
          onChange={(e) => setFilters({ ...filters, qualityGrade: e.target.value })}
        >
          <option value="">All Grades</option>
          <option value="PREMIUM">Premium</option>
          <option value="GRADE_A">Grade A</option>
          <option value="GRADE_B">Grade B</option>
          <option value="STANDARD">Standard</option>
        </select>
      </div>

      {/* Listings Display */}
      {viewMode === 'grid' ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredListings.map((listing) => (
            <Link key={listing.id} href={`/dashboard/listings/${listing.id}`}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-lg">{listing.cropType}</h3>
                      {listing.cropVariety && (
                        <p className="text-sm text-gray-600">{listing.cropVariety}</p>
                      )}
                    </div>
                    <Badge variant="outline">{listing.qualityGrade}</Badge>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p>
                      <span className="font-medium">Quantity:</span> {listing.quantity}{' '}
                      {listing.unit}
                    </p>
                    <p>
                      <span className="font-medium">Price:</span>{' '}
                      {formatCurrency(listing.pricePerUnit)}/{listing.unit}
                    </p>
                    <p>
                      <span className="font-medium">Available:</span>{' '}
                      {formatDate(listing.availableFrom)}
                    </p>
                    {listing.farmer && (
                      <p className="text-gray-600">
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
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4">
                        <h3 className="font-semibold text-lg">{listing.cropType}</h3>
                        <Badge variant="outline">{listing.qualityGrade}</Badge>
                        <span className="text-sm text-gray-600">
                          {listing.quantity} {listing.unit}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {formatCurrency(listing.pricePerUnit)}/{listing.unit} • Available from{' '}
                        {formatDate(listing.availableFrom)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
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

      {filteredListings.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No listings found. Try adjusting your search or filters.
        </div>
      )}
    </div>
  )
}

