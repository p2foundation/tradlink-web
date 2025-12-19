'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  TrendingUp,
  Users,
  Package,
  Globe,
  Shield,
  Activity,
  BarChart3,
  PieChart,
  FileText,
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Download,
} from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { useCurrency } from '@/contexts/currency-context'
import apiClient from '@/lib/api-client'
import { useToast } from '@/hooks/use-toast'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'

interface SingleWindowIntegration {
  name: string
  system: 'GCMS' | 'PAARS' | 'ICUMS' | 'UNIPASS'
  status: 'active' | 'warning' | 'error'
  lastSync: string
  apiEndpoint: string
  uptime: number
  totalRequests: number
  successRate: number
}

interface ExportTrend {
  date: string
  value: number
  volume: number
  transactions: number
}

interface MSMEParticipation {
  totalMSMEs: number
  activeMSMEs: number
  newThisMonth: number
  growthRate: number
  byRole: Array<{ role: string; count: number; percentage: number }>
  byRegion: Array<{ region: string; count: number }>
}

interface CommodityFlow {
  commodity: string
  exportVolume: number
  exportValue: number
  destination: string
  clearanceTime: number
  complianceRate: number
}

interface ComplianceMetrics {
  overallCompliance: number
  afcftaCompliance: number
  clearanceTimeAvg: number
  clearanceTimeReduction: number
  issuesCount: number
  resolvedIssues: number
  byCategory: Array<{ category: string; count: number; percentage: number }>
}

const COLORS = ['#059669', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

export function GovernmentDashboard({ user }: { user: any }) {
  const { formatCurrency } = useCurrency()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  
  // Single Window Integration Status
  const [integrations, setIntegrations] = useState<SingleWindowIntegration[]>([])
  
  // Export Trends
  const [exportTrends, setExportTrends] = useState<ExportTrend[]>([])
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d')
  
  // MSME Participation
  const [msmeData, setMsmeData] = useState<MSMEParticipation>({
    totalMSMEs: 0,
    activeMSMEs: 0,
    newThisMonth: 0,
    growthRate: 0,
    byRole: [],
    byRegion: [],
  })
  
  // Commodity Flows
  const [commodityFlows, setCommodityFlows] = useState<CommodityFlow[]>([])
  
  // Compliance Metrics
  const [complianceMetrics, setComplianceMetrics] = useState<ComplianceMetrics>({
    overallCompliance: 0,
    afcftaCompliance: 0,
    clearanceTimeAvg: 0,
    clearanceTimeReduction: 0,
    issuesCount: 0,
    resolvedIssues: 0,
    byCategory: [],
  })

  useEffect(() => {
    fetchDashboardData()
    const interval = setInterval(fetchDashboardData, 60000) // Refresh every minute
    return () => clearInterval(interval)
  }, [timeRange])

  const fetchDashboardData = async () => {
    try {
      setRefreshing(true)
      
      // Fetch Single Window Integration Status
      await fetchSingleWindowStatus()
      
      // Fetch Export Trends
      await fetchExportTrends()
      
      // Fetch MSME Participation
      await fetchMSMEParticipation()
      
      // Fetch Commodity Flows
      await fetchCommodityFlows()
      
      // Fetch Compliance Metrics
      await fetchComplianceMetrics()
      
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load dashboard data',
      })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const fetchSingleWindowStatus = async () => {
    try {
      // TODO: Replace with actual API endpoint
      // const response = await apiClient.get('/government/single-window-status')
      
      // Mock data for Ghana Single Window systems
      setIntegrations([
        {
          name: 'Ghana GCMS',
          system: 'GCMS',
          status: 'active',
          lastSync: new Date().toISOString(),
          apiEndpoint: 'https://api.gcms.gov.gh',
          uptime: 99.8,
          totalRequests: 125000,
          successRate: 98.5,
        },
        {
          name: 'PAARS',
          system: 'PAARS',
          status: 'active',
          lastSync: new Date(Date.now() - 120000).toISOString(),
          apiEndpoint: 'https://api.paars.gov.gh',
          uptime: 99.5,
          totalRequests: 89000,
          successRate: 97.2,
        },
        {
          name: 'ICUMS/UNIPASS',
          system: 'ICUMS',
          status: 'active',
          lastSync: new Date(Date.now() - 60000).toISOString(),
          apiEndpoint: 'https://external.unipassghana.com',
          uptime: 99.9,
          totalRequests: 245000,
          successRate: 99.1,
        },
      ])
    } catch (error) {
      console.error('Failed to fetch Single Window status:', error)
    }
  }

  const fetchExportTrends = async () => {
    try {
      const response = await apiClient.get(`/government/export-trends?range=${timeRange}`)
      if (response.data?.trends && response.data.trends.length > 0) {
        setExportTrends(response.data.trends)
        return
      }
      
      // Fallback to mock data if API not ready
      const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 365
      const today = new Date()
      
      const trends = Array.from({ length: days }, (_, i) => {
        const date = new Date(today)
        date.setDate(today.getDate() - (days - 1 - i))
        return {
          date: date.toISOString(),
          value: 500000 + Math.random() * 200000 + i * 5000,
          volume: 100 + Math.random() * 50 + i * 2,
          transactions: 20 + Math.random() * 10 + i * 0.5,
        }
      })
      
      setExportTrends(trends)
    } catch (error) {
      console.error('Failed to fetch export trends:', error)
    }
  }

  const fetchMSMEParticipation = async () => {
    try {
      const response = await apiClient.get('/government/msme-participation')
      if (response.data) {
        setMsmeData(response.data)
        return
      }
      
      // Fallback to mock data if API not ready
      setMsmeData({
        totalMSMEs: 2150,
        activeMSMEs: 1890,
        newThisMonth: 125,
        growthRate: 12.5,
        byRole: [
          { role: 'Farmers', count: 1250, percentage: 58.1 },
          { role: 'Export Companies', count: 25, percentage: 1.2 },
          { role: 'Traders', count: 180, percentage: 8.4 },
          { role: 'Buyers', count: 180, percentage: 8.4 },
          { role: 'Agribusiness', count: 515, percentage: 23.9 },
        ],
        byRegion: [
          { region: 'Ashanti', count: 450 },
          { region: 'Greater Accra', count: 380 },
          { region: 'Western', count: 320 },
          { region: 'Eastern', count: 280 },
          { region: 'Central', count: 250 },
          { region: 'Bono', count: 220 },
          { region: 'Volta', count: 150 },
          { region: 'Northern', count: 100 },
        ],
      })
    } catch (error) {
      console.error('Failed to fetch MSME participation:', error)
    }
  }

  const fetchCommodityFlows = async () => {
    try {
      // TODO: Replace with actual API endpoint
      // const response = await apiClient.get('/government/commodity-flows')
      
      setCommodityFlows([
        {
          commodity: 'Cocoa Beans',
          exportVolume: 1250,
          exportValue: 1250000,
          destination: 'Netherlands, Germany, UK',
          clearanceTime: 2.5,
          complianceRate: 96.5,
        },
        {
          commodity: 'Shea Butter',
          exportVolume: 450,
          exportValue: 675000,
          destination: 'USA, France, UK',
          clearanceTime: 2.2,
          complianceRate: 94.8,
        },
        {
          commodity: 'Cashew Nuts',
          exportVolume: 320,
          exportValue: 480000,
          destination: 'India, Vietnam, Brazil',
          clearanceTime: 2.8,
          complianceRate: 93.2,
        },
        {
          commodity: 'Coffee',
          exportVolume: 180,
          exportValue: 270000,
          destination: 'USA, Germany, Japan',
          clearanceTime: 2.1,
          complianceRate: 95.5,
        },
        {
          commodity: 'Palm Oil',
          exportVolume: 95,
          exportValue: 142500,
          destination: 'Nigeria, Togo, Benin',
          clearanceTime: 1.9,
          complianceRate: 97.1,
        },
      ])
    } catch (error) {
      console.error('Failed to fetch commodity flows:', error)
    }
  }

  const fetchComplianceMetrics = async () => {
    try {
      const response = await apiClient.get('/government/compliance-metrics')
      if (response.data) {
        setComplianceMetrics(response.data)
        return
      }
      
      // Fallback to mock data if API not ready
      setComplianceMetrics({
        overallCompliance: 94.5,
        afcftaCompliance: 96.2,
        clearanceTimeAvg: 2.4,
        clearanceTimeReduction: 87.5,
        issuesCount: 12,
        resolvedIssues: 145,
        byCategory: [
          { category: 'Documentation', count: 45, percentage: 31.0 },
          { category: 'Rules of Origin', count: 38, percentage: 26.2 },
          { category: 'Quality Standards', count: 32, percentage: 22.1 },
          { category: 'Customs Procedures', count: 20, percentage: 13.8 },
          { category: 'Other', count: 10, percentage: 6.9 },
        ],
      })
    } catch (error) {
      console.error('Failed to fetch compliance metrics:', error)
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

  const totalExportValue = exportTrends.reduce((sum, trend) => sum + trend.value, 0)
  const avgClearanceTime = complianceMetrics.clearanceTimeAvg

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-primary to-emerald-600 bg-clip-text text-transparent">
            Government Dashboard
          </h1>
          <p className="text-gray-300 mt-1">
            Real-time insights for policy decisions • Ghana Single Window Integration
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchDashboardData}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Single Window Integration Status */}
      <Card className="bg-slate-900 border-white/10">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white">Ghana Single Window Integration</CardTitle>
              <CardDescription className="text-gray-400">
                Real-time status of GCMS, PAARS, and ICUMS/UNIPASS systems
              </CardDescription>
            </div>
            <Badge variant="success" className="text-sm">
              <Activity className="h-3 w-3 mr-1" />
              All Systems Operational
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {integrations.map((integration, idx) => (
              <div
                key={idx}
                className="p-4 bg-slate-800/50 rounded-lg border border-slate-700/50 hover:border-primary/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      integration.status === 'active' ? 'bg-green-500/10' : 
                      integration.status === 'warning' ? 'bg-yellow-500/10' : 'bg-red-500/10'
                    }`}>
                      <Globe className={`h-5 w-5 ${
                        integration.status === 'active' ? 'text-green-500' : 
                        integration.status === 'warning' ? 'text-yellow-500' : 'text-red-500'
                      }`} />
                    </div>
                    <div>
                      <p className="font-semibold text-white">{integration.name}</p>
                      <p className="text-xs text-gray-400">{integration.system}</p>
                    </div>
                  </div>
                  {getIntegrationStatusBadge(integration.status)}
                </div>
                <div className="space-y-2 mt-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Uptime</span>
                    <span className="text-white font-medium">{integration.uptime}%</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Success Rate</span>
                    <span className="text-white font-medium">{integration.successRate}%</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Total Requests</span>
                    <span className="text-white font-medium">{integration.totalRequests.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Last Sync</span>
                    <span className="text-white font-medium text-xs">
                      {formatDate(integration.lastSync)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-glow transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Export Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent className="min-w-0">
            <div className="text-xl sm:text-2xl font-bold text-foreground truncate" title={formatCurrency(totalExportValue)}>
              {formatCurrency(totalExportValue)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Last {timeRange}</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-glow transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">MSME Participation</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent className="min-w-0">
            <div className="text-xl sm:text-2xl font-bold text-foreground truncate">
              {msmeData.totalMSMEs.toLocaleString()}
            </div>
            <div className="flex items-center gap-1 mt-1">
              <ArrowUpRight className="h-3 w-3 text-green-500" />
              <p className="text-xs text-muted-foreground">
                {msmeData.growthRate}% growth • {msmeData.activeMSMEs} active
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-glow transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Clearance Time</CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent className="min-w-0">
            <div className="text-xl sm:text-2xl font-bold text-foreground truncate">
              {avgClearanceTime} days
            </div>
            <div className="flex items-center gap-1 mt-1">
              <ArrowDownRight className="h-3 w-3 text-green-500" />
              <p className="text-xs text-muted-foreground">
                {complianceMetrics.clearanceTimeReduction}% reduction
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-glow transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Compliance Rate</CardTitle>
            <Shield className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent className="min-w-0">
            <div className="text-xl sm:text-2xl font-bold text-foreground truncate">
              {complianceMetrics.overallCompliance}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              AfCFTA: {complianceMetrics.afcftaCompliance}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Export Trends */}
      <Card className="bg-slate-900 border-white/10">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white">Export Trends</CardTitle>
              <CardDescription className="text-gray-400">
                Real-time export value and volume trends
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {(['7d', '30d', '90d', '1y'] as const).map((range) => (
                <Button
                  key={range}
                  variant={timeRange === range ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTimeRange(range)}
                >
                  {range.toUpperCase()}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={exportTrends}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#059669" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12, fill: '#9ca3af' }}
                tickFormatter={(value) => {
                  const date = new Date(value)
                  return timeRange === '7d' 
                    ? date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                    : date.toLocaleDateString('en-US', { month: 'short' })
                }}
              />
              <YAxis
                yAxisId="left"
                tick={{ fontSize: 12, fill: '#9ca3af' }}
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                tick={{ fontSize: 12, fill: '#9ca3af' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  color: '#f1f5f9',
                }}
                formatter={(value: number, name: string) => {
                  if (name === 'value') return formatCurrency(value)
                  if (name === 'volume') return `${value.toFixed(1)} tons`
                  return value
                }}
              />
              <Legend />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="value"
                stroke="#059669"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorValue)"
                name="Export Value"
              />
              <Area
                yAxisId="right"
                type="monotone"
                dataKey="volume"
                stroke="#3b82f6"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorVolume)"
                name="Volume (tons)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* MSME Participation & Commodity Flows */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* MSME Participation */}
        <Card className="bg-slate-900 border-white/10">
          <CardHeader>
            <CardTitle className="text-white">MSME Participation</CardTitle>
            <CardDescription className="text-gray-400">
              Distribution by role and region
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Role Distribution */}
              <div>
                <h4 className="text-sm font-medium text-gray-300 mb-3">By Role</h4>
                <ResponsiveContainer width="100%" height={200}>
                  <RechartsPieChart>
                    <Pie
                      data={msmeData.byRole}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percentage }) => `${name}: ${percentage}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {msmeData.byRole.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>

              {/* Top Regions */}
              <div>
                <h4 className="text-sm font-medium text-gray-300 mb-3">Top Regions</h4>
                <div className="space-y-2">
                  {msmeData.byRegion.slice(0, 5).map((region, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-slate-800/50 rounded">
                      <span className="text-sm text-white">{region.region}</span>
                      <Badge variant="outline">{region.count} MSMEs</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Commodity Flows */}
        <Card className="bg-slate-900 border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Commodity Flow</CardTitle>
            <CardDescription className="text-gray-400">
              Top export commodities and destinations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={commodityFlows} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis type="number" tick={{ fontSize: 12, fill: '#9ca3af' }} />
                <YAxis
                  type="category"
                  dataKey="commodity"
                  tick={{ fontSize: 12, fill: '#9ca3af' }}
                  width={100}
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
                <Bar dataKey="exportValue" fill="#059669" name="Export Value" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Compliance Metrics */}
      <Card className="bg-slate-900 border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Compliance Metrics</CardTitle>
          <CardDescription className="text-gray-400">
            Real-time compliance monitoring and issue tracking
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            {/* Compliance Overview */}
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-400">Overall Compliance</p>
                  <p className="text-2xl font-bold text-white">{complianceMetrics.overallCompliance}%</p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-green-500" />
              </div>
              <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-400">AfCFTA Compliance</p>
                  <p className="text-2xl font-bold text-white">{complianceMetrics.afcftaCompliance}%</p>
                </div>
                <Globe className="h-8 w-8 text-blue-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-800/50 rounded-lg">
                  <p className="text-sm text-gray-400">Active Issues</p>
                  <p className="text-xl font-bold text-white">{complianceMetrics.issuesCount}</p>
                </div>
                <div className="p-4 bg-slate-800/50 rounded-lg">
                  <p className="text-sm text-gray-400">Resolved</p>
                  <p className="text-xl font-bold text-green-500">{complianceMetrics.resolvedIssues}</p>
                </div>
              </div>
            </div>

            {/* Issues by Category */}
            <div>
              <h4 className="text-sm font-medium text-gray-300 mb-3">Issues by Category</h4>
              <div className="space-y-3">
                {complianceMetrics.byCategory.map((category, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-white">{category.category}</span>
                      <span className="text-gray-400">{category.count} ({category.percentage}%)</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-2">
                      <div
                        className="h-2 rounded-full"
                        style={{
                          width: `${category.percentage}%`,
                          backgroundColor: COLORS[idx % COLORS.length],
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Commodity Details Table */}
      <Card className="bg-slate-900 border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Commodity Export Details</CardTitle>
          <CardDescription className="text-gray-400">
            Detailed breakdown of commodity flows with clearance times and compliance rates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-300">Commodity</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-300">Volume (tons)</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-300">Value</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-300">Destination</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-300">Clearance (days)</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-300">Compliance</th>
                </tr>
              </thead>
              <tbody>
                {commodityFlows.map((flow, idx) => (
                  <tr key={idx} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4 text-sm text-white font-medium">{flow.commodity}</td>
                    <td className="py-3 px-4 text-sm text-white text-right">{flow.exportVolume.toLocaleString()}</td>
                    <td className="py-3 px-4 text-sm text-white text-right">{formatCurrency(flow.exportValue)}</td>
                    <td className="py-3 px-4 text-sm text-gray-400">{flow.destination}</td>
                    <td className="py-3 px-4 text-sm text-white text-right">{flow.clearanceTime} days</td>
                    <td className="py-3 px-4 text-right">
                      <Badge variant={flow.complianceRate >= 95 ? 'success' : flow.complianceRate >= 90 ? 'warning' : 'destructive'}>
                        {flow.complianceRate}%
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
