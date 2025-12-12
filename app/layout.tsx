import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { LoadingBar } from '@/components/ui/loading-bar'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'TradeLink+ - AI-Driven MSME Export Platform',
  description: 'Connecting smallholder farmers with international buyers',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className} suppressHydrationWarning>
        <Providers>
          <LoadingBar />
          {children}
        </Providers>
      </body>
    </html>
  )
}

