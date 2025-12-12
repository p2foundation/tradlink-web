'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  DollarSign,
  TrendingUp,
  Shield,
  Clock,
  CheckCircle2,
  XCircle,
  CreditCard,
  Smartphone,
  Globe,
  Upload,
  FileText,
  ArrowRight,
  Download,
  Eye,
  AlertCircle,
  Plus,
  Filter,
} from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { useCurrency } from '@/contexts/currency-context'
import apiClient from '@/lib/api-client'
import { useToast } from '@/hooks/use-toast'
import { UserRole } from '@/types'
import Link from 'next/link'

type PaymentStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'REFUNDED' | 'VERIFYING' | 'REJECTED'
type PaymentMethod = 'VISA' | 'MASTERCARD' | 'MOBILE_MONEY' | 'PAPSS' | 'MANUAL_PORT'

interface Payment {
  id: string
  transactionId: string
  amount: number
  currency: string
  method: PaymentMethod
  status: PaymentStatus
  referenceCode?: string
  receiptUrl?: string
  receiptNumber?: string
  paymentDate?: string
  createdAt: string
  transaction?: {
    id: string
    totalValue: number
    match?: {
      listing?: {
        cropType: string
      }
      farmer?: {
        user?: {
          firstName: string
          lastName: string
        }
      }
      buyer?: {
        user?: {
          firstName: string
          lastName: string
        }
      }
    }
  }
}

export default function FinancePage() {
  const router = useRouter()
  const { toast } = useToast()
  const { formatCurrency, currency } = useCurrency()
  const [user, setUser] = useState<any>(null)
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalEarnings: 0,
    totalSpent: 0,
    pendingPayments: 0,
    completedPayments: 0,
    availableCredit: 0,
  })

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [paymentsResponse, transactionsResponse] = await Promise.all([
        apiClient.get('/payments').catch(() => ({ data: { data: [] } })),
        apiClient.get('/transactions').catch(() => ({ data: { data: [] } })),
      ])

      const allPayments = paymentsResponse.data.data || paymentsResponse.data || []
      const allTransactions = transactionsResponse.data.data || transactionsResponse.data || []

      // Filter payments based on user role
      let userPayments = allPayments
      if (user?.role === UserRole.FARMER) {
        // Farmers see payments they receive
        userPayments = allPayments.filter((p: Payment) => 
          p.transaction?.match?.farmer?.user?.id === user.id
        )
      } else if (user?.role === UserRole.BUYER) {
        // Buyers see payments they make
        userPayments = allPayments.filter((p: Payment) => 
          p.transaction?.match?.buyer?.user?.id === user.id
        )
      }

      setPayments(userPayments)

      // Calculate stats
      const pending = userPayments.filter((p: Payment) => 
        ['PENDING', 'PROCESSING', 'VERIFYING'].includes(p.status)
      ).length
      const completed = userPayments.filter((p: Payment) => 
        p.status === 'COMPLETED'
      ).length

      let earnings = 0
      let spent = 0

      if (user?.role === UserRole.FARMER) {
        earnings = userPayments
          .filter((p: Payment) => p.status === 'COMPLETED')
          .reduce((sum: number, p: Payment) => sum + p.amount, 0)
      } else if (user?.role === UserRole.BUYER) {
        spent = userPayments
          .filter((p: Payment) => p.status === 'COMPLETED')
          .reduce((sum: number, p: Payment) => sum + p.amount, 0)
      }

      setStats({
        totalEarnings: earnings,
        totalSpent: spent,
        pendingPayments: pending,
        completedPayments: completed,
        availableCredit: 50000, // Mock data
      })
    } catch (error: any) {
      console.error('Failed to fetch finance data:', error)
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load finance data',
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: PaymentStatus) => {
    const variants: Record<PaymentStatus, { label: string; variant: 'default' | 'success' | 'destructive' | 'warning' | 'outline' }> = {
      PENDING: { label: 'Pending', variant: 'warning' },
      PROCESSING: { label: 'Processing', variant: 'warning' },
      COMPLETED: { label: 'Completed', variant: 'success' },
      FAILED: { label: 'Failed', variant: 'destructive' },
      REFUNDED: { label: 'Refunded', variant: 'outline' },
      VERIFYING: { label: 'Verifying', variant: 'warning' },
      REJECTED: { label: 'Rejected', variant: 'destructive' },
    }
    const config = variants[status] || variants.PENDING
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const getMethodIcon = (method: PaymentMethod) => {
    switch (method) {
      case 'VISA':
      case 'MASTERCARD':
        return <CreditCard className="h-4 w-4" />
      case 'MOBILE_MONEY':
        return <Smartphone className="h-4 w-4" />
      case 'PAPSS':
        return <Globe className="h-4 w-4" />
      case 'MANUAL_PORT':
        return <Upload className="h-4 w-4" />
      default:
        return <DollarSign className="h-4 w-4" />
    }
  }

  const getMethodLabel = (method: PaymentMethod) => {
    switch (method) {
      case 'VISA':
        return 'Visa'
      case 'MASTERCARD':
        return 'Mastercard'
      case 'MOBILE_MONEY':
        return 'Mobile Money'
      case 'PAPSS':
        return 'PAPSS'
      case 'MANUAL_PORT':
        return 'Ghana Port Payment'
      default:
        return method
    }
  }

  const getPageTitle = () => {
    switch (user?.role) {
      case UserRole.FARMER:
        return 'Finance & Earnings'
      case UserRole.BUYER:
        return 'Payments'
      case UserRole.EXPORT_COMPANY:
        return 'Finance Management'
      case UserRole.ADMIN:
        return 'Financial Overview'
      default:
        return 'Finance'
    }
  }

  const getPageDescription = () => {
    switch (user?.role) {
      case UserRole.FARMER:
        return 'Track your earnings, pending payments, and financial transactions'
      case UserRole.BUYER:
        return 'Manage payments, view payment history, and track transactions'
      case UserRole.EXPORT_COMPANY:
        return 'Manage payments, financing, and financial operations'
      case UserRole.ADMIN:
        return 'Platform-wide financial overview and payment management'
      default:
        return 'Manage your finances and payments'
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6 text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-primary to-emerald-600 bg-clip-text text-transparent">
            {getPageTitle()}
          </h1>
          <p className="text-gray-300 mt-1">{getPageDescription()}</p>
        </div>
        {user?.role === UserRole.BUYER && (
          <Link href="/dashboard/transactions">
            <Button className="shadow-glow">
              <Plus className="h-4 w-4 mr-2" />
              Make Payment
            </Button>
          </Link>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {user?.role === UserRole.FARMER ? (
          <>
            <Card className="bg-slate-900 border-white/10 hover:shadow-glow transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-300">Total Earnings</CardTitle>
                <DollarSign className="h-4 w-4 text-emerald-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{formatCurrency(stats.totalEarnings)}</div>
                <p className="text-xs text-gray-400 mt-1">All-time revenue • {currency.code}</p>
              </CardContent>
            </Card>

            <Card className="bg-slate-900 border-white/10 hover:shadow-glow transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-300">Pending Payments</CardTitle>
                <Clock className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{stats.pendingPayments}</div>
                <p className="text-xs text-gray-400 mt-1">Awaiting payment</p>
              </CardContent>
            </Card>

            <Card className="bg-slate-900 border-white/10 hover:shadow-glow transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-300">Completed Payments</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{stats.completedPayments}</div>
                <p className="text-xs text-gray-400 mt-1">Successful transactions</p>
              </CardContent>
            </Card>

            <Card className="bg-slate-900 border-white/10 hover:shadow-glow transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-300">Available Credit</CardTitle>
                <TrendingUp className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{formatCurrency(stats.availableCredit)}</div>
                <p className="text-xs text-gray-400 mt-1">Credit limit</p>
              </CardContent>
            </Card>
          </>
        ) : user?.role === UserRole.BUYER ? (
          <>
            <Card className="bg-slate-900 border-white/10 hover:shadow-glow transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-300">Total Spent</CardTitle>
                <DollarSign className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{formatCurrency(stats.totalSpent)}</div>
                <p className="text-xs text-gray-400 mt-1">This year • {currency.code}</p>
              </CardContent>
            </Card>

            <Card className="bg-slate-900 border-white/10 hover:shadow-glow transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-300">Pending Payments</CardTitle>
                <Clock className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{stats.pendingPayments}</div>
                <p className="text-xs text-gray-400 mt-1">Awaiting processing</p>
              </CardContent>
            </Card>

            <Card className="bg-slate-900 border-white/10 hover:shadow-glow transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-300">Completed Payments</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{stats.completedPayments}</div>
                <p className="text-xs text-gray-400 mt-1">Successful payments</p>
              </CardContent>
            </Card>

            <Card className="bg-slate-900 border-white/10 hover:shadow-glow transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-300">Payment Methods</CardTitle>
                <CreditCard className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">5</div>
                <p className="text-xs text-gray-400 mt-1">Available methods</p>
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            <Card className="bg-slate-900 border-white/10 hover:shadow-glow transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-300">Total Payments</CardTitle>
                <DollarSign className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{payments.length}</div>
                <p className="text-xs text-gray-400 mt-1">All payments</p>
              </CardContent>
            </Card>

            <Card className="bg-slate-900 border-white/10 hover:shadow-glow transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-300">Pending</CardTitle>
                <Clock className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{stats.pendingPayments}</div>
                <p className="text-xs text-gray-400 mt-1">Awaiting action</p>
              </CardContent>
            </Card>

            <Card className="bg-slate-900 border-white/10 hover:shadow-glow transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-300">Completed</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{stats.completedPayments}</div>
                <p className="text-xs text-gray-400 mt-1">Successful</p>
              </CardContent>
            </Card>

            <Card className="bg-slate-900 border-white/10 hover:shadow-glow transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-300">Total Volume</CardTitle>
                <TrendingUp className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {formatCurrency(payments.reduce((sum, p) => sum + p.amount, 0))}
                </div>
                <p className="text-xs text-gray-400 mt-1">All transactions</p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Payment History */}
      <Card className="bg-slate-900 border-white/10">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white">Payment History</CardTitle>
              <CardDescription className="text-gray-400">
                {user?.role === UserRole.FARMER
                  ? 'Payments received from buyers'
                  : user?.role === UserRole.BUYER
                  ? 'Payments made to suppliers'
                  : 'All payment transactions'}
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" className="bg-slate-800 border-slate-700 text-slate-100">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <div className="text-center py-12">
              <DollarSign className="h-16 w-16 mx-auto text-gray-500 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No Payments Yet</h3>
              <p className="text-gray-400 mb-6">
                {user?.role === UserRole.FARMER
                  ? 'You haven\'t received any payments yet. Complete transactions to see payments here.'
                  : user?.role === UserRole.BUYER
                  ? 'You haven\'t made any payments yet. Complete a transaction to make a payment.'
                  : 'No payment transactions found.'}
              </p>
              {user?.role === UserRole.BUYER && (
                <Link href="/dashboard/transactions">
                  <Button>View Transactions</Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {payments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg hover:bg-slate-800 transition-colors border border-slate-700/50"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="p-3 bg-primary/10 rounded-lg text-primary">
                      {getMethodIcon(payment.method)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h4 className="font-semibold text-white">
                          {payment.transaction?.match?.listing?.cropType || 'Product Payment'}
                        </h4>
                        {getStatusBadge(payment.status)}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <span>{getMethodLabel(payment.method)}</span>
                        <span>•</span>
                        <span>
                          {user?.role === UserRole.FARMER
                            ? `From: ${payment.transaction?.match?.buyer?.user?.firstName || ''} ${payment.transaction?.match?.buyer?.user?.lastName || ''}`
                            : `To: ${payment.transaction?.match?.farmer?.user?.firstName || ''} ${payment.transaction?.match?.farmer?.user?.lastName || ''}`}
                        </span>
                        {payment.referenceCode && (
                          <>
                            <span>•</span>
                            <span className="font-mono text-xs">Ref: {payment.referenceCode}</span>
                          </>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDate(payment.paymentDate || payment.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-lg font-bold text-white">{formatCurrency(payment.amount)}</p>
                      <p className="text-xs text-gray-400">{payment.currency}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {payment.receiptUrl && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(payment.receiptUrl, '_blank')}
                          className="text-slate-300 hover:text-white"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/dashboard/transactions/${payment.transactionId}`)}
                        className="text-slate-300 hover:text-white"
                      >
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Methods Info */}
      {user?.role === UserRole.BUYER && (
        <Card className="bg-slate-900 border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Available Payment Methods</CardTitle>
            <CardDescription className="text-gray-400">
              Choose from multiple secure payment options
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {[
                { method: 'VISA', icon: CreditCard, color: 'text-blue-500' },
                { method: 'MASTERCARD', icon: CreditCard, color: 'text-red-500' },
                { method: 'MOBILE_MONEY', icon: Smartphone, color: 'text-green-500' },
                { method: 'PAPSS', icon: Globe, color: 'text-purple-500' },
              ].map(({ method, icon: Icon, color }) => (
                <div
                  key={method}
                  className="p-4 bg-slate-800/50 rounded-lg border border-slate-700/50 hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`p-2 bg-primary/10 rounded-lg ${color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="font-semibold text-white">{getMethodLabel(method as PaymentMethod)}</span>
                  </div>
                  <p className="text-xs text-gray-400">
                    {method === 'MOBILE_MONEY'
                      ? 'MTN, Vodafone, AirtelTigo'
                      : method === 'PAPSS'
                      ? 'Pan-African Payment System'
                      : 'Secure card payment'}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Finance Services (for Farmers) */}
      {user?.role === UserRole.FARMER && (
        <Card className="bg-slate-900 border-white/10 border-l-4 border-l-emerald-500">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-white flex items-center gap-2">
                  <TrendingUp className="h-6 w-6 text-emerald-500" />
                  Trade Finance Services
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Access financing and insurance solutions for your exports
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500">
                      <TrendingUp className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-white">Export Finance Loan</h4>
                      <p className="text-sm text-gray-400 mt-1">
                        Quick access to working capital for export transactions
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-gray-400">
                    <span>Up to {formatCurrency(50000)}</span>
                    <span className="mx-2">•</span>
                    <span>8.5% APR</span>
                  </div>
                  <Button size="sm" variant="outline" className="bg-slate-800 border-slate-700 text-slate-100">
                    Apply
                  </Button>
                </div>
              </div>

              <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                      <Shield className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-white">Trade Credit Insurance</h4>
                      <p className="text-sm text-gray-400 mt-1">
                        Protect against buyer default and payment delays
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-gray-400">
                    <span>Coverage: {formatCurrency(25000)}</span>
                    <span className="mx-2">•</span>
                    <span>2.5% premium</span>
                  </div>
                  <Button size="sm" variant="outline" className="bg-slate-800 border-slate-700 text-slate-100">
                    Learn More
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
