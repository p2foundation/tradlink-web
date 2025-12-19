'use client'

import { useEffect, useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Users,
  Search,
  Filter,
  MoreVertical,
  CheckCircle2,
  XCircle,
  Mail,
  Phone,
  Calendar,
  Shield,
  Edit,
  Trash2,
  Eye,
  UserCheck,
  Clock,
  AlertTriangle,
  TrendingUp,
  FileCheck,
} from 'lucide-react'
import { formatDate } from '@/lib/utils'
import apiClient from '@/lib/api-client'
import { UserRole } from '@/types'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'
import { UserViewDialog } from '@/components/users/user-view-dialog'
import { UserEditDialog } from '@/components/users/user-edit-dialog'

interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: UserRole
  phone?: string
  verified: boolean
  createdAt: string
  updatedAt: string
  buyer?: {
    complianceStatus?: string
    companyName?: string
    country?: string
    complianceDocuments?: string[]
  }
  farmer?: {
    businessName?: string
    location?: string
    region?: string
    district?: string
    certifications?: string[]
  }
  exportCompany?: {
    companyName?: string
    registrationNo?: string
    gepaLicense?: string
  }
  documents?: Array<{
    id: string
    type: string
    status: string
  }>
}

export default function UsersPage() {
  const { toast } = useToast()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<UserRole | 'ALL'>('ALL')
  const [verifiedFilter, setVerifiedFilter] = useState<'ALL' | 'true' | 'false'>('ALL')
  const [onboardingFilter, setOnboardingFilter] = useState<'ALL' | 'PENDING' | 'COMPLETED' | 'APPROVED'>('ALL')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [userDetails, setUserDetails] = useState<any>(null)
  const itemsPerPage = 20

  useEffect(() => {
    fetchUsers()
  }, [currentPage, roleFilter, verifiedFilter, onboardingFilter])

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentPage === 1) {
        fetchUsers()
      } else {
        setCurrentPage(1)
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [search])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (roleFilter !== 'ALL') params.append('role', roleFilter)
      if (verifiedFilter !== 'ALL') params.append('verified', verifiedFilter)
      if (search) params.append('search', search)
      params.append('page', currentPage.toString())
      params.append('limit', itemsPerPage.toString())
      params.append('include', 'buyer,farmer,exportCompany,documents') // Include related data

      const response = await apiClient.get(`/users?${params.toString()}`)
      const data = response.data.data || []
      const meta = response.data.meta || {}
      
      setUsers(data)
      setTotalPages(meta.totalPages || 1)
    } catch (error) {
      console.error('Failed to fetch users:', error)
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load users',
      })
    } finally {
      setLoading(false)
    }
  }

  // Helper functions for onboarding status (must be defined before use)
  const getOnboardingStatus = (user: User) => {
    // Buyer onboarding
    if (user.role === UserRole.BUYER && user.buyer) {
      const hasProfile = user.buyer.companyName && user.buyer.country
      const hasDocuments = user.buyer.complianceDocuments && user.buyer.complianceDocuments.length > 0
      const complianceStatus = user.buyer.complianceStatus

      if (complianceStatus === 'VERIFIED' && user.verified) {
        return { status: 'APPROVED', label: 'Approved', color: 'emerald', icon: CheckCircle2 }
      } else if (hasProfile && hasDocuments && complianceStatus === 'PENDING') {
        return { status: 'COMPLETED', label: 'Ready for Review', color: 'blue', icon: FileCheck }
      } else if (hasProfile || hasDocuments) {
        return { status: 'IN_PROGRESS', label: 'In Progress', color: 'amber', icon: Clock }
      } else {
        return { status: 'PENDING', label: 'Not Started', color: 'gray', icon: AlertTriangle }
      }
    }

    // Farmer onboarding
    if (user.role === UserRole.FARMER && user.farmer) {
      const hasProfile = user.farmer.location && user.farmer.region && user.farmer.district
      const hasGepa = user.documents?.some(d => d.type === 'GEPA_LICENSE' && d.status === 'VERIFIED')
      const hasQualityCert = user.documents?.some(d => ['QUALITY_CERTIFICATE', 'ORGANIC_CERTIFICATION'].includes(d.type) && d.status === 'VERIFIED')

      if (user.verified && hasProfile && hasGepa && hasQualityCert) {
        return { status: 'APPROVED', label: 'Approved', color: 'emerald', icon: CheckCircle2 }
      } else if (hasProfile && hasGepa && hasQualityCert) {
        return { status: 'COMPLETED', label: 'Ready for Review', color: 'blue', icon: FileCheck }
      } else if (hasProfile || hasGepa || hasQualityCert) {
        return { status: 'IN_PROGRESS', label: 'In Progress', color: 'amber', icon: Clock }
      } else {
        return { status: 'PENDING', label: 'Not Started', color: 'gray', icon: AlertTriangle }
      }
    }

    // Export Company onboarding
    if (user.role === UserRole.EXPORT_COMPANY && user.exportCompany) {
      const hasProfile = user.exportCompany.companyName && user.exportCompany.registrationNo
      const hasGepa = user.exportCompany.gepaLicense ? true : user.documents?.some(d => d.type === 'GEPA_LICENSE' && d.status === 'VERIFIED')

      if (user.verified && hasProfile && hasGepa) {
        return { status: 'APPROVED', label: 'Approved', color: 'emerald', icon: CheckCircle2 }
      } else if (hasProfile && hasGepa) {
        return { status: 'COMPLETED', label: 'Ready for Review', color: 'blue', icon: FileCheck }
      } else if (hasProfile || hasGepa) {
        return { status: 'IN_PROGRESS', label: 'In Progress', color: 'amber', icon: Clock }
      } else {
        return { status: 'PENDING', label: 'Not Started', color: 'gray', icon: AlertTriangle }
      }
    }

    // Trader onboarding
    if (user.role === UserRole.TRADER) {
      const hasProfile = true // Basic profile always exists
      const hasGepa = user.documents?.some(d => d.type === 'GEPA_LICENSE' && d.status === 'VERIFIED')

      if (user.verified && hasGepa) {
        return { status: 'APPROVED', label: 'Approved', color: 'emerald', icon: CheckCircle2 }
      } else if (hasGepa) {
        return { status: 'COMPLETED', label: 'Ready for Review', color: 'blue', icon: FileCheck }
      } else {
        return { status: 'IN_PROGRESS', label: 'In Progress', color: 'amber', icon: Clock }
      }
    }

    // Other roles
    if (user.verified) {
      return { status: 'APPROVED', label: 'Approved', color: 'emerald', icon: CheckCircle2 }
    } else {
      return { status: 'PENDING', label: 'Pending Verification', color: 'amber', icon: Clock }
    }
  }

  const getOnboardingProgress = (user: User): number => {
    if (user.role === UserRole.BUYER && user.buyer) {
      let completed = 0
      const total = 3
      if (user.buyer.companyName && user.buyer.country) completed++
      if (user.buyer.complianceDocuments && user.buyer.complianceDocuments.length > 0) completed++
      if (user.buyer.complianceStatus === 'VERIFIED') completed++
      return Math.round((completed / total) * 100)
    }

    if (user.role === UserRole.FARMER && user.farmer) {
      let completed = 0
      const total = 3
      if (user.farmer.location && user.farmer.region) completed++
      if (user.documents?.some(d => d.type === 'GEPA_LICENSE' && d.status === 'VERIFIED')) completed++
      if (user.documents?.some(d => ['QUALITY_CERTIFICATE', 'ORGANIC_CERTIFICATION'].includes(d.type) && d.status === 'VERIFIED')) completed++
      return Math.round((completed / total) * 100)
    }

    if (user.role === UserRole.EXPORT_COMPANY && user.exportCompany) {
      let completed = 0
      const total = 2
      if (user.exportCompany.companyName && user.exportCompany.registrationNo) completed++
      if (user.exportCompany.gepaLicense || user.documents?.some(d => d.type === 'GEPA_LICENSE' && d.status === 'VERIFIED')) completed++
      return Math.round((completed / total) * 100)
    }

    if (user.role === UserRole.TRADER) {
      let completed = 0
      const total = 1
      if (user.documents?.some(d => d.type === 'GEPA_LICENSE' && d.status === 'VERIFIED')) completed++
      return Math.round((completed / total) * 100)
    }

    return user.verified ? 100 : 0
  }

  // Filter users by onboarding status
  const paginatedUsers = onboardingFilter !== 'ALL' 
    ? users.filter((user) => {
        const onboardingStatus = getOnboardingStatus(user)
        if (onboardingFilter === 'PENDING') {
          return onboardingStatus.status === 'PENDING' || onboardingStatus.status === 'IN_PROGRESS'
        } else if (onboardingFilter === 'COMPLETED') {
          return onboardingStatus.status === 'COMPLETED'
        } else if (onboardingFilter === 'APPROVED') {
          return onboardingStatus.status === 'APPROVED'
        }
        return true
      })
    : users

  const handleView = async (user: User) => {
    try {
      const response = await apiClient.get(`/users/${user.id}`)
      setUserDetails(response.data)
      setSelectedUser(user)
      setViewDialogOpen(true)
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.response?.data?.message || 'Failed to load user details',
      })
    }
  }

  const handleEdit = (user: User) => {
    setSelectedUser(user)
    setEditDialogOpen(true)
  }

  const handleVerify = async (userId: string) => {
    try {
      const user = users.find((u) => u.id === userId)
      if (!user) return

      await apiClient.post(`/users/${userId}/verify`, { verified: !user.verified })
      
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, verified: !u.verified } : u)))
      
      toast({
        variant: 'success',
        title: 'Verification Updated',
        description: `User has been ${!user.verified ? 'verified' : 'unverified'}`,
      })
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update verification status',
      })
    }
  }

  const handleDelete = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return
    
    try {
      await apiClient.delete(`/users/${userId}`)
      setUsers((prev) => prev.filter((u) => u.id !== userId))
      
      toast({
        variant: 'success',
        title: 'User Deleted',
        description: 'User has been deleted successfully',
      })
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.response?.data?.message || 'Failed to delete user',
      })
    }
  }

  const handleEditSuccess = () => {
    fetchUsers()
  }

  const handleApproveOnboarding = async (userId: string) => {
    try {
      const user = users.find((u) => u.id === userId)
      if (!user) return

      // Approve based on role
      if (user.role === UserRole.BUYER && user.buyer) {
        // Approve buyer onboarding by updating compliance status
        await apiClient.patch(`/buyers/${user.buyer.id}`, {
          complianceStatus: 'VERIFIED',
        })
      } else if (user.role === UserRole.FARMER) {
        // Submit farmer for Ghana Single Window verification
        try {
          await apiClient.post('/verification/submit-to-ghana-sw', {
            userId: userId,
          })
        } catch (error: any) {
          // If already submitted, continue with approval
          if (error.response?.status !== 400) {
            console.error('Error submitting to Ghana SW:', error)
          }
        }
      } else if (user.role === UserRole.EXPORT_COMPANY) {
        // Submit export company for Ghana Single Window verification
        try {
          await apiClient.post('/verification/submit-to-ghana-sw', {
            userId: userId,
          })
        } catch (error: any) {
          // If already submitted, continue with approval
          if (error.response?.status !== 400) {
            console.error('Error submitting to Ghana SW:', error)
          }
        }
      }

      // Verify the user
      if (!user.verified) {
        await apiClient.post(`/users/${userId}/verify`, { verified: true })
      }

      // Refresh user data
      const response = await apiClient.get(`/users/${userId}?include=buyer,farmer,exportCompany,documents`)
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, ...response.data, verified: true } : u)))
      
      toast({
        variant: 'success',
        title: 'Onboarding Approved',
        description: `${user.firstName} ${user.lastName} can now engage in transactions on the platform`,
      })
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.response?.data?.message || 'Failed to approve onboarding',
      })
    }
  }

  const getRoleBadge = (role: UserRole) => {
    const colors: Record<UserRole, string> = {
      [UserRole.FARMER]: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30',
      [UserRole.BUYER]: 'bg-amber-500/10 text-amber-500 border-amber-500/30',
      [UserRole.EXPORT_COMPANY]: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/30',
      [UserRole.TRADER]: 'bg-blue-500/10 text-blue-500 border-blue-500/30',
      [UserRole.LOGISTICS_PROVIDER]: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/30',
      [UserRole.CUSTOMS_BROKER]: 'bg-purple-500/10 text-purple-500 border-purple-500/30',
      [UserRole.QUALITY_ASSURANCE]: 'bg-green-500/10 text-green-500 border-green-500/30',
      [UserRole.FINANCIAL_INSTITUTION]: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30',
      [UserRole.AGRIBUSINESS]: 'bg-orange-500/10 text-orange-500 border-orange-500/30',
      [UserRole.GOVERNMENT_OFFICIAL]: 'bg-red-500/10 text-red-500 border-red-500/30',
      [UserRole.ADMIN]: 'bg-muted text-muted-foreground border-border',
    }
    const defaultColor = 'bg-muted text-muted-foreground border-border'
    return (
      <Badge variant="outline" className={colors[role] || defaultColor}>
        {role.replace(/_/g, ' ')}
      </Badge>
    )
  }

  const [stats, setStats] = useState({
    total: 0,
    farmers: 0,
    buyers: 0,
    exportCompanies: 0,
    admins: 0,
    verified: 0,
    unverified: 0,
  })

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await apiClient.get('/users/stats')
        setStats(response.data || stats)
      } catch (error) {
        console.error('Failed to fetch stats:', error)
      }
    }
    fetchStats()
  }, [])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-primary to-emerald-600 bg-clip-text text-transparent">
            User Management
          </h1>
          <p className="text-muted-foreground mt-1">Manage platform users, roles, permissions, and onboarding approval</p>
        </div>
        <Button className="shadow-glow">
          <Users className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Card className="hover:shadow-glow transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.total}</div>
            <p className="text-xs text-muted-foreground mt-1">All registered users</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-glow transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Farmers</CardTitle>
            <Shield className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.farmers}</div>
            <p className="text-xs text-muted-foreground mt-1">{stats.total > 0 ? ((stats.farmers / stats.total) * 100).toFixed(1) : 0}% of total</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-glow transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Buyers</CardTitle>
            <Shield className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.buyers}</div>
            <p className="text-xs text-muted-foreground mt-1">{stats.total > 0 ? ((stats.buyers / stats.total) * 100).toFixed(1) : 0}% of total</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-glow transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Verified</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.verified}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.unverified} unverified
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-glow transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Approval</CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {users.filter(u => {
                const status = getOnboardingStatus(u)
                return status.status === 'COMPLETED'
              }).length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Ready for review</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users by name or email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as UserRole | 'ALL')}
              className="w-full sm:w-48 h-10 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:ring-2 focus:ring-primary/40"
              aria-label="Filter by role"
            >
              <option value="ALL">All Roles</option>
              <optgroup label="Producers & Exporters">
                <option value={UserRole.FARMER}>Producers</option>
                <option value={UserRole.EXPORT_COMPANY}>Export Companies</option>
                <option value={UserRole.AGRIBUSINESS}>Agribusiness</option>
              </optgroup>
              <optgroup label="Buyers & Importers">
                <option value={UserRole.BUYER}>Buyers</option>
                <option value={UserRole.TRADER}>Traders</option>
              </optgroup>
              <optgroup label="Trade Services">
                <option value={UserRole.LOGISTICS_PROVIDER}>Logistics</option>
                <option value={UserRole.CUSTOMS_BROKER}>Customs Brokers</option>
                <option value={UserRole.QUALITY_ASSURANCE}>Quality Assurance</option>
                <option value={UserRole.FINANCIAL_INSTITUTION}>Financial Institutions</option>
              </optgroup>
              <optgroup label="Regulatory">
                <option value={UserRole.GOVERNMENT_OFFICIAL}>Government Officials</option>
                <option value={UserRole.ADMIN}>Admins</option>
              </optgroup>
            </select>
            <select
              value={verifiedFilter}
              onChange={(e) => setVerifiedFilter(e.target.value as 'ALL' | 'true' | 'false')}
              className="w-full sm:w-48 h-10 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:ring-2 focus:ring-primary/40"
              aria-label="Filter by verification status"
            >
              <option value="ALL">All Users</option>
              <option value="true">Verified</option>
              <option value="false">Unverified</option>
            </select>
            <select
              value={onboardingFilter}
              onChange={(e) => setOnboardingFilter(e.target.value as 'ALL' | 'PENDING' | 'COMPLETED' | 'APPROVED')}
              className="w-full sm:w-48 h-10 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:ring-2 focus:ring-primary/40"
              aria-label="Filter by onboarding status"
              title="Filter by onboarding status"
            >
              <option value="ALL">All Onboarding</option>
              <option value="PENDING">Pending/In Progress</option>
              <option value="COMPLETED">Ready for Review</option>
              <option value="APPROVED">Approved</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Users ({users.length})</CardTitle>
          <CardDescription>Manage user accounts, permissions, and onboarding approval</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">User</th>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">Role</th>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">Verification</th>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">Onboarding</th>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">Joined</th>
                      <th className="text-right p-4 text-sm font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedUsers.map((user) => {
                      const onboardingStatus = getOnboardingStatus(user)
                      const onboardingProgress = getOnboardingProgress(user)
                      const StatusIcon = onboardingStatus.icon
                      
                      return (
                        <tr key={user.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                <span className="text-primary font-semibold">
                                  {user.firstName[0]}{user.lastName[0]}
                                </span>
                              </div>
                              <div>
                                <p className="font-medium text-foreground">
                                  {user.firstName} {user.lastName}
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                  <Mail className="h-3 w-3 text-muted-foreground" />
                                  <p className="text-sm text-muted-foreground">{user.email}</p>
                                </div>
                                {user.phone && (
                                  <div className="flex items-center gap-2 mt-1">
                                    <Phone className="h-3 w-3 text-muted-foreground" />
                                    <p className="text-sm text-muted-foreground">{user.phone}</p>
                                  </div>
                                )}
                                {user.role === UserRole.BUYER && user.buyer?.companyName && (
                                  <p className="text-xs text-muted-foreground mt-1">{user.buyer.companyName}</p>
                                )}
                                {user.role === UserRole.FARMER && user.farmer?.businessName && (
                                  <p className="text-xs text-muted-foreground mt-1">{user.farmer.businessName}</p>
                                )}
                                {user.role === UserRole.EXPORT_COMPANY && user.exportCompany?.companyName && (
                                  <p className="text-xs text-muted-foreground mt-1">{user.exportCompany.companyName}</p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="p-4">{getRoleBadge(user.role)}</td>
                          <td className="p-4">
                            {user.verified ? (
                              <Badge variant="success" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/30">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Verified
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/30">
                                <XCircle className="h-3 w-3 mr-1" />
                                Unverified
                              </Badge>
                            )}
                          </td>
                          <td className="p-4">
                            <div className="space-y-1">
                              <Badge 
                                variant="outline" 
                                className={`${
                                  onboardingStatus.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30' :
                                  onboardingStatus.status === 'COMPLETED' ? 'bg-blue-500/10 text-blue-500 border-blue-500/30' :
                                  onboardingStatus.status === 'IN_PROGRESS' ? 'bg-amber-500/10 text-amber-500 border-amber-500/30' :
                                  'bg-muted text-muted-foreground border-border'
                                }`}
                              >
                                <StatusIcon className="h-3 w-3 mr-1" />
                                {onboardingStatus.label}
                              </Badge>
                              {onboardingStatus.status !== 'APPROVED' && onboardingStatus.status !== 'N/A' && onboardingProgress > 0 && (
                                <div className="flex items-center gap-2 mt-1">
                                  <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                                    <div 
                                      className={`h-full transition-all ${
                                        onboardingProgress >= 100 ? 'bg-emerald-500' :
                                        onboardingProgress >= 66 ? 'bg-blue-500' :
                                        onboardingProgress >= 33 ? 'bg-amber-500' :
                                        'bg-muted-foreground'
                                      }`}
                                      style={{ width: `${onboardingProgress}%` }}
                                    />
                                  </div>
                                  <span className="text-xs text-muted-foreground">{onboardingProgress}%</span>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Calendar className="h-4 w-4" />
                              {formatDate(user.createdAt)}
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center justify-end gap-2">
                              {onboardingStatus.status === 'COMPLETED' && (
                                <Button
                                  variant="default"
                                  size="sm"
                                  onClick={() => handleApproveOnboarding(user.id)}
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                                  title="Approve Onboarding"
                                >
                                  <UserCheck className="h-4 w-4 mr-1" />
                                  Approve
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleVerify(user.id)}
                                disabled={user.verified}
                                className="text-muted-foreground hover:text-foreground"
                                title="Verify User"
                              >
                                <CheckCircle2 className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleView(user)}
                                className="text-muted-foreground hover:text-foreground"
                                title="View Details"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(user)}
                                className="text-muted-foreground hover:text-foreground"
                                title="Edit User"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(user.id)}
                                className="text-red-500 hover:text-red-600"
                                title="Delete User"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                  <p className="text-sm text-muted-foreground">
                    Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, users.length)} of{' '}
                    {users.length} users
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}

              {paginatedUsers.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No users found matching your filters.</p>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* View Dialog */}
      {userDetails && (
        <UserViewDialog
          user={userDetails}
          open={viewDialogOpen}
          onOpenChange={setViewDialogOpen}
        />
      )}

      {/* Edit Dialog */}
      {selectedUser && (
        <UserEditDialog
          user={selectedUser}
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          onSuccess={handleEditSuccess}
        />
      )}
    </div>
  )
}

