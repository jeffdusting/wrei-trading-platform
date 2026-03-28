'use client'

import { FC, ReactNode, useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { useDesignTokens } from '@/design-system/tokens/professional-tokens'
import { MarketTicker } from '@/components/market'
import SimpleDemoToggle from '@/components/demo/SimpleDemoToggle'
import { useSimpleDemoMode } from '@/components/demo/SimpleDemoProvider'

interface NavigationItem {
  label: string
  href: string
  description: string
  icon?: string
}

// Consolidated navigation from 9 to 6 items as per Bloomberg Terminal layout
const navigationItems: NavigationItem[] = [
  { label: 'Trading', href: '/negotiate', description: 'AI Carbon Credit Trading', icon: 'TRD' },
  { label: 'Analytics', href: '/calculator', description: 'Investment Calculator & Analysis', icon: 'ANA' },
  { label: 'Market', href: '/performance', description: 'Market Data & Monitoring', icon: 'MKT' },
  { label: 'Portfolio', href: '/scenario', description: 'Scenario Analysis', icon: 'PRT' },
  { label: 'Compliance', href: '/compliance', description: 'Regulatory Oversight', icon: 'CMP' },
  { label: 'System', href: '/developer', description: 'Developer Access & Institutional', icon: 'SYS' }
]

interface BloombergShellProps {
  children: ReactNode
}

export const BloombergShell: FC<BloombergShellProps> = ({ children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const { isActive: isDemoActive } = useSimpleDemoMode()
  const tokens = useDesignTokens('retail') // Use retail theme for light mode

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/'
    }
    return pathname.startsWith(href)
  }

  // Bloomberg Terminal styling with light theme adaptation
  const shellStyles = {
    backgroundColor: tokens.colors.surface.lightGrey,
    fontFamily: tokens.typography.families.interface,
    color: tokens.colors.text.primary,
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column' as const
  }

  const topBarStyles = {
    backgroundColor: tokens.colors.surface.secondary,
    borderBottom: `0.5px solid ${tokens.colors.surface.tertiary}`,
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: `0 ${tokens.spacing[6]}`,
    zIndex: 50,
    fontSize: tokens.typography.sizes.sm
  }

  const navigationBarStyles = {
    backgroundColor: tokens.colors.surface.white,
    borderBottom: `0.5px solid ${tokens.colors.surface.tertiary}`,
    height: '48px',
    display: 'flex',
    alignItems: 'center',
    padding: `0 ${tokens.spacing[6]}`,
    zIndex: 49
  }

  const commandBarStyles = {
    backgroundColor: tokens.colors.surface.secondary,
    borderTop: `0.5px solid ${tokens.colors.surface.tertiary}`,
    height: '36px',
    display: 'flex',
    alignItems: 'center',
    padding: `0 ${tokens.spacing[6]}`,
    fontSize: tokens.typography.sizes.xs,
    fontFamily: tokens.typography.families.financial
  }

  return (
    <div style={shellStyles} className="bloomberg-shell">
      {/* Bloomberg Terminal Top Bar - 40px */}
      <div style={topBarStyles} className="bloomberg-top-bar">
        <div className="flex items-center gap-6">
          {/* WREI Terminal Identifier */}
          <div className="flex items-center gap-3">
            <div
              className="w-6 h-6 flex items-center justify-center text-xs font-bold"
              style={{
                backgroundColor: tokens.colors.accent.info,
                color: 'white',
                borderRadius: tokens.borderRadius.sm
              }}
            >
              WR
            </div>
            <span
              style={{
                fontWeight: tokens.typography.weights.bold,
                color: tokens.colors.text.primary
              }}
            >
              WREI PLATFORM
            </span>
          </div>

          {/* System Status */}
          <div className="flex items-center gap-2">
            <div
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: tokens.colors.status.online
              }}
            />
            <span style={{ color: tokens.colors.text.secondary, fontSize: tokens.typography.sizes.xs }}>
              SYSTEM ONLINE
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Demo Mode Toggle - Terminal Style */}
          <SimpleDemoToggle />

          {/* System Time */}
          <span
            style={{
              fontFamily: tokens.typography.families.financial,
              color: tokens.colors.text.secondary
            }}
          >
            {new Date().toLocaleTimeString()} AEDT
          </span>
        </div>
      </div>

      {/* Market Ticker Integration - Custom Styling for Bloomberg */}
      <MarketTicker
        updateInterval={5000}
        showDetails={true}
        className="sticky z-40"
      />

      {/* Bloomberg Navigation Bar - 48px */}
      <nav style={navigationBarStyles} className="bloomberg-navigation">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-1">
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  px-4 py-2 text-sm font-medium transition-all duration-200
                  border border-transparent hover:bg-slate-50
                  flex items-center gap-2
                  ${isActive(item.href)
                    ? 'bg-blue-50 border-blue-200 text-blue-800'
                    : 'text-slate-700 hover:text-slate-900'
                  }
                `}
                style={{
                  borderRadius: tokens.borderRadius.sm,
                  fontFamily: tokens.typography.families.interface
                }}
                title={item.description}
              >
                {/* Terminal-style icon */}
                <span
                  className="text-xs font-mono bg-slate-100 px-1 rounded"
                  style={{
                    fontFamily: tokens.typography.families.financial,
                    fontSize: '10px'
                  }}
                >
                  {item.icon}
                </span>
                {item.label}
              </Link>
            ))}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-slate-600 hover:text-slate-900"
            aria-label="Toggle mobile menu"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div
            className="lg:hidden absolute top-full left-0 right-0 bg-white border-b shadow-lg"
            style={{
              borderColor: tokens.colors.surface.tertiary,
              zIndex: 48
            }}
          >
            <div className="p-4 space-y-2">
              {navigationItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    block px-3 py-2 rounded text-sm font-medium transition-colors
                    ${isActive(item.href)
                      ? 'bg-blue-50 text-blue-800'
                      : 'text-slate-700 hover:bg-slate-50'
                    }
                  `}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="text-xs font-mono bg-slate-100 px-1 rounded"
                      style={{ fontFamily: tokens.typography.families.financial }}
                    >
                      {item.icon}
                    </span>
                    <div>
                      <div>{item.label}</div>
                      <div className="text-xs text-slate-500">{item.description}</div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Main Content Area */}
      <main
        className="flex-1"
        style={{ backgroundColor: tokens.colors.surface.lightGrey }}
      >
        {children}
      </main>

      {/* Bloomberg Command Bar Footer - 36px */}
      <footer style={commandBarStyles} className="bloomberg-command-bar">
        <div className="flex items-center gap-3">
          {/* Green prompt indicator */}
          <div className="flex items-center gap-2">
            <div
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: tokens.colors.status.online
              }}
            />
            <span style={{ color: tokens.colors.text.secondary }}>
              READY
            </span>
          </div>

          {/* Command prompt styling */}
          <span style={{ color: tokens.colors.text.secondary }}>
            wrei@platform:~$
          </span>
        </div>

        <div className="flex items-center gap-4">
          {/* Compliance Notice */}
          <span style={{ color: tokens.colors.text.tertiary }}>
            © 2026 WREI Platform | Institutional-grade carbon credit tokenisation
          </span>

          {/* Connection Status */}
          <div className="flex items-center gap-2">
            <span style={{ color: tokens.colors.text.tertiary }}>
              MARKET DATA
            </span>
            <div
              style={{
                width: '4px',
                height: '4px',
                borderRadius: '50%',
                backgroundColor: tokens.colors.status.online
              }}
            />
          </div>
        </div>
      </footer>
    </div>
  )
}

export default BloombergShell