'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CreditCard, TrendingUp, Clock, CheckCircle2, AlertCircle } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface FinanceOption {
  id: string
  type: 'loan' | 'insurance' | 'payment'
  title: string
  description: string
  amount?: number
  rate?: string
  duration?: string
  status: 'available' | 'pending' | 'approved' | 'rejected'
  provider: string
}

export function TradeFinanceCard() {
  const financeOptions: FinanceOption[] = [
    {
      id: '1',
      type: 'loan',
      title: 'Export Finance Loan',
      description: 'Quick access to working capital for export transactions',
      amount: 50000,
      rate: '8.5% APR',
      duration: '90 days',
      status: 'available',
      provider: 'Ghana Commercial Bank',
    },
    {
      id: '2',
      type: 'insurance',
      title: 'Trade Credit Insurance',
      description: 'Protect against buyer default and payment delays',
      amount: 25000,
      rate: '2.5% premium',
      duration: '120 days',
      status: 'available',
      provider: 'Ghana Export Insurance',
    },
    {
      id: '3',
      type: 'payment',
      title: 'Instant Payment Processing',
      description: 'Fast international settlement within 2 minutes',
      status: 'available',
      provider: 'TradeLink Payments',
    },
  ]

  const getIcon = (type: string) => {
    switch (type) {
      case 'loan':
        return <TrendingUp className="h-5 w-5" />
      case 'insurance':
        return <AlertCircle className="h-5 w-5" />
      case 'payment':
        return <CreditCard className="h-5 w-5" />
      default:
        return <CreditCard className="h-5 w-5" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'available':
        return <Badge variant="success">Available</Badge>
      case 'approved':
        return <Badge variant="success">Approved</Badge>
      case 'pending':
        return <Badge variant="warning">Pending</Badge>
      default:
        return <Badge variant="destructive">Rejected</Badge>
    }
  }

  return (
    <Card className="shadow-lg border-l-4 border-l-green-500">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-6 w-6 text-primary" />
              Trade Finance Services
            </CardTitle>
            <CardDescription>
              Access financing, insurance, and payment solutions
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {financeOptions.map((option) => (
            <div
              key={option.id}
              className="p-4 border rounded-lg hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-primary/10 rounded-lg text-primary">
                    {getIcon(option.type)}
                  </div>
                  <div>
                    <h4 className="font-semibold">{option.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{option.description}</p>
                    <p className="text-xs text-gray-500 mt-1">Provider: {option.provider}</p>
                  </div>
                </div>
                {getStatusBadge(option.status)}
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex gap-4 text-sm">
                  {option.amount && (
                    <div>
                      <span className="text-gray-600">Amount: </span>
                      <span className="font-semibold">{formatCurrency(option.amount)}</span>
                    </div>
                  )}
                  {option.rate && (
                    <div>
                      <span className="text-gray-600">Rate: </span>
                      <span className="font-semibold">{option.rate}</span>
                    </div>
                  )}
                  {option.duration && (
                    <div>
                      <span className="text-gray-600">Duration: </span>
                      <span className="font-semibold">{option.duration}</span>
                    </div>
                  )}
                </div>
                <Button size="sm" variant="outline">
                  Apply Now
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-start space-x-3">
            <CheckCircle2 className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <p className="font-medium text-sm text-blue-900">
                Instant Credit Assessment
              </p>
              <p className="text-xs text-blue-700 mt-1">
                Your trade data is used for real-time creditworthiness evaluation. 
                No physical visits or extensive documentation required.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

