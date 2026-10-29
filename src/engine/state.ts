import type { Ex, State } from '../types';
import { today, yday, addDays } from './util';
import { srsValid } from './exercises';
export const HMS = 30 * 60e3;
export const SRSI = [1, 1, 3, 7, 16, 35];
export const DEFAULT: State = {
  v: 1, lang: 'sv', onb: false, goal: 20, xp: 0, xpDay: {}, done: {}, hearts: 5, heartT: 0,
  streak: { last: '', n: 0, best: 0 }, miss: {}, srs: {}, q: null, lessons: 0, perfect: 0, best60: 0,
  haptics: true, theme: 'dark', tts: false, big: false, hc: false, a: {},
};
export function normalize(s: any): State {
  const n: State = { ...DEFAULT, ...(s || {}) };
  for (const k of ['xpDay', 'done', 'miss', 'srs', 'a'] as const) if (!n[k] || typeof n[k] !== 'object') (n as any)[k] = {};
  if (!n.streak || typeof n.streak !== 'object') n.streak = { last: '', n: 0, best: 0 };
  if (!n.skin2) { n.skin2 = 1; if (n.theme === 'system') n.theme = 'dark'; }
  return n;
}
export function Q(S: State) { const t = today(); if (!S.q || S.q.d !== t) S.q = { d: t, xp: 0, lessons: 0, combo: 0, best: 0 }; return S.q; }
export function addXP(S: State, n: number) { S.xp += n; const t = today(); S.xpDay[t] = (S.xpDay[t] || 0) + n; Q(S).xp += n; const k = Object.keys(S.xpDay).sort(); while (k.length > 21) delete S.xpDay[k.shift()!]; }
export function touchStreak(S: State) { const t = today(); if (S.streak.last === t) return false; S.streak.n = S.streak.last === yday() ? S.streak.n + 1 : 1; S.streak.last = t; S.streak.best = Math.max(S.streak.best || 0, S.streak.n); return true; }
export const streakNow = (S: State) => (S.streak.last === today() || S.streak.last === yday()) ? S.streak.n : 0;
export const litToday = (S: State) => S.streak.last === today();
export function heartsNow(S: State) { if (S.hearts >= 5) { S.hearts = 5; return 5; } const g = Math.floor((Date.now() - S.heartT) / HMS); if (g > 0) { S.hearts = Math.min(5, S.hearts + g); S.heartT += g * HMS; } return S.hearts; }
export function loseHeart(S: State) { heartsNow(S); if (S.hearts >= 5) S.heartT = Date.now(); S.hearts = Math.max(0, S.hearts - 1); }
export const nextHeartMin = (S: State) => Math.max(1, Math.ceil((HMS - (Date.now() - S.heartT)) / 60e3));
export const GOAL = (S: State) => S.goal || 20;
export function srsKey(ex: Ex) { return ex.key || ex.skey || null; }
export function srsMark(S: State, ex: Ex, ok: boolean, retried: boolean) {
  const k = srsKey(ex); if (!k) return; const r = S.srs[k] || { b: 0, due: '' };
  if (ok) { if (!retried) r.b = Math.min(5, (r.b || 0) + 1); } else r.b = 0;
  r.due = addDays(ok ? SRSI[r.b] : 1); S.srs[k] = r;
}
export function dueKeys(S: State) {
  const t = today();
  return Object.entries(S.srs || {}).filter(([k, v]) => v && v.due && v.due <= t && srsValid(k))
    .sort((a, b) => a[1].due < b[1].due ? -1 : a[1].due > b[1].due ? 1 : (a[1].b || 0) - (b[1].b || 0)).map(([k]) => k);
}
export function weekDays(S: State) { const out: { key: string; date: Date; xp: number }[] = []; for (let k = 0; k < 7; k++) { const d = new Date(Date.now() - (6 - k) * 864e5); const z = new Date(d.getTime() - d.getTimezoneOffset() * 6e4).toISOString().slice(0, 10); out.push({ key: z, date: d, xp: S.xpDay[z] || 0 }); } return out; }
