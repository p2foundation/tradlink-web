'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Truck, Package, CheckCircle2, Clock, MapPin, ArrowRight } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { useCurrency } from '@/contexts/currency-context'
import Link from 'next/link'

export type ShipmentStatus = 'pending' | 'processing' | 'in-transit' | 'delivered' | 'cancelled'

export interface ShipmentCardProps {
  id: string
  transactionId: string
  cropType: string
  quantity: string
  destination?: string
  origin?: string
  status: ShipmentStatus
  estimatedDelivery?: string
  shipmentDate?: string
  deliveryDate?: string
  totalValue?: number
  trackingNumber?: string
  carrier?: string
}

const statusConfig: Record<ShipmentStatus, { label: string; variant: 'default' | 'secondary' | 'warning' | 'success' | 'outline' | 'destructive'; icon: any; color: string }> = {
  'pending': {
    label: 'Pending',
    variant: 'outline',
    icon: Clock,
    color: 'text-gray-400',
  },
  'processing': {
    label: 'Processing',
    variant: 'warning',
    icon: Package,
    color: 'text-yellow-500',
  },
  'in-transit': {
    label: 'In Transit',
    variant: 'secondary',
    icon: Truck,
    color: 'text-blue-500',
  },
  'delivered': {
    label: 'Delivered',
    variant: 'success',
    icon: CheckCircle2,
    color: 'text-green-500',
  },
  'cancelled': {
    label: 'Cancelled',
    variant: 'destructive',
    icon: Clock,
    color: 'text-red-500',
  },
}

export function ShipmentCard({
  id,
  transactionId,
  cropType,
  quantity,
  destination,
  origin,
  status,
  estimatedDelivery,
  shipmentDate,
  deliveryDate,
  totalValue,
  trackingNumber,
  carrier,
}: ShipmentCardProps) {
  const { formatCurrency } = useCurrency()
  const config = statusConfig[status] || statusConfig.pending
  const Icon = config.icon

  return (
    <Card className="bg-slate-900 border-white/10 hover:shadow-glow transition-all">
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4 flex-1">
            <div className={`p-3 rounded-lg ${
              status === 'delivered' ? 'bg-green-500/10' :
              status === 'in-transit' ? 'bg-blue-500/10' :
              status === 'processing' ? 'bg-yellow-500/10' :
              status === 'cancelled' ? 'bg-red-500/10' :
              'bg-gray-500/10'
            }`}>
              <Icon className={`h-5 w-5 ${config.color}`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="font-semibold text-lg text-white truncate">{cropType}</h3>
                <Badge variant={config.variant} className="text-xs whitespace-nowrap">
                  {config.label}
                </Badge>
              </div>
              <div className="space-y-1 text-sm text-gray-400">
                <p>
                  <span className="font-medium text-white">Quantity:</span> {quantity}
                </p>
                {origin && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    <span>
                      <span className="font-medium text-white">From:</span> {origin}
                    </span>
                  </div>
                )}
                {destination && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    <span>
                      <span className="font-medium text-white">To:</span> {destination}
                    </span>
                  </div>
                )}
                {trackingNumber && (
                  <p>
                    <span className="font-medium text-white">Tracking:</span>{' '}
                    <span className="font-mono text-xs">{trackingNumber}</span>
                  </p>
                )}
                {carrier && (
                  <p>
                    <span className="font-medium text-white">Carrier:</span> {carrier}
                  </p>
                )}
                {shipmentDate && (
                  <p>
                    <span className="font-medium text-white">Shipped:</span> {formatDate(shipmentDate)}
                  </p>
                )}
                {estimatedDelivery && !deliveryDate && (
                  <p>
                    <span className="font-medium text-white">ETA:</span> {formatDate(estimatedDelivery)}
                  </p>
                )}
                {deliveryDate && (
                  <p>
                    <span className="font-medium text-white">Delivered:</span> {formatDate(deliveryDate)}
                  </p>
                )}
              </div>
              {totalValue && (
                <p className="text-sm font-semibold text-emerald-400 mt-2">
                  {formatCurrency(totalValue)}
                </p>
              )}
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Link href={`/dashboard/transactions/${transactionId}`}>
              <Button variant="outline" size="sm" className="whitespace-nowrap">
                Track
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

