'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeft,
  MapPin,
  Phone,
  Mail,
  ShieldCheck,
  Sprout,
  Package,
  ShoppingCart,
  Calendar,
  TrendingUp,
  Award,
  Building2,
  Loader2,
} from 'lucide-react'
import apiClient from '@/lib/api-client'
import { Farmer } from '@/types'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'
import { useCurrency } from '@/contexts/currency-context'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'
import { UserRole } from '@/types'
import { AddSupplierDialog } from '@/components/suppliers/add-supplier-dialog'
import { UserPlus, CheckCircle2 } from 'lucide-react'

export default function FarmerDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const { formatCurrency } = useCurrency()
  const id = params?.id as string

  const [farmer, setFarmer] = useState<Farmer | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [user, setUser] = useState<any>(null)
  const [isInNetwork, setIsInNetwork] = useState(false)
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [checkingNetwork, setCheckingNetwork] = useState(false)

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      const userData = JSON.parse(storedUser)
      setUser(userData)
      
      // If export company, check if farmer is already in network
      if (userData.role === UserRole.EXPORT_COMPANY && id) {
        checkIfInNetwork()
      }
    }

    const fetchFarmer = async () => {
      if (!id) return
      try {
        setLoading(true)
        const res = await apiClient.get(`/farmers/${id}`)
        setFarmer(res.data)
      } catch (err: any) {
        setError(err?.response?.data?.message || 'Failed to load farmer')
        toast({
          variant: 'destructive',
          title: 'Error',
          description: err?.response?.data?.message || 'Failed to load farmer profile',
        })
      } finally {
        setLoading(false)
      }
    }
    fetchFarmer()
  }, [id])

  const checkIfInNetwork = async () => {
    if (!id) return
    try {
      setCheckingNetwork(true)
      const response = await apiClient.get('/supplier-networks')
      const networks = response.data.data || []
      const isAdded = networks.some((n: any) => n.farmerId === id)
      setIsInNetwork(isAdded)
    } catch (error) {
      console.error('Failed to check network status:', error)
    } finally {
      setCheckingNetwork(false)
    }
  }

  const handleAddSuccess = () => {
    setIsInNetwork(true)
    toast({
      variant: 'success',
      title: 'Supplier Added',
      description: 'Farmer has been added to your supplier network successfully.',
    })
  }

  const handlePlaceOrderFromListing = async (listingId: string) => {
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Authentication Required',
        description: 'Please log in to place an order',
      })
      return
    }

    try {
      // Create match
      const matchResponse = await apiClient.post('/matches', {
        listingId,
        farmerId: farmer?.id,
      })

      const match = matchResponse.data

      // Create negotiation
      const listing = farmer?.listings?.find((l) => l.id === listingId)
      if (listing) {
        await apiClient.post('/negotiations', {
          matchId: match.id,
          initialPrice: listing.pricePerUnit,
          currentPrice: listing.pricePerUnit,
          quantity: listing.quantity,
          currency: 'USD',
          initiatedBy: String(user.id),
        })

        toast({
          variant: 'success',
          title: 'Order Initiated',
          description: 'Redirecting to negotiation...',
        })

        setTimeout(() => {
          router.push(`/dashboard/negotiations/${match.id}`)
        }, 1000)
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Order Failed',
        description: error.response?.data?.message || 'Failed to place order',
      })
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  if (error || !farmer) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard/farmers')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Suppliers
        </Button>
        <Card>
          <CardContent className="p-12 text-center">
            <ShieldCheck className="h-16 w-16 mx-auto text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              {error || 'Supplier Not Found'}
            </h3>
            <p className="text-muted-foreground mb-6">
              {error || 'The supplier profile you are looking for does not exist or has been removed.'}
            </p>
            <Button onClick={() => router.push('/dashboard/farmers')}>Browse All Suppliers</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const activeListings = farmer.listings?.filter((l) => l.status === 'ACTIVE') || []
  const totalListings = farmer.listings?.length || 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard/farmers')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Suppliers
        </Button>
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
                {farmer.businessName || `${farmer.user?.firstName} ${farmer.user?.lastName}`}
              </h1>
              {farmer.user?.verified && (
                <Badge variant="success" className="text-sm">
                  <ShieldCheck className="h-3 w-3 mr-1" />
                  Verified
                </Badge>
              )}
            </div>
            {farmer.businessName && (
              <p className="text-lg text-muted-foreground mb-2">
                {farmer.user?.firstName} {farmer.user?.lastName}
              </p>
            )}
            <p className="text-muted-foreground">Supplier profile and production details</p>
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            {farmer.farmSize && (
              <Badge variant="outline" className="text-sm">
                <Building2 className="h-3 w-3 mr-1" />
                {farmer.farmSize} acres
              </Badge>
            )}
            {totalListings > 0 && (
              <Badge variant="outline" className="text-sm">
                <Package className="h-3 w-3 mr-1" />
                {totalListings} {totalListings === 1 ? 'listing' : 'listings'}
              </Badge>
            )}
            {user?.role === UserRole.EXPORT_COMPANY && (
              <Button
                variant={isInNetwork ? 'outline' : 'default'}
                size="sm"
                onClick={() => {
                  if (!isInNetwork) {
                    setAddDialogOpen(true)
                  } else {
                    toast({
                      title: 'Already in Network',
                      description: 'This farmer is already in your supplier network.',
                      variant: 'default',
                    })
                  }
                }}
                disabled={checkingNetwork || isInNetwork}
                className={isInNetwork ? 'opacity-50 cursor-not-allowed' : ''}
              >
                {checkingNetwork ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Checking...
                  </>
                ) : isInNetwork ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    In Network
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add to Network
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
            <CardDescription>Location and contact details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-primary/15 border border-primary/30 h-12 w-12 flex items-center justify-center text-primary font-semibold text-lg flex-shrink-0">
                {(farmer.user?.firstName?.[0] || 'F') + (farmer.user?.lastName?.[0] || '')}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground">
                  {farmer.user ? `${farmer.user.firstName} ${farmer.user.lastName}` : 'Farmer'}
                </p>
                {farmer.businessName && (
                  <p className="text-sm text-muted-foreground">{farmer.businessName}</p>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <div>
                  <p className="text-foreground">
                    {farmer.district && farmer.region
                      ? `${farmer.district}, ${farmer.region}`
                      : farmer.location || 'Location not specified'}
                  </p>
                  {farmer.gpsAddress && (
                    <p className="text-xs text-muted-foreground mt-1">{farmer.gpsAddress}</p>
                  )}
                </div>
              </div>

              {farmer.user?.email && (
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <a
                    href={`mailto:${farmer.user.email}`}
                    className="text-primary hover:underline truncate"
                  >
                    {farmer.user.email}
                  </a>
                </div>
              )}

              {farmer.user?.phone && (
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <a
                    href={`tel:${farmer.user.phone}`}
                    className="text-primary hover:underline"
                  >
                    {farmer.user.phone}
                  </a>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Production Details</CardTitle>
            <CardDescription>Farm information and certifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {farmer.farmSize && (
              <div className="flex items-center gap-3 text-sm">
                <Building2 className="h-4 w-4 text-primary flex-shrink-0" />
                <div>
                  <p className="text-muted-foreground">Farm Size</p>
                  <p className="font-semibold text-foreground">{farmer.farmSize} acres</p>
                </div>
              </div>
            )}

            {farmer.certifications && farmer.certifications.length > 0 ? (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Award className="h-4 w-4 text-primary" />
                  <p className="text-sm font-medium text-foreground">Certifications</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {farmer.certifications.map((cert, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {cert}
                    </Badge>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">
                <Award className="h-4 w-4 inline mr-2" />
                No certifications listed
              </div>
            )}

            {farmer.user?.verified && (
              <div className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                <ShieldCheck className="h-5 w-5 text-emerald-500" />
                <div>
                  <p className="text-sm font-medium text-foreground">Ghana Single Window Verified</p>
                  <p className="text-xs text-muted-foreground">
                    This supplier has been verified for export compliance
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Active Listings */}
      {activeListings.length > 0 ? (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Active Listings</CardTitle>
                <CardDescription>
                  {activeListings.length} {activeListings.length === 1 ? 'product' : 'products'} currently available
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeListings.map((listing) => (
                <div
                  key={listing.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Package className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-foreground">{listing.cropType}</h4>
                          {listing.cropVariety && (
                            <Badge variant="outline" className="text-xs">
                              {listing.cropVariety}
                            </Badge>
                          )}
                          <Badge variant="outline" className="text-xs">
                            {listing.qualityGrade}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                          <span>
                            <span className="font-medium text-foreground">
                              {listing.quantity.toLocaleString()}
                            </span>{' '}
                            {listing.unit}
                          </span>
                          <span>
                            <span className="font-medium text-foreground">
                              {formatCurrency(listing.pricePerUnit)}
                            </span>
                            /{listing.unit}
                          </span>
                          {listing.availableFrom && (
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Available: {formatDate(listing.availableFrom)}
                            </span>
                          )}
                        </div>
                        {listing.description && (
                          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                            {listing.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 sm:flex-shrink-0">
                    <Link href={`/dashboard/listings/${listing.id}`}>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </Link>
                    {user?.role === 'BUYER' && (
                      <Button
                        size="sm"
                        onClick={() => handlePlaceOrderFromListing(listing.id)}
                        className="bg-emerald-600 hover:bg-emerald-700"
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Order
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-xl font-semibold text-foreground mb-2">No Active Listings</h3>
            <p className="text-muted-foreground">
              This supplier doesn't have any active product listings at the moment.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Add Supplier Dialog */}
      {farmer && user?.role === UserRole.EXPORT_COMPANY && (
        <AddSupplierDialog
          open={addDialogOpen}
          onOpenChange={setAddDialogOpen}
          farmer={farmer}
          onSuccess={handleAddSuccess}
        />
      )}
    </div>
  )
}
