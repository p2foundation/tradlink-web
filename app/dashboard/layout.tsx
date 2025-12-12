'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  LayoutDashboard,
  Users,
  ShoppingBag,
  Handshake,
  FileText,
  LogOut,
  Menu,
  X,
  DollarSign,
  Bell,
  TrendingUp,
  Shield,
  Package,
  Settings,
} from 'lucide-react'
import { getNavigationByRole, getDashboardTitle, getDashboardDescription } from '@/lib/role-navigation'
import { UserRole } from '@/types'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<any>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    const token = localStorage.getItem('accessToken')

    if (!token || !storedUser) {
      router.push('/login')
      return
    }

    setUser(JSON.parse(storedUser))
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
    // Use startTransition for smoother navigation
    router.push('/login')
  }

  // Get role-based navigation
  const userRole = user?.role as UserRole
  const navItems = userRole ? getNavigationByRole(userRole) : []

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-950 text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Mobile header */}
      <div className="lg:hidden bg-slate-900/80 border-b border-white/10 px-4 py-3 flex items-center justify-between shadow-sm backdrop-blur">
        <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-emerald-400 bg-clip-text text-transparent">
          TradeLink+
        </h1>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            onClick={() => router.push('/dashboard/notifications')}
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside
          className={`${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:translate-x-0 fixed lg:sticky lg:top-0 lg:h-screen inset-y-0 left-0 z-50 w-64 bg-slate-900/90 border-r border-white/10 transform transition-transform duration-200 ease-in-out shadow-2xl backdrop-blur`}
        >
          <div className="h-full flex flex-col">
            <div className="p-6 border-b border-white/10">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-emerald-400 bg-clip-text text-transparent">
                TradeLink+
              </h1>
              <p className="text-sm text-slate-200/70 mt-1">MSME Export Platform</p>
              {user && (
                <div className="mt-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-primary/20 text-primary border border-primary/30">
                    {user.role?.replace('_', ' ')}
                  </span>
                </div>
              )}
            </div>
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto scrollbar-hide">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-all ${
                      isActive
                        ? 'bg-primary text-white shadow-glow'
                        : 'text-slate-200 hover:bg-white/5'
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                )
              })}
            </nav>
            <div className="p-4 border-t border-white/10">
              <div className="px-4 py-2 mb-2">
                <p className="text-sm font-medium text-white">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-xs text-slate-300">{user.email}</p>
              </div>
              <div className="space-y-1">
                <Link
                  href="/dashboard/settings"
                  className="flex items-center space-x-3 px-4 py-2 rounded-lg text-slate-200 hover:bg-white/5 transition-all w-full"
                  onClick={() => setSidebarOpen(false)}
                >
                  <Settings className="h-4 w-4" />
                  <span className="font-medium text-sm">Settings</span>
                </Link>
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-h-screen overflow-y-auto bg-slate-950">
          <div className="relative min-h-screen overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-950 to-black" />
            <div className="relative p-4 sm:p-6 text-slate-100">
              <div className="pb-16">{children}</div>
            </div>
          </div>
        </main>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}

