import type { State } from '../types';
import { SECTIONS, UNITS } from './course';

/** Wicki Plus: avancerade avsnitt och delar av simulatorn kräver Plus. Risk, psykologi, bluffar och allt grundläggande är alltid gratis. */
export const PLUS_SECTIONS = ['Tidsramar, zoner och verktyg', 'Strategier', 'Marknader: forex, krypto, terminer och prop firms', 'Fundamental analys', 'Makro och nyheter', 'Tillgångsslag'];
export const PLUS_UNITS: Set<number> = (() => {
  const set = new Set<number>();
  SECTIONS.forEach((sc, i) => { if (!PLUS_SECTIONS.includes(sc.t)) return; const to = SECTIONS[i + 1]?.from ?? UNITS.length; for (let u = sc.from; u < to; u++) set.add(u); });
  return set;
})();
export const isPlusSection = (t: string) => PLUS_SECTIONS.includes(t);

/** Lojalitetstrappan: månadspriset sjunker ju längre man stannar. Säger man upp börjar man om från början. */
export const LADDER = [{ from: 0, kr: 49 }, { from: 3, kr: 39 }, { from: 12, kr: 29 }];
export const YEAR_KR = 290;
const MONTH = 30 * 86400e3;
export const nowP = (S: State) => Date.now() + (S.plus?.off || 0);
/** Hela betalda månader sedan start. */
export const plusMonths = (S: State) => S.plus ? Math.max(0, Math.floor((nowP(S) - S.plus.since) / MONTH)) : 0;
export const tierOf = (m: number) => { let i = 0; LADDER.forEach((l, k) => { if (m >= l.from) i = k; }); return i; };
export const priceNow = (S: State) => LADDER[tierOf(plusMonths(S))].kr;
/** Nästa trappsteg: hur många månader kvar och vilket pris. */
export function nextStep(S: State): { in: number; kr: number } | null {
  const m = plusMonths(S), i = tierOf(m); const n = LADDER[i + 1]; return n ? { in: n.from - m, kr: n.kr } : null;
}
const periodMs = (S: State) => (S.plus?.plan === 'y' ? 12 : 1) * MONTH;
/** När nuvarande period tar slut (nästa dragning). */
export function periodEnd(S: State, at = nowP(S)) {
  if (!S.plus) return 0; const p = periodMs(S); const n = Math.floor(Math.max(0, at - S.plus.since) / p) + 1; return S.plus.since + n * p;
}
/** Plus är aktivt tills perioden man redan betalat för tar slut, även efter uppsägning. */
export function plusOn(S: State) {
  if (!S.plus) return false; if (!S.plus.cancel) return true; return nowP(S) < periodEnd(S, S.plus.cancel);
}
export const plusLock = (S: State, n: { u: number }) => !plusOn(S) && PLUS_UNITS.has(n.u);
/** Simulatorn: aktier i fri träning är gratis, övriga marknader och prop-utmaningen kräver Plus. */
export const simPlusLock = (S: State, what: 'stock' | 'fx' | 'crypto' | 'gold' | 'chal') => !plusOn(S) && what !== 'stock';

export function startPlus(s: State, plan: 'm' | 'y') { s.plus = { plan, since: Date.now() + (s.plus?.off || 0), test: true, off: s.plus?.off || 0 }; }
export function cancelPlus(s: State) { if (s.plus && !s.plus.cancel) s.plus.cancel = nowP(s); }
/** Ångra uppsägningen innan perioden tagit slut: lojalitetspriset finns kvar. */
export function resumePlus(s: State) { if (s.plus && s.plus.cancel && plusOn(s)) delete s.plus.cancel; }
/** Testläge: spola fram tiden en månad för att se trappan. */
export function skipMonth(s: State) { if (s.plus) s.plus.off = (s.plus.off || 0) + MONTH; }
