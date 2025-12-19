'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { FileText, ArrowRight } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { useCurrency } from '@/contexts/currency-context'
import Link from 'next/link'

export type TransactionRowProps = {
  id: string
  crop?: string
  quantity?: string
  buyer?: string
  pricePerUnit?: number
  totalValue: number
  paymentStatus: string
  shipmentStatus: string
  date: string | Date
}

const statusVariant = (status: string) => {
  const key = status.toLowerCase()
  if (['completed', 'paid', 'delivered'].includes(key)) return 'success' as const
  if (['pending'].includes(key)) return 'warning' as const
  if (['cancelled', 'failed'].includes(key)) return 'destructive' as const
  return 'outline' as const
}

export function TransactionRow({
  id,
  crop,
  quantity,
  buyer,
  pricePerUnit,
  totalValue,
  paymentStatus,
  shipmentStatus,
  date,
}: TransactionRowProps) {
  const { formatCurrency } = useCurrency()
  return (
    <Link href={`/dashboard/transactions/${id}`}>
      <Card className="hover:shadow-glow transition-shadow cursor-pointer">
        <CardContent className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 flex-1">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <FileText className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-lg text-foreground">Transaction #{id.slice(0, 8)}</h3>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {crop ?? '—'} {quantity ? `• ${quantity}` : ''} {buyer ? `• ${buyer}` : ''}
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mt-3">
                  {pricePerUnit !== undefined && (
                    <div>
                      <span className="font-medium text-foreground">Price:</span>{' '}
                      <span className="text-muted-foreground">{formatCurrency(pricePerUnit)}/{quantity?.split(' ').pop() ?? 'unit'}</span>
                    </div>
                  )}
                  <div>
                    <span className="font-medium text-foreground">Total Value:</span>{' '}
                    <span className="text-emerald-400">{formatCurrency(totalValue)}</span>
                  </div>
                  <div>
                    <span className="font-medium text-foreground">Date:</span>{' '}
                    <span className="text-muted-foreground">{formatDate(date)}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Badge variant={statusVariant(paymentStatus)}>Payment: {paymentStatus}</Badge>
              <Badge variant={statusVariant(shipmentStatus)}>Shipment: {shipmentStatus}</Badge>
              <Button variant="ghost" size="sm" className="mt-2">
                View Details
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

