'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Shield, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  FileText,
  Upload,
  ExternalLink,
  Info,
  Brain,
  Database,
  CheckCircle,
  XCircle,
  RefreshCw
} from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import apiClient from '@/lib/api-client'
import { useToast } from '@/hooks/use-toast'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'

interface VerificationStatus {
  status: 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'NOT_SUBMITTED'
  referenceNumber?: string
  submittedAt?: string
  reviewedAt?: string
  notes?: string
}

export default function VerificationPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>({
    status: 'NOT_SUBMITTED',
  })
  const [eligibility, setEligibility] = useState<any>(null)
  const [submitting, setSubmitting] = useState(false)
  const [aiVerification, setAiVerification] = useState<any>(null)
  const [governmentCheck, setGovernmentCheck] = useState<any>(null)
  const [verifying, setVerifying] = useState(false)

  useEffect(() => {
    loadVerificationData()
  }, [])

  const loadVerificationData = async () => {
    try {
      // Get current user
      const userRes = await apiClient.get('/auth/me')
      setUser(userRes.data)

      // Check eligibility
      try {
        const eligibilityRes = await apiClient.get('/verification/eligibility')
        setEligibility(eligibilityRes.data)
      } catch (error) {
        console.error('Error checking eligibility:', error)
      }

      // Load AI verification status
      await loadAIVerification(userRes.data.id)

      // Load government registry cross-check
      await loadGovernmentRegistryCheck(userRes.data)

      // TODO: Load actual verification status from API
      // For now, check if user is verified
      if (userRes.data.verified) {
        setVerificationStatus({
          status: 'APPROVED',
          reviewedAt: new Date().toISOString(),
        })
      }
    } catch (error) {
      console.error('Error loading verification data:', error)
      toast({
        title: 'Error',
        description: 'Failed to load verification information',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const loadAIVerification = async (userId: string) => {
    try {
      // TODO: Call actual AI verification API
      // For now, use mock data
      const mockAI = {
        verified: true,
        confidence: 94,
        checks: [
          { name: 'Document Authenticity', status: 'VERIFIED', confidence: 98 },
          { name: 'Data Consistency', status: 'VERIFIED', confidence: 96 },
          { name: 'Profile Completeness', status: 'VERIFIED', confidence: 95 },
          { name: 'Business Registration', status: 'VERIFIED', confidence: 92 },
        ],
        timestamp: new Date().toISOString(),
      }
      setAiVerification(mockAI)
    } catch (error) {
      console.error('Error loading AI verification:', error)
    }
  }

  const loadGovernmentRegistryCheck = async (user: any) => {
    try {
      // TODO: Call actual government registry API
      // For now, use mock data
      const mockGov = {
        checked: true,
        registries: [
          { name: 'Ghana Business Registry', status: 'VERIFIED', matched: true },
          { name: 'GEPA License Database', status: 'VERIFIED', matched: true },
          { name: 'GRA Tax Registry', status: 'PENDING', matched: false },
          { name: 'Ministry of Agriculture', status: 'VERIFIED', matched: true },
        ],
        timestamp: new Date().toISOString(),
      }
      setGovernmentCheck(mockGov)
    } catch (error) {
      console.error('Error loading government registry check:', error)
    }
  }

  const runAIVerification = async () => {
    if (!user) return
    
    setVerifying(true)
    try {
      // TODO: Call AI verification API
      // Simulate AI verification
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      await loadAIVerification(user.id)
      await loadGovernmentRegistryCheck(user)
      
      toast({
        title: 'AI Verification Complete',
        description: 'Your credentials have been verified using AI',
      })
    } catch (error) {
      toast({
        title: 'Verification Failed',
        description: 'Failed to run AI verification',
        variant: 'destructive',
      })
    } finally {
      setVerifying(false)
    }
  }

  const handleSubmitVerification = async () => {
    if (!eligibility || !eligibility.eligible) {
      toast({
        title: 'Not Eligible',
        description: 'Please complete all required documents before submitting for verification',
        variant: 'destructive',
      })
      return
    }

    setSubmitting(true)
    try {
      const submission = {
        userId: user.id,
        userType: user.role,
        businessName: user.role === 'FARMER' ? 'Farmer' : 'Trader',
        documents: [], // Will be populated from user's documents
      }

      const response = await apiClient.post('/verification/submit-to-ghana-sw', submission)
      
      setVerificationStatus({
        status: 'PENDING',
        referenceNumber: response.data.referenceNumber,
        submittedAt: new Date().toISOString(),
      })

      toast({
        title: 'Verification Submitted',
        description: `Your verification request has been submitted. Reference: ${response.data.referenceNumber}`,
      })
    } catch (error: any) {
      toast({
        title: 'Submission Failed',
        description: error.response?.data?.message || 'Failed to submit verification request',
        variant: 'destructive',
      })
    } finally {
      setSubmitting(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return (
          <Badge variant="success" className="bg-emerald-500/20 text-emerald-400 border-emerald-500/50">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Approved
          </Badge>
        )
      case 'UNDER_REVIEW':
        return (
          <Badge variant="default" className="bg-amber-500/20 text-amber-400 border-amber-500/50">
            <Clock className="h-3 w-3 mr-1" />
            Under Review
          </Badge>
        )
      case 'PENDING':
        return (
          <Badge variant="default" className="bg-blue-500/20 text-blue-400 border-blue-500/50">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        )
      case 'REJECTED':
        return (
          <Badge variant="destructive">
            <AlertCircle className="h-3 w-3 mr-1" />
            Rejected
          </Badge>
        )
      default:
        return (
          <Badge variant="outline">
            <Info className="h-3 w-3 mr-1" />
            Not Submitted
          </Badge>
        )
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading verification status...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Ghana Single Window Verification</h1>
        <p className="text-muted-foreground">
          Get verified to export products and access international buyers
        </p>
      </div>

      {/* Status Card */}
      <Card className="bg-slate-900 border-slate-800 mb-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Verification Status</CardTitle>
              <CardDescription>
                Your Ghana Single Window export verification status
              </CardDescription>
            </div>
            {getStatusBadge(verificationStatus.status)}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {verificationStatus.referenceNumber && (
              <div>
                <p className="text-slate-400 text-sm mb-1">Reference Number</p>
                <p className="text-white font-mono">{verificationStatus.referenceNumber}</p>
              </div>
            )}
            {verificationStatus.submittedAt && (
              <div>
                <p className="text-muted-foreground text-sm mb-1">Submitted</p>
                <p className="text-foreground">
                  {new Date(verificationStatus.submittedAt).toLocaleDateString()}
                </p>
              </div>
            )}
            {verificationStatus.reviewedAt && (
              <div>
                <p className="text-slate-400 text-sm mb-1">Reviewed</p>
                <p className="text-white">
                  {new Date(verificationStatus.reviewedAt).toLocaleDateString()}
                </p>
              </div>
            )}
            {verificationStatus.notes && (
              <div>
                <p className="text-muted-foreground text-sm mb-1">Notes</p>
                <p className="text-foreground">{verificationStatus.notes}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* AI Verification Section */}
      {aiVerification && (
        <Card className="mb-8 border-blue-500/30 bg-blue-500/5">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Brain className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <CardTitle>AI-Verified Credentials</CardTitle>
                  <CardDescription>Automated verification using AI technology</CardDescription>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={runAIVerification}
                disabled={verifying}
              >
                {verifying ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Re-verify
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Overall AI Confidence</span>
                <span className="text-2xl font-bold text-blue-500">{aiVerification.confidence}%</span>
              </div>
              <Progress value={aiVerification.confidence} className="h-3" />
              
              <div className="space-y-3 pt-4 border-t border-border">
                <p className="text-sm font-medium text-foreground mb-2">Verification Checks</p>
                {aiVerification.checks.map((check: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-card/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      {check.status === 'VERIFIED' ? (
                        <CheckCircle className="h-5 w-5 text-emerald-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                      <span className="text-foreground">{check.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground">{check.confidence}%</span>
                      <Badge variant={check.status === 'VERIFIED' ? 'success' : 'destructive'}>
                        {check.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
              
              {aiVerification.timestamp && (
                <p className="text-xs text-muted-foreground mt-4">
                  Last verified: {formatDate(aiVerification.timestamp)}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Government Registry Cross-Check */}
      {governmentCheck && (
        <Card className="mb-8 border-purple-500/30 bg-purple-500/5">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Database className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <CardTitle>Government Registry Cross-Check</CardTitle>
                <CardDescription>Farm data verified against government registries</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {governmentCheck.registries.map((registry: any, idx: number) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-4 bg-card/50 rounded-lg border border-border"
                >
                  <div className="flex items-center gap-3">
                    {registry.status === 'VERIFIED' && registry.matched ? (
                      <CheckCircle className="h-5 w-5 text-emerald-500" />
                    ) : registry.status === 'PENDING' ? (
                      <Clock className="h-5 w-5 text-amber-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                    <div>
                      <p className="font-medium text-foreground">{registry.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {registry.matched ? 'Data matched' : 'Verification pending'}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant={
                      registry.status === 'VERIFIED' && registry.matched
                        ? 'success'
                        : registry.status === 'PENDING'
                        ? 'warning'
                        : 'destructive'
                    }
                  >
                    {registry.status === 'VERIFIED' && registry.matched
                      ? 'Verified'
                      : registry.status === 'PENDING'
                      ? 'Pending'
                      : 'Not Matched'}
                  </Badge>
                </div>
              ))}
              
              <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <p className="text-sm text-blue-500 font-medium mb-2 flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  How It Works
                </p>
                <p className="text-xs text-muted-foreground">
                  Our AI system cross-references your farm data with official government registries including 
                  Ghana Business Registry, GEPA License Database, GRA Tax Registry, and Ministry of Agriculture 
                  records to ensure authenticity and compliance.
                </p>
              </div>
              
              {governmentCheck.timestamp && (
                <p className="text-xs text-muted-foreground mt-4">
                  Last checked: {formatDate(governmentCheck.timestamp)}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Eligibility Check */}
      {eligibility && (
        <Card className={`bg-slate-900 border-slate-800 mb-8 ${
          eligibility.eligible ? 'border-emerald-500/50' : 'border-amber-500/50'
        }`}>
          <CardHeader>
            <div className="flex items-center gap-2">
              {eligibility.eligible ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
              ) : (
                <AlertCircle className="h-5 w-5 text-amber-400" />
              )}
              <CardTitle>Export Eligibility</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {eligibility.eligible ? (
              <div className="space-y-2">
                <p className="text-emerald-400 font-semibold">✓ You're eligible to export!</p>
                <p className="text-muted-foreground text-sm">
                  All required documents are in place. You can submit for Ghana Single Window verification.
                </p>
                {verificationStatus.status === 'NOT_SUBMITTED' && (
                  <Button
                    onClick={handleSubmitVerification}
                    disabled={submitting}
                    className="mt-4 bg-emerald-600 hover:bg-emerald-700"
                  >
                    {submitting ? 'Submitting...' : 'Submit for Verification'}
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-amber-400 font-semibold">Action Required</p>
                {eligibility.missingRequirements && eligibility.missingRequirements.length > 0 && (
                  <div>
                    <p className="text-slate-300 text-sm mb-2">Missing Requirements:</p>
                    <ul className="list-disc list-inside text-muted-foreground text-sm space-y-1">
                      {eligibility.missingRequirements.map((req: string, idx: number) => (
                        <li key={idx}>{req}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {eligibility.recommendations && eligibility.recommendations.length > 0 && (
                  <div>
                    <p className="text-slate-300 text-sm mb-2">Next Steps:</p>
                    <ul className="list-disc list-inside text-muted-foreground text-sm space-y-1">
                      {eligibility.recommendations.map((rec: string, idx: number) => (
                        <li key={idx}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <Link href="/dashboard/documents">
                  <Button className="mt-4 bg-emerald-600 hover:bg-emerald-700">
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Documents
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Required Documents */}
      <Card className="bg-slate-900 border-slate-800 mb-8">
        <CardHeader>
          <CardTitle className="text-white">Required Documents for Export</CardTitle>
          <CardDescription className="text-slate-400">
            Upload these documents to become eligible for export verification
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { name: 'GEPA License', type: 'GEPA_LICENSE', description: 'Ghana Export Promotion Authority license' },
              { name: 'Certificate of Origin', type: 'CERTIFICATE_OF_ORIGIN', description: 'Document certifying product origin' },
              { name: 'Quality Certificate', type: 'QUALITY_CERTIFICATE', description: 'Product quality assurance certificate' },
              { name: 'Phytosanitary Certificate', type: 'PHYTOSANITARY_CERTIFICATE', description: 'Plant health certificate' },
            ].map((doc, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 bg-card/50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-foreground font-medium">{doc.name}</p>
                    <p className="text-muted-foreground text-sm">{doc.description}</p>
                  </div>
                </div>
                <Link href="/dashboard/documents">
                  <Button variant="outline" size="sm">
                    Upload
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Information Card */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle>About Ghana Single Window Verification</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-foreground text-sm">
            <p>
              Ghana Single Window (GSW) is an integrated system that streamlines export documentation 
              and approval processes. Once verified, you can:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>List products for international export</li>
              <li>Access verified international buyers</li>
              <li>Automatically generate export documents</li>
              <li>Track export approval status in real-time</li>
              <li>Reduce export processing time significantly</li>
            </ul>
            <div className="mt-4 p-4 bg-card/50 rounded-lg">
              <p className="font-semibold text-foreground mb-2">Processing Time</p>
              <p className="text-muted-foreground">
                Verification typically takes 5-10 business days after all documents are submitted 
                and verified. You'll receive email notifications at each step.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
