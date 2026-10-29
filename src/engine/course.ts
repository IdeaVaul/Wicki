import { CONTENT, UNIT_DEFS, GENNAME, GLOSS_EXTRA } from '../data/content';
import { NEWC, NEWU, ORDER, RISKU } from '../data/course2';
Object.assign(CONTENT, NEWC);
export { SECTIONS } from '../data/course2';
import type { PathNode, Unit } from '../types';
const ALLU = [...UNIT_DEFS, ...NEWU];
const BYK: Record<string, (typeof ALLU)[number]> = Object.fromEntries(ALLU.map(u => [u.key, u]));
const ORDERED = ORDER.length ? ORDER.map(k => BYK[k]).filter(Boolean) : ALLU;
/** Enheter som rör produkter med hög risk (hävstång, blankning, daytrading m.m.). */
export const RISKY = new Set(RISKU);
export const UNITS: Unit[] = ORDERED.map((u, ui) => {
  const N: Omit<PathNode, 'id' | 'u' | 'i'>[] = u.les.map(l => ({ k: 'les' as const, l }));
  if (u.gen) N.push({ k: 'gen' });
  N.push({ k: 'mix' }, { k: 'chest' }, { k: 'test' });
  return { ...u, nodes: N.map((n, i) => ({ ...n, id: u.key + '-' + i, u: ui, i })) };
});
export const ALLN: PathNode[] = UNITS.flatMap(u => u.nodes);
export const NODE = (id: string) => ALLN.find(n => n.id === id);
export function nodeName(n: PathNode): string {
  const u = UNITS[n.u];
  return n.k === 'les' ? CONTENT[n.l!].t : n.k === 'gen' ? GENNAME[u.gen!] : n.k === 'mix' ? 'Repetition' : n.k === 'chest' ? 'Skattkista' : 'Enhetstest';
}
export const GLOSS: [string, string][] = (() => {
  const m = new Map<string, string>();
  Object.values(CONTENT).forEach(L => { (L.c || []).forEach(c => m.set(c.t, c.d)); (L.q || []).forEach(q => (q.m || []).forEach(([a, b]) => { if (!m.has(a)) m.set(a, b); })); });
  GLOSS_EXTRA.forEach(([a, b]) => m.set(a, b));
  return [...m.entries()].sort((a, b) => a[0].localeCompare(b[0], 'sv'));
})();
export const CFIG: Record<string, string> = (() => { const m: Record<string, string> = {}; Object.values(CONTENT).forEach(L => (L.c || []).forEach(c => { if (c.fig) m[c.t] = c.fig; })); return m; })();

/** 18-årsgräns: högriskenheter är låsta för den som angett att den är under 18. */
export const isMinorAge = (a?: string) => a === 'u18' || a === 'u16';
export const adultLock = (S: { age?: string }, n: { u: number }) => isMinorAge(S.age) && RISKY.has(UNITS[n.u].key);
