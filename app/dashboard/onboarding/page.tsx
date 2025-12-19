'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, Circle, FileText, Globe, Shield, ArrowRight, AlertCircle, UserCheck, Building2, Package, Truck, Briefcase } from 'lucide-react'
import apiClient from '@/lib/api-client'
import { useToast } from '@/hooks/use-toast'
import { UserRole } from '@/types'
import Link from 'next/link'

interface OnboardingStep {
  id: string
  title: string
  description: string
  completed: boolean
  required: boolean
  href?: string
  icon?: any
}

export default function OnboardingPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [documents, setDocuments] = useState<any[]>([])
  const [eligibility, setEligibility] = useState<any>(null)

  useEffect(() => {
    loadUserData()
  }, [])

  const loadUserData = async () => {
    try {
      // Get current user
      const userRes = await apiClient.get('/auth/me')
      const userData = userRes.data
      setUser(userData)

      // Load role-specific profile
      try {
        let profileRes
        if (userData.role === UserRole.BUYER) {
          profileRes = await apiClient.get('/buyers/me')
        } else if (userData.role === UserRole.FARMER) {
          profileRes = await apiClient.get('/farmers/me')
        } else if (userData.role === UserRole.EXPORT_COMPANY) {
          profileRes = await apiClient.get('/export-companies/me')
        }
        
        if (profileRes?.data) {
          setProfile(profileRes.data)
        }
      } catch (error: any) {
        // Profile might not exist yet - that's okay
        if (error.response?.status !== 404) {
          console.error('Error loading profile:', error)
        }
      }

      // Load documents
      try {
        const docsRes = await apiClient.get('/documents')
        setDocuments(docsRes.data.data || [])
      } catch (error) {
        console.error('Error loading documents:', error)
      }

      // Check eligibility (for export roles)
      if ([UserRole.FARMER, UserRole.EXPORT_COMPANY, UserRole.TRADER].includes(userData.role)) {
        try {
          const eligibilityRes = await apiClient.get('/verification/eligibility')
          setEligibility(eligibilityRes.data)
        } catch (error) {
          console.error('Error checking eligibility:', error)
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error)
      toast({
        title: 'Error',
        description: 'Failed to load onboarding data',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const getRoleSpecificSteps = (): OnboardingStep[] => {
    if (!user) return []

    const role = user.role

    // Common steps for all roles
    const commonSteps: OnboardingStep[] = [
      {
        id: 'profile',
        title: 'Complete Your Profile',
        description: 'Add your business information and details',
        completed: checkProfileComplete(),
        required: true,
        href: '/dashboard/settings',
        icon: UserCheck,
      },
      {
        id: 'documents',
        title: 'Upload Required Documents',
        description: 'Add business registration, licenses, and certifications',
        completed: documents.length > 0 && documents.some(d => d.status === 'VERIFIED'),
        required: true,
        href: '/dashboard/documents',
        icon: FileText,
      },
    ]

    // Role-specific steps
    if (role === UserRole.BUYER) {
      return [
        ...commonSteps,
        {
          id: 'compliance',
          title: 'Review Compliance Requirements',
          description: 'Understand import requirements for your country',
          completed: profile?.complianceStatus === 'VERIFIED',
          required: true,
          href: '/dashboard/compliance',
          icon: Shield,
        },
        {
          id: 'payment',
          title: 'Add Payment Method',
          description: 'Set up payment preferences for transactions',
          completed: false, // TODO: Check if payment method exists
          required: false,
          href: '/dashboard/settings',
          icon: Briefcase,
        },
        {
          id: 'first-search',
          title: 'Search for Products',
          description: 'Browse available products from verified suppliers',
          completed: false,
          required: false,
          href: '/dashboard/farmers',
          icon: Globe,
        },
        {
          id: 'first-match',
          title: 'Get Your First Match',
          description: 'Receive AI-powered product recommendations',
          completed: false,
          required: false,
          href: '/dashboard/matches',
          icon: Package,
        },
      ]
    } else if (role === UserRole.FARMER) {
      return [
        ...commonSteps,
        {
          id: 'gepa-license',
          title: 'GEPA License Verification',
          description: 'Upload and verify your GEPA export license',
          completed: documents.some(d => d.type === 'GEPA_LICENSE' && d.status === 'VERIFIED'),
          required: true,
          href: '/dashboard/documents',
          icon: Shield,
        },
        {
          id: 'quality-cert',
          title: 'Quality Certifications',
          description: 'Upload quality certificates and certifications',
          completed: documents.some(d => ['QUALITY_CERTIFICATE', 'ORGANIC_CERTIFICATION', 'FAIR_TRADE_CERTIFICATION'].includes(d.type) && d.status === 'VERIFIED'),
          required: true,
          href: '/dashboard/documents',
          icon: FileText,
        },
        {
          id: 'ghana-sw',
          title: 'Ghana Single Window Registration',
          description: 'Submit for Ghana Single Window verification',
          completed: profile?.verifiedByGhanaSW === true || user.verified === true,
          required: true,
          href: '/dashboard/verification',
          icon: Globe,
        },
        {
          id: 'first-listing',
          title: 'Create Your First Listing',
          description: 'List your products for international buyers',
          completed: false,
          required: false,
          href: '/dashboard/listings/new',
          icon: Package,
        },
      ]
    } else if (role === UserRole.EXPORT_COMPANY) {
      return [
        ...commonSteps,
        {
          id: 'gepa-license',
          title: 'GEPA License Verification',
          description: 'Upload and verify your GEPA export license',
          completed: profile?.gepaLicense ? true : documents.some(d => d.type === 'GEPA_LICENSE' && d.status === 'VERIFIED'),
          required: true,
          href: '/dashboard/documents',
          icon: Shield,
        },
        {
          id: 'business-reg',
          title: 'Business Registration',
          description: 'Verify your business registration number',
          completed: profile?.registrationNo ? true : false,
          required: true,
          href: '/dashboard/settings',
          icon: Building2,
        },
        {
          id: 'ghana-sw',
          title: 'Ghana Single Window Registration',
          description: 'Submit for Ghana Single Window verification',
          completed: profile?.verifiedByGhanaSW === true || user.verified === true,
          required: true,
          href: '/dashboard/verification',
          icon: Globe,
        },
        {
          id: 'supplier-network',
          title: 'Build Supplier Network',
          description: 'Connect with farmers and build your supplier network',
          completed: false,
          required: false,
          href: '/dashboard/supplier-network',
          icon: Package,
        },
      ]
    } else if (role === UserRole.TRADER) {
      return [
        ...commonSteps,
        {
          id: 'gepa-license',
          title: 'GEPA License Verification',
          description: 'Upload and verify your GEPA export license',
          completed: documents.some(d => d.type === 'GEPA_LICENSE' && d.status === 'VERIFIED'),
          required: true,
          href: '/dashboard/documents',
          icon: Shield,
        },
        {
          id: 'ghana-sw',
          title: 'Ghana Single Window Registration',
          description: 'Submit for Ghana Single Window verification',
          completed: user.verified === true,
          required: true,
          href: '/dashboard/verification',
          icon: Globe,
        },
        {
          id: 'first-listing',
          title: 'Create Your First Listing',
          description: 'List products for international buyers',
          completed: false,
          required: false,
          href: '/dashboard/listings/new',
          icon: Package,
        },
      ]
    } else if ([UserRole.LOGISTICS_PROVIDER, UserRole.CUSTOMS_BROKER].includes(role)) {
      return [
        ...commonSteps,
        {
          id: 'business-license',
          title: 'Business License',
          description: 'Upload your business operating license',
          completed: documents.some(d => ['EXPORT_LICENSE', 'OTHER'].includes(d.type) && d.status === 'VERIFIED'),
          required: true,
          href: '/dashboard/documents',
          icon: Shield,
        },
        {
          id: 'verification',
          title: 'Platform Verification',
          description: 'Complete verification to access platform features',
          completed: user.verified === true,
          required: true,
          href: '/dashboard/verification',
          icon: UserCheck,
        },
      ]
    }

    // Default steps for other roles
    return [
      ...commonSteps,
      {
        id: 'verification',
        title: 'Account Verification',
        description: 'Complete account verification process',
        completed: user.verified === true,
        required: true,
        href: '/dashboard/settings',
        icon: UserCheck,
      },
    ]
  }

  const checkProfileComplete = (): boolean => {
    if (!user || !profile) return false

    const role = user.role

    if (role === UserRole.BUYER) {
      return !!(profile.companyName && profile.country && profile.industry)
    } else if (role === UserRole.FARMER) {
      return !!(profile.location && profile.region && profile.district)
    } else if (role === UserRole.EXPORT_COMPANY) {
      return !!(profile.companyName && profile.registrationNo)
    }

    return false
  }

  const steps = getRoleSpecificSteps()

  const completedSteps = steps.filter((s) => s.completed).length
  const requiredSteps = steps.filter((s) => s.required)
  const progress = requiredSteps.length > 0 ? (completedSteps / requiredSteps.length) * 100 : 0

  const getRoleDisplayName = (role: string) => {
    return role.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
  }

  const getRoleDescription = (role: string) => {
    const descriptions: Record<string, string> = {
      [UserRole.BUYER]: 'Complete these steps to start sourcing from verified Ghanaian suppliers',
      [UserRole.FARMER]: 'Complete these steps to start exporting your products internationally',
      [UserRole.EXPORT_COMPANY]: 'Complete these steps to start managing export operations',
      [UserRole.TRADER]: 'Complete these steps to start trading agricultural products',
      [UserRole.LOGISTICS_PROVIDER]: 'Complete these steps to start providing logistics services',
      [UserRole.CUSTOMS_BROKER]: 'Complete these steps to start providing customs brokerage services',
    }
    return descriptions[role] || 'Complete these steps to start using TradeLink+'
  }

  const isOnboardingComplete = () => {
    return requiredSteps.every(step => step.completed)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading onboarding status...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Card>
          <CardContent className="p-12 text-center">
            <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">User Not Found</h2>
            <p className="text-muted-foreground">Unable to load your user information.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-bold text-foreground">Welcome to TradeLink+</h1>
          <Badge variant="outline" className="text-sm">
            {getRoleDisplayName(user.role)}
          </Badge>
        </div>
        <p className="text-muted-foreground">
          {getRoleDescription(user.role)}
        </p>
      </div>

      {/* Progress Card */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Onboarding Progress</CardTitle>
          <CardDescription>
            {completedSteps} of {steps.filter((s) => s.required).length} required steps completed
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-foreground">Overall Progress</span>
              <span className="text-emerald-400 font-semibold">{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-3">
              <div
                className="bg-gradient-to-r from-emerald-500 to-cyan-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Onboarding Complete Banner */}
      {isOnboardingComplete() && (
        <Card className="mb-8 border-emerald-500/50 bg-emerald-500/5">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-500/20 rounded-full">
                <CheckCircle2 className="h-6 w-6 text-emerald-500" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-foreground mb-1">Onboarding Complete!</h3>
                <p className="text-sm text-muted-foreground">
                  All required steps are completed. Your account is pending admin verification to start engaging on the platform.
                </p>
              </div>
              <Badge variant="success" className="text-sm">
                Pending Admin Approval
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Eligibility Status (for export roles) */}
      {eligibility && [UserRole.FARMER, UserRole.EXPORT_COMPANY, UserRole.TRADER].includes(user.role) && (
        <Card className={`mb-8 ${
          eligibility.eligible ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-amber-500/50 bg-amber-500/5'
        }`}>
          <CardHeader>
            <div className="flex items-center gap-2">
              {eligibility.eligible ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              ) : (
                <AlertCircle className="h-5 w-5 text-amber-500" />
              )}
              <CardTitle>Export Eligibility Status</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {eligibility.eligible ? (
              <div className="space-y-2">
                <p className="text-emerald-500 font-semibold">✓ You're eligible to export!</p>
                <p className="text-sm text-muted-foreground">
                  Your account meets all requirements for international trade through Ghana Single Window.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-amber-500 font-semibold">Action Required</p>
                {eligibility.missingRequirements && eligibility.missingRequirements.length > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Missing Requirements:</p>
                    <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                      {eligibility.missingRequirements.map((req: string, idx: number) => (
                        <li key={idx}>{req}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {eligibility.recommendations && eligibility.recommendations.length > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Recommendations:</p>
                    <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                      {eligibility.recommendations.map((rec: string, idx: number) => (
                        <li key={idx}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Steps */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground mb-4">Onboarding Steps</h2>
        {steps.map((step, index) => {
          const StepIcon = step.icon || Circle
          return (
            <Card
              key={step.id}
              className={`hover:border-border transition-colors ${
                step.completed ? 'border-emerald-500/30 bg-emerald-500/5' : ''
              }`}
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1">
                    {step.completed ? (
                      <div className="p-2 bg-emerald-500/20 rounded-full">
                        <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                      </div>
                    ) : (
                      <div className="p-2 bg-muted rounded-full">
                        <StepIcon className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-foreground">{step.title}</h3>
                      <div className="flex items-center gap-2">
                        {step.required && (
                          <Badge variant="outline" className="text-xs bg-amber-500/10 text-amber-500 border-amber-500/30">
                            Required
                          </Badge>
                        )}
                        {step.completed && (
                          <Badge variant="success" className="text-xs">
                            Completed
                          </Badge>
                        )}
                      </div>
                    </div>
                    <p className="text-muted-foreground text-sm mb-4">{step.description}</p>
                    {step.href && (
                      <Link href={step.href}>
                        <Button
                          variant={step.completed ? 'outline' : 'default'}
                          size="sm"
                          className={step.completed ? '' : 'bg-emerald-600 hover:bg-emerald-700'}
                        >
                          {step.completed ? 'Review' : 'Get Started'}
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Quick Actions - Role Specific */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {user.role === UserRole.BUYER && (
              <>
                <Link href="/dashboard/farmers">
                  <Button variant="outline" className="w-full justify-start">
                    <Globe className="mr-2 h-4 w-4" />
                    Browse Suppliers
                  </Button>
                </Link>
                <Link href="/dashboard/compliance">
                  <Button variant="outline" className="w-full justify-start">
                    <Shield className="mr-2 h-4 w-4" />
                    Compliance Center
                  </Button>
                </Link>
                <Link href="/dashboard/matches">
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="mr-2 h-4 w-4" />
                    View Matches
                  </Button>
                </Link>
              </>
            )}
            {[UserRole.FARMER, UserRole.TRADER].includes(user.role) && (
              <>
                <Link href="/dashboard/listings/new">
                  <Button variant="outline" className="w-full justify-start">
                    <Package className="mr-2 h-4 w-4" />
                    Create Listing
                  </Button>
                </Link>
                <Link href="/dashboard/verification">
                  <Button variant="outline" className="w-full justify-start">
                    <Shield className="mr-2 h-4 w-4" />
                    Ghana SW Verification
                  </Button>
                </Link>
                <Link href="/dashboard/documents">
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="mr-2 h-4 w-4" />
                    Manage Documents
                  </Button>
                </Link>
              </>
            )}
            {user.role === UserRole.EXPORT_COMPANY && (
              <>
                <Link href="/dashboard/supplier-network">
                  <Button variant="outline" className="w-full justify-start">
                    <Building2 className="mr-2 h-4 w-4" />
                    Supplier Network
                  </Button>
                </Link>
                <Link href="/dashboard/verification">
                  <Button variant="outline" className="w-full justify-start">
                    <Shield className="mr-2 h-4 w-4" />
                    Ghana SW Verification
                  </Button>
                </Link>
                <Link href="/dashboard/documents">
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="mr-2 h-4 w-4" />
                    Manage Documents
                  </Button>
                </Link>
              </>
            )}
            {[UserRole.LOGISTICS_PROVIDER, UserRole.CUSTOMS_BROKER].includes(user.role) && (
              <>
                <Link href="/dashboard/documents">
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="mr-2 h-4 w-4" />
                    Upload Documents
                  </Button>
                </Link>
                <Link href="/dashboard/verification">
                  <Button variant="outline" className="w-full justify-start">
                    <UserCheck className="mr-2 h-4 w-4" />
                    Get Verified
                  </Button>
                </Link>
                <Link href="/dashboard/settings">
                  <Button variant="outline" className="w-full justify-start">
                    <Shield className="mr-2 h-4 w-4" />
                    Profile Settings
                  </Button>
                </Link>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
