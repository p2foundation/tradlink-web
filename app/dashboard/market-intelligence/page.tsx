'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart3,
  Globe,
  AlertCircle,
  RefreshCw,
  Download,
} from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { useCurrency } from '@/contexts/currency-context'
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import apiClient from '@/lib/api-client'

interface PriceData {
  date: string
  price: number
  volume: number
  market: string
}

interface MarketTrend {
  commodity: string
  currentPrice: number
  change24h: number
  change7d: number
  change30d: number
  volume: number
  demand: 'high' | 'medium' | 'low'
  forecast: 'bullish' | 'bearish' | 'neutral'
}

export default function MarketIntelligencePage() {
  const { formatCurrency, currency } = useCurrency()
  const [loading, setLoading] = useState(true)
  const [priceData, setPriceData] = useState<PriceData[]>([])
  const [marketTrends, setMarketTrends] = useState<MarketTrend[]>([])
  const [selectedCommodity, setSelectedCommodity] = useState<string>('Cocoa')
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d')

  useEffect(() => {
    fetchMarketData()
    const interval = setInterval(fetchMarketData, 300000) // Refresh every 5 minutes
    return () => clearInterval(interval)
  }, [timeRange])

  const fetchMarketData = async () => {
    try {
      setLoading(true)
      // TODO: Replace with actual API endpoint
      // const response = await apiClient.get(`/analytics/market-intelligence?range=${timeRange}`)
      
      // Mock data for now
      const mockTrends: MarketTrend[] = [
        {
          commodity: 'Cocoa',
          currentPrice: 2850,
          change24h: 2.5,
          change7d: 5.2,
          change30d: 12.3,
          volume: 15000,
          demand: 'high',
          forecast: 'bullish',
        },
        {
          commodity: 'Coffee',
          currentPrice: 1950,
          change24h: -1.2,
          change7d: 3.1,
          change30d: 8.5,
          volume: 8500,
          demand: 'medium',
          forecast: 'neutral',
        },
        {
          commodity: 'Cashew',
          currentPrice: 1250,
          change24h: 0.8,
          change7d: 2.3,
          change30d: 6.7,
          volume: 5200,
          demand: 'high',
          forecast: 'bullish',
        },
        {
          commodity: 'Shea Nuts',
          currentPrice: 850,
          change24h: 1.5,
          change7d: 4.2,
          change30d: 9.8,
          volume: 3200,
          demand: 'medium',
          forecast: 'bullish',
        },
      ]

      // Generate mock price history
      const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90
      const mockPriceData: PriceData[] = Array.from({ length: days }, (_, i) => {
        const date = new Date()
        date.setDate(date.getDate() - (days - i))
        const basePrice = mockTrends.find(t => t.commodity === selectedCommodity)?.currentPrice || 2000
        const variation = (Math.random() - 0.5) * 200
        return {
          date: date.toISOString(),
          price: basePrice + variation,
          volume: Math.floor(Math.random() * 5000) + 1000,
          market: 'International',
        }
      })

      setMarketTrends(mockTrends)
      setPriceData(mockPriceData)
    } catch (error) {
      console.error('Failed to fetch market data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getTrendColor = (change: number) => {
    if (change > 0) return 'text-green-500'
    if (change < 0) return 'text-red-500'
    return 'text-gray-400'
  }

  const getDemandBadge = (demand: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'outline'> = {
      high: 'default',
      medium: 'secondary',
      low: 'outline',
    }
    return variants[demand] || 'outline'
  }

  return (
    <div className="space-y-6 text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Market Intelligence</h1>
          <p className="text-gray-300 mt-1">Real-time pricing, demand forecasting, and market trends</p>
        </div>
        <div className="flex gap-2">
          {(['7d', '30d', '90d'] as const).map((range) => (
            <Button
              key={range}
              variant={timeRange === range ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange(range)}
            >
              {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
            </Button>
          ))}
          <Button variant="outline" size="icon" onClick={fetchMarketData} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          <Button variant="outline" size="icon">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Market Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {marketTrends.map((trend) => (
          <Card key={trend.commodity} className="bg-slate-900 border-white/10 hover:shadow-glow transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg text-white">{trend.commodity}</CardTitle>
                <Badge variant={getDemandBadge(trend.demand)} className="text-xs">
                  {trend.demand.toUpperCase()}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="text-2xl font-bold text-white">{formatCurrency(trend.currentPrice)}/ton</p>
                  <p className="text-xs text-gray-500 mt-0.5">{currency.code}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {trend.change24h > 0 ? (
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-500" />
                    )}
                    <span className={`text-sm font-medium ${getTrendColor(trend.change24h)}`}>
                      {trend.change24h > 0 ? '+' : ''}
                      {trend.change24h.toFixed(2)}%
                    </span>
                    <span className="text-xs text-gray-400">24h</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <p className="text-gray-400">7d Change</p>
                    <p className={`font-medium ${getTrendColor(trend.change7d)}`}>
                      {trend.change7d > 0 ? '+' : ''}
                      {trend.change7d.toFixed(1)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400">30d Change</p>
                    <p className={`font-medium ${getTrendColor(trend.change30d)}`}>
                      {trend.change30d > 0 ? '+' : ''}
                      {trend.change30d.toFixed(1)}%
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-white/10">
                  <div>
                    <p className="text-xs text-gray-400">Volume</p>
                    <p className="text-sm font-medium text-white">{trend.volume.toLocaleString()} tons</p>
                  </div>
                  <Badge
                    variant={trend.forecast === 'bullish' ? 'default' : trend.forecast === 'bearish' ? 'destructive' : 'secondary'}
                    className="text-xs"
                  >
                    {trend.forecast.toUpperCase()}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Price Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Price Trend Chart */}
        <Card className="bg-slate-900 border-white/10">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-white">Price Trend</CardTitle>
                <CardDescription className="text-gray-400">
                  {selectedCommodity} price movement over time
                </CardDescription>
              </div>
              <div className="flex gap-2">
                {marketTrends.map((trend) => (
                  <Button
                    key={trend.commodity}
                    variant={selectedCommodity === trend.commodity ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCommodity(trend.commodity)}
                  >
                    {trend.commodity}
                  </Button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={priceData}>
                <defs>
                  <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
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
                  labelFormatter={(label) => new Date(label).toLocaleDateString()}
                />
                <Area
                  type="monotone"
                  dataKey="price"
                  stroke="#059669"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorPrice)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Volume Chart */}
        <Card className="bg-slate-900 border-white/10">
          <CardHeader>
            <div>
              <CardTitle className="text-white">Trading Volume</CardTitle>
              <CardDescription className="text-gray-400">
                Daily trading volume by commodity
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={priceData.slice(-14)}>
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
                  labelFormatter={(label) => new Date(label).toLocaleDateString()}
                />
                <Bar dataKey="volume" fill="#059669" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Market Alerts & Insights */}
      <Card className="bg-slate-900 border-white/10">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-primary" />
            <CardTitle className="text-white">Market Alerts & Insights</CardTitle>
          </div>
          <CardDescription className="text-gray-400">
            AI-powered market intelligence and recommendations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-blue-900/30 border border-blue-800/50 rounded-lg">
              <div className="flex items-start gap-3">
                <TrendingUp className="h-5 w-5 text-blue-400 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-blue-300">Price Opportunity Detected</p>
                  <p className="text-sm text-gray-300 mt-1">
                    Cocoa prices have increased 12.3% over the past 30 days. Current demand is high with
                    strong buyer interest. Consider listing your inventory now for optimal pricing.
                  </p>
                  <p className="text-xs text-gray-400 mt-2">Updated 2 hours ago</p>
                </div>
              </div>
            </div>
            <div className="p-4 bg-green-900/30 border border-green-800/50 rounded-lg">
              <div className="flex items-start gap-3">
                <Globe className="h-5 w-5 text-green-400 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-green-300">New Market Opportunity</p>
                  <p className="text-sm text-gray-300 mt-1">
                    European buyers are showing increased interest in premium-grade cashew. 5 new buyer
                    inquiries in the past week. Premium pricing available for certified organic products.
                  </p>
                  <p className="text-xs text-gray-400 mt-2">Updated 5 hours ago</p>
                </div>
              </div>
            </div>
            <div className="p-4 bg-yellow-900/30 border border-yellow-800/50 rounded-lg">
              <div className="flex items-start gap-3">
                <BarChart3 className="h-5 w-5 text-yellow-400 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-yellow-300">Demand Forecast</p>
                  <p className="text-sm text-gray-300 mt-1">
                    Shea nut demand is projected to increase 15% over the next quarter based on seasonal
                    patterns and international market trends. Prepare inventory accordingly.
                  </p>
                  <p className="text-xs text-gray-400 mt-2">Updated 1 day ago</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

