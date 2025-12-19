'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  ArrowLeft,
  Shield,
  CheckCircle2,
  XCircle,
  Clock,
  Download,
  QrCode,
  MapPin,
  Calendar,
  Package,
  FileText,
  ExternalLink,
  Copy,
  AlertCircle,
} from 'lucide-react'
import { formatDate } from '@/lib/utils'
import apiClient from '@/lib/api-client'
import { useToast } from '@/hooks/use-toast'

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
  issuedBy?: string
  certificateNumber?: string
  labReport?: {
    url?: string
    date?: string
  }
}

export default function QualityDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [record, setRecord] = useState<QualityRecord | null>(null)

  useEffect(() => {
    fetchQualityRecord()
  }, [params.id])

  const fetchQualityRecord = async () => {
    try {
      setLoading(true)
      const recordId = params.id as string

      // TODO: Replace with actual API endpoint
      // const response = await apiClient.get(`/quality/records/${recordId}`)
      // setRecord(response.data)

      // Mock data - matching the structure from the main quality page
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
          blockchainHash: '0x1234abcd5678efgh9012ijkl3456mnop',
          traceabilityData: {
            origin: 'Ashanti Region, Ghana',
            harvestDate: '2024-11-15',
            processingDate: '2024-11-20',
          },
          issuedBy: 'Ghana Standards Authority',
          certificateNumber: 'GSA-ORG-2024-001234',
          labReport: {
            url: '/reports/lab-report-001.pdf',
            date: '2024-11-25',
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
          issuedBy: 'Fair Trade International',
          certificateNumber: 'FTI-FT-2024-005678',
          labReport: {
            url: '/reports/lab-report-002.pdf',
            date: '2024-11-20',
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
          issuedBy: 'Ghana Standards Authority',
          certificateNumber: 'GSA-ORG-2024-003456',
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
          issuedBy: 'Fair Trade International',
          certificateNumber: 'FTI-FT-2024-007890',
          labReport: {
            url: '/reports/lab-report-004.pdf',
            date: '2024-11-15',
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
          issuedBy: 'Ghana Standards Authority',
        },
      ]

      const foundRecord = mockRecords.find((r) => r.id === recordId)
      if (foundRecord) {
        setRecord(foundRecord)
      } else {
        toast({
          variant: 'destructive',
          title: 'Record Not Found',
          description: 'The quality record you are looking for does not exist.',
        })
        router.push('/dashboard/quality')
      }
    } catch (error: any) {
      console.error('Failed to fetch quality record:', error)
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.response?.data?.message || 'Failed to load quality record details',
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return (
          <Badge className="bg-emerald-500/20 text-emerald-500 border-emerald-500/30">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Verified
          </Badge>
        )
      case 'pending':
        return (
          <Badge className="bg-amber-500/20 text-amber-500 border-amber-500/30">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        )
      case 'rejected':
        return (
          <Badge className="bg-red-500/20 text-red-500 border-red-500/30">
            <XCircle className="h-3 w-3 mr-1" />
            Rejected
          </Badge>
        )
      case 'expired':
        return (
          <Badge className="bg-gray-500/20 text-gray-500 border-gray-500/30">
            <AlertCircle className="h-3 w-3 mr-1" />
            Expired
          </Badge>
        )
      default:
        return null
    }
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: 'Copied',
      description: `${label} copied to clipboard`,
    })
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  if (!record) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="text-center py-12">
          <AlertCircle className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2">Quality Record Not Found</h3>
          <p className="text-muted-foreground mb-6">The quality record you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => router.push('/dashboard/quality')}>View All Records</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-emerald-600 bg-clip-text text-transparent">
            Quality Certificate Details
          </h1>
          <p className="text-muted-foreground mt-1">Product ID: {record.productId}</p>
        </div>
        {getStatusBadge(record.status)}
      </div>

      {/* Main Information */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Product Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Product Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Product Name</p>
              <p className="text-lg font-semibold text-foreground">{record.productName}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Farmer/Supplier</p>
              <p className="text-foreground">{record.farmerName}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Certification Type</p>
              <Badge variant="outline" className="mt-1">
                {record.certificationType}
              </Badge>
            </div>
            {record.certificateNumber && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Certificate Number</p>
                <div className="flex items-center gap-2">
                  <p className="font-mono text-sm text-foreground">{record.certificateNumber}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(record.certificateNumber!, 'Certificate number')}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            )}
            {record.issuedBy && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Issued By</p>
                <p className="text-foreground">{record.issuedBy}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Status & Dates */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Verification Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Status</p>
              <div className="mt-1">{getStatusBadge(record.status)}</div>
            </div>
            {record.verifiedAt && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Verified Date</p>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <p className="text-foreground">{formatDate(record.verifiedAt)}</p>
                </div>
              </div>
            )}
            {record.expiryDate && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Expiry Date</p>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <p className="text-foreground">{formatDate(record.expiryDate)}</p>
                </div>
              </div>
            )}
            {record.status === 'verified' && record.expiryDate && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                <p className="text-sm text-emerald-500 font-medium">
                  ✓ Certificate is valid and active
                </p>
              </div>
            )}
            {record.status === 'expired' && (
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                <p className="text-sm text-amber-500 font-medium">
                  ⚠ Certificate has expired. Renewal required.
                </p>
              </div>
            )}
            {record.status === 'rejected' && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                <p className="text-sm text-red-500 font-medium">
                  ✗ Certificate application was rejected
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Test Results */}
      {record.testResults && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Laboratory Test Results
            </CardTitle>
            <CardDescription>Quality test results from certified laboratory</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="p-4 bg-card/50 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground mb-1">Moisture Content</p>
                <p className="text-2xl font-bold text-foreground">{record.testResults.moisture}%</p>
                <p className="text-xs text-muted-foreground mt-1">Within acceptable range</p>
              </div>
              <div className="p-4 bg-card/50 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground mb-1">Purity Level</p>
                <p className="text-2xl font-bold text-foreground">{record.testResults.purity}%</p>
                <p className="text-xs text-muted-foreground mt-1">High quality standard</p>
              </div>
              <div className="p-4 bg-card/50 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground mb-1">Quality Grade</p>
                <Badge variant="outline" className="mt-2 text-lg px-3 py-1">
                  {record.testResults.grade}
                </Badge>
              </div>
            </div>
            {record.labReport && (
              <div className="mt-4 pt-4 border-t border-border">
                <Button variant="outline" asChild>
                  <a href={record.labReport.url} target="_blank" rel="noopener noreferrer">
                    <Download className="h-4 w-4 mr-2" />
                    Download Full Lab Report
                    <ExternalLink className="h-3 w-3 ml-2" />
                  </a>
                </Button>
                {record.labReport.date && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Report Date: {formatDate(record.labReport.date)}
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Traceability Data */}
      {record.traceabilityData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Supply Chain Traceability
            </CardTitle>
            <CardDescription>Blockchain-verified origin and processing information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Origin</p>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <p className="text-foreground">{record.traceabilityData.origin}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Harvest Date</p>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <p className="text-foreground">{formatDate(record.traceabilityData.harvestDate)}</p>
                </div>
              </div>
              {record.traceabilityData.processingDate && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Processing Date</p>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <p className="text-foreground">{formatDate(record.traceabilityData.processingDate)}</p>
                  </div>
                </div>
              )}
            </div>
            {record.blockchainHash && (
              <div className="pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground mb-2">Blockchain Hash</p>
                <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                  <code className="flex-1 text-xs font-mono text-foreground break-all">
                    {record.blockchainHash}
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(record.blockchainHash!, 'Blockchain hash')}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  This hash can be used to verify the authenticity of this certificate on the blockchain
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button variant="default" className="bg-emerald-600 hover:bg-emerald-700">
              <Download className="h-4 w-4 mr-2" />
              Download Certificate
            </Button>
            {record.blockchainHash && (
              <Button variant="outline">
                <QrCode className="h-4 w-4 mr-2" />
                Verify on Blockchain
              </Button>
            )}
            {record.labReport?.url && (
              <Button variant="outline" asChild>
                <a href={record.labReport.url} target="_blank" rel="noopener noreferrer">
                  <FileText className="h-4 w-4 mr-2" />
                  View Lab Report
                  <ExternalLink className="h-3 w-3 ml-2" />
                </a>
              </Button>
            )}
            <Button variant="outline" onClick={() => router.push('/dashboard/quality')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to All Records
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
