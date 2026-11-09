import type { State } from '../types';
import { today, yday } from './util';

/** Svitsystemet, inspirerat av Duolingo: skydd som räddar en missad dag, lagning inom ett dygn,
 *  milstolpar som firas och ett välkommen-tillbaka för den som varit borta länge. */
export const MILES = [3, 7, 14, 30, 50, 100, 200, 365];
export const MAX_FREEZE = 2;
export type SX = { freeze: number; used?: string; froze?: number; repair?: { prev: number; day: string; need: number; done: number }; mile?: number; back?: string; seenUsed?: string };
export const sx = (S: State): SX => { const g = (S as any).sx as SX | undefined; if (g) return g; const n: SX = { freeze: 1 }; (S as any).sx = n; return n; };

const dayNum = (d: string) => Math.round(new Date(d + 'T12:00:00').getTime() / 864e5);
/** Antal hela dagar mellan senaste aktivitet och i dag (1 = i går). */
export const gapDays = (S: State) => S.streak.last ? dayNum(today()) - dayNum(S.streak.last) : 0;

/** Körs när appen öppnas. Använder svitskydd, erbjuder lagning eller markerar återkomst. */
export function checkStreak(S: State) {
  const x = sx(S); const t = today(); const gap = gapDays(S);
  if (!S.streak.last || gap <= 1) { if (x.repair && x.repair.day !== t) delete x.repair; return; }
  const missed = gap - 1;
  if (S.streak.n > 0 && missed <= x.freeze && missed <= MAX_FREEZE) {
    x.freeze -= missed; x.used = t; x.froze = missed; S.streak.last = yday(); return;
  }
  if (S.streak.n >= 2 && missed === 1 && (!x.repair || x.repair.day !== t)) x.repair = { prev: S.streak.n, day: t, need: 2, done: 0 };
  if (gap >= 7 && x.back !== t) x.back = t;
}

/** Körs när en lektion är klar. Tänder dagens låga, räknar lagning, ger skydd och returnerar en ny milstolpe. */
export function lessonDone(S: State): { mile?: number; repaired?: boolean; freeze?: boolean } {
  const x = sx(S); const t = today(); const out: { mile?: number; repaired?: boolean; freeze?: boolean } = {};
  const was = S.streak.last === t;
  if (!was) { S.streak.n = S.streak.last === yday() ? S.streak.n + 1 : 1; S.streak.last = t; }
  if (x.repair && x.repair.day === t) {
    x.repair.done++; if (x.repair.done >= x.repair.need) { S.streak.n = x.repair.prev + 1; delete x.repair; out.repaired = true; }
  }
  S.streak.best = Math.max(S.streak.best || 0, S.streak.n);
  if (!was || out.repaired) {
    if (S.streak.n % 7 === 0 && x.freeze < MAX_FREEZE) { x.freeze++; out.freeze = true; }
    const m = MILES.filter(v => v <= S.streak.n).pop(); if (m && (x.mile || 0) < m) { x.mile = m; out.mile = m; }
  }
  if (x.back) delete x.back;
  return out;
}
export const nextMile = (n: number) => MILES.find(v => v > n) || n + 100;
