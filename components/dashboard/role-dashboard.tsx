'use client'

import { UserRole } from '@/types'
import { EnhancedDashboard } from './enhanced-dashboard'
import { FarmerDashboard } from './farmer-dashboard'
import { BuyerDashboard } from './buyer-dashboard'
import { ExportCompanyDashboard } from './export-company-dashboard'
import { AdminDashboard } from './admin-dashboard'
import { useCurrency } from '@/contexts/currency-context'
import { Badge } from '@/components/ui/badge'

interface RoleDashboardProps {
  role: UserRole
  user: any
}

export function RoleDashboard({ role, user }: RoleDashboardProps) {
  const { currency } = useCurrency()

  const dashboard = (() => {
    switch (role) {
      case UserRole.FARMER:
        return <FarmerDashboard user={user} />
      case UserRole.BUYER:
        return <BuyerDashboard user={user} />
      case UserRole.EXPORT_COMPANY:
        return <ExportCompanyDashboard user={user} />
      case UserRole.ADMIN:
        return <AdminDashboard user={user} />
      default:
        return <EnhancedDashboard />
    }
  })()

  return (
    <div className="space-y-6">
      {/* Currency Indicator */}
      <div className="flex items-center justify-end">
        <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-300">
          {currency.flag} {currency.code} - {currency.name}
        </Badge>
      </div>
      {dashboard}
    </div>
  )
}

