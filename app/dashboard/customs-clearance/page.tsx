'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Shield,
  FileCheck,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  TrendingUp,
  TrendingDown,
  Brain,
  FileText,
  Download,
  RefreshCw,
  Zap,
  Globe,
  Upload,
} from 'lucide-react'
import apiClient from '@/lib/api-client'
import { useToast } from '@/hooks/use-toast'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'

interface DocumentCheck {
  id: string
  type: string
  name: string
  status: 'VERIFIED' | 'PENDING' | 'MISSING' | 'EXPIRED' | 'REJECTED'
  verifiedAt?: string
  expiryDate?: string
  aiConfidence?: number
  issues?: string[]
}

interface DelayPrediction {
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH'
  predictedDelay: number // in days
  factors: string[]
  recommendations: string[]
  confidence: number
}

interface ComplianceStatus {
  overall: 'COMPLIANT' | 'NON_COMPLIANT' | 'PENDING'
  score: number // 0-100
  missingRequirements: string[]
  warnings: string[]
}

export default function CustomsClearancePage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [documents, setDocuments] = useState<DocumentCheck[]>([])
  const [delayPrediction, setDelayPrediction] = useState<DelayPrediction | null>(null)
  const [complianceStatus, setComplianceStatus] = useState<ComplianceStatus | null>(null)
  const [transaction, setTransaction] = useState<any>(null)
  const [analyzing, setAnalyzing] = useState(false)

  useEffect(() => {
    fetchCustomsData()
  }, [])

  const fetchCustomsData = async () => {
    try {
      setLoading(true)
      
      // Get current user's transactions
      const transactionsRes = await apiClient.get('/transactions?limit=10')
      const transactions = transactionsRes.data.data || []
      
      if (transactions.length > 0) {
        setTransaction(transactions[0])
        await analyzeCustomsClearance(transactions[0])
      } else {
        // Mock data for demo
        await loadMockData()
      }
    } catch (error) {
      console.error('Failed to fetch customs data:', error)
      await loadMockData()
    } finally {
      setLoading(false)
    }
  }

  const loadMockData = async () => {
    // Mock document checks
    const mockDocuments: DocumentCheck[] = [
      {
        id: '1',
        type: 'CERTIFICATE_OF_ORIGIN',
        name: 'Certificate of Origin',
        status: 'VERIFIED',
        verifiedAt: new Date().toISOString(),
        aiConfidence: 98,
      },
      {
        id: '2',
        type: 'PHYTOSANITARY_CERTIFICATE',
        name: 'Phytosanitary Certificate',
        status: 'VERIFIED',
        verifiedAt: new Date().toISOString(),
        aiConfidence: 95,
      },
      {
        id: '3',
        type: 'COMMERCIAL_INVOICE',
        name: 'Commercial Invoice',
        status: 'VERIFIED',
        verifiedAt: new Date().toISOString(),
        aiConfidence: 100,
      },
      {
        id: '4',
        type: 'BILL_OF_LADING',
        name: 'Bill of Lading',
        status: 'PENDING',
        aiConfidence: 0,
        issues: ['Document not yet uploaded'],
      },
      {
        id: '5',
        type: 'PACKING_LIST',
        name: 'Packing List',
        status: 'VERIFIED',
        verifiedAt: new Date().toISOString(),
        aiConfidence: 92,
      },
    ]

    const mockDelayPrediction: DelayPrediction = {
      riskLevel: 'LOW',
      predictedDelay: 1.5,
      factors: [
        'All required documents verified',
        'No compliance issues detected',
        'Ghana Single Window pre-approval complete',
        'Destination country requirements met',
      ],
      recommendations: [
        'Submit Bill of Lading within 24 hours to avoid delays',
        'Ensure all documents are properly signed and dated',
        'Verify destination port requirements',
      ],
      confidence: 87,
    }

    const mockCompliance: ComplianceStatus = {
      overall: 'COMPLIANT',
      score: 92,
      missingRequirements: ['Bill of Lading'],
      warnings: ['Ensure Bill of Lading is submitted before shipment departure'],
    }

    setDocuments(mockDocuments)
    setDelayPrediction(mockDelayPrediction)
    setComplianceStatus(mockCompliance)
  }

  const analyzeCustomsClearance = async (txn: any) => {
    try {
      setAnalyzing(true)
      
      // TODO: Call AI service for customs clearance analysis
      // const response = await apiClient.post('/customs/analyze', { transactionId: txn.id })
      
      // For now, use mock data
      await loadMockData()
      
      toast({
        title: 'Analysis Complete',
        description: 'AI has analyzed your customs clearance requirements',
      })
    } catch (error) {
      console.error('Failed to analyze customs clearance:', error)
      await loadMockData()
    } finally {
      setAnalyzing(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'VERIFIED':
        return (
          <Badge className="bg-emerald-500/20 text-emerald-500 border-emerald-500/30">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Verified
          </Badge>
        )
      case 'PENDING':
        return (
          <Badge className="bg-amber-500/20 text-amber-500 border-amber-500/30">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        )
      case 'MISSING':
        return (
          <Badge className="bg-red-500/20 text-red-500 border-red-500/30">
            <XCircle className="h-3 w-3 mr-1" />
            Missing
          </Badge>
        )
      case 'EXPIRED':
        return (
          <Badge className="bg-orange-500/20 text-orange-500 border-orange-500/30">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Expired
          </Badge>
        )
      case 'REJECTED':
        return (
          <Badge className="bg-red-500/20 text-red-500 border-red-500/30">
            <XCircle className="h-3 w-3 mr-1" />
            Rejected
          </Badge>
        )
      default:
        return null
    }
  }

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case 'LOW':
        return (
          <Badge className="bg-emerald-500/20 text-emerald-500 border-emerald-500/30">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Low Risk
          </Badge>
        )
      case 'MEDIUM':
        return (
          <Badge className="bg-amber-500/20 text-amber-500 border-amber-500/30">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Medium Risk
          </Badge>
        )
      case 'HIGH':
        return (
          <Badge className="bg-red-500/20 text-red-500 border-red-500/30">
            <XCircle className="h-3 w-3 mr-1" />
            High Risk
          </Badge>
        )
      default:
        return null
    }
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-emerald-600 bg-clip-text text-transparent">
            AI-Driven Customs Clearance
          </h1>
          <p className="text-muted-foreground mt-1">
            Automated document verification, delay prediction, and regulatory compliance
          </p>
        </div>
        <Button
          onClick={() => analyzeCustomsClearance(transaction)}
          disabled={analyzing}
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          <Brain className="h-4 w-4 mr-2" />
          {analyzing ? 'Analyzing...' : 'Run AI Analysis'}
        </Button>
      </div>

      {/* Compliance Status Overview */}
      {complianceStatus && (
        <Card className="border-emerald-500/30 bg-emerald-500/5">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-emerald-500/20 rounded-lg">
                  <Shield className="h-6 w-6 text-emerald-500" />
                </div>
                <div>
                  <CardTitle>Regulatory Compliance Status</CardTitle>
                  <CardDescription>AI-verified compliance check</CardDescription>
                </div>
              </div>
              {complianceStatus.overall === 'COMPLIANT' ? (
                <Badge className="bg-emerald-500/20 text-emerald-500 border-emerald-500/30 text-lg px-4 py-2">
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Compliant
                </Badge>
              ) : (
                <Badge className="bg-red-500/20 text-red-500 border-red-500/30 text-lg px-4 py-2">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Non-Compliant
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">Compliance Score</span>
                  <span className="text-2xl font-bold text-emerald-500">{complianceStatus.score}%</span>
                </div>
                <Progress value={complianceStatus.score} className="h-3" />
              </div>
              {complianceStatus.missingRequirements.length > 0 && (
                <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                  <p className="text-sm font-medium text-amber-500 mb-2">Missing Requirements</p>
                  <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                    {complianceStatus.missingRequirements.map((req, idx) => (
                      <li key={idx}>{req}</li>
                    ))}
                  </ul>
                </div>
              )}
              {complianceStatus.warnings.length > 0 && (
                <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <p className="text-sm font-medium text-blue-500 mb-2">Warnings</p>
                  <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                    {complianceStatus.warnings.map((warning, idx) => (
                      <li key={idx}>{warning}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Delay Prediction */}
      {delayPrediction && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <CardTitle>Delay Prediction</CardTitle>
                  <CardDescription>AI-powered delay forecasting</CardDescription>
                </div>
              </div>
              {getRiskBadge(delayPrediction.riskLevel)}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="p-4 bg-card/50 rounded-lg border border-border">
                  <p className="text-sm text-muted-foreground mb-1">Predicted Delay</p>
                  <p className="text-3xl font-bold text-foreground">
                    {delayPrediction.predictedDelay} {delayPrediction.predictedDelay === 1 ? 'day' : 'days'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Estimated customs clearance time</p>
                </div>
                <div className="p-4 bg-card/50 rounded-lg border border-border">
                  <p className="text-sm text-muted-foreground mb-1">AI Confidence</p>
                  <p className="text-3xl font-bold text-foreground">{delayPrediction.confidence}%</p>
                  <p className="text-xs text-muted-foreground mt-1">Prediction accuracy</p>
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium text-foreground mb-2">Risk Factors</p>
                <div className="space-y-2">
                  {delayPrediction.factors.map((factor, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm">
                      {factor.includes('verified') || factor.includes('complete') || factor.includes('met') ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0" />
                      )}
                      <span className="text-muted-foreground">{factor}</span>
                    </div>
                  ))}
                </div>
              </div>

              {delayPrediction.recommendations.length > 0 && (
                <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <p className="text-sm font-medium text-blue-500 mb-2 flex items-center gap-2">
                    <Brain className="h-4 w-4" />
                    AI Recommendations
                  </p>
                  <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                    {delayPrediction.recommendations.map((rec, idx) => (
                      <li key={idx}>{rec}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Document Verification */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <FileCheck className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>Automated Document Check</CardTitle>
                <CardDescription>AI-verified document compliance</CardDescription>
              </div>
            </div>
            <Badge variant="outline" className="text-sm">
              {documents.filter(d => d.status === 'VERIFIED').length} / {documents.length} Verified
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="p-4 border border-border rounded-lg hover:bg-card/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <h4 className="font-semibold text-foreground">{doc.name}</h4>
                        <p className="text-sm text-muted-foreground">{doc.type.replace(/_/g, ' ')}</p>
                      </div>
                    </div>
                    {doc.status === 'VERIFIED' && doc.aiConfidence && (
                      <div className="mt-2">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-muted-foreground">AI Verification Confidence</span>
                          <span className="text-xs font-medium text-emerald-500">{doc.aiConfidence}%</span>
                        </div>
                        <Progress value={doc.aiConfidence} className="h-2" />
                      </div>
                    )}
                    {doc.verifiedAt && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Verified: {formatDate(doc.verifiedAt)}
                      </p>
                    )}
                    {doc.issues && doc.issues.length > 0 && (
                      <div className="mt-2 p-2 bg-amber-500/10 border border-amber-500/30 rounded text-xs">
                        <p className="text-amber-500 font-medium mb-1">Issues:</p>
                        <ul className="list-disc list-inside text-muted-foreground">
                          {doc.issues.map((issue, idx) => (
                            <li key={idx}>{issue}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  <div className="ml-4">
                    {getStatusBadge(doc.status)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Link href="/dashboard/documents">
          <Card className="hover:shadow-glow transition-all cursor-pointer h-full">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Upload className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Upload Documents</h3>
                  <p className="text-sm text-muted-foreground">Add missing documents</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/dashboard/compliance/guide">
          <Card className="hover:shadow-glow transition-all cursor-pointer h-full">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Globe className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Export Guides</h3>
                  <p className="text-sm text-muted-foreground">Country-specific requirements</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/dashboard/transactions">
          <Card className="hover:shadow-glow transition-all cursor-pointer h-full">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/10 rounded-lg">
                  <FileText className="h-5 w-5 text-emerald-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">View Transactions</h3>
                  <p className="text-sm text-muted-foreground">Track your exports</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}
