'use client'

import { FC, ReactNode, useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'

interface NavigationItem {
  label: string
  href: string
  description: string
  icon: string
}

const ENTERPRISE_NAVIGATION: NavigationItem[] = [
  { label: 'Dashboard', href: '/', description: 'Enterprise overview dashboard', icon: 'DSH' },
  { label: 'Origination', href: '/diagnostic', description: 'Pre-validation diagnostic engine', icon: 'ORG' },
  { label: 'Attribution', href: '/attribution', description: 'Energy cost attribution tool', icon: 'ATR' },
  { label: 'Pipeline', href: '/pipeline', description: 'Project pipeline management', icon: 'PIP' },
  { label: 'Intelligence', href: '/intelligence', description: 'Market intelligence and forecasts', icon: 'MKT' },
  { label: 'Compliance', href: '/portfolio', description: 'Entity compliance and portfolio', icon: 'CMP' },
]

// Downer branding constants
const DOWNER = {
  businessName: 'DOWNER',
  terminalCode: 'DW',
  primaryColour: '#003DA5',
  accentColour: '#00A9E0',
  primaryTextColour: '#FFFFFF',
  footerText: 'Downer Environmental Certificate Intelligence Platform',
}

interface EnterpriseShellProps {
  children: ReactNode
}

export const EnterpriseShell: FC<EnterpriseShellProps> = ({ children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [currentTime, setCurrentTime] = useState('')
  const pathname = usePathname()

  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(new Date().toLocaleTimeString('en-AU', { timeZone: 'Australia/Sydney' }) + ' AEDT')
    }
    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [])

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <div
      className="bloomberg-shell font-sans text-bloomberg-interface"
      style={{ backgroundColor: '#F8FAFC', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}
    >
      {/* Top Bar — 40px */}
      <div
        className="bloomberg-top-bar"
        style={{
          backgroundColor: DOWNER.primaryColour,
          borderBottom: '0.5px solid #3A3A3B',
          height: '40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          zIndex: 50,
        }}
      >
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div
              className="w-6 h-6 flex items-center justify-center bloomberg-small-text font-medium"
              style={{
                backgroundColor: DOWNER.accentColour,
                color: 'white',
                borderRadius: '4px',
              }}
            >
              {DOWNER.terminalCode}
            </div>
            <span className="bloomberg-section-label" style={{ color: DOWNER.primaryTextColour }}>
              {DOWNER.businessName}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#00C896' }} />
            <span className="bloomberg-small-text" style={{ color: '#B0B0B0' }}>
              ENTERPRISE
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span className="bloomberg-data bloomberg-small-text" style={{ color: '#B0B0B0' }}>
            {currentTime}
          </span>
        </div>
      </div>

      {/* Navigation Bar — 48px */}
      <nav
        className="bloomberg-navigation"
        style={{
          backgroundColor: '#FFFFFF',
          borderBottom: '0.5px solid #E2E8F0',
          height: '48px',
          display: 'flex',
          alignItems: 'center',
          padding: '0 24px',
          zIndex: 49,
        }}
      >
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-1">
            {ENTERPRISE_NAVIGATION.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  px-4 py-2 bloomberg-nav-item transition-all duration-200
                  border border-transparent hover:bg-slate-50
                  flex items-center gap-2
                  ${isActive(item.href)
                    ? 'text-blue-800'
                    : 'text-slate-700 hover:text-slate-900'
                  }
                `}
                style={{
                  borderRadius: '4px',
                  ...(isActive(item.href) ? {
                    backgroundColor: `${DOWNER.accentColour}15`,
                    borderColor: DOWNER.accentColour,
                    color: DOWNER.accentColour,
                  } : {}),
                }}
                title={item.description}
              >
                <span className="bloomberg-data bloomberg-small-text bg-slate-100 px-1 rounded">
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
            style={{ borderColor: '#E2E8F0', zIndex: 48 }}
          >
            <div className="p-4 space-y-2">
              {ENTERPRISE_NAVIGATION.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    block px-3 py-2 rounded bloomberg-nav-item transition-colors
                    ${isActive(item.href)
                      ? 'bg-blue-50 text-blue-800'
                      : 'text-slate-700 hover:bg-slate-50'
                    }
                  `}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <div className="flex items-center gap-2">
                    <span className="bloomberg-data bloomberg-small-text bg-slate-100 px-1 rounded">
                      {item.icon}
                    </span>
                    <div>
                      <div>{item.label}</div>
                      <div className="bloomberg-small-text text-slate-500">{item.description}</div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Main Content Area */}
      <main className="flex-1" style={{ backgroundColor: '#F8FAFC' }}>
        {children}
      </main>

      {/* Command Bar Footer — 36px */}
      <footer
        className="bloomberg-command-bar"
        style={{
          backgroundColor: DOWNER.primaryColour,
          borderTop: '0.5px solid #3A3A3B',
          height: '36px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
        }}
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: DOWNER.accentColour }} />
            <span className="bloomberg-small-text" style={{ color: '#B0B0B0' }}>READY</span>
          </div>
          <span className="bloomberg-command bloomberg-small-text" style={{ color: DOWNER.primaryTextColour }}>
            dw@enterprise:~$
          </span>
        </div>

        <span className="bloomberg-small-text" style={{ color: `${DOWNER.primaryTextColour}99` }}>
          {DOWNER.footerText} | Powered by WREI
        </span>
      </footer>
    </div>
  )
}

export default EnterpriseShell
