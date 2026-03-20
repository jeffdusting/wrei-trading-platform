import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-slate-50">
      {/* Header */}
      <header className="bg-[#1B2A4A] shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="text-white text-xl font-bold">Water Roads</div>
            <div className="text-[#0EA5E9] text-xl font-bold">WREI</div>
          </div>
          <div className="text-white/70 text-sm">Demonstration Environment</div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-[#1E293B] mb-6">
            WREI Carbon Credit Trading Platform
          </h1>
          <h2 className="text-xl text-[#64748B] mb-8">
            Demonstration Environment
          </h2>
          <p className="text-lg text-[#64748B] max-w-2xl mx-auto mb-12 leading-relaxed">
            This demonstration showcases WREI&apos;s AI-powered carbon credit negotiation platform.
            Experience institutional-grade carbon credit trading with real-time blockchain verification,
            advanced compliance systems, and automated settlement infrastructure.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 text-center">
            <div className="text-3xl mb-4">🛡️</div>
            <h3 className="text-xl font-semibold text-[#1E293B] mb-3">Blockchain Verified</h3>
            <p className="text-[#64748B] text-sm">
              Real-time blockchain verification via WREI verification engine with triple-standard compliance
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 text-center">
            <div className="text-3xl mb-4">💬</div>
            <h3 className="text-xl font-semibold text-[#1E293B] mb-3">AI-Powered Negotiation</h3>
            <p className="text-[#64748B] text-sm">
              Sophisticated AI agent handles complex negotiations with human buyers across multiple personas
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 text-center">
            <div className="text-3xl mb-4">🏢</div>
            <h3 className="text-xl font-semibold text-[#1E293B] mb-3">Institutional Grade</h3>
            <p className="text-[#64748B] text-sm">
              T+0 atomic settlement, regulatory compliance, and institutional-grade tokenisation infrastructure
            </p>
          </div>
        </div>

        {/* CTA Button */}
        <div className="text-center">
          <Link
            href="/negotiate"
            className="inline-block bg-[#0EA5E9] text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-[#0284C7] transition-colors shadow-sm"
          >
            Begin Negotiation →
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#F8FAFC] border-t border-slate-200 mt-16">
        <div className="max-w-6xl mx-auto px-4 py-8 text-center text-[#64748B] text-sm">
          Water Roads Pty Ltd | WREI Verified Carbon Credits | Demonstration Environment — No real credits are traded
        </div>
      </footer>
    </div>
  );
}