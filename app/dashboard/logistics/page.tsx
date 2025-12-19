'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Truck,
  Package,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Download,
} from 'lucide-react'
import apiClient from '@/lib/api-client'
import { formatDate } from '@/lib/utils'
import { useCurrency } from '@/contexts/currency-context'
import { useToast } from '@/hooks/use-toast'
import { ShipmentCard } from '@/components/shipments/shipment-card'
import { Skeleton } from '@/components/ui/skeleton'

type ShipmentStatus = 'pending' | 'processing' | 'in-transit' | 'delivered' | 'cancelled'

interface Shipment {
  id: string
  transactionId: string
  cropType: string
  quantity: string
  destination: string
  origin: string
  status: ShipmentStatus
  estimatedDelivery?: string
  deliveryDate?: string
  shipmentDate: string
  totalValue: number
  trackingNumber: string
  carrier: string
}

export default function LogisticsPage() {
  const { formatCurrency } = useCurrency()
  const { toast } = useToast()
  const [shipments, setShipments] = useState<Shipment[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<ShipmentStatus | 'ALL'>('ALL')
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  })

  useEffect(() => {
    // Reset to page 1 when filters change
    setPagination((prev) => ({ ...prev, page: 1 }))
  }, [statusFilter])

  useEffect(() => {
    fetchShipments()
  }, [statusFilter, pagination.page])

  const fetchShipments = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (statusFilter !== 'ALL') {
        params.append('shipmentStatus', statusFilter)
      }
      params.append('page', pagination.page.toString())
      params.append('limit', pagination.limit.toString())

      const response = await apiClient.get(`/transactions?${params.toString()}`)
      const transactions = response.data.data || []

      // Transform transactions into shipments
      const transformedShipments: Shipment[] = transactions.map((tx: any) => ({
        id: tx.id,
        transactionId: tx.id,
        cropType: tx.match?.listing?.cropType || 'Commodity',
        quantity: `${tx.quantity} ${tx.match?.listing?.unit || 'units'}`,
        destination: tx.destination || 'International Port',
        origin: tx.origin || 'Tema Port, Ghana',
        status: mapShipmentStatus(tx.shipmentStatus),
        estimatedDelivery: tx.estimatedDeliveryDate || undefined,
        deliveryDate: tx.deliveryDate || undefined,
        shipmentDate: tx.createdAt || new Date().toISOString(),
        totalValue: tx.totalValue || 0,
        trackingNumber: `TL-${tx.id.slice(0, 8).toUpperCase()}`,
        carrier: tx.carrier || 'Shipping Line',
      }))

      setShipments(transformedShipments)
      if (response.data.meta) {
        setPagination({
          page: response.data.meta.page || pagination.page,
          limit: response.data.meta.limit || pagination.limit,
          total: response.data.meta.total || 0,
          totalPages: response.data.meta.totalPages || 0,
        })
      }
    } catch (error: any) {
      console.error('Failed to fetch shipments:', error)
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.response?.data?.message || 'Failed to load shipments',
      })
    } finally {
      setLoading(false)
    }
  }

  const mapShipmentStatus = (status: string): ShipmentStatus => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'pending'
      case 'processing':
      case 'preparing':
        return 'processing'
      case 'in-transit':
      case 'in_transit':
      case 'shipped':
        return 'in-transit'
      case 'delivered':
      case 'completed':
        return 'delivered'
      case 'delayed':
        return 'processing' // Map delayed to processing for now
      case 'cancelled':
      case 'canceled':
        return 'cancelled'
      default:
        return 'pending'
    }
  }

  const getStatusBadge = (status: ShipmentStatus) => {
    const variants: Record<ShipmentStatus, { label: string; variant: 'default' | 'success' | 'destructive' | 'warning' | 'outline' }> = {
      pending: { label: 'Pending', variant: 'outline' },
      processing: { label: 'Processing', variant: 'default' },
      'in-transit': { label: 'In Transit', variant: 'default' },
      delivered: { label: 'Delivered', variant: 'success' },
      cancelled: { label: 'Cancelled', variant: 'destructive' },
    }
    const config = variants[status] || variants.pending
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const filteredShipments = shipments.filter((shipment) => {
    if (!search) return true
    const term = search.toLowerCase()
    return (
      shipment.trackingNumber.toLowerCase().includes(term) ||
      shipment.cropType.toLowerCase().includes(term) ||
      shipment.destination.toLowerCase().includes(term) ||
      shipment.carrier.toLowerCase().includes(term)
    )
  })

  const stats = {
    total: shipments.length,
    inTransit: shipments.filter((s) => s.status === 'in-transit').length,
    delivered: shipments.filter((s) => s.status === 'delivered').length,
    pending: shipments.filter((s) => s.status === 'pending' || s.status === 'processing').length,
  }

  if (loading && shipments.length === 0) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Logistics & Shipments</h1>
          <p className="text-muted-foreground mt-1">Track and manage all your shipments</p>
        </div>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Shipments</CardTitle>
            <Package className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.total}</div>
            <p className="text-xs text-muted-foreground mt-1">All shipments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">In Transit</CardTitle>
            <Truck className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.inTransit}</div>
            <p className="text-xs text-muted-foreground mt-1">Active shipments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Delivered</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.delivered}</div>
            <p className="text-xs text-muted-foreground mt-1">Completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.pending}</div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting processing</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by tracking number, crop, destination..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant={statusFilter === 'ALL' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('ALL')}
              >
                All
              </Button>
              <Button
                variant={statusFilter === 'pending' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('pending')}
              >
                Pending
              </Button>
              <Button
                variant={statusFilter === 'in-transit' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('in-transit')}
              >
                In Transit
              </Button>
              <Button
                variant={statusFilter === 'delivered' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('delivered')}
              >
                Delivered
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Shipments List */}
      <div className="space-y-4">
        {filteredShipments.length > 0 ? (
          filteredShipments.map((shipment) => (
            <ShipmentCard key={shipment.id} {...shipment} />
          ))
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <Truck className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No shipments found</p>
              <p className="text-sm text-muted-foreground/70 mt-2">
                {search || statusFilter !== 'ALL'
                  ? 'Try adjusting your search or filters'
                  : 'Shipments will appear here once transactions are created'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="text-sm text-muted-foreground">
            Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} shipments
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
    </div>
  )
}

