import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import { Suspense } from 'react'
import './globals.css'
import BloombergShell from '@/components/navigation/BloombergShell'
import { SimpleDemoProvider } from '@/components/demo/SimpleDemoProvider'
import { WhiteLabelProvider } from '@/components/branding/WhiteLabelProvider'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  weight: ['400', '500']
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  weight: ['400', '500']
})

export const metadata: Metadata = {
  title: 'WREI Trading Platform',
  description: 'WREI energy saving certificate, carbon credit, and tokenised asset trading platform. Experience professional-grade carbon credit trading with real-time verification and AI-powered negotiation.',
  keywords: 'carbon credits, energy savings scheme, institutional trading, verification, WREI, sustainability, ESG, dMRV',
  authors: [{ name: 'Water Roads Pty Ltd' }],
  creator: 'Water Roads Pty Ltd',
  publisher: 'Water Roads Pty Ltd',
  metadataBase: new URL('https://wrei.cbslab.app'),
  openGraph: {
    title: 'WREI Trading Platform',
    description: 'Experience institutional-grade carbon credit trading',
    type: 'website',
    locale: 'en_AU',
    siteName: 'WREI Platform',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'WREI Platform | Bloomberg Terminal Interface',
    description: 'Experience institutional-grade carbon credit trading with Bloomberg Terminal interface',
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
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans`}>
        <SimpleDemoProvider>
          <Suspense>
            <WhiteLabelProvider>
              <BloombergShell>{children}</BloombergShell>
            </WhiteLabelProvider>
          </Suspense>
        </SimpleDemoProvider>
      </body>
    </html>
  )
}