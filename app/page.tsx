'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { WREI_TOKEN_CONFIG, PRICING_INDEX } from '@/lib/negotiation-config'

// Animated counter hook
function useAnimatedCounter(targetValue: number, duration: number = 2000) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let startTime: number
    let animationId: number

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime
      const progress = Math.min((currentTime - startTime) / duration, 1)

      setCount(Math.floor(progress * targetValue))

      if (progress < 1) {
        animationId = requestAnimationFrame(animate)
      }
    }

    animationId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationId)
  }, [targetValue, duration])

  return count
}

export default function Home() {
  // Animated stats
  const verifiedCredits = useAnimatedCounter(2847329)
  const avgSettlement = useAnimatedCounter(180)
  const jurisdictions = useAnimatedCounter(23)

  return (
    <div className="bg-gradient-to-br from-white via-slate-50 to-blue-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,#fff,rgba(255,255,255,0.6))] -z-10"></div>

        <div className="max-w-7xl mx-auto px-4 py-20 sm:py-32">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-bold text-[#1E293B] mb-8 leading-tight">
              WREI Carbon Credit
              <br />
              <span className="text-[#0EA5E9]">Trading Platform</span>
            </h1>

            <p className="text-xl md:text-2xl text-[#64748B] max-w-3xl mx-auto mb-12 leading-relaxed">
              Experience institutional-grade carbon credit trading with AI-powered negotiation,
              real-time blockchain verification, and automated settlement infrastructure.
            </p>

            {/* Animated Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-slate-200">
                <div className="text-3xl font-bold text-[#0EA5E9] mb-2">
                  {verifiedCredits.toLocaleString()}+
                </div>
                <div className="text-sm text-[#64748B]">Credits Verified</div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-slate-200">
                <div className="text-3xl font-bold text-[#10B981] mb-2">
                  &lt; {avgSettlement}s
                </div>
                <div className="text-sm text-[#64748B]">Avg Settlement</div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-slate-200">
                <div className="text-3xl font-bold text-[#F59E0B] mb-2">
                  {jurisdictions}
                </div>
                <div className="text-sm text-[#64748B]">Jurisdictions</div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/negotiate"
                className="inline-block bg-[#0EA5E9] text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-[#0284C7] transition-all shadow-lg hover:shadow-xl"
              >
                Begin Negotiation →
              </Link>
              <Link
                href="/institutional/portal"
                className="inline-block bg-white text-[#1E293B] px-8 py-4 rounded-lg text-lg font-semibold hover:bg-slate-50 transition-all shadow-sm border border-slate-200"
              >
                Institutional Portal
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Showcase */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#1E293B] mb-4">
              Comprehensive Trading Platform
            </h2>
            <p className="text-lg text-[#64748B] max-w-2xl mx-auto">
              Built for institutions, accessible to individuals, powered by cutting-edge technology
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* AI Negotiation */}
            <Link href="/negotiate" className="group">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl p-8 transition-all hover:shadow-lg border border-blue-200 group-hover:border-blue-300">
                <div className="w-12 h-12 bg-[#0EA5E9] rounded-lg flex items-center justify-center mb-6">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-[#1E293B] mb-3">AI Negotiation</h3>
                <p className="text-[#64748B] mb-4">
                  Advanced AI agent handles complex negotiations across 11 buyer personas with emotional intelligence
                </p>
                <span className="text-[#0EA5E9] font-semibold group-hover:underline">
                  Start Trading →
                </span>
              </div>
            </Link>

            {/* Institutional Portal */}
            <Link href="/institutional/portal" className="group">
              <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl p-8 transition-all hover:shadow-lg border border-green-200 group-hover:border-green-300">
                <div className="w-12 h-12 bg-[#10B981] rounded-lg flex items-center justify-center mb-6">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m5 0v-5a2 2 0 114 0v5M7 7h10" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-[#1E293B] mb-3">Institutional Portal</h3>
                <p className="text-[#64748B] mb-4">
                  Full onboarding pipeline with AFSL compliance, KYC/AML verification, and portfolio management
                </p>
                <span className="text-[#10B981] font-semibold group-hover:underline">
                  Enter Portal →
                </span>
              </div>
            </Link>

            {/* Scenario Simulation */}
            <Link href="/scenario" className="group">
              <div className="bg-gradient-to-br from-purple-50 to-violet-100 rounded-xl p-8 transition-all hover:shadow-lg border border-purple-200 group-hover:border-purple-300">
                <div className="w-12 h-12 bg-[#8B5CF6] rounded-lg flex items-center justify-center mb-6">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-[#1E293B] mb-3">Market Scenarios</h3>
                <p className="text-[#64748B] mb-4">
                  Explore DeFi, ESG mandates, infrastructure, and sovereign wealth fund scenarios
                </p>
                <span className="text-[#8B5CF6] font-semibold group-hover:underline">
                  Run Scenarios →
                </span>
              </div>
            </Link>

            {/* Market Intelligence */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-100 rounded-xl p-8 transition-all hover:shadow-lg border border-amber-200">
              <div className="w-12 h-12 bg-[#F59E0B] rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-[#1E293B] mb-3">Market Intelligence</h3>
              <p className="text-[#64748B] mb-4">
                Real-time pricing data, competitive analysis, and market trend forecasting
              </p>
              <span className="text-[#F59E0B] font-semibold">
                Integrated Analytics
              </span>
            </div>

            {/* Compliance Engine */}
            <div className="bg-gradient-to-br from-red-50 to-pink-100 rounded-xl p-8 transition-all hover:shadow-lg border border-red-200">
              <div className="w-12 h-12 bg-[#EF4444] rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-[#1E293B] mb-3">Regulatory Compliance</h3>
              <p className="text-[#64748B] mb-4">
                AFSL compliance, AML/CTF monitoring, and multi-jurisdiction regulatory framework
              </p>
              <span className="text-[#EF4444] font-semibold">
                Automated Compliance
              </span>
            </div>

            {/* Performance Monitoring */}
            <Link href="/performance" className="group">
              <div className="bg-gradient-to-br from-slate-50 to-gray-100 rounded-xl p-8 transition-all hover:shadow-lg border border-slate-200 group-hover:border-slate-300">
                <div className="w-12 h-12 bg-[#64748B] rounded-lg flex items-center justify-center mb-6">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-[#1E293B] mb-3">System Performance</h3>
                <p className="text-[#64748B] mb-4">
                  Real-time monitoring, API performance tracking, and system health dashboards
                </p>
                <span className="text-[#64748B] font-semibold group-hover:underline">
                  View Metrics →
                </span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Market Stats Section */}
      <section className="py-20 bg-[#1B2A4A] text-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Live Market Data
            </h2>
            <p className="text-lg text-slate-300 max-w-2xl mx-auto">
              Real-time pricing and market intelligence from WREI Pricing Index
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-[#0EA5E9] mb-2">
                A${PRICING_INDEX.VCM_SPOT_REFERENCE.toFixed(2)}
              </div>
              <div className="text-sm text-slate-300 mb-1">VCM Spot Reference</div>
              <div className="text-xs text-slate-400">EM SOVCM 2025</div>
            </div>

            <div className="text-center">
              <div className="text-3xl font-bold text-[#10B981] mb-2">
                A${PRICING_INDEX.FORWARD_REMOVAL_REFERENCE}
              </div>
              <div className="text-sm text-slate-300 mb-1">Forward Removal</div>
              <div className="text-xs text-slate-400">Sylvera SOCC 2025</div>
            </div>

            <div className="text-center">
              <div className="text-3xl font-bold text-[#F59E0B] mb-2">
                +{((PRICING_INDEX.DMRV_PREMIUM_BENCHMARK - 1) * 100).toFixed(0)}%
              </div>
              <div className="text-sm text-slate-300 mb-1">dMRV Premium</div>
              <div className="text-xs text-slate-400">Verification Advantage</div>
            </div>

            <div className="text-center">
              <div className="text-3xl font-bold text-[#8B5CF6] mb-2">
                T+0
              </div>
              <div className="text-sm text-slate-300 mb-1">Settlement</div>
              <div className="text-xs text-slate-400">Atomic & Non-Custodial</div>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Navigation */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#1E293B] mb-4">
              Choose Your Pathway
            </h2>
            <p className="text-lg text-[#64748B] max-w-2xl mx-auto">
              Different user types have different needs. Start with the pathway that matches your requirements.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Investor Pathway */}
            <div className="bg-white rounded-xl p-8 shadow-sm border border-slate-200 hover:shadow-lg transition-all">
              <div className="w-16 h-16 bg-gradient-to-br from-[#0EA5E9] to-[#0284C7] rounded-xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-[#1E293B] mb-4">Investor Pathway</h3>
              <p className="text-[#64748B] mb-6">
                For institutions and accredited investors seeking carbon credit exposure through tokenised assets
              </p>
              <ul className="text-sm text-[#64748B] space-y-2 mb-8">
                <li className="flex items-center">
                  <svg className="w-4 h-4 text-[#10B981] mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  AFSL compliance assessment
                </li>
                <li className="flex items-center">
                  <svg className="w-4 h-4 text-[#10B981] mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Portfolio allocation modelling
                </li>
                <li className="flex items-center">
                  <svg className="w-4 h-4 text-[#10B981] mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Risk-adjusted returns analysis
                </li>
              </ul>
              <Link
                href="/institutional/portal"
                className="block text-center bg-[#0EA5E9] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#0284C7] transition-colors"
              >
                Start Assessment
              </Link>
            </div>

            {/* Developer Pathway */}
            <div className="bg-white rounded-xl p-8 shadow-sm border border-slate-200 hover:shadow-lg transition-all">
              <div className="w-16 h-16 bg-gradient-to-br from-[#10B981] to-[#059669] rounded-xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-[#1E293B] mb-4">Developer Pathway</h3>
              <p className="text-[#64748B] mb-6">
                For technical teams building on WREI infrastructure or integrating tokenised carbon credits
              </p>
              <ul className="text-sm text-[#64748B] space-y-2 mb-8">
                <li className="flex items-center">
                  <svg className="w-4 h-4 text-[#10B981] mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  API documentation & SDKs
                </li>
                <li className="flex items-center">
                  <svg className="w-4 h-4 text-[#10B981] mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Blockchain integration guides
                </li>
                <li className="flex items-center">
                  <svg className="w-4 h-4 text-[#10B981] mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Settlement infrastructure
                </li>
              </ul>
              <div className="text-center bg-slate-100 text-[#64748B] px-6 py-3 rounded-lg font-semibold">
                Coming Soon
              </div>
            </div>

            {/* Compliance Pathway */}
            <div className="bg-white rounded-xl p-8 shadow-sm border border-slate-200 hover:shadow-lg transition-all">
              <div className="w-16 h-16 bg-gradient-to-br from-[#EF4444] to-[#DC2626] rounded-xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-[#1E293B] mb-4">Compliance Pathway</h3>
              <p className="text-[#64748B] mb-6">
                For compliance officers and legal teams assessing regulatory framework and requirements
              </p>
              <ul className="text-sm text-[#64748B] space-y-2 mb-8">
                <li className="flex items-center">
                  <svg className="w-4 h-4 text-[#10B981] mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Multi-jurisdiction framework
                </li>
                <li className="flex items-center">
                  <svg className="w-4 h-4 text-[#10B981] mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  AML/CTF compliance reporting
                </li>
                <li className="flex items-center">
                  <svg className="w-4 h-4 text-[#10B981] mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Tax treatment guidance
                </li>
              </ul>
              <div className="text-center bg-slate-100 text-[#64748B] px-6 py-3 rounded-lg font-semibold">
                Documentation Only
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Notice */}
      <section className="py-12 bg-amber-50 border-t-4 border-amber-200">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="inline-flex items-center bg-amber-100 text-amber-800 px-6 py-3 rounded-full mb-4">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <span className="font-semibold">Demonstration Environment</span>
          </div>
          <p className="text-amber-700 max-w-2xl mx-auto">
            This is a demonstration of the WREI platform capabilities. No real carbon credits are traded,
            and all negotiations are with AI agents. Real platform deployment requires institutional verification
            and regulatory compliance.
          </p>
        </div>
      </section>
    </div>
  )
}