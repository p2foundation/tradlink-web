import {
  LayoutDashboard,
  Users,
  ShoppingBag,
  Handshake,
  FileText,
  DollarSign,
  Bell,
  TrendingUp,
  Shield,
  Package,
  Settings,
  BarChart3,
  Globe,
  Building2,
  Truck,
  CheckCircle2,
  AlertCircle,
  MessageSquareText,
} from 'lucide-react'
import { UserRole } from '@/types'

export interface NavItem {
  href: string
  label: string
  icon: any
  badge?: number
  children?: NavItem[]
}

export const getNavigationByRole = (role: UserRole): NavItem[] => {
  switch (role) {
    case UserRole.FARMER:
      return [
        { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/dashboard/listings', label: 'My Listings', icon: ShoppingBag },
        { href: '/dashboard/market-intelligence', label: 'Market Prices', icon: TrendingUp },
        { href: '/dashboard/matches', label: 'Buyer Matches', icon: Handshake },
        { href: '/dashboard/negotiations', label: 'Negotiations', icon: MessageSquareText },
        { href: '/dashboard/quality', label: 'Quality & Certificates', icon: Shield },
        { href: '/dashboard/transactions', label: 'My Sales', icon: FileText },
        { href: '/dashboard/documents', label: 'Documents', icon: FileText },
        { href: '/dashboard/finance', label: 'Finance', icon: DollarSign },
        { href: '/dashboard/notifications', label: 'Notifications', icon: Bell },
        { href: '/dashboard/settings', label: 'Settings', icon: Settings },
      ]

    case UserRole.BUYER:
      return [
        { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/dashboard/farmers', label: 'Discover Suppliers', icon: Users },
        { href: '/dashboard/quality', label: 'Quality Verification', icon: Shield },
        { href: '/dashboard/market-intelligence', label: 'Market Intelligence', icon: TrendingUp },
        { href: '/dashboard/matches', label: 'AI Matches', icon: Handshake },
        { href: '/dashboard/negotiations', label: 'Negotiations', icon: MessageSquareText },
        { href: '/dashboard/transactions', label: 'Orders', icon: FileText },
        { href: '/dashboard/compliance', label: 'Compliance', icon: CheckCircle2 },
        { href: '/dashboard/documents', label: 'Documents', icon: FileText },
        { href: '/dashboard/finance', label: 'Payments', icon: DollarSign },
        { href: '/dashboard/notifications', label: 'Notifications', icon: Bell },
        { href: '/dashboard/settings', label: 'Settings', icon: Settings },
      ]

    case UserRole.EXPORT_COMPANY:
      return [
        { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/dashboard/farmers', label: 'Supplier Network', icon: Users },
        { href: '/dashboard/listings', label: 'Order Management', icon: ShoppingBag },
        { href: '/dashboard/logistics', label: 'Logistics', icon: Truck },
        { href: '/dashboard/negotiations', label: 'Negotiations', icon: MessageSquareText },
        { href: '/dashboard/compliance', label: 'Compliance', icon: CheckCircle2 },
        { href: '/dashboard/quality', label: 'Quality Control', icon: Shield },
        { href: '/dashboard/finance', label: 'Finance', icon: DollarSign },
        { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart3 },
        { href: '/dashboard/documents', label: 'Documents', icon: FileText },
        { href: '/dashboard/notifications', label: 'Notifications', icon: Bell },
        { href: '/dashboard/settings', label: 'Settings', icon: Settings },
      ]

    case UserRole.ADMIN:
      return [
        { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/dashboard/analytics', label: 'Platform Analytics', icon: BarChart3 },
        { href: '/dashboard/users', label: 'User Management', icon: Users },
        { href: '/dashboard/negotiations', label: 'Negotiations', icon: MessageSquareText },
        { href: '/dashboard/compliance-monitoring', label: 'Compliance Monitoring', icon: AlertCircle },
        { href: '/dashboard/integrations', label: 'Integration Management', icon: Globe },
        { href: '/dashboard/policy', label: 'Policy Management', icon: Settings },
        { href: '/dashboard/reports', label: 'Reports', icon: FileText },
        { href: '/dashboard/system', label: 'System Configuration', icon: Settings },
        { href: '/dashboard/notifications', label: 'Notifications', icon: Bell },
        { href: '/dashboard/settings', label: 'Settings', icon: Settings },
      ]

    default:
      return [
        { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/dashboard/notifications', label: 'Notifications', icon: Bell },
      ]
  }
}

export const getDashboardTitle = (role: UserRole): string => {
  switch (role) {
    case UserRole.FARMER:
      return 'Farmer Dashboard'
    case UserRole.BUYER:
      return 'Buyer Dashboard'
    case UserRole.EXPORT_COMPANY:
      return 'Export Company Dashboard'
    case UserRole.ADMIN:
      return 'Admin Dashboard'
    default:
      return 'Dashboard'
  }
}

export const getDashboardDescription = (role: UserRole): string => {
  switch (role) {
    case UserRole.FARMER:
      return 'Manage your listings, track market prices, and connect with international buyers'
    case UserRole.BUYER:
      return 'Discover verified suppliers, verify quality, and manage your procurement'
    case UserRole.EXPORT_COMPANY:
      return 'Manage your supplier network, orders, and logistics operations'
    case UserRole.ADMIN:
      return 'Platform oversight, analytics, and system management'
    default:
      return 'Welcome to TradeLink+'
  }
}

