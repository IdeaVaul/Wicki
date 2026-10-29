import type { Candle, ChartSpec, Fig } from '../types';
import { C, PAT } from '../data/patterns';
export function rng(seed: number) { let s = (seed >>> 0) || 1; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
export function series(kind: string, seed: number, n = 30): Candle[] {
  const r = rng(seed); let p = 100; const out: Candle[] = [];
  for (let i = 0; i < n; i++) {
    let drift = 0; const vol = 1.3;
    if (kind === 'up' || kind === 'ma' || kind === 'rsi' || kind === 'volume') drift = 0.5; else if (kind === 'down') drift = -0.5;
    else if (kind === 'side' || kind === 'sr') drift = (100 - p) * 0.25 + (r() < 0.5 ? -1 : 1) * 0.6;
    else if (kind === 'breakout') drift = i < n - 6 ? (100 - p) * 0.25 + (r() < 0.5 ? -1 : 1) * 0.6 : 1.5;
    const o = p; let c = o + drift + (r() - 0.5) * 2 * vol;
    const boxed = kind === 'sr' || (kind === 'breakout' && i < n - 6);
    if (boxed) c = Math.max(96.3, Math.min(103.7, c));
    let h = Math.max(o, c) + r() * 1.1, l = Math.min(o, c) - r() * 1.1;
    if (boxed) { h = Math.min(h, 104); l = Math.max(l, 96); }
    out.push({ o, h, l, c, v: 30 + r() * 50 + ((kind === 'breakout' && i >= n - 6) || (kind === 'volume' && i % 7 === 3) ? 60 : 0) }); p = c;
  }
  if (kind === 'sr' || kind === 'breakout') { [4, 13, 22].forEach(i => { if (out[i]) out[i].l = 96; }); [8, 17].forEach(i => { if (out[i]) out[i].h = 104; }); }
  return out;
}
export function patCandles(id: string, seed: number) {
  const P = PAT[id], r = rng(seed); let p = 100; const cs: Candle[] = [];
  const dir = P.ctx === 'down' ? -1 : P.ctx === 'up' ? 1 : (r() < 0.5 ? 1 : -1);
  for (let i = 0; i < 7; i++) { const o = p, c = o + dir * (0.6 + r() * 0.8) + (r() - 0.5) * 0.4; cs.push(C(o, Math.max(o, c) + r() * 0.5, Math.min(o, c) - r() * 0.5, c)); p = c; }
  const pc = P.mk(p); return { cs: cs.concat(pc), start: 7, end: 7 + pc.length - 1 };
}
export function spotSeries(id: string, seed: number) {
  const P = PAT[id], r = rng(seed); let p = 100; let cs: Candle[] = []; const pre = 8 + Math.floor(r() * 6);
  for (let i = 0; i < pre; i++) { const o = p, c = o + (r() - 0.5) * 1.4; cs.push(C(o, Math.max(o, c) + r() * 0.5, Math.min(o, c) - r() * 0.5, c)); p = c; }
  const dir = P.ctx === 'down' ? -1 : P.ctx === 'up' ? 1 : (r() < 0.5 ? 1 : -1);
  for (let i = 0; i < 6; i++) { const o = p, c = o + dir * (0.6 + r() * 0.7) + (r() - 0.5) * 0.3; cs.push(C(o, Math.max(o, c) + r() * 0.4, Math.min(o, c) - r() * 0.4, c)); p = c; }
  const start = cs.length, pc = P.mk(p); cs = cs.concat(pc); p = pc[pc.length - 1].c;
  const after = /Up/.test(P.sig) ? 1 : /Down/.test(P.sig) ? -1 : (r() < 0.5 ? 1 : -1);
  for (let i = 0; i < 6; i++) { const o = p, c = o + after * (0.4 + r() * 0.6) + (r() - 0.5) * 0.6; cs.push(C(o, Math.max(o, c) + r() * 0.4, Math.min(o, c) - r() * 0.4, c)); p = c; }
  return { cs, start, end: start + pc.length - 1 };
}
export function nextSeries(id: string, seed: number, out: 'ok' | 'fail' | 'wait') {
  const P = PAT[id], r = rng(seed); let p = 100; let cs: Candle[] = []; const up = /Up/.test(P.sig);
  for (let i = 0; i < 6; i++) { const o = p, c = o + (r() - 0.5) * 1.2; cs.push(C(o, Math.max(o, c) + r() * 0.4, Math.min(o, c) - r() * 0.4, c)); p = c; }
  const dir = up ? -1 : 1;
  for (let i = 0; i < 6; i++) { const o = p, c = o + dir * (0.6 + r() * 0.7) + (r() - 0.5) * 0.3; cs.push(C(o, Math.max(o, c) + r() * 0.4, Math.min(o, c) - r() * 0.4, c)); p = c; }
  const start = cs.length, pc = P.mk(p); cs = cs.concat(pc); const end = cs.length - 1;
  const hi = Math.max(...pc.map(c => c.h)), lo = Math.min(...pc.map(c => c.l)); p = pc[pc.length - 1].c;
  const s = out === 'ok' ? (up ? 1 : -1) : out === 'fail' ? (up ? -1 : 1) : 0;
  if (out === 'wait') {
    const mid = (hi + lo) / 2, rg = (hi - lo) * 0.18;
    for (let i = 0; i < 2; i++) { const o = Math.min(hi - rg, Math.max(lo + rg, p)), c = mid + (r() - 0.5) * rg; cs.push(C(o, Math.min(hi - 0.02, Math.max(o, c) + r() * rg), Math.max(lo + 0.02, Math.min(o, c) - r() * rg), c)); p = c; }
  } else {
    const target = s > 0 ? hi + (hi - lo) * 0.35 + 0.3 : lo - (hi - lo) * 0.35 - 0.3; const n = 3;
    for (let i = 0; i < n; i++) { const o = p, c = i < n - 1 ? o + (target - o) / (n - i) + (r() - 0.5) * 0.2 : target; cs.push(C(o, Math.max(o, c) + r() * 0.3, Math.min(o, c) - r() * 0.3, c)); p = c; }
  }
  return { cs, start, end, hi, lo };
}
export function rsiOf(cs: Candle[], n = 14): (number | null)[] {
  const out: (number | null)[] = []; let ag = 0, al = 0;
  for (let i = 1; i < cs.length; i++) {
    const d = cs[i].c - cs[i - 1].c, g = Math.max(d, 0), l = Math.max(-d, 0);
    if (i <= n) { ag += g / n; al += l / n; out.push(null); continue; }
    ag = (ag * (n - 1) + g) / n; al = (al * (n - 1) + l) / n; out.push(al === 0 ? 100 : 100 - 100 / (1 + ag / al));
  }
  return [null, ...out];
}
const chart = (s: ChartSpec): Fig => ({ kind: 'chart', ...s });
/** Pris som följer en bana av punkter [tid 0–1, pris], med lite brus. */
export function pathSeries(pts: [number, number][], n: number, seed: number, opt: { noise?: number; gap?: number } = {}): Candle[] {
  const r = rng(seed);
  const P = (t: number) => { for (let k = 1; k < pts.length; k++) { if (t <= pts[k][0]) { const [t0, p0] = pts[k - 1], [t1, p1] = pts[k]; return p0 + (p1 - p0) * ((t - t0) / ((t1 - t0) || 1)); } } return pts[pts.length - 1][1]; };
  const out: Candle[] = []; let prev = P(0); const nz = opt.noise ?? 0.5;
  for (let i = 0; i < n; i++) {
    const tgt = P(i / (n - 1)); let o = prev; const jump = !!opt.gap && Math.abs(tgt - prev) > opt.gap; if (jump) o = tgt - (tgt > prev ? 0.3 : -0.3);
    const c = tgt + (r() - 0.5) * nz; let h = Math.max(o, c) + r() * 0.5, l = Math.min(o, c) - r() * 0.5;
    if (jump && out.length) { if (tgt > prev) l = Math.max(l, out[i - 1].h + 0.4); else h = Math.min(h, out[i - 1].l - 0.4); }
    out.push({ o, h, l, c, v: 30 + r() * 50 + (jump ? 70 : 0) }); prev = c;
  }
  return out;
}
const NFIG: Record<string, (s: number) => ChartSpec> = {
  line: s => ({ cs: series('up', s, 30), asLine: true }),
  chan: s => ({ cs: pathSeries([[0, 92], [.2, 98], [.3, 95], [.5, 101], [.6, 98], [.8, 104], [.9, 101], [1, 104]], 30, s), segs: [{ a: [0, 96], b: [1, 106], c: 'down' }, { a: [0, 92], b: [1, 102], c: 'up' }] }),
  hs: s => ({ cs: pathSeries([[0, 94], [.12, 100], [.2, 103], [.3, 99], [.45, 108], [.6, 99], [.72, 103], [.84, 99], [1, 93]], 32, s), lines: [{ y: 99, c: 'pri', t: 'Halslinje' }] }),
  dtop: s => ({ cs: pathSeries([[0, 93], [.25, 106], [.45, 99], [.65, 106], [.82, 99], [1, 94]], 28, s), lines: [{ y: 106, c: 'down', t: 'Motstånd' }, { y: 99, c: 'pri', t: 'Halslinje' }] }),
  dbot: s => ({ cs: pathSeries([[0, 107], [.25, 94], [.45, 101], [.65, 94], [.82, 101], [1, 106]], 28, s), lines: [{ y: 94, c: 'up', t: 'Stöd' }, { y: 101, c: 'pri', t: 'Halslinje' }] }),
  tri: s => ({ cs: pathSeries([[0, 94], [.15, 104], [.3, 97], [.45, 104], [.6, 99.5], [.75, 104], [.87, 101.7], [1, 108]], 32, s), lines: [{ y: 104, c: 'down', t: 'Motstånd' }], segs: [{ a: [.3, 97], b: [.95, 102.4], c: 'up' }] }),
  flag: s => ({ cs: pathSeries([[0, 92], [.35, 106], [.45, 103], [.55, 105], [.65, 102], [.75, 104], [.85, 101.5], [1, 110]], 30, s), segs: [{ a: [.35, 106.3], b: [.78, 103.8], c: 'down' }, { a: [.42, 102.6], b: [.87, 100.8], c: 'up' }] }),
  wedge: s => ({ cs: pathSeries([[0, 94], [.15, 100], [.27, 97], [.42, 102], [.54, 99.5], [.68, 103.2], [.78, 101.5], [.88, 103.8], [1, 96]], 32, s), segs: [{ a: [.15, 100.3], b: [.88, 104.1], c: 'down' }, { a: [.27, 96.7], b: [.82, 102], c: 'up' }] }),
  gap: s => ({ cs: pathSeries([[0, 95], [.5, 99], [.52, 103.6], [1, 107]], 26, s, { gap: 2.5 }), vol: true, h: 190 }),
  fib: s => ({ cs: pathSeries([[0, 90], [.6, 110], [.8, 102.4], [1, 108]], 30, s), lines: [{ y: 102.36, c: 'pri', t: '38,2 %' }, { y: 100, c: 'gold', t: '50 %' }, { y: 97.64, c: 'violet', t: '61,8 %' }] }),
  round: s => ({ cs: pathSeries([[0, 96], [.15, 100], [.25, 97.5], [.4, 100], [.5, 98], [.65, 100], [.8, 97.8], [1, 101.5]], 30, s), lines: [{ y: 100, c: 'pri', t: '100 kr' }] }),
};
export function figSpec(name: string, seed = 7): Fig {
  if (NFIG[name]) return chart({ pad: 16, ...NFIG[name](seed) });
  switch (name) {
    case 'ohlc': return { kind: 'ohlc' };
    case 'greenred': return chart({ cs: [C(100, 104, 99, 103), C(103, 103.5, 98, 99)], pad: 30, h: 150 });
    case 'oneGreen': return chart({ cs: [C(100, 104, 98.5, 103)], pad: 24, h: 140 });
    case 'oneRed': return chart({ cs: [C(103, 104, 98.5, 100)], pad: 24, h: 140 });
    case 'volume': return chart({ cs: series('volume', seed, 28), vol: true, h: 190 });
    case 'sr': return chart({ cs: series('sr', seed, 26), lines: [{ y: 104, c: 'down', t: 'Motstånd' }, { y: 96, c: 'up', t: 'Stöd' }] });
    case 'breakout': return chart({ cs: series('breakout', seed, 28), lines: [{ y: 104, c: 'down', t: 'Motstånd' }], vol: true, h: 190 });
    case 'ma': return chart({ cs: series('ma', seed, 40), ma: 10 });
    case 'rsi': return chart({ cs: series('rsi', seed, 40), rsi: true });
    default:
      if (PAT[name]) { const r = patCandles(name, seed); return chart({ cs: r.cs, hl: [r.start, r.end], pad: 12 }); }
      return chart({ cs: series(name, seed, 30) });
  }
}
