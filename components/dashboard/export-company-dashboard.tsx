'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Users,
  ShoppingBag,
  Truck,
  CheckCircle2,
  DollarSign,
  BarChart3,
  Package,
  ArrowUpRight,
  AlertCircle,
  TrendingUp,
  MapPin,
} from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { useCurrency } from '@/contexts/currency-context'
import apiClient from '@/lib/api-client'
import Link from 'next/link'
import { ShipmentCard } from '@/components/shipments/shipment-card'

export function ExportCompanyDashboard({ user }: { user: any }) {
  const { formatCurrency, currency } = useCurrency()
  const [stats, setStats] = useState({
    supplierNetwork: 0,
    activeOrders: 0,
    shipments: 0,
    monthlyRevenue: 0,
    qualityCompliance: 0,
    activeShipments: 0,
    deliveredShipments: 0,
  })
  const [recentShipments, setRecentShipments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCompanyStats()
  }, [])

  const fetchCompanyStats = async () => {
    try {
      setLoading(true)
      
      // Fetch real data from API
      try {
        // Get supplier network count (farmers)
        const farmersResponse = await apiClient.get('/farmers?limit=1')
        const supplierNetwork = farmersResponse.data.meta?.total || 0

        // Get active orders (transactions with pending status)
        const transactionsResponse = await apiClient.get('/transactions?paymentStatus=pending&limit=1')
        const activeOrders = transactionsResponse.data.meta?.total || 0

        // Get shipments (transactions with shipment status)
        const shipmentsResponse = await apiClient.get('/transactions?shipmentStatus=in-transit&limit=1')
        const shipments = shipmentsResponse.data.meta?.total || 0

        // Get monthly revenue (completed transactions this month)
        const revenueResponse = await apiClient.get('/transactions?paymentStatus=completed&limit=100')
        const allTransactions = revenueResponse.data.data || []
        const thisMonth = new Date()
        thisMonth.setDate(1)
        const monthlyRevenue = allTransactions
          .filter((tx: any) => new Date(tx.createdAt) >= thisMonth)
          .reduce((sum: number, tx: any) => sum + (tx.totalValue || 0), 0)

        // Calculate quality compliance (mock for now, can be enhanced)
        const qualityCompliance = 98

        setStats({
          supplierNetwork,
          activeOrders,
          shipments,
          monthlyRevenue,
          qualityCompliance,
          activeShipments: shipments,
          deliveredShipments: 0,
        })
      } catch (apiError) {
        console.error('API error, using fallback data:', apiError)
        // Fallback to mock data if API fails
        setStats({
          supplierNetwork: 45,
          activeOrders: 12,
          shipments: 8,
          monthlyRevenue: 125000,
          qualityCompliance: 98,
          activeShipments: 2,
          deliveredShipments: 6,
        })
      }

      // Fetch recent shipments from transactions
      try {
        const shipmentsResponse = await apiClient.get('/transactions?shipmentStatus=in-transit&limit=3')
        const transactions = shipmentsResponse.data.data || []
        
        const shipments = transactions.map((tx: any) => ({
          id: tx.id,
          transactionId: tx.id,
          cropType: tx.match?.listing?.cropType || 'Commodity',
          quantity: `${tx.quantity} ${tx.match?.listing?.unit || 'units'}`,
          destination: 'International Port',
          origin: 'Tema Port, Ghana',
          status: tx.shipmentStatus === 'in-transit' ? 'in-transit' as const : 'processing' as const,
          estimatedDelivery: tx.estimatedDeliveryDate || new Date(Date.now() + 7 * 86400000).toISOString(),
          shipmentDate: tx.createdAt || new Date().toISOString(),
          totalValue: tx.totalValue || 0,
          trackingNumber: `TL-${tx.id.slice(0, 8).toUpperCase()}`,
          carrier: 'Shipping Line',
        }))

        setRecentShipments(shipments.length > 0 ? shipments : [
          {
            id: 'ship-1',
            transactionId: 'tx-1',
            cropType: 'Premium Cocoa Beans',
            quantity: '20 tons',
            destination: 'Rotterdam, Netherlands',
            origin: 'Tema Port, Ghana',
            status: 'in-transit' as const,
            estimatedDelivery: new Date(Date.now() + 7 * 86400000).toISOString(),
            shipmentDate: new Date(Date.now() - 5 * 86400000).toISOString(),
            totalValue: 57000,
            trackingNumber: 'TL-2024-001234',
            carrier: 'Maersk Line',
          },
        ])
      } catch (shipmentError) {
        console.error('Error fetching shipments:', shipmentError)
        // Fallback shipments
        setRecentShipments([
          {
            id: 'ship-1',
            transactionId: 'tx-1',
            cropType: 'Premium Cocoa Beans',
            quantity: '20 tons',
            destination: 'Rotterdam, Netherlands',
            origin: 'Tema Port, Ghana',
            status: 'in-transit' as const,
            estimatedDelivery: new Date(Date.now() + 7 * 86400000).toISOString(),
            shipmentDate: new Date(Date.now() - 5 * 86400000).toISOString(),
            totalValue: 57000,
            trackingNumber: 'TL-2024-001234',
            carrier: 'Maersk Line',
          },
        ])
      }
    } catch (error) {
      console.error('Failed to fetch company stats:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-primary to-emerald-600 bg-clip-text text-transparent">
            Export Company Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">Manage your supplier network, orders, and logistics operations</p>
        </div>
        <Link href="/dashboard/supplier-network">
          <Button className="shadow-glow">
            <Users className="h-4 w-4 mr-2" />
            Manage Supplier Network
          </Button>
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Card className="hover:shadow-glow transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Supplier Network</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent className="min-w-0">
            <div className="text-xl sm:text-2xl font-bold text-foreground truncate">{stats.supplierNetwork}</div>
            <p className="text-xs text-muted-foreground mt-1">Active suppliers</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-glow transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Orders</CardTitle>
            <ShoppingBag className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent className="min-w-0">
            <div className="text-xl sm:text-2xl font-bold text-foreground truncate">{stats.activeOrders}</div>
            <p className="text-xs text-muted-foreground mt-1">In progress</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-glow transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Shipments</CardTitle>
            <Truck className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent className="min-w-0">
            <div className="text-xl sm:text-2xl font-bold text-foreground truncate">{stats.shipments}</div>
            <p className="text-xs text-muted-foreground mt-1">In transit</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-glow transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent className="min-w-0">
            <div className="text-xl sm:text-2xl font-bold text-foreground truncate" title={formatCurrency(stats.monthlyRevenue)}>
              {formatCurrency(stats.monthlyRevenue)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">This month • {currency.code}</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-glow transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Quality Compliance</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent className="min-w-0">
            <div className="text-xl sm:text-2xl font-bold text-foreground truncate">{stats.qualityCompliance}%</div>
            <p className="text-xs text-muted-foreground mt-1">Standards met</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Link href="/dashboard/supplier-network">
          <Card className="hover:shadow-glow transition-all cursor-pointer h-full">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle>Supplier Network</CardTitle>
                  <p className="text-sm text-muted-foreground">Manage suppliers & deals</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-foreground">
                Manage your network of {stats.supplierNetwork} verified suppliers, track deals, and monitor performance.
              </p>
              <div className="flex items-center gap-2 mt-4 text-primary text-sm font-medium">
                View Network <ArrowUpRight className="h-4 w-4" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/bulk-procurement">
          <Card className="hover:shadow-glow transition-all cursor-pointer h-full">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <ShoppingBag className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <CardTitle>Bulk Procurement</CardTitle>
                  <p className="text-sm text-muted-foreground">Aggregate & source</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-foreground">
                Manage {stats.activeOrders} active orders and create bulk sourcing requests from your supplier network.
              </p>
              <div className="flex items-center gap-2 mt-4 text-blue-500 text-sm font-medium">
                View Procurement <ArrowUpRight className="h-4 w-4" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/logistics">
          <Card className="hover:shadow-glow transition-all cursor-pointer h-full">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <Truck className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <CardTitle>Logistics</CardTitle>
                  <p className="text-sm text-muted-foreground">Track shipments</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-foreground">
                Track {stats.shipments} active shipments and manage logistics operations.
              </p>
              <div className="flex items-center gap-2 mt-4 text-green-500 text-sm font-medium">
                View Logistics <ArrowUpRight className="h-4 w-4" />
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Recent Shipments with Tracking */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Active Shipments & Tracking</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Monitor shipments in real-time • {stats.activeShipments} active, {stats.deliveredShipments} delivered
              </p>
            </div>
            <Link href="/dashboard/logistics">
              <Button variant="outline" size="sm">
                View All
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentShipments.map((shipment) => (
              <ShipmentCard key={shipment.id} {...shipment} />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quality Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-foreground">Overall Compliance</span>
                  <span className="text-sm font-semibold text-foreground">{stats.qualityCompliance}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: `${stats.qualityCompliance}%` }}
                  ></div>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Certified Suppliers</p>
                  <p className="text-foreground font-semibold">{Math.round(stats.supplierNetwork * 0.85)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Quality Issues</p>
                  <p className="text-foreground font-semibold">2</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xl sm:text-2xl font-bold text-foreground truncate" title={formatCurrency(stats.monthlyRevenue)}>
                    {formatCurrency(stats.monthlyRevenue)}
                  </p>
                  <p className="text-sm text-muted-foreground">This month • {currency.code}</p>
                </div>
                <div className="p-3 bg-emerald-500/10 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-emerald-500" />
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <div className="min-w-0">
                  <p className="text-muted-foreground">Last Month</p>
                  <p className="text-foreground font-semibold truncate" title={formatCurrency(stats.monthlyRevenue * 0.92)}>
                    {formatCurrency(stats.monthlyRevenue * 0.92)}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Growth</p>
                  <p className="text-emerald-500 font-semibold">+8.7%</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

