'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Shield, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Upload, 
  Download,
  Globe,
  Info
} from 'lucide-react'
import apiClient from '@/lib/api-client'
import { useToast } from '@/hooks/use-toast'
import Link from 'next/link'
import { ContactSupportDialog } from '@/components/support/contact-support-dialog'

interface ComplianceRequirement {
  type: string
  name: string
  description: string
  required: boolean
  uploaded: boolean
  status?: 'PENDING' | 'VERIFIED' | 'REJECTED'
}

export default function CompliancePage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [buyer, setBuyer] = useState<any>(null)
  const [requirements, setRequirements] = useState<ComplianceRequirement[]>([])
  const [countryCode, setCountryCode] = useState<string>('')

  useEffect(() => {
    loadComplianceData()
  }, [])

  const loadComplianceData = async () => {
    try {
      // Get buyer profile
      const userRes = await apiClient.get('/auth/me')
      const userId = userRes.data.id

      try {
        // Try to get current user's buyer profile
        const buyerRes = await apiClient.get('/buyers/me')
        if (buyerRes.data) {
          setBuyer(buyerRes.data)
          setCountryCode(buyerRes.data.country || 'US')
        }
      } catch (error: any) {
        // Buyer profile might not exist yet - that's okay
        if (error.response?.status !== 404) {
          console.error('Error loading buyer:', error)
        }
      }

      // Get country-specific requirements
      if (countryCode) {
        try {
          const reqRes = await apiClient.get(`/verification/compliance-requirements/${countryCode}`)
          const reqData = reqRes.data
          
          // Map to requirements format
          const mappedRequirements: ComplianceRequirement[] = reqData.requiredDocuments.map((doc: string) => ({
            type: doc,
            name: doc.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
            description: getDocumentDescription(doc),
            required: true,
            uploaded: buyer?.complianceDocuments?.includes(doc) || false,
            status: 'PENDING',
          }))
          
          setRequirements(mappedRequirements)
        } catch (error) {
          console.error('Error loading requirements:', error)
        }
      }
    } catch (error) {
      console.error('Error loading compliance data:', error)
      toast({
        title: 'Error',
        description: 'Failed to load compliance information',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const getDocumentDescription = (docType: string): string => {
    const descriptions: Record<string, string> = {
      'FDA_REGISTRATION': 'Food and Drug Administration registration for importing food products to USA',
      'USDA_CERTIFICATE': 'USDA certificate for agricultural products',
      'CERTIFICATE_OF_ORIGIN': 'Document certifying the country of origin of the goods',
      'PHYTOSANITARY_CERTIFICATE': 'Certificate ensuring products are free from pests and diseases',
      'EU_TRACES': 'EU Trade Control and Expert System registration',
      'HEALTH_CERTIFICATE': 'Health certificate for food products',
      'AQSIQ_CERTIFICATE': 'China quality inspection certificate',
      'IMPORT_PERMIT': 'Import permit from destination country',
      'QUALITY_CERTIFICATE': 'Quality assurance certificate',
    }
    return descriptions[docType] || 'Required document for import compliance'
  }

  const getCountryName = (code: string): string => {
    const countries: Record<string, string> = {
      'US': 'United States',
      'GB': 'United Kingdom',
      'CN': 'China',
      'GH': 'Ghana',
    }
    return countries[code] || code
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading compliance information...</p>
        </div>
      </div>
    )
  }

  const completedCount = requirements.filter((r) => r.uploaded).length
  const totalRequired = requirements.filter((r) => r.required).length

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Compliance Center</h1>
        <p className="text-muted-foreground">
          Manage your import compliance documents and requirements
        </p>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm mb-1">Country</p>
                <p className="text-foreground text-2xl font-bold">
                  {countryCode ? getCountryName(countryCode) : 'Not Set'}
                </p>
              </div>
              <Globe className="h-8 w-8 text-emerald-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm mb-1">Documents Uploaded</p>
                <p className="text-foreground text-2xl font-bold">
                  {completedCount} / {totalRequired}
                </p>
              </div>
              <FileText className="h-8 w-8 text-cyan-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm mb-1">Compliance Status</p>
                <p className="text-foreground text-2xl font-bold">
                  {buyer?.complianceStatus || 'PENDING'}
                </p>
              </div>
              <Shield className="h-8 w-8 text-amber-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Requirements List */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Required Documents</CardTitle>
          <CardDescription>
            Upload the following documents to meet import requirements for {countryCode ? getCountryName(countryCode) : 'your country'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {requirements.length === 0 ? (
              <div className="text-center py-8">
                <Info className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  No specific requirements found. Please set your country in your profile.
                </p>
                <Link href="/dashboard/settings">
                  <Button variant="outline" className="mt-4">
                    Update Profile
                  </Button>
                </Link>
              </div>
            ) : (
              requirements.map((req, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${
                    req.uploaded
                      ? 'bg-emerald-500/10 border-emerald-500/30'
                      : 'bg-card/50 border-border'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-foreground font-semibold">{req.name}</h3>
                        {req.required && (
                          <Badge variant="destructive" className="text-xs">
                            Required
                          </Badge>
                        )}
                        {req.uploaded && (
                          <Badge variant="success" className="text-xs">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Uploaded
                          </Badge>
                        )}
                      </div>
                      <p className="text-muted-foreground text-sm mb-3">{req.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {req.uploaded ? (
                        <>
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            View
                          </Button>
                          <Button variant="outline" size="sm">
                            Replace
                          </Button>
                        </>
                      ) : (
                        <Link href="/dashboard/documents">
                          <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                            <Upload className="h-4 w-4 mr-2" />
                            Upload
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Country Requirements Info */}
      {countryCode && (
        <Card>
          <CardHeader>
            <CardTitle>Country-Specific Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="text-foreground font-semibold mb-2">Quality Standards</h4>
                <div className="flex flex-wrap gap-2">
                  {buyer?.qualityStandards?.map((standard: string, idx: number) => (
                    <Badge key={idx} variant="outline">
                      {standard}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-foreground font-semibold mb-2">Important Notes</h4>
                <ul className="list-disc list-inside text-muted-foreground text-sm space-y-1">
                  <li>All documents must be verified before products can be shipped</li>
                  <li>Some documents may take 5-10 business days to process</li>
                  <li>Contact support if you need assistance with any requirements</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Help Section */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Need Help?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-card/50 rounded-lg">
              <h4 className="text-foreground font-semibold mb-2">Document Assistance</h4>
              <p className="text-muted-foreground text-sm mb-3">
                Get help understanding and obtaining required documents
              </p>
              <ContactSupportDialog
                trigger={
                  <Button variant="outline" size="sm">
                    Contact Support
                  </Button>
                }
              />
            </div>
            <div className="p-4 bg-card/50 rounded-lg">
              <h4 className="text-foreground font-semibold mb-2">Compliance Guide</h4>
              <p className="text-muted-foreground text-sm mb-3">
                Read our comprehensive guide to import compliance
              </p>
              <Link href="/dashboard/compliance/guide">
                <Button variant="outline" size="sm">
                  View Guide
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
