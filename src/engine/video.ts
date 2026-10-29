import type { Candle, VideoDef } from '../types';
const cache: Record<string, Candle[]> = {};
/** Samma deterministiska prisserie som webbversionen (frö + ankarpunkter). */
export function vidCandles(v: VideoDef): Candle[] {
  if (cache[v.id]) return cache[v.id];
  let s = v.seed * 7919 + 13; const r = () => (s = (s * 16807) % 2147483647) / 2147483647; const A = v.a;
  const P = (i: number) => { for (let k = 1; k < A.length; k++) { const [i0, p0] = A[k - 1], [i1, p1] = A[k]; if (i <= i1) return p0 + (p1 - p0) * ((i - i0) / ((i1 - i0) || 1)); } return A[A.length - 1][1]; };
  const out: Candle[] = []; let prev = P(0);
  for (let i = 0; i < v.n; i++) { const o = prev, c = P(i) + (r() - 0.5) * 0.5, h = Math.max(o, c) + r() * 0.45, l = Math.min(o, c) - r() * 0.45; out.push({ o, h, l, c } as Candle); prev = c; }
  return (cache[v.id] = out);
}
export const vidWords = (t: string) => t.split(/\s+/).filter(Boolean).length;
export const vidMins = (v: VideoDef, tr: (s: string) => string) => Math.max(1, Math.round(v.scenes.reduce((a, s) => a + vidWords(tr(s.say)), 0) / 150 + v.scenes.length * 1.4 / 60));
