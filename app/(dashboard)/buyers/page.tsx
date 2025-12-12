'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Search } from 'lucide-react'
import apiClient from '@/lib/api-client'
import { Buyer } from '@/types'
import Link from 'next/link'

export default function BuyersPage() {
  const [buyers, setBuyers] = useState<Buyer[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState({
    country: '',
    industry: '',
    page: 1,
    limit: 20,
  })

  useEffect(() => {
    fetchBuyers()
  }, [filters])

  const fetchBuyers = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (filters.country) params.append('country', filters.country)
      if (filters.industry) params.append('industry', filters.industry)
      params.append('page', filters.page.toString())
      params.append('limit', filters.limit.toString())

      const response = await apiClient.get(`/buyers?${params.toString()}`)
      setBuyers(response.data.data || [])
    } catch (error) {
      console.error('Failed to fetch buyers:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredBuyers = buyers.filter((buyer) => {
    if (!search) return true
    const searchLower = search.toLowerCase()
    return (
      buyer.companyName.toLowerCase().includes(searchLower) ||
      buyer.country.toLowerCase().includes(searchLower) ||
      buyer.industry.toLowerCase().includes(searchLower) ||
      buyer.seekingCrops.some((crop) => crop.toLowerCase().includes(searchLower))
    )
  })

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Buyers</h1>
        <p className="text-gray-600 mt-1">International buyers and export companies</p>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search buyers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          className="px-4 py-2 border rounded-md"
          value={filters.country}
          onChange={(e) => setFilters({ ...filters, country: e.target.value, page: 1 })}
        >
          <option value="">All Countries</option>
          <option value="Switzerland">Switzerland</option>
          <option value="United Kingdom">United Kingdom</option>
          <option value="Netherlands">Netherlands</option>
          <option value="USA">USA</option>
          <option value="UAE">UAE</option>
        </select>
      </div>

      {/* Buyers Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredBuyers.map((buyer) => (
          <Link key={buyer.id} href={`/dashboard/buyers/${buyer.id}`}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-lg">{buyer.companyName}</h3>
                    <p className="text-sm text-gray-600">{buyer.country}</p>
                  </div>
                  {buyer.user?.verified && <Badge variant="success">Verified</Badge>}
                </div>
                <div className="space-y-2 text-sm">
                  <p>
                    <span className="font-medium">Industry:</span> {buyer.industry}
                  </p>
                  {buyer.volumeRequired && (
                    <p>
                      <span className="font-medium">Volume:</span> {buyer.volumeRequired}
                    </p>
                  )}
                  <div>
                    <span className="font-medium">Seeking:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {buyer.seekingCrops.map((crop, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {crop}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  {buyer.qualityStandards.length > 0 && (
                    <div>
                      <span className="font-medium">Quality Standards:</span>
                      <p className="text-gray-600 text-xs mt-1">
                        {buyer.qualityStandards.join(', ')}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {filteredBuyers.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No buyers found. Try adjusting your search or filters.
        </div>
      )}
    </div>
  )
}

