'use client'

import { useEffect, useState, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  ShoppingBag,
  Handshake,
  Activity,
  Download,
  Calendar,
} from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { useCurrency } from '@/contexts/currency-context'
import apiClient from '@/lib/api-client'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { useToast } from '@/hooks/use-toast'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'

const COLORS = ['#059669', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

export default function AnalyticsPage() {
  const { formatCurrency } = useCurrency()
  const { toast } = useToast()
  const reportRef = useRef<HTMLDivElement>(null)
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d')
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)
  const [metrics, setMetrics] = useState({
    totalUsers: 0,
    totalFarmers: 0,
    totalBuyers: 0,
    totalExportCompanies: 0,
    totalListings: 0,
    activeListings: 0,
    totalMatches: 0,
    activeMatches: 0,
    totalTransactions: 0,
    completedTransactions: 0,
    platformTradeValue: 0,
    avgTransactionValue: 0,
    userGrowthRate: 0,
    transactionGrowthRate: 0,
  })

  const [chartData, setChartData] = useState<any[]>([])
  const [roleDistribution, setRoleDistribution] = useState<any[]>([])
  const [transactionTrends, setTransactionTrends] = useState<any[]>([])
  const [topCrops, setTopCrops] = useState<any[]>([])
  const [topRegions, setTopRegions] = useState<any[]>([])

  useEffect(() => {
    fetchAnalytics()
    const interval = setInterval(fetchAnalytics, 60000) // Refresh every minute
    return () => clearInterval(interval)
  }, [timeRange])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      // TODO: Replace with actual API endpoint
      // const response = await apiClient.get(`/admin/analytics?range=${timeRange}`)

      // Mock data
      const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 365
      const today = new Date()

      setMetrics({
        totalUsers: 2450,
        totalFarmers: 1250,
        totalBuyers: 180,
        totalExportCompanies: 25,
        totalListings: 3420,
        activeListings: 1240,
        totalMatches: 890,
        activeMatches: 156,
        totalTransactions: 450,
        completedTransactions: 380,
        platformTradeValue: 2500000,
        avgTransactionValue: 5555,
        userGrowthRate: 12.5,
        transactionGrowthRate: 8.3,
      })

      // Generate chart data
      const chartDataArray = Array.from({ length: days }, (_, i) => {
        const date = new Date(today)
        date.setDate(today.getDate() - (days - 1 - i))
        return {
          date: date.toISOString(),
          users: 50 + Math.random() * 20 + i * 2,
          transactions: 5 + Math.random() * 5 + i * 0.1,
          tradeValue: 50000 + Math.random() * 50000 + i * 2000,
          matches: 10 + Math.random() * 5 + i * 0.2,
        }
      })
      setChartData(chartDataArray)

      setRoleDistribution([
        { name: 'Farmers', value: 1250, color: COLORS[0] },
        { name: 'Buyers', value: 180, color: COLORS[1] },
        { name: 'Export Companies', value: 25, color: COLORS[2] },
        { name: 'Admins', value: 5, color: COLORS[3] },
      ])

      setTransactionTrends([
        { month: 'Jan', completed: 45, pending: 12, cancelled: 3 },
        { month: 'Feb', completed: 52, pending: 15, cancelled: 2 },
        { month: 'Mar', completed: 48, pending: 18, cancelled: 4 },
        { month: 'Apr', completed: 61, pending: 10, cancelled: 1 },
        { month: 'May', completed: 55, pending: 14, cancelled: 3 },
        { month: 'Jun', completed: 68, pending: 8, cancelled: 2 },
      ])

      setTopCrops([
        { name: 'Cocoa', value: 1250000, transactions: 180 },
        { name: 'Coffee', value: 650000, transactions: 95 },
        { name: 'Cashew', value: 420000, transactions: 68 },
        { name: 'Shea Nuts', value: 180000, transactions: 45 },
        { name: 'Palm Oil', value: 120000, transactions: 32 },
      ])

      setTopRegions([
        { name: 'Ashanti', farmers: 450, transactions: 180, value: 850000 },
        { name: 'Greater Accra', farmers: 320, transactions: 145, value: 620000 },
        { name: 'Western', farmers: 280, transactions: 120, value: 480000 },
        { name: 'Eastern', farmers: 200, transactions: 85, value: 350000 },
        { name: 'Central', farmers: 150, transactions: 60, value: 200000 },
      ])
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const exportReport = async () => {
    if (!reportRef.current) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Unable to generate report. Please try again.',
      })
      return
    }

    try {
      setExporting(true)
      
      // Hide elements that shouldn't be in PDF
      const elementsToHide = reportRef.current.querySelectorAll('.hide-on-pdf')
      const originalDisplays: (string | null)[] = []
      elementsToHide.forEach((el) => {
        originalDisplays.push((el as HTMLElement).style.display)
        ;(el as HTMLElement).style.display = 'none'
      })

      // Ensure proper spacing for PDF
      const originalPadding = reportRef.current.style.padding
      const originalMargin = reportRef.current.style.margin
      reportRef.current.style.padding = '24px'
      reportRef.current.style.margin = '0'
      reportRef.current.style.backgroundColor = '#0f172a'
      reportRef.current.style.width = '100%'
      reportRef.current.style.boxSizing = 'border-box'

      // Capture the content as canvas with better quality
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#0f172a',
        windowWidth: reportRef.current.scrollWidth,
        windowHeight: reportRef.current.scrollHeight,
        allowTaint: true,
      })

      // Restore original styles
      reportRef.current.style.padding = originalPadding
      reportRef.current.style.margin = originalMargin
      elementsToHide.forEach((el, idx) => {
        ;(el as HTMLElement).style.display = originalDisplays[idx] || ''
      })

      const imgData = canvas.toDataURL('image/png', 0.95)
      
      // PDF dimensions in mm (A4)
      const pdfWidth = 210 // A4 width
      const pdfHeight = 297 // A4 height
      const margin = 10 // Margin on all sides
      const contentWidth = pdfWidth - (margin * 2)
      const contentHeight = pdfHeight - (margin * 2)
      
      // Calculate image dimensions
      const imgWidth = canvas.width
      const imgHeight = canvas.height
      const imgAspectRatio = imgWidth / imgHeight
      
      // Calculate how the image fits in PDF pages
      const contentAspectRatio = contentWidth / contentHeight
      let scaledWidth: number
      let scaledHeight: number
      
      if (imgAspectRatio > contentAspectRatio) {
        // Image is wider - fit to width
        scaledWidth = contentWidth
        scaledHeight = contentWidth / imgAspectRatio
      } else {
        // Image is taller - fit to height
        scaledHeight = contentHeight
        scaledWidth = contentHeight * imgAspectRatio
      }
      
      // Create PDF
      const pdf = new jsPDF('p', 'mm', 'a4')
      
      // Title page with proper spacing
      pdf.setFillColor(15, 23, 42) // slate-900
      pdf.rect(0, 0, pdfWidth, pdfHeight, 'F')
      
      pdf.setTextColor(255, 255, 255)
      pdf.setFontSize(28)
      pdf.text('TradeLink+ Platform Analytics Report', pdfWidth / 2, 50, { align: 'center' })
      
      pdf.setFontSize(11)
      pdf.setTextColor(200, 200, 200)
      pdf.text(`Generated: ${new Date().toLocaleString()}`, pdfWidth / 2, 65, { align: 'center' })
      pdf.text(`Time Range: ${timeRange.toUpperCase()}`, pdfWidth / 2, 72, { align: 'center' })
      
      // Add summary metrics with proper spacing
      pdf.setFontSize(16)
      pdf.setTextColor(255, 255, 255)
      pdf.text('Key Metrics Summary', margin, 95)
      
      pdf.setFontSize(11)
      pdf.setTextColor(200, 200, 200)
      let yPos = 105
      const lineHeight = 8
      
      pdf.text(`Total Users: ${metrics.totalUsers.toLocaleString()}`, margin, yPos)
      yPos += lineHeight
      pdf.text(`Farmers: ${metrics.totalFarmers} | Buyers: ${metrics.totalBuyers}`, margin, yPos)
      yPos += lineHeight
      pdf.text(`Platform Trade Value: ${formatCurrency(metrics.platformTradeValue)}`, margin, yPos)
      yPos += lineHeight
      pdf.text(`Active Listings: ${metrics.activeListings} of ${metrics.totalListings}`, margin, yPos)
      yPos += lineHeight
      pdf.text(`Active Matches: ${metrics.activeMatches} of ${metrics.totalMatches}`, margin, yPos)
      yPos += lineHeight
      pdf.text(`Total Transactions: ${metrics.totalTransactions}`, margin, yPos)
      yPos += lineHeight
      pdf.text(`Completed Transactions: ${metrics.completedTransactions}`, margin, yPos)
      
      // Add charts on subsequent pages
      pdf.addPage()
      
      // Split image across multiple pages properly
      const totalPagesNeeded = Math.ceil(scaledHeight / contentHeight)
      
      for (let page = 0; page < totalPagesNeeded; page++) {
        if (page > 0) {
          pdf.addPage()
        }
        
        // Calculate the portion of image to show on this page
        const remainingHeight = scaledHeight - (page * contentHeight)
        const pageHeight = Math.min(contentHeight, remainingHeight)
        
        // Calculate source coordinates
        const sourceY = (page * contentHeight * canvas.height) / scaledHeight
        const sourceHeight = (pageHeight * canvas.height) / scaledHeight
        
        // Create a temporary canvas for this page slice
        const pageCanvas = document.createElement('canvas')
        pageCanvas.width = canvas.width
        pageCanvas.height = sourceHeight
        const pageCtx = pageCanvas.getContext('2d')
        
        if (pageCtx) {
          // Draw the slice of the original canvas
          pageCtx.drawImage(
            canvas,
            0, sourceY, canvas.width, sourceHeight,
            0, 0, canvas.width, sourceHeight
          )
        }
        
        const pageImgData = pageCanvas.toDataURL('image/png', 0.95)
        
        // Add image to PDF with proper margins
        pdf.addImage(
          pageImgData,
          'PNG',
          margin,
          margin,
          scaledWidth,
          pageHeight,
          undefined,
          'FAST'
        )
      }
      
      // Generate filename
      const dateStr = new Date().toISOString().split('T')[0]
      const filename = `tradelink-analytics-${dateStr}-${timeRange}.pdf`
      
      // Save PDF
      pdf.save(filename)
      
      toast({
        variant: 'success',
        title: 'Report Exported',
        description: `Analytics report saved as ${filename}`,
      })
    } catch (error) {
      console.error('Error exporting report:', error)
      toast({
        variant: 'destructive',
        title: 'Export Failed',
        description: 'Failed to generate PDF report. Please try again.',
      })
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="space-y-6 text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 hide-on-pdf" style={{ pageBreakInside: 'avoid' }}>
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-primary to-emerald-600 bg-clip-text text-transparent">
            Platform Analytics
          </h1>
          <p className="text-gray-300 mt-1">Comprehensive insights into platform performance</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-slate-900 border border-white/10 rounded-lg p-1">
            {(['7d', '30d', '90d', '1y'] as const).map((range) => (
              <Button
                key={range}
                variant={timeRange === range ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setTimeRange(range)}
                className={timeRange === range ? 'bg-primary text-white' : 'text-gray-400'}
              >
                {range.toUpperCase()}
              </Button>
            ))}
          </div>
          <Button 
            onClick={exportReport} 
            variant="outline" 
            className="shadow-glow"
            disabled={exporting || loading}
          >
            {exporting ? (
              <>
                <span className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Generating PDF...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Report Content - This will be captured for PDF */}
      <div ref={reportRef} className="space-y-6 pt-4">
      {/* Key Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-slate-900 border-white/10 hover:shadow-glow transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Total Users</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{metrics.totalUsers.toLocaleString()}</div>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3 text-green-500" />
              <p className="text-xs text-green-500">{metrics.userGrowthRate}% growth</p>
            </div>
            <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
              <span>Farmers: {metrics.totalFarmers}</span>
              <span>Buyers: {metrics.totalBuyers}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-white/10 hover:shadow-glow transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Platform Trade Value</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{formatCurrency(metrics.platformTradeValue)}</div>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3 text-green-500" />
              <p className="text-xs text-green-500">{metrics.transactionGrowthRate}% growth</p>
            </div>
            <p className="text-xs text-gray-400 mt-2">Avg: {formatCurrency(metrics.avgTransactionValue)}</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-white/10 hover:shadow-glow transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Active Listings</CardTitle>
            <ShoppingBag className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{metrics.activeListings.toLocaleString()}</div>
            <p className="text-xs text-gray-400 mt-1">of {metrics.totalListings.toLocaleString()} total</p>
            <div className="mt-2 h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${(metrics.activeListings / metrics.totalListings) * 100}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-white/10 hover:shadow-glow transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Active Matches</CardTitle>
            <Handshake className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{metrics.activeMatches}</div>
            <p className="text-xs text-gray-400 mt-1">of {metrics.totalMatches} total</p>
            <div className="mt-2 h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-purple-500 transition-all"
                style={{ width: `${(metrics.activeMatches / metrics.totalMatches) * 100}%` }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="bg-slate-900 border-white/10">
          <CardHeader>
            <CardTitle className="text-white">User Growth</CardTitle>
            <CardDescription className="text-gray-400">New user registrations over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
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
                <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    color: '#f1f5f9',
                  }}
                />
                <Area type="monotone" dataKey="users" stroke="#059669" strokeWidth={2} fillOpacity={1} fill="url(#colorUsers)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Trade Value Trend</CardTitle>
            <CardDescription className="text-gray-400">Platform trade value over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
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
                <Line type="monotone" dataKey="tradeValue" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6' }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="bg-slate-900 border-white/10">
          <CardHeader>
            <CardTitle className="text-white">User Role Distribution</CardTitle>
            <CardDescription className="text-gray-400">Breakdown by user type</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={roleDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {roleDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    color: '#f1f5f9',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Transaction Status</CardTitle>
            <CardDescription className="text-gray-400">Monthly transaction breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={transactionTrends}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#9ca3af' }} />
                <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    color: '#f1f5f9',
                  }}
                />
                <Legend />
                <Bar dataKey="completed" stackId="a" fill="#059669" />
                <Bar dataKey="pending" stackId="a" fill="#f59e0b" />
                <Bar dataKey="cancelled" stackId="a" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Crops & Regions */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="bg-slate-900 border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Top Crops by Value</CardTitle>
            <CardDescription className="text-gray-400">Highest value crops on the platform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topCrops.map((crop, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <ShoppingBag className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-white">{crop.name}</p>
                      <p className="text-xs text-gray-400">{crop.transactions} transactions</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-white">{formatCurrency(crop.value)}</p>
                    <div className="mt-1 h-2 w-24 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all"
                        style={{ width: `${(crop.value / topCrops[0].value) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Top Regions</CardTitle>
            <CardDescription className="text-gray-400">Most active regions by farmers and transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topRegions.map((region, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/10 rounded-lg">
                      <Activity className="h-4 w-4 text-blue-500" />
                    </div>
                    <div>
                      <p className="font-medium text-white">{region.name}</p>
                      <p className="text-xs text-gray-400">
                        {region.farmers} farmers • {region.transactions} transactions
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-white">{formatCurrency(region.value)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      </div>
    </div>
  )
}

