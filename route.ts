import { NextResponse } from 'next/server';
import { calculateSignal, Candle } from '@/lib/signal';

export const dynamic = 'force-dynamic';

export async function GET() {
  const key = process.env.TWELVEDATA_API_KEY;
  const symbol = process.env.XAU_SYMBOL || 'XAU/USD';
  if (!key) return NextResponse.json({ error: 'Missing TWELVEDATA_API_KEY in Vercel Environment Variables' }, { status: 500 });
  const url = new URL('https://api.twelvedata.com/time_series');
  url.searchParams.set('symbol', symbol);
  url.searchParams.set('interval', '5min');
  url.searchParams.set('outputsize', '120');
  url.searchParams.set('apikey', key);
  const r = await fetch(url.toString(), { cache: 'no-store' });
  const data = await r.json();
  if (data.status === 'error' || !data.values) return NextResponse.json({ error: data.message || 'API error', raw: data }, { status: 502 });
  const candles: Candle[] = data.values.map((v: any) => ({
    time: v.datetime,
    open: Number(v.open), high: Number(v.high), low: Number(v.low), close: Number(v.close)
  })).filter((c: Candle) => Number.isFinite(c.close));
  const signal = calculateSignal(candles);
  return NextResponse.json({ symbol, updatedAt: new Date().toISOString(), candles, signal });
}
