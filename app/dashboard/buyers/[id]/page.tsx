'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Globe2, MapPin, Phone, ShieldCheck, Link as LinkIcon } from 'lucide-react'
import apiClient from '@/lib/api-client'
import { Buyer } from '@/types'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

export default function BuyerDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params?.id as string

  const [buyer, setBuyer] = useState<Buyer | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchBuyer = async () => {
      if (!id) return
      try {
        setLoading(true)
        const res = await apiClient.get(`/buyers/${id}`)
        setBuyer(res.data)
      } catch (err: any) {
        setError(err?.response?.data?.message || 'Failed to load buyer')
      } finally {
        setLoading(false)
      }
    }
    fetchBuyer()
  }, [id])

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

  if (error || !buyer) {
    return (
      <div className="space-y-4 text-slate-100">
        <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard/buyers')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <p className="text-red-300 text-sm">{error || 'Buyer not found'}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 text-slate-100">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard/buyers')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to buyers
          </Button>
          <h1 className="mt-2 text-3xl sm:text-4xl font-bold text-white">{buyer.companyName}</h1>
          <p className="text-gray-300 mt-1">International buyer profile and demand</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="border-white/20 bg-slate-800/80 text-slate-100">
            {buyer.industry}
          </Badge>
          {buyer.volumeRequired && (
            <Badge variant="outline" className="border-white/20 bg-emerald-500/15 text-emerald-200">
              Volume: {buyer.volumeRequired}
            </Badge>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="bg-slate-900/80 border-white/10">
          <CardHeader>
            <CardTitle>Buyer Overview</CardTitle>
            <CardDescription>Company and demand details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-gray-200">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-amber-300" />
              <span>{buyer.country}</span>
            </div>
            {buyer.companySize && (
              <div>
                <p className="text-gray-400">Company Size</p>
                <p className="font-semibold text-white">{buyer.companySize}</p>
              </div>
            )}
            <div>
              <p className="text-gray-400">Seeking Crops</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {buyer.seekingCrops.map((crop, idx) => (
                  <Badge key={idx} variant="outline" className="border-white/20 text-xs">
                    {crop}
                  </Badge>
                ))}
              </div>
            </div>
            {buyer.qualityStandards.length > 0 && (
              <div>
                <p className="text-gray-400">Quality Standards</p>
                <p className="text-xs text-gray-300 mt-1">{buyer.qualityStandards.join(', ')}</p>
              </div>
            )}
            {buyer.user?.verified && (
              <div className="flex items-center gap-2 text-emerald-300">
                <ShieldCheck className="h-4 w-4" />
                <span className="text-sm">Verified buyer</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-slate-900/80 border-white/10">
          <CardHeader>
            <CardTitle>Contacts</CardTitle>
            <CardDescription>Reach out to finalize deals</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-gray-200">
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-primary/15 border border-primary/30 h-10 w-10 flex items-center justify-center text-primary font-semibold">
                {(buyer.user?.firstName?.[0] || 'B') + (buyer.user?.lastName?.[0] || '')}
              </div>
              <div>
                <p className="font-semibold text-white">
                  {buyer.user ? `${buyer.user.firstName} ${buyer.user.lastName}` : 'Contact'}
                </p>
                <p className="text-gray-400 text-xs">{buyer.user?.email}</p>
              </div>
            </div>
            {buyer.user?.phone && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary" />
                <span>{buyer.user.phone}</span>
              </div>
            )}
            {buyer.website && (
              <div className="flex items-center gap-2">
                <LinkIcon className="h-4 w-4 text-primary" />
                <a
                  href={buyer.website}
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary hover:underline"
                >
                  {buyer.website}
                </a>
              </div>
            )}
            {buyer.country && (
              <div className="flex items-center gap-2">
                <Globe2 className="h-4 w-4 text-primary" />
                <span>Based in {buyer.country}</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

