'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Settings,
  FileText,
  Plus,
  Edit,
  Trash2,
  Eye,
  CheckCircle2,
  Clock,
  AlertCircle,
  Search,
} from 'lucide-react'
import { formatDate } from '@/lib/utils'
import apiClient from '@/lib/api-client'

interface Policy {
  id: string
  title: string
  category: 'terms' | 'privacy' | 'trade' | 'quality' | 'compliance' | 'payment'
  status: 'draft' | 'active' | 'archived'
  version: string
  effectiveDate?: string
  expiryDate?: string
  lastModified: string
  modifiedBy: string
  content: string
}

export default function PolicyPage() {
  const [policies, setPolicies] = useState<Policy[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | string>('ALL')
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'draft' | 'active' | 'archived'>('ALL')
  const [showCreateModal, setShowCreateModal] = useState(false)

  useEffect(() => {
    fetchPolicies()
  }, [])

  const fetchPolicies = async () => {
    try {
      setLoading(true)
      // TODO: Replace with actual API endpoint
      // const response = await apiClient.get('/admin/policies')

      // Mock data
      const mockPolicies: Policy[] = [
        {
          id: '1',
          title: 'Terms of Service',
          category: 'terms',
          status: 'active',
          version: '2.1',
          effectiveDate: new Date(Date.now() - 90 * 86400000).toISOString(),
          lastModified: new Date(Date.now() - 30 * 86400000).toISOString(),
          modifiedBy: 'Admin User',
          content: 'Platform terms and conditions...',
        },
        {
          id: '2',
          title: 'Privacy Policy',
          category: 'privacy',
          status: 'active',
          version: '1.5',
          effectiveDate: new Date(Date.now() - 60 * 86400000).toISOString(),
          lastModified: new Date(Date.now() - 15 * 86400000).toISOString(),
          modifiedBy: 'Admin User',
          content: 'Data protection and privacy guidelines...',
        },
        {
          id: '3',
          title: 'Quality Standards Policy',
          category: 'quality',
          status: 'active',
          version: '3.0',
          effectiveDate: new Date(Date.now() - 30 * 86400000).toISOString(),
          lastModified: new Date(Date.now() - 7 * 86400000).toISOString(),
          modifiedBy: 'Admin User',
          content: 'Product quality requirements and standards...',
        },
        {
          id: '4',
          title: 'Trade Compliance Guidelines',
          category: 'compliance',
          status: 'draft',
          version: '1.0',
          lastModified: new Date(Date.now() - 2 * 86400000).toISOString(),
          modifiedBy: 'Admin User',
          content: 'International trade compliance requirements...',
        },
        {
          id: '5',
          title: 'Payment Processing Policy',
          category: 'payment',
          status: 'active',
          version: '2.0',
          effectiveDate: new Date(Date.now() - 45 * 86400000).toISOString(),
          lastModified: new Date(Date.now() - 20 * 86400000).toISOString(),
          modifiedBy: 'Admin User',
          content: 'Payment methods and processing guidelines...',
        },
      ]

      setPolicies(mockPolicies)
    } catch (error) {
      console.error('Failed to fetch policies:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredPolicies = policies.filter((policy) => {
    const matchesSearch = search === '' || 
      policy.title.toLowerCase().includes(search.toLowerCase()) ||
      policy.content.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = categoryFilter === 'ALL' || policy.category === categoryFilter
    const matchesStatus = statusFilter === 'ALL' || policy.status === statusFilter
    return matchesSearch && matchesCategory && matchesStatus
  })

  const getCategoryBadge = (category: string) => {
    const colors = {
      terms: 'bg-blue-500/10 text-blue-300 border-blue-500',
      privacy: 'bg-purple-500/10 text-purple-300 border-purple-500',
      trade: 'bg-green-500/10 text-green-300 border-green-500',
      quality: 'bg-emerald-500/10 text-emerald-300 border-emerald-500',
      compliance: 'bg-yellow-500/10 text-yellow-300 border-yellow-500',
      payment: 'bg-orange-500/10 text-orange-300 border-orange-500',
    }
    return (
      <Badge variant="outline" className={colors[category as keyof typeof colors]}>
        {category.toUpperCase()}
      </Badge>
    )
  }

  const getStatusBadge = (status: string) => {
    const badges = {
      active: <Badge variant="success" className="bg-green-600/20 text-green-300 border-green-600">Active</Badge>,
      draft: <Badge variant="warning" className="bg-yellow-600/20 text-yellow-300 border-yellow-600">Draft</Badge>,
      archived: <Badge variant="outline" className="bg-gray-600/20 text-gray-300 border-gray-600">Archived</Badge>,
    }
    return badges[status as keyof typeof badges] || badges.draft
  }

  const stats = {
    total: policies.length,
    active: policies.filter((p) => p.status === 'active').length,
    draft: policies.filter((p) => p.status === 'draft').length,
    archived: policies.filter((p) => p.status === 'archived').length,
  }

  return (
    <div className="space-y-6 text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-primary to-emerald-600 bg-clip-text text-transparent">
            Policy Management
          </h1>
          <p className="text-gray-300 mt-1">Manage platform policies and terms</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} className="shadow-glow">
          <Plus className="h-4 w-4 mr-2" />
          Create Policy
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-slate-900 border-white/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Total Policies</CardTitle>
            <FileText className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.total}</div>
            <p className="text-xs text-gray-400 mt-1">All policies</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-white/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Active</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.active}</div>
            <p className="text-xs text-gray-400 mt-1">Currently in effect</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-white/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Draft</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.draft}</div>
            <p className="text-xs text-gray-400 mt-1">Under review</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-white/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Archived</CardTitle>
            <AlertCircle className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.archived}</div>
            <p className="text-xs text-gray-400 mt-1">No longer active</p>
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
                  placeholder="Search policies..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 bg-slate-800 border-gray-700 text-white placeholder:text-gray-500"
                />
              </div>
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full sm:w-48 h-10 rounded-lg border border-gray-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-primary focus:ring-2 focus:ring-primary/40"
            >
              <option value="ALL">All Categories</option>
              <option value="terms">Terms</option>
              <option value="privacy">Privacy</option>
              <option value="trade">Trade</option>
              <option value="quality">Quality</option>
              <option value="compliance">Compliance</option>
              <option value="payment">Payment</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
              className="w-full sm:w-48 h-10 rounded-lg border border-gray-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-primary focus:ring-2 focus:ring-primary/40"
            >
              <option value="ALL">All Statuses</option>
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Policies List */}
      <div className="grid gap-4 md:grid-cols-2">
        {filteredPolicies.map((policy) => (
          <Card key={policy.id} className="bg-slate-900 border-white/10 hover:shadow-glow transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-white mb-2">{policy.title}</CardTitle>
                  <div className="flex items-center gap-2 mb-2">
                    {getCategoryBadge(policy.category)}
                    {getStatusBadge(policy.status)}
                    <Badge variant="outline" className="bg-slate-700 text-gray-300 border-gray-600">
                      v{policy.version}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm">
                {policy.effectiveDate && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Effective Date:</span>
                    <span className="text-white">{formatDate(policy.effectiveDate)}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Last Modified:</span>
                  <span className="text-white">{formatDate(policy.lastModified)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Modified By:</span>
                  <span className="text-white">{policy.modifiedBy}</span>
                </div>
              </div>
              <p className="text-sm text-gray-300 line-clamp-3">{policy.content}</p>
              <div className="flex items-center gap-2 pt-2 border-t border-white/10">
                <Button variant="outline" size="sm" className="flex-1 bg-slate-800 border-gray-700 text-white hover:bg-slate-700">
                  <Eye className="h-4 w-4 mr-2" />
                  View
                </Button>
                <Button variant="outline" size="sm" className="bg-slate-800 border-gray-700 text-white hover:bg-slate-700">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button variant="outline" size="sm" className="bg-slate-800 border-gray-700 text-red-400 hover:bg-red-500/10">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredPolicies.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <FileText className="h-12 w-12 mx-auto mb-4" />
          <p>No policies found matching your filters.</p>
        </div>
      )}
    </div>
  )
}

