'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import ClientIntelligencePage from '@/components/intelligence/ClientIntelligencePage'

/**
 * Public client-facing ESC market intelligence page.
 *
 * White-label branding is resolved from the `broker` URL parameter
 * (e.g. /client-intelligence?broker=nmg).
 *
 * Market intelligence sections are public (no auth required).
 * Client-specific sections (position, shortfall) require auth.
 */

function ClientIntelligenceContent() {
  const searchParams = useSearchParams()
  const broker = searchParams.get('broker') ?? undefined

  return <ClientIntelligencePage broker={broker} />
}

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="text-sm text-slate-500">Loading market intelligence...</div>
        </div>
      }
    >
      <ClientIntelligenceContent />
    </Suspense>
  )
}
