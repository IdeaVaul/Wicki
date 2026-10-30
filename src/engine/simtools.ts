import type { Candle } from '../types';

/** Diagramverktyg i simulatorn: tidsram, indikatorer, ritningar och rädslomätaren. */
export type SimTools = { ma20?: boolean; ma50?: boolean; bb?: boolean; vol?: boolean; rsi?: boolean; tf?: 1 | 5; mode?: '' | 'lv' | 'tl';
  lv?: number[]; tl?: [number, number, number, number][] };
export const TOOLS0: SimTools = { ma20: true, vol: true, tf: 1, mode: '', lv: [], tl: [] };

/** Slå ihop tf ljus till ett (t.ex. 5 småljus = ett större). */
export function aggregate(cs: Candle[], tf: number): Candle[] {
  if (tf <= 1) return cs; const out: Candle[] = [];
  for (let i = 0; i < cs.length; i += tf) { const g = cs.slice(i, i + tf);
    out.push({ o: g[0].o, c: g[g.length - 1].c, h: Math.max(...g.map(x => x.h)), l: Math.min(...g.map(x => x.l)), v: g.reduce((s, x) => s + x.v, 0) / g.length }); }
  return out;
}
/** Det synliga fönstret: max n ljus fram till och med index i, i vald tidsram. start = första riktiga ljusindex i fönstret. */
export function windowOf(cs: Candle[], i: number, tf: number, n = 44) {
  if (tf <= 1) { const start = Math.max(0, i - n + 1); return { vis: cs.slice(start, i + 1), start, tf: 1 }; }
  const base = Math.floor((i + 1) / tf) * tf; const start = Math.max(0, base - n * tf);
  // det pågående (ofärdiga) storljuset tas med så att man ser priset just nu
  return { vis: aggregate(cs.slice(start, i + 1), tf), start, tf };
}
const sd = (a: number[]) => { const m = a.reduce((s, x) => s + x, 0) / (a.length || 1); return Math.sqrt(a.reduce((s, x) => s + (x - m) ** 2, 0) / (a.length || 1)); };
/** Rädslomätare som fungerar som VIX: stiger när svängningarna ökar och när priset faller från sin topp. */
export function fearAt(cs: Candle[], i: number): number {
  if (i < 12) return 16;
  const rets = (a: number, b: number) => { const r: number[] = []; for (let k = Math.max(1, a); k <= b; k++) r.push(Math.log(cs[k].c / cs[k - 1].c)); return r; };
  const short = sd(rets(i - 9, i)), long = sd(rets(i - 79, i)) || short || 1e-9;
  const peak = Math.max(...cs.slice(Math.max(0, i - 19), i + 1).map(x => x.c)); // fallet från toppen räknas i "normala svängningar" så att alla marknader (aktier, forex, krypto, guld) hamnar på samma skala
  const dd = Math.max(0, (peak - cs[i].c) / peak) / (long * Math.sqrt(20));
  const v = 12 * (short / long) + 8 * dd;
  return Math.round(Math.max(9, Math.min(85, v)) * 100) / 100;
}
export const fearLabel = (v: number) => v < 15 ? 'Lugnt' : v < 20 ? 'Normalt' : v < 30 ? 'Nervöst' : v < 40 ? 'Stor oro' : 'Panik';
export const fearColor = (v: number): 'up' | 'gold' | 'down' => v < 20 ? 'up' : v < 30 ? 'gold' : 'down';
/** Glidande medelvärde och Bollingerband (20, 2) på ett fönster. */
export function maLine(cs: Candle[], n: number): (number | null)[] { return cs.map((_, i) => i < n - 1 ? null : cs.slice(i - n + 1, i + 1).reduce((s, x) => s + x.c, 0) / n); }
export function bands(cs: Candle[], n = 20, k = 2): { up: (number | null)[]; lo: (number | null)[] } {
  const up: (number | null)[] = [], lo: (number | null)[] = [];
  cs.forEach((_, i) => { if (i < n - 1) { up.push(null); lo.push(null); return; } const w = cs.slice(i - n + 1, i + 1).map(x => x.c); const m = w.reduce((s, x) => s + x, 0) / n; const d = sd(w); up.push(m + k * d); lo.push(m - k * d); });
  return { up, lo };
}
