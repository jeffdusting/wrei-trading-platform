'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { MarketTicker } from '../market'

interface NavigationItem {
  label: string
  href: string
  description: string
}

const navigationItems: NavigationItem[] = [
  { label: 'Home', href: '/', description: 'Water Roads WREI Platform' },
  { label: 'Negotiate', href: '/negotiate', description: 'AI Carbon Credit Trading' },
  { label: 'Calculator', href: '/calculator', description: 'Investment Calculator' },
  { label: 'Institutional', href: '/institutional/portal', description: 'Institutional Onboarding' },
  { label: 'Compliance', href: '/compliance', description: 'Regulatory Compliance Map' },
  { label: 'Scenarios', href: '/scenario', description: 'Market Scenarios' },
  { label: 'Performance', href: '/performance', description: 'System Performance' },
  { label: 'Developers', href: '/developer', description: 'API Explorer & Documentation' }
]

export default function NavigationShell({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/'
    }
    return pathname.startsWith(href)
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation Header */}
      <nav className="bg-[#1B2A4A] shadow-lg sticky top-0 z-50">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">

            {/* Logo and Brand */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-[#0EA5E9] rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">WR</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-white font-semibold text-lg">Water Roads</span>
                  <span className="text-slate-300 text-xs">WREI Carbon Platform</span>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center space-x-8">
              {navigationItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                    isActive(item.href)
                      ? 'bg-[#0EA5E9] text-white'
                      : 'text-slate-300 hover:text-white hover:bg-slate-700'
                  }`}
                  title={item.description}
                >
                  {item.label}
                </Link>
              ))}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-slate-300 hover:text-white focus:outline-none focus:text-white p-2"
                aria-label="Toggle mobile menu"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {mobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Navigation Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden">
              <div className="px-2 pt-2 pb-3 space-y-1 bg-[#1B2A4A] border-t border-slate-600">
                {navigationItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                      isActive(item.href)
                        ? 'bg-[#0EA5E9] text-white'
                        : 'text-slate-300 hover:text-white hover:bg-slate-700'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <div>
                      <div>{item.label}</div>
                      <div className="text-sm text-slate-400">{item.description}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Market Ticker */}
      <MarketTicker
        updateInterval={5000}
        showDetails={true}
        className="sticky top-16 z-40"
      />

      {/* Page Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-[#1B2A4A] text-slate-300 py-8">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-sm">
              © 2026 Water Roads. WREI Platform powered by Claude AI.
            </p>
            <p className="text-xs mt-2 text-slate-400">
              Institutional-grade carbon credit tokenisation and trading platform
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}