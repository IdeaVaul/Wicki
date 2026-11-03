// Wicki marknadsdata: kurser i nära realtid för Hem och simulatorn, och dagliga historiska ljus för lektionerna.
// Öppen (ingen inloggning), cachas i minnet. Källor: Binance med Coinbase som reserv (krypto), Yahoo Finance (index, aktier, råvaror och valutor, fördröjt).
const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type', 'Access-Control-Allow-Methods': 'GET, OPTIONS' };
const json = (b: unknown, maxAge = 60) => new Response(JSON.stringify(b), { headers: { ...cors, 'Content-Type': 'application/json', 'Cache-Control': `public, max-age=${maxAge}` } });

type Row = [string, number, number, number, number]; // datum/tid, öppning, högsta, lägsta, stängning
const cache = new Map<string, { t: number; v: unknown }>();
async function cached<T>(k: string, ttl: number, f: () => Promise<T>): Promise<T> { const c = cache.get(k); if (c && Date.now() - c.t < ttl) return c.v as T; const v = await f(); cache.set(k, { t: Date.now(), v }); return v; }

/** Marknader i appen. kind avgör källa. */
const MK: Record<string, { name: string; kind: 'binance' | 'yahoo'; sym: string }> = {
  btc: { name: 'Bitcoin', kind: 'binance', sym: 'BTCUSDT' }, eth: { name: 'Ethereum', kind: 'binance', sym: 'ETHUSDT' },
  spx: { name: 'S&P 500', kind: 'yahoo', sym: '^GSPC' }, ndx: { name: 'Nasdaq 100', kind: 'yahoo', sym: '^NDX' }, omx: { name: 'OMXS30', kind: 'yahoo', sym: '^OMX' },
  dax: { name: 'DAX', kind: 'yahoo', sym: '^GDAXI' }, gold: { name: 'Guld', kind: 'yahoo', sym: 'GC=F' }, oil: { name: 'Olja (Brent)', kind: 'yahoo', sym: 'BZ=F' },
  aapl: { name: 'Apple', kind: 'yahoo', sym: 'AAPL' }, tsla: { name: 'Tesla', kind: 'yahoo', sym: 'TSLA' }, nvda: { name: 'Nvidia', kind: 'yahoo', sym: 'NVDA' },
  eursek: { name: 'EUR/SEK', kind: 'yahoo', sym: 'EURSEK=X' }, usdsek: { name: 'USD/SEK', kind: 'yahoo', sym: 'SEK=X' },
};

async function binance(sym: string, interval: string, limit: number): Promise<Row[]> {
  try {
    const r = await fetch(`https://api.binance.com/api/v3/klines?symbol=${sym}&interval=${interval}&limit=${limit}`); if (!r.ok) throw new Error('binance ' + r.status);
    const a = await r.json() as unknown[][]; return a.map(k => [new Date(Number(k[0])).toISOString().slice(0, interval === '1d' ? 10 : 16), +k[1]!, +k[2]!, +k[3]!, +k[4]!]);
  } catch {
    // Reserv: Coinbase. Ljusen kommer som [tid, låg, hög, öppning, stängning], nyast först.
    const prod = sym === 'ETHUSDT' ? 'ETH-USD' : 'BTC-USD'; const g = interval === '1d' ? 86400 : 3600;
    const r = await fetch(`https://api.exchange.coinbase.com/products/${prod}/candles?granularity=${g}`, { headers: { 'User-Agent': 'wicki' } }); if (!r.ok) throw new Error('coinbase ' + r.status);
    const a = (await r.json() as number[][]).slice(0, limit).reverse(); return a.map(k => [new Date(k[0] * 1000).toISOString().slice(0, g === 86400 ? 10 : 16), k[3], k[2], k[1], k[4]]);
  }
}
async function yahoo(sym: string, range: string): Promise<Row[]> {
  const r = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(sym)}?range=${range}&interval=1d`, { headers: { 'User-Agent': 'Mozilla/5.0' } }); if (!r.ok) throw new Error('yahoo ' + r.status);
  const j = await r.json(); const x = j.chart.result[0]; const q = x.indicators.quote[0];
  return (x.timestamp as number[]).map((t, i) => [new Date(t * 1000).toISOString().slice(0, 10), q.open[i], q.high[i], q.low[i], q.close[i]] as Row).filter(r => r.slice(1).every(v => v != null));
}
/** Senaste 60 ljus (timme för krypto, dag för övrigt) och förändring senaste dygnet/dagen. */
async function quote(id: string) {
  const m = MK[id]; if (!m) return null;
  return cached('q:' + id, m.kind === 'binance' ? 60e3 : 15 * 60e3, async () => {
    const rows = m.kind === 'binance' ? await binance(m.sym, '1h', 60) : (await yahoo(m.sym, '6mo')).slice(-60);
    const last = rows[rows.length - 1][4], prev = m.kind === 'binance' ? rows[Math.max(0, rows.length - 25)][4] : rows[rows.length - 2][4];
    return { id, name: m.name, price: last, ch: Math.round((last - prev) / prev * 10000) / 100, at: rows[rows.length - 1][0], tf: m.kind === 'binance' ? '1h' : '1d',
      src: m.kind === 'binance' ? 'Binance' : 'Yahoo Finance', cs: rows.map(r => [r[1], r[2], r[3], r[4]]) };
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  const u = new URL(req.url); const mode = u.searchParams.get('mode') || 'quotes';
  try {
    if (mode === 'history') {
      // Dagliga ljus för en marknad, valfritt intervall (för lektioner med riktiga grafer).
      const id = u.searchParams.get('id') || 'spx'; const m = MK[id]; if (!m) return json({ error: 'unknown' });
      const rows = await cached('h:' + id, 6 * 3600e3, () => m.kind === 'binance' ? binance(m.sym, '1d', 1000) : yahoo(m.sym, '5y'));
      const from = u.searchParams.get('from') || '', to = u.searchParams.get('to') || '9999';
      return json({ id, name: m.name, rows: rows.filter(r => r[0] >= from && r[0] <= to) }, 3600);
    }
    const ids = (u.searchParams.get('ids') || 'omx,spx,btc,gold,eursek').split(',').slice(0, 8);
    const out = await Promise.all(ids.map(id => quote(id).catch(() => null)));
    return json({ at: new Date().toISOString(), quotes: out.filter(Boolean) });
  } catch (e) { return json({ error: String(e).slice(0, 200) }); }
});
