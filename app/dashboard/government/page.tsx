'use client'

import { useEffect, useState } from 'react'
import { GovernmentDashboard } from '@/components/dashboard/government-dashboard'
import { Skeleton } from '@/components/ui/skeleton'

export default function GovernmentDashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    } else {
      // Fallback: fetch from API
      fetch('/api/auth/me')
        .then((res) => res.json())
        .then((data) => setUser(data))
        .catch(console.error)
    }
    setLoading(false)
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    )
  }

  return <GovernmentDashboard user={user} />
}
