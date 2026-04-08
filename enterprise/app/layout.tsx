import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { EnterpriseShell } from '@enterprise/components/EnterpriseShell'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  weight: ['400', '500'],
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  weight: ['400', '500'],
})

export const metadata: Metadata = {
  title: 'Downer Environmental Certificate Intelligence Platform',
  description: 'Enterprise environmental certificate intelligence — pre-validation diagnostics, cost attribution, pipeline management, and compliance tracking.',
  authors: [{ name: 'Water Roads Pty Ltd' }],
  creator: 'Water Roads Pty Ltd',
  robots: { index: false, follow: false },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-AU">
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}>
        <EnterpriseShell>
          {children}
        </EnterpriseShell>
      </body>
    </html>
  )
}
