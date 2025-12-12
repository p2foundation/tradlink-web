'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Shield,
  CheckCircle2,
  XCircle,
  Clock,
  Upload,
  Download,
  Eye,
  Search,
  Filter,
  QrCode,
} from 'lucide-react'
import { formatDate } from '@/lib/utils'
import apiClient from '@/lib/api-client'

interface QualityRecord {
  id: string
  productId: string
  productName: string
  farmerName: string
  certificationType: string
  status: 'verified' | 'pending' | 'rejected' | 'expired'
  verifiedAt?: string
  expiryDate?: string
  testResults?: {
    moisture: number
    purity: number
    grade: string
  }
  blockchainHash?: string
  traceabilityData?: {
    origin: string
    harvestDate: string
    processingDate?: string
  }
}

export default function QualityPage() {
  const [loading, setLoading] = useState(true)
  const [records, setRecords] = useState<QualityRecord[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string | null>(null)

  useEffect(() => {
    fetchQualityRecords()
  }, [statusFilter])

  const fetchQualityRecords = async () => {
    try {
      setLoading(true)
      // TODO: Replace with actual API endpoint
      // const response = await apiClient.get(`/quality/records?status=${statusFilter || ''}`)
      
      // Mock data
      const mockRecords: QualityRecord[] = [
        {
          id: '1',
          productId: 'PROD-001',
          productName: 'Premium Cocoa Beans',
          farmerName: 'Kwame Asante',
          certificationType: 'Organic',
          status: 'verified',
          verifiedAt: '2024-12-01T10:00:00Z',
          expiryDate: '2025-12-01',
          testResults: {
            moisture: 7.2,
            purity: 98.5,
            grade: 'PREMIUM',
          },
          blockchainHash: '0x1234...abcd',
          traceabilityData: {
            origin: 'Ashanti Region, Ghana',
            harvestDate: '2024-11-15',
            processingDate: '2024-11-20',
          },
        },
        {
          id: '2',
          productId: 'PROD-002',
          productName: 'Grade A Cashew Nuts',
          farmerName: 'Ama Osei',
          certificationType: 'Fair Trade',
          status: 'verified',
          verifiedAt: '2024-11-28T14:30:00Z',
          expiryDate: '2025-11-28',
          testResults: {
            moisture: 5.8,
            purity: 97.2,
            grade: 'GRADE_A',
          },
          blockchainHash: '0x5678...efgh',
          traceabilityData: {
            origin: 'Brong-Ahafo Region, Ghana',
            harvestDate: '2024-11-10',
            processingDate: '2024-11-18',
          },
        },
        {
          id: '3',
          productId: 'PROD-003',
          productName: 'Organic Shea Butter',
          farmerName: 'Yaw Mensah',
          certificationType: 'Organic',
          status: 'pending',
          testResults: {
            moisture: 0.5,
            purity: 99.1,
            grade: 'PREMIUM',
          },
        },
      ]

      setRecords(mockRecords)
    } catch (error) {
      console.error('Failed to fetch quality records:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-500" />
      case 'expired':
        return <XCircle className="h-5 w-5 text-orange-500" />
      default:
        return <Clock className="h-5 w-5 text-yellow-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <Badge variant="success">Verified</Badge>
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>
      case 'expired':
        return <Badge variant="warning">Expired</Badge>
      default:
        return <Badge variant="warning">Pending</Badge>
    }
  }

  const filteredRecords = records.filter((record) => {
    const matchesSearch =
      record.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.farmerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.productId.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = !statusFilter || record.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6 text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Quality & Traceability</h1>
          <p className="text-gray-300 mt-1">
            Quality verification, certification management, and blockchain traceability
          </p>
        </div>
        <Button className="shadow-glow">
          <Upload className="h-4 w-4 mr-2" />
          Request Quality Verification
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-slate-900 border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Records</p>
                <p className="text-2xl font-bold text-white mt-1">{records.length}</p>
              </div>
              <div className="p-3 bg-primary/10 rounded-lg">
                <Shield className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Verified</p>
                <p className="text-2xl font-bold text-green-500 mt-1">
                  {records.filter((r) => r.status === 'verified').length}
                </p>
              </div>
              <div className="p-3 bg-green-900/30 rounded-lg">
                <CheckCircle2 className="h-6 w-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Pending</p>
                <p className="text-2xl font-bold text-yellow-500 mt-1">
                  {records.filter((r) => r.status === 'pending').length}
                </p>
              </div>
              <div className="p-3 bg-yellow-900/30 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Blockchain Verified</p>
                <p className="text-2xl font-bold text-blue-500 mt-1">
                  {records.filter((r) => r.blockchainHash).length}
                </p>
              </div>
              <div className="p-3 bg-blue-900/30 rounded-lg">
                <QrCode className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-slate-900 border-white/10">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by product, farmer, or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-white/10 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="flex gap-2">
              {['verified', 'pending', 'rejected', 'expired'].map((status) => (
                <Button
                  key={status}
                  variant={statusFilter === status ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter(statusFilter === status ? null : status)}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quality Records */}
      <div className="space-y-4">
        {filteredRecords.map((record) => (
          <Card key={record.id} className="bg-slate-900 border-white/10 hover:shadow-glow transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    {getStatusIcon(record.status)}
                    <div>
                      <h3 className="font-semibold text-lg text-white">{record.productName}</h3>
                      <p className="text-sm text-gray-400">
                        {record.productId} • {record.farmerName}
                      </p>
                    </div>
                    {getStatusBadge(record.status)}
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-400 mb-2">Certification</p>
                      <Badge variant="outline" className="text-sm">
                        {record.certificationType}
                      </Badge>
                    </div>
                    {record.verifiedAt && (
                      <div>
                        <p className="text-sm text-gray-400 mb-2">Verified</p>
                        <p className="text-sm text-white">{formatDate(record.verifiedAt)}</p>
                      </div>
                    )}
                    {record.expiryDate && (
                      <div>
                        <p className="text-sm text-gray-400 mb-2">Expires</p>
                        <p className="text-sm text-white">{formatDate(record.expiryDate)}</p>
                      </div>
                    )}
                    {record.blockchainHash && (
                      <div>
                        <p className="text-sm text-gray-400 mb-2">Blockchain Hash</p>
                        <p className="text-sm text-blue-400 font-mono">{record.blockchainHash}</p>
                      </div>
                    )}
                  </div>

                  {record.testResults && (
                    <div className="p-4 bg-slate-800/50 rounded-lg mb-4">
                      <p className="text-sm font-medium text-white mb-3">Test Results</p>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <p className="text-xs text-gray-400">Moisture</p>
                          <p className="text-sm font-semibold text-white">
                            {record.testResults.moisture}%
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">Purity</p>
                          <p className="text-sm font-semibold text-white">
                            {record.testResults.purity}%
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">Grade</p>
                          <p className="text-sm font-semibold text-white">
                            {record.testResults.grade}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {record.traceabilityData && (
                    <div className="p-4 bg-slate-800/50 rounded-lg">
                      <p className="text-sm font-medium text-white mb-3">Traceability Data</p>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Origin:</span>
                          <span className="text-white">{record.traceabilityData.origin}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Harvest Date:</span>
                          <span className="text-white">
                            {formatDate(record.traceabilityData.harvestDate)}
                          </span>
                        </div>
                        {record.traceabilityData.processingDate && (
                          <div className="flex justify-between">
                            <span className="text-gray-400">Processing Date:</span>
                            <span className="text-white">
                              {formatDate(record.traceabilityData.processingDate)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-2 ml-4">
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                  {record.blockchainHash && (
                    <Button variant="outline" size="sm">
                      <QrCode className="h-4 w-4 mr-2" />
                      Verify on Blockchain
                    </Button>
                  )}
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Download Certificate
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredRecords.length === 0 && (
        <Card className="bg-slate-900 border-white/10">
          <CardContent className="p-12 text-center">
            <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-400">No quality records found</p>
            <Button className="mt-4" variant="outline">
              Request Quality Verification
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

