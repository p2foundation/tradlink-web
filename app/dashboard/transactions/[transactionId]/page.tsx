'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  ArrowLeft,
  FileText,
  DollarSign,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  User,
  Calendar,
  CreditCard,
  AlertCircle,
  RefreshCw,
} from 'lucide-react'
import apiClient from '@/lib/api-client'
import { useToast } from '@/hooks/use-toast'
import { formatDate } from '@/lib/utils'
import { useCurrency } from '@/contexts/currency-context'
import Link from 'next/link'

interface TrackingEvent {
  id: string
  status: 'pending' | 'processing' | 'in-transit' | 'delivered' | 'issue'
  timestamp: string
  location?: string
  description: string
}

export default function TransactionDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const { formatCurrency } = useCurrency()
  const transactionId = params.transactionId as string
  const [transaction, setTransaction] = useState<any>(null)
  const [payment, setPayment] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [trackingEvents, setTrackingEvents] = useState<TrackingEvent[]>([])

  useEffect(() => {
    fetchTransactionData()
    // Set up polling for real-time updates
    const interval = setInterval(fetchTransactionData, 30000) // Poll every 30 seconds
    return () => clearInterval(interval)
  }, [transactionId])

  const fetchTransactionData = async () => {
    try {
      setLoading(true)
      const [txnResponse, paymentsResponse] = await Promise.all([
        apiClient.get(`/transactions/${transactionId}`).catch(() => ({ data: null })),
        apiClient.get(`/payments?transactionId=${transactionId}`).catch(() => ({ data: [] })),
      ])

      if (txnResponse.data) {
        setTransaction(txnResponse.data)
        
        // Generate tracking events based on transaction status
        const events: TrackingEvent[] = []
        const status = txnResponse.data.shipmentStatus?.toLowerCase() || 'pending'
        
        if (txnResponse.data.createdAt) {
          events.push({
            id: '1',
            status: 'pending',
            timestamp: txnResponse.data.createdAt,
            location: 'Ghana',
            description: 'Transaction created and order confirmed',
          })
        }

        if (txnResponse.data.paymentDate || txnResponse.data.paymentStatus === 'paid') {
          events.push({
            id: '2',
            status: 'processing',
            timestamp: txnResponse.data.paymentDate || txnResponse.data.createdAt,
            location: 'Ghana',
            description: 'Payment received and verified',
          })
        }

        if (txnResponse.data.shipmentDate) {
          events.push({
            id: '3',
            status: 'in-transit',
            timestamp: txnResponse.data.shipmentDate,
            location: 'Tema Port, Ghana',
            description: 'Shipment dispatched from port',
          })
        }

        if (status === 'delivered' && txnResponse.data.deliveryDate) {
          events.push({
            id: '4',
            status: 'delivered',
            timestamp: txnResponse.data.deliveryDate,
            location: txnResponse.data.buyer?.country || 'Destination',
            description: 'Shipment delivered successfully',
          })
        } else if (status === 'in-transit' || status === 'shipped') {
          events.push({
            id: '4',
            status: 'in-transit',
            timestamp: txnResponse.data.shipmentDate || new Date().toISOString(),
            location: 'In Transit',
            description: 'Shipment is on the way to destination',
          })
        }

        setTrackingEvents(events)
      }

      if (paymentsResponse.data && paymentsResponse.data.length > 0) {
        setPayment(paymentsResponse.data[0])
      }
    } catch (error: any) {
      console.error('Failed to fetch transaction:', error)
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.response?.data?.message || 'Failed to load transaction details',
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const key = status?.toLowerCase() || 'pending'
    if (['completed', 'paid', 'delivered'].includes(key)) {
      return (
        <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          {status}
        </Badge>
      )
    }
    if (['pending', 'processing'].includes(key)) {
      return (
        <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
          <Clock className="h-3 w-3 mr-1" />
          {status}
        </Badge>
      )
    }
    if (['in-transit', 'shipped'].includes(key)) {
      return (
        <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
          <Truck className="h-3 w-3 mr-1" />
          {status}
        </Badge>
      )
    }
    return (
      <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
        <AlertCircle className="h-3 w-3 mr-1" />
        {status || 'Unknown'}
      </Badge>
    )
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  if (!transaction) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => router.back()} className="text-slate-300">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="text-center py-12">
          <AlertCircle className="h-16 w-16 mx-auto text-gray-500 mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Transaction Not Found</h3>
          <p className="text-gray-400 mb-6">The transaction you're looking for doesn't exist or has been removed.</p>
          <Link href="/dashboard/transactions">
            <Button>View All Transactions</Button>
          </Link>
        </div>
      </div>
    )
  }

  const isPaid = transaction.paymentStatus === 'paid' || payment?.paymentStatus === 'COMPLETED'
  const shipmentStatus = transaction.shipmentStatus?.toLowerCase() || 'pending'

  return (
    <div className="space-y-6 text-slate-100">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.back()} className="text-slate-300">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-emerald-600 bg-clip-text text-transparent">
            Transaction Details
          </h1>
          <p className="text-gray-400 mt-1">Transaction #{transaction.id.slice(0, 8).toUpperCase()}</p>
        </div>
        <Button variant="outline" onClick={fetchTransactionData} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Transaction Overview */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="bg-slate-900 border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Transaction Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-400">Product</p>
                <p className="font-semibold text-white mt-1">
                  {transaction.match?.listing?.cropType || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Quantity</p>
                <p className="font-semibold text-white mt-1">
                  {transaction.quantity} {transaction.match?.listing?.unit || 'units'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Price per Unit</p>
                <p className="font-semibold text-white mt-1">
                  {formatCurrency(transaction.agreedPrice)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Total Value</p>
                <p className="font-semibold text-emerald-400 mt-1">
                  {formatCurrency(transaction.totalValue)}
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-700 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Payment Status</span>
                {getStatusBadge(transaction.paymentStatus)}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Shipment Status</span>
                {getStatusBadge(transaction.shipmentStatus)}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Transaction Date</span>
                <span className="text-sm text-white">{formatDate(transaction.createdAt)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <User className="h-5 w-5" />
              Parties Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {transaction.match?.farmer && (
              <div>
                <p className="text-sm text-gray-400 mb-2">Farmer/Supplier</p>
                <div className="p-3 bg-slate-800/50 rounded-lg">
                  <p className="font-semibold text-white">
                    {transaction.match.farmer.user?.firstName} {transaction.match.farmer.user?.lastName}
                  </p>
                  {transaction.match.farmer.location && (
                    <p className="text-sm text-gray-400 mt-1 flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {transaction.match.farmer.location}, {transaction.match.farmer.region}
                    </p>
                  )}
                </div>
              </div>
            )}

            {transaction.buyer && (
              <div>
                <p className="text-sm text-gray-400 mb-2">Buyer</p>
                <div className="p-3 bg-slate-800/50 rounded-lg">
                  <p className="font-semibold text-white">
                    {transaction.buyer.user?.firstName} {transaction.buyer.user?.lastName}
                  </p>
                  {transaction.buyer.companyName && (
                    <p className="text-sm text-gray-400 mt-1">{transaction.buyer.companyName}</p>
                  )}
                  {transaction.buyer.country && (
                    <p className="text-sm text-gray-400 mt-1 flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {transaction.buyer.country}
                    </p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Payment Section */}
      <Card className="bg-slate-900 border-white/10">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment Information
            </CardTitle>
            {!isPaid && (
              <Link href={`/dashboard/transactions/${transactionId}/payment`}>
                <Button className="bg-emerald-600 hover:bg-emerald-700">
                  <DollarSign className="h-4 w-4 mr-2" />
                  Make Payment
                </Button>
              </Link>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {payment ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-400">Amount</p>
                  <p className="font-semibold text-white mt-1">{formatCurrency(payment.amount)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Method</p>
                  <p className="font-semibold text-white mt-1">{payment.paymentMethod}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Status</p>
                  <div className="mt-1">{getStatusBadge(payment.paymentStatus)}</div>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Date</p>
                  <p className="font-semibold text-white mt-1">
                    {formatDate(payment.paymentDate || payment.createdAt)}
                  </p>
                </div>
              </div>
              {payment.receiptNumber && (
                <div className="pt-3 border-t border-slate-700">
                  <p className="text-sm text-gray-400">Receipt Number</p>
                  <p className="font-mono text-sm text-white mt-1">{payment.receiptNumber}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <CreditCard className="h-12 w-12 mx-auto text-gray-500 mb-4" />
              <p className="text-gray-400 mb-4">No payment has been made for this transaction yet.</p>
              <Link href={`/dashboard/transactions/${transactionId}/payment`}>
                <Button className="bg-emerald-600 hover:bg-emerald-700">
                  <DollarSign className="h-4 w-4 mr-2" />
                  Make Payment
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Shipment Tracking */}
      <Card className="bg-slate-900 border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Shipment Tracking
          </CardTitle>
          <CardDescription className="text-gray-400">
            Real-time tracking information for your shipment
          </CardDescription>
        </CardHeader>
        <CardContent>
          {trackingEvents.length > 0 ? (
            <div className="space-y-6">
              {/* Current Status */}
              <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Current Status</p>
                    <p className="text-lg font-semibold text-white mt-1 capitalize">
                      {transaction.shipmentStatus || 'Pending'}
                    </p>
                  </div>
                  {transaction.deliveryDate ? (
                    <div className="text-right">
                      <p className="text-sm text-gray-400">Delivered</p>
                      <p className="text-sm font-semibold text-emerald-400 mt-1">
                        {formatDate(transaction.deliveryDate)}
                      </p>
                    </div>
                  ) : transaction.shipmentDate ? (
                    <div className="text-right">
                      <p className="text-sm text-gray-400">Shipped</p>
                      <p className="text-sm font-semibold text-blue-400 mt-1">
                        {formatDate(transaction.shipmentDate)}
                      </p>
                    </div>
                  ) : null}
                </div>
              </div>

              {/* Tracking Timeline */}
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-700"></div>
                <div className="space-y-6">
                  {trackingEvents.map((event, idx) => {
                    const isCompleted = ['delivered', 'in-transit'].includes(event.status)
                    const isActive = idx === trackingEvents.length - 1 && !isCompleted
                    
                    return (
                      <div key={event.id} className="relative flex items-start gap-4">
                        <div className="relative z-10 flex-shrink-0">
                          <div
                            className={`p-2 rounded-full ${
                              event.status === 'delivered'
                                ? 'bg-emerald-500/20 border-2 border-emerald-500'
                                : event.status === 'in-transit'
                                ? 'bg-blue-500/20 border-2 border-blue-500'
                                : event.status === 'processing'
                                ? 'bg-amber-500/20 border-2 border-amber-500'
                                : 'bg-slate-700/50 border-2 border-slate-600'
                            }`}
                          >
                            {event.status === 'delivered' ? (
                              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                            ) : event.status === 'in-transit' ? (
                              <Truck className="h-4 w-4 text-blue-400" />
                            ) : event.status === 'processing' ? (
                              <Package className="h-4 w-4 text-amber-400" />
                            ) : (
                              <Clock className="h-4 w-4 text-gray-400" />
                            )}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0 pb-6">
                          <div className="flex items-center justify-between mb-1">
                            <p className="font-medium text-white">{event.description}</p>
                            <p className="text-xs text-gray-500 whitespace-nowrap ml-4">
                              {formatDate(event.timestamp)}
                            </p>
                          </div>
                          {event.location && (
                            <p className="text-sm text-gray-400 flex items-center gap-1 mt-1">
                              <MapPin className="h-3 w-3" />
                              {event.location}
                            </p>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Tracking Number */}
              {transaction.gcmsReferenceNo && (
                <div className="pt-4 border-t border-slate-700">
                  <p className="text-sm text-gray-400 mb-2">Tracking Number</p>
                  <p className="font-mono text-sm text-white bg-slate-800/50 p-2 rounded">
                    {transaction.gcmsReferenceNo}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <Package className="h-12 w-12 mx-auto text-gray-500 mb-4" />
              <p className="text-gray-400">Shipment tracking information will appear here once the shipment is processed.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

