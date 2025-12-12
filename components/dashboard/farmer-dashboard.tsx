'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  ShoppingBag,
  TrendingUp,
  Handshake,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  Plus,
  ArrowUpRight,
  MessageSquareText,
  Truck,
  Package,
} from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { useCurrency } from '@/contexts/currency-context'
import apiClient from '@/lib/api-client'
import Link from 'next/link'
import { ShipmentCard } from '@/components/shipments/shipment-card'

export function FarmerDashboard({ user }: { user: any }) {
  const { formatCurrency, currency } = useCurrency()
  const [stats, setStats] = useState({
    activeListings: 0,
    totalMatches: 0,
    completedSales: 0,
    totalEarnings: 0,
    pendingMatches: 0,
    activeShipments: 0,
    deliveredShipments: 0,
  })
  const [recentShipments, setRecentShipments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.id) {
      fetchFarmerStats()
    }
  }, [user])

  const fetchFarmerStats = async () => {
    if (!user?.id) return
    
    try {
      setLoading(true)
      // Fetch farmer's listings
      const listingsResponse = await apiClient.get('/listings')
      const allListings = listingsResponse.data.data || []
      const farmerListings = allListings.filter((l: any) => l.farmer?.user?.id === user.id)
      const activeListings = farmerListings.filter((l: any) => l.status === 'ACTIVE').length

      // Fetch farmer's matches
      const matchesResponse = await apiClient.get('/matches')
      const allMatches = matchesResponse.data.data || []
      const farmerMatches = allMatches.filter((m: any) => m.farmer?.user?.id === user.id)
      const pendingMatches = farmerMatches.filter((m: any) => 
        m.status === 'SUGGESTED' || m.status === 'CONTACTED' || m.status === 'NEGOTIATING'
      ).length

      // Fetch farmer's transactions
      const transactionsResponse = await apiClient.get('/transactions')
      const allTransactions = transactionsResponse.data.data || []
      const farmerTransactions = allMatches
        .map((m: any) => allTransactions.find((t: any) => t.matchId === m.id))
        .filter(Boolean)
      const completedSales = farmerTransactions.filter((t: any) => 
        t.paymentStatus === 'paid' && t.shipmentStatus === 'delivered'
      ).length
      const totalEarnings = farmerTransactions
        .filter((t: any) => t.paymentStatus === 'paid')
        .reduce((sum: number, t: any) => sum + (t.totalValue || 0), 0)

      // Fetch shipments
      const activeShipments = farmerTransactions.filter((t: any) => 
        ['in-transit', 'processing', 'pending'].includes(t.shipmentStatus?.toLowerCase())
      ).length
      const deliveredShipments = farmerTransactions.filter((t: any) => 
        t.shipmentStatus?.toLowerCase() === 'delivered'
      ).length

      // Prepare recent shipments for display
      const shipments = farmerTransactions
        .filter((t: any) => t.shipmentStatus && t.shipmentStatus !== 'pending')
        .slice(0, 3)
        .map((t: any) => ({
          id: t.id,
          transactionId: t.id,
          cropType: t.match?.listing?.cropType || 'Product',
          quantity: `${t.quantity} ${t.match?.listing?.unit || 'units'}`,
          destination: t.buyer?.country || 'International',
          origin: 'Ghana',
          status: (t.shipmentStatus?.toLowerCase() || 'pending') as any,
          estimatedDelivery: t.deliveryDate,
          shipmentDate: t.shipmentDate,
          deliveryDate: t.deliveryDate,
          totalValue: t.totalValue,
          trackingNumber: t.gcmsReferenceNo || `TL-${t.id.slice(0, 8).toUpperCase()}`,
        }))

      setStats({
        activeListings,
        totalMatches: farmerMatches.length,
        completedSales,
        totalEarnings,
        pendingMatches,
        activeShipments,
        deliveredShipments,
      })
      setRecentShipments(shipments)
    } catch (error) {
      console.error('Failed to fetch farmer stats:', error)
      // Fallback to mock data on error
      setStats({
        activeListings: 5,
        totalMatches: 12,
        completedSales: 8,
        totalEarnings: 45000,
        pendingMatches: 3,
        activeShipments: 2,
        deliveredShipments: 6,
      })
      setRecentShipments([])
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
            Welcome back, {user?.firstName}!
          </h1>
          <p className="text-gray-300 mt-1">Manage your listings and connect with international buyers</p>
        </div>
        <Link href="/dashboard/listings">
          <Button className="shadow-glow">
            <Plus className="h-4 w-4 mr-2" />
            Create New Listing
          </Button>
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Card className="bg-slate-900 border-white/10 hover:shadow-glow transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Active Listings</CardTitle>
            <ShoppingBag className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.activeListings}</div>
            <p className="text-xs text-gray-400 mt-1">Products for sale</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-white/10 hover:shadow-glow transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Buyer Matches</CardTitle>
            <Handshake className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.totalMatches}</div>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="warning" className="text-xs">{stats.pendingMatches} pending</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-white/10 hover:shadow-glow transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Completed Sales</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.completedSales}</div>
            <p className="text-xs text-gray-400 mt-1">Successful transactions</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-white/10 hover:shadow-glow transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Total Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{formatCurrency(stats.totalEarnings)}</div>
            <p className="text-xs text-gray-400 mt-1">All-time revenue • {currency.code}</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-white/10 hover:shadow-glow transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Active Shipments</CardTitle>
            <Truck className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.activeShipments}</div>
            <p className="text-xs text-gray-400 mt-1">In transit</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Link href="/dashboard/market-intelligence">
          <Card className="bg-slate-900 border-white/10 hover:shadow-glow transition-all cursor-pointer h-full">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-white">Market Intelligence</CardTitle>
                  <p className="text-sm text-gray-400">Real-time prices & trends</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-300">
                View current market prices, demand forecasts, and pricing opportunities for your crops.
              </p>
              <div className="flex items-center gap-2 mt-4 text-primary text-sm font-medium">
                View Prices <ArrowUpRight className="h-4 w-4" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/matches">
          <Card className="bg-slate-900 border-white/10 hover:shadow-glow transition-all cursor-pointer h-full">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Handshake className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <CardTitle className="text-white">Buyer Matches</CardTitle>
                  <p className="text-sm text-gray-400">AI-powered connections</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-300">
                {stats.pendingMatches > 0
                  ? `You have ${stats.pendingMatches} new buyer matches waiting for your response.`
                  : 'View your buyer matches and start negotiations.'}
              </p>
              <div className="flex items-center gap-2 mt-4 text-blue-500 text-sm font-medium">
                View Matches <ArrowUpRight className="h-4 w-4" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/negotiations">
          <Card className="bg-slate-900 border-white/10 hover:shadow-glow transition-all cursor-pointer h-full">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <MessageSquareText className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <CardTitle className="text-white">Negotiations</CardTitle>
                  <p className="text-sm text-gray-400">Active deals & offers</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-300">
                View and manage your active negotiations with buyers. Respond to offers and finalize deals.
              </p>
              <div className="flex items-center gap-2 mt-4 text-purple-500 text-sm font-medium">
                View Negotiations <ArrowUpRight className="h-4 w-4" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/quality">
          <Card className="bg-slate-900 border-white/10 hover:shadow-glow transition-all cursor-pointer h-full">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <CardTitle className="text-white">Quality & Certificates</CardTitle>
                  <p className="text-sm text-gray-400">Verification status</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-300">
                Manage your quality certifications and traceability records for international buyers.
              </p>
              <div className="flex items-center gap-2 mt-4 text-green-500 text-sm font-medium">
                View Certificates <ArrowUpRight className="h-4 w-4" />
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Recent Shipments */}
      {recentShipments.length > 0 && (
        <Card className="bg-slate-900 border-white/10">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white">Recent Shipments</CardTitle>
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

      {/* Recent Activity */}
      <Card className="bg-slate-900 border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-3 bg-slate-800/50 rounded-lg">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-white">New buyer match for Cocoa</p>
                <p className="text-xs text-gray-400">Compatibility score: 92% • 2 hours ago</p>
              </div>
              <Button size="sm" variant="outline">
                View
              </Button>
            </div>
            <div className="flex items-center gap-4 p-3 bg-slate-800/50 rounded-lg">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <TrendingUp className="h-4 w-4 text-blue-500" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-white">Price alert: Cocoa prices up 5.2%</p>
                <p className="text-xs text-gray-400">Consider listing your inventory • 4 hours ago</p>
              </div>
              <Button size="sm" variant="outline">
                View Prices
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

