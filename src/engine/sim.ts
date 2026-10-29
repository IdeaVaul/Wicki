import type { Candle, SimState, State } from '../types';
import { addXP, Q } from './state';
import { pick, ri } from './util';

/** Handelssimulatorn: samma regler som webbversionen. */
export type MkKey = 'stock' | 'fx' | 'crypto' | 'gold';
export const SIMMK: Record<MkKey, { n: string; sym: string; p0: number; vol: number; dec: number; step: number; lev: number; spr: number }> = {
  stock: { n: 'Aktie', sym: 'WICK', p0: 100, vol: 2.4, dec: 2, step: 1, lev: 1, spr: 0.0005 },
  fx: { n: 'Forex', sym: 'EURUSD', p0: 1.1, vol: 0.32, dec: 5, step: 1000, lev: 30, spr: 0.0001 },
  crypto: { n: 'Krypto', sym: 'BTCUSD', p0: 60000, vol: 3.4, dec: 0, step: 0.001, lev: 2, spr: 0.001 },
  gold: { n: 'Guld', sym: 'XAUUSD', p0: 2400, vol: 1.1, dec: 2, step: 0.01, lev: 20, spr: 0.0003 },
};
export const SIMSTOPS: [number, string][] = [[1, 'Nära'], [1.5, 'Mellan'], [2.5, 'Långt']];

function rng(seed: number) { let s = (seed >>> 0) || 1; return () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; }; }
const cache: { k: string; cs: Candle[] } = { k: '', cs: [] };
export function simSeries(s: SimState): Candle[] {
  const key = s.seed + s.mk; if (cache.k === key) return cache.cs;
  const M = SIMMK[s.mk], r = rng(s.seed), k = M.vol / 2.4; let p = M.p0, drift = 0; const out: Candle[] = [];
  for (let i = 0; i < 900; i++) {
    if (i % 45 === 0) { drift = pick([-0.35, -0.15, 0, 0.15, 0.35, 0.45]) * (0.5 + r()) * k; if (r() < 0.5) drift = -drift; }
    const o = p, c = Math.max(M.p0 * 0.05, o * (1 + (drift + (r() - 0.5) * M.vol) / 100));
    out.push({ o, h: Math.max(o, c) * (1 + r() * M.vol * 0.0033), l: Math.min(o, c) * (1 - r() * M.vol * 0.0033), c, v: 30 + r() * 70 }); p = c;
  }
  cache.k = key; cache.cs = out; return out;
}
export function simNew(S: State, mk?: MkKey, mode?: 'free' | 'chal') {
  const o: Partial<SimState> = S.sim || {}; const m = mode || 'free';
  S.sim = { v: 2, mk: mk || o.mk || 'stock', mode: m, seed: ri(1, 1e9), i: 60, cash: 10000, start: 10000, peak: 10000, pos: null, trades: [],
    risk: o.risk || 1, sm: o.sm || 1.5, tp: o.tp == null ? 2 : o.tp, end: m === 'chal' ? 260 : 899, res: null };
  return S.sim;
}
export const simGet = (S: State) => (S.sim && S.sim.v === 2 ? S.sim : simNew(S));
export const simPrice = (s: SimState) => simSeries(s)[s.i].c;
export function simAtr(s: SimState) { const cs = simSeries(s); let a = 0; for (let k = s.i - 13; k <= s.i; k++) { const c = cs[k], pc = cs[k - 1] || c; a += Math.max(c.h - c.l, Math.abs(c.h - pc.c), Math.abs(c.l - pc.c)); } return a / 14; }
export const simUnreal = (s: SimState) => (s.pos ? (simPrice(s) - s.pos.entry) * s.pos.qty * s.pos.side : 0);
export const simEquity = (s: SimState) => s.cash + simUnreal(s);
const qround = (s: SimState, q: number) => { const st = SIMMK[s.mk].step; return Math.floor(q / st + 1e-9) * st; };
export function simOrder(s: SimState, side: 1 | -1, minor = false) {
  const M = { ...SIMMK[s.mk], lev: minor ? 1 : SIMMK[s.mk].lev }, price = simPrice(s), eq = simEquity(s), d = simAtr(s) * s.sm;
  let qty = qround(s, eq * s.risk / 100 / d); const cap = qround(s, eq * M.lev / price); const capped = qty > cap; qty = Math.min(qty, cap);
  return { side, price, d, qty, stop: price - side * d, tp: s.tp ? price + side * d * s.tp : null, fee: qty * price * M.spr, realRisk: qty * d, capped, lev: M.lev };
}
export function simOpen(s: SimState, side: 1 | -1, minor = false) {
  if (s.pos || s.res || (minor && side < 0)) return false; const o = simOrder(s, side, minor); if (o.qty <= 0) return false;
  s.cash -= o.fee; s.pos = { side, qty: o.qty, entry: o.price, stop: o.stop, tp: o.tp, i: s.i, risk: o.realRisk, fee: o.fee }; return true;
}
/** Stänger positionen. Returnerar affären för feedback. */
export function simClose(S: State, s: SimState, price: number, why: string) {
  const p = s.pos; if (!p) return null; const pl = (price - p.entry) * p.qty * p.side; s.cash += pl; const net = pl - p.fee; const R = p.risk ? net / p.risk : 0;
  const tr = { pl: net, R, why, side: p.side, n: (s.trades[0]?.n || 0) + 1 }; s.trades.unshift(tr); s.trades = s.trades.slice(0, 60); s.pos = null;
  const q = Q(S); q.simxp = q.simxp || 0; if (q.simxp < 30) { addXP(S, 5); q.simxp += 5; }
  S.simRec = S.simRec || { best: 0, chal: 0, tries: 0 }; S.simRec.best = Math.max(S.simRec.best, Math.round(simEquity(s) - s.start));
  simCheck(S, s); return tr;
}
export function simCheck(S: State, s: SimState) {
  if (s.mode !== 'chal' || s.res) return; const eq = simEquity(s);
  if (eq <= s.start * 0.9) s.res = 'fail'; else if (!s.pos && s.cash >= s.start * 1.08) s.res = 'pass'; else if (s.i >= s.end) s.res = s.cash >= s.start * 1.08 ? 'pass' : 'time';
  if (s.res) {
    if (s.pos) { const p = s.pos; s.pos = null; s.cash += (simPrice(s) - p.entry) * p.qty * p.side - p.fee; }
    S.simRec = S.simRec || { best: 0, chal: 0, tries: 0 }; S.simRec.tries++; if (s.res === 'pass') { S.simRec.chal++; addXP(S, 50); }
  }
}
/** Flyttar fram n ljus. Returnerar senaste avslutade affär (om någon). */
export function simStep(S: State, s: SimState, n: number) {
  const cs = simSeries(s); let last: ReturnType<typeof simClose> = null; if (s.res) return last;
  for (let k = 0; k < n && s.i < s.end; k++) {
    s.i++; const c = cs[s.i], p = s.pos;
    if (p) {
      if (p.side > 0) { if (c.l <= p.stop) last = simClose(S, s, Math.min(p.stop, c.o), 'Stop-loss'); else if (p.tp && c.h >= p.tp) last = simClose(S, s, Math.max(p.tp, c.o), 'Vinstmål'); }
      else { if (c.h >= p.stop) last = simClose(S, s, Math.max(p.stop, c.o), 'Stop-loss'); else if (p.tp && c.l <= p.tp) last = simClose(S, s, Math.min(p.tp, c.o), 'Vinstmål'); }
    }
    s.peak = Math.max(s.peak || s.start, simEquity(s)); simCheck(S, s); if (s.res) break;
  }
  return last;
}
export function simStats(s: SimState) { const t = s.trades; if (!t.length) return null; const w = t.filter(x => x.pl > 0).length; return { n: t.length, wr: Math.round(w / t.length * 100), avg: t.reduce((a, x) => a + x.R, 0) / t.length }; }
export const simF = (v: number, d: number) => { const s = v.toFixed(d).split('.'); s[0] = s[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' '); return s.join(','); };
