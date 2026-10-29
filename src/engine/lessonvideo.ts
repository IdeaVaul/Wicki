import type { LvScene } from '../types';
import { CONTENT } from '../data/content';
import { PAT } from '../data/patterns';

/** Väljer en passande graf till begrepp utan egen figur (samma regler som webben). */
const LVFIG: [RegExp, string][] = [[/fibonacci|OTE|retracement|rekyl/i, 'fib'], [/FVG|fair value|gap|lucka/i, 'gap'], [/huvud och axlar|head and shoulders/i, 'hs'], [/dubbeltopp|double top/i, 'dtop'], [/triangel/i, 'tri'], [/flagga|vimpel/i, 'flag'], [/kil\b|wedge/i, 'wedge'],
  [/RSI|överköpt|översåld|stokastisk|momentum|MACD|oscillator/i, 'rsi'], [/glidande|medelvärde|\bMA\b|EMA|SMA/i, 'ma'], [/volym|volume|POC|footprint|orderflöde|delta/i, 'volume'], [/utbrott|breakout|bryter|BOS|CHoCH/i, 'breakout'],
  [/stöd|motstånd|zon|order block|utbud|efterfrågan|likviditet|sweep|nivå|stop-loss|stopp/i, 'sr'], [/range|sidled|ackumulation|distribution|konsolider|Wyckoff/i, 'side'], [/nedtrend|faller|nedgång|baisse|krasch|blanka|säljer/i, 'down'],
  [/trend|uppgång|stiger|högre topp|swing|kanal|Elliott/i, 'up'], [/ljus|veke|candle|öppning|stängning/i, 'ohlc']];
export function lvAuto(t: string, d: string) { const x = t + ' ' + d; for (const [re, f] of LVFIG) if (re.test(x)) return f; return null; }

export function lvScenes(l: string): LvScene[] {
  const L = CONTENT[l]; const sc: LvScene[] = [];
  if (L.pat) L.pat.forEach(id => { const P = PAT[id]; sc.push({ k: 'c', t: P.n, d: P.m + ' ' + P.f, fig: id, seed: 11 }); });
  else (L.c || []).forEach(c => sc.push({ k: 'c', t: c.t, d: c.d, fig: c.fig || lvAuto(c.t, c.d), seed: 7 + sc.length * 5 }));
  return [{ k: 'intro', t: L.t, list: sc.map(s => s.t!) }, ...sc, { k: 'outro' }];
}
/** Texten som läses upp i en scen (redan översatt via t). */
export function lvSay(s: LvScene, title: string, t: (x: string) => string, ar: boolean) {
  if (s.k === 'intro') return `${t(title)}. ${t('I den här videon går vi igenom')} ${s.list!.map(t).join(ar ? '، ' : ', ')}.`;
  if (s.k === 'outro') return t('Nu testar vi det du just lärde dig. Lycka till!');
  return `${t(s.t!)}. ${t(s.d!)}`;
}
export const lvParts = (txt: string) => txt.split(/(?<=[.!?؟])\s+/).filter(Boolean);
