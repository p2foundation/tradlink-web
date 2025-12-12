'use client'

import { useEffect, useState } from 'react'
import { StatsCard } from './stats-card'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Users,
  ShoppingBag,
  Handshake,
  DollarSign,
  TrendingUp,
  Activity,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react'
import apiClient from '@/lib/api-client'
import { useCurrency } from '@/contexts/currency-context'
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'

interface DashboardData {
  metrics: {
    totalFarmers: number
    totalBuyers: number
    totalListings: number
    activeMatches: number
    totalTransactions: number
    totalTradeValue: number
    avgPriceImprovement: number
  }
  recentTransactions: any[]
  trends: any[]
}

export function EnhancedDashboard() {
  const { formatCurrency } = useCurrency()
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d')

  const demoMetrics: DashboardData['metrics'] = {
    totalFarmers: 12,
    totalBuyers: 8,
    totalListings: 24,
    activeMatches: 6,
    totalTransactions: 18,
    totalTradeValue: 425000,
    avgPriceImprovement: 6.4,
  }

  const buildDemoTrends = (range: '7d' | '30d' | '90d') => {
    const days = range === '7d' ? 7 : range === '30d' ? 30 : 90
    const today = new Date()
    return Array.from({ length: days }).map((_, idx) => {
      const d = new Date(today)
      d.setDate(today.getDate() - (days - 1 - idx))
      const base = 8000 + idx * 120
      return {
        date: d.toISOString(),
        value: base + Math.round(Math.sin(idx / 3) * 1500),
        count: 5 + (idx % 6),
      }
    })
  }

  useEffect(() => {
    fetchDashboard()
    const interval = setInterval(fetchDashboard, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [timeRange])

  const fetchDashboard = async () => {
    try {
      const [dashboardRes, trendsRes] = await Promise.all([
        apiClient.get('/analytics/dashboard'),
        apiClient.get(`/analytics/trends?period=daily&days=${timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90}`),
      ])

      const metrics = dashboardRes.data?.metrics ?? demoMetrics
      const trends = trendsRes.data?.length ? trendsRes.data : buildDemoTrends(timeRange)
      const recentTransactions = dashboardRes.data?.recentTransactions ?? []

      setDashboardData({
        metrics,
        trends,
        recentTransactions,
      })
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading && !dashboardData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!dashboardData) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">Failed to load dashboard data</p>
      </div>
    )
  }

  const { metrics, trends, recentTransactions } = dashboardData

  // Calculate growth rates (mock for now)
  const growthRates = {
    farmers: 12.5,
    buyers: 8.3,
    listings: 15.2,
    tradeValue: 23.1,
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-primary to-emerald-600 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-gray-600 mt-1">Real-time insights and analytics</p>
        </div>
        <div className="flex gap-2">
          {(['7d', '30d', '90d'] as const).map((range) => (
            <button
              key={range}
              onClick={() => {
                setTimeRange(range)
                setLoading(true)
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                timeRange === range
                  ? 'bg-primary text-white shadow-glow'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
        <StatsCard
          title="Total Farmers"
          value={metrics.totalFarmers.toLocaleString()}
          icon={Users}
          trend={growthRates.farmers}
          trendLabel="vs last month"
          color="green"
        />
        <StatsCard
          title="Total Buyers"
          value={metrics.totalBuyers.toLocaleString()}
          icon={Users}
          trend={growthRates.buyers}
          trendLabel="vs last month"
          color="blue"
        />
        <StatsCard
          title="Active Listings"
          value={metrics.totalListings.toLocaleString()}
          icon={ShoppingBag}
          trend={growthRates.listings}
          trendLabel="vs last month"
          color="purple"
        />
        <StatsCard
          title="Active Matches"
          value={metrics.activeMatches.toLocaleString()}
          icon={Handshake}
          color="yellow"
        />
        <StatsCard
          title="Total Trade Value"
          value={formatCurrency(metrics.totalTradeValue)}
          icon={DollarSign}
          trend={growthRates.tradeValue}
          trendLabel="vs last month"
          color="green"
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Trade Value Trend */}
        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Trade Value Trend</CardTitle>
                <CardDescription>Daily trade value over time</CardDescription>
              </div>
              <Activity className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={trends}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#059669" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#059669" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  }}
                  formatter={(value: number) => formatCurrency(value)}
                  labelFormatter={(label) => new Date(label).toLocaleDateString()}
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

        {/* Transaction Count */}
        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Transaction Volume</CardTitle>
                <CardDescription>Number of transactions per day</CardDescription>
              </div>
              <CheckCircle2 className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={trends}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  }}
                  labelFormatter={(label) => new Date(label).toLocaleDateString()}
                />
                <Bar dataKey="count" fill="#059669" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="shadow-lg border-l-4 border-l-green-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Price Improvement</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <div className="text-3xl font-bold text-green-600">
                  {metrics.avgPriceImprovement.toFixed(1)}%
                </div>
                <p className="text-sm text-gray-600 mt-1">Average improvement</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-l-4 border-l-blue-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Processing Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <div className="text-3xl font-bold text-blue-600">2.5 hrs</div>
                <p className="text-sm text-gray-600 mt-1">Average clearance</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-l-4 border-l-purple-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-purple-100 rounded-lg">
                <CheckCircle2 className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-600">94.2%</div>
                <p className="text-sm text-gray-600 mt-1">Match success</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Latest trade activities</CardDescription>
            </div>
            <button className="text-sm text-primary hover:underline font-medium">
              View All
            </button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentTransactions?.slice(0, 5).map((tx: any, idx: number) => (
              <div
                key={idx}
                className="flex items-center justify-between p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <DollarSign className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium">
                      {tx.match?.listing?.cropType || 'Transaction'}
                    </p>
                    <p className="text-sm text-gray-600">
                      {tx.buyer?.user?.firstName} {tx.buyer?.user?.lastName}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-green-600">
                    {formatCurrency(tx.totalValue)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(tx.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
            {(!recentTransactions || recentTransactions.length === 0) && (
              <div className="text-center py-8 text-gray-500">
                No recent transactions
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

