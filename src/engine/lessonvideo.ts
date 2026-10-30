import type { LvScene } from '../types';
import { CONTENT } from '../data/content';
import { PAT } from '../data/patterns';
import { LVX } from '../data/lvx';
const LI: Record<string, number> = { sv: 0, en: 1, fr: 2, ar: 3 };

/** Väljer en passande graf till begrepp utan egen figur (samma regler som webben). */
const LVFIG: [RegExp, string][] = [[/fibonacci|OTE|retracement|rekyl/i, 'fib'], [/FVG|fair value|gap|lucka/i, 'gap'], [/huvud och axlar|head and shoulders/i, 'hs'], [/dubbeltopp|double top/i, 'dtop'], [/triangel/i, 'tri'], [/flagga|vimpel/i, 'flag'], [/kil\b|wedge/i, 'wedge'],
  [/RSI|överköpt|översåld|stokastisk|momentum|MACD|oscillator/i, 'rsi'], [/glidande|medelvärde|\bMA\b|EMA|SMA/i, 'ma'], [/volym|volume|POC|footprint|orderflöde|delta/i, 'volume'], [/utbrott|breakout|bryter|BOS|CHoCH/i, 'breakout'],
  [/stöd|motstånd|zon|order block|utbud|efterfrågan|likviditet|sweep|nivå|stop-loss|stopp/i, 'sr'], [/range|sidled|ackumulation|distribution|konsolider|Wyckoff/i, 'side'], [/nedtrend|faller|nedgång|baisse|krasch|blanka|säljer/i, 'down'],
  [/trend|uppgång|stiger|högre topp|swing|kanal|Elliott/i, 'up'], [/ljus|veke|candle|öppning|stängning/i, 'ohlc']];
export function lvAuto(t: string, d: string) { const x = t + ' ' + d; for (const [re, f] of LVFIG) if (re.test(x)) return f; return null; }

export function lvScenes(l: string): LvScene[] {
  const L = CONTENT[l]; const X = LVX[l]; const sc: LvScene[] = []; let n = 0;
  if (L.pat) L.pat.forEach(id => { const P = PAT[id]; sc.push({ k: 'c', t: P.n, d: P.m + ' ' + P.f, fig: id, seed: 11, n: ++n }); });
  else (L.c || []).forEach((c, i) => {
    const fig = c.fig || lvAuto(c.t, c.d), seed = 7 + i * 5; sc.push({ k: 'c', t: c.t, d: c.d, fig, seed, n: ++n });
    const e = X?.c?.[i]; if (e) sc.push({ k: 'cx', t: c.t, fig, seed: seed + 2, n, ex: e[0], er: e[1] });
  });
  return [{ k: 'intro', t: L.t, list: sc.filter(s => s.k === 'c').map(s => s.t!), hook: X?.h }, ...sc, { k: 'outro', key: X?.k }];
}
/** Texten som läses upp i en scen (redan översatt via t). Exempel, misstag, krok och sammanfattning finns på alla fyra språk. */
export function lvSay(s: LvScene, title: string, t: (x: string) => string, ar: boolean, lang = 'sv') {
  const i = LI[lang] ?? 0;
  if (s.k === 'intro') {
    const tt = t(title);
    return `${tt}${/[.!?؟]$/.test(tt) ? '' : '.'} ${s.hook ? s.hook[i] + ' ' : ''}${t('I den här videon går vi igenom')} ${s.list!.map(t).join(ar ? '، ' : ', ')}.`;
  }
  if (s.k === 'outro') return `${s.key ? s.key[i] + ' ' : ''}${t('Nu testar vi det du just lärde dig. Lycka till!')}`;
  if (s.k === 'cx') return `${s.ex![i]} ${s.er![i]}`;
  return `${t(s.t!)}. ${t(s.d!)}`;
}
export const lvParts = (txt: string) => txt.split(/(?<=[.!?؟])\s+/).filter(Boolean);
