// Wicki marknadsdata: kurser för Hem och simulatorn. Öppen (ingen inloggning), cachas i minnet.
// Bara källor som tillåter visning i appar: CoinGecko (krypto, kräver "Powered by CoinGecko") och ECB (valutor, "Source: ECB statistics").
// Valfri hemlighet COINGECKO_API_KEY (gratis Demo-nyckel) ger högre gränser.
const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type', 'Access-Control-Allow-Methods': 'GET, OPTIONS' };
const json = (b: unknown, maxAge = 60) => new Response(JSON.stringify(b), { headers: { ...cors, 'Content-Type': 'application/json', 'Cache-Control': `public, max-age=${maxAge}` } });
type Row = [string, number, number, number, number];
const cache = new Map<string, { t: number; v: unknown }>();
async function cached<T>(k: string, ttl: number, f: () => Promise<T>): Promise<T> { const c = cache.get(k); if (c && Date.now() - c.t < ttl) return c.v as T; const v = await f(); cache.set(k, { t: Date.now(), v }); return v; }

const MK: Record<string, { name: string; kind: 'cg' | 'ecb'; sym: string }> = {
  btc: { name: 'Bitcoin', kind: 'cg', sym: 'bitcoin' }, eth: { name: 'Ethereum', kind: 'cg', sym: 'ethereum' }, sol: { name: 'Solana', kind: 'cg', sym: 'solana' },
  eurusd: { name: 'EUR/USD', kind: 'ecb', sym: 'USD' }, eursek: { name: 'EUR/SEK', kind: 'ecb', sym: 'SEK' }, eurgbp: { name: 'EUR/GBP', kind: 'ecb', sym: 'GBP' },
};
async function cg(coin: string, days: number): Promise<Row[]> {
  const key = Deno.env.get('COINGECKO_API_KEY'); const h: Record<string, string> = { accept: 'application/json' }; if (key) h['x-cg-demo-api-key'] = key;
  const r = await fetch(`https://api.coingecko.com/api/v3/coins/${coin}/ohlc?vs_currency=usd&days=${days}`, { headers: h }); if (!r.ok) throw new Error('coingecko ' + r.status);
  const a = await r.json() as number[][]; return a.map(k => [new Date(k[0]).toISOString().slice(0, 16), k[1], k[2], k[3], k[4]]);
}
async function ecb(quote: string, days: number): Promise<Row[]> {
  const a = new Date(Date.now() - days * 864e5).toISOString().slice(0, 10);
  const r = await fetch(`https://data-api.ecb.europa.eu/service/data/EXR/D.${quote}.EUR.SP00.A?format=csvdata&startPeriod=${a}`, { headers: { accept: 'text/csv' } }); if (!r.ok) throw new Error('ecb ' + r.status);
  const lines = (await r.text()).trim().split('\n'); const head = lines[0].split(','); const ti = head.indexOf('TIME_PERIOD'), vi = head.indexOf('OBS_VALUE');
  const pts = lines.slice(1).map(l => l.split(',')).filter(p => p[vi]).map(p => [p[ti], +p[vi]] as [string, number]).sort((x, y) => x[0] < y[0] ? -1 : 1);
  return pts.map(([d, c], i) => { const o = i ? pts[i - 1][1] : c; return [d, o, Math.max(o, c), Math.min(o, c), c] as Row; });
}
async function quote(id: string) {
  const m = MK[id]; if (!m) return null;
  return cached('q:' + id, m.kind === 'cg' ? 120e3 : 3600e3, async () => {
    const rows = m.kind === 'cg' ? await cg(m.sym, 2) : (await ecb(m.sym, 120)).slice(-60);
    const last = rows[rows.length - 1][4]; const prev = m.kind === 'cg' ? (rows.find(r => r[0] >= new Date(Date.now() - 864e5).toISOString().slice(0, 16)) || rows[0])[1] : rows[rows.length - 2][4];
    return { id, name: m.name, price: last, ch: Math.round((last - prev) / prev * 10000) / 100, at: rows[rows.length - 1][0], tf: m.kind === 'cg' ? '30m' : '1d',
      src: m.kind === 'cg' ? 'CoinGecko' : 'ECB', line: m.kind === 'ecb', cs: rows.slice(-60).map(r => r.slice(1).map(v => Math.round(v * 1e4) / 1e4)) };
  });
}
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  const u = new URL(req.url);
  try {
    const ids = (u.searchParams.get('ids') || 'btc,eth,sol,eurusd,eursek').split(',').slice(0, 8);
    const out = await Promise.all(ids.map(id => quote(id).catch(() => null)));
    return json({ at: new Date().toISOString(), credits: ['Powered by CoinGecko', 'Source: ECB statistics'], quotes: out.filter(Boolean) });
  } catch (e) { return json({ error: String(e).slice(0, 200) }); }
});
