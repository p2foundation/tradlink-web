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
  FileCheck,
  AlertTriangle,
  TrendingUp,
  Globe,
  Package,
  Calendar,
} from 'lucide-react'
import { formatDate } from '@/lib/utils'
import apiClient from '@/lib/api-client'
import { useToast } from '@/hooks/use-toast'

interface ComplianceRecord {
  id: string
  type: 'certificate' | 'standard' | 'regulation' | 'document' | 'quality_check'
  title: string
  description: string
  status: 'compliant' | 'pending' | 'non_compliant' | 'expired' | 'under_review'
  severity?: 'low' | 'medium' | 'high' | 'critical'
  supplierId?: string
  supplierName?: string
  listingId?: string
  listingName?: string
  transactionId?: string
  verifiedAt?: string
  expiresAt?: string
  detectedAt: string
  lastChecked: string
  country?: string
  standard?: string
  documents?: string[]
}

export default function CompliancePage() {
  const { toast } = useToast()
  const [records, setRecords] = useState<ComplianceRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'compliant' | 'pending' | 'non_compliant' | 'expired' | 'under_review'>('ALL')
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'certificate' | 'standard' | 'regulation' | 'document' | 'quality_check'>('ALL')

  useEffect(() => {
    fetchComplianceRecords()
  }, [])

  const fetchComplianceRecords = async () => {
    try {
      setLoading(true)
      // TODO: Replace with actual API endpoint
      // const response = await apiClient.get('/buyers/compliance')
      
      // Mock data for buyer compliance
      const mockRecords: ComplianceRecord[] = [
        {
          id: '1',
          type: 'certificate',
          title: 'Organic Certification',
          description: 'Organic certification for Premium Cocoa from Ashanti Region',
          status: 'compliant',
          supplierId: 'farmer-1',
          supplierName: 'Kwame Asante Farm',
          listingId: 'listing-1',
          listingName: 'Premium Cocoa Beans',
          verifiedAt: '2024-12-01T10:00:00Z',
          expiresAt: '2025-12-01T10:00:00Z',
          detectedAt: '2024-12-01T10:00:00Z',
          lastChecked: '2024-12-10T14:30:00Z',
          country: 'Ghana',
          standard: 'USDA Organic',
          documents: ['organic-cert.pdf', 'inspection-report.pdf'],
        },
        {
          id: '2',
          type: 'standard',
          title: 'Fair Trade Compliance',
          description: 'Fair Trade certification verification for coffee supplier',
          status: 'pending',
          supplierId: 'farmer-2',
          supplierName: 'Ama Osei Cooperative',
          listingId: 'listing-2',
          listingName: 'Fair Trade Coffee',
          detectedAt: '2024-12-05T09:00:00Z',
          lastChecked: '2024-12-10T14:30:00Z',
          country: 'Ghana',
          standard: 'Fair Trade International',
        },
        {
          id: '3',
          type: 'regulation',
          title: 'EU Import Regulations',
          description: 'Compliance with EU food safety regulations for cashew exports',
          status: 'compliant',
          supplierId: 'farmer-3',
          supplierName: 'Bono Cashew Growers',
          transactionId: 'txn-123',
          verifiedAt: '2024-11-15T08:00:00Z',
          detectedAt: '2024-11-15T08:00:00Z',
          lastChecked: '2024-12-10T14:30:00Z',
          country: 'Ghana',
          standard: 'EU Regulation 852/2004',
          documents: ['eu-compliance-cert.pdf'],
        },
        {
          id: '4',
          type: 'quality_check',
          title: 'Quality Standard Verification',
          description: 'Premium grade quality check for shea nuts',
          status: 'non_compliant',
          severity: 'high',
          supplierId: 'farmer-4',
          supplierName: 'Northern Shea Producers',
          listingId: 'listing-4',
          listingName: 'Shea Nuts',
          detectedAt: '2024-12-08T11:00:00Z',
          lastChecked: '2024-12-10T14:30:00Z',
          country: 'Ghana',
          standard: 'Ghana Standards Authority',
        },
        {
          id: '5',
          type: 'document',
          title: 'Export License Verification',
          description: 'Valid export license for international trade',
          status: 'expired',
          severity: 'critical',
          supplierId: 'farmer-5',
          supplierName: 'Volta Export Group',
          expiresAt: '2024-11-30T00:00:00Z',
          detectedAt: '2024-12-01T09:00:00Z',
          lastChecked: '2024-12-10T14:30:00Z',
          country: 'Ghana',
          documents: ['export-license.pdf'],
        },
        {
          id: '6',
          type: 'certificate',
          title: 'Rainforest Alliance Certification',
          description: 'Sustainable farming certification for cocoa',
          status: 'under_review',
          supplierId: 'farmer-1',
          supplierName: 'Kwame Asante Farm',
          listingId: 'listing-6',
          listingName: 'Sustainable Cocoa',
          detectedAt: '2024-12-09T10:00:00Z',
          lastChecked: '2024-12-10T14:30:00Z',
          country: 'Ghana',
          standard: 'Rainforest Alliance',
        },
      ]

      setRecords(mockRecords)
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load compliance records. Please try again.',
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredRecords = records.filter((record) => {
    const matchesSearch = 
      record.title.toLowerCase().includes(search.toLowerCase()) ||
      record.description.toLowerCase().includes(search.toLowerCase()) ||
      record.supplierName?.toLowerCase().includes(search.toLowerCase()) ||
      record.listingName?.toLowerCase().includes(search.toLowerCase())
    
    const matchesStatus = statusFilter === 'ALL' || record.status === statusFilter
    const matchesType = typeFilter === 'ALL' || record.type === typeFilter

    return matchesSearch && matchesStatus && matchesType
  })

  const stats = {
    total: records.length,
    compliant: records.filter((r) => r.status === 'compliant').length,
    pending: records.filter((r) => r.status === 'pending' || r.status === 'under_review').length,
    nonCompliant: records.filter((r) => r.status === 'non_compliant' || r.status === 'expired').length,
    critical: records.filter((r) => r.severity === 'critical').length,
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'compliant':
        return <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30"><CheckCircle2 className="h-3 w-3 mr-1" />Compliant</Badge>
      case 'pending':
        return <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30"><Clock className="h-3 w-3 mr-1" />Pending</Badge>
      case 'under_review':
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30"><Eye className="h-3 w-3 mr-1" />Under Review</Badge>
      case 'non_compliant':
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30"><XCircle className="h-3 w-3 mr-1" />Non-Compliant</Badge>
      case 'expired':
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30"><AlertTriangle className="h-3 w-3 mr-1" />Expired</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'certificate':
        return <FileCheck className="h-5 w-5 text-emerald-400" />
      case 'standard':
        return <Shield className="h-5 w-5 text-blue-400" />
      case 'regulation':
        return <Globe className="h-5 w-5 text-purple-400" />
      case 'document':
        return <FileText className="h-5 w-5 text-amber-400" />
      case 'quality_check':
        return <Package className="h-5 w-5 text-cyan-400" />
      default:
        return <FileText className="h-5 w-5" />
    }
  }

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      certificate: 'Certificate',
      standard: 'Standard',
      regulation: 'Regulation',
      document: 'Document',
      quality_check: 'Quality Check',
    }
    return labels[type] || type
  }

  const getSeverityBadge = (severity?: string) => {
    if (!severity) return null
    switch (severity) {
      case 'critical':
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Critical</Badge>
      case 'high':
        return <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">High</Badge>
      case 'medium':
        return <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">Medium</Badge>
      case 'low':
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Low</Badge>
      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-primary to-emerald-600 bg-clip-text text-transparent">
            Compliance Management
          </h1>
          <p className="text-gray-300 mt-1">Monitor supplier compliance with international standards and regulations</p>
        </div>
        <Button className="shadow-glow">
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Card className="bg-slate-900 border-white/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Total Records</CardTitle>
            <Shield className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.total}</div>
            <p className="text-xs text-gray-400 mt-1">All compliance records</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-white/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Compliant</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-400">{stats.compliant}</div>
            <p className="text-xs text-gray-400 mt-1">Verified compliant</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-white/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Pending</CardTitle>
            <Clock className="h-4 w-4 text-amber-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-400">{stats.pending}</div>
            <p className="text-xs text-gray-400 mt-1">Under review</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-white/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Non-Compliant</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-400">{stats.nonCompliant}</div>
            <p className="text-xs text-gray-400 mt-1">Requires action</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-white/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Critical</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{stats.critical}</div>
            <p className="text-xs text-gray-400 mt-1">Urgent attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-slate-900 border-white/10">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search compliance records..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-slate-800 border-slate-700 text-slate-100"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-4 py-2 rounded-lg border border-slate-700 bg-slate-800 text-slate-100 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/40"
              >
                <option value="ALL">All Status</option>
                <option value="compliant">Compliant</option>
                <option value="pending">Pending</option>
                <option value="under_review">Under Review</option>
                <option value="non_compliant">Non-Compliant</option>
                <option value="expired">Expired</option>
              </select>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as any)}
                className="px-4 py-2 rounded-lg border border-slate-700 bg-slate-800 text-slate-100 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/40"
              >
                <option value="ALL">All Types</option>
                <option value="certificate">Certificate</option>
                <option value="standard">Standard</option>
                <option value="regulation">Regulation</option>
                <option value="document">Document</option>
                <option value="quality_check">Quality Check</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Compliance Records */}
      <div className="space-y-4">
        {filteredRecords.length === 0 ? (
          <Card className="bg-slate-900 border-white/10">
            <CardContent className="py-12 text-center">
              <Shield className="h-12 w-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No compliance records found</p>
            </CardContent>
          </Card>
        ) : (
          filteredRecords.map((record) => (
            <Card key={record.id} className="bg-slate-900 border-white/10 hover:border-emerald-500/50 transition-colors">
              <CardContent className="pt-6">
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="p-3 rounded-lg bg-slate-800">
                      {getTypeIcon(record.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div>
                          <h3 className="font-semibold text-white mb-1">{record.title}</h3>
                          <p className="text-sm text-gray-400 mb-3">{record.description}</p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          {getStatusBadge(record.status)}
                          {getSeverityBadge(record.severity)}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        {record.supplierName && (
                          <div>
                            <p className="text-gray-500">Supplier</p>
                            <p className="text-slate-200 font-medium">{record.supplierName}</p>
                          </div>
                        )}
                        {record.listingName && (
                          <div>
                            <p className="text-gray-500">Product</p>
                            <p className="text-slate-200 font-medium">{record.listingName}</p>
                          </div>
                        )}
                        {record.country && (
                          <div>
                            <p className="text-gray-500">Country</p>
                            <p className="text-slate-200 font-medium">{record.country}</p>
                          </div>
                        )}
                        {record.standard && (
                          <div>
                            <p className="text-gray-500">Standard</p>
                            <p className="text-slate-200 font-medium">{record.standard}</p>
                          </div>
                        )}
                        {record.verifiedAt && (
                          <div>
                            <p className="text-gray-500">Verified</p>
                            <p className="text-slate-200 font-medium">{formatDate(record.verifiedAt)}</p>
                          </div>
                        )}
                        {record.expiresAt && (
                          <div>
                            <p className="text-gray-500">Expires</p>
                            <p className={`font-medium ${new Date(record.expiresAt) < new Date() ? 'text-red-400' : 'text-slate-200'}`}>
                              {formatDate(record.expiresAt)}
                            </p>
                          </div>
                        )}
                        <div>
                          <p className="text-gray-500">Last Checked</p>
                          <p className="text-slate-200 font-medium">{formatDate(record.lastChecked)}</p>
                        </div>
                      </div>

                      {record.documents && record.documents.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-slate-800">
                          <p className="text-sm text-gray-500 mb-2">Documents</p>
                          <div className="flex flex-wrap gap-2">
                            {record.documents.map((doc, idx) => (
                              <Badge key={idx} variant="outline" className="border-slate-700 text-slate-300">
                                <FileText className="h-3 w-3 mr-1" />
                                {doc}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2 lg:min-w-[120px]">
                    <Button variant="outline" size="sm" className="border-slate-700">
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                    {record.status === 'non_compliant' || record.status === 'expired' ? (
                      <Button size="sm" className="bg-amber-600 hover:bg-amber-700">
                        <AlertCircle className="h-4 w-4 mr-2" />
                        Request Update
                      </Button>
                    ) : null}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}

