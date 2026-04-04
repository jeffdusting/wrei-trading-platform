/**
 * Token Detail Panel Component
 *
 * Displays token metadata for WREI-CC (Carbon Credit) and WREI-ACO (Asset Co) tokens
 * Bloomberg Terminal-style institutional interface with data-dense layout
 */

'use client';

import React from 'react';

interface TokenDetailPanelProps {
  tokenType: 'WREI_CC' | 'WREI_ACO';
  className?: string;
}

/* ─── Shared sub-components ─────────────────────────────────────── */

const Badge: React.FC<{ label: string; variant?: 'default' | 'green' | 'amber' | 'blue' }> = ({
  label,
  variant = 'default',
}) => {
  const colours: Record<string, string> = {
    default: 'bg-slate-100 text-slate-700 border-slate-200',
    green: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    blue: 'bg-sky-50 text-sky-700 border-sky-200',
  };
  return (
    <span className={`bloomberg-small-text inline-block px-1.5 py-0.5 rounded border ${colours[variant]}`}>
      {label}
    </span>
  );
};

const SectionLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h3 className="bloomberg-section-label mb-1">{children}</h3>
);

const DataRow: React.FC<{ label: string; value: React.ReactNode; valueClass?: string }> = ({
  label,
  value,
  valueClass = 'bloomberg-data text-slate-900',
}) => (
  <div className="flex justify-between items-baseline py-0.5">
    <span className="bloomberg-small-text text-slate-500">{label}</span>
    <span className={valueClass}>{value}</span>
  </div>
);

/* ─── Lifecycle stepper (WREI-CC) ───────────────────────────────── */

const LIFECYCLE_STEPS = [
  'Data Collected',
  'Verified',
  'Minted',
  'Active',
  'Traded',
  'Retired',
] as const;

const LifecycleStepper: React.FC<{ currentStep: number }> = ({ currentStep }) => (
  <div className="flex items-center gap-0 w-full">
    {LIFECYCLE_STEPS.map((step, idx) => {
      const isActive = idx === currentStep;
      const isCompleted = idx < currentStep;
      const dotColour = isActive
        ? 'bg-emerald-500 ring-2 ring-emerald-200'
        : isCompleted
          ? 'bg-sky-500'
          : 'bg-slate-300';
      return (
        <React.Fragment key={step}>
          <div className="flex flex-col items-center min-w-0 flex-1">
            <div className={`w-2.5 h-2.5 rounded-full ${dotColour} shrink-0`} />
            <span
              className={`bloomberg-small-text mt-0.5 text-center truncate w-full ${
                isActive ? 'text-emerald-700 font-medium' : isCompleted ? 'text-sky-600' : 'text-slate-400'
              }`}
            >
              {step}
            </span>
          </div>
          {idx < LIFECYCLE_STEPS.length - 1 && (
            <div
              className={`h-px flex-1 -mt-3 ${
                idx < currentStep ? 'bg-sky-400' : 'bg-slate-200'
              }`}
            />
          )}
        </React.Fragment>
      );
    })}
  </div>
);

/* ─── Cross-collateralisation diagram (WREI-ACO) ────────────────── */

const CrossCollateralDiagram: React.FC = () => (
  <div className="flex items-center justify-between gap-1 py-2">
    {/* Left source */}
    <div className="border border-sky-200 bg-sky-50 rounded px-2 py-1.5 text-center flex-1 min-w-0">
      <div className="bloomberg-small-text text-sky-700 font-medium truncate">Carbon Credits</div>
      <div className="bloomberg-small-text text-slate-500">(Revenue)</div>
    </div>

    <span className="bloomberg-small-text text-slate-400 shrink-0">&rarr;</span>

    {/* Centre pool */}
    <div className="border border-emerald-200 bg-emerald-50 rounded px-2 py-1.5 text-center flex-1 min-w-0">
      <div className="bloomberg-small-text text-emerald-700 font-medium truncate">Cross-Collateral</div>
      <div className="bloomberg-small-text text-slate-500">Pool</div>
    </div>

    <span className="bloomberg-small-text text-slate-400 shrink-0">&larr;</span>

    {/* Right source */}
    <div className="border border-sky-200 bg-sky-50 rounded px-2 py-1.5 text-center flex-1 min-w-0">
      <div className="bloomberg-small-text text-sky-700 font-medium truncate">Asset Co</div>
      <div className="bloomberg-small-text text-slate-500">(Lease Income)</div>
    </div>

    <span className="bloomberg-small-text text-slate-400 shrink-0">&rarr;</span>

    {/* Output */}
    <div className="border border-amber-200 bg-amber-50 rounded px-2 py-1.5 text-center flex-1 min-w-0">
      <div className="bloomberg-small-text text-amber-700 font-medium truncate">Enhanced Token</div>
      <div className="bloomberg-small-text text-slate-500">Value</div>
    </div>
  </div>
);

/* ─── WREI-CC Panel ─────────────────────────────────────────────── */

const CarbonCreditPanel: React.FC = () => (
  <div className="space-y-3">
    {/* Verification Standards */}
    <div>
      <SectionLabel>Verification Standards</SectionLabel>
      <div className="flex flex-wrap gap-1">
        <Badge label="ISO 14064-2" variant="green" />
        <Badge label="Verra VCS" variant="green" />
        <Badge label="Gold Standard" variant="green" />
      </div>
    </div>

    {/* Generation Source */}
    <div className="border-t border-slate-200" style={{ borderWidth: '0.5px' }}>
      <SectionLabel>Generation Source Breakdown</SectionLabel>
      <div className="space-y-1">
        {[
          { source: 'Modal Shift', pct: 47.9 },
          { source: 'Vessel Efficiency', pct: 47.2 },
          { source: 'Construction Avoidance', pct: 4.8 },
        ].map(({ source, pct }) => (
          <div key={source}>
            <div className="flex justify-between">
              <span className="bloomberg-small-text text-slate-600">{source}</span>
              <span className="bloomberg-data text-slate-900">{pct}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1 mt-0.5">
              <div className="bg-sky-500 h-1 rounded-full" style={{ width: `${pct}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Provenance */}
    <div className="border-t border-slate-200" style={{ borderWidth: '0.5px' }}>
      <SectionLabel>Provenance Chain</SectionLabel>
      <DataRow label="Vessel ID" value="WREI-VES-0042" />
      <DataRow label="Route" value="SYD–MEL Coastal" />
      <DataRow label="Electric Energy" value="0.12 kWh/pax-km" valueClass="bloomberg-data text-emerald-700" />
      <DataRow label="Diesel Baseline" value="3.31 kWh/pax-km" valueClass="bloomberg-data text-slate-500" />
    </div>

    {/* WREI Premium */}
    <div className="border-t border-slate-200" style={{ borderWidth: '0.5px' }}>
      <SectionLabel>WREI Premium</SectionLabel>
      <DataRow label="Base Price" value="A$100/t" />
      <DataRow label="Multiplier" value="1.5×" valueClass="bloomberg-data text-sky-700" />
      <DataRow label="Anchor Price" value="A$150/t" valueClass="bloomberg-data text-emerald-700 font-medium" />
    </div>

    {/* dMRV Score */}
    <div className="border-t border-slate-200" style={{ borderWidth: '0.5px' }}>
      <SectionLabel>dMRV Verification Score</SectionLabel>
      <div className="flex items-center gap-2">
        <div className="w-full bg-slate-100 rounded-full h-2">
          <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '94%' }} />
        </div>
        <span className="bloomberg-data text-emerald-700 whitespace-nowrap">94/100</span>
      </div>
    </div>

    {/* Lifecycle */}
    <div className="border-t border-slate-200 pt-1" style={{ borderWidth: '0.5px' }}>
      <SectionLabel>Token Lifecycle</SectionLabel>
      <LifecycleStepper currentStep={3} />
    </div>

    {/* Settlement */}
    <div className="border-t border-slate-200" style={{ borderWidth: '0.5px' }}>
      <SectionLabel>Settlement &amp; Infrastructure</SectionLabel>
      <DataRow label="Settlement" value="T+0 via Zoniqx zConnect" />
      <DataRow label="Standard" value="ERC-7518 (DyCIST)" />
      <DataRow label="Network" value="Polygon PoS" />
    </div>
  </div>
);

/* ─── WREI-ACO Panel ────────────────────────────────────────────── */

const AssetCoPanel: React.FC = () => (
  <div className="space-y-3">
    {/* Underlying Asset */}
    <div>
      <SectionLabel>Underlying Asset</SectionLabel>
      <DataRow label="SPV" value="WREI LeaseCo SPV" />
      <DataRow label="Sector" value="Maritime Infrastructure" />
      <DataRow label="Fleet" value="88 vessels + 22 Deep Power units" />
      <DataRow label="Total Capex" value="A$473M" valueClass="bloomberg-data text-slate-900 font-medium" />
    </div>

    {/* Yield Characteristics */}
    <div className="border-t border-slate-200" style={{ borderWidth: '0.5px' }}>
      <SectionLabel>Yield Characteristics</SectionLabel>
      <DataRow label="Equity Yield" value="28.3%" valueClass="bloomberg-data text-emerald-700" />
      <DataRow label="Gross Lease Yield" value="12.9%" valueClass="bloomberg-data text-emerald-700" />
      <DataRow label="Net Margin" value="60.8%" valueClass="bloomberg-data text-emerald-700" />
      <DataRow label="Distribution" value="Quarterly" />
    </div>

    {/* Fleet Metrics */}
    <div className="border-t border-slate-200" style={{ borderWidth: '0.5px' }}>
      <SectionLabel>Fleet Metrics</SectionLabel>
      <DataRow label="Annual Lease Income" value="A$61.1M" valueClass="bloomberg-data text-emerald-700" />
      <DataRow label="Annual Debt Service" value="A$23.9M" valueClass="bloomberg-data text-slate-500" />
      <DataRow label="Net Cash Flow" value="A$37.1M" valueClass="bloomberg-data text-emerald-700 font-medium" />
    </div>

    {/* Cash-on-Cash */}
    <div className="border-t border-slate-200" style={{ borderWidth: '0.5px' }}>
      <SectionLabel>Cash-on-Cash Multiple</SectionLabel>
      <div className="flex items-center gap-2">
        <span className="bloomberg-data text-lg text-emerald-700 font-medium">3.0&times;</span>
        <span className="bloomberg-small-text text-slate-500">over investment horizon</span>
      </div>
    </div>

    {/* Cross-collateralisation */}
    <div className="border-t border-slate-200" style={{ borderWidth: '0.5px' }}>
      <SectionLabel>Cross-Collateralisation Structure</SectionLabel>
      <CrossCollateralDiagram />
    </div>

    {/* Token Supply */}
    <div className="border-t border-slate-200" style={{ borderWidth: '0.5px' }}>
      <SectionLabel>Token Supply</SectionLabel>
      <DataRow label="Token Holder Equity" value="A$131M" valueClass="bloomberg-data text-slate-900 font-medium" />
    </div>

    {/* Settlement */}
    <div className="border-t border-slate-200" style={{ borderWidth: '0.5px' }}>
      <SectionLabel>Settlement &amp; Infrastructure</SectionLabel>
      <DataRow label="Settlement" value="T+0 via Zoniqx zConnect" />
      <DataRow label="Standard" value="ERC-7518 (DyCIST)" />
      <DataRow label="Network" value="Polygon PoS" />
    </div>

    {/* Regulatory */}
    <div className="border-t border-slate-200 pt-1" style={{ borderWidth: '0.5px' }}>
      <SectionLabel>Regulatory</SectionLabel>
      <div className="flex flex-wrap gap-1">
        <Badge label="AFSL Required" variant="amber" />
        <Badge label="Wholesale Only" variant="amber" />
      </div>
    </div>
  </div>
);

/* ─── Main export ───────────────────────────────────────────────── */

export const TokenDetailPanel: React.FC<TokenDetailPanelProps> = ({ tokenType, className = '' }) => {
  const isCC = tokenType === 'WREI_CC';
  const title = isCC ? 'WREI-CC  Carbon Credit Token' : 'WREI-ACO  Asset Co Token';

  return (
    <div className={`bg-white border border-slate-200 rounded p-3 ${className}`} style={{ borderWidth: '0.5px' }}>
      <div className="flex items-center justify-between mb-2">
        <h2 className="bloomberg-card-title text-slate-900">{title}</h2>
        <Badge label={isCC ? 'ERC-7518' : 'ERC-7518'} variant="blue" />
      </div>
      {isCC ? <CarbonCreditPanel /> : <AssetCoPanel />}
    </div>
  );
};

export default TokenDetailPanel;
