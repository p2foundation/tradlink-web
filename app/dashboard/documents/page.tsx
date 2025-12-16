'use client'

import { useEffect, useState } from 'react'
import { DocumentManager } from '@/components/documents/document-manager'
import { Card, CardContent } from '@/components/ui/card'
import { FileText, CheckCircle2, Clock, AlertCircle, Loader2 } from 'lucide-react'
import apiClient from '@/lib/api-client'
import { useToast } from '@/hooks/use-toast'
import { Skeleton } from '@/components/ui/skeleton'

export default function DocumentsPage() {
  const { toast } = useToast()
  const [stats, setStats] = useState({
    total: 0,
    verified: 0,
    pending: 0,
    expired: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      setLoading(true)
      const response = await apiClient.get('/documents/stats')
      setStats(response.data || stats)
    } catch (error: any) {
      console.error('Failed to fetch document stats:', error)
      // Don't show error toast, just use defaults
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-primary to-emerald-600 bg-clip-text text-transparent">
          Documents
        </h1>
        <p className="text-gray-300 mt-1">
          Manage your trade certificates, licenses, and contracts
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {loading ? (
          <>
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </>
        ) : (
          <>
            <Card className="shadow-lg bg-slate-900 border-white/10">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-300">Total Documents</p>
                    <p className="text-2xl font-bold mt-1 text-white">{stats.total}</p>
                  </div>
                  <div className="p-3 bg-blue-500/10 rounded-lg">
                    <FileText className="h-6 w-6 text-blue-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg bg-slate-900 border-white/10">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-300">Verified</p>
                    <p className="text-2xl font-bold mt-1 text-emerald-400">{stats.verified}</p>
                  </div>
                  <div className="p-3 bg-emerald-500/10 rounded-lg">
                    <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg bg-slate-900 border-white/10">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-300">Pending</p>
                    <p className="text-2xl font-bold mt-1 text-yellow-400">{stats.pending}</p>
                  </div>
                  <div className="p-3 bg-yellow-500/10 rounded-lg">
                    <Clock className="h-6 w-6 text-yellow-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg bg-slate-900 border-white/10">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-300">Expired</p>
                    <p className="text-2xl font-bold mt-1 text-red-400">{stats.expired}</p>
                  </div>
                  <div className="p-3 bg-red-500/10 rounded-lg">
                    <AlertCircle className="h-6 w-6 text-red-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Document Manager */}
      <DocumentManager />
    </div>
  )
}

