'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Shield,
  AlertCircle,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  Download,
  Eye,
  XCircle,
  FileText,
} from 'lucide-react'
import { formatDate } from '@/lib/utils'
import apiClient from '@/lib/api-client'

interface ComplianceIssue {
  id: string
  type: 'certificate_expired' | 'document_missing' | 'quality_issue' | 'regulatory_violation' | 'standard_non_compliance'
  severity: 'low' | 'medium' | 'high' | 'critical'
  status: 'open' | 'in_review' | 'resolved' | 'dismissed'
  entityType: 'farmer' | 'buyer' | 'export_company' | 'listing' | 'transaction'
  entityId: string
  entityName: string
  description: string
  detectedAt: string
  resolvedAt?: string
  assignedTo?: string
}

export default function ComplianceMonitoringPage() {
  const [issues, setIssues] = useState<ComplianceIssue[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [severityFilter, setSeverityFilter] = useState<'ALL' | 'low' | 'medium' | 'high' | 'critical'>('ALL')
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'open' | 'in_review' | 'resolved' | 'dismissed'>('ALL')

  useEffect(() => {
    fetchComplianceIssues()
    const interval = setInterval(fetchComplianceIssues, 60000)
    return () => clearInterval(interval)
  }, [])

  const fetchComplianceIssues = async () => {
    try {
      setLoading(true)
      // TODO: Replace with actual API endpoint
      // const response = await apiClient.get('/admin/compliance/issues')

      // Mock data
      const mockIssues: ComplianceIssue[] = [
        {
          id: '1',
          type: 'certificate_expired',
          severity: 'high',
          status: 'open',
          entityType: 'farmer',
          entityId: 'farmer-1',
          entityName: 'Farm Cooperative 1',
          description: 'Organic certification expired on 2024-01-15',
          detectedAt: new Date(Date.now() - 86400000).toISOString(),
        },
        {
          id: '2',
          type: 'document_missing',
          severity: 'medium',
          status: 'in_review',
          entityType: 'buyer',
          entityId: 'buyer-1',
          entityName: 'Swiss Trading Co.',
          description: 'Missing import license for cocoa products',
          detectedAt: new Date(Date.now() - 172800000).toISOString(),
          assignedTo: 'Admin User',
        },
        {
          id: '3',
          type: 'quality_issue',
          severity: 'critical',
          status: 'open',
          entityType: 'listing',
          entityId: 'listing-1',
          entityName: 'Cocoa Beans - Premium Grade',
          description: 'Quality test results below stated grade standards',
          detectedAt: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          id: '4',
          type: 'regulatory_violation',
          severity: 'high',
          status: 'resolved',
          entityType: 'transaction',
          entityId: 'txn-1',
          entityName: 'Transaction #1234',
          description: 'Export documentation incomplete',
          detectedAt: new Date(Date.now() - 604800000).toISOString(),
          resolvedAt: new Date(Date.now() - 259200000).toISOString(),
        },
        {
          id: '5',
          type: 'standard_non_compliance',
          severity: 'low',
          status: 'dismissed',
          entityType: 'farmer',
          entityId: 'farmer-2',
          entityName: 'Farm Cooperative 2',
          description: 'Minor packaging standard deviation',
          detectedAt: new Date(Date.now() - 1209600000).toISOString(),
        },
      ]

      setIssues(mockIssues)
    } catch (error) {
      console.error('Failed to fetch compliance issues:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredIssues = issues.filter((issue) => {
    const matchesSearch = search === '' || 
      issue.entityName.toLowerCase().includes(search.toLowerCase()) ||
      issue.description.toLowerCase().includes(search.toLowerCase())
    const matchesSeverity = severityFilter === 'ALL' || issue.severity === severityFilter
    const matchesStatus = statusFilter === 'ALL' || issue.status === statusFilter
    return matchesSearch && matchesSeverity && matchesStatus
  })

  const stats = {
    total: issues.length,
    open: issues.filter((i) => i.status === 'open').length,
    inReview: issues.filter((i) => i.status === 'in_review').length,
    resolved: issues.filter((i) => i.status === 'resolved').length,
    critical: issues.filter((i) => i.severity === 'critical').length,
    high: issues.filter((i) => i.severity === 'high').length,
  }

  const getSeverityBadge = (severity: string) => {
    const colors = {
      critical: 'bg-red-600/20 text-red-300 border-red-600',
      high: 'bg-orange-600/20 text-orange-300 border-orange-600',
      medium: 'bg-yellow-600/20 text-yellow-300 border-yellow-600',
      low: 'bg-blue-600/20 text-blue-300 border-blue-600',
    }
    return (
      <Badge variant="outline" className={colors[severity as keyof typeof colors]}>
        {severity.toUpperCase()}
      </Badge>
    )
  }

  const getStatusBadge = (status: string) => {
    const colors = {
      open: 'bg-red-600/20 text-red-300 border-red-600',
      in_review: 'bg-yellow-600/20 text-yellow-300 border-yellow-600',
      resolved: 'bg-green-600/20 text-green-300 border-green-600',
      dismissed: 'bg-gray-600/20 text-gray-300 border-gray-600',
    }
    return (
      <Badge variant="outline" className={colors[status as keyof typeof colors]}>
        {status.replace('_', ' ').toUpperCase()}
      </Badge>
    )
  }

  const getTypeLabel = (type: string) => {
    const labels = {
      certificate_expired: 'Certificate Expired',
      document_missing: 'Document Missing',
      quality_issue: 'Quality Issue',
      regulatory_violation: 'Regulatory Violation',
      standard_non_compliance: 'Standard Non-Compliance',
    }
    return labels[type as keyof typeof labels] || type
  }

  return (
    <div className="space-y-6 text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-primary to-emerald-600 bg-clip-text text-transparent">
            Compliance Monitoring
          </h1>
          <p className="text-gray-300 mt-1">Monitor and manage platform compliance issues</p>
        </div>
        <Button className="shadow-glow">
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-slate-900 border-white/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Total Issues</CardTitle>
            <Shield className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.total}</div>
            <p className="text-xs text-gray-400 mt-1">All compliance issues</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-white/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Open Issues</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.open}</div>
            <p className="text-xs text-gray-400 mt-1">Requires attention</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-white/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">In Review</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.inReview}</div>
            <p className="text-xs text-gray-400 mt-1">Under investigation</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-white/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Critical</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.critical}</div>
            <p className="text-xs text-gray-400 mt-1">Urgent action required</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-slate-900 border-white/10">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search issues..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 bg-slate-800 border-gray-700 text-white placeholder:text-gray-500"
                />
              </div>
            </div>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value as typeof severityFilter)}
              className="w-full sm:w-48 h-10 rounded-lg border border-gray-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-primary focus:ring-2 focus:ring-primary/40"
            >
              <option value="ALL">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
              className="w-full sm:w-48 h-10 rounded-lg border border-gray-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-primary focus:ring-2 focus:ring-primary/40"
            >
              <option value="ALL">All Statuses</option>
              <option value="open">Open</option>
              <option value="in_review">In Review</option>
              <option value="resolved">Resolved</option>
              <option value="dismissed">Dismissed</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Issues List */}
      <Card className="bg-slate-900 border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Compliance Issues ({filteredIssues.length})</CardTitle>
          <CardDescription className="text-gray-400">Monitor and resolve compliance issues</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredIssues.map((issue) => (
              <div
                key={issue.id}
                className="p-4 bg-slate-800/50 rounded-lg border border-white/10 hover:bg-slate-800 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {getSeverityBadge(issue.severity)}
                      {getStatusBadge(issue.status)}
                      <Badge variant="outline" className="bg-slate-700 text-gray-300 border-gray-600">
                        {getTypeLabel(issue.type)}
                      </Badge>
                    </div>
                    <h3 className="font-semibold text-white mb-1">{issue.entityName}</h3>
                    <p className="text-sm text-gray-300 mb-2">{issue.description}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        {issue.entityType.replace('_', ' ')}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Detected: {formatDate(issue.detectedAt)}
                      </span>
                      {issue.resolvedAt && (
                        <span className="flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          Resolved: {formatDate(issue.resolvedAt)}
                        </span>
                      )}
                      {issue.assignedTo && (
                        <span className="flex items-center gap-1">
                          <Shield className="h-3 w-3" />
                          Assigned to: {issue.assignedTo}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="bg-slate-700 border-gray-600 text-white hover:bg-slate-600">
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Button>
                    {issue.status === 'open' && (
                      <Button size="sm" className="bg-primary text-white hover:bg-primary/90">
                        Resolve
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredIssues.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <CheckCircle2 className="h-12 w-12 mx-auto mb-4" />
              <p>No compliance issues found matching your filters.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

