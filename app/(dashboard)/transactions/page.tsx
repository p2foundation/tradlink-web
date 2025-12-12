'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FileText } from 'lucide-react'
import apiClient from '@/lib/api-client'
import { Transaction } from '@/types'
import { formatCurrency, formatDate } from '@/lib/utils'

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState({
    paymentStatus: '',
    shipmentStatus: '',
  })

  useEffect(() => {
    fetchTransactions()
  }, [filter])

  const fetchTransactions = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (filter.paymentStatus) params.append('paymentStatus', filter.paymentStatus)
      if (filter.shipmentStatus) params.append('shipmentStatus', filter.shipmentStatus)

      const response = await apiClient.get(`/transactions?${params.toString()}`)
      setTransactions(response.data.data || [])
    } catch (error) {
      console.error('Failed to fetch transactions:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'paid':
      case 'delivered':
        return 'success'
      case 'pending':
        return 'warning'
      case 'cancelled':
      case 'failed':
        return 'destructive'
      default:
        return 'default'
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Transactions</h1>
        <p className="text-gray-600 mt-1">Deal pipeline and transaction tracking</p>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <select
          className="px-4 py-2 border rounded-md"
          value={filter.paymentStatus}
          onChange={(e) => setFilter({ ...filter, paymentStatus: e.target.value })}
        >
          <option value="">All Payment Status</option>
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="completed">Completed</option>
        </select>
        <select
          className="px-4 py-2 border rounded-md"
          value={filter.shipmentStatus}
          onChange={(e) => setFilter({ ...filter, shipmentStatus: e.target.value })}
        >
          <option value="">All Shipment Status</option>
          <option value="pending">Pending</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
        </select>
      </div>

      {/* Transactions List */}
      <div className="space-y-4">
        {transactions.map((transaction) => (
          <Card key={transaction.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-4">
                    <FileText className="h-5 w-5 text-primary" />
                    <div>
                      <h3 className="font-semibold text-lg">
                        Transaction #{transaction.id.slice(0, 8)}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {transaction.match?.listing?.cropType} • {transaction.quantity}{' '}
                        {transaction.match?.listing?.unit}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Buyer:</span>{' '}
                      {transaction.buyer?.user?.firstName} {transaction.buyer?.user?.lastName}
                    </div>
                    <div>
                      <span className="font-medium">Price:</span>{' '}
                      {formatCurrency(transaction.agreedPrice)}/{transaction.match?.listing?.unit}
                    </div>
                    <div>
                      <span className="font-medium">Total Value:</span>{' '}
                      {formatCurrency(transaction.totalValue)}
                    </div>
                    <div>
                      <span className="font-medium">Date:</span>{' '}
                      {formatDate(transaction.createdAt)}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="flex gap-2">
                    <Badge variant={getStatusColor(transaction.paymentStatus)}>
                      Payment: {transaction.paymentStatus}
                    </Badge>
                    <Badge variant={getStatusColor(transaction.shipmentStatus)}>
                      Shipment: {transaction.shipmentStatus}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {transactions.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No transactions found. Transactions will appear here once matches are completed.
        </div>
      )}
    </div>
  )
}

