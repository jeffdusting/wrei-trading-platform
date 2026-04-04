'use client';

import { FC, useState } from 'react';
import {
  InstrumentType,
  InstrumentCategory,
} from '@/lib/trading/instruments/types';
import {
  getRegistryEntry,
  getTypesByCategory,
  type InstrumentRegistryEntry,
} from '@/lib/trading/instruments/instrument-registry';
import { resolveInstrumentPricing, type ResolvedPricing } from '@/lib/trading/instruments/pricing-engine';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface InstrumentSwitcherProps {
  selectedInstrument: InstrumentType;
  onInstrumentChange: (type: InstrumentType, pricing: ResolvedPricing) => void;
  className?: string;
}

interface CategoryTab {
  category: InstrumentCategory;
  label: string;
  code: string;
}

interface InstrumentDisplayInfo {
  type: InstrumentType;
  ticker: string;
  name: string;
  spot: string;
  currency: string;
  unit: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const CATEGORIES: CategoryTab[] = [
  { category: 'certificate', label: 'Certificates', code: 'CRT' },
  { category: 'carbon_token', label: 'Carbon Tokens', code: 'CTK' },
  { category: 'asset_token', label: 'Asset Tokens', code: 'ATK' },
];

const INSTRUMENT_DISPLAY: Record<InstrumentType, { ticker: string; name: string }> = {
  ESC:      { ticker: 'ESC',      name: 'Energy Savings Certificate' },
  VEEC:     { ticker: 'VEEC',     name: 'Victorian Energy Efficiency' },
  PRC:      { ticker: 'PRC',      name: 'Peak Reduction Certificate' },
  ACCU:     { ticker: 'ACCU',     name: 'Australian Carbon Credit' },
  LGC:      { ticker: 'LGC',     name: 'Large-scale Generation' },
  STC:      { ticker: 'STC',      name: 'Small-scale Technology' },
  WREI_CC:  { ticker: 'WREI-CC',  name: 'WREI Carbon Credit Token' },
  WREI_ACO: { ticker: 'WREI-ACO', name: 'WREI Asset Co Token' },
};

function getCategoryForType(type: InstrumentType): InstrumentCategory {
  const entry = getRegistryEntry(type);
  return entry.category;
}

function getInstrumentInfo(type: InstrumentType): InstrumentDisplayInfo {
  const entry = getRegistryEntry(type);
  const display = INSTRUMENT_DISPLAY[type];
  const pricing = entry.pricing;
  return {
    type,
    ticker: display.ticker,
    name: display.name,
    spot: pricing.fallbackPrice.toFixed(2),
    currency: pricing.currency,
    unit: pricing.unitOfMeasure,
  };
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const InstrumentSwitcher: FC<InstrumentSwitcherProps> = ({
  selectedInstrument,
  onInstrumentChange,
  className = '',
}) => {
  const activeCategory = getCategoryForType(selectedInstrument);
  const [hoveredType, setHoveredType] = useState<InstrumentType | null>(null);

  const handleSelect = (type: InstrumentType) => {
    if (type === selectedInstrument) return;
    const resolved = resolveInstrumentPricing(type);
    onInstrumentChange(type, resolved);
  };

  const typesInCategory = (cat: InstrumentCategory): InstrumentType[] => {
    return getTypesByCategory(cat);
  };

  const selectedInfo = getInstrumentInfo(selectedInstrument);

  return (
    <div className={`bg-white border border-slate-200 ${className}`} style={{ borderRadius: '2px' }}>
      {/* Header — active instrument summary */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-slate-200 bg-slate-50">
        <div className="flex items-center gap-2">
          <span
            className="px-1.5 py-0.5 text-white font-mono text-[11px] font-semibold"
            style={{ backgroundColor: '#0EA5E9', borderRadius: '2px' }}
          >
            {selectedInfo.ticker}
          </span>
          <span className="text-[12px] font-medium text-slate-800">
            {selectedInfo.name}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-mono text-[12px] text-slate-600">
            {selectedInfo.currency} {selectedInfo.spot}/{selectedInfo.unit}
          </span>
          <span className="text-[10px] text-slate-400 uppercase tracking-wider">
            INST
          </span>
        </div>
      </div>

      {/* Category tabs */}
      <div className="flex border-b border-slate-200">
        {CATEGORIES.map((cat) => {
          const isActive = cat.category === activeCategory;
          const types = typesInCategory(cat.category);
          return (
            <button
              key={cat.category}
              onClick={() => {
                if (!isActive) handleSelect(types[0]);
              }}
              className={`
                flex-1 flex items-center justify-center gap-1.5
                px-2 py-1.5 text-[11px] font-medium transition-colors
                border-b-2
                ${isActive
                  ? 'border-sky-500 text-sky-700 bg-sky-50'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                }
              `}
            >
              <span className="font-mono text-[10px] bg-slate-100 px-1 rounded" style={{ borderRadius: '2px' }}>
                {cat.code}
              </span>
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Instrument grid for active category */}
      <div className="grid grid-cols-3 gap-px bg-slate-200 p-px">
        {typesInCategory(activeCategory).map((type) => {
          const info = getInstrumentInfo(type);
          const isSelected = type === selectedInstrument;
          const isHovered = type === hoveredType;

          return (
            <button
              key={type}
              onClick={() => handleSelect(type)}
              onMouseEnter={() => setHoveredType(type)}
              onMouseLeave={() => setHoveredType(null)}
              className={`
                flex flex-col items-start px-2.5 py-2 text-left transition-colors
                ${isSelected
                  ? 'bg-sky-50 border-l-2 border-sky-500'
                  : isHovered
                    ? 'bg-slate-50 border-l-2 border-slate-300'
                    : 'bg-white border-l-2 border-transparent'
                }
              `}
            >
              <div className="flex items-center gap-1.5 w-full">
                <span
                  className={`font-mono text-[11px] font-semibold ${
                    isSelected ? 'text-sky-700' : 'text-slate-700'
                  }`}
                >
                  {info.ticker}
                </span>
                {isSelected && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-sky-500" />
                )}
              </div>
              <span className="text-[10px] text-slate-500 leading-tight mt-0.5 truncate w-full">
                {info.name}
              </span>
              <span className="font-mono text-[11px] text-slate-600 mt-1">
                {info.currency} {info.spot}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default InstrumentSwitcher;
