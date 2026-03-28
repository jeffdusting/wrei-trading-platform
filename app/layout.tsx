import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import BloombergShell from '@/components/navigation/BloombergShell'
import { SimpleDemoProvider } from '@/components/demo/SimpleDemoProvider'

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
  title: 'WREI Platform | Bloomberg Terminal Interface',
  description: 'WREI carbon credit trading platform with institutional Bloomberg Terminal interface. Experience professional-grade carbon credit trading with real-time verification and AI-powered negotiation.',
  keywords: 'carbon credits, bloomberg terminal, institutional trading, verification, WREI, sustainability, ESG, dMRV',
  authors: [{ name: 'WREI Platform' }],
  creator: 'WREI Platform',
  publisher: 'WREI Platform',
  metadataBase: new URL('https://wrei-trading-platform.vercel.app'),
  openGraph: {
    title: 'WREI Platform | Bloomberg Terminal Interface',
    description: 'Experience institutional-grade carbon credit trading with Bloomberg Terminal interface',
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
          <BloombergShell>{children}</BloombergShell>
        </SimpleDemoProvider>
      </body>
    </html>
  )
}