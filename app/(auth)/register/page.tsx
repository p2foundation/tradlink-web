'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { UserRole } from '@/types'
import { setTokens } from '@/lib/auth-tokens'
import apiClient from '@/lib/api-client'
import { Users, ShoppingBag, Building2, Settings, Check } from 'lucide-react'
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

export default function RegisterPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { navigate, isNavigating } = useNavigation()
  const [step, setStep] = useState<Step>(1)
  const [loading, setLoading] = useState(false)
  const [remember, setRemember] = useState(true)
  const [formData, setFormData] = useState({
    role: UserRole.FARMER,
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
      if (formData.role === UserRole.EXPORT_COMPANY) {
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
        description: 'Welcome to TradeLink+. Redirecting to your dashboard...',
      })

      // Small delay to show toast, then navigate
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

  const renderStep = () => {
    switch (step) {
      case 1:
        const accountTypes = [
          {
            role: UserRole.FARMER,
            title: 'Farmer',
            description: 'Sell your crops directly to international buyers',
            icon: Users,
            color: 'emerald',
            requirement: 'Ghana Card required',
          },
          {
            role: UserRole.EXPORT_COMPANY,
            title: 'Export Company',
            description: 'Manage exports and connect with suppliers',
            icon: Building2,
            color: 'cyan',
            requirement: 'Company details required',
          },
          {
            role: UserRole.BUYER,
            title: 'Buyer',
            description: 'Source quality products from verified farmers',
            icon: ShoppingBag,
            color: 'amber',
            requirement: 'Organization info optional',
          },
          {
            role: UserRole.ADMIN,
            title: 'Admin',
            description: 'Platform administration and management',
            icon: Settings,
            color: 'purple',
            requirement: 'Testing only',
          },
        ]

        return (
          <div className="space-y-4">
            <Label className="text-slate-200 block mb-4">Select Your Account Type</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {accountTypes.map((type) => {
                const Icon = type.icon
                const isSelected = formData.role === type.role
                
                // Define color classes for each type
                let borderClass = 'border-slate-700'
                let bgClass = 'bg-slate-800/50'
                let iconClass = ''
                let checkBgClass = ''
                let checkIconClass = ''
                let iconBgClass = 'bg-slate-900/50'

                if (isSelected) {
                  switch (type.color) {
                    case 'emerald':
                      borderClass = 'border-emerald-500 bg-emerald-500/10 ring-2 ring-emerald-500/50'
                      iconClass = 'text-emerald-400'
                      checkBgClass = 'bg-emerald-500/20'
                      checkIconClass = 'text-emerald-400'
                      iconBgClass = 'bg-emerald-500/20'
                      break
                    case 'cyan':
                      borderClass = 'border-cyan-500 bg-cyan-500/10 ring-2 ring-cyan-500/50'
                      iconClass = 'text-cyan-400'
                      checkBgClass = 'bg-cyan-500/20'
                      checkIconClass = 'text-cyan-400'
                      iconBgClass = 'bg-cyan-500/20'
                      break
                    case 'amber':
                      borderClass = 'border-amber-500 bg-amber-500/10 ring-2 ring-amber-500/50'
                      iconClass = 'text-amber-400'
                      checkBgClass = 'bg-amber-500/20'
                      checkIconClass = 'text-amber-400'
                      iconBgClass = 'bg-amber-500/20'
                      break
                    case 'purple':
                      borderClass = 'border-purple-500 bg-purple-500/10 ring-2 ring-purple-500/50'
                      iconClass = 'text-purple-400'
                      checkBgClass = 'bg-purple-500/20'
                      checkIconClass = 'text-purple-400'
                      iconBgClass = 'bg-purple-500/20'
                      break
                  }
                } else {
                  switch (type.color) {
                    case 'emerald':
                      borderClass = 'border-slate-700 hover:border-emerald-500/50'
                      iconClass = 'text-emerald-500/70'
                      break
                    case 'cyan':
                      borderClass = 'border-slate-700 hover:border-cyan-500/50'
                      iconClass = 'text-cyan-500/70'
                      break
                    case 'amber':
                      borderClass = 'border-slate-700 hover:border-amber-500/50'
                      iconClass = 'text-amber-500/70'
                      break
                    case 'purple':
                      borderClass = 'border-slate-700 hover:border-purple-500/50'
                      iconClass = 'text-purple-500/70'
                      break
                  }
                }

                return (
                  <button
                    key={type.role}
                    type="button"
                    onClick={() => setFormData({ ...formData, role: type.role })}
                    className={`relative p-5 rounded-xl border-2 ${bgClass} ${borderClass} transition-all duration-200 text-left group ${
                      isSelected ? 'scale-[1.02]' : 'hover:scale-[1.01]'
                    }`}
                  >
                    {isSelected && (
                      <div className={`absolute top-3 right-3 p-1.5 rounded-full ${checkBgClass}`}>
                        <Check className={`h-4 w-4 ${checkIconClass}`} />
                      </div>
                    )}
                    <div className="flex items-start gap-4">
                      <div
                        className={`p-3 rounded-lg ${iconBgClass} group-hover:bg-slate-900/70 transition-colors`}
                      >
                        <Icon className={`h-6 w-6 ${iconClass}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-slate-100 mb-1">{type.title}</h3>
                        <p className="text-sm text-slate-400 mb-2">{type.description}</p>
                        <p className="text-xs text-slate-500">{type.requirement}</p>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
            <p className="text-sm text-slate-400 pt-2">
              We'll tailor the onboarding to your role. Select the option that best describes you.
            </p>
          </div>
        )
      case 2:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-slate-200">
                  First Name
                </Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  required
                  className="h-11 rounded-lg border-slate-800 bg-slate-900/80 text-slate-100 placeholder:text-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/40"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-slate-200">
                  Last Name
                </Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  required
                  className="h-11 rounded-lg border-slate-800 bg-slate-900/80 text-slate-100 placeholder:text-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/40"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-200">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="h-11 rounded-lg border-slate-800 bg-slate-900/80 text-slate-100 placeholder:text-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/40"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-slate-200">
                Phone (Optional)
              </Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="h-11 rounded-lg border-slate-800 bg-slate-900/80 text-slate-100 placeholder:text-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/40"
              />
            </div>
          </div>
        )
      case 3:
        return (
          <div className="space-y-4">
            {formData.role === UserRole.FARMER && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="ghanaCard" className="text-slate-200">
                    Ghana Card Number
                  </Label>
                  <Input
                    id="ghanaCard"
                    value={formData.ghanaCard}
                    onChange={(e) => setFormData({ ...formData, ghanaCard: e.target.value })}
                    required
                    placeholder="GHA-XXXXXXXXX-X"
                    className="h-11 rounded-lg border-slate-800 bg-slate-900/80 text-slate-100 placeholder:text-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/40"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="country" className="text-slate-200">
                      Country (Optional)
                    </Label>
                    <select
                      id="country"
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      className="flex h-11 w-full rounded-lg border border-slate-800 bg-slate-900/80 px-3 py-2 text-sm text-slate-100 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/40"
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
                    <Label htmlFor="industry" className="text-slate-200">
                      Crop/Industry (Optional)
                    </Label>
                    <Input
                      id="industry"
                      value={formData.industry}
                      onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                      className="h-11 rounded-lg border-slate-800 bg-slate-900/80 text-slate-100 placeholder:text-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/40"
                    />
                  </div>
                </div>
              </>
            )}

            {formData.role === UserRole.EXPORT_COMPANY && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="companyName" className="text-slate-200">
                    Company Name <span className="text-red-400">*</span>
                  </Label>
                  <Input
                    id="companyName"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    required
                    placeholder="Your export company name"
                    className="h-11 rounded-lg border-slate-800 bg-slate-900/80 text-slate-100 placeholder:text-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/40"
                  />
                  <p className="text-xs text-slate-400">Required for export companies</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyRegistration" className="text-slate-200">
                    Company Registration (Optional)
                  </Label>
                  <Input
                    id="companyRegistration"
                    value={formData.companyRegistration}
                    onChange={(e) => setFormData({ ...formData, companyRegistration: e.target.value })}
                    placeholder="Registration or license number"
                    className="h-11 rounded-lg border-slate-800 bg-slate-900/80 text-slate-100 placeholder:text-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/40"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="country" className="text-slate-200">
                      Country (Optional)
                    </Label>
                    <select
                      id="country"
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      className="flex h-11 w-full rounded-lg border border-slate-800 bg-slate-900/80 px-3 py-2 text-sm text-slate-100 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/40"
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
                    <Label htmlFor="industry" className="text-slate-200">
                      Industry (Optional)
                    </Label>
                    <Input
                      id="industry"
                      value={formData.industry}
                      onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                      className="h-11 rounded-lg border-slate-800 bg-slate-900/80 text-slate-100 placeholder:text-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/40"
                    />
                  </div>
                </div>
              </>
            )}

            {(formData.role === UserRole.BUYER || formData.role === UserRole.ADMIN) && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="organization" className="text-slate-200">
                    Organization (Optional)
                  </Label>
                  <Input
                    id="organization"
                    value={formData.organization}
                    onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                    placeholder="Company / Agency / Team"
                    className="h-11 rounded-lg border-slate-800 bg-slate-900/80 text-slate-100 placeholder:text-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/40"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="country" className="text-slate-200">
                      Country (Optional)
                    </Label>
                    <select
                      id="country"
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      className="flex h-11 w-full rounded-lg border border-slate-800 bg-slate-900/80 px-3 py-2 text-sm text-slate-100 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/40"
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
                    <Label htmlFor="industry" className="text-slate-200">
                      Industry (Optional)
                    </Label>
                    <Input
                      id="industry"
                      value={formData.industry}
                      onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                      className="h-11 rounded-lg border-slate-800 bg-slate-900/80 text-slate-100 placeholder:text-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/40"
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        )
      case 4:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-200">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                minLength={8}
                className="h-11 rounded-lg border-slate-800 bg-slate-900/80 text-slate-100 placeholder:text-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/40"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-slate-200">
                Confirm Password
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
                minLength={8}
                className="h-11 rounded-lg border-slate-800 bg-slate-900/80 text-slate-100 placeholder:text-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/40"
              />
            </div>
          </div>
        )
      case 5:
        return (
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-400">Account Type</p>
                <p className="font-medium capitalize">{formData.role.toLowerCase().replace('_', ' ')}</p>
              </div>
              <div>
                <p className="text-gray-400">Email</p>
                <p className="font-medium">{formData.email}</p>
              </div>
              <div>
                <p className="text-gray-400">Name</p>
                <p className="font-medium">
                  {formData.firstName} {formData.lastName}
                </p>
              </div>
              <div>
                <p className="text-gray-400">Phone</p>
                <p className="font-medium">{formData.phone || '—'}</p>
              </div>
              <div>
                <p className="text-gray-400">Country</p>
                <p className="font-medium">{formData.country || '—'}</p>
              </div>
              <div>
                <p className="text-gray-400">Industry</p>
                <p className="font-medium">{formData.industry || '—'}</p>
              </div>
              {formData.role === UserRole.FARMER && (
                <div>
                  <p className="text-gray-400">Ghana Card</p>
                  <p className="font-medium">{formData.ghanaCard}</p>
                </div>
              )}
              {formData.role === UserRole.EXPORT_COMPANY && (
                <>
                  <div>
                    <p className="text-gray-400">Company Name</p>
                    <p className="font-medium">{formData.companyName}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Registration</p>
                    <p className="font-medium">{formData.companyRegistration || '—'}</p>
                  </div>
                </>
              )}
              {(formData.role === UserRole.BUYER || formData.role === UserRole.ADMIN) && (
                <div>
                  <p className="text-gray-400">Organization</p>
                  <p className="font-medium">{formData.organization || '—'}</p>
                </div>
              )}
            </div>
            <div className="space-y-2">
            <div className="flex items-center gap-2 pt-2 text-sm">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-emerald-500/50"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              <span>Keep me signed in on this device</span>
            </div>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 text-slate-100">
      <Card className="w-full max-w-3xl border-white/10 bg-slate-900/80 backdrop-blur text-slate-100">
        <CardHeader className="space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-primary">TradeLink+</p>
              <CardTitle className="text-3xl font-bold text-slate-100">Create your account</CardTitle>
              <CardDescription className="text-gray-300 text-base">
                Complete the steps to get started
              </CardDescription>
            </div>
            <div className="text-sm text-gray-300">
              Step {step} of 5
              <div className="mt-2 h-2 w-28 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-primary transition-all"
                  style={{ width: `${(step / 5) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {renderStep()}

            <div className="flex items-center justify-between pt-2">
              <Button
                variant="ghost"
                onClick={handlePrev}
                disabled={step === 1}
                className="text-slate-200 disabled:text-slate-500 disabled:opacity-80"
              >
                Back
              </Button>
              {step < 5 ? (
                <Button
                  type="button"
                  onClick={handleNext}
                  disabled={!canContinue}
                  className="font-semibold"
                >
                  Continue
                </Button>
              ) : (
                <Button type="submit" disabled={loading || isNavigating || !canContinue} className="font-semibold">
                  {loading || isNavigating ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Creating account...
                    </span>
                  ) : (
                    'Create Account'
                  )}
                </Button>
              )}
            </div>

            <div className="text-center text-sm text-gray-300">
              Already have an account?{' '}
              <Link href="/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

