'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
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
      pricePerUnit: number
    }
    farmer: {
      user: {
        firstName: string
        lastName: string
      }
    }
    buyer: {
      user: {
        firstName: string
        lastName: string
      }
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

  const fetchNegotiation = async () => {
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
      setLoading(true)
      
      // First, try to fetch existing negotiations
      const response = await apiClient.get(`/negotiations?matchId=${matchId}`)
      
      // Handle different response formats (array or object with data property)
      const negotiations = response.data?.data || response.data || []
      
      if (negotiations.length > 0) {
        // Negotiation found
        const negotiation = negotiations[0]
        setNegotiation(negotiation)
        setOfferPrice(negotiation.currentPrice.toString())
        setOfferQuantity(negotiation.quantity.toString())
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
      setLoading(false)
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

  const acceptNegotiation = async () => {
    if (!negotiation) return

    try {
      setSubmitting(true)
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

  const rejectNegotiation = async () => {
    if (!negotiation) return

    if (!confirm('Are you sure you want to reject this negotiation?')) return

    try {
      setSubmitting(true)
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
        <p className="text-gray-400">Negotiation not found</p>
      </div>
    )
  }

  const isBuyer = user?.role === 'BUYER'
  const isFarmer = user?.role === 'FARMER'
  const canMakeOffer = negotiation.status === 'ACTIVE'
  const isAccepted = negotiation.status === 'ACCEPTED'

  return (
    <div className="space-y-6 text-slate-100">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="text-slate-300"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-emerald-600 bg-clip-text text-transparent">
            Negotiation
          </h1>
          <p className="text-gray-400 mt-1">
            {negotiation.match.listing.cropType} - {negotiation.match.farmer.user.firstName}{' '}
            {negotiation.match.farmer.user.lastName} & {negotiation.match.buyer.user.firstName}{' '}
            {negotiation.match.buyer.user.lastName}
          </p>
        </div>
      </div>

      {/* Status Badge */}
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Negotiation Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Current Terms */}
          <Card className="bg-slate-900 border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Current Terms
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-400">Price per Unit</p>
                  <p className="text-xl font-bold text-white">
                    {formatCurrency(negotiation.currentPrice, negotiation.currency)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Quantity</p>
                  <p className="text-xl font-bold text-white">
                    {negotiation.quantity} tons
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-400">Total Value</p>
                  <p className="text-2xl font-bold text-emerald-400">
                    {formatCurrency(negotiation.currentPrice * negotiation.quantity, negotiation.currency)}
                  </p>
                </div>
              </div>

              {negotiation.deliveryTerms && (
                <div className="pt-4 border-t border-slate-800">
                  <p className="text-sm text-gray-400 mb-1">Delivery Terms</p>
                  <p className="text-slate-200">{negotiation.deliveryTerms}</p>
                </div>
              )}

              {negotiation.paymentTerms && (
                <div>
                  <p className="text-sm text-gray-400 mb-1">Payment Terms</p>
                  <p className="text-slate-200">{negotiation.paymentTerms}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Offers Timeline */}
          <Card className="bg-slate-900 border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Negotiation History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {negotiation.offers.length === 0 ? (
                  <p className="text-gray-400 text-center py-8">No offers yet</p>
                ) : (
                  negotiation.offers.map((offer, idx) => (
                    <div
                      key={offer.id}
                      className={`p-4 rounded-lg border ${
                        offer.offeredBy === user?.id
                          ? 'bg-emerald-500/10 border-emerald-500/30 ml-8'
                          : 'bg-slate-800 border-slate-700 mr-8'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <span className="font-medium text-slate-200">
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
                          <p className="text-xs text-gray-400">Price</p>
                          <p className="font-semibold text-white">
                            {formatCurrency(offer.price, offer.currency)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">Quantity</p>
                          <p className="font-semibold text-white">{offer.quantity} tons</p>
                        </div>
                      </div>
                      {offer.message && (
                        <p className="text-sm text-gray-300 mt-2">{offer.message}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-2">
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
            <Card className="bg-slate-900 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Make an Offer</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price" className="text-slate-200">
                      Price per Unit ({negotiation.currency})
                    </Label>
                    <Input
                      id="price"
                      type="number"
                      value={offerPrice}
                      onChange={(e) => setOfferPrice(e.target.value)}
                      className="bg-slate-800 border-slate-700 text-slate-100"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="quantity" className="text-slate-200">
                      Quantity (tons)
                    </Label>
                    <Input
                      id="quantity"
                      type="number"
                      value={offerQuantity}
                      onChange={(e) => setOfferQuantity(e.target.value)}
                      className="bg-slate-800 border-slate-700 text-slate-100"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message" className="text-slate-200">
                    Message (Optional)
                  </Label>
                  <textarea
                    id="message"
                    value={offerMessage}
                    onChange={(e) => setOfferMessage(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 resize-none"
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
            <Card className="bg-emerald-900/20 border-emerald-500/30">
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <CheckCircle2 className="h-12 w-12 text-emerald-400 mx-auto" />
                  <div>
                    <h3 className="font-semibold text-emerald-300 mb-2">
                      Negotiation Accepted!
                    </h3>
                    <p className="text-sm text-emerald-200/70">
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

          {canMakeOffer && (
            <Card className="bg-slate-900 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={acceptNegotiation}
                  disabled={submitting}
                  className="w-full bg-emerald-600 hover:bg-emerald-700"
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Accept Deal
                </Button>
                <Button
                  onClick={rejectNegotiation}
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
    </div>
  )
}

