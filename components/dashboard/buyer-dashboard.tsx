'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Users,
  Shield,
  TrendingUp,
  Handshake,
  FileText,
  CheckCircle2,
  Search,
  Globe,
  ArrowUpRight,
  Clock,
  AlertCircle,
  MessageSquareText,
  Truck,
  Package,
} from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { useCurrency } from '@/contexts/currency-context'
import apiClient from '@/lib/api-client'
import Link from 'next/link'
import { ShipmentCard } from '@/components/shipments/shipment-card'

export function BuyerDashboard({ user }: { user: any }) {
  const { formatCurrency, currency } = useCurrency()
  const [stats, setStats] = useState({
    verifiedSuppliers: 0,
    activeOrders: 0,
    qualityCompliance: 0,
    totalSpent: 0,
    pendingMatches: 0,
    activeShipments: 0,
    deliveredShipments: 0,
  })
  const [recentOrders, setRecentOrders] = useState<any[]>([])
  const [recentShipments, setRecentShipments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBuyerStats()
  }, [])

  const fetchBuyerStats = async () => {
    try {
      // TODO: Replace with actual API endpoint
      // const response = await apiClient.get('/buyers/me/stats')
      
      // Mock data
      setStats({
        verifiedSuppliers: 125,
        activeOrders: 8,
        qualityCompliance: 95,
        totalSpent: 250000,
        pendingMatches: 5,
      })

      setRecentOrders([
        {
          id: '1',
          supplier: 'Kwame Asante',
          product: 'Premium Cocoa Beans',
          quantity: '10 tons',
          value: 28500,
          status: 'processing',
          date: new Date().toISOString(),
        },
        {
          id: '2',
          supplier: 'Ama Osei',
          product: 'Grade A Cashew Nuts',
          quantity: '5 tons',
          value: 6250,
          status: 'shipped',
          date: new Date(Date.now() - 86400000).toISOString(),
        },
      ])

      // Mock shipments data (in production, fetch from API)
      setRecentShipments([
        {
          id: 'ship-1',
          transactionId: 'tx-1',
          cropType: 'Premium Cocoa Beans',
          quantity: '10 tons',
          destination: 'Rotterdam, Netherlands',
          origin: 'Tema Port, Ghana',
          status: 'in-transit',
          estimatedDelivery: new Date(Date.now() + 7 * 86400000).toISOString(),
          shipmentDate: new Date(Date.now() - 3 * 86400000).toISOString(),
          totalValue: 28500,
          trackingNumber: 'TL-2024-001234',
          carrier: 'Maersk Line',
        },
        {
          id: 'ship-2',
          transactionId: 'tx-2',
          cropType: 'Grade A Cashew Nuts',
          quantity: '5 tons',
          destination: 'Hamburg, Germany',
          origin: 'Tema Port, Ghana',
          status: 'processing',
          estimatedDelivery: new Date(Date.now() + 10 * 86400000).toISOString(),
          totalValue: 6250,
          trackingNumber: 'TL-2024-001235',
          carrier: 'CMA CGM',
        },
      ])
      
      setStats({
        verifiedSuppliers: 125,
        activeOrders: 8,
        qualityCompliance: 95,
        totalSpent: 250000,
        pendingMatches: 5,
        activeShipments: 3,
        deliveredShipments: 12,
      })
    } catch (error) {
      console.error('Failed to fetch buyer stats:', error)
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
            Welcome, {user?.firstName}!
          </h1>
          <p className="text-muted-foreground mt-1">Discover verified suppliers and manage your procurement</p>
        </div>
        <Link href="/dashboard/farmers">
          <Button className="shadow-glow">
            <Search className="h-4 w-4 mr-2" />
            Discover Suppliers
          </Button>
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Card className="hover:shadow-glow transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verified Suppliers</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent className="min-w-0">
            <div className="text-xl sm:text-2xl font-bold text-foreground truncate">{stats.verifiedSuppliers}</div>
            <p className="text-xs text-muted-foreground mt-1">Active suppliers</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-glow transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
            <FileText className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent className="min-w-0">
            <div className="text-xl sm:text-2xl font-bold text-foreground truncate">{stats.activeOrders}</div>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="warning" className="text-xs">{stats.pendingMatches} pending</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-glow transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quality Verified</CardTitle>
            <Shield className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent className="min-w-0">
            <div className="text-xl sm:text-2xl font-bold text-foreground truncate">{stats.qualityCompliance}%</div>
            <p className="text-xs text-muted-foreground mt-1">Compliance rate</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-glow transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent className="min-w-0">
            <div className="text-xl sm:text-2xl font-bold text-foreground truncate" title={formatCurrency(stats.totalSpent)}>
              {formatCurrency(stats.totalSpent)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">This year • {currency.code}</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-glow transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Shipments</CardTitle>
            <Truck className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent className="min-w-0">
            <div className="text-xl sm:text-2xl font-bold text-foreground truncate">{stats.activeShipments}</div>
            <p className="text-xs text-muted-foreground mt-1">In transit</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Link href="/dashboard/farmers">
          <Card className="hover:shadow-glow transition-all cursor-pointer h-full">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Search className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle>Discover Suppliers</CardTitle>
                  <p className="text-sm text-muted-foreground">Find verified farmers</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-foreground">
                Search and filter verified Ghanaian suppliers by product, quality, and certifications.
              </p>
              <div className="flex items-center gap-2 mt-4 text-primary text-sm font-medium">
                Search Now <ArrowUpRight className="h-4 w-4" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/quality">
          <Card className="hover:shadow-glow transition-all cursor-pointer h-full">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <Shield className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <CardTitle>Quality Verification</CardTitle>
                  <p className="text-sm text-muted-foreground">Certifications & tests</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-foreground">
                Verify supplier quality certifications, test results, and blockchain traceability.
              </p>
              <div className="flex items-center gap-2 mt-4 text-green-500 text-sm font-medium">
                Verify Quality <ArrowUpRight className="h-4 w-4" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/negotiations">
          <Card className="hover:shadow-glow transition-all cursor-pointer h-full">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <MessageSquareText className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <CardTitle>Negotiations</CardTitle>
                  <p className="text-sm text-muted-foreground">Active deals & offers</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-foreground">
                Manage your active negotiations with suppliers. Make offers, counter offers, and finalize deals.
              </p>
              <div className="flex items-center gap-2 mt-4 text-purple-500 text-sm font-medium">
                View Negotiations <ArrowUpRight className="h-4 w-4" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/market-intelligence">
          <Card className="hover:shadow-glow transition-all cursor-pointer h-full">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <CardTitle>Market Intelligence</CardTitle>
                  <p className="text-sm text-muted-foreground">Ghana market trends</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-foreground">
                Access real-time pricing, demand forecasts, and market trends in Ghana.
              </p>
              <div className="flex items-center gap-2 mt-4 text-blue-500 text-sm font-medium">
                View Market <ArrowUpRight className="h-4 w-4" />
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Recent Shipments */}
      {recentShipments.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Active Shipments</CardTitle>
              <Link href="/dashboard/transactions">
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
      )}

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Orders</CardTitle>
            <Link href="/dashboard/transactions">
              <Button variant="outline" size="sm">
                View All
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentOrders.map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between p-4 bg-card/50 rounded-lg hover:bg-card transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{order.product}</p>
                    <p className="text-sm text-muted-foreground">
                      {order.supplier} • {order.quantity}
                    </p>
                    <p className="text-xs text-muted-foreground/70 mt-1">{formatDate(order.date)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-semibold text-foreground">{formatCurrency(order.value)}</p>
                    <Badge
                      variant={
                        order.status === 'shipped'
                          ? 'success'
                          : order.status === 'processing'
                            ? 'warning'
                            : 'outline'
                      }
                      className="mt-1"
                    >
                      {order.status}
                    </Badge>
                  </div>
                  <Link href={`/dashboard/transactions/${order.id}`}>
                    <Button variant="outline" size="sm">
                      Track
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3 bg-blue-900/30 border border-blue-800/50 rounded-lg">
              <AlertCircle className="h-5 w-5 text-blue-400 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-blue-300">New Supplier Matches</p>
                <p className="text-sm text-foreground mt-1">
                  {stats.pendingMatches} new AI-suggested supplier matches are waiting for your review.
                </p>
                <Link href="/dashboard/matches">
                  <Button size="sm" variant="outline" className="mt-2">
                    View Matches
                  </Button>
                </Link>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-green-900/30 border border-green-800/50 rounded-lg">
              <CheckCircle2 className="h-5 w-5 text-green-400 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-green-300">High Quality Compliance</p>
                <p className="text-sm text-foreground mt-1">
                  {stats.qualityCompliance}% of your orders meet international quality standards.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

