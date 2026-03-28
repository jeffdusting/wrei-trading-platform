import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import NavigationShell from '@/components/navigation/NavigationShell'
import { SimpleDemoProvider } from '@/components/demo/SimpleDemoProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'WREI Trading Platform | Water Roads',
  description: 'WREI carbon credit trading platform demonstration. Experience institutional-grade carbon credit trading with real-time blockchain verification and AI-powered negotiation.',
  keywords: 'carbon credits, blockchain, verification, trading, WREI, Water Roads, sustainability, ESG, dMRV',
  authors: [{ name: 'Water Roads Pty Ltd' }],
  creator: 'Water Roads Pty Ltd',
  publisher: 'Water Roads Pty Ltd',
  metadataBase: new URL('https://wrei-trading-platform.vercel.app'),
  openGraph: {
    title: 'WREI Trading Platform | Water Roads',
    description: 'Experience institutional-grade carbon credit trading with real-time blockchain verification',
    type: 'website',
    locale: 'en_AU',
    siteName: 'WREI Trading Platform',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'WREI Trading Platform | Water Roads',
    description: 'Experience institutional-grade carbon credit trading with real-time blockchain verification',
  },
  robots: {
    index: true,
    follow: true,
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SimpleDemoProvider>
          <NavigationShell>{children}</NavigationShell>
        </SimpleDemoProvider>
      </body>
    </html>
  )
}