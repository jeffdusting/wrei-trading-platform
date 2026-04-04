import { NextRequest, NextResponse } from 'next/server';

// ---------------------------------------------------------------------------
// GET /api/trades — list trades from Vercel Postgres
// POST /api/trades — record a new trade
// ---------------------------------------------------------------------------

export async function GET(req: NextRequest) {
  try {
    // Dynamic import so module isn't resolved if DB is unavailable
    const { listTrades } = await import('@/lib/db/queries/trades');

    const url = req.nextUrl;
    const instrument_id = url.searchParams.get('instrument_id') ?? undefined;
    const status = url.searchParams.get('status') ?? undefined;
    const limit = parseInt(url.searchParams.get('limit') ?? '50', 10);
    const offset = parseInt(url.searchParams.get('offset') ?? '0', 10);

    const trades = await listTrades({ instrument_id, status, limit, offset });
    return NextResponse.json({ trades });
  } catch (error) {
    // DB not provisioned / unavailable — return empty
    return NextResponse.json(
      { trades: [], error: 'Database unavailable' },
      { status: 200 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { createTrade } = await import('@/lib/db/queries/trades');

    const trade = await createTrade({
      instrument_id: body.instrument_id,
      negotiation_id: body.negotiation_id,
      direction: body.direction ?? 'sell',
      quantity: body.quantity,
      price_per_unit: body.price_per_unit,
      currency: body.currency ?? 'AUD',
      buyer_persona: body.buyer_persona,
      metadata: body.metadata ?? {},
    });

    return NextResponse.json({ trade }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to record trade' },
      { status: 500 },
    );
  }
}
