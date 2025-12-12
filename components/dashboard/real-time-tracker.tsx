'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Package, Truck, CheckCircle2, Clock, AlertCircle } from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface TrackingEvent {
  id: string
  status: 'pending' | 'processing' | 'in-transit' | 'delivered' | 'issue'
  timestamp: string
  location?: string
  description: string
}

interface TransactionTracker {
  id: string
  transactionNumber: string
  cropType: string
  quantity: number
  buyer: string
  currentStatus: string
  events: TrackingEvent[]
  estimatedDelivery?: string
}

export function RealTimeTracker({ transactionId }: { transactionId?: string }) {
  const [tracking, setTracking] = useState<TransactionTracker | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate real-time updates
    const interval = setInterval(() => {
      // In production, this would fetch from API
      setTracking({
        id: transactionId || '1',
        transactionNumber: 'TL-2024-001234',
        cropType: 'Premium Cocoa',
        quantity: 25,
        buyer: 'Switzerland Trading Co.',
        currentStatus: 'in-transit',
        estimatedDelivery: '2024-12-15',
        events: [
          {
            id: '1',
            status: 'delivered',
            timestamp: '2024-12-01T10:00:00Z',
            location: 'Kumasi Warehouse',
            description: 'Goods received and verified',
          },
          {
            id: '2',
            status: 'in-transit',
            timestamp: '2024-12-05T14:30:00Z',
            location: 'Tema Port',
            description: 'Container loaded, vessel departed',
          },
          {
            id: '3',
            status: 'processing',
            timestamp: '2024-12-10T09:15:00Z',
            location: 'Rotterdam Port',
            description: 'Customs clearance in progress',
          },
          {
            id: '4',
            status: 'pending',
            timestamp: '2024-12-12T11:00:00Z',
            location: 'Switzerland',
            description: 'Final delivery scheduled',
          },
        ],
      })
      setLoading(false)
    }, 1000)

    return () => clearInterval(interval)
  }, [transactionId])

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!tracking) return null

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />
      case 'in-transit':
        return <Truck className="h-5 w-5 text-blue-600" />
      case 'processing':
        return <Package className="h-5 w-5 text-yellow-600" />
      case 'pending':
        return <Clock className="h-5 w-5 text-gray-600" />
      default:
        return <AlertCircle className="h-5 w-5 text-red-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'success'
      case 'in-transit':
        return 'secondary'
      case 'processing':
        return 'warning'
      case 'pending':
        return 'default'
      default:
        return 'destructive'
    }
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Transaction Tracking</CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              {tracking.transactionNumber}
            </p>
          </div>
          <Badge variant={getStatusColor(tracking.currentStatus)}>
            {tracking.currentStatus.replace('-', ' ').toUpperCase()}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Transaction Info */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm text-gray-600">Crop Type</p>
              <p className="font-semibold">{tracking.cropType}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Quantity</p>
              <p className="font-semibold">{tracking.quantity} tons</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Buyer</p>
              <p className="font-semibold">{tracking.buyer}</p>
            </div>
            {tracking.estimatedDelivery && (
              <div>
                <p className="text-sm text-gray-600">Est. Delivery</p>
                <p className="font-semibold">
                  {formatDate(tracking.estimatedDelivery)}
                </p>
              </div>
            )}
          </div>

          {/* Timeline */}
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
            <div className="space-y-6">
              {tracking.events.map((event, idx) => (
                <div key={event.id} className="relative flex items-start space-x-4">
                  <div className="relative z-10 flex-shrink-0">
                    <div
                      className={`p-2 rounded-full ${
                        event.status === 'delivered'
                          ? 'bg-green-100'
                          : event.status === 'in-transit'
                          ? 'bg-blue-100'
                          : event.status === 'processing'
                          ? 'bg-yellow-100'
                          : 'bg-gray-100'
                      }`}
                    >
                      {getStatusIcon(event.status)}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sm">{event.description}</p>
                      <p className="text-xs text-gray-500">
                        {formatDate(event.timestamp)}
                      </p>
                    </div>
                    {event.location && (
                      <p className="text-sm text-gray-600 mt-1">
                        📍 {event.location}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

