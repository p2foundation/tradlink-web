'use client'

import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, AlertCircle, RefreshCw, FileText } from 'lucide-react'
import apiClient from '@/lib/api-client'
import { Transaction } from '@/types'
import { TransactionRow } from '@/components/transactions/transaction-row'
import { FilterBar, FilterOption } from '@/components/ui/filter-bar'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'
import { Card, CardContent } from '@/components/ui/card'

export default function TransactionsPage() {
  const { toast } = useToast()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null)
  const [shipmentStatus, setShipmentStatus] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  })

  useEffect(() => {
    // Reset to page 1 when filters change
    setPagination((prev) => ({ ...prev, page: 1 }))
  }, [paymentStatus, shipmentStatus])

  useEffect(() => {
    fetchTransactions()
  }, [paymentStatus, shipmentStatus, pagination.page])

  const fetchTransactions = async () => {
    try {
      setLoading(true)
      setError(null)
      const params = new URLSearchParams()
      if (paymentStatus) params.append('paymentStatus', paymentStatus)
      if (shipmentStatus) params.append('shipmentStatus', shipmentStatus)
      params.append('page', pagination.page.toString())
      params.append('limit', pagination.limit.toString())

      const response = await apiClient.get(`/transactions?${params.toString()}`)
      setTransactions(response.data.data || [])
      if (response.data.meta) {
        setPagination({
          page: response.data.meta.page || pagination.page,
          limit: response.data.meta.limit || pagination.limit,
          total: response.data.meta.total || 0,
          totalPages: response.data.meta.totalPages || 0,
        })
      }
    } catch (error: any) {
      console.error('Failed to fetch transactions:', error)
      
      // Determine error message
      let errorMessage = 'Failed to load transactions'
      if (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error') || error.code === 'ECONNREFUSED') {
        errorMessage = 'Unable to connect to the API server. Please ensure the backend server is running on port 4000.'
      } else if (error.response?.status === 401) {
        errorMessage = 'Authentication required. Please log in again.'
      } else if (error.response?.status === 403) {
        errorMessage = 'You do not have permission to view transactions.'
      } else if (error.response?.status === 404) {
        errorMessage = 'Transactions endpoint not found. Please check the API configuration.'
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      }
      
      setError(errorMessage)
      toast({
        variant: 'destructive',
        title: 'Error Loading Transactions',
        description: errorMessage,
      })
    } finally {
      setLoading(false)
    }
  }

  const paymentOptions: FilterOption[] = [
    { label: 'Pending', value: 'pending' },
    { label: 'Paid', value: 'paid' },
    { label: 'Completed', value: 'completed' },
    { label: 'Failed', value: 'failed' },
  ]

  const shipmentOptions: FilterOption[] = [
    { label: 'Pending', value: 'pending' },
    { label: 'Shipped', value: 'shipped' },
    { label: 'Delivered', value: 'delivered' },
  ]

  const filteredTransactions = useMemo(() => {
    const term = search.toLowerCase()
    return transactions.filter((t) => {
      const text = `${t.match?.listing?.cropType ?? ''} ${t.buyer?.user?.firstName ?? ''} ${t.buyer?.user?.lastName ?? ''} ${t.id}`.toLowerCase()
      return term ? text.includes(term) : true
    })
  }, [transactions, search])

  if (loading && transactions.length === 0) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-12 w-72" />
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-5/6" />
      </div>
    )
  }

  return (
    <div className="space-y-6 text-slate-100">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Transactions</h1>
          <p className="text-gray-300 mt-1">Deal pipeline and transaction tracking</p>
        </div>
        {error && (
          <Button
            variant="outline"
            onClick={fetchTransactions}
            disabled={loading}
            className="text-slate-300"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Retry
          </Button>
        )}
      </div>

      {error && (
        <Card className="bg-red-900/20 border-red-500/30">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-semibold text-red-300 mb-1">Error Loading Transactions</h3>
                <p className="text-sm text-red-200/70 mb-2">{error}</p>
                {error.includes('API server') && (
                  <div className="bg-red-950/50 border border-red-800/50 rounded-lg p-3 mt-3 mb-3">
                    <p className="text-xs text-red-200/80 font-medium mb-1">To start the API server:</p>
                    <code className="text-xs text-red-300 block bg-black/30 p-2 rounded mt-1">
                      cd api && npm run start:dev
                    </code>
                  </div>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchTransactions}
                  disabled={loading}
                  className="mt-2 border-red-500/50 text-red-300 hover:bg-red-500/10"
                >
                  <RefreshCw className={`h-3 w-3 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Try Again
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <FilterBar
        searchPlaceholder="Search transactions..."
        searchValue={search}
        onSearchChange={setSearch}
        filters={[
          {
            id: 'paymentStatus',
            label: 'Payment',
            options: paymentOptions,
            active: paymentStatus,
            onChange: (val) => setPaymentStatus(val),
          },
          {
            id: 'shipmentStatus',
            label: 'Shipment',
            options: shipmentOptions,
            active: shipmentStatus,
            onChange: (val) => setShipmentStatus(val),
          },
        ]}
        onClearAll={() => {
          setPaymentStatus(null)
          setShipmentStatus(null)
        }}
      />

      {/* Transactions List */}
      <div className="space-y-4">
        {filteredTransactions.map((transaction) => (
          <TransactionRow
            key={transaction.id}
            id={transaction.id}
            crop={transaction.match?.listing?.cropType}
            quantity={
              transaction.match?.listing
                ? `${transaction.match.listing.quantity} ${transaction.match.listing.unit ?? ''}`
                : undefined
            }
            buyer={
              transaction.buyer?.user
                ? `${transaction.buyer.user.firstName} ${transaction.buyer.user.lastName}`
                : undefined
            }
            pricePerUnit={transaction.agreedPrice}
            totalValue={transaction.totalValue}
            paymentStatus={transaction.paymentStatus}
            shipmentStatus={transaction.shipmentStatus}
            date={transaction.createdAt}
          />
        ))}
      </div>

      {filteredTransactions.length === 0 && !loading && (
        <div className="text-center py-12 text-gray-400">
          No transactions found. Transactions will appear here once matches are completed.
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <div className="text-sm text-gray-400">
            Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} transactions
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
              disabled={pagination.page === 1 || loading}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                let pageNum: number
                if (pagination.totalPages <= 5) {
                  pageNum = i + 1
                } else if (pagination.page <= 3) {
                  pageNum = i + 1
                } else if (pagination.page >= pagination.totalPages - 2) {
                  pageNum = pagination.totalPages - 4 + i
                } else {
                  pageNum = pagination.page - 2 + i
                }
                return (
                  <Button
                    key={pageNum}
                    variant={pagination.page === pageNum ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setPagination({ ...pagination, page: pageNum })}
                    disabled={loading}
                    className="min-w-[40px]"
                  >
                    {pageNum}
                  </Button>
                )
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
              disabled={pagination.page === pagination.totalPages || loading}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

