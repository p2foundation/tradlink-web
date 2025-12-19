'use client'

import { useMemo, useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { UserRole } from '@/types'
import { setTokens } from '@/lib/auth-tokens'
import apiClient from '@/lib/api-client'
import { ChevronDown, Check, ArrowRight, ArrowLeft, Sparkles } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useNavigation } from '@/hooks/use-navigation'

type Step = 1 | 2 | 3 | 4 | 5

// Comprehensive country list
const COUNTRIES = [
  'Ghana',
  'Nigeria',
  'Kenya',
  'Rwanda',
  'South Africa',
  'Tanzania',
  'Uganda',
  'Ethiopia',
  'Ivory Coast',
  'Senegal',
  'China',
  'India',
  'United States',
  'United Kingdom',
  'Germany',
  'France',
  'Netherlands',
  'Switzerland',
  'Belgium',
  'Italy',
  'Spain',
  'Canada',
  'Australia',
  'Japan',
  'South Korea',
  'United Arab Emirates',
  'Saudi Arabia',
  'Brazil',
  'Mexico',
  'Argentina',
  'Other',
]

// Role-specific industry/sector options
const getIndustryOptions = (role: UserRole): string[] => {
  switch (role) {
    case UserRole.FARMER:
      return [
        'Cocoa',
        'Shea Butter',
        'Cashew Nuts',
        'Coffee',
        'Palm Oil',
        'Rice',
        'Maize',
        'Plantain',
        'Yam',
        'Cassava',
        'Vegetables',
        'Fruits',
        'Spices (Ginger, Turmeric, etc.)',
        'Honey',
        'Livestock',
        'Poultry',
        'Fisheries',
        'Other Crops',
      ]

    case UserRole.EXPORT_COMPANY:
      return [
        'Agricultural Export',
        'Commodity Trading',
        'Export Management',
        'International Trade',
        'Agri-Export Services',
        'Export Logistics',
        'Trade Facilitation',
        'Export Documentation',
        'Other Export Services',
      ]

    case UserRole.TRADER:
      return [
        'Commodity Trading',
        'Agricultural Trading',
        'Import/Export Trading',
        'International Trade',
        'Bulk Trading',
        'Spot Trading',
        'Futures Trading',
        'Trade Intermediation',
        'Other Trading Services',
      ]

    case UserRole.LOGISTICS_PROVIDER:
      return [
        'Freight Forwarding',
        'Shipping & Maritime',
        'Air Freight',
        'Road Transportation',
        'Warehousing',
        'Cold Chain Logistics',
        'Container Services',
        'Supply Chain Management',
        'Last Mile Delivery',
        'Other Logistics Services',
      ]

    case UserRole.CUSTOMS_BROKER:
      return [
        'Customs Clearance',
        'Customs Brokerage',
        'Import/Export Documentation',
        'Trade Compliance',
        'Customs Consulting',
        'Duty & Tax Services',
        'Port Services',
        'Other Customs Services',
      ]

    case UserRole.QUALITY_ASSURANCE:
      return [
        'Food Testing',
        'Agricultural Testing',
        'Quality Certification',
        'Laboratory Services',
        'Product Inspection',
        'Standards Compliance',
        'Organic Certification',
        'Fair Trade Certification',
        'Other Quality Services',
      ]

    case UserRole.FINANCIAL_INSTITUTION:
      return [
        'Trade Finance',
        'Export Finance',
        'Banking Services',
        'Payment Processing',
        'Credit Services',
        'Insurance Services',
        'Investment Banking',
        'Microfinance',
        'Other Financial Services',
      ]

    case UserRole.AGRIBUSINESS:
      return [
        'Food Processing',
        'Agro-Processing',
        'Value Addition',
        'Manufacturing',
        'Packaging',
        'Distribution',
        'Retail',
        'Wholesale',
        'Other Agribusiness',
      ]

    case UserRole.BUYER:
      return [
        'Retail',
        'Wholesale',
        'Food Distribution',
        'Grocery Chain',
        'Supermarket',
        'Restaurant Chain',
        'Food Manufacturing',
        'Import/Export',
        'E-commerce',
        'Other Buying Services',
      ]

    case UserRole.GOVERNMENT_OFFICIAL:
      return [
        'Ministry of Trade',
        'Ministry of Agriculture',
        'Customs Authority',
        'Export Promotion',
        'Regulatory Compliance',
        'Policy & Planning',
        'Trade Facilitation',
        'Other Government Services',
      ]

    case UserRole.ADMIN:
      return [
        'Platform Administration',
        'System Management',
        'User Management',
        'Content Management',
        'Other Administrative Services',
      ]

    default:
      return [
        'Agriculture',
        'Trade',
        'Logistics',
        'Finance',
        'Other',
      ]
  }
}

// Role categories with descriptions
const ROLE_CATEGORIES = [
  {
    id: 'producers',
    name: 'Producers & Exporters',
    description: 'Sell and export agricultural products globally',
    roles: [
      {
        role: UserRole.FARMER,
        title: 'Producer',
        description: 'Farmers and agricultural producers selling products',
        shortDesc: 'Sell products globally',
      },
      {
        role: UserRole.EXPORT_COMPANY,
        title: 'Export Company',
        description: 'Companies managing international export operations',
        shortDesc: 'Manage international exports',
      },
      {
        role: UserRole.AGRIBUSINESS,
        title: 'Agribusiness',
        description: 'Processing and value addition businesses',
        shortDesc: 'Process & add value',
      },
    ],
  },
  {
    id: 'buyers',
    name: 'Buyers & Importers',
    description: 'Source products from Ghana and international markets',
    roles: [
      {
        role: UserRole.BUYER,
        title: 'Buyer',
        description: 'International and local buyers sourcing products',
        shortDesc: 'Source from Ghana',
      },
      {
        role: UserRole.TRADER,
        title: 'Trader',
        description: 'Trade facilitators connecting buyers and sellers',
        shortDesc: 'Facilitate global trade',
      },
    ],
  },
  {
    id: 'services',
    name: 'Trade Services',
    description: 'Supporting services for international trade',
    roles: [
      {
        role: UserRole.LOGISTICS_PROVIDER,
        title: 'Logistics Provider',
        description: 'Shipping, freight, and transportation services',
        shortDesc: 'Shipping & freight',
      },
      {
        role: UserRole.CUSTOMS_BROKER,
        title: 'Customs Broker',
        description: 'Customs clearance and documentation services',
        shortDesc: 'Clearance & docs',
      },
      {
        role: UserRole.QUALITY_ASSURANCE,
        title: 'Quality Lab',
        description: 'Testing, certification, and quality verification',
        shortDesc: 'Testing & certification',
      },
      {
        role: UserRole.FINANCIAL_INSTITUTION,
        title: 'Financial Institution',
        description: 'Trade finance, payments, and banking services',
        shortDesc: 'Trade finance & payments',
      },
    ],
  },
  {
    id: 'regulatory',
    name: 'Regulatory & Admin',
    description: 'Government and platform administration',
    roles: [
      {
        role: UserRole.GOVERNMENT_OFFICIAL,
        title: 'Government Official',
        description: 'Regulatory oversight and compliance monitoring',
        shortDesc: 'Regulatory oversight',
      },
      {
        role: UserRole.ADMIN,
        title: 'Admin',
        description: 'Platform management and administration',
        shortDesc: 'Platform management',
      },
    ],
  },
]

export default function RegisterPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { navigate, isNavigating } = useNavigation()
  const [step, setStep] = useState<Step>(1)
  const [loading, setLoading] = useState(false)
  const [remember, setRemember] = useState(true)
  const [openCategory, setOpenCategory] = useState<string | null>(null)
  const categoryRefs = useRef<Record<string, HTMLDivElement | null>>({})
  
  const [formData, setFormData] = useState({
    role: UserRole.BUYER,
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    country: '',
    industry: '',
    ghanaCard: '',
    companyName: '',
    companyRegistration: '',
    organization: '',
  })

  // Close category when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openCategory) {
        const ref = categoryRefs.current[openCategory]
        if (ref && !ref.contains(event.target as Node)) {
          setOpenCategory(null)
        }
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [openCategory])

  // Scroll to selected category
  useEffect(() => {
    if (openCategory && categoryRefs.current[openCategory]) {
      categoryRefs.current[openCategory]?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      })
    }
  }, [openCategory])

  const canContinue = useMemo(() => {
    if (step === 1) {
      return Boolean(formData.role)
    }
    if (step === 2) {
      return formData.firstName && formData.lastName && formData.email
    }
    if (step === 3) {
      if (formData.role === UserRole.FARMER) {
        return Boolean(formData.ghanaCard)
      }
      if ([UserRole.EXPORT_COMPANY, UserRole.TRADER, UserRole.LOGISTICS_PROVIDER, 
           UserRole.CUSTOMS_BROKER, UserRole.QUALITY_ASSURANCE, UserRole.FINANCIAL_INSTITUTION,
           UserRole.AGRIBUSINESS].includes(formData.role)) {
        return Boolean(formData.companyName && formData.companyName.trim().length > 0)
      }
      return true
    }
    if (step === 4) {
      return formData.password.length >= 8 && formData.password === formData.confirmPassword
    }
    return true
  }, [step, formData])

  const handleNext = () => {
    if (!canContinue) {
      toast({
        variant: 'warning',
        title: 'Incomplete Form',
        description: 'Please complete all required fields before continuing.',
      })
      return
    }
    setStep((prev) => Math.min(prev + 1, 5) as Step)
  }

  const handlePrev = () => setStep((prev) => Math.max(prev - 1, 1) as Step)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const roleMetadata: Record<string, Record<string, string | undefined>> = {
        [UserRole.FARMER]: {
          ghanaCard: formData.ghanaCard || undefined,
          country: formData.country || undefined,
          industry: formData.industry || undefined,
        },
        [UserRole.EXPORT_COMPANY]: {
          companyName: formData.companyName || undefined,
          companyRegistration: formData.companyRegistration || undefined,
          country: formData.country || undefined,
          industry: formData.industry || undefined,
        },
        [UserRole.BUYER]: {
          organization: formData.organization || undefined,
          country: formData.country || undefined,
          industry: formData.industry || undefined,
        },
        [UserRole.TRADER]: {
          companyName: formData.companyName || undefined,
          companyRegistration: formData.companyRegistration || undefined,
          country: formData.country || undefined,
          industry: formData.industry || undefined,
        },
        [UserRole.LOGISTICS_PROVIDER]: {
          companyName: formData.companyName || undefined,
          companyRegistration: formData.companyRegistration || undefined,
          country: formData.country || undefined,
          industry: formData.industry || undefined,
        },
        [UserRole.CUSTOMS_BROKER]: {
          companyName: formData.companyName || undefined,
          companyRegistration: formData.companyRegistration || undefined,
          country: formData.country || undefined,
          industry: formData.industry || undefined,
        },
        [UserRole.QUALITY_ASSURANCE]: {
          companyName: formData.companyName || undefined,
          companyRegistration: formData.companyRegistration || undefined,
          country: formData.country || undefined,
          industry: formData.industry || undefined,
        },
        [UserRole.FINANCIAL_INSTITUTION]: {
          companyName: formData.companyName || undefined,
          companyRegistration: formData.companyRegistration || undefined,
          country: formData.country || undefined,
          industry: formData.industry || undefined,
        },
        [UserRole.AGRIBUSINESS]: {
          companyName: formData.companyName || undefined,
          companyRegistration: formData.companyRegistration || undefined,
          country: formData.country || undefined,
          industry: formData.industry || undefined,
        },
        [UserRole.GOVERNMENT_OFFICIAL]: {
          organization: formData.organization || undefined,
          country: formData.country || undefined,
          industry: formData.industry || undefined,
        },
        [UserRole.ADMIN]: {
          organization: formData.organization || undefined,
        },
      }

      const payload: any = {
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone || undefined,
        role: formData.role,
      }
      const metadata = roleMetadata[formData.role]
      if (metadata) {
        payload.metadata = metadata
      }
      const response = await apiClient.post('/auth/register', payload)
      const { accessToken, refreshToken, user } = response.data
      setTokens({ accessToken, refreshToken, remember })
      localStorage.setItem('user', JSON.stringify(user))

      toast({
        variant: 'success',
        title: 'Account Created!',
        description: 'Welcome to TradeLink+. Complete your KYC in settings to start trading.',
      })

      setTimeout(() => {
        navigate('/dashboard')
      }, 500)
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Registration failed. Please try again.'
      toast({
        variant: 'destructive',
        title: 'Registration Failed',
        description: errorMessage,
      })
      setLoading(false)
    }
  }

  const toggleCategory = (categoryId: string) => {
    setOpenCategory(openCategory === categoryId ? null : categoryId)
  }

  const selectRole = (role: UserRole) => {
    setFormData({ ...formData, role })
    setOpenCategory(null)
  }

  const getSelectedRoleInfo = () => {
    for (const category of ROLE_CATEGORIES) {
      const roleInfo = category.roles.find(r => r.role === formData.role)
      if (roleInfo) {
        return { category: category.name, ...roleInfo }
      }
    }
    return null
  }

  // Helper functions for role-specific requirements
  const needsCompanyName = [
    UserRole.EXPORT_COMPANY, UserRole.TRADER, UserRole.LOGISTICS_PROVIDER,
    UserRole.CUSTOMS_BROKER, UserRole.QUALITY_ASSURANCE, UserRole.FINANCIAL_INSTITUTION,
    UserRole.AGRIBUSINESS
  ].includes(formData.role)

  const needsOrganization = [
    UserRole.BUYER, UserRole.GOVERNMENT_OFFICIAL, UserRole.ADMIN
  ].includes(formData.role)

  const renderStep = () => {
    switch (step) {
      case 1:
        const selectedRoleInfo = getSelectedRoleInfo()
        
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <Label className="text-foreground text-xl font-semibold block">
                Select Your Role in Global Trade
              </Label>
              <p className="text-sm text-muted-foreground">
                Choose your role to get started. You can complete KYC verification from your profile settings.
              </p>
            </div>

            {/* Selected Role Preview */}
            {formData.role && selectedRoleInfo && (
              <div className="p-4 rounded-lg bg-primary/10 border border-primary/30 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Selected Role</p>
                    <p className="text-foreground font-semibold">{selectedRoleInfo.title}</p>
                    <p className="text-sm text-muted-foreground">{selectedRoleInfo.description}</p>
                  </div>
                  <div className="p-2 rounded-full bg-primary/20">
                    <Check className="h-5 w-5 text-primary" />
                  </div>
                </div>
              </div>
            )}

            {/* Role Categories */}
            <div className="space-y-3">
              {ROLE_CATEGORIES.map((category, categoryIndex) => {
                const isOpen = openCategory === category.id
                const hasSelectedRole = category.roles.some(r => r.role === formData.role)
                
                return (
                  <div
                    key={category.id}
                    ref={(el) => (categoryRefs.current[category.id] = el)}
                    className="relative"
                  >
                    <button
                      type="button"
                      onClick={() => toggleCategory(category.id)}
                      className={`
                        w-full p-4 rounded-lg border transition-all duration-300 text-left
                        ${isOpen 
                          ? 'bg-card border-primary/50 shadow-lg shadow-primary/10' 
                          : 'bg-card/50 border-border hover:border-primary/30 hover:bg-card/70'
                        }
                        ${hasSelectedRole ? 'ring-2 ring-primary/30' : ''}
                      `}
                      style={{
                        animationDelay: `${categoryIndex * 0.1}s`,
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="text-foreground font-semibold mb-1">{category.name}</h3>
                          <p className="text-sm text-muted-foreground">{category.description}</p>
                        </div>
                        <ChevronDown 
                          className={`
                            h-5 w-5 text-muted-foreground transition-transform duration-300
                            ${isOpen ? 'transform rotate-180' : ''}
                          `}
                        />
                      </div>
                    </button>

                    {/* Animated Dropdown */}
                    <div
                      className={`
                        overflow-hidden transition-all duration-500 ease-in-out
                        ${isOpen ? 'max-h-[500px] opacity-100 mt-2' : 'max-h-0 opacity-0'}
                      `}
                    >
                      <div className="p-4 rounded-lg bg-card/80 border border-border space-y-2">
                        {category.roles.map((roleInfo, roleIndex) => {
                          const isSelected = formData.role === roleInfo.role
                          return (
                            <button
                              key={roleInfo.role}
                              type="button"
                              onClick={() => selectRole(roleInfo.role)}
                              className={`
                                w-full p-4 rounded-lg border transition-all duration-300 text-left
                                transform hover:scale-[1.02]
                                ${isSelected
                                  ? 'bg-primary/20 border-primary/50 shadow-md shadow-primary/10 ring-2 ring-primary/30'
                                  : 'bg-background border-border hover:border-primary/30 hover:bg-card/50'
                                }
                              `}
                              style={{
                                animation: isOpen 
                                  ? `slideInRight 0.3s ease-out ${roleIndex * 0.05}s both`
                                  : 'none',
                              }}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h4 className={`font-semibold ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                                      {roleInfo.title}
                                    </h4>
                                    {isSelected && (
                                      <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                                    )}
                                  </div>
                                  <p className="text-sm text-muted-foreground">{roleInfo.shortDesc}</p>
                                </div>
                                {isSelected && (
                                  <div className="ml-4 p-1.5 rounded-full bg-primary/20">
                                    <Check className="h-4 w-4 text-primary" />
                                  </div>
                                )}
                              </div>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            <style jsx>{`
              @keyframes slideInRight {
                from {
                  opacity: 0;
                  transform: translateX(-20px);
                }
                to {
                  opacity: 1;
                  transform: translateX(0);
                }
              }
            `}</style>
          </div>
        )

      case 2:
        return (
          <div className="space-y-5">
            <div className="text-center space-y-1 mb-6">
              <h3 className="text-lg font-semibold text-foreground">Personal Information</h3>
              <p className="text-sm text-muted-foreground">Tell us about yourself</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-foreground">
                  First Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  required
                  className="h-11"
                  placeholder="John"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-foreground">
                  Last Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  required
                  className="h-11"
                  placeholder="Doe"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground">
                Email Address <span className="text-destructive">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="h-11"
                placeholder="john.doe@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-foreground">
                Phone Number <span className="text-muted-foreground text-xs">(Optional)</span>
              </Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="h-11"
                placeholder="+233 XX XXX XXXX"
              />
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-5">
            <div className="text-center space-y-1 mb-6">
              <h3 className="text-lg font-semibold text-foreground">Role-Specific Information</h3>
              <p className="text-sm text-muted-foreground">Complete your profile details</p>
            </div>

            {formData.role === UserRole.FARMER && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="ghanaCard" className="text-foreground">
                    Ghana Card Number <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="ghanaCard"
                    value={formData.ghanaCard}
                    onChange={(e) => setFormData({ ...formData, ghanaCard: e.target.value })}
                    required
                    placeholder="GHA-XXXXXXXXX-X"
                    className="h-11"
                  />
                  <p className="text-xs text-muted-foreground">Required for farmers and producers</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="farmer-country" className="text-foreground">
                      Country <span className="text-muted-foreground text-xs">(Optional)</span>
                    </Label>
                    <select
                      id="farmer-country"
                      name="farmer-country"
                      title="Select your country"
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <option value="">Select a country</option>
                      {COUNTRIES.map((country) => (
                        <option key={country} value={country}>
                          {country}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="farmer-industry" className="text-foreground">
                      Crop/Industry <span className="text-muted-foreground text-xs">(Optional)</span>
                    </Label>
                    <select
                      id="farmer-industry"
                      name="farmer-industry"
                      title="Select your primary crop or industry"
                      value={formData.industry}
                      onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                      className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <option value="">Select crop or industry</option>
                      {getIndustryOptions(UserRole.FARMER).map((industry) => (
                        <option key={industry} value={industry}>
                          {industry}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {needsCompanyName && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName" className="text-foreground">
                    Company/Business Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="companyName"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    required
                    placeholder="Your company or business name"
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyRegistration" className="text-foreground">
                    Registration/License Number <span className="text-muted-foreground text-xs">(Optional)</span>
                  </Label>
                  <Input
                    id="companyRegistration"
                    value={formData.companyRegistration}
                    onChange={(e) => setFormData({ ...formData, companyRegistration: e.target.value })}
                    placeholder="Business registration, license, or accreditation number"
                    className="h-11"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="company-country" className="text-foreground">
                      Country <span className="text-muted-foreground text-xs">(Optional)</span>
                    </Label>
                    <select
                      id="company-country"
                      name="company-country"
                      title="Select your country"
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <option value="">Select a country</option>
                      {COUNTRIES.map((country) => (
                        <option key={country} value={country}>
                          {country}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company-industry" className="text-foreground">
                      Industry/Sector <span className="text-muted-foreground text-xs">(Optional)</span>
                    </Label>
                    <select
                      id="company-industry"
                      name="company-industry"
                      title="Select your industry or sector"
                      value={formData.industry}
                      onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                      className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <option value="">Select industry or sector</option>
                      {getIndustryOptions(formData.role).map((industry) => (
                        <option key={industry} value={industry}>
                          {industry}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {needsOrganization && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="organization" className="text-foreground">
                    Organization/Institution <span className="text-muted-foreground text-xs">(Optional)</span>
                  </Label>
                  <Input
                    id="organization"
                    value={formData.organization}
                    onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                    placeholder="Company, Agency, Department, or Institution"
                    className="h-11"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="org-country" className="text-foreground">
                      Country <span className="text-muted-foreground text-xs">(Optional)</span>
                    </Label>
                    <select
                      id="org-country"
                      name="org-country"
                      title="Select your country"
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <option value="">Select a country</option>
                      {COUNTRIES.map((country) => (
                        <option key={country} value={country}>
                          {country}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="org-industry" className="text-foreground">
                      Industry/Sector <span className="text-muted-foreground text-xs">(Optional)</span>
                    </Label>
                    <select
                      id="org-industry"
                      name="org-industry"
                      title="Select your industry or sector"
                      value={formData.industry}
                      onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                      className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <option value="">Select industry or sector</option>
                      {getIndustryOptions(formData.role).map((industry) => (
                        <option key={industry} value={industry}>
                          {industry}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
        )

      case 4:
        return (
          <div className="space-y-5">
            <div className="text-center space-y-1 mb-6">
              <h3 className="text-lg font-semibold text-foreground">Create Password</h3>
              <p className="text-sm text-muted-foreground">Choose a strong password for your account</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground">
                Password <span className="text-destructive">*</span>
              </Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                minLength={8}
                className="h-11"
                placeholder="Minimum 8 characters"
              />
              <p className="text-xs text-muted-foreground">Must be at least 8 characters long</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-foreground">
                Confirm Password <span className="text-destructive">*</span>
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
                minLength={8}
                className="h-11"
                placeholder="Re-enter your password"
              />
              {formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword && (
                <p className="text-xs text-destructive">Passwords do not match</p>
              )}
            </div>
          </div>
        )

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-1 mb-6">
              <h3 className="text-lg font-semibold text-foreground">Review Your Information</h3>
              <p className="text-sm text-muted-foreground">Please verify your details before creating your account</p>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-card border border-border">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Account Type</p>
                  <p className="font-medium text-foreground capitalize">{formData.role.toLowerCase().replace('_', ' ')}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Email</p>
                  <p className="font-medium text-foreground">{formData.email}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Name</p>
                  <p className="font-medium text-foreground">
                    {formData.firstName} {formData.lastName}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Phone</p>
                  <p className="font-medium text-foreground">{formData.phone || '—'}</p>
                </div>
                {formData.country && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Country</p>
                    <p className="font-medium text-foreground">{formData.country}</p>
                  </div>
                )}
                {formData.industry && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Industry</p>
                    <p className="font-medium text-foreground">{formData.industry}</p>
                  </div>
                )}
                {formData.role === UserRole.FARMER && formData.ghanaCard && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Ghana Card</p>
                    <p className="font-medium text-foreground">{formData.ghanaCard}</p>
                  </div>
                )}
                {needsCompanyName && formData.companyName && (
                  <>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Company Name</p>
                      <p className="font-medium text-foreground">{formData.companyName}</p>
                    </div>
                    {formData.companyRegistration && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Registration</p>
                        <p className="font-medium text-foreground">{formData.companyRegistration}</p>
                      </div>
                    )}
                  </>
                )}
                {needsOrganization && formData.organization && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Organization</p>
                    <p className="font-medium text-foreground">{formData.organization}</p>
                  </div>
                )}
              </div>

              <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-full bg-primary/20 mt-0.5">
                    <Sparkles className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground mb-1">Complete KYC Verification</p>
                    <p className="text-xs text-muted-foreground">
                      After registration, complete your Know Your Customer (KYC) verification from your profile settings to unlock full platform features and start trading.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="remember"
                  className="h-4 w-4 rounded border-input bg-background text-primary focus:ring-primary"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />
                <label htmlFor="remember" className="text-sm text-foreground cursor-pointer">
                  Keep me signed in on this device
                </label>
              </div>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 px-4 py-8">
      <Card className="w-full max-w-2xl border-border bg-card/50 backdrop-blur-sm shadow-2xl">
        <CardHeader className="space-y-3 pb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wider text-primary font-medium mb-1">TradeLink+</p>
              <CardTitle className="text-3xl font-bold text-foreground">Create Your Account</CardTitle>
              <CardDescription className="text-base mt-2">
                Join Ghana's premier export platform. Complete the steps below to get started.
              </CardDescription>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground mb-2">
                Step {step} of 5
              </p>
              <div className="h-2 w-32 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-500 ease-out"
                  style={{ width: `${(step / 5) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="min-h-[400px]">
              {renderStep()}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-border">
              <Button
                type="button"
                variant="ghost"
                onClick={handlePrev}
                disabled={step === 1}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              {step < 5 ? (
                <Button
                  type="button"
                  onClick={handleNext}
                  disabled={!canContinue}
                  className="gap-2"
                >
                  Continue
                  <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button 
                  type="submit" 
                  disabled={loading || isNavigating || !canContinue}
                  className="gap-2"
                >
                  {loading || isNavigating ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Creating account...
                    </>
                  ) : (
                    <>
                      Create Account
                      <Sparkles className="h-4 w-4" />
                    </>
                  )}
                </Button>
              )}
            </div>

            <div className="text-center text-sm text-muted-foreground pt-4 border-t border-border">
              Already have an account?{' '}
              <Link href="/login" className="text-primary hover:underline font-medium">
                Sign in
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
