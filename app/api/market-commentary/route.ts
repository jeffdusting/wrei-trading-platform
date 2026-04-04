import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { PRICING_INDEX, NEGOTIATION_CONFIG } from '@/lib/negotiation-config';

export const dynamic = 'force-dynamic';

const FALLBACK_COMMENTARY = {
  commentary:
    `Voluntary carbon markets continue to demonstrate bifurcation between legacy offsets and high-integrity removal credits. ` +
    `VCM spot prices for nature-based credits remain around US$${PRICING_INDEX.VCM_SPOT_REFERENCE}/t, while dMRV-verified credits ` +
    `command a ${Math.round((PRICING_INDEX.DMRV_PREMIUM_BENCHMARK - 1) * 100)}% premium at US$${PRICING_INDEX.DMRV_SPOT_REFERENCE}/t, ` +
    `reflecting institutional demand for verifiable additionality.\n\n` +
    `In the Australian environmental certificate market, NSW ESC spot prices sit at A$${PRICING_INDEX.ESC_SPOT_REFERENCE} ` +
    `with forward curves indicating A$${PRICING_INDEX.ESC_FORWARD_REFERENCE} over the next twelve months. ` +
    `The ESC volatility range of A$${PRICING_INDEX.ESC_VOLATILITY_RANGE[0]}–A$${PRICING_INDEX.ESC_VOLATILITY_RANGE[1]} ` +
    `underscores the importance of hedging strategies for obligated parties.\n\n` +
    `WREI-verified credits are anchored at US$${NEGOTIATION_CONFIG.ANCHOR_PRICE}/t, representing a quality premium ` +
    `supported by satellite-based dMRV verification and institutional-grade settlement via Zoniqx zConnect.`,
  generatedAt: new Date().toISOString(),
  topics: ['VCM Conditions', 'ESC Market', 'WREI Outlook'],
  source: 'fallback' as const,
};

export async function GET() {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(FALLBACK_COMMENTARY);
  }

  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const marketData = {
      vcm_spot_usd: PRICING_INDEX.VCM_SPOT_REFERENCE,
      dmrv_spot_usd: PRICING_INDEX.DMRV_SPOT_REFERENCE,
      dmrv_premium_pct: Math.round((PRICING_INDEX.DMRV_PREMIUM_BENCHMARK - 1) * 100),
      forward_removal_usd: PRICING_INDEX.FORWARD_REMOVAL_REFERENCE,
      esc_spot_aud: PRICING_INDEX.ESC_SPOT_REFERENCE,
      esc_forward_aud: PRICING_INDEX.ESC_FORWARD_REFERENCE,
      esc_volatility_range_aud: PRICING_INDEX.ESC_VOLATILITY_RANGE,
      wrei_anchor_price_usd: NEGOTIATION_CONFIG.ANCHOR_PRICE,
      wrei_price_floor_usd: NEGOTIATION_CONFIG.PRICE_FLOOR,
      esc_anchor_price_aud: NEGOTIATION_CONFIG.ESC_ANCHOR_PRICE,
      data_sources: PRICING_INDEX.DATA_SOURCES,
      timestamp: PRICING_INDEX.INDEX_TIMESTAMP,
    };

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 500,
      system:
        'You are a senior carbon markets analyst at WREI. Provide a concise market commentary (3-4 paragraphs, ~200 words total) covering:\n' +
        '1. Current voluntary carbon market conditions (VCM spot: $X, dMRV premium: Y%)\n' +
        '2. Australian environmental certificate market (ESC spot: A$X, forward: A$X)\n' +
        '3. WREI platform positioning and pricing outlook\n' +
        'Use Australian spelling. Be specific with numbers. Professional Bloomberg-style tone.',
      messages: [
        {
          role: 'user',
          content: `Generate market commentary based on the following live pricing data:\n\n${JSON.stringify(marketData, null, 2)}`,
        },
      ],
    });

    const textBlock = response.content.find((b) => b.type === 'text');
    const commentary = textBlock?.text ?? FALLBACK_COMMENTARY.commentary;

    return NextResponse.json({
      commentary,
      generatedAt: new Date().toISOString(),
      topics: ['VCM Conditions', 'ESC Market', 'WREI Outlook'],
      source: 'ai',
    });
  } catch (error) {
    console.error('Market commentary generation failed:', error);
    return NextResponse.json(FALLBACK_COMMENTARY);
  }
}
