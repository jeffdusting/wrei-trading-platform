import type { NegotiationState } from '@/lib/types';

interface TradingStatusBarProps {
  tradingState: NegotiationState | null;
}

export default function TradingStatusBar({ tradingState }: TradingStatusBarProps) {
  if (!tradingState) return null;

  return (
    <div className="mt-4 flex justify-between items-center bloomberg-small-text text-[#64748B]">
      <div>
        Round {tradingState.round} | Phase: {tradingState.phase}
      </div>
      <div>
        WREI Trading Platform | Water Roads Pty Ltd
      </div>
    </div>
  );
}
