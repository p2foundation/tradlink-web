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
      // TODO: Replace with actual API endpoint
      // const response = await apiClient.get('/export-companies/me/stats')
      
      // Mock data
      setStats({
        supplierNetwork: 45,
        activeOrders: 12,
        shipments: 8,
        monthlyRevenue: 125000,
        qualityCompliance: 98,
      })

      // Enhanced shipments with tracking data
      const shipments = [
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
        {
          id: 'ship-2',
          transactionId: 'tx-2',
          cropType: 'Grade A Cashew Nuts',
          quantity: '15 tons',
          destination: 'Hamburg, Germany',
          origin: 'Tema Port, Ghana',
          status: 'processing' as const,
          estimatedDelivery: new Date(Date.now() + 3 * 86400000).toISOString(),
          shipmentDate: new Date(Date.now() - 2 * 86400000).toISOString(),
          totalValue: 18750,
          trackingNumber: 'TL-2024-001235',
          carrier: 'CMA CGM',
        },
        {
          id: 'ship-3',
          transactionId: 'tx-3',
          cropType: 'Organic Shea Nuts',
          quantity: '10 tons',
          destination: 'London, UK',
          origin: 'Tema Port, Ghana',
          status: 'delivered' as const,
          deliveryDate: new Date(Date.now() - 10 * 86400000).toISOString(),
          shipmentDate: new Date(Date.now() - 20 * 86400000).toISOString(),
          totalValue: 8500,
          trackingNumber: 'TL-2024-001236',
          carrier: 'Hapag-Lloyd',
        },
      ]

      setRecentShipments(shipments)
      setStats({
        supplierNetwork: 45,
        activeOrders: 12,
        shipments: 8,
        monthlyRevenue: 125000,
        qualityCompliance: 98,
        activeShipments: 2,
        deliveredShipments: 6,
      })
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
          <p className="text-gray-300 mt-1">Manage your supplier network, orders, and logistics operations</p>
        </div>
        <Link href="/dashboard/farmers">
          <Button className="shadow-glow">
            <Users className="h-4 w-4 mr-2" />
            Manage Suppliers
          </Button>
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Card className="bg-slate-900 border-white/10 hover:shadow-glow transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Supplier Network</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.supplierNetwork}</div>
            <p className="text-xs text-gray-400 mt-1">Active suppliers</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-white/10 hover:shadow-glow transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Active Orders</CardTitle>
            <ShoppingBag className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.activeOrders}</div>
            <p className="text-xs text-gray-400 mt-1">In progress</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-white/10 hover:shadow-glow transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Shipments</CardTitle>
            <Truck className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.shipments}</div>
            <p className="text-xs text-gray-400 mt-1">In transit</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-white/10 hover:shadow-glow transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{formatCurrency(stats.monthlyRevenue)}</div>
            <p className="text-xs text-gray-400 mt-1">This month • {currency.code}</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-white/10 hover:shadow-glow transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Quality Compliance</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.qualityCompliance}%</div>
            <p className="text-xs text-gray-400 mt-1">Standards met</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Link href="/dashboard/farmers">
          <Card className="bg-slate-900 border-white/10 hover:shadow-glow transition-all cursor-pointer h-full">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-white">Supplier Network</CardTitle>
                  <p className="text-sm text-gray-400">Manage suppliers</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-300">
                Manage your network of {stats.supplierNetwork} verified suppliers and discover new partners.
              </p>
              <div className="flex items-center gap-2 mt-4 text-primary text-sm font-medium">
                View Network <ArrowUpRight className="h-4 w-4" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/listings">
          <Card className="bg-slate-900 border-white/10 hover:shadow-glow transition-all cursor-pointer h-full">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <ShoppingBag className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <CardTitle className="text-white">Order Management</CardTitle>
                  <p className="text-sm text-gray-400">Bulk operations</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-300">
                Manage {stats.activeOrders} active orders and create bulk sourcing requests.
              </p>
              <div className="flex items-center gap-2 mt-4 text-blue-500 text-sm font-medium">
                Manage Orders <ArrowUpRight className="h-4 w-4" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/logistics">
          <Card className="bg-slate-900 border-white/10 hover:shadow-glow transition-all cursor-pointer h-full">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <Truck className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <CardTitle className="text-white">Logistics</CardTitle>
                  <p className="text-sm text-gray-400">Track shipments</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-300">
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
      <Card className="bg-slate-900 border-white/10">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white">Active Shipments & Tracking</CardTitle>
              <p className="text-sm text-gray-400 mt-1">
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
        <Card className="bg-slate-900 border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Quality Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-300">Overall Compliance</span>
                  <span className="text-sm font-semibold text-white">{stats.qualityCompliance}%</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: `${stats.qualityCompliance}%` }}
                  ></div>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <div>
                  <p className="text-gray-400">Certified Suppliers</p>
                  <p className="text-white font-semibold">{Math.round(stats.supplierNetwork * 0.85)}</p>
                </div>
                <div>
                  <p className="text-gray-400">Quality Issues</p>
                  <p className="text-white font-semibold">2</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-white">{formatCurrency(stats.monthlyRevenue)}</p>
                  <p className="text-sm text-gray-400">This month • {currency.code}</p>
                </div>
                <div className="p-3 bg-emerald-500/10 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-emerald-500" />
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <div>
                  <p className="text-gray-400">Last Month</p>
                  <p className="text-white font-semibold">{formatCurrency(stats.monthlyRevenue * 0.92)}</p>
                </div>
                <div>
                  <p className="text-gray-400">Growth</p>
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

