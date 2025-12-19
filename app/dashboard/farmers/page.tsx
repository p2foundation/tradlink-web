'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { ChevronLeft, ChevronRight, MapPin, ShieldCheck, Package, Users, Search, Filter, UserPlus } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import apiClient from '@/lib/api-client'
import { Farmer, UserRole } from '@/types'
import Link from 'next/link'
import { FilterBar, FilterOption } from '@/components/ui/filter-bar'
import { Skeleton } from '@/components/ui/skeleton'
import { AddSupplierDialog } from '@/components/suppliers/add-supplier-dialog'

export default function FarmersPage() {
  const { toast } = useToast()
  const [farmers, setFarmers] = useState<Farmer[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [regionFilter, setRegionFilter] = useState<string | null>(null)
  const [verifiedFilter, setVerifiedFilter] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)
  const [selectedFarmer, setSelectedFarmer] = useState<Farmer | null>(null)
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [existingSupplierIds, setExistingSupplierIds] = useState<Set<string>>(new Set())
  const [stats, setStats] = useState({
    total: 0,
    verified: 0,
    withListings: 0,
  })
  const [statsLoading, setStatsLoading] = useState(true)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
  })

  useEffect(() => {
    // Load current user to check role
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      const userData = JSON.parse(storedUser)
      setUser(userData)
      
      // If export company, fetch existing suppliers to show which farmers are already added
      if (userData.role === UserRole.EXPORT_COMPANY) {
        fetchExistingSuppliers()
      }
    }
  }, [])

  useEffect(() => {
    fetchFarmers()
  }, [regionFilter, verifiedFilter, pagination.page, search])

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchExistingSuppliers = async () => {
    try {
      const response = await apiClient.get('/supplier-networks')
      const networks = response.data.data || []
      const farmerIds = new Set(networks.map((n: any) => n.farmerId))
      setExistingSupplierIds(farmerIds)
    } catch (error) {
      console.error('Failed to fetch existing suppliers:', error)
    }
  }

  const handleAddSupplier = (farmer: Farmer) => {
    setSelectedFarmer(farmer)
    setAddDialogOpen(true)
  }

  const handleAddSuccess = () => {
    fetchExistingSuppliers()
    fetchFarmers() // Refresh the list
  }

  // Update stats when farmers are loaded
  useEffect(() => {
    if (farmers.length > 0) {
      const verified = farmers.filter((f) => f.user?.verified).length
      const withListings = farmers.filter((f) => f.listings && f.listings.length > 0).length
      setStats((prev) => ({
        ...prev,
        verified: prev.verified || verified, // Only update if not set
        withListings: prev.withListings || withListings, // Only update if not set
      }))
    }
  }, [farmers])

  const fetchStats = async () => {
    try {
      setStatsLoading(true)
      const statsResponse = await apiClient.get('/farmers/stats')
      if (statsResponse.data) {
        setStats({
          total: statsResponse.data.total || 0,
          verified: 0, // Will be calculated from current page if needed
          withListings: 0, // Will be calculated from current page if needed
        })
      }
    } catch (error) {
      console.warn('Failed to fetch stats:', error)
      // Fallback: use pagination total if available
      if (pagination.total > 0) {
        setStats({
          total: pagination.total,
          verified: 0,
          withListings: 0,
        })
      }
    } finally {
      setStatsLoading(false)
    }
  }

  const fetchFarmers = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (regionFilter) params.append('region', regionFilter)
      if (verifiedFilter) params.append('verified', verifiedFilter)
      if (search) params.append('search', search)
      params.append('page', pagination.page.toString())
      params.append('limit', pagination.limit.toString())

      const response = await apiClient.get(`/farmers?${params.toString()}`)
      setFarmers(response.data.data || [])
      if (response.data.meta) {
        setPagination({
          page: response.data.meta.page || pagination.page,
          limit: response.data.meta.limit || pagination.limit,
          total: response.data.meta.total || 0,
          totalPages: response.data.meta.totalPages || 0,
        })
      }
    } catch (error: any) {
      console.error('Failed to fetch farmers:', error)
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.response?.data?.message || 'Failed to load farmers',
      })
    } finally {
      setLoading(false)
    }
  }

  const regionOptions: FilterOption[] = [
    { label: 'All Regions', value: '' },
    { label: 'Ashanti', value: 'Ashanti' },
    { label: 'Greater Accra', value: 'Greater Accra' },
    { label: 'Western', value: 'Western' },
    { label: 'Eastern', value: 'Eastern' },
    { label: 'Central', value: 'Central' },
    { label: 'Volta', value: 'Volta' },
    { label: 'Northern', value: 'Northern' },
  ]

  const verifiedOptions: FilterOption[] = [
    { label: 'All', value: '' },
    { label: 'Verified Only', value: 'true' },
    { label: 'Unverified', value: 'false' },
  ]

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPagination((prev) => ({ ...prev, page: 1 }))
    fetchFarmers()
  }

  if (loading && farmers.length === 0) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Discover Suppliers</h1>
          <p className="text-muted-foreground mt-1">
            Connect with verified farmers and producers across Ghana
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Suppliers</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {statsLoading ? '...' : stats.total}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Registered farmers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Verified</CardTitle>
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {statsLoading ? '...' : stats.verified}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Ghana Single Window verified</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">With Active Listings</CardTitle>
            <Package className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {statsLoading ? '...' : stats.withListings}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Currently selling</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, business, location, or crop type..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button type="submit">Search</Button>
            </div>
            <FilterBar
              filters={[
                {
                  id: 'region',
                  label: 'Region',
                  options: regionOptions,
                  active: regionFilter,
                  onChange: (val) => {
                    setRegionFilter(val || null)
                    setPagination((prev) => ({ ...prev, page: 1 }))
                  },
                },
                {
                  id: 'verified',
                  label: 'Verification',
                  options: verifiedOptions,
                  active: verifiedFilter,
                  onChange: (val) => {
                    setVerifiedFilter(val || null)
                    setPagination((prev) => ({ ...prev, page: 1 }))
                  },
                },
              ]}
              onClearAll={() => {
                setRegionFilter(null)
                setVerifiedFilter(null)
                setSearch('')
                setPagination((prev) => ({ ...prev, page: 1 }))
              }}
            />
          </form>
        </CardContent>
      </Card>

      {/* Farmers Grid */}
      {farmers.length > 0 ? (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {farmers.map((farmer) => (
              <Link key={farmer.id} href={`/dashboard/farmers/${farmer.id}`}>
                <Card className="hover:shadow-glow transition-all cursor-pointer h-full flex flex-col">
                  <CardContent className="p-6 flex flex-col flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg text-foreground truncate">
                          {farmer.businessName || `${farmer.user?.firstName} ${farmer.user?.lastName}`}
                        </h3>
                        {farmer.businessName && (
                          <p className="text-sm text-muted-foreground truncate">
                            {farmer.user?.firstName} {farmer.user?.lastName}
                          </p>
                        )}
                      </div>
                      {farmer.user?.verified && (
                        <Badge variant="success" className="ml-2 flex-shrink-0">
                          <ShieldCheck className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </div>

                    <div className="space-y-3 flex-1">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate">
                          {farmer.district && farmer.region
                            ? `${farmer.district}, ${farmer.region}`
                            : farmer.location || 'Location not specified'}
                        </span>
                      </div>

                      {farmer.farmSize && (
                        <div className="text-sm">
                          <span className="text-muted-foreground">Farm Size: </span>
                          <span className="font-medium text-foreground">{farmer.farmSize} acres</span>
                        </div>
                      )}

                      {farmer.listings && farmer.listings.length > 0 && (
                        <div className="flex items-center gap-2 text-sm">
                          <Package className="h-4 w-4 text-primary" />
                          <span className="text-foreground">
                            <span className="font-semibold">{farmer.listings.length}</span>{' '}
                            {farmer.listings.length === 1 ? 'active listing' : 'active listings'}
                          </span>
                        </div>
                      )}

                      {farmer.certifications && farmer.certifications.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {farmer.certifications.slice(0, 3).map((cert, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {cert}
                            </Badge>
                          ))}
                          {farmer.certifications.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{farmer.certifications.length - 3} more
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-4 border-t border-border">
                      <Button variant="outline" className="w-full" size="sm">
                        View Profile
                        <ChevronRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-border">
              <div className="text-sm text-muted-foreground">
                Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} suppliers
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
        </>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <Users className="h-16 w-16 mx-auto text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-xl font-semibold text-foreground mb-2">No Suppliers Found</h3>
            <p className="text-muted-foreground mb-6">
              {search || regionFilter || verifiedFilter
                ? 'Try adjusting your search or filters to find more suppliers.'
                : 'No suppliers are currently registered. Check back later.'}
            </p>
            {(search || regionFilter || verifiedFilter) && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearch('')
                  setRegionFilter(null)
                  setVerifiedFilter(null)
                  setPagination((prev) => ({ ...prev, page: 1 }))
                }}
              >
                Clear Filters
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Add Supplier Dialog */}
      {selectedFarmer && (
        <AddSupplierDialog
          open={addDialogOpen}
          onOpenChange={setAddDialogOpen}
          farmer={selectedFarmer}
          onSuccess={handleAddSuccess}
        />
      )}
    </div>
  )
}
