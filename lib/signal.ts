export type Candle = { time: string; open: number; high: number; low: number; close: number };
export type Signal = {
  direction: 'BUY' | 'SELL' | 'WAIT';
  price: number; ema50: number; support: number; resistance: number;
  entry: number | null; sl: number | null; tp1: number | null; tp2: number | null;
  reason: string; riskNote: string;
};

export function ema(values: number[], period: number) {
  const k = 2 / (period + 1);
  let e = values[0];
  for (let i = 1; i < values.length; i++) e = values[i] * k + e * (1 - k);
  return e;
}

export function calculateSignal(candles: Candle[]): Signal {
  const ordered = [...candles].sort((a,b)=> new Date(a.time).getTime() - new Date(b.time).getTime());
  const last = ordered[ordered.length - 1];
  const closes = ordered.map(c => c.close);
  const ema50 = ema(closes.slice(-80), 50);
  const recent = ordered.slice(-24, -1);
  const support = Math.min(...recent.map(c => c.low));
  const resistance = Math.max(...recent.map(c => c.high));
  const price = last.close;
  const buffer = 0.6; // gold dollars filter
  let direction: Signal['direction'] = 'WAIT';
  let reason = 'انتظار: السعر لم يعطِ كسرًا مؤكدًا بعد.';
  let entry: number | null = null, sl: number | null = null, tp1: number | null = null, tp2: number | null = null;

  if (price > ema50 && price > resistance + buffer) {
    direction = 'BUY'; entry = price; sl = Math.min(ema50, support) - 0.8; tp1 = price + 4; tp2 = price + 7;
    reason = 'شراء: السعر فوق EMA50 واخترق مقاومة آخر الشموع.';
  } else if (price < ema50 && price < support - buffer) {
    direction = 'SELL'; entry = price; sl = Math.max(ema50, resistance) + 0.8; tp1 = price - 4; tp2 = price - 7;
    reason = 'بيع: السعر تحت EMA50 وكسر دعم آخر الشموع.';
  }
  return { direction, price, ema50, support, resistance, entry, sl, tp1, tp2, reason, riskNote: 'حساب 2500$: سكالبينغ 0.01–0.02 lot، وخسارتان متتاليتان = توقف.' };
}
