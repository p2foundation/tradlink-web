'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Globe,
  CheckCircle2,
  AlertCircle,
  XCircle,
  RefreshCw,
  Settings,
  Activity,
  Clock,
} from 'lucide-react'
import { formatDate } from '@/lib/utils'
import apiClient from '@/lib/api-client'

interface Integration {
  id: string
  name: string
  country: string
  type: 'single_window' | 'customs' | 'standards' | 'payment' | 'logistics'
  status: 'active' | 'warning' | 'error' | 'inactive'
  lastSync: string
  syncFrequency: string
  apiEndpoint?: string
  healthCheck?: {
    responseTime: number
    uptime: number
    lastError?: string
  }
}

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<Integration[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchIntegrations()
    const interval = setInterval(fetchIntegrations, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const fetchIntegrations = async () => {
    try {
      setLoading(true)
      // TODO: Replace with actual API endpoint
      // const response = await apiClient.get('/admin/integrations')

      // Mock data
      const mockIntegrations: Integration[] = [
        {
          id: '1',
          name: 'Ghana GCMS',
          country: 'Ghana',
          type: 'single_window',
          status: 'active',
          lastSync: new Date().toISOString(),
          syncFrequency: 'Real-time',
          apiEndpoint: 'https://api.gcms.gov.gh',
          healthCheck: {
            responseTime: 120,
            uptime: 99.9,
          },
        },
        {
          id: '2',
          name: 'USA ACE',
          country: 'United States',
          type: 'customs',
          status: 'active',
          lastSync: new Date(Date.now() - 300000).toISOString(),
          syncFrequency: 'Every 5 minutes',
          apiEndpoint: 'https://api.cbp.gov/ace',
          healthCheck: {
            responseTime: 250,
            uptime: 99.8,
          },
        },
        {
          id: '3',
          name: 'EU TRACES',
          country: 'European Union',
          type: 'standards',
          status: 'active',
          lastSync: new Date(Date.now() - 600000).toISOString(),
          syncFrequency: 'Every 10 minutes',
          apiEndpoint: 'https://ec.europa.eu/traces',
          healthCheck: {
            responseTime: 180,
            uptime: 99.7,
          },
        },
        {
          id: '4',
          name: 'China Single Window',
          country: 'China',
          type: 'single_window',
          status: 'active',
          lastSync: new Date(Date.now() - 900000).toISOString(),
          syncFrequency: 'Every 15 minutes',
          apiEndpoint: 'https://api.chinacustoms.gov.cn',
          healthCheck: {
            responseTime: 320,
            uptime: 99.5,
          },
        },
        {
          id: '5',
          name: 'Kenya KenTrade',
          country: 'Kenya',
          type: 'single_window',
          status: 'warning',
          lastSync: new Date(Date.now() - 3600000).toISOString(),
          syncFrequency: 'Every hour',
          apiEndpoint: 'https://api.kentrade.go.ke',
          healthCheck: {
            responseTime: 850,
            uptime: 98.5,
            lastError: 'Timeout on last sync',
          },
        },
        {
          id: '6',
          name: 'Rwanda Trade',
          country: 'Rwanda',
          type: 'single_window',
          status: 'active',
          lastSync: new Date(Date.now() - 1200000).toISOString(),
          syncFrequency: 'Every 20 minutes',
          apiEndpoint: 'https://api.rwandatrade.gov.rw',
          healthCheck: {
            responseTime: 200,
            uptime: 99.6,
          },
        },
        {
          id: '7',
          name: 'South Africa SARS',
          country: 'South Africa',
          type: 'customs',
          status: 'active',
          lastSync: new Date(Date.now() - 1800000).toISOString(),
          syncFrequency: 'Every 30 minutes',
          apiEndpoint: 'https://api.sars.gov.za',
          healthCheck: {
            responseTime: 280,
            uptime: 99.4,
          },
        },
      ]

      setIntegrations(mockIntegrations)
    } catch (error) {
      console.error('Failed to fetch integrations:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSync = async (integrationId: string) => {
    try {
      // TODO: Replace with actual API endpoint
      // await apiClient.post(`/admin/integrations/${integrationId}/sync`)
      await fetchIntegrations()
    } catch (error) {
      console.error('Failed to sync integration:', error)
    }
  }

  const getStatusBadge = (status: string) => {
    const badges = {
      active: <Badge variant="success" className="bg-green-600/20 text-green-300 border-green-600">Active</Badge>,
      warning: <Badge variant="warning" className="bg-yellow-600/20 text-yellow-300 border-yellow-600">Warning</Badge>,
      error: <Badge variant="destructive" className="bg-red-600/20 text-red-300 border-red-600">Error</Badge>,
      inactive: <Badge variant="outline" className="bg-gray-600/20 text-gray-300 border-gray-600">Inactive</Badge>,
    }
    return badges[status as keyof typeof badges] || badges.inactive
  }

  const getStatusIcon = (status: string) => {
    const icons = {
      active: <CheckCircle2 className="h-5 w-5 text-green-500" />,
      warning: <AlertCircle className="h-5 w-5 text-yellow-500" />,
      error: <XCircle className="h-5 w-5 text-red-500" />,
      inactive: <XCircle className="h-5 w-5 text-gray-500" />,
    }
    return icons[status as keyof typeof icons] || icons.inactive
  }

  const stats = {
    total: integrations.length,
    active: integrations.filter((i) => i.status === 'active').length,
    warning: integrations.filter((i) => i.status === 'warning').length,
    error: integrations.filter((i) => i.status === 'error').length,
  }

  return (
    <div className="space-y-6 text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-primary to-emerald-600 bg-clip-text text-transparent">
            Integration Management
          </h1>
          <p className="text-gray-300 mt-1">Manage international trade system integrations</p>
        </div>
        <Button className="shadow-glow">
          <Settings className="h-4 w-4 mr-2" />
          Configure
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-slate-900 border-white/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Total Integrations</CardTitle>
            <Globe className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.total}</div>
            <p className="text-xs text-gray-400 mt-1">Connected systems</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-white/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Active</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.active}</div>
            <p className="text-xs text-gray-400 mt-1">Operating normally</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-white/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Warnings</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.warning}</div>
            <p className="text-xs text-gray-400 mt-1">Requires attention</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-white/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Errors</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.error}</div>
            <p className="text-xs text-gray-400 mt-1">Needs immediate action</p>
          </CardContent>
        </Card>
      </div>

      {/* Integrations List */}
      <div className="grid gap-4 md:grid-cols-2">
        {integrations.map((integration) => (
          <Card key={integration.id} className="bg-slate-900 border-white/10 hover:shadow-glow transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    integration.status === 'active' ? 'bg-green-500/10' :
                    integration.status === 'warning' ? 'bg-yellow-500/10' :
                    integration.status === 'error' ? 'bg-red-500/10' : 'bg-gray-500/10'
                  }`}>
                    {getStatusIcon(integration.status)}
                  </div>
                  <div>
                    <CardTitle className="text-white">{integration.name}</CardTitle>
                    <CardDescription className="text-gray-400">{integration.country}</CardDescription>
                  </div>
                </div>
                {getStatusBadge(integration.status)}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Type:</span>
                  <span className="text-white">{integration.type.replace('_', ' ')}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Sync Frequency:</span>
                  <span className="text-white">{integration.syncFrequency}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Last Sync:</span>
                  <span className="text-white">{formatDate(integration.lastSync)}</span>
                </div>
                {integration.healthCheck && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Response Time:</span>
                      <span className="text-white">{integration.healthCheck.responseTime}ms</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Uptime:</span>
                      <span className="text-white">{integration.healthCheck.uptime}%</span>
                    </div>
                  </>
                )}
                {integration.apiEndpoint && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">API Endpoint:</span>
                    <span className="text-white text-xs truncate max-w-[200px]">{integration.apiEndpoint}</span>
                  </div>
                )}
                {integration.healthCheck?.lastError && (
                  <div className="p-2 bg-red-500/10 border border-red-500/20 rounded text-xs text-red-300">
                    {integration.healthCheck.lastError}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 pt-2 border-t border-white/10">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSync(integration.id)}
                  className="flex-1 bg-slate-800 border-gray-700 text-white hover:bg-slate-700"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Sync Now
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-slate-800 border-gray-700 text-white hover:bg-slate-700"
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

