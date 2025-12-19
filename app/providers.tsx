'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import { Toaster } from '@/components/ui/toaster'
import { CurrencyProvider } from '@/contexts/currency-context'
import { ThemeInitializer } from '@/components/theme-initializer'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      }),
  )

  return (
    <QueryClientProvider client={queryClient}>
      <CurrencyProvider>
        <ThemeInitializer />
        {children}
        <Toaster />
      </CurrencyProvider>
    </QueryClientProvider>
  )
}

