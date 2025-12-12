'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  FileText,
  Download,
  Calendar,
  TrendingUp,
  Users,
  DollarSign,
  ShoppingBag,
  Filter,
  Table,
  File,
} from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { useCurrency } from '@/contexts/currency-context'
import apiClient from '@/lib/api-client'

interface Report {
  id: string
  name: string
  type: 'analytics' | 'users' | 'transactions' | 'compliance' | 'financial' | 'custom'
  format: 'pdf' | 'csv' | 'excel'
  generatedAt: string
  generatedBy: string
  size: string
  status: 'ready' | 'generating' | 'failed'
  downloadUrl?: string
}

export default function ReportsPage() {
  const { formatCurrency } = useCurrency()
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(false)
  const [reportType, setReportType] = useState<'analytics' | 'users' | 'transactions' | 'compliance' | 'financial'>('analytics')
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | '1y' | 'custom'>('30d')

  useEffect(() => {
    fetchReports()
  }, [])

  const fetchReports = async () => {
    try {
      // TODO: Replace with actual API endpoint
      // const response = await apiClient.get('/admin/reports')

      // Mock data
      const mockReports: Report[] = [
        {
          id: '1',
          name: 'Platform Analytics Report - Q1 2024',
          type: 'analytics',
          format: 'pdf',
          generatedAt: new Date(Date.now() - 86400000).toISOString(),
          generatedBy: 'Admin User',
          size: '2.4 MB',
          status: 'ready',
        },
        {
          id: '2',
          name: 'User Growth Report - March 2024',
          type: 'users',
          format: 'csv',
          generatedAt: new Date(Date.now() - 172800000).toISOString(),
          generatedBy: 'Admin User',
          size: '856 KB',
          status: 'ready',
        },
        {
          id: '3',
          name: 'Transaction Summary - February 2024',
          type: 'transactions',
          format: 'excel',
          generatedAt: new Date(Date.now() - 259200000).toISOString(),
          generatedBy: 'Admin User',
          size: '1.8 MB',
          status: 'ready',
        },
        {
          id: '4',
          name: 'Compliance Audit Report - Q1 2024',
          type: 'compliance',
          format: 'pdf',
          generatedAt: new Date(Date.now() - 345600000).toISOString(),
          generatedBy: 'Admin User',
          size: '3.2 MB',
          status: 'ready',
        },
        {
          id: '5',
          name: 'Financial Summary - January 2024',
          type: 'financial',
          format: 'pdf',
          generatedAt: new Date(Date.now() - 432000000).toISOString(),
          generatedBy: 'Admin User',
          size: '1.5 MB',
          status: 'ready',
        },
      ]

      setReports(mockReports)
    } catch (error) {
      console.error('Failed to fetch reports:', error)
    }
  }

  const handleGenerateReport = async () => {
    try {
      setLoading(true)
      // TODO: Replace with actual API endpoint
      // const response = await apiClient.post('/admin/reports/generate', {
      //   type: reportType,
      //   dateRange,
      // })

      // Simulate report generation
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const newReport: Report = {
        id: Date.now().toString(),
        name: `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report - ${new Date().toLocaleDateString()}`,
        type: reportType,
        format: 'pdf',
        generatedAt: new Date().toISOString(),
        generatedBy: 'Admin User',
        size: '1.2 MB',
        status: 'ready',
      }

      setReports((prev) => [newReport, ...prev])
    } catch (error) {
      console.error('Failed to generate report:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = (reportId: string) => {
    // TODO: Implement actual download
    console.log('Downloading report:', reportId)
  }

  const getTypeBadge = (type: string) => {
    const colors = {
      analytics: 'bg-blue-500/10 text-blue-300 border-blue-500',
      users: 'bg-green-500/10 text-green-300 border-green-500',
      transactions: 'bg-purple-500/10 text-purple-300 border-purple-500',
      compliance: 'bg-yellow-500/10 text-yellow-300 border-yellow-500',
      financial: 'bg-emerald-500/10 text-emerald-300 border-emerald-500',
      custom: 'bg-gray-500/10 text-gray-300 border-gray-500',
    }
    return (
      <Badge variant="outline" className={colors[type as keyof typeof colors]}>
        {type.toUpperCase()}
      </Badge>
    )
  }

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'pdf':
        return <FileText className="h-4 w-4 text-red-500" />
      case 'csv':
      case 'excel':
        return <Table className="h-4 w-4 text-green-500" />
      default:
        return <File className="h-4 w-4" />
    }
  }

  const stats = {
    total: reports.length,
    ready: reports.filter((r) => r.status === 'ready').length,
    generating: reports.filter((r) => r.status === 'generating').length,
  }

  return (
    <div className="space-y-6 text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-primary to-emerald-600 bg-clip-text text-transparent">
            Reports
          </h1>
          <p className="text-gray-300 mt-1">Generate and manage platform reports</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="bg-slate-900 border-white/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Total Reports</CardTitle>
            <FileText className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.total}</div>
            <p className="text-xs text-gray-400 mt-1">All generated reports</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-white/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Ready</CardTitle>
            <Download className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.ready}</div>
            <p className="text-xs text-gray-400 mt-1">Available for download</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-white/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Generating</CardTitle>
            <Calendar className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.generating}</div>
            <p className="text-xs text-gray-400 mt-1">In progress</p>
          </CardContent>
        </Card>
      </div>

      {/* Generate Report */}
      <Card className="bg-slate-900 border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Generate New Report</CardTitle>
          <CardDescription className="text-gray-400">Create a custom report with selected parameters</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Report Type</label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value as typeof reportType)}
                className="w-full h-10 rounded-lg border border-gray-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-primary focus:ring-2 focus:ring-primary/40"
              >
                <option value="analytics">Platform Analytics</option>
                <option value="users">User Management</option>
                <option value="transactions">Transactions</option>
                <option value="compliance">Compliance</option>
                <option value="financial">Financial</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Date Range</label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value as typeof dateRange)}
                className="w-full h-10 rounded-lg border border-gray-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-primary focus:ring-2 focus:ring-primary/40"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
                <option value="custom">Custom range</option>
              </select>
            </div>
          </div>
          <Button
            onClick={handleGenerateReport}
            disabled={loading}
            className="mt-4 shadow-glow"
          >
            {loading ? (
              <>
                <Calendar className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <FileText className="h-4 w-4 mr-2" />
                Generate Report
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Reports List */}
      <Card className="bg-slate-900 border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Generated Reports ({reports.length})</CardTitle>
          <CardDescription className="text-gray-400">Download and manage your reports</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reports.map((report) => (
              <div
                key={report.id}
                className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-white/10 hover:bg-slate-800 transition-colors"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className={`p-3 rounded-lg ${
                    report.format === 'pdf' ? 'bg-red-500/10' :
                    report.format === 'csv' ? 'bg-green-500/10' :
                    'bg-blue-500/10'
                  }`}>
                    {getFormatIcon(report.format)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-white">{report.name}</h3>
                      {getTypeBadge(report.type)}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(report.generatedAt)}
                      </span>
                      <span>•</span>
                      <span>{report.size}</span>
                      <span>•</span>
                      <span>By {report.generatedBy}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {report.status === 'ready' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(report.id)}
                      className="bg-slate-700 border-gray-600 text-white hover:bg-slate-600"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  )}
                  {report.status === 'generating' && (
                    <Badge variant="warning" className="bg-yellow-600/20 text-yellow-300 border-yellow-600">
                      Generating...
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>

          {reports.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <FileText className="h-12 w-12 mx-auto mb-4" />
              <p>No reports generated yet. Create your first report above.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

