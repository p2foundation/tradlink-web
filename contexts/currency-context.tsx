'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export type Currency = {
  code: string
  name: string
  symbol: string
  flag?: string
}

export const CURRENCIES: Currency[] = [
  { code: 'GHS', name: 'Ghana Cedi', symbol: '₵', flag: '🇬🇭' },
  { code: 'USD', name: 'US Dollar', symbol: '$', flag: '🇺🇸' },
  { code: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺' },
  { code: 'GBP', name: 'British Pound', symbol: '£', flag: '🇬🇧' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', flag: '🇨🇳' },
  { code: 'KES', name: 'Kenyan Shilling', symbol: 'KSh', flag: '🇰🇪' },
  { code: 'RWF', name: 'Rwandan Franc', symbol: 'RF', flag: '🇷🇼' },
]

interface CurrencyContextType {
  currency: Currency
  setCurrency: (currency: Currency) => void
  formatCurrency: (amount: number) => string
  convertCurrency: (amount: number, fromCurrency: string, toCurrency: string) => number
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined)

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>(CURRENCIES[0]) // Default to GHS

  useEffect(() => {
    // Load saved currency preference
    const savedCurrency = localStorage.getItem('preferredCurrency')
    if (savedCurrency) {
      const parsed = JSON.parse(savedCurrency)
      const found = CURRENCIES.find((c) => c.code === parsed.code)
      if (found) {
        setCurrencyState(found)
      }
    }
  }, [])

  const setCurrency = (newCurrency: Currency) => {
    setCurrencyState(newCurrency)
    localStorage.setItem('preferredCurrency', JSON.stringify(newCurrency))
  }

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: currency.code,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  // Simple conversion (in production, this would fetch real-time rates)
  const convertCurrency = (amount: number, fromCurrency: string, toCurrency: string): number => {
    // Mock exchange rates (in production, fetch from API)
    const rates: Record<string, number> = {
      GHS: 1,
      USD: 0.08, // 1 GHS = 0.08 USD (approximate)
      EUR: 0.07,
      GBP: 0.06,
      CNY: 0.58,
      KES: 10.5,
      RWF: 95,
    }

    if (fromCurrency === toCurrency) return amount
    const fromRate = rates[fromCurrency] || 1
    const toRate = rates[toCurrency] || 1
    return (amount * toRate) / fromRate
  }

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatCurrency, convertCurrency }}>
      {children}
    </CurrencyContext.Provider>
  )
}

export function useCurrency() {
  const context = useContext(CurrencyContext)
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider')
  }
  return context
}

