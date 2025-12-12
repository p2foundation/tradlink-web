'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, CalendarRange, MapPin, ShieldCheck, Tag, ShoppingCart, Handshake } from 'lucide-react'
import apiClient from '@/lib/api-client'
import { Listing, ListingStatus, QualityGrade } from '@/types'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'
import { getCommodityImage, getCommodityImageData } from '@/lib/commodity-images'

type StatusColor = 'green' | 'yellow' | 'red' | 'gray'

const statusBadge: Record<ListingStatus, { label: string; color: StatusColor }> = {
  [ListingStatus.ACTIVE]: { label: 'Active', color: 'green' },
  [ListingStatus.PENDING]: { label: 'Pending', color: 'yellow' },
  [ListingStatus.SOLD]: { label: 'Sold', color: 'red' },
  [ListingStatus.EXPIRED]: { label: 'Expired', color: 'gray' },
}

const qualityLabel: Record<QualityGrade, string> = {
  [QualityGrade.PREMIUM]: 'Premium',
  [QualityGrade.GRADE_A]: 'Grade A',
  [QualityGrade.GRADE_B]: 'Grade B',
  [QualityGrade.STANDARD]: 'Standard',
}

export default function ListingDetailPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const id = params?.id as string

  const [listing, setListing] = useState<Listing | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [user, setUser] = useState<any>(null)
  const [placingOrder, setPlacingOrder] = useState(false)

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }

    const fetchListing = async () => {
      if (!id) return
      try {
        setLoading(true)
        const res = await apiClient.get(`/listings/${id}`)
        setListing(res.data)
      } catch (err: any) {
        setError(err?.response?.data?.message || 'Failed to load listing')
      } finally {
        setLoading(false)
      }
    }

    fetchListing()
  }, [id])

  const handlePlaceOrder = async () => {
    if (!listing || !user) return

    try {
      setPlacingOrder(true)

      // First, create a match (buyerId will be looked up from user)
      const matchResponse = await apiClient.post('/matches', {
        listingId: listing.id,
        farmerId: listing.farmerId,
        // buyerId will be looked up from authenticated user
      })

      const match = matchResponse.data

      // Create negotiation
      const negotiationResponse = await apiClient.post('/negotiations', {
        matchId: match.id,
        initialPrice: listing.pricePerUnit,
        currentPrice: listing.pricePerUnit,
        quantity: listing.quantity,
        currency: 'USD',
        initiatedBy: String(user.id), // Ensure it's a string
      })

      toast({
        variant: 'success',
        title: 'Order Initiated',
        description: 'Redirecting to negotiation...',
      })

      // Redirect to negotiation page
      setTimeout(() => {
        router.push(`/dashboard/negotiations/${match.id}`)
      }, 1000)
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Order Failed',
        description: error.response?.data?.message || 'Failed to place order. Please try again.',
      })
    } finally {
      setPlacingOrder(false)
    }
  }

  const renderGallery = (images?: string[], cropType?: string) => {
    const defaultImage = getCommodityImage(cropType)
    const displayImages = images && images.length > 0 ? images : [defaultImage]
    const isUsingDefault = !images || images.length === 0

    return (
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {displayImages.map((src, idx) => (
          <div
            key={idx}
            className="relative overflow-hidden rounded-lg border border-white/10 bg-slate-900/80 group"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={isUsingDefault && idx === 0 ? `${cropType || 'Commodity'} - Default image` : `Listing image ${idx + 1}`}
              className="h-40 w-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
            {isUsingDefault && idx === 0 && (
              <div className="absolute top-2 right-2">
                <Badge variant="outline" className="bg-slate-900/90 border-white/20 text-xs">
                  Default Image
                </Badge>
              </div>
            )}
          </div>
        ))}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-6 text-slate-100">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-6 w-80" />
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    )
  }

  if (error || !listing) {
    return (
      <div className="space-y-4 text-slate-100">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard/listings')}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <p className="text-red-300 text-sm">{error || 'Listing not found'}</p>
        </div>
      </div>
    )
  }

  const status = statusBadge[listing.status]

  const heroImage = listing.images && listing.images.length > 0 
    ? listing.images[0] 
    : getCommodityImage(listing.cropType)

  return (
    <div className="space-y-6 text-slate-100">
      {/* Hero Image Section */}
      <div className="relative h-64 sm:h-80 md:h-96 w-full rounded-lg overflow-hidden border border-white/10">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={heroImage}
          alt={listing.cropType || 'Commodity'}
          className="w-full h-full object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
            {listing.cropType}
            {listing.cropVariety ? ` — ${listing.cropVariety}` : ''}
          </h1>
          <p className="text-gray-300">Listing details and farmer information</p>
        </div>
        {(!listing.images || listing.images.length === 0) && (
          <div className="absolute top-4 right-4">
            <Badge variant="outline" className="bg-slate-900/90 border-white/20">
              Default Image
            </Badge>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard/listings')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to listings
          </Button>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <Badge
            variant="outline"
            className={`border-white/20 ${
              status.color === 'green'
                ? 'bg-emerald-500/15 text-emerald-300'
                : status.color === 'yellow'
                ? 'bg-amber-500/15 text-amber-200'
                : status.color === 'red'
                ? 'bg-red-500/15 text-red-200'
                : 'bg-slate-700 text-slate-200'
            }`}
          >
            {status.label}
          </Badge>
          <Badge variant="outline" className="border-white/20 bg-slate-800/80 text-slate-100">
            {qualityLabel[listing.qualityGrade]}
          </Badge>
          {user?.role === 'BUYER' && listing.status === ListingStatus.ACTIVE && (
            <Button
              onClick={handlePlaceOrder}
              disabled={placingOrder}
              className="ml-auto bg-emerald-600 hover:bg-emerald-700 shadow-glow"
            >
              {placingOrder ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Placing Order...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4" />
                  Place Order
                </span>
              )}
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="bg-slate-900/80 border-white/10">
          <CardHeader>
            <CardTitle>Listing Overview</CardTitle>
            <CardDescription>Key details about this product</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2 rounded-lg bg-slate-800/80 px-3 py-2 text-sm">
                <Tag className="h-4 w-4 text-primary" />
                <span className="font-medium text-white">
                  {listing.pricePerUnit.toLocaleString()} / {listing.unit}
                </span>
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-slate-800/80 px-3 py-2 text-sm">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                <span className="text-slate-200">{qualityLabel[listing.qualityGrade]}</span>
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-slate-800/80 px-3 py-2 text-sm">
                <CalendarRange className="h-4 w-4 text-amber-300" />
                <span className="text-slate-200">
                  Available from {new Date(listing.availableFrom).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm text-gray-200">
              <div>
                <p className="text-gray-400">Quantity</p>
                <p className="font-semibold text-white">
                  {listing.quantity.toLocaleString()} {listing.unit}
                </p>
              </div>
              {listing.availableUntil && (
                <div>
                  <p className="text-gray-400">Available Until</p>
                  <p className="font-semibold text-white">
                    {new Date(listing.availableUntil).toLocaleDateString()}
                  </p>
                </div>
              )}
              {listing.harvestDate && (
                <div>
                  <p className="text-gray-400">Harvest Date</p>
                  <p className="font-semibold text-white">
                    {new Date(listing.harvestDate).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>

            {listing.description && (
              <div className="rounded-lg border border-white/10 bg-slate-900/80 p-4 text-sm text-gray-200">
                <p className="text-gray-400 mb-1">Description</p>
                <p>{listing.description}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-slate-900/80 border-white/10">
          <CardHeader>
            <CardTitle>Farmer</CardTitle>
            <CardDescription>Producer details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-gray-200">
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-primary/15 border border-primary/30 h-10 w-10 flex items-center justify-center text-primary font-semibold">
                {(listing.farmer?.user?.firstName?.[0] || 'F') +
                  (listing.farmer?.user?.lastName?.[0] || '')}
              </div>
              <div>
                <p className="font-semibold text-white">
                  {listing.farmer?.user
                    ? `${listing.farmer.user.firstName} ${listing.farmer.user.lastName}`
                    : 'Farmer'}
                </p>
                <p className="text-gray-400 text-xs">{listing.farmer?.businessName || 'Producer'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-amber-300" />
              <span>
                {listing.farmer?.region || '—'}, {listing.farmer?.district || '—'}
              </span>
            </div>
            {listing.farmer?.certifications?.length ? (
              <div>
                <p className="text-gray-400 mb-2">Certifications</p>
                <div className="flex flex-wrap gap-2">
                  {listing.farmer.certifications.slice(0, 4).map((cert, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs border-white/20">
                      {cert}
                    </Badge>
                  ))}
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>

      <Card className="bg-slate-900/80 border-white/10">
        <CardHeader>
          <CardTitle>Certifications & Documents</CardTitle>
          <CardDescription>Quality and compliance</CardDescription>
        </CardHeader>
        <CardContent>
          {listing.certifications.length ? (
            <div className="flex flex-wrap gap-2">
              {listing.certifications.map((cert, idx) => (
                <Badge key={idx} variant="outline" className="border-white/20 text-xs">
                  {cert}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">No certifications attached.</p>
          )}
        </CardContent>
      </Card>

      <Card className="bg-slate-900/80 border-white/10">
        <CardHeader>
          <CardTitle>Gallery</CardTitle>
          <CardDescription>Product images</CardDescription>
        </CardHeader>
        <CardContent>{renderGallery(listing.images, listing.cropType)}</CardContent>
      </Card>
    </div>
  )
}

