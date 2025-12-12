'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  User,
  Globe,
  Bell,
  Shield,
  Lock,
  Mail,
  Phone,
  Camera,
  Save,
  Download,
  Trash2,
  CheckCircle2,
  XCircle,
  Languages,
  Moon,
  Sun,
  Eye,
  EyeOff,
  DollarSign,
} from 'lucide-react'
import apiClient from '@/lib/api-client'
import { useToast } from '@/hooks/use-toast'
import { useCurrency, CURRENCIES } from '@/contexts/currency-context'

// Supported languages for Ghana
const LANGUAGES = [
  { code: 'en', name: 'English', native: 'English' },
  { code: 'tw', name: 'Twi', native: 'Twi' },
  { code: 'ga', name: 'Ga', native: 'Ga' },
  { code: 'ew', name: 'Ewe', native: 'Ewe' },
  { code: 'ak', name: 'Akan', native: 'Akan' },
  { code: 'ha', name: 'Hausa', native: 'Hausa' },
]

export default function SettingsPage() {
  const { toast } = useToast()
  const { currency, setCurrency } = useCurrency()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'profile' | 'account' | 'preferences' | 'security'>('profile')
  
  // Profile state
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    avatar: '',
  })

  // Account state
  const [account, setAccount] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    showPasswords: false,
  })

  // Preferences state
  const [preferences, setPreferences] = useState({
    language: 'en',
    theme: 'dark',
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    marketingEmails: false,
  })

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      const userData = JSON.parse(storedUser)
      setUser(userData)
      setProfile({
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        email: userData.email || '',
        phone: userData.phone || '',
        avatar: userData.avatar || '',
      })
    }

    // Load preferences from localStorage
    const savedLanguage = localStorage.getItem('language') || 'en'
    const savedTheme = localStorage.getItem('theme') || 'dark'
    setPreferences((prev) => ({
      ...prev,
      language: savedLanguage,
      theme: savedTheme,
    }))
  }, [])

  const handleUpdateProfile = async () => {
    setLoading(true)
    try {
      // TODO: Replace with actual API endpoint
      // await apiClient.put('/users/me', profile)
      
      // Update local storage
      const updatedUser = { ...user, ...profile }
      localStorage.setItem('user', JSON.stringify(updatedUser))
      setUser(updatedUser)

      toast({
        variant: 'success',
        title: 'Profile Updated',
        description: 'Your profile has been successfully updated.',
      })
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: error.response?.data?.message || 'Failed to update profile. Please try again.',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleChangePassword = async () => {
    if (account.newPassword !== account.confirmPassword) {
      toast({
        variant: 'destructive',
        title: 'Password Mismatch',
        description: 'New password and confirm password do not match.',
      })
      return
    }

    if (account.newPassword.length < 8) {
      toast({
        variant: 'destructive',
        title: 'Password Too Short',
        description: 'Password must be at least 8 characters long.',
      })
      return
    }

    setLoading(true)
    try {
      await apiClient.put('/auth/change-password', {
        currentPassword: account.currentPassword,
        newPassword: account.newPassword,
      })

      toast({
        variant: 'success',
        title: 'Password Changed',
        description: 'Your password has been successfully updated.',
      })

      setAccount({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        showPasswords: false,
      })
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Password Change Failed',
        description: error.response?.data?.message || 'Failed to change password. Please check your current password.',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleLanguageChange = (language: string) => {
    setPreferences((prev) => ({ ...prev, language }))
    localStorage.setItem('language', language)
    toast({
      variant: 'success',
      title: 'Language Updated',
      description: 'Your language preference has been saved.',
    })
  }

  const handleCurrencyChange = (currencyCode: string) => {
    const selectedCurrency = CURRENCIES.find((c) => c.code === currencyCode)
    if (selectedCurrency) {
      setCurrency(selectedCurrency)
      toast({
        variant: 'success',
        title: 'Currency Updated',
        description: `Currency changed to ${selectedCurrency.name} (${selectedCurrency.code}).`,
      })
    }
  }

  const handleThemeChange = (theme: string) => {
    setPreferences((prev) => ({ ...prev, theme }))
    localStorage.setItem('theme', theme)
    // Apply theme to document
    if (theme === 'dark') {
      document.documentElement.classList.remove('light')
    } else {
      document.documentElement.classList.add('light')
    }
    toast({
      variant: 'success',
      title: 'Theme Updated',
      description: 'Your theme preference has been saved.',
    })
  }

  const handleExportData = () => {
    // Export user data as JSON
    const data = {
      user,
      preferences,
      exportedAt: new Date().toISOString(),
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `tradelink-data-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      variant: 'success',
      title: 'Data Exported',
      description: 'Your data has been downloaded successfully.',
    })
  }

  const handleDeleteAccount = () => {
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return
    }

    if (!confirm('This will permanently delete all your data. Type DELETE to confirm.')) {
      return
    }

    // TODO: Implement account deletion
    toast({
      variant: 'warning',
      title: 'Account Deletion',
      description: 'Account deletion is not yet implemented. Please contact support.',
    })
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'account', label: 'Account', icon: Lock },
    { id: 'preferences', label: 'Preferences', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-primary to-emerald-600 bg-clip-text text-transparent">
          Settings
        </h1>
        <p className="text-gray-400 mt-1">Manage your account settings and preferences</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-800 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                isActive
                  ? 'border-emerald-500 text-emerald-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="font-medium whitespace-nowrap">{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Information
            </CardTitle>
            <CardDescription className="text-gray-400">
              Update your personal information and profile picture
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar */}
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="h-24 w-24 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-2xl font-bold text-white">
                  {profile.firstName?.[0]?.toUpperCase() || 'U'}
                  {profile.lastName?.[0]?.toUpperCase() || ''}
                </div>
                <button className="absolute bottom-0 right-0 p-2 bg-slate-800 rounded-full border-2 border-slate-700 hover:bg-slate-700 transition-colors">
                  <Camera className="h-4 w-4 text-slate-300" />
                </button>
              </div>
              <div>
                <p className="text-sm text-gray-400">Profile Picture</p>
                <p className="text-xs text-gray-500">Click the camera icon to upload a new photo</p>
              </div>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-slate-200">
                  First Name
                </Label>
                <Input
                  id="firstName"
                  value={profile.firstName}
                  onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                  className="bg-slate-800 border-slate-700 text-slate-100"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-slate-200">
                  Last Name
                </Label>
                <Input
                  id="lastName"
                  value={profile.lastName}
                  onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                  className="bg-slate-800 border-slate-700 text-slate-100"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-200 flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  className="bg-slate-800 border-slate-700 text-slate-100"
                />
                {user?.verified && (
                  <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-slate-200 flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Phone
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  className="bg-slate-800 border-slate-700 text-slate-100"
                />
              </div>
            </div>

            <Button
              onClick={handleUpdateProfile}
              disabled={loading}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Saving...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  Save Changes
                </span>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Account Tab */}
      {activeTab === 'account' && (
        <div className="space-y-6">
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Change Password
              </CardTitle>
              <CardDescription className="text-gray-400">
                Update your password to keep your account secure
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword" className="text-slate-200">
                  Current Password
                </Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={account.showPasswords ? 'text' : 'password'}
                    value={account.currentPassword}
                    onChange={(e) => setAccount({ ...account, currentPassword: e.target.value })}
                    className="bg-slate-800 border-slate-700 text-slate-100 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setAccount({ ...account, showPasswords: !account.showPasswords })}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                  >
                    {account.showPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-slate-200">
                  New Password
                </Label>
                <Input
                  id="newPassword"
                  type={account.showPasswords ? 'text' : 'password'}
                  value={account.newPassword}
                  onChange={(e) => setAccount({ ...account, newPassword: e.target.value })}
                  className="bg-slate-800 border-slate-700 text-slate-100"
                  placeholder="At least 8 characters"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-slate-200">
                  Confirm New Password
                </Label>
                <Input
                  id="confirmPassword"
                  type={account.showPasswords ? 'text' : 'password'}
                  value={account.confirmPassword}
                  onChange={(e) => setAccount({ ...account, confirmPassword: e.target.value })}
                  className="bg-slate-800 border-slate-700 text-slate-100"
                />
              </div>
              <Button
                onClick={handleChangePassword}
                disabled={loading || !account.currentPassword || !account.newPassword}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {loading ? 'Updating...' : 'Update Password'}
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Email Verification
              </CardTitle>
              <CardDescription className="text-gray-400">
                Verify your email address to secure your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-200">{profile.email}</p>
                  {user?.verified ? (
                    <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 mt-2">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  ) : (
                    <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 mt-2">
                      <XCircle className="h-3 w-3 mr-1" />
                      Not Verified
                    </Badge>
                  )}
                </div>
                {!user?.verified && (
                  <Button variant="outline" className="border-slate-700">
                    Send Verification Email
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Preferences Tab */}
      {activeTab === 'preferences' && (
        <div className="space-y-6">
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Languages className="h-5 w-5" />
                Language & Region
              </CardTitle>
              <CardDescription className="text-gray-400">
                Choose your preferred language
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-slate-200">Language</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => handleLanguageChange(lang.code)}
                      className={`p-4 rounded-lg border-2 transition-all text-left ${
                        preferences.language === lang.code
                          ? 'border-emerald-500 bg-emerald-500/10'
                          : 'border-slate-700 bg-slate-800 hover:border-slate-600'
                      }`}
                    >
                      <p className="font-semibold text-slate-100">{lang.native}</p>
                      <p className="text-sm text-slate-400">{lang.name}</p>
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Currency Preference
              </CardTitle>
              <CardDescription className="text-gray-400">
                Select your preferred currency for displaying prices and transactions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-slate-200">Default Currency</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {CURRENCIES.map((curr) => (
                    <button
                      key={curr.code}
                      onClick={() => handleCurrencyChange(curr.code)}
                      className={`p-4 rounded-lg border-2 transition-all text-left ${
                        currency.code === curr.code
                          ? 'border-emerald-500 bg-emerald-500/10'
                          : 'border-slate-700 bg-slate-800 hover:border-slate-600'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        {curr.flag && <span className="text-2xl">{curr.flag}</span>}
                        <p className="font-semibold text-slate-100">{curr.code}</p>
                      </div>
                      <p className="text-sm text-slate-400">{curr.name}</p>
                      <p className="text-xs text-slate-500 mt-1">Symbol: {curr.symbol}</p>
                    </button>
                  ))}
                </div>
                <div className="mt-4 p-3 bg-blue-900/30 border border-blue-800/50 rounded-lg">
                  <p className="text-xs text-blue-300">
                    <strong>Note:</strong> Currency conversion rates are approximate. For Ministry of Trade, Agribusiness and Industry transactions, official rates apply.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Moon className="h-5 w-5" />
                Appearance
              </CardTitle>
              <CardDescription className="text-gray-400">
                Customize the look and feel of the platform
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-slate-200">Theme</Label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleThemeChange('dark')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      preferences.theme === 'dark'
                        ? 'border-emerald-500 bg-emerald-500/10'
                        : 'border-slate-700 bg-slate-800 hover:border-slate-600'
                    }`}
                  >
                    <Moon className="h-6 w-6 text-slate-300 mb-2" />
                    <p className="font-semibold text-slate-100">Dark</p>
                    <p className="text-sm text-slate-400">Default theme</p>
                  </button>
                  <button
                    onClick={() => handleThemeChange('light')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      preferences.theme === 'light'
                        ? 'border-emerald-500 bg-emerald-500/10'
                        : 'border-slate-700 bg-slate-800 hover:border-slate-600'
                    }`}
                  >
                    <Sun className="h-6 w-6 text-slate-300 mb-2" />
                    <p className="font-semibold text-slate-100">Light</p>
                    <p className="text-sm text-slate-400">Light mode</p>
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notifications
              </CardTitle>
              <CardDescription className="text-gray-400">
                Manage how you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                <div>
                  <p className="font-medium text-slate-100">Email Notifications</p>
                  <p className="text-sm text-slate-400">Receive notifications via email</p>
                </div>
                <button
                  onClick={() => setPreferences({ ...preferences, emailNotifications: !preferences.emailNotifications })}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    preferences.emailNotifications ? 'bg-emerald-500' : 'bg-slate-700'
                  }`}
                >
                  <span
                    className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      preferences.emailNotifications ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                <div>
                  <p className="font-medium text-slate-100">Push Notifications</p>
                  <p className="text-sm text-slate-400">Receive browser push notifications</p>
                </div>
                <button
                  onClick={() => setPreferences({ ...preferences, pushNotifications: !preferences.pushNotifications })}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    preferences.pushNotifications ? 'bg-emerald-500' : 'bg-slate-700'
                  }`}
                >
                  <span
                    className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      preferences.pushNotifications ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                <div>
                  <p className="font-medium text-slate-100">SMS Notifications</p>
                  <p className="text-sm text-slate-400">Receive notifications via SMS</p>
                </div>
                <button
                  onClick={() => setPreferences({ ...preferences, smsNotifications: !preferences.smsNotifications })}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    preferences.smsNotifications ? 'bg-emerald-500' : 'bg-slate-700'
                  }`}
                >
                  <span
                    className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      preferences.smsNotifications ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                <div>
                  <p className="font-medium text-slate-100">Marketing Emails</p>
                  <p className="text-sm text-slate-400">Receive updates about new features and offers</p>
                </div>
                <button
                  onClick={() => setPreferences({ ...preferences, marketingEmails: !preferences.marketingEmails })}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    preferences.marketingEmails ? 'bg-emerald-500' : 'bg-slate-700'
                  }`}
                >
                  <span
                    className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      preferences.marketingEmails ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Settings
              </CardTitle>
              <CardDescription className="text-gray-400">
                Manage your account security and privacy
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium text-slate-100">Two-Factor Authentication</p>
                  <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
                    Not Enabled
                  </Badge>
                </div>
                <p className="text-sm text-slate-400 mb-4">
                  Add an extra layer of security to your account
                </p>
                <Button variant="outline" className="border-slate-700">
                  Enable 2FA
                </Button>
              </div>

              <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium text-slate-100">Active Sessions</p>
                </div>
                <p className="text-sm text-slate-400 mb-4">
                  Manage devices that are currently signed in to your account
                </p>
                <Button variant="outline" className="border-slate-700">
                  View Active Sessions
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Download className="h-5 w-5" />
                Data Management
              </CardTitle>
              <CardDescription className="text-gray-400">
                Export or delete your account data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-medium text-slate-100">Export Data</p>
                    <p className="text-sm text-slate-400">
                      Download a copy of your account data
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="border-slate-700 mt-4"
                  onClick={handleExportData}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export My Data
                </Button>
              </div>

              <div className="p-4 rounded-lg bg-red-900/20 border border-red-500/30">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-medium text-red-200">Delete Account</p>
                    <p className="text-sm text-red-300/70">
                      Permanently delete your account and all associated data
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="border-red-500/50 text-red-400 hover:bg-red-500/10 mt-4"
                  onClick={handleDeleteAccount}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

