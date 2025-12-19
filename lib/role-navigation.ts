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
  FileCheck,
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
        { href: '/dashboard/verification', label: 'Export Verification', icon: Shield },
        { href: '/dashboard/customs-clearance', label: 'Customs Clearance', icon: FileCheck },
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
        { href: '/dashboard/onboarding', label: 'Onboarding', icon: CheckCircle2 },
        { href: '/dashboard/farmers', label: 'Discover Suppliers', icon: Users },
        { href: '/dashboard/quality', label: 'Quality Verification', icon: Shield },
        { href: '/dashboard/market-intelligence', label: 'Market Intelligence', icon: TrendingUp },
        { href: '/dashboard/matches', label: 'AI Matches', icon: Handshake },
        { href: '/dashboard/negotiations', label: 'Negotiations', icon: MessageSquareText },
        { href: '/dashboard/transactions', label: 'Orders', icon: FileText },
        { href: '/dashboard/compliance', label: 'Compliance', icon: CheckCircle2 },
        { href: '/dashboard/customs-clearance', label: 'Customs Clearance', icon: FileCheck },
        { href: '/dashboard/documents', label: 'Documents', icon: FileText },
        { href: '/dashboard/finance', label: 'Payments', icon: DollarSign },
        { href: '/dashboard/notifications', label: 'Notifications', icon: Bell },
        { href: '/dashboard/settings', label: 'Settings', icon: Settings },
      ]

    case UserRole.EXPORT_COMPANY:
      return [
        { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/dashboard/supplier-network', label: 'Supplier Network', icon: Users },
        { href: '/dashboard/bulk-procurement', label: 'Bulk Procurement', icon: ShoppingBag },
        { href: '/dashboard/logistics', label: 'Logistics', icon: Truck },
        { href: '/dashboard/negotiations', label: 'Negotiations', icon: MessageSquareText },
        { href: '/dashboard/compliance', label: 'Compliance', icon: CheckCircle2 },
        { href: '/dashboard/customs-clearance', label: 'Customs Clearance', icon: FileCheck },
        { href: '/dashboard/quality', label: 'Quality Control', icon: Shield },
        { href: '/dashboard/finance', label: 'Finance', icon: DollarSign },
        { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart3 },
        { href: '/dashboard/documents', label: 'Documents', icon: FileText },
        { href: '/dashboard/notifications', label: 'Notifications', icon: Bell },
        { href: '/dashboard/settings', label: 'Settings', icon: Settings },
      ]

    case UserRole.TRADER:
      return [
        { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/dashboard/farmers', label: 'Suppliers', icon: Users },
        { href: '/dashboard/matches', label: 'Trade Opportunities', icon: Handshake },
        { href: '/dashboard/negotiations', label: 'Negotiations', icon: MessageSquareText },
        { href: '/dashboard/transactions', label: 'Transactions', icon: FileText },
        { href: '/dashboard/verification', label: 'Export Verification', icon: Shield },
        { href: '/dashboard/customs-clearance', label: 'Customs Clearance', icon: FileCheck },
        { href: '/dashboard/compliance', label: 'Compliance', icon: CheckCircle2 },
        { href: '/dashboard/documents', label: 'Documents', icon: FileText },
        { href: '/dashboard/finance', label: 'Finance', icon: DollarSign },
        { href: '/dashboard/notifications', label: 'Notifications', icon: Bell },
        { href: '/dashboard/settings', label: 'Settings', icon: Settings },
      ]

    case UserRole.LOGISTICS_PROVIDER:
      return [
        { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/dashboard/logistics', label: 'Shipments', icon: Truck },
        { href: '/dashboard/transactions', label: 'Orders', icon: FileText },
        { href: '/dashboard/compliance', label: 'Compliance', icon: CheckCircle2 },
        { href: '/dashboard/documents', label: 'Documents', icon: FileText },
        { href: '/dashboard/finance', label: 'Payments', icon: DollarSign },
        { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart3 },
        { href: '/dashboard/notifications', label: 'Notifications', icon: Bell },
        { href: '/dashboard/settings', label: 'Settings', icon: Settings },
      ]

    case UserRole.CUSTOMS_BROKER:
      return [
        { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/dashboard/transactions', label: 'Clearance Requests', icon: FileText },
        { href: '/dashboard/compliance', label: 'Compliance', icon: CheckCircle2 },
        { href: '/dashboard/documents', label: 'Documents', icon: FileText },
        { href: '/dashboard/finance', label: 'Payments', icon: DollarSign },
        { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart3 },
        { href: '/dashboard/notifications', label: 'Notifications', icon: Bell },
        { href: '/dashboard/settings', label: 'Settings', icon: Settings },
      ]

    case UserRole.QUALITY_ASSURANCE:
      return [
        { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/dashboard/quality', label: 'Quality Tests', icon: Shield },
        { href: '/dashboard/transactions', label: 'Test Requests', icon: FileText },
        { href: '/dashboard/documents', label: 'Certificates', icon: FileText },
        { href: '/dashboard/compliance', label: 'Standards', icon: CheckCircle2 },
        { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart3 },
        { href: '/dashboard/notifications', label: 'Notifications', icon: Bell },
        { href: '/dashboard/settings', label: 'Settings', icon: Settings },
      ]

    case UserRole.FINANCIAL_INSTITUTION:
      return [
        { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/dashboard/finance', label: 'Trade Finance', icon: DollarSign },
        { href: '/dashboard/transactions', label: 'Transactions', icon: FileText },
        { href: '/dashboard/compliance', label: 'Compliance', icon: CheckCircle2 },
        { href: '/dashboard/documents', label: 'Documents', icon: FileText },
        { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart3 },
        { href: '/dashboard/notifications', label: 'Notifications', icon: Bell },
        { href: '/dashboard/settings', label: 'Settings', icon: Settings },
      ]

    case UserRole.AGRIBUSINESS:
      return [
        { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/dashboard/listings', label: 'Products', icon: ShoppingBag },
        { href: '/dashboard/farmers', label: 'Suppliers', icon: Users },
        { href: '/dashboard/transactions', label: 'Orders', icon: FileText },
        { href: '/dashboard/quality', label: 'Quality Control', icon: Shield },
        { href: '/dashboard/compliance', label: 'Compliance', icon: CheckCircle2 },
        { href: '/dashboard/finance', label: 'Finance', icon: DollarSign },
        { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart3 },
        { href: '/dashboard/notifications', label: 'Notifications', icon: Bell },
        { href: '/dashboard/settings', label: 'Settings', icon: Settings },
      ]

    case UserRole.GOVERNMENT_OFFICIAL:
      return [
        { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/dashboard/government', label: 'Government Dashboard', icon: BarChart3 },
        { href: '/dashboard/compliance-monitoring', label: 'Compliance Monitoring', icon: AlertCircle },
        { href: '/dashboard/transactions', label: 'Trade Records', icon: FileText },
        { href: '/dashboard/documents', label: 'Document Review', icon: FileText },
        { href: '/dashboard/analytics', label: 'Trade Analytics', icon: BarChart3 },
        { href: '/dashboard/users', label: 'User Verification', icon: Users },
        { href: '/dashboard/reports', label: 'Reports', icon: FileText },
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
        { href: '/dashboard/settings', label: 'Settings', icon: Settings },
      ]
  }
}

export const getDashboardTitle = (role: UserRole): string => {
  switch (role) {
    case UserRole.FARMER:
      return 'Producer Dashboard'
    case UserRole.BUYER:
      return 'Buyer Dashboard'
    case UserRole.EXPORT_COMPANY:
      return 'Export Company Dashboard'
    case UserRole.TRADER:
      return 'Trader Dashboard'
    case UserRole.LOGISTICS_PROVIDER:
      return 'Logistics Dashboard'
    case UserRole.CUSTOMS_BROKER:
      return 'Customs Broker Dashboard'
    case UserRole.QUALITY_ASSURANCE:
      return 'Quality Assurance Dashboard'
    case UserRole.FINANCIAL_INSTITUTION:
      return 'Financial Services Dashboard'
    case UserRole.GOVERNMENT_OFFICIAL:
      return 'Regulatory Dashboard'
    case UserRole.AGRIBUSINESS:
      return 'Agribusiness Dashboard'
    case UserRole.ADMIN:
      return 'Admin Dashboard'
    default:
      return 'TradeLink+ Dashboard'
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
    case UserRole.TRADER:
      return 'Facilitate trade, connect buyers and sellers, and manage transactions'
    case UserRole.LOGISTICS_PROVIDER:
      return 'Manage shipments, track deliveries, and coordinate transportation'
    case UserRole.CUSTOMS_BROKER:
      return 'Handle customs clearance, documentation, and compliance services'
    case UserRole.QUALITY_ASSURANCE:
      return 'Manage testing, certification, and quality verification services'
    case UserRole.FINANCIAL_INSTITUTION:
      return 'Provide trade finance, payment processing, and banking services'
    case UserRole.GOVERNMENT_OFFICIAL:
      return 'Monitor compliance, review documentation, and manage regulatory oversight'
    case UserRole.AGRIBUSINESS:
      return 'Manage processing, manufacturing, and value addition operations'
    case UserRole.ADMIN:
      return 'Platform oversight, analytics, and system management'
    default:
      return 'Welcome to TradeLink+ - Ghana\'s comprehensive trade platform'
  }
}

