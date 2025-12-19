'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Users,
  BarChart3,
  Globe,
  AlertCircle,
  Settings,
  FileText,
  CheckCircle2,
  TrendingUp,
  ArrowUpRight,
  Shield,
  Activity,
  Truck,
  Package,
} from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { useCurrency } from '@/contexts/currency-context'
import apiClient from '@/lib/api-client'
import Link from 'next/link'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { ShipmentCard } from '@/components/shipments/shipment-card'

export function AdminDashboard({ user }: { user: any }) {
  const { formatCurrency, currency } = useCurrency()
  const [stats, setStats] = useState({
    totalUsers: 0,
    platformTradeValue: 0,
    activeIntegrations: 0,
    complianceIssues: 0,
    totalFarmers: 0,
    totalBuyers: 0,
    totalTransactions: 0,
    systemUptime: 0,
    activeShipments: 0,
    deliveredShipments: 0,
    totalShipments: 0,
  })
  const [integrationStatus, setIntegrationStatus] = useState<any[]>([])
  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const [recentShipments, setRecentShipments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAdminStats()
    const interval = setInterval(fetchAdminStats, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchAdminStats = async () => {
    try {
      // TODO: Replace with actual API endpoint
      // const response = await apiClient.get('/admin/analytics')
      
      // Mock data
      setStats({
        totalUsers: 2450,
        platformTradeValue: 2500000,
        activeIntegrations: 7,
        complianceIssues: 3,
        totalFarmers: 1250,
        totalBuyers: 180,
        totalTransactions: 450,
        systemUptime: 99.8,
        activeShipments: 45,
        deliveredShipments: 320,
        totalShipments: 365,
      })

      // Mock platform-wide shipments
      setRecentShipments([
        {
          id: 'ship-admin-1',
          transactionId: 'tx-admin-1',
          cropType: 'Premium Cocoa Beans',
          quantity: '25 tons',
          destination: 'Rotterdam, Netherlands',
          origin: 'Tema Port, Ghana',
          status: 'in-transit',
          estimatedDelivery: new Date(Date.now() + 5 * 86400000).toISOString(),
          shipmentDate: new Date(Date.now() - 3 * 86400000).toISOString(),
          totalValue: 71250,
          trackingNumber: 'TL-2024-001234',
          carrier: 'Maersk Line',
        },
        {
          id: 'ship-admin-2',
          transactionId: 'tx-admin-2',
          cropType: 'Grade A Cashew Nuts',
          quantity: '18 tons',
          destination: 'Hamburg, Germany',
          origin: 'Tema Port, Ghana',
          status: 'processing',
          estimatedDelivery: new Date(Date.now() + 8 * 86400000).toISOString(),
          shipmentDate: new Date(Date.now() - 1 * 86400000).toISOString(),
          totalValue: 22500,
          trackingNumber: 'TL-2024-001235',
          carrier: 'CMA CGM',
        },
        {
          id: 'ship-admin-3',
          transactionId: 'tx-admin-3',
          cropType: 'Organic Shea Nuts',
          quantity: '12 tons',
          destination: 'London, UK',
          origin: 'Tema Port, Ghana',
          status: 'delivered',
          deliveryDate: new Date(Date.now() - 2 * 86400000).toISOString(),
          shipmentDate: new Date(Date.now() - 15 * 86400000).toISOString(),
          totalValue: 10200,
          trackingNumber: 'TL-2024-001236',
          carrier: 'Hapag-Lloyd',
        },
      ])

      setIntegrationStatus([
        { name: 'Ghana GCMS', status: 'active', lastSync: new Date().toISOString() },
        { name: 'USA ACE', status: 'active', lastSync: new Date(Date.now() - 300000).toISOString() },
        { name: 'EU TRACES', status: 'active', lastSync: new Date(Date.now() - 600000).toISOString() },
        { name: 'China Single Window', status: 'active', lastSync: new Date(Date.now() - 900000).toISOString() },
        { name: 'Kenya KenTrade', status: 'warning', lastSync: new Date(Date.now() - 3600000).toISOString() },
        { name: 'Rwanda Trade', status: 'active', lastSync: new Date(Date.now() - 1200000).toISOString() },
        { name: 'South Africa SARS', status: 'active', lastSync: new Date(Date.now() - 1800000).toISOString() },
      ])

      setRecentActivity([
        {
          id: '1',
          type: 'user_registration',
          message: 'New buyer registered: Swiss Trading Co.',
          timestamp: new Date().toISOString(),
        },
        {
          id: '2',
          type: 'transaction',
          message: 'Large transaction completed: $125,000',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          id: '3',
          type: 'compliance',
          message: 'Compliance issue flagged: Quality certificate expired',
          timestamp: new Date(Date.now() - 7200000).toISOString(),
        },
      ])
    } catch (error) {
      console.error('Failed to fetch admin stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const getIntegrationStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-500'
      case 'warning':
        return 'text-yellow-500'
      case 'error':
        return 'text-red-500'
      default:
        return 'text-gray-500'
    }
  }

  const getIntegrationStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="success">Active</Badge>
      case 'warning':
        return <Badge variant="warning">Warning</Badge>
      case 'error':
        return <Badge variant="destructive">Error</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  // Generate mock trend data
  const trendData = Array.from({ length: 30 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (29 - i))
    return {
      date: date.toISOString(),
      value: 50000 + Math.random() * 50000 + i * 2000,
      users: 50 + Math.random() * 20 + i * 2,
    }
  })

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-primary to-emerald-600 bg-clip-text text-transparent">
            Admin Dashboard
          </h1>
          <p className="text-gray-300 mt-1">Platform oversight, analytics, and system management</p>
        </div>
        <Link href="/dashboard/analytics">
          <Button className="shadow-glow">
            <BarChart3 className="h-4 w-4 mr-2" />
            View Analytics
          </Button>
        </Link>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-glow transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent className="min-w-0">
            <div className="text-xl sm:text-2xl font-bold text-foreground truncate">{stats.totalUsers.toLocaleString()}</div>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-xs text-muted-foreground">Farmers: {stats.totalFarmers}</p>
              <p className="text-xs text-muted-foreground">•</p>
              <p className="text-xs text-muted-foreground">Buyers: {stats.totalBuyers}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-glow transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Platform Trade Value</CardTitle>
            <BarChart3 className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent className="min-w-0">
            <div className="text-xl sm:text-2xl font-bold text-foreground truncate" title={formatCurrency(stats.platformTradeValue)}>
              {formatCurrency(stats.platformTradeValue)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">This month • {currency.code}</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-glow transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">System Uptime</CardTitle>
            <Activity className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent className="min-w-0">
            <div className="text-xl sm:text-2xl font-bold text-foreground truncate">{stats.systemUptime}%</div>
            <p className="text-xs text-muted-foreground mt-1">Last 30 days</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-glow transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Shipments</CardTitle>
            <Truck className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent className="min-w-0">
            <div className="text-xl sm:text-2xl font-bold text-foreground truncate">{stats.activeShipments}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.deliveredShipments} delivered • {stats.totalShipments} total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Integration Status */}
      <Card className="bg-slate-900 border-white/10">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white">International System Integrations</CardTitle>
              <CardDescription className="text-gray-400">
                Real-time status of connected trade systems
              </CardDescription>
            </div>
            <Link href="/dashboard/integrations">
              <Button variant="outline" size="sm">
                Manage
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {integrationStatus.map((integration, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    integration.status === 'active' ? 'bg-green-500/10' : 
                    integration.status === 'warning' ? 'bg-yellow-500/10' : 'bg-red-500/10'
                  }`}>
                    <Globe className={`h-4 w-4 ${
                      integration.status === 'active' ? 'text-green-500' : 
                      integration.status === 'warning' ? 'text-yellow-500' : 'text-red-500'
                    }`} />
                  </div>
                  <div>
                    <p className="font-medium text-white text-sm">{integration.name}</p>
                    <p className="text-xs text-gray-400">
                      Last sync: {formatDate(integration.lastSync)}
                    </p>
                  </div>
                </div>
                {getIntegrationStatusBadge(integration.status)}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Platform Trends */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="bg-slate-900 border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Trade Value Trend</CardTitle>
            <CardDescription className="text-gray-400">30-day platform trade value</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#059669" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12, fill: '#9ca3af' }}
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: '#9ca3af' }}
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    color: '#f1f5f9',
                  }}
                  formatter={(value: number) => formatCurrency(value)}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#059669"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorValue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-white/10">
          <CardHeader>
            <CardTitle className="text-white">User Growth</CardTitle>
            <CardDescription className="text-gray-400">30-day user registration trend</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12, fill: '#9ca3af' }}
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                />
                <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    color: '#f1f5f9',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="users"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorUsers)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Platform Shipment Tracking */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Platform Shipment Tracking</CardTitle>
              <CardDescription>
                Monitor all active shipments across the platform • {stats.activeShipments} active, {stats.deliveredShipments} delivered
              </CardDescription>
            </div>
            <Link href="/dashboard/transactions">
              <Button variant="outline" size="sm">
                View All
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentShipments.length > 0 ? (
              recentShipments.map((shipment) => (
                <ShipmentCard key={shipment.id} {...shipment} />
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Truck className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No active shipments to display</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity & Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="bg-slate-900 border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 p-3 bg-slate-800/50 rounded-lg"
                >
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Activity className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-white">{activity.message}</p>
                    <p className="text-xs text-gray-400 mt-1">{formatDate(activity.timestamp)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Link href="/dashboard/users">
                <Button variant="outline" className="w-full justify-start">
                  <Users className="h-4 w-4 mr-2" />
                  Manage Users
                </Button>
              </Link>
              <Link href="/dashboard/compliance-monitoring">
                <Button variant="outline" className="w-full justify-start">
                  <Shield className="h-4 w-4 mr-2" />
                  Compliance Monitoring
                </Button>
              </Link>
              <Link href="/dashboard/integrations">
                <Button variant="outline" className="w-full justify-start">
                  <Globe className="h-4 w-4 mr-2" />
                  Integration Management
                </Button>
              </Link>
              <Link href="/dashboard/reports">
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="h-4 w-4 mr-2" />
                  Generate Reports
                </Button>
              </Link>
              <Link href="/dashboard/system">
                <Button variant="outline" className="w-full justify-start">
                  <Settings className="h-4 w-4 mr-2" />
                  System Configuration
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

