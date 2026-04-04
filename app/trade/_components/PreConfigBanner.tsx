import type { TradeState } from '../_lib/trade-types';

interface PreConfigBannerProps {
  isPreConfigured: boolean;
  preConfigMessage: string;
  tradingStarted: boolean;
}

export default function PreConfigBanner({ isPreConfigured, preConfigMessage, tradingStarted }: PreConfigBannerProps) {
  if (!isPreConfigured || !preConfigMessage || tradingStarted) return null;

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="bg-gradient-to-r from-green-600 to-emerald-700 rounded-xl p-4 mb-4 text-white">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-6 w-6 text-green-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="bloomberg-card-title">Institutional Profile Configured</h3>
            <p className="text-green-100 bloomberg-small-text">{preConfigMessage}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
