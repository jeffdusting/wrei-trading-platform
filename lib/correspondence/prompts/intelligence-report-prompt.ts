/**
 * Intelligence Report Prompt — System prompt for generating the market outlook
 * and procurement recommendation sections of client intelligence reports.
 *
 * Used by client-reporting.ts when generating enhanced reports with forecast data.
 * Voice: professional, data-driven, written as if from the broker (white-label brand).
 */

import { CONCISENESS_DIRECTIVE } from '@/lib/ai/prompts/system-prompts';

export interface IntelligenceReportContext {
  brokerName: string;
  currentSpot: number;
  spotTrend30d: 'rising' | 'stable' | 'falling';
  forecast1m: number;
  forecast3m: number;
  forecast6m: number;
  forecastConfidence: number;
  ci80Lower3m: number;
  ci80Upper3m: number;
  creationVelocityTrend: 'accelerating' | 'stable' | 'decelerating';
  activityMixNotes: string;
  commercialLightingImpact: string;
  policyEvents: string[];
  surplusRunwayWeeks: number | null;
  clientShortfall: number;
  clientDeadlineDays: number;
  timingSignal: string;
}

export function buildIntelligenceReportPrompt(ctx: IntelligenceReportContext): string {
  const policyList = ctx.policyEvents.length > 0
    ? ctx.policyEvents.map(e => `  - ${e}`).join('\n')
    : '  - No active policy consultations';

  const directionLabel = ctx.forecast3m > ctx.currentSpot + 0.50
    ? 'bullish'
    : ctx.forecast3m < ctx.currentSpot - 0.50
      ? 'bearish'
      : 'neutral';

  return `${CONCISENESS_DIRECTIVE}

You are a senior energy certificate markets analyst writing on behalf of ${ctx.brokerName}.
Generate the "Market Outlook" and "Recommended Actions" sections for a client intelligence report.

CURRENT MARKET DATA:
- ESC spot price: A$${ctx.currentSpot.toFixed(2)}
- 30-day trend: ${ctx.spotTrend30d}
- Forecast (1 month): A$${ctx.forecast1m.toFixed(2)}
- Forecast (3 months): A$${ctx.forecast3m.toFixed(2)} [80% CI: A$${ctx.ci80Lower3m.toFixed(2)} — A$${ctx.ci80Upper3m.toFixed(2)}] (${directionLabel})
- Forecast (6 months): A$${ctx.forecast6m.toFixed(2)}
- Model confidence: ${(ctx.forecastConfidence * 100).toFixed(0)}%

SUPPLY OUTLOOK:
- Creation velocity: ${ctx.creationVelocityTrend}
- Activity mix: ${ctx.activityMixNotes}
- Commercial lighting exit: ${ctx.commercialLightingImpact}
${ctx.surplusRunwayWeeks != null ? `- Surplus runway: ${ctx.surplusRunwayWeeks} weeks at current surrender rate` : ''}

KEY RISKS / POLICY EVENTS:
${policyList}

CLIENT POSITION:
- Certificate shortfall: ${ctx.clientShortfall.toLocaleString()} ESCs
- Days to surrender deadline: ${ctx.clientDeadlineDays}
- Timing assessment: ${ctx.timingSignal}

INSTRUCTIONS:
1. Write a "Market Outlook" section (3-4 sentences): current price, direction, key drivers, risk factors.
2. Write a "Recommended Actions" section (2-3 sentences): specific procurement recommendation based on shortfall × timing.
   Use language like "we recommend procuring X certificates now" or "we recommend splitting procurement across the next 3 months".
3. Australian spelling throughout.
4. Professional, data-driven tone. Reference specific figures.
5. Do NOT use markdown headers — the sections will be inserted into a template.
6. Write as ${ctx.brokerName}, not as WREI.

Return in this exact format:
MARKET_OUTLOOK:
<market outlook text>

RECOMMENDED_ACTIONS:
<recommended actions text>`;
}
