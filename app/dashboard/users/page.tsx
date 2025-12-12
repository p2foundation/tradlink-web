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
} from 'lucide-react'
import { formatDate } from '@/lib/utils'
import apiClient from '@/lib/api-client'
import { UserRole } from '@/types'
import { Skeleton } from '@/components/ui/skeleton'

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
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<UserRole | 'ALL'>('ALL')
  const [verifiedFilter, setVerifiedFilter] = useState<'ALL' | 'true' | 'false'>('ALL')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const itemsPerPage = 20

  useEffect(() => {
    fetchUsers()
  }, [currentPage, roleFilter, verifiedFilter])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (roleFilter !== 'ALL') params.append('role', roleFilter)
      if (verifiedFilter !== 'ALL') params.append('verified', verifiedFilter)
      params.append('page', currentPage.toString())
      params.append('limit', itemsPerPage.toString())

      // TODO: Replace with actual API endpoint
      // const response = await apiClient.get(`/admin/users?${params.toString()}`)
      
      // Mock data
      const mockUsers: User[] = Array.from({ length: 50 }, (_, i) => {
        const roles: UserRole[] = [UserRole.FARMER, UserRole.BUYER, UserRole.EXPORT_COMPANY, UserRole.ADMIN]
        return {
          id: `user-${i + 1}`,
          email: `user${i + 1}@example.com`,
          firstName: `User${i + 1}`,
          lastName: `Last${i + 1}`,
          role: roles[i % roles.length],
          phone: `+233${200000000 + i}`,
          verified: i % 3 === 0,
          createdAt: new Date(Date.now() - i * 86400000).toISOString(),
          updatedAt: new Date(Date.now() - i * 86400000).toISOString(),
        }
      })
      
      setUsers(mockUsers)
      setTotalPages(Math.ceil(mockUsers.length / itemsPerPage))
    } catch (error) {
      console.error('Failed to fetch users:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredUsers = useMemo(() => {
    let filtered = users

    if (search) {
      const term = search.toLowerCase()
      filtered = filtered.filter(
        (user) =>
          user.email.toLowerCase().includes(term) ||
          user.firstName.toLowerCase().includes(term) ||
          user.lastName.toLowerCase().includes(term)
      )
    }

    if (roleFilter !== 'ALL') {
      filtered = filtered.filter((user) => user.role === roleFilter)
    }

    if (verifiedFilter !== 'ALL') {
      filtered = filtered.filter((user) => user.verified === (verifiedFilter === 'true'))
    }

    return filtered
  }, [users, search, roleFilter, verifiedFilter])

  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    const end = start + itemsPerPage
    return filteredUsers.slice(start, end)
  }, [filteredUsers, currentPage])

  const handleVerify = async (userId: string) => {
    try {
      // TODO: Replace with actual API endpoint
      // await apiClient.patch(`/admin/users/${userId}/verify`, { verified: true })
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, verified: true } : u)))
    } catch (error) {
      console.error('Failed to verify user:', error)
    }
  }

  const handleDelete = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return
    try {
      // TODO: Replace with actual API endpoint
      // await apiClient.delete(`/admin/users/${userId}`)
      setUsers((prev) => prev.filter((u) => u.id !== userId))
    } catch (error) {
      console.error('Failed to delete user:', error)
    }
  }

  const getRoleBadge = (role: UserRole) => {
    const colors = {
      [UserRole.FARMER]: 'bg-green-500/10 text-green-300 border-green-500',
      [UserRole.BUYER]: 'bg-blue-500/10 text-blue-300 border-blue-500',
      [UserRole.EXPORT_COMPANY]: 'bg-purple-500/10 text-purple-300 border-purple-500',
      [UserRole.ADMIN]: 'bg-red-500/10 text-red-300 border-red-500',
    }
    return (
      <Badge variant="outline" className={colors[role]}>
        {role.replace('_', ' ')}
      </Badge>
    )
  }

  const stats = useMemo(() => {
    return {
      total: users.length,
      farmers: users.filter((u) => u.role === UserRole.FARMER).length,
      buyers: users.filter((u) => u.role === UserRole.BUYER).length,
      exportCompanies: users.filter((u) => u.role === UserRole.EXPORT_COMPANY).length,
      admins: users.filter((u) => u.role === UserRole.ADMIN).length,
      verified: users.filter((u) => u.verified).length,
      unverified: users.filter((u) => !u.verified).length,
    }
  }, [users])

  return (
    <div className="space-y-6 text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-primary to-emerald-600 bg-clip-text text-transparent">
            User Management
          </h1>
          <p className="text-gray-300 mt-1">Manage platform users, roles, and permissions</p>
        </div>
        <Button className="shadow-glow">
          <Users className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-slate-900 border-white/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Total Users</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.total}</div>
            <p className="text-xs text-gray-400 mt-1">All registered users</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-white/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Farmers</CardTitle>
            <Shield className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.farmers}</div>
            <p className="text-xs text-gray-400 mt-1">{((stats.farmers / stats.total) * 100).toFixed(1)}% of total</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-white/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Buyers</CardTitle>
            <Shield className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.buyers}</div>
            <p className="text-xs text-gray-400 mt-1">{((stats.buyers / stats.total) * 100).toFixed(1)}% of total</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-white/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Verified</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.verified}</div>
            <p className="text-xs text-gray-400 mt-1">
              {stats.unverified} unverified
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-slate-900 border-white/10">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search users by name or email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 bg-slate-800 border-gray-700 text-white placeholder:text-gray-500"
                />
              </div>
            </div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as UserRole | 'ALL')}
              className="w-full sm:w-48 h-10 rounded-lg border border-gray-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-primary focus:ring-2 focus:ring-primary/40"
            >
              <option value="ALL">All Roles</option>
              <option value={UserRole.FARMER}>Farmers</option>
              <option value={UserRole.BUYER}>Buyers</option>
              <option value={UserRole.EXPORT_COMPANY}>Export Companies</option>
              <option value={UserRole.ADMIN}>Admins</option>
            </select>
            <select
              value={verifiedFilter}
              onChange={(e) => setVerifiedFilter(e.target.value as 'ALL' | 'true' | 'false')}
              className="w-full sm:w-48 h-10 rounded-lg border border-gray-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-primary focus:ring-2 focus:ring-primary/40"
            >
              <option value="ALL">All Users</option>
              <option value="true">Verified</option>
              <option value="false">Unverified</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className="bg-slate-900 border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Users ({filteredUsers.length})</CardTitle>
          <CardDescription className="text-gray-400">Manage user accounts and permissions</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full bg-slate-800" />
              ))}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left p-4 text-sm font-medium text-gray-300">User</th>
                      <th className="text-left p-4 text-sm font-medium text-gray-300">Role</th>
                      <th className="text-left p-4 text-sm font-medium text-gray-300">Status</th>
                      <th className="text-left p-4 text-sm font-medium text-gray-300">Joined</th>
                      <th className="text-right p-4 text-sm font-medium text-gray-300">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedUsers.map((user) => (
                      <tr key={user.id} className="border-b border-white/5 hover:bg-slate-800/50 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="text-primary font-semibold">
                                {user.firstName[0]}{user.lastName[0]}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-white">
                                {user.firstName} {user.lastName}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <Mail className="h-3 w-3 text-gray-400" />
                                <p className="text-sm text-gray-400">{user.email}</p>
                              </div>
                              {user.phone && (
                                <div className="flex items-center gap-2 mt-1">
                                  <Phone className="h-3 w-3 text-gray-400" />
                                  <p className="text-sm text-gray-400">{user.phone}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="p-4">{getRoleBadge(user.role)}</td>
                        <td className="p-4">
                          {user.verified ? (
                            <Badge variant="success" className="bg-green-600/20 text-green-300 border-green-600">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Verified
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-yellow-600/20 text-yellow-300 border-yellow-600">
                              <XCircle className="h-3 w-3 mr-1" />
                              Unverified
                            </Badge>
                          )}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2 text-sm text-gray-400">
                            <Calendar className="h-4 w-4" />
                            {formatDate(user.createdAt)}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleVerify(user.id)}
                              disabled={user.verified}
                              className="text-gray-400 hover:text-white"
                              title="Verify User"
                            >
                              <CheckCircle2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-gray-400 hover:text-white"
                              title="View Details"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-gray-400 hover:text-white"
                              title="Edit User"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(user.id)}
                              className="text-red-400 hover:text-red-300"
                              title="Delete User"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
                  <p className="text-sm text-gray-400">
                    Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredUsers.length)} of{' '}
                    {filteredUsers.length} users
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="bg-slate-800 border-gray-700 text-white"
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="bg-slate-800 border-gray-700 text-white"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}

              {paginatedUsers.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                  <Users className="h-12 w-12 mx-auto mb-4" />
                  <p>No users found matching your filters.</p>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

