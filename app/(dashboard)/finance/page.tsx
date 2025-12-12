'use client'

import { TradeFinanceCard } from '@/components/financial/trade-finance-card'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RealTimeTracker } from '@/components/dashboard/real-time-tracker'
import { DollarSign, TrendingUp, Shield, Clock } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

export default function FinancePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-primary to-emerald-600 bg-clip-text text-transparent">
          Trade Finance
        </h1>
        <p className="text-gray-600 mt-1">
          Access financing, insurance, and payment solutions for your trade
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Available Credit</p>
                <p className="text-2xl font-bold mt-1">{formatCurrency(50000)}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Loans</p>
                <p className="text-2xl font-bold mt-1">3</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Insurance Coverage</p>
                <p className="text-2xl font-bold mt-1">{formatCurrency(125000)}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Shield className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Payments</p>
                <p className="text-2xl font-bold mt-1">2</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Finance Services */}
      <TradeFinanceCard />

      {/* Transaction Tracking */}
      <RealTimeTracker />
    </div>
  )
}

