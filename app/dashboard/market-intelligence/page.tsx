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
  const [isDark, setIsDark] = useState(true)

  useEffect(() => {
    // Check current theme
    const checkTheme = () => {
      const isLight = document.documentElement.classList.contains('light')
      setIsDark(!isLight)
    }
    checkTheme()
    const observer = new MutationObserver(checkTheme)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])

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
    return 'text-muted-foreground'
  }

  const getDemandBadge = (demand: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'outline'> = {
      high: 'default',
      medium: 'secondary',
      low: 'outline',
    }
    return variants[demand] || 'outline'
  }

  // Theme-aware chart colors
  const chartTextColor = isDark ? '#9ca3af' : '#6b7280'
  const chartGridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
  const tooltipBg = isDark ? '#1e293b' : '#ffffff'
  const tooltipBorder = isDark ? '#334155' : '#e5e7eb'
  const tooltipText = isDark ? '#f1f5f9' : '#111827'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Market Intelligence</h1>
          <p className="text-muted-foreground mt-1">Real-time pricing, demand forecasting, and market trends</p>
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
          <Card key={trend.commodity} className="hover:shadow-glow transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg text-foreground">{trend.commodity}</CardTitle>
                <Badge variant={getDemandBadge(trend.demand)} className="text-xs">
                  {trend.demand.toUpperCase()}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="text-2xl font-bold text-foreground">{formatCurrency(trend.currentPrice)}/ton</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{currency.code}</p>
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
                    <span className="text-xs text-muted-foreground">24h</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <p className="text-muted-foreground">7d Change</p>
                    <p className={`font-medium ${getTrendColor(trend.change7d)}`}>
                      {trend.change7d > 0 ? '+' : ''}
                      {trend.change7d.toFixed(1)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">30d Change</p>
                    <p className={`font-medium ${getTrendColor(trend.change30d)}`}>
                      {trend.change30d > 0 ? '+' : ''}
                      {trend.change30d.toFixed(1)}%
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <div>
                    <p className="text-xs text-muted-foreground">Volume</p>
                    <p className="text-sm font-medium text-foreground">{trend.volume.toLocaleString()} tons</p>
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
        <Card>
          <CardHeader>
            <div className="space-y-4">
              <div>
                <CardTitle>Price Trend</CardTitle>
                <CardDescription className="mt-1">
                  {selectedCommodity} price movement over time
                </CardDescription>
              </div>
              <div className="flex flex-wrap gap-2">
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
                <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12, fill: chartTextColor }}
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: chartTextColor }}
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: tooltipBg,
                    border: `1px solid ${tooltipBorder}`,
                    borderRadius: '8px',
                    color: tooltipText,
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
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Trading Volume</CardTitle>
              <CardDescription className="mt-1">
                Daily trading volume by commodity
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={priceData.slice(-14)}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12, fill: chartTextColor }}
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                />
                <YAxis tick={{ fontSize: 12, fill: chartTextColor }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: tooltipBg,
                    border: `1px solid ${tooltipBorder}`,
                    borderRadius: '8px',
                    color: tooltipText,
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
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-primary" />
            <CardTitle>Market Alerts & Insights</CardTitle>
          </div>
          <CardDescription>
            AI-powered market intelligence and recommendations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <div className="flex items-start gap-3">
                <TrendingUp className="h-5 w-5 text-blue-500 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-blue-500">Price Opportunity Detected</p>
                  <p className="text-sm text-foreground mt-1">
                    Cocoa prices have increased 12.3% over the past 30 days. Current demand is high with
                    strong buyer interest. Consider listing your inventory now for optimal pricing.
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">Updated 2 hours ago</p>
                </div>
              </div>
            </div>
            <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
              <div className="flex items-start gap-3">
                <Globe className="h-5 w-5 text-green-500 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-green-500">New Market Opportunity</p>
                  <p className="text-sm text-foreground mt-1">
                    European buyers are showing increased interest in premium-grade cashew. 5 new buyer
                    inquiries in the past week. Premium pricing available for certified organic products.
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">Updated 5 hours ago</p>
                </div>
              </div>
            </div>
            <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
              <div className="flex items-start gap-3">
                <BarChart3 className="h-5 w-5 text-yellow-500 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-yellow-500">Demand Forecast</p>
                  <p className="text-sm text-foreground mt-1">
                    Shea nut demand is projected to increase 15% over the next quarter based on seasonal
                    patterns and international market trends. Prepare inventory accordingly.
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">Updated 1 day ago</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
