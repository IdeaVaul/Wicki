import type { Candle, Ex } from '../types';
import { series } from './charts';
import { REAL, type RealSet } from '../data/real';
import { kr, pick, ri } from './util';

/** Praktiska övningar: tryck ut nivåer och stop-loss i grafen, räkna själv, och läs riktiga marknadsgrafer.
 *  Alla funktioner är rena (bara slump in, en övning ut) så att de kan testas utan appen. */

let PID = 100000;
const X = (o: Omit<Ex, 'id'>): Ex => ({ ...o, id: ++PID });
const lows = (cs: Candle[]) => cs.map(x => x.l), highs = (cs: Candle[]) => cs.map(x => x.h);
const span = (cs: Candle[]) => Math.max(...highs(cs)) - Math.min(...lows(cs));
const f2 = (x: number) => Math.round(x * 100) / 100;
const C = (a: number[]): Candle => ({ o: a[0], h: a[1], l: a[2], c: a[3], v: a[4] || 0 });

/* ---------------- Tryck i grafen ---------------- */
/** Tryck där stödet ligger (sidledes marknad som studsat på samma nivå). */
export function exTapSupport(): Ex {
  const cs = series('sr', ri(1, 99999), 30); const lo = Math.min(...lows(cs)), sp = span(cs);
  return X({ t: 'tap', tk: 'sup', q: 'Tryck i grafen där stödet ligger.', cs, lo: lo - sp * 0.05, hi: lo + sp * 0.14, mark: lo,
    why: 'Stödet är den nivå där priset flera gånger slutat falla och vänt upp, här vid de lägsta bottnarna.' });
}
/** Tryck där motståndet ligger. */
export function exTapResistance(): Ex {
  const cs = series('sr', ri(1, 99999), 30); const hi = Math.max(...highs(cs)), sp = span(cs);
  return X({ t: 'tap', tk: 'res', q: 'Tryck i grafen där motståndet ligger.', cs, lo: hi - sp * 0.14, hi: hi + sp * 0.05, mark: hi,
    why: 'Motståndet är taket där priset flera gånger vänt ner, här vid de högsta topparna.' });
}
/** Du köper på sista priset i en upptrend. Var lägger du stop-loss? Rätt: strax under senaste bottnen, inte för långt bort. */
export function exTapStop(): Ex {
  const cs = series('up', ri(1, 99999), 28); const last = cs[cs.length - 1].c; const sw = Math.min(...lows(cs.slice(-7))); const sp = span(cs);
  return X({ t: 'tap', tk: 'stop', q: `Du köper på ${f2(last)}. Tryck där du lägger din stop-loss.`, cs, entry: last, lo: sw - sp * 0.12, hi: sw - sp * 0.004, mark: sw - sp * 0.04,
    why: 'Lägg stoppen strax under den senaste bottnen. Bryts den är idén fel. Ligger stoppen ovanför bottnen slås den ut av vanligt brus, och för långt ner riskerar du onödigt mycket.' });
}

/* ---------------- Räkna själv ---------------- */
/** Positionsstorlek: konto, risk i procent, ingång och stopp. Svaret skrivs in. */
export function exNumSize(): Ex {
  const acc = pick([10000, 20000, 25000, 50000]), p = pick([0.5, 1, 2]), dist = pick([1, 2, 4, 5]); const risk = acc * p / 100;
  const entry = ri(30, 180); const qty = Math.floor(risk / dist);
  return X({ t: 'num', q: `Kontot är ${kr(acc)} kr och du riskerar ${kr(p)} %. Du köper på ${entry} kr med stop-loss på ${entry - dist} kr. Hur många aktier köper du?`, ans: String(qty), unit: 'aktier',
    why: `Risk i kronor: ${kr(p)} % av ${kr(acc)} = ${kr(risk)} kr. Risk per aktie: ${entry} − ${entry - dist} = ${dist} kr. ${kr(risk)} ÷ ${dist} = ${qty} aktier.` });
}
/** Riskbelopp i kronor. */
export function exNumRisk(): Ex {
  const acc = pick([8000, 15000, 30000, 60000]), p = pick([1, 2]); const a = acc * p / 100;
  return X({ t: 'num', q: `Du har ${kr(acc)} kr och riskerar högst ${p} % per trade. Hur många kronor får du som mest förlora?`, ans: String(a), unit: 'kr', why: `${p} % av ${kr(acc)} kr är ${kr(a)} kr.` });
}
/** Målpris för en viss risk/reward. */
export function exNumTarget(): Ex {
  const e = ri(40, 150), r = pick([2, 3, 4, 5]), k = pick([2, 3]);
  return X({ t: 'num', q: `Du köper på ${e} kr med stop-loss på ${e - r} kr. Vilket målpris ger risk/reward 1:${k}?`, ans: String(e + r * k), unit: 'kr',
    why: `Risken är ${r} kr per aktie. 1:${k} betyder ${k} × ${r} = ${r * k} kr i möjlig vinst, alltså ${e} + ${r * k} = ${e + r * k} kr.` });
}

/* ---------------- Riktiga grafer ---------------- */
const cap = (s: RealSet, a: number, b: number) => `${s.name} · ${s.dates[a]} – ${s.dates[b - 1]} · ${s.src}`;
/** Ett fönster ur en riktig dataserie. n = antal ljus. */
function win(n: number, pred?: (s: RealSet, a: number) => boolean) {
  for (let k = 0; k < 40; k++) {
    const s = pick(REAL); if (!s || s.cs.length < n + 12) continue;
    const a = ri(0, s.cs.length - n - 11); if (pred && !pred(s, a)) continue;
    return { s, a, cs: s.cs.slice(a, a + n).map(C) };
  }
  return null;
}
const pct = (a: number, b: number) => Math.round((b - a) / a * 1000) / 10;

/** Vilken trend visar den riktiga grafen? Svaret räknas fram ur kurserna. */
export function exRealTrend(): Ex | null {
  const w = win(40, (s, a) => Math.abs(pct(s.cs[a][3], s.cs[a + 39][3])) > 0 && true); if (!w) return null;
  const ch = pct(w.cs[0].c, w.cs[w.cs.length - 1].c); const vol = span(w.cs) / w.cs[0].c * 100;
  const ans = Math.abs(ch) < vol * 0.25 ? 'Sidled' : ch > 0 ? 'Upptrend' : 'Nedtrend';
  return X({ t: 'mc', q: 'Riktig graf: vilken trend ser du?', opts: ['Upptrend', 'Nedtrend', 'Sidled'].map(l => ({ k: l, l })), ans,
    fig: { kind: 'chart', cs: w.cs, pad: 10, h: 190, note: cap(w.s, w.a, w.a + 40) },
    why: `Från första till sista ljuset ändrades priset ${ch > 0 ? '+' : ''}${ch} %. ${ans === 'Sidled' ? 'Rörelsen är liten jämfört med svängningarna, alltså sidled.' : ans === 'Upptrend' ? 'Högre toppar och bottnar, alltså upptrend.' : 'Lägre toppar och bottnar, alltså nedtrend.'}` });
}
/** Vad hände sen? Visar 36 ljus, svaret är de nästa 10 ljusens riktning (riktig historik). */
export function exRealNext(): Ex | null {
  const w = win(46, (s, a) => Math.abs(pct(s.cs[a + 35][3], s.cs[a + 45][3])) > 2.5); if (!w) return null;
  const before = w.cs.slice(0, 36), after = w.cs.slice(36); const ch = pct(before[35].c, after[after.length - 1].c);
  const ans = ch > 0 ? 'Upp' : 'Ner';
  return X({ t: 'mc', q: 'Riktig graf: gick priset upp eller ner de närmaste 10 ljusen?', opts: [{ k: 'Upp', l: 'Upp' }, { k: 'Ner', l: 'Ner' }], ans,
    fig: { kind: 'chart', cs: before, pad: 10, h: 190, note: cap(w.s, w.a, w.a + 36) }, reveal: w.cs,
    why: `Det gick ${ans === 'Upp' ? 'upp' : 'ner'} ${Math.abs(ch)} % de följande 10 ljusen. Ingen kan veta det i förväg. Därför bestämmer du alltid stop-loss innan du köper.` });
}
/** Tryck på stödet i en riktig graf: den lägsta nivån som priset vänt från (inte i slutet av fönstret). */
export function exRealSupport(): Ex | null {
  const w = win(40, (s, a) => { const sl = s.cs.slice(a, a + 40); const i = sl.reduce((m, x, k) => x[2] < sl[m][2] ? k : m, 0); return i > 4 && i < 32; }); if (!w) return null;
  const lo = Math.min(...lows(w.cs)), sp = span(w.cs);
  return X({ t: 'tap', tk: 'sup', q: 'Riktig graf: tryck där priset hittade stöd.', cs: w.cs, lo: lo - sp * 0.05, hi: lo + sp * 0.12, mark: lo, note: cap(w.s, w.a, w.a + 40),
    why: 'Stödet ligger vid den nivå där köparna tog över och priset vände upp, här vid den lägsta bottnen.' });
}
const real = (f: () => Ex | null, fb: () => Ex) => () => f() || fb();
export const PRACTICAL = { tap: [exTapSupport, exTapResistance, exTapStop], num: [exNumSize, exNumRisk, exNumTarget],
  real: [real(exRealTrend, exTapSupport), real(exRealNext, exTapStop), real(exRealSupport, exTapSupport)] };
