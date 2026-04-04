import type { WREITokenType } from '@/lib/types';
import { WREI_TOKEN_CONFIG } from '@/lib/negotiation-config';

interface TokenTypeSelectorProps {
  selectedWREITokenType: WREITokenType;
  onTokenTypeChange: (tokenType: WREITokenType) => void;
  tradingStarted: boolean;
}

export default function TokenTypeSelector({ selectedWREITokenType, onTokenTypeChange, tradingStarted }: TokenTypeSelectorProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
      <h3 className="bloomberg-card-title text-[#1E293B] mb-4">Select WREI Investment Product</h3>

      <div className="space-y-4">
        <label className="flex items-start space-x-3 cursor-pointer p-3 rounded-lg border border-transparent hover:border-[#0EA5E9] hover:bg-blue-50 transition-colors">
          <input
            type="radio"
            value="carbon_credits"
            checked={selectedWREITokenType === 'carbon_credits'}
            onChange={(e) => onTokenTypeChange(e.target.value as WREITokenType)}
            disabled={tradingStarted}
            className="text-[#0EA5E9] focus:ring-[#0EA5E9] focus:ring-offset-2 mt-1"
          />
          <div className="flex-1">
            <div className=" text-[#1E293B] border-l-4 border-green-500 pl-3">WREI Carbon Credit Tokens</div>
            <div className="bloomberg-body-text font-medium text-green-600 mt-1">A${WREI_TOKEN_CONFIG.CARBON_CREDITS.ANCHOR_PRICE}/tonne</div>
            <div className="bloomberg-small-text text-[#64748B] mt-1">
              Native digital carbon credits • Triple-standard verification • 3.12M-13.1M supply projection
            </div>
            <div className="bloomberg-section-label text-[#64748B] mt-2">
              <span className="font-medium">Base Case:</span> A${Math.round(WREI_TOKEN_CONFIG.CARBON_CREDITS.BASE_CASE.TOTAL_REVENUE / 1_000_000)}M revenue •
              <span className="font-medium"> Expansion:</span> A${Math.round(WREI_TOKEN_CONFIG.CARBON_CREDITS.EXPANSION_CASE.TOTAL_REVENUE / 1_000_000)}M revenue
            </div>
          </div>
        </label>

        <label className="flex items-start space-x-3 cursor-pointer p-3 rounded-lg border border-transparent hover:border-[#0EA5E9] hover:bg-blue-50 transition-colors">
          <input
            type="radio"
            value="asset_co"
            checked={selectedWREITokenType === 'asset_co'}
            onChange={(e) => onTokenTypeChange(e.target.value as WREITokenType)}
            disabled={tradingStarted}
            className="text-[#0EA5E9] focus:ring-[#0EA5E9] focus:ring-offset-2 mt-1"
          />
          <div className="flex-1">
            <div className=" text-[#1E293B] border-l-4 border-blue-500 pl-3">WREI Asset Co Tokens</div>
            <div className="bloomberg-body-text font-medium text-blue-600 mt-1">{(WREI_TOKEN_CONFIG.ASSET_CO.STEADY_STATE.EQUITY_YIELD * 100).toFixed(1)}% Infrastructure Yield</div>
            <div className="bloomberg-small-text text-[#64748B] mt-1">
              Fractional vessel fleet ownership • Predictable lease income • A${Math.round(WREI_TOKEN_CONFIG.ASSET_CO.TOKEN_EQUITY / 1_000_000)}M equity cap
            </div>
            <div className="bloomberg-section-label text-[#64748B] mt-2">
              <span className="font-medium">Fleet:</span> {WREI_TOKEN_CONFIG.ASSET_CO.FLEET.VESSEL_COUNT} vessels + {WREI_TOKEN_CONFIG.ASSET_CO.FLEET.DEEP_POWER_UNITS} Deep Power •
              <span className="font-medium"> Cash Flow:</span> A${Math.round(WREI_TOKEN_CONFIG.ASSET_CO.STEADY_STATE.NET_CASH_FLOW / 1_000_000)}M annually
            </div>
          </div>
        </label>

        <label className="flex items-start space-x-3 cursor-pointer p-3 rounded-lg border border-transparent hover:border-[#0EA5E9] hover:bg-blue-50 transition-colors">
          <input
            type="radio"
            value="dual_portfolio"
            checked={selectedWREITokenType === 'dual_portfolio'}
            onChange={(e) => onTokenTypeChange(e.target.value as WREITokenType)}
            disabled={tradingStarted}
            className="text-[#0EA5E9] focus:ring-[#0EA5E9] focus:ring-offset-2 mt-1"
          />
          <div className="flex-1">
            <div className=" text-[#1E293B] border-l-4 border-purple-500 pl-3">WREI Dual Token Portfolio</div>
            <div className="bloomberg-body-text font-medium text-purple-600 mt-1">Diversified Strategy</div>
            <div className="bloomberg-small-text text-[#64748B] mt-1">
              Carbon Credits + Asset Co • Risk diversification • Cross-collateralization opportunities
            </div>
            <div className="bloomberg-section-label text-[#64748B] mt-2">
              <span className="font-medium">Yield Stability:</span> Infrastructure income + carbon upside •
              <span className="font-medium"> DeFi Ready:</span> Use Asset Co as collateral
            </div>
          </div>
        </label>
      </div>

      {tradingStarted && (
        <div className="mt-4 p-3 bg-gray-100 rounded-lg bloomberg-small-text text-gray-600">
          Investment product locked
        </div>
      )}
    </div>
  );
}
