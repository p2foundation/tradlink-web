'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Search, Plus } from 'lucide-react'
import apiClient from '@/lib/api-client'
import { Farmer } from '@/types'
import Link from 'next/link'

export default function FarmersPage() {
  const [farmers, setFarmers] = useState<Farmer[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState({
    region: '',
    district: '',
    page: 1,
    limit: 20,
  })

  useEffect(() => {
    fetchFarmers()
  }, [filters])

  const fetchFarmers = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (filters.region) params.append('region', filters.region)
      if (filters.district) params.append('district', filters.district)
      params.append('page', filters.page.toString())
      params.append('limit', filters.limit.toString())

      const response = await apiClient.get(`/farmers?${params.toString()}`)
      setFarmers(response.data.data || [])
    } catch (error) {
      console.error('Failed to fetch farmers:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredFarmers = farmers.filter((farmer) => {
    if (!search) return true
    const searchLower = search.toLowerCase()
    return (
      farmer.businessName?.toLowerCase().includes(searchLower) ||
      farmer.location.toLowerCase().includes(searchLower) ||
      farmer.region.toLowerCase().includes(searchLower) ||
      farmer.district.toLowerCase().includes(searchLower) ||
      `${farmer.user?.firstName} ${farmer.user?.lastName}`.toLowerCase().includes(searchLower)
    )
  })

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Farmers</h1>
          <p className="text-gray-600 mt-1">Manage farmer profiles and listings</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Farmer
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search farmers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          className="px-4 py-2 border rounded-md"
          value={filters.region}
          onChange={(e) => setFilters({ ...filters, region: e.target.value, page: 1 })}
        >
          <option value="">All Regions</option>
          <option value="Ashanti">Ashanti</option>
          <option value="Greater Accra">Greater Accra</option>
          <option value="Western">Western</option>
        </select>
      </div>

      {/* Farmers Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredFarmers.map((farmer) => (
          <Link key={farmer.id} href={`/dashboard/farmers/${farmer.id}`}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-lg">
                      {farmer.businessName || `${farmer.user?.firstName} ${farmer.user?.lastName}`}
                    </h3>
                    <p className="text-sm text-gray-600">{farmer.location}</p>
                  </div>
                  {farmer.user?.verified && (
                    <Badge variant="success">Verified</Badge>
                  )}
                </div>
                <div className="space-y-2 text-sm">
                  <p>
                    <span className="font-medium">Region:</span> {farmer.region}
                  </p>
                  <p>
                    <span className="font-medium">District:</span> {farmer.district}
                  </p>
                  {farmer.farmSize && (
                    <p>
                      <span className="font-medium">Farm Size:</span> {farmer.farmSize} acres
                    </p>
                  )}
                  {farmer.certifications.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {farmer.certifications.slice(0, 2).map((cert, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {cert}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {filteredFarmers.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No farmers found. Try adjusting your search or filters.
        </div>
      )}
    </div>
  )
}

