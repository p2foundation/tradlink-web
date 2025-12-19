'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  MessageSquare,
  Send,
  CheckCircle2,
  XCircle,
  Clock,
  DollarSign,
  Package,
  User,
  ArrowLeft,
  FileText,
  Globe,
  Shield,
  AlertTriangle,
  Info,
} from 'lucide-react'
import apiClient from '@/lib/api-client'
import { useToast } from '@/hooks/use-toast'
import { formatDate } from '@/lib/utils'
import { useCurrency } from '@/contexts/currency-context'

interface Offer {
  id: string
  offeredBy: string
  offeredByRole: string
  price: number
  quantity: number
  currency: string
  message?: string
  status: string
  createdAt: string
  respondedAt?: string
}

interface Negotiation {
  id: string
  status: string
  initialPrice: number
  currentPrice: number
  quantity: number
  currency: string
  terms?: string
  deliveryTerms?: string
  paymentTerms?: string
  initiatedBy: string
  offers: Offer[]
  match: {
    listing: {
      cropType: string
      cropVariety?: string
      pricePerUnit: number
      qualityGrade?: string
      certifications?: string[]
      harvestDate?: string
      availableFrom?: string
    }
    farmer: {
      user: {
        firstName: string
        lastName: string
      }
      certifications?: string[]
      region?: string
      district?: string
    }
    buyer: {
      user: {
        firstName: string
        lastName: string
      }
      country?: string
      countryName?: string
    }
  }
  createdAt: string
  acceptedAt?: string
}

export default function NegotiationPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const { formatCurrency } = useCurrency()
  const matchId = params.matchId as string
  const [user, setUser] = useState<any>(null)
  const [negotiation, setNegotiation] = useState<Negotiation | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  
  const [offerPrice, setOfferPrice] = useState('')
  const [offerQuantity, setOfferQuantity] = useState('')
  const [offerMessage, setOfferMessage] = useState('')
  const [showAcceptDialog, setShowAcceptDialog] = useState(false)
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [newOffersCount, setNewOffersCount] = useState(0)
  const [previousOffersCount, setPreviousOffersCount] = useState(0)

  useEffect(() => {
    const loadUser = () => {
      const storedUser = localStorage.getItem('user')
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser)
          setUser(parsedUser)
          return parsedUser
        } catch (error) {
          console.error('Failed to parse user from localStorage:', error)
        }
      }
      return null
    }
    
    loadUser()
  }, [])

  useEffect(() => {
    // Only fetch negotiation if we have matchId
    if (matchId && user?.id) {
      fetchNegotiation()
    } else if (matchId && !user) {
      // If matchId exists but user is not loaded yet, try to load it
      const storedUser = localStorage.getItem('user')
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser)
          if (parsedUser?.id) {
            setUser(parsedUser)
          }
        } catch (error) {
          console.error('Failed to parse user:', error)
        }
      }
    }
  }, [matchId, user])

  // Poll for real-time updates when negotiation is active
  useEffect(() => {
    if (!matchId || !user?.id || !negotiation) return

    // Only poll if negotiation is active
    if (negotiation.status !== 'ACTIVE') return

    // Poll every 10 seconds for real-time updates
    const interval = setInterval(() => {
      fetchNegotiation()
    }, 10000) // 10 seconds

    return () => clearInterval(interval)
  }, [matchId, user?.id, negotiation?.status])

  const fetchNegotiation = async (showLoading = true) => {
    // Ensure we have user before proceeding
    let currentUser = user
    if (!currentUser?.id) {
      const storedUser = localStorage.getItem('user')
      if (storedUser) {
        try {
          currentUser = JSON.parse(storedUser)
          if (currentUser && !user) {
            setUser(currentUser)
          }
        } catch (error) {
          console.error('Failed to parse user:', error)
        }
      }
    }
    
    if (!currentUser || !currentUser.id) {
      const storedUserStr = localStorage.getItem('user')
      console.error('User not available:', { 
        userState: user, 
        currentUser, 
        storedUser: storedUserStr,
        hasMatchId: !!matchId 
      })
      
      // If user is not in localStorage at all, redirect to login
      if (!storedUserStr) {
        toast({
          variant: 'destructive',
          title: 'Session Expired',
          description: 'Please log in again.',
        })
        setTimeout(() => {
          router.push('/login')
        }, 2000)
        setLoading(false)
        return
      }
      
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'User information not available. Please refresh the page.',
      })
      setLoading(false)
      return
    }

    try {
      if (showLoading) {
        setLoading(true)
      }
      
      // First, try to fetch existing negotiations
      const response = await apiClient.get(`/negotiations?matchId=${matchId}`)
      
      // Handle different response formats (array or object with data property)
      const negotiations = response.data?.data || response.data || []
      
      if (negotiations.length > 0) {
        // Negotiation found
        const negotiation = negotiations[0]
        
        // Check if there are new offers (compare with previous state)
        const currentOffersCount = negotiation.offers?.length || 0
        
        if (previousOffersCount > 0 && currentOffersCount > previousOffersCount) {
          const newCount = currentOffersCount - previousOffersCount
          setNewOffersCount(newCount)
          
          // Show toast notification for new offer from other party
          if (!showLoading && negotiation.offers && negotiation.offers.length > 0) {
            const latestOffer = negotiation.offers[0]
            const isFromOtherParty = latestOffer.offeredBy !== currentUser.id
            if (isFromOtherParty) {
              toast({
                variant: 'default',
                title: 'New Offer Received',
                description: `${latestOffer.offeredByRole === 'BUYER' ? 'Buyer' : 'Farmer'} made a new offer: ${formatCurrency(latestOffer.price, latestOffer.currency)}`,
              })
            }
          }
        }
        
        // Update previous offers count for next comparison
        setPreviousOffersCount(currentOffersCount)
        
        setNegotiation(negotiation)
        setOfferPrice(negotiation.currentPrice.toString())
        setOfferQuantity(negotiation.quantity.toString())
        setLastUpdated(new Date())
        return // Success, exit early
      }
      
      // No negotiation found, try to create one
      // First check if match exists
      const matchResponse = await apiClient.get(`/matches/${matchId}`)
      const match = matchResponse.data

      // Create new negotiation
      try {
        const newNegotiation = await apiClient.post('/negotiations', {
          matchId,
          initialPrice: match.listing.pricePerUnit,
          currentPrice: match.listing.pricePerUnit,
          quantity: match.listing.quantity,
          currency: 'USD',
          initiatedBy: String(currentUser.id), // Ensure it's a string
        })
        
        const negotiationData = newNegotiation.data?.data || newNegotiation.data
        setNegotiation(negotiationData)
        setOfferPrice(match.listing.pricePerUnit.toString())
        setOfferQuantity(match.listing.quantity.toString())
        setPreviousOffersCount(negotiationData.offers?.length || 0)
      } catch (createError: any) {
        // If creation fails with "already exists" error, fetch the existing one
        const errorMessage = createError.response?.data?.message || ''
        
        if (errorMessage.includes('already exists') || errorMessage.includes('Active negotiation')) {
          // Retry fetching - negotiation was created by another request or user
          const retryResponse = await apiClient.get(`/negotiations?matchId=${matchId}`)
          const retryNegotiations = retryResponse.data?.data || retryResponse.data || []
          
          if (retryNegotiations.length > 0) {
            const negotiation = retryNegotiations[0]
            setNegotiation(negotiation)
            setOfferPrice(negotiation.currentPrice.toString())
            setOfferQuantity(negotiation.quantity.toString())
            setPreviousOffersCount(negotiation.offers?.length || 0)
            setLastUpdated(new Date())
            return // Success, don't show error
          }
        }
        
        // If we get here, it's a different error
        throw createError
      }
    } catch (error: any) {
      console.error('Failed to fetch negotiation:', error)
      const errorMessage = error.response?.data?.message || 'Failed to load negotiation'
      
      // Final attempt: if error mentions "already exists", try fetching one more time
      if (errorMessage.includes('already exists') || errorMessage.includes('Active negotiation')) {
        try {
          const finalRetry = await apiClient.get(`/negotiations?matchId=${matchId}`)
          const finalNegotiations = finalRetry.data?.data || finalRetry.data || []
          
          if (finalNegotiations.length > 0) {
            const negotiation = finalNegotiations[0]
            setNegotiation(negotiation)
            setOfferPrice(negotiation.currentPrice.toString())
            setOfferQuantity(negotiation.quantity.toString())
            setPreviousOffersCount(negotiation.offers?.length || 0)
            setLastUpdated(new Date())
            return // Success, don't show error
          }
        } catch (retryError) {
          console.error('Final retry failed:', retryError)
        }
      }
      
      toast({
        variant: 'destructive',
        title: 'Error',
        description: errorMessage,
      })
    } finally {
      if (showLoading) {
        setLoading(false)
      }
    }
  }

  const submitOffer = async () => {
    if (!negotiation || !offerPrice || !offerQuantity) {
      toast({
        variant: 'warning',
        title: 'Incomplete Offer',
        description: 'Please provide both price and quantity',
      })
      return
    }

    // Get user from state or localStorage
    let currentUser = user
    if (!currentUser?.id) {
      const storedUser = localStorage.getItem('user')
      if (storedUser) {
        try {
          currentUser = JSON.parse(storedUser)
        } catch (error) {
          console.error('Failed to parse user:', error)
        }
      }
    }

    if (!currentUser?.id) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'User information not available. Please refresh the page.',
      })
      return
    }

    try {
      setSubmitting(true)
      await apiClient.post(`/negotiations/${negotiation.id}/offers`, {
        negotiationId: negotiation.id,
        offeredBy: currentUser.id,
        offeredByRole: currentUser.role,
        price: parseFloat(offerPrice),
        quantity: parseFloat(offerQuantity),
        currency: negotiation.currency,
        message: offerMessage,
      })
      
      toast({
        variant: 'success',
        title: 'Offer Submitted',
        description: 'Your offer has been sent successfully',
      })
      
      setOfferMessage('')
      fetchNegotiation()
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.response?.data?.message || 'Failed to submit offer',
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleAcceptClick = () => {
    setShowAcceptDialog(true)
  }

  const acceptNegotiation = async () => {
    if (!negotiation) return

    try {
      setSubmitting(true)
      setShowAcceptDialog(false)
      const response = await apiClient.post(`/negotiations/${negotiation.id}/accept`)
      
      // Get transaction ID from response (created when negotiation is accepted)
      const transactionId = response.data?.transactionId || response.data?.transaction?.id
      
      if (!transactionId) {
        // If transaction ID not in response, try to find it by negotiation ID
        try {
          const transactionsResponse = await apiClient.get(`/transactions?negotiationId=${negotiation.id}`)
          const transactions = transactionsResponse.data?.data || transactionsResponse.data || []
          if (transactions.length > 0) {
            const txnId = transactions[0].id
            toast({
              variant: 'success',
              title: 'Negotiation Accepted',
              description: 'The deal has been accepted. Proceeding to payment...',
            })
            setTimeout(() => {
              router.push(`/dashboard/transactions/${txnId}/payment`)
            }, 1500)
            return
          }
        } catch (findError) {
          console.error('Failed to find transaction:', findError)
        }
        
        // Fallback: redirect to transactions list
        toast({
          variant: 'success',
          title: 'Negotiation Accepted',
          description: 'The deal has been accepted. Please proceed to payment from transactions.',
        })
        setTimeout(() => {
          router.push('/dashboard/transactions')
        }, 1500)
        return
      }
      
      toast({
        variant: 'success',
        title: 'Negotiation Accepted',
        description: 'The deal has been accepted. Proceeding to payment...',
      })
      
      // Redirect to payment page with transaction ID
      setTimeout(() => {
        router.push(`/dashboard/transactions/${transactionId}/payment`)
      }, 1500)
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.response?.data?.message || 'Failed to accept negotiation',
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleRejectClick = () => {
    setShowRejectDialog(true)
  }

  const rejectNegotiation = async () => {
    if (!negotiation) return

    try {
      setSubmitting(true)
      setShowRejectDialog(false)
      await apiClient.post(`/negotiations/${negotiation.id}/reject`)
      
      toast({
        variant: 'success',
        title: 'Negotiation Rejected',
        description: 'The negotiation has been rejected',
      })
      
      router.push('/dashboard/matches')
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.response?.data?.message || 'Failed to reject negotiation',
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!negotiation) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Negotiation not found</p>
      </div>
    )
  }

  const isBuyer = user?.role === 'BUYER'
  const isFarmer = user?.role === 'FARMER'
  const canMakeOffer = negotiation.status === 'ACTIVE'
  const isAccepted = negotiation.status === 'ACCEPTED'

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-emerald-600 bg-clip-text text-transparent">
            Negotiation
          </h1>
          <p className="text-muted-foreground mt-1">
            {negotiation.match.listing.cropType} - {negotiation.match.farmer.user.firstName}{' '}
            {negotiation.match.farmer.user.lastName} & {negotiation.match.buyer.user.firstName}{' '}
            {negotiation.match.buyer.user.lastName}
          </p>
        </div>
      </div>

      {/* Status Badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {negotiation.status === 'ACTIVE' && (
            <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
              <Clock className="h-3 w-3 mr-1" />
              Active
            </Badge>
          )}
        {negotiation.status === 'ACCEPTED' && (
          <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Accepted
          </Badge>
        )}
        {negotiation.status === 'REJECTED' && (
          <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
            <XCircle className="h-3 w-3 mr-1" />
            Rejected
          </Badge>
        )}
        </div>
        {negotiation.status === 'ACTIVE' && lastUpdated && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
            <span>Auto-updating every 10s</span>
            {lastUpdated && (
              <span className="text-xs">• Last updated: {formatDate(lastUpdated.toISOString())}</span>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Negotiation Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Current Terms */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Current Terms
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Price per Unit</p>
                  <p className="text-xl font-bold text-foreground">
                    {formatCurrency(negotiation.currentPrice, negotiation.currency)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Quantity</p>
                  <p className="text-xl font-bold text-foreground">
                    {negotiation.quantity.toFixed(2)} tons
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground">Total Value</p>
                  <p className="text-2xl font-bold text-emerald-400">
                    {formatCurrency(negotiation.currentPrice * negotiation.quantity, negotiation.currency)}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-border space-y-3">
                {negotiation.deliveryTerms ? (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Delivery Terms (Incoterms)</p>
                    <p className="text-foreground">{negotiation.deliveryTerms}</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Delivery Terms (Incoterms)</p>
                    <p className="text-sm text-muted-foreground italic">Not specified - Standard FOB Tema Port, Ghana</p>
                  </div>
                )}

                {negotiation.paymentTerms ? (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Payment Terms</p>
                    <p className="text-foreground">{negotiation.paymentTerms}</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Payment Terms</p>
                    <p className="text-sm text-muted-foreground italic">Not specified - Standard: 30% advance, 70% on delivery</p>
                  </div>
                )}

                <div>
                  <p className="text-sm text-muted-foreground mb-1">Currency</p>
                  <p className="text-foreground font-medium">{negotiation.currency}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quality Specifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Quality Specifications
              </CardTitle>
              <CardDescription>
                Product quality standards and certifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Quality Grade</p>
                  <Badge variant="outline" className="text-sm">
                    {negotiation.match.listing.qualityGrade || 'STANDARD'}
                  </Badge>
                </div>
                {negotiation.match.listing.cropVariety && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Variety</p>
                    <p className="text-foreground font-medium">{negotiation.match.listing.cropVariety}</p>
                  </div>
                )}
              </div>

              {(negotiation.match.listing.certifications && negotiation.match.listing.certifications.length > 0) ||
              (negotiation.match.farmer.certifications && negotiation.match.farmer.certifications.length > 0) ? (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Certifications</p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      ...(negotiation.match.listing.certifications || []),
                      ...(negotiation.match.farmer.certifications || []),
                    ]
                      .filter((cert, index, self) => self.indexOf(cert) === index)
                      .map((cert, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {cert}
                        </Badge>
                      ))}
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Certifications</p>
                  <p className="text-sm text-muted-foreground italic">No certifications specified</p>
                </div>
              )}

              {negotiation.match.listing.harvestDate && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Harvest Date</p>
                  <p className="text-foreground">{formatDate(negotiation.match.listing.harvestDate)}</p>
                </div>
              )}

              <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <div className="flex items-start gap-2">
                  <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <div className="text-xs text-foreground">
                    <p className="font-medium mb-1">Quality Assurance:</p>
                    <p className="text-muted-foreground">
                      All products meet international quality standards. Quality certificates will be provided upon shipment.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Offers Timeline */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Negotiation History
                  {newOffersCount > 0 && (
                    <Badge variant="default" className="ml-2 bg-emerald-500">
                      {newOffersCount} new
                    </Badge>
                  )}
                </CardTitle>
                {negotiation.status === 'ACTIVE' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      fetchNegotiation(false)
                      setNewOffersCount(0)
                    }}
                    className="text-xs"
                  >
                    Refresh
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {negotiation.offers.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No offers yet</p>
                ) : (
                  negotiation.offers.map((offer, idx) => (
                    <div
                      key={offer.id}
                      className={`p-4 rounded-lg border ${
                        offer.offeredBy === user?.id
                          ? 'bg-emerald-500/10 border-emerald-500/30 ml-8'
                          : 'bg-card/50 border-border mr-8'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium text-foreground">
                            {offer.offeredByRole === 'BUYER' ? 'Buyer' : 'Farmer'}
                          </span>
                        </div>
                        <Badge
                          className={
                            offer.status === 'ACCEPTED'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : offer.status === 'REJECTED'
                              ? 'bg-red-500/20 text-red-400'
                              : 'bg-amber-500/20 text-amber-400'
                          }
                        >
                          {offer.status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4 mb-2">
                        <div>
                          <p className="text-xs text-muted-foreground">Price</p>
                          <p className="font-semibold text-foreground">
                            {formatCurrency(offer.price, offer.currency)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Quantity</p>
                          <p className="font-semibold text-foreground">{offer.quantity.toFixed(2)} tons</p>
                        </div>
                      </div>
                      {offer.message && (
                        <p className="text-sm text-foreground mt-2">{offer.message}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-2">
                        {formatDate(offer.createdAt)}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Make Offer Form */}
          {canMakeOffer && (
            <Card>
              <CardHeader>
                <CardTitle>Make an Offer</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">
                      Price per Unit ({negotiation.currency})
                    </Label>
                    <Input
                      id="price"
                      type="number"
                      value={offerPrice}
                      onChange={(e) => setOfferPrice(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="quantity">
                      Quantity (tons)
                    </Label>
                    <Input
                      id="quantity"
                      type="number"
                      value={offerQuantity}
                      onChange={(e) => setOfferQuantity(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">
                    Message (Optional)
                  </Label>
                  <textarea
                    id="message"
                    value={offerMessage}
                    onChange={(e) => setOfferMessage(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    rows={3}
                    placeholder="Add any additional terms or notes..."
                  />
                </div>
                <Button
                  onClick={submitOffer}
                  disabled={submitting}
                  className="w-full bg-emerald-600 hover:bg-emerald-700"
                >
                  {submitting ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Submitting...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Send className="h-4 w-4" />
                      Submit Offer
                    </span>
                  )}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar Actions */}
        <div className="space-y-6">
          {isAccepted && (
            <Card className="bg-emerald-500/10 border-emerald-500/30">
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto" />
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">
                      Negotiation Accepted!
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Proceed to payment to complete the transaction
                    </p>
                  </div>
                  <Button
                    onClick={() => router.push(`/dashboard/transactions/${negotiation.id}/payment`)}
                    className="w-full bg-emerald-600 hover:bg-emerald-700"
                  >
                    Proceed to Payment
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Trade Terms & Compliance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Trade Terms & Compliance
              </CardTitle>
              <CardDescription>
                International trade standards and requirements
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <Shield className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-foreground">Export Compliance</p>
                    <p className="text-muted-foreground text-xs mt-0.5">
                      Ghana Single Window verified suppliers ensure compliance with international export standards
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <FileText className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-foreground">Required Documents</p>
                    <p className="text-muted-foreground text-xs mt-0.5">
                      Certificate of Origin, Phytosanitary Certificate, Quality Certificate, Commercial Invoice, Packing List
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Package className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-foreground">Origin</p>
                    <p className="text-muted-foreground text-xs mt-0.5">
                      {negotiation.match.farmer.region && negotiation.match.farmer.district
                        ? `${negotiation.match.farmer.district}, ${negotiation.match.farmer.region}, Ghana`
                        : 'Ghana'}
                    </p>
                  </div>
                </div>
                {negotiation.match.buyer.countryName && (
                  <div className="flex items-start gap-2">
                    <Globe className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-foreground">Destination</p>
                      <p className="text-muted-foreground text-xs mt-0.5">
                        {negotiation.match.buyer.countryName}
                        {negotiation.match.buyer.country && ` (${negotiation.match.buyer.country})`}
                      </p>
                    </div>
                  </div>
                )}
                <div className="flex items-start gap-2">
                  <Info className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-foreground">Standard Terms</p>
                    <p className="text-muted-foreground text-xs mt-0.5">
                      All transactions subject to international trade laws, Ghana export regulations, and destination country import requirements
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {canMakeOffer && (
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={handleAcceptClick}
                  disabled={submitting}
                  className="w-full bg-emerald-600 hover:bg-emerald-700"
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Accept Deal
                </Button>
                <Button
                  onClick={handleRejectClick}
                  disabled={submitting}
                  variant="outline"
                  className="w-full border-red-500/50 text-red-400 hover:bg-red-500/10"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Accept Confirmation Dialog */}
      <Dialog open={showAcceptDialog} onOpenChange={setShowAcceptDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              Accept Negotiation
            </DialogTitle>
            <DialogDescription>
              Please review the terms before accepting this deal
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-4 bg-muted/50 rounded-lg space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Product:</span>
                <span className="font-medium text-foreground">
                  {negotiation.match.listing.cropType}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Quantity:</span>
                <span className="font-medium text-foreground">
                  {negotiation.quantity.toFixed(2)} tons
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Price per Unit:</span>
                <span className="font-medium text-foreground">
                  {formatCurrency(negotiation.currentPrice, negotiation.currency)}
                </span>
              </div>
              <div className="flex justify-between text-sm pt-2 border-t border-border">
                <span className="text-muted-foreground">Total Value:</span>
                <span className="font-bold text-emerald-500 text-base">
                  {formatCurrency(negotiation.currentPrice * negotiation.quantity, negotiation.currency)}
                </span>
              </div>
            </div>
            <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-foreground">
                  <p className="font-medium mb-1">Important:</p>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Accepting will create a binding transaction</li>
                    <li>You will be redirected to payment processing</li>
                    <li>All terms and conditions will apply</li>
                    <li>Export documentation will be required</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowAcceptDialog(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              onClick={acceptNegotiation}
              disabled={submitting}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {submitting ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Accepting...
                </span>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Confirm Acceptance
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Confirmation Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-500" />
              Reject Negotiation
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to reject this negotiation?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-4 bg-muted/50 rounded-lg space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Product:</span>
                <span className="font-medium text-foreground">
                  {negotiation.match.listing.cropType}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Value:</span>
                <span className="font-medium text-foreground">
                  {formatCurrency(negotiation.currentPrice * negotiation.quantity, negotiation.currency)}
                </span>
              </div>
            </div>
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-foreground">
                  <p className="font-medium mb-1">Note:</p>
                  <p className="text-muted-foreground">
                    Rejecting this negotiation will end the deal. You can start a new negotiation later if needed.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowRejectDialog(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              onClick={rejectNegotiation}
              disabled={submitting}
              variant="destructive"
            >
              {submitting ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Rejecting...
                </span>
              ) : (
                <>
                  <XCircle className="h-4 w-4 mr-2" />
                  Confirm Rejection
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

