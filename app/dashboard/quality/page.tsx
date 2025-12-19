'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Shield,
  CheckCircle2,
  XCircle,
  Clock,
  Upload,
  Download,
  Eye,
  Search,
  QrCode,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { formatDate } from '@/lib/utils'
import apiClient from '@/lib/api-client'
import { Skeleton } from '@/components/ui/skeleton'
import Link from 'next/link'

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
  const [allRecords, setAllRecords] = useState<QualityRecord[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  })

  useEffect(() => {
    fetchQualityRecords()
  }, [statusFilter, pagination.page, searchTerm])

  const fetchQualityRecords = async () => {
    try {
      setLoading(true)
      // TODO: Replace with actual API endpoint
      // const response = await apiClient.get(`/quality/records?status=${statusFilter || ''}&page=${pagination.page}&limit=${pagination.limit}`)
      
      // Mock data - more realistic dataset
      const allMockRecords: QualityRecord[] = [
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
          blockchainHash: '0x1234abcd5678efgh9012ijkl3456mnop',
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
          blockchainHash: '0x5678efgh9012ijkl3456mnop7890qrst',
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
        {
          id: '4',
          productId: 'PROD-004',
          productName: 'Raw Cashew Nuts',
          farmerName: 'Akosua Boateng',
          certificationType: 'Fair Trade',
          status: 'verified',
          verifiedAt: '2024-11-20T09:15:00Z',
          expiryDate: '2025-11-20',
          testResults: {
            moisture: 6.1,
            purity: 96.8,
            grade: 'GRADE_A',
          },
          blockchainHash: '0x9012ijkl3456mnop7890qrst1234uvwx',
          traceabilityData: {
            origin: 'Western Region, Ghana',
            harvestDate: '2024-11-05',
            processingDate: '2024-11-12',
          },
        },
        {
          id: '5',
          productId: 'PROD-005',
          productName: 'Dried Mango Slices',
          farmerName: 'Kofi Adjei',
          certificationType: 'Organic',
          status: 'rejected',
          testResults: {
            moisture: 12.5,
            purity: 94.2,
            grade: 'STANDARD',
          },
        },
        {
          id: '6',
          productId: 'PROD-006',
          productName: 'Palm Oil',
          farmerName: 'Efua Tetteh',
          certificationType: 'RSPO',
          status: 'verified',
          verifiedAt: '2024-10-15T11:00:00Z',
          expiryDate: '2025-10-15',
          testResults: {
            moisture: 0.2,
            purity: 99.5,
            grade: 'PREMIUM',
          },
          blockchainHash: '0x3456mnop7890qrst1234uvwx5678yzab',
          traceabilityData: {
            origin: 'Eastern Region, Ghana',
            harvestDate: '2024-10-01',
            processingDate: '2024-10-08',
          },
        },
        {
          id: '7',
          productId: 'PROD-007',
          productName: 'Raw Honey',
          farmerName: 'Nana Yeboah',
          certificationType: 'Organic',
          status: 'expired',
          verifiedAt: '2023-12-01T10:00:00Z',
          expiryDate: '2024-12-01',
          testResults: {
            moisture: 18.2,
            purity: 100,
            grade: 'PREMIUM',
          },
          blockchainHash: '0x7890qrst1234uvwx5678yzab9012cdef',
          traceabilityData: {
            origin: 'Volta Region, Ghana',
            harvestDate: '2023-11-20',
            processingDate: '2023-11-25',
          },
        },
        {
          id: '8',
          productId: 'PROD-008',
          productName: 'Black Pepper',
          farmerName: 'Maame Adwoa',
          certificationType: 'Organic',
          status: 'pending',
          testResults: {
            moisture: 8.5,
            purity: 98.1,
            grade: 'GRADE_A',
          },
        },
        {
          id: '9',
          productId: 'PROD-009',
          productName: 'Ginger Powder',
          farmerName: 'Osei Kofi',
          certificationType: 'Organic',
          status: 'verified',
          verifiedAt: '2024-11-25T16:45:00Z',
          expiryDate: '2025-11-25',
          testResults: {
            moisture: 9.2,
            purity: 97.8,
            grade: 'GRADE_A',
          },
          blockchainHash: '0x1234uvwx5678yzab9012cdef3456ghij',
          traceabilityData: {
            origin: 'Central Region, Ghana',
            harvestDate: '2024-11-12',
            processingDate: '2024-11-18',
          },
        },
        {
          id: '10',
          productId: 'PROD-010',
          productName: 'Coconut Oil',
          farmerName: 'Abena Serwaa',
          certificationType: 'Organic',
          status: 'verified',
          verifiedAt: '2024-11-30T08:30:00Z',
          expiryDate: '2025-11-30',
          testResults: {
            moisture: 0.1,
            purity: 99.8,
            grade: 'PREMIUM',
          },
          blockchainHash: '0x5678yzab9012cdef3456ghij7890klmn',
          traceabilityData: {
            origin: 'Greater Accra Region, Ghana',
            harvestDate: '2024-11-18',
            processingDate: '2024-11-25',
          },
        },
        {
          id: '11',
          productId: 'PROD-011',
          productName: 'Sesame Seeds',
          farmerName: 'Kwabena Owusu',
          certificationType: 'Fair Trade',
          status: 'pending',
          testResults: {
            moisture: 6.8,
            purity: 96.5,
            grade: 'GRADE_A',
          },
        },
        {
          id: '12',
          productId: 'PROD-012',
          productName: 'Pineapple Slices',
          farmerName: 'Adwoa Mensah',
          certificationType: 'Organic',
          status: 'verified',
          verifiedAt: '2024-11-22T13:20:00Z',
          expiryDate: '2025-11-22',
          testResults: {
            moisture: 10.5,
            purity: 95.8,
            grade: 'STANDARD',
          },
          blockchainHash: '0x9012cdef3456ghij7890klmn1234opqr',
          traceabilityData: {
            origin: 'Ashanti Region, Ghana',
            harvestDate: '2024-11-08',
            processingDate: '2024-11-15',
          },
        },
      ]

      // Apply filters
      let filtered = allMockRecords
      if (statusFilter) {
        filtered = filtered.filter((r) => r.status === statusFilter)
      }

      // Apply search
      if (searchTerm) {
        const term = searchTerm.toLowerCase()
        filtered = filtered.filter(
          (r) =>
            r.productName.toLowerCase().includes(term) ||
            r.farmerName.toLowerCase().includes(term) ||
            r.productId.toLowerCase().includes(term)
        )
      }

      // Store all filtered records for stats
      setAllRecords(filtered)

      // Apply pagination
      const start = (pagination.page - 1) * pagination.limit
      const end = start + pagination.limit
      const paginatedRecords = filtered.slice(start, end)

      setRecords(paginatedRecords)
      setPagination((prev) => ({
        ...prev,
        total: filtered.length,
        totalPages: Math.ceil(filtered.length / prev.limit),
      }))
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

  const stats = {
    total: pagination.total,
    verified: allRecords.filter((r) => r.status === 'verified').length,
    pending: allRecords.filter((r) => r.status === 'pending').length,
    blockchain: allRecords.filter((r) => r.blockchainHash).length,
  }

  if (loading && records.length === 0) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Quality & Traceability</h1>
          <p className="text-muted-foreground mt-1">
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
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Records</p>
                <p className="text-2xl font-bold text-foreground mt-1">{pagination.total}</p>
              </div>
              <div className="p-3 bg-primary/10 rounded-lg">
                <Shield className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Verified</p>
                <p className="text-2xl font-bold text-green-500 mt-1">{stats.verified}</p>
              </div>
              <div className="p-3 bg-green-500/10 rounded-lg">
                <CheckCircle2 className="h-6 w-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-yellow-500 mt-1">{stats.pending}</p>
              </div>
              <div className="p-3 bg-yellow-500/10 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Blockchain Verified</p>
                <p className="text-2xl font-bold text-blue-500 mt-1">{stats.blockchain}</p>
              </div>
              <div className="p-3 bg-blue-500/10 rounded-lg">
                <QrCode className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by product, farmer, or ID..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setPagination((prev) => ({ ...prev, page: 1 }))
                }}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {['verified', 'pending', 'rejected', 'expired'].map((status) => (
                <Button
                  key={status}
                  variant={statusFilter === status ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    const newFilter = statusFilter === status ? null : status
                    setStatusFilter(newFilter)
                    setPagination((prev) => ({ ...prev, page: 1 }))
                  }}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </Button>
              ))}
              {statusFilter && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setStatusFilter(null)
                    setPagination((prev) => ({ ...prev, page: 1 }))
                  }}
                >
                  Clear
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quality Records */}
      <div className="space-y-4">
        {records.map((record) => (
          <Card key={record.id} className="hover:shadow-glow transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-4">
                    {getStatusIcon(record.status)}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg text-foreground truncate">
                        {record.productName}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {record.productId} • {record.farmerName}
                      </p>
                    </div>
                    {getStatusBadge(record.status)}
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Certification</p>
                      <Badge variant="outline" className="text-sm">
                        {record.certificationType}
                      </Badge>
                    </div>
                    {record.verifiedAt && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Verified</p>
                        <p className="text-sm text-foreground">{formatDate(record.verifiedAt)}</p>
                      </div>
                    )}
                    {record.expiryDate && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Expires</p>
                        <p className="text-sm text-foreground">{formatDate(record.expiryDate)}</p>
                      </div>
                    )}
                    {record.blockchainHash && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Blockchain Hash</p>
                        <p className="text-sm text-blue-500 font-mono truncate">
                          {record.blockchainHash}
                        </p>
                      </div>
                    )}
                  </div>

                  {record.testResults && (
                    <div className="p-4 bg-muted/50 rounded-lg mb-4">
                      <p className="text-sm font-medium text-foreground mb-3">Test Results</p>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <p className="text-xs text-muted-foreground">Moisture</p>
                          <p className="text-sm font-semibold text-foreground">
                            {record.testResults.moisture}%
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Purity</p>
                          <p className="text-sm font-semibold text-foreground">
                            {record.testResults.purity}%
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Grade</p>
                          <p className="text-sm font-semibold text-foreground">
                            {record.testResults.grade}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {record.traceabilityData && (
                    <div className="p-4 bg-card/50 rounded-lg">
                      <p className="text-sm font-medium text-foreground mb-3">Traceability Data</p>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Origin:</span>
                          <span className="text-foreground">{record.traceabilityData.origin}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Harvest Date:</span>
                          <span className="text-foreground">
                            {formatDate(record.traceabilityData.harvestDate)}
                          </span>
                        </div>
                        {record.traceabilityData.processingDate && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Processing Date:</span>
                            <span className="text-foreground">
                              {formatDate(record.traceabilityData.processingDate)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-2 flex-shrink-0">
                  <Link href={`/dashboard/quality/${record.id}`}>
                    <Button variant="outline" size="sm" className="w-full">
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </Link>
                  {record.blockchainHash && (
                    <Button variant="outline" size="sm" className="w-full">
                      <QrCode className="h-4 w-4 mr-2" />
                      Verify on Blockchain
                    </Button>
                  )}
                  <Button variant="outline" size="sm" className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Download Certificate
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="text-sm text-muted-foreground">
            Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}{' '}
            records
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
              disabled={pagination.page === 1 || loading}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                let pageNum: number
                if (pagination.totalPages <= 5) {
                  pageNum = i + 1
                } else if (pagination.page <= 3) {
                  pageNum = i + 1
                } else if (pagination.page >= pagination.totalPages - 2) {
                  pageNum = pagination.totalPages - 4 + i
                } else {
                  pageNum = pagination.page - 2 + i
                }
                return (
                  <Button
                    key={pageNum}
                    variant={pagination.page === pageNum ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setPagination({ ...pagination, page: pageNum })}
                    disabled={loading}
                    className="min-w-[40px]"
                  >
                    {pageNum}
                  </Button>
                )
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
              disabled={pagination.page === pagination.totalPages || loading}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {records.length === 0 && !loading && (
        <Card>
          <CardContent className="p-12 text-center">
            <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-semibold text-foreground mb-2">No Quality Records Found</h3>
            <p className="text-muted-foreground mb-6">
              {searchTerm || statusFilter
                ? 'Try adjusting your search or filters to find more records.'
                : 'No quality verification records are available at the moment.'}
            </p>
            {(searchTerm || statusFilter) && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('')
                  setStatusFilter(null)
                  setPagination((prev) => ({ ...prev, page: 1 }))
                }}
              >
                Clear Filters
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
