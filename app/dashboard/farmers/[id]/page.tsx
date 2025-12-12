'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, MapPin, Phone, ShieldCheck, Sprout, Layers, ShoppingCart } from 'lucide-react'
import apiClient from '@/lib/api-client'
import { Farmer } from '@/types'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'

export default function FarmerDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const id = params?.id as string

  const [farmer, setFarmer] = useState<Farmer | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }

    const fetchFarmer = async () => {
      if (!id) return
      try {
        setLoading(true)
        const res = await apiClient.get(`/farmers/${id}`)
        setFarmer(res.data)
      } catch (err: any) {
        setError(err?.response?.data?.message || 'Failed to load farmer')
      } finally {
        setLoading(false)
      }
    }
    fetchFarmer()
  }, [id])

  const handlePlaceOrderFromListing = async (listingId: string) => {
    if (!user) return

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
          initiatedBy: String(user.id), // Ensure it's a string
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

  if (error || !farmer) {
    return (
      <div className="space-y-4 text-slate-100">
        <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard/farmers')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <p className="text-red-300 text-sm">{error || 'Farmer not found'}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 text-slate-100">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard/farmers')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to farmers
          </Button>
          <h1 className="mt-2 text-3xl sm:text-4xl font-bold text-white">
            {farmer.businessName || `${farmer.user?.firstName} ${farmer.user?.lastName}`}
          </h1>
          <p className="text-gray-300 mt-1">Producer profile and certifications</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {farmer.farmSize && (
            <Badge variant="outline" className="border-white/20 bg-emerald-500/15 text-emerald-200">
              Farm Size: {farmer.farmSize} acres
            </Badge>
          )}
          {farmer.user?.verified && (
            <Badge variant="outline" className="border-white/20 bg-primary/15 text-primary">
              Verified
            </Badge>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="bg-slate-900/80 border-white/10">
          <CardHeader>
            <CardTitle>Farmer Overview</CardTitle>
            <CardDescription>Location and contact</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-gray-200">
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-primary/15 border border-primary/30 h-10 w-10 flex items-center justify-center text-primary font-semibold">
                {(farmer.user?.firstName?.[0] || 'F') + (farmer.user?.lastName?.[0] || '')}
              </div>
              <div>
                <p className="font-semibold text-white">
                  {farmer.user ? `${farmer.user.firstName} ${farmer.user.lastName}` : 'Farmer'}
                </p>
                <p className="text-gray-400 text-xs">{farmer.user?.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-amber-300" />
              <span>
                {farmer.region || '—'}, {farmer.district || '—'}
              </span>
            </div>
            {farmer.user?.phone && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary" />
                <span>{farmer.user.phone}</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-slate-900/80 border-white/10">
          <CardHeader>
            <CardTitle>Production</CardTitle>
            <CardDescription>Focus crops and certifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-gray-200">
            <div className="flex items-center gap-2">
              <Sprout className="h-4 w-4 text-emerald-300" />
              <span>{farmer.listings?.[0]?.cropType || 'Primary crop not specified'}</span>
            </div>
            {farmer.certifications.length > 0 ? (
              <div>
                <p className="text-gray-400 mb-2">Certifications</p>
                <div className="flex flex-wrap gap-2">
                  {farmer.certifications.map((cert, idx) => (
                    <Badge key={idx} variant="outline" className="border-white/20 text-xs">
                      {cert}
                    </Badge>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-gray-400">No certifications listed.</p>
            )}
            {farmer.listings && farmer.listings.length > 0 && (
              <div>
                <p className="text-gray-400 mb-2">Active Listings</p>
                <div className="space-y-2">
                  {farmer.listings.slice(0, 3).map((listing) => (
                    <div
                      key={listing.id}
                      className="flex items-center justify-between rounded-lg border border-white/10 bg-slate-800/70 px-3 py-2 text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <Layers className="h-4 w-4 text-primary" />
                        <div>
                          <p className="font-semibold text-white">{listing.cropType}</p>
                          <p className="text-gray-400">
                            {listing.quantity.toLocaleString()} {listing.unit} • {listing.qualityGrade}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="link"
                          size="sm"
                          className="text-primary"
                          onClick={() => router.push(`/dashboard/listings/${listing.id}`)}
                        >
                          View
                        </Button>
                        {user?.role === 'BUYER' && listing.status === 'ACTIVE' && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-emerald-400 border-emerald-500/50 hover:bg-emerald-500/10"
                            onClick={() => handlePlaceOrderFromListing(listing.id)}
                          >
                            <ShoppingCart className="h-3 w-3 mr-1" />
                            Order
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

