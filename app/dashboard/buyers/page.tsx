'use client'

import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import apiClient from '@/lib/api-client'
import { Buyer } from '@/types'
import Link from 'next/link'
import { FilterBar, FilterOption } from '@/components/ui/filter-bar'
import { Skeleton } from '@/components/ui/skeleton'

export default function BuyersPage() {
  const [buyers, setBuyers] = useState<Buyer[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [countryFilter, setCountryFilter] = useState<string | null>(null)
  const [industryFilter, setIndustryFilter] = useState<string | null>(null)

  useEffect(() => {
    fetchBuyers()
  }, [countryFilter, industryFilter])

  const fetchBuyers = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (countryFilter) params.append('country', countryFilter)
      if (industryFilter) params.append('industry', industryFilter)
      params.append('page', '1')
      params.append('limit', '20')

      const response = await apiClient.get(`/buyers?${params.toString()}`)
      setBuyers(response.data.data || [])
    } catch (error) {
      console.error('Failed to fetch buyers:', error)
    } finally {
      setLoading(false)
    }
  }

  const countryOptions: FilterOption[] = [
    { label: 'Switzerland', value: 'Switzerland' },
    { label: 'United Kingdom', value: 'United Kingdom' },
    { label: 'Netherlands', value: 'Netherlands' },
    { label: 'USA', value: 'USA' },
    { label: 'UAE', value: 'UAE' },
  ]

  const industryOptions: FilterOption[] = [
    { label: 'Chocolate Manufacturing', value: 'Chocolate Manufacturing' },
    { label: 'Coffee Roasting', value: 'Coffee Roasting' },
    { label: 'Food Processing', value: 'Food Processing' },
    { label: 'Retail', value: 'Retail' },
    { label: 'Export', value: 'Export' },
  ]

  const filteredBuyers = useMemo(() => {
    const term = search.toLowerCase()
    return buyers.filter((buyer) => {
      const text = `${buyer.companyName} ${buyer.country} ${buyer.industry} ${buyer.seekingCrops.join(' ')}`.toLowerCase()
      return term ? text.includes(term) : true
    })
  }, [buyers, search])

  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-5/6" />
      </div>
    )
  }

  return (
    <div className="space-y-6 text-slate-100">
      <div>
        <h1 className="text-3xl font-bold">Buyers</h1>
        <p className="text-gray-300 mt-1">International buyers and export companies</p>
      </div>

      <FilterBar
        searchPlaceholder="Search buyers..."
        searchValue={search}
        onSearchChange={setSearch}
        filters={[
          {
            id: 'country',
            label: 'Country',
            options: countryOptions,
            active: countryFilter,
            onChange: (val) => setCountryFilter(val),
          },
          {
            id: 'industry',
            label: 'Industry',
            options: industryOptions,
            active: industryFilter,
            onChange: (val) => setIndustryFilter(val),
          },
        ]}
        onClearAll={() => {
          setCountryFilter(null)
          setIndustryFilter(null)
        }}
      />

      {/* Buyers Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredBuyers.map((buyer) => (
          <Link key={buyer.id} href={`/dashboard/buyers/${buyer.id}`}>
            <Card className="hover:shadow-glow transition-shadow cursor-pointer bg-slate-900 border-white/10">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-lg text-white">{buyer.companyName}</h3>
                    <p className="text-sm text-gray-300">{buyer.country}</p>
                  </div>
                  {buyer.user?.verified && <Badge variant="success">Verified</Badge>}
                </div>
                <div className="space-y-2 text-sm text-gray-200">
                  <p>
                    <span className="font-medium text-white">Industry:</span> {buyer.industry}
                  </p>
                  {buyer.volumeRequired && (
                    <p>
                      <span className="font-medium text-white">Volume:</span> {buyer.volumeRequired}
                    </p>
                  )}
                  <div>
                    <span className="font-medium text-white">Seeking:</span>
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
                      <span className="font-medium text-white">Quality Standards:</span>
                      <p className="text-gray-300 text-xs mt-1">
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
        <div className="text-center py-12 text-gray-400">
          No buyers found. Try adjusting your search or filters.
        </div>
      )}
    </div>
  )
}

