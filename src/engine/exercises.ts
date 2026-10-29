import type { Ex, A11y, PathNode, State } from '../types';
import { CONTENT } from '../data/content';
import { PAT, SIG, G1, G2, G3, PCONF } from '../data/patterns';
import { UNITS, ALLN } from './course';
import { figSpec, patCandles, series, spotSeries, nextSeries } from './charts';
import { shuffle, pick, range, ri, kr } from './util';
import { SCAMS } from '../data/youth';
import { VIDEOS } from '../data/videos';
import { lvScenes } from './lessonvideo';

let EXID = 0;
const X = (o: Omit<Ex, 'id'>): Ex => ({ ...o, id: ++EXID });
export const ALLPAT = () => G1.concat(G2, G3);

export function fromItem(lid: string, idx: number): Ex {
  const it = CONTENT[lid].q![idx]; const key = lid + ':' + idx;
  if (it.m) return X({ t: 'match', pairs: it.m.map(([a, b]) => ({ a, b })), L: shuffle(range(it.m.length)), R: shuffle(range(it.m.length)), key });
  if (it.ord) return X({ t: 'order', q: it.q, items: it.ord, bank: shuffle(range(it.ord.length)), key });
  return X({ t: 'mc', q: it.q, fig: it.fig ? figSpec(it.fig, ri(1, 999)) : null, opts: shuffle(it.o!.map((l, k) => ({ k: String(k), l }))), ans: '0', why: it.why, key });
}
const mc = (q: string, correct: string | number, wrong: (string | number)[], extra: Partial<Ex> = {}): Ex => {
  const ws = [...new Set(wrong.map(String))].filter(w => w !== String(correct)).slice(0, 3);
  return X({ t: 'mc', q, opts: shuffle([String(correct), ...ws].map(l => ({ k: l, l }))), ans: String(correct), ...extra });
};
export function exCandleColor() { const o = ri(90, 110), d = ri(1, 6) * (Math.random() < 0.5 ? -1 : 1), c = o + d, h = Math.max(o, c) + ri(1, 4), l = Math.min(o, c) - ri(1, 4);
  return mc(`Öppning ${o}, stängning ${c}, högsta ${h}, lägsta ${l}. Vilken färg får ljuset?`, c > o ? 'Grönt' : 'Rött', [c > o ? 'Rött' : 'Grönt', 'Går inte att avgöra'], { why: `Stängningen ${c} är ${c > o ? 'högre' : 'lägre'} än öppningen ${o}.` }); }
export function exCandleBody() { const o = ri(90, 110), d = ri(2, 7) * (Math.random() < 0.5 ? -1 : 1), c = o + d, h = Math.max(o, c) + ri(1, 4), l = Math.min(o, c) - ri(1, 4);
  return mc(`Öppning ${o}, stängning ${c}, högsta ${h}, lägsta ${l}. Hur stor är kroppen?`, Math.abs(d) + ' kr', [(h - l) + ' kr', (h - Math.min(o, c)) + ' kr', (Math.max(o, c) - l) + ' kr', (Math.abs(d) + 1) + ' kr'], { why: `Kroppen går från öppning till stängning: |${c} − ${o}| = ${Math.abs(d)} kr.` }); }
export function exCandleWick() { const o = ri(90, 110), d = ri(2, 6) * (Math.random() < 0.5 ? -1 : 1), c = o + d, uw = ri(1, 5), h = Math.max(o, c) + uw, l = Math.min(o, c) - ri(1, 4);
  return mc(`Öppning ${o}, stängning ${c}, högsta ${h}, lägsta ${l}. Hur lång är den övre veken?`, uw + ' kr', [(h - l) + ' kr', Math.abs(d) + ' kr', (h - Math.min(o, c)) + ' kr', (uw + 2) + ' kr'], { why: `Övre veken går från kroppens topp (${Math.max(o, c)}) till högsta (${h}): ${uw} kr.` }); }
export function exTrend() { const k = pick(['up', 'down', 'side']); const n: Record<string, string> = { up: 'Upptrend', down: 'Nedtrend', side: 'Sidled' };
  return mc('Vilken trend visar grafen?', n[k], Object.values(n), { fig: figSpec(k, ri(1, 9999)) }); }
export function exSR() { const sup = Math.random() < 0.5;
  return mc('Linjen märkt "?" – vad kallas den?', sup ? 'Stöd' : 'Motstånd', [sup ? 'Motstånd' : 'Stöd', 'Medelvärde', 'Spread'], { fig: { kind: 'chart', cs: series('sr', ri(1, 9999), 26), lines: [sup ? { y: 96, c: 'pri', t: '?' } : { y: 104, c: 'pri', t: '?' }] }, why: sup ? 'Priset har studsat upp från linjen flera gånger, alltså stöd.' : 'Priset har vänt ner vid linjen flera gånger, alltså motstånd.' }); }
const tag = (e: Ex, id: string) => { e.skey = '@:' + id; e.pat = e.pat || id; return e; };
export function exPatName(id: string, pool?: string[]) { const P = PAT[id];
  const others = shuffle((PCONF[id] || []).concat(shuffle((pool || ALLPAT()).filter(x => x !== id)))).filter((x, i, a) => a.indexOf(x) === i && x !== id).slice(0, 3);
  const r = patCandles(id, ri(1, 99999));
  return tag(mc('Vilket mönster är markerat?', P.n, others.map(x => PAT[x].n), { fig: { kind: 'chart', cs: r.cs, hl: [r.start, r.end], pad: 12 }, why: P.m }), id); }
export function exPatBias(id: string) { const P = PAT[id]; return tag(mc(`Vad signalerar ${P.n} oftast?`, SIG[P.sig], shuffle(Object.values(SIG)), { why: P.m }), id); }
export function exPatCount(id: string) { const P = PAT[id]; return tag(mc(`Hur många ljus består ${P.n} av?`, P.k + ' ljus', ['1 ljus', '2 ljus', '3 ljus', '5 ljus']), id); }
export function exStop(id: string) { const P = PAT[id]; let e: Ex;
  if (/Up/.test(P.sig)) e = mc(`Du köper efter ${P.n}. Var är en logisk stop-loss?`, 'Strax under mönstrets lägsta pris', ['Strax över mönstrets högsta pris', 'Vid första ljusets öppning', 'Ingen stop-loss behövs'], { why: 'Bryter priset under mönstrets lägsta har mönstret misslyckats.' });
  else if (/Down/.test(P.sig)) e = mc(`Du äger aktien och ser ${P.n} vid ett motstånd. Vad är en rimlig reaktion?`, 'Skydda vinsten, till exempel höj stop-loss', ['Köp mer direkt', 'Ta bort din stop-loss', 'Låna pengar och köp'], { why: 'Ett mönster nedåt är en varning. Att skydda vinsten är klokare än att öka risken.' });
  else e = mc(`Du ser en ${P.n}. Vad gör du klokast?`, 'Väntar på att nästa ljus visar riktning', ['Köper allt direkt', 'Säljer allt direkt', 'Tar bort stop-loss']);
  return tag(e, id); }
export function exSpot(id: string) { const P = PAT[id], r = spotSeries(id, ri(1, 99999)); return X({ t: 'spot', q: `Hitta: ${P.n}`, pat: id, skey: '@:' + id, cs: r.cs, start: r.start, end: r.end, why: P.m }); }
export const REVPATS = () => Object.keys(PAT).filter(id => /^rev/.test(PAT[id].sig));
export function exNext(id?: string) {
  const pid = id || pick(REVPATS()); const P = PAT[pid], up = /Up/.test(P.sig);
  const out = pick(['ok', 'ok', 'fail', 'fail', 'wait'] as const); const r = nextSeries(pid, ri(1, 99999), out);
  const A = 'Mönstret bekräftades', B = 'Mönstret misslyckades, stop-loss träffades', W = 'Inte avgjort än, vänta';
  const ans = out === 'ok' ? A : out === 'fail' ? B : W;
  const why = out === 'ok' ? (up ? 'Ett ljus stängde över mönstrets högsta pris. Det är bekräftelsen.' : 'Ett ljus stängde under mönstrets lägsta pris. Det är bekräftelsen.')
    : out === 'fail' ? (up ? 'Priset föll under mönstrets lägsta pris, där stop-loss brukar ligga.' : 'Priset steg över mönstrets högsta pris, där stop-loss brukar ligga.')
      : 'Priset är fortfarande mellan mönstrets högsta och lägsta pris. Ingen signal än.';
  return X({ t: 'mc', q: `Efter ${P.n} kom fler ljus. Vad hände?`, opts: shuffle([A, B, W].map(l => ({ k: l, l }))), ans, why, pat: pid, skey: '@:' + pid,
    fig: { kind: 'chart', cs: r.cs, h: 200, hl: [r.start, r.end], lines: [{ y: r.hi, c: 'up', t: 'Högsta' }, { y: r.lo, c: 'down', t: 'Lägsta' }], note: 'Övningsgraf, inte en riktig aktie.' } });
}
const pg = (G: string[]) => [() => exPatName(pick(G), G), () => exPatName(pick(G), G), () => exPatBias(pick(G)), () => exStop(pick(G)), () => exPatCount(pick(G))];
export function exMA() { const a = ri(20, 80), offs = pick([[-2, 1, 3, -2], [-3, -1, 2, 2], [1, -2, -1, 2], [-4, 2, 1, 1]]); const ps = offs.map(o => a + o);
  return mc(`Stängningspriser: ${ps.join(', ')}. Vad är MA4?`, a, [a + 1, a - 1, ps[3], a + 2], { why: `(${ps.join(' + ')}) ÷ 4 = ${a * 4} ÷ 4 = ${a}.` }); }
export function exRSI() { const v = pick([ri(8, 26), ri(36, 64), ri(74, 94)]); const ans = v > 70 ? 'Överköpt' : v < 30 ? 'Översålt' : 'Neutralt';
  return mc(`RSI är ${v}. Hur beskrivs det oftast?`, ans, ['Överköpt', 'Översålt', 'Neutralt'], { why: 'Över 70 kallas ofta överköpt, under 30 översålt, däremellan neutralt.' }); }
export function exRiskAmt() { const acc = pick([10000, 20000, 25000, 40000, 50000, 100000]), p = pick([0.5, 1, 2]); const a = acc * p / 100;
  return mc(`Kontot är ${kr(acc)} kr och du riskerar ${kr(p)} %. Hur många kronor får du förlora?`, kr(a) + ' kr', [kr(a * 10) + ' kr', kr(a / 10) + ' kr', kr(a * 2) + ' kr', kr(a / 2) + ' kr'], { why: `${kr(p)} % av ${kr(acc)} kr = ${kr(a)} kr.` }); }
export function exPosSize() { const risk = pick([100, 200, 300, 500, 600]); const dist = pick([1, 2, 4, 5, 10].filter(x => risk % x === 0)); const entry = ri(25, 200), qty = risk / dist;
  return mc(`Du riskerar ${risk} kr. Köp på ${entry} kr, stop-loss på ${entry - dist} kr. Hur många aktier?`, qty, [Math.round(risk / entry) || 1, qty * 2, Math.round(qty / 2), dist * 10, risk], { why: `Risk per aktie: ${entry} − ${entry - dist} = ${dist} kr. ${risk} ÷ ${dist} = ${qty} aktier.` }); }
export function exRR() { const e = ri(40, 200), r = pick([2, 3, 4, 5]), k = pick([1, 2, 3, 4]);
  return mc(`Köp ${e} kr, stop-loss ${e - r} kr, mål ${e + r * k} kr. Vilken risk/reward?`, '1:' + k, ['1:1', '1:2', '1:3', '1:4', k + ':1'], { why: `Risk ${r} kr, möjlig vinst ${r * k} kr, alltså 1:${k}.` }); }
const GEN: Record<string, (() => Ex)[]> = {
  candle: [exCandleColor, exCandleBody, exCandleWick], trend: [exTrend, exTrend, exSR], p1: pg(G1), p2: pg(G2), p3: pg(G3),
  spot: [() => exSpot(pick(ALLPAT())), () => exSpot(pick(ALLPAT())), () => exStop(pick(ALLPAT())), () => exNext()],
  ind: [exMA, exRSI], risk: [exRiskAmt, exPosSize, exRR],
};
const ALLGEN: (() => Ex)[] = [exCandleColor, exCandleBody, exCandleWick, exTrend, exSR, ...pg(ALLPAT()).slice(0, 3), exMA, exRSI, exRiskAmt, exPosSize, exRR];
type Item = [string, string | number];
const lesItems = (lid: string): Item[] => CONTENT[lid].pat ? CONTENT[lid].pat!.map(id => ['@', id] as Item) : CONTENT[lid].q!.map((_, i) => [lid, i] as Item);
const fromAny = ([l, i]: Item): Ex => l === '@' ? pick([exPatName, exPatBias, exSpot, exStop])(String(i)) : fromItem(l, +i);

export function buildLesson(n: PathNode): Ex[] {
  const u = UNITS[n.u]; let q: Ex[] = [];
  if (n.k === 'les' && CONTENT[n.l!].pat) {
    const pats = CONTENT[n.l!].pat!; const head: Ex[] = [];
    pats.forEach(id => { head.push(X({ t: 'pintro', pat: id }), exPatName(id, pats)); });
    const rest = shuffle([...pats.map(id => exPatBias(id)), ...shuffle(pats.slice()).slice(0, 2).map(id => exSpot(id)), exStop(pick(pats)), exPatCount(pick(pats))]);
    q = head.concat(rest);
  } else if (n.k === 'les') {
    const L = CONTENT[n.l!]; const items = L.q!.map((_, i) => fromItem(n.l!, i)); const intros = (L.c || []).map(c => X({ t: 'intro', c }));
    intros.forEach((c, i) => { q.push(c); if (items[i]) q.push(items[i]); }); q = q.concat(shuffle(items.slice(intros.length)));
  } else if (n.k === 'gen') q = range(10).map(() => pick(GEN[u.gen!])());
  else if (n.k === 'mix' || n.k === 'test') {
    const it = shuffle(u.les.flatMap(lesItems)).slice(0, n.k === 'mix' ? 7 : 9).map(fromAny);
    if (u.gen) it.push(...range(3).map(() => pick(GEN[u.gen!])())); q = shuffle(it);
  }
  if (n.k === 'les' && CONTENT[n.l!]) q.unshift(X({ t: 'lvid', lv: { l: n.l!, title: CONTENT[n.l!].t, sc: lvScenes(n.l!) } }));
  return q;
}
export function buildPractice(S: State): Ex[] {
  const missed = Object.entries(S.miss).filter(([k, v]) => v > 0 && CONTENT[k.split(':')[0]]).sort((a, b) => b[1] - a[1]).slice(0, 7).map(([k]) => k.split(':'));
  const it = missed.map(([l, i]) => fromItem(l, +i));
  const pool = ALLN.filter(n => n.k === 'les' && S.done[n.id] && !CONTENT[n.l!].pat).map(n => n.l!);
  while (it.length < 7 && pool.length) { const l = pick(pool); it.push(fromItem(l, ri(0, CONTENT[l].q!.length - 1))); }
  while (it.length < 10) it.push(pick(ALLGEN)());
  return shuffle(it);
}
export const buildBlitz = () => range(60).map(() => pick(ALLGEN)());
export const buildHunt = () => range(10).map(() => exSpot(pick(ALLPAT())));
export const buildNext = () => range(10).map(() => exNext());
export const buildPatPractice = (id: string) => shuffle([exPatName(id), exPatBias(id), exSpot(id), exSpot(id), exStop(id), exPatName(id), exPatCount(id)]);
export function buildPlacement(): Ex[] {
  const q: Ex[] = [];
  [0, 1, 2, 3, 4].forEach(u => { const it: Ex[] = []; let g = 0; const pool = shuffle(UNITS[u].les.flatMap(lesItems));
    while (it.length < 3 && g < pool.length) { const e = fromAny(pool[g++]); if (e.t !== 'match') it.push(e); }
    it.forEach(e => { e.pu = u; }); q.push(...it); });
  return q;
}
export function srsValid(k: string) { if (k.startsWith('@:')) return !!PAT[k.slice(2)]; const [l, i] = k.split(':'); return !!(CONTENT[l] && CONTENT[l].q && CONTENT[l].q![+i]); }
export function buildReview(keys: string[]): Ex[] {
  return shuffle(keys.slice(0, 12).map(k => { if (k.startsWith('@:')) return pick([exPatName, exPatBias, exSpot, exStop])(k.slice(2)); const [l, i] = k.split(':'); return fromItem(l, +i); }));
}
/** Anpassningar: färre alternativ och korta lektioner. */
export function adaptQ(q: Ex[], A: A11y, o: { custom?: boolean; timed?: boolean }): Ex[] {
  if (A.fewer) q.forEach(ex => { if (ex.t === 'mc' && ex.opts && ex.opts.length > 3) { let w = 0; ex.opts = ex.opts.filter(op => op.k === ex.ans || w++ < 2); } });
  if (A.short && !o.timed && !o.custom) { const teach = q.filter(e => e.t === 'intro' || e.t === 'pintro').length; q = q.slice(0, Math.max(6, teach * 2)); }
  return q;
}

/** Bedrägeri eller inte? 10 meddelanden i slumpad ordning. */
export function buildScam(): Ex[] {
  return shuffle(SCAMS.slice()).map(sc => X({ t: 'mc', noHint: true, q: 'Bedrägeri eller inte?', msg: { from: sc.from, text: sc.msg },
    opts: [{ k: 's', l: 'Bedrägeri' }, { k: 'n', l: 'Inte bedrägeri' }], ans: sc.scam ? 's' : 'n', why: sc.why }));
}

/** Tre frågor efter en video i Videoskolan. */
export function buildVidQuiz(id: string): Ex[] {
  const v = VIDEOS.find(x => x.id === id) || VIDEOS[0];
  return v.quiz.map(q => X({ t: 'mc', noHint: true, q: q.q, opts: shuffle(q.o.map((l, k) => ({ k: String(k), l }))), ans: '0' }));
}
