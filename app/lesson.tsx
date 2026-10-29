import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, Share, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStore } from '../src/store';
import type { Ex, PathNode } from '../src/types';
import { NODE, UNITS } from '../src/engine/course';
import { adaptQ, buildBlitz, buildScam, buildVidQuiz, buildHunt, buildLesson, buildNext, buildPatPractice, buildPlacement, buildPractice, buildReview } from '../src/engine/exercises';
import { Q, addXP, dueKeys, heartsNow, loseHeart, nextHeartMin, srsMark, touchStreak } from '../src/engine/state';
import { pick, shuffle } from '../src/engine/util';
import { figSpec } from '../src/engine/charts';
import { PAT } from '../src/data/patterns';
import { Btn, Card, Row, Sheet, T } from '../src/ui/kit';
import { Wick } from '../src/ui/Wick';
import { FigView, CandleChart } from '../src/ui/Chart';
import { KidButton, KidSheet, KidTopic, PatCard, kidConcept, kidPattern } from '../src/ui/sheets';
import { speak, hush } from '../src/speech';
import { LessonVideo } from '../src/ui/LessonVideo';
import { breakDue } from '../src/session';

type Mode = 'node' | 'practice' | 'review' | 'hunt' | 'next' | 'blitz' | 'placement' | 'pat' | 'scam' | 'vquiz';
type LS = { lvEnd?: boolean;
  q: Ex[]; i: number; st: null | 'ok' | 'no'; sel: string | number | null; arr: number[];
  m: { sa: number | null; sb: number | null; done: number[]; err: [number, number] | null; bad: boolean };
  mist: number; ok: number; start: number; retried: number[]; phase: 'ex' | 'end' | 'nohearts';
  msg: string; end?: number; place: Record<number, { ok: number; n: number }>; plPass?: number; xp?: number; perfect?: boolean; time?: number; newBest?: boolean; quit?: boolean;
};
const SHARE_URL = 'https://claude.ai/artifact/FmvoZUXVTXHB6vpJFhZVBe';
const CHALL: Record<string, (n: number, b: boolean) => string> = {
  sv: (n, b) => b ? `Jag fick ${n} rätt på 60 sekunder i Wicki. Klarar du fler?` : `Jag klarade en lektion i Wicki med ${n} rätt. Hänger du med?`,
  en: (n, b) => b ? `I got ${n} right in 60 seconds on Wicki. Can you beat me?` : `I finished a Wicki lesson with ${n} correct. Want to join?`,
  fr: (n, b) => b ? `J'ai eu ${n} bonnes réponses en 60 secondes sur Wicki. Tu fais mieux ?` : `J'ai fini une leçon Wicki avec ${n} bonnes réponses. Tu viens ?`,
  ar: (n, b) => b ? `حصلت على ${n} إجابات صحيحة في 60 ثانية على Wicki. هل تستطيع أن تتفوق عليّ؟` : `أنهيت درسًا في Wicki بـ ${n} إجابات صحيحة. هل تنضم؟`,
};
const MSGS = ['Bra jobbat!', 'Snyggt!', 'Helt rätt!', 'Perfekt!', 'Klockrent!'];

export default function Lesson() {
  const p = useLocalSearchParams<{ mode: Mode; id?: string }>();
  const mode = (p.mode || 'node') as Mode;
  const { S, update, c, t, buzz, rtl } = useStore();
  const ins = useSafeAreaInsets();
  const node: PathNode | undefined = mode === 'node' && p.id ? NODE(p.id) : undefined;
  const practice = mode !== 'node'; const timed = mode === 'blitz'; const placement = mode === 'placement';
  const [L, setL] = useState<LS | null>(null);
  const [kid, setKid] = useState<KidTopic | null>(null);
  const [, tick] = useState(0);
  const Lref = useRef<LS | null>(null); Lref.current = L;
  const mut = (fn: (l: LS) => void) => setL(prev => { if (!prev) return prev; const n = { ...prev, m: { ...prev.m } }; fn(n); return n; });

  useEffect(() => {
    let q: Ex[] = mode === 'node' && node ? buildLesson(node) : mode === 'practice' ? buildPractice(S) : mode === 'review' ? buildReview(dueKeys(S))
      : mode === 'hunt' ? buildHunt() : mode === 'next' ? buildNext() : mode === 'blitz' ? buildBlitz() : mode === 'placement' ? buildPlacement() : mode === 'scam' ? buildScam() : mode === 'vquiz' ? buildVidQuiz(p.id || 'v1') : buildPatPractice(p.id || 'hammer');
    q = adaptQ(q, S.a, { custom: mode !== 'node' && mode !== 'practice', timed });
    const s2 = { ...S }; const h = heartsNow(s2);
    setL({ q, i: 0, st: null, sel: null, arr: [], m: { sa: null, sb: null, done: [], err: null, bad: false }, mist: 0, ok: 0, start: Date.now(), retried: [], phase: !practice && h === 0 ? 'nohearts' : 'ex', msg: '', end: timed ? Date.now() + 60000 : undefined, place: {} });
    return () => hush();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // klocka för snabbrundan
  useEffect(() => { if (!timed) return; const iv = setInterval(() => { tick(x => x + 1); const l = Lref.current; if (l && l.phase === 'ex' && l.end && Date.now() >= l.end) setL(finishL(l)); }, 250); return () => clearInterval(iv); });
  const ex = L && L.q[L.i];
  // uppläsning
  const said = useRef('');
  useEffect(() => { if (!L || !ex || L.phase !== 'ex' || ex.t === 'lvid' || !S.a.readQ || kid) return; const sig = ex.id + ':' + (L.st || ''); if (said.current === sig) return; said.current = sig; speak(L.st ? fbText(L, ex) : qText(ex), S.lang); });

  function qText(e: Ex) {
    if (e.t === 'lvid') return t(e.lv!.title);
    if (e.t === 'intro') return t(e.c!.t) + '. ' + t(e.c!.d);
    if (e.t === 'pintro') { const P = PAT[e.pat!]; return t(P.n) + '. ' + t(P.m); }
    if (e.t === 'mc') return t(e.q!) + ' ' + e.opts!.map((o, k) => `${k + 1}. ${t(o.l)}.`).join(' ');
    if (e.t === 'spot') return t(e.q!) + '. ' + t('Tryck på ett av ljusen i mönstret.');
    if (e.t === 'order') return t(e.q!) + '. ' + e.items!.map(x => t(x) + '.').join(' ');
    return t('Para ihop') + '. ' + e.pairs!.map(x => t(x.a) + '.').join(' ');
  }
  function fbText(l: LS, e: Ex) { const ok = l.st === 'ok'; let s = ok ? t(l.msg) : t('Rätt svar:') + ' ' + (e.t === 'mc' ? t(e.opts!.find(o => o.k === e.ans)!.l) : e.t === 'order' ? e.items!.map(x => t(x)).join(', ') : e.t === 'spot' ? t('Mönstret är markerat i grafen.') : ''); if (e.why) s += ' ' + t(e.why); return s; }

  function grade(ok: boolean) {
    if (!L || !ex) return;
    const retried = L.retried.includes(ex.id);
    update(s => { const q = Q(s);
      if (ok) { q.combo++; q.best = Math.max(q.best, q.combo); if (ex.key && s.miss[ex.key]) s.miss[ex.key] = Math.max(0, s.miss[ex.key] - 1); }
      else { q.combo = 0; if (ex.key) s.miss[ex.key] = (s.miss[ex.key] || 0) + 1; if (!practice) loseHeart(s); }
      if (!timed && !placement) srsMark(s, ex, ok, retried);
    });
    buzz(ok ? 'ok' : 'no');
    mut(l => { l.st = ok ? 'ok' : 'no'; if (ok) l.ok++; else l.mist++; l.msg = pick(MSGS);
      if (placement && ex.pu != null && !retried) { const r = l.place[ex.pu] || (l.place[ex.pu] = { ok: 0, n: 0 }); r.n++; if (ok) r.ok++; } });
    if (timed) setTimeout(() => advance(), 450);
  }
  function finishL(l: LS): LS {
    const perfect = l.mist === 0; let xp: number;
    if (timed) xp = Math.min(25, l.ok); else if (practice) xp = 10; else if (node && S.done[node.id]) xp = 5 + (perfect ? 5 : 0); else xp = (node?.k === 'test' ? 20 : 10) + (perfect ? 5 : 0);
    let pass = 0; if (placement) { for (let u = 0; u < 5; u++) { const r = l.place[u]; if (r && r.n && r.ok >= Math.max(1, r.n - 1)) pass++; else break; } }
    const newBest = timed && l.ok > (S.best60 || 0);
    update(s => { if (node) s.done[node.id] = 1; addXP(s, xp); s.lessons++; Q(s).lessons++; if (perfect && !timed) s.perfect++; if (practice) { heartsNow(s); s.hearts = Math.min(5, s.hearts + 1); }
      if (newBest) s.best60 = l.ok; if (placement) UNITS.slice(0, pass).forEach(u => u.nodes.forEach(n => { s.done[n.id] = 1; })); touchStreak(s); });
    buzz('done');
    return { ...l, phase: 'end', xp, perfect, time: Date.now() - l.start, plPass: placement ? pass : undefined, newBest };
  }
  function advance() {
    const prev = Lref.current; if (!prev || prev.phase !== 'ex') return;
    const l: LS = { ...prev, q: prev.q.slice(), retried: prev.retried.slice() }; const e = l.q[l.i];
    if (l.st === 'no' && !timed && !placement && !l.retried.includes(e.id)) { l.retried.push(e.id); const cp: Ex = { ...e }; if (cp.opts) cp.opts = shuffle(cp.opts.slice()); if (cp.bank) cp.bank = shuffle(cp.bank.slice()); if (cp.L) { cp.L = shuffle(cp.L.slice()); cp.R = shuffle(cp.R!.slice()); } l.q.push(cp); }
    l.i++; l.st = null; l.sel = null; l.arr = []; l.m = { sa: null, sb: null, done: [], err: null, bad: false };
    const next = l.i >= l.q.length ? finishL(l) : l; Lref.current = next; setL(next);
  }
  const matchDone = !!L && !!ex && ex.t === 'match' && L.m.done.length === ex.pairs!.length && !L.st;
  useEffect(() => { if (matchDone && Lref.current) grade(!Lref.current.m.bad); }, [matchDone]); // eslint-disable-line react-hooks/exhaustive-deps
  const leave = () => { hush(); if (breakDue(S.a.breaks)) router.replace('/pause'); else router.back(); };
  if (!L) return <View style={{ flex: 1, backgroundColor: c.bg }} />;
  const hearts = (() => { const s2 = JSON.parse(JSON.stringify(S)); return heartsNow(s2); })();

  /* ---------- skärmar ---------- */
  if (L.phase === 'nohearts' || (L.phase === 'ex' && !practice && hearts === 0 && !L.st)) return (
    <View style={{ flex: 1, backgroundColor: c.bg, paddingTop: ins.top + 20, padding: 20, alignItems: 'center', justifyContent: 'center', gap: 14 }}>
      <Wick mood="sad" size={110} anim="shake" /><T w="x" s={24} center>Slut på hjärtan</T>
      <T center c={c.muted}>Repetera dina misstag för att vinna tillbaka ett hjärta. Ett nytt hjärta kommer också var 30:e minut.</T>
      <T center c={c.muted}>{`Nästa hjärta om ${nextHeartMin(S)} min`}</T>
      <Btn label="Öva för +1 hjärta" kind="good" onPress={() => router.replace({ pathname: '/lesson', params: { mode: 'practice' } })} style={{ alignSelf: 'stretch' }} />
      <Btn label="Avsluta" kind="ghost" onPress={() => router.back()} style={{ alignSelf: 'stretch' }} />
    </View>);
  if (L.phase === 'end') { const acc = Math.round(100 * L.ok / Math.max(1, L.ok + L.mist)), sec = Math.round((L.time || 0) / 1000);
    const title = placement ? 'Nivåtestet klart!' : timed ? (L.newBest ? 'Nytt rekord!' : 'Snabbrunda klar!') : L.perfect && !practice ? 'Felfri lektion!' : 'Lektionen klar!';
    const tile = (lab: string, val: string, col: string) => <View style={{ flex: 1, borderRadius: 16, borderWidth: 2, borderColor: col, overflow: 'hidden' }}><View style={{ backgroundColor: col, paddingVertical: 4 }}><T w="x" s={11} c="#fff" center upper>{lab}</T></View><T raw w="x" s={22} c={col} center style={{ paddingVertical: 10 }}>{val}</T></View>;
    return <View style={{ flex: 1, backgroundColor: c.bg, paddingTop: ins.top + 30, paddingBottom: ins.bottom + 16, paddingHorizontal: 20, alignItems: 'center', gap: 16 }}>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, alignSelf: 'stretch' }}>
        <Wick mood="cheer" size={120} lit anim="dance" /><T w="x" s={28} c={c.gold} center>{title}</T>
        {S.a.focus ? null : <Row style={{ alignSelf: 'stretch' }}>{tile('TOTAL XP', '⚡' + L.xp, c.gold)}{tile('PRECISION', acc + '%', c.up)}{timed ? tile('RÄTT', String(L.ok), c.pri) : tile('TID', `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`, c.pri)}</Row>}
        {placement ? <T w="x" s={17} center>{L.plPass ? `Du börjar på enhet ${L.plPass + 1}: ${t(UNITS[Math.min(L.plPass, UNITS.length - 1)].title)}` : 'Du börjar från början. Det är helt rätt ställe!'}</T> : null}
        <T center c={c.muted}>Lite varje dag slår mycket ibland. Det gäller både lärande och trading.</T>
      </View>
      {placement ? null : <Btn kind="ghost" label="Utmana en kompis" testID="share" onPress={() => { const n = L.ok; const txt = (CHALL[S.lang] || CHALL.sv)(n, timed) + ' ' + SHARE_URL; Share.share({ message: txt }).catch(() => { }); }} style={{ alignSelf: 'stretch' }} />}
      <Btn label="Fortsätt" onPress={leave} style={{ alignSelf: 'stretch' }} testID="primary" />
    </View>; }

  const e = ex!;
  const prog = timed ? Math.min(1, 1 - ((L.end || 0) - Date.now()) / 60000) : Math.min(1, (L.i + (L.st === 'ok' ? 1 : L.st ? 0.5 : 0)) / L.q.length);
  const intro = e.t === 'intro' || e.t === 'pintro' || e.t === 'lvid';
  const can = intro || ((e.t === 'mc' || e.t === 'spot') && L.sel != null) || (e.t === 'order' && L.arr.length === e.items!.length);
  const primary = () => { if (L.st) { advance(); return; } if (intro) { if (e.t === 'lvid') hush(); advance(); return; }
    if (e.t === 'mc') grade(L.sel === e.ans); else if (e.t === 'spot') grade(+L.sel! >= e.start! && +L.sel! <= e.end!); else if (e.t === 'order') grade(L.arr.every((v, k) => v === k)); };
  const showSay = !!(S.a.readQ || S.a.lex || S.a.space || S.tts || S.big);

  const body = () => {
    if (e.t === 'lvid') return <LessonVideo key={e.id} ex={e} onEnded={() => mut(l => { l.lvEnd = true; })} />;
    if (e.t === 'intro') return <View style={{ gap: 12 }}><T w="x" s={13} c={c.violet} upper>✦ Nytt begrepp</T>
      <Card style={{ gap: 10 }}><T w="x" s={22}>{e.c!.t}</T>{e.c!.fig ? <FigView fig={figSpec(e.c!.fig)} /> : null}<T s={17}>{e.c!.d}</T></Card>
      <KidButton onPress={() => setKid(kidConcept(e.c!.t, e.c!.d, e.c!.fig))} /></View>;
    if (e.t === 'pintro') return <View style={{ gap: 12 }}><T w="x" s={13} c={c.violet} upper>✦ Nytt mönster</T><PatCard id={e.pat!} /><KidButton onPress={() => setKid(kidPattern(e.pat!))} /></View>;
    if (e.t === 'mc') return <View style={{ gap: 12 }}><T w="x" s={26}>{e.q}</T>{e.fig ? <FigView fig={e.fig} /> : null}
      {e.msg ? <Card style={{ gap: 8 }}><T w="b" s={13} c={c.muted}>{e.msg.from}</T><View style={{ alignSelf: rtl ? 'flex-end' : 'flex-start', maxWidth: '92%', backgroundColor: c.sunk, borderWidth: 1, borderColor: c.glassB, borderRadius: 20, borderBottomLeftRadius: rtl ? 20 : 6, borderBottomRightRadius: rtl ? 6 : 20, padding: 12 }}><T s={16.5}>{e.msg.text}</T></View></Card> : null}
      <View style={{ gap: 10 }}>{e.opts!.map((o, k) => { const st = L.st ? (o.k === e.ans ? 'ok' : o.k === L.sel ? 'no' : '') : o.k === L.sel ? 'sel' : '';
        const bc = st === 'ok' ? c.up : st === 'no' ? c.down : st === 'sel' ? c.pri : c.line, bg = st === 'ok' ? c.upSoft : st === 'no' ? c.downSoft : st === 'sel' ? c.priSoft : c.surface;
        return <Pressable key={o.k} testID={'opt-' + k} accessibilityRole="button" disabled={!!L.st} onPress={() => { buzz('tap'); if (timed) { mut(l => { l.sel = o.k; }); grade(o.k === e.ans); } else mut(l => { l.sel = o.k; }); }}
          style={{ borderWidth: 1, borderColor: st ? bc : c.glassB, backgroundColor: st ? bg : c.glass, borderRadius: 18, padding: 14, minHeight: S.a.tap ? 64 : 56, justifyContent: 'center' }}>
          <Row><View style={{ width: 26, height: 26, borderRadius: 8, borderWidth: 1, borderColor: c.glassB, alignItems: 'center', justifyContent: 'center' }}><T raw w="b" s={12} c={c.muted}>{String(k + 1)}</T></View><T w="b" s={S.a.tap ? 17 : 16} style={{ flex: 1 }}>{o.l}</T></Row></Pressable>; })}</View></View>;
    if (e.t === 'spot') return <View style={{ gap: 10 }}><T w="x" s={26}>{e.q}</T><T c={c.muted}>Tryck på ett av ljusen i mönstret.</T>
      <Card style={{ padding: 10, gap: 4 }}><T w="b" s={14} c={c.muted}>Övningsgraf</T><CandleChart cs={e.cs!} h={210} pad={10} sel={typeof L.sel === 'number' ? L.sel : null} hl={L.st ? [e.start!, e.end!] : null} onSpot={L.st ? undefined : (i => { buzz('tap'); mut(l => { l.sel = i; }); })} /></Card></View>;
    if (e.t === 'order') return <View style={{ gap: 10 }}><T w="x" s={22}>{e.q}</T><T c={c.muted}>Tryck i rätt ordning, första steget först.</T>
      {L.arr.map((k, pos) => <Pressable key={'a' + k} disabled={!!L.st} onPress={() => mut(l => { l.arr = l.arr.filter((_, j) => j !== pos); })} style={{ borderWidth: 2, borderColor: c.pri, backgroundColor: c.priSoft, borderRadius: 12, padding: 12 }}><Row><T raw w="x" c={c.pri}>{String(pos + 1)}</T><T w="b" style={{ flex: 1 }}>{e.items![k]}</T></Row></Pressable>)}
      <View style={{ height: 6 }} />
      {e.bank!.filter(k => !L.arr.includes(k)).map(k => <Pressable key={'b' + k} disabled={!!L.st} onPress={() => { buzz('tap'); mut(l => { l.arr = [...l.arr, k]; }); }} style={{ borderWidth: 2, borderBottomWidth: 4, borderColor: c.line, backgroundColor: c.surface, borderRadius: 12, padding: 12 }}><Row><T raw w="x" c={c.lockInk}>·</T><T w="b" style={{ flex: 1 }}>{e.items![k]}</T></Row></Pressable>)}</View>;
    if (e.t === 'match') { const m = L.m;
      const tapM = (side: 'l' | 'r', k: number) => { buzz('tap'); mut(l => { const mm = l.m; if (side === 'l') mm.sa = k; else mm.sb = k; mm.err = null;
        if (mm.sa != null && mm.sb != null) { if (mm.sa === mm.sb) { mm.done = [...mm.done, mm.sa]; } else { mm.err = [mm.sa, mm.sb]; mm.bad = true; } mm.sa = mm.sb = null; } });
      };
      const cell = (side: 'l' | 'r', k: number) => { const done = m.done.includes(k), err = m.err && m.err[side === 'l' ? 0 : 1] === k, sel = (side === 'l' ? m.sa : m.sb) === k;
        return <Pressable key={side + k} disabled={done || !!L.st} onPress={() => tapM(side, k)} style={{ borderWidth: 2, borderBottomWidth: 4, borderRadius: 12, padding: 10, minHeight: S.a.tap ? 70 : 58, justifyContent: 'center', opacity: done ? 0.45 : 1,
          borderColor: err ? c.down : sel ? c.pri : done ? c.up : c.line, backgroundColor: err ? c.downSoft : sel ? c.priSoft : c.surface }}><T w="b" s={14} center>{side === 'l' ? e.pairs![k].a : e.pairs![k].b}</T></Pressable>; };
      return <View style={{ gap: 12 }}><T w="x" s={22}>Para ihop</T><Row style={{ alignItems: 'flex-start' }}><View style={{ flex: 1, gap: 8 }}>{e.L!.map(k => cell('l', k))}</View><View style={{ flex: 1, gap: 8 }}>{e.R!.map(k => cell('r', k))}</View></Row></View>; }
    return null;
  };

  const ok = L.st === 'ok';
  const ansTxt = !L.st || ok ? '' : e.t === 'mc' ? t(e.opts!.find(o => o.k === e.ans)!.l) : e.t === 'order' ? e.items!.map((s, k) => `${k + 1}. ${t(s)}`).join('\n') : e.t === 'spot' ? t('Mönstret är markerat i grafen.') : '';
  const combo = S.q?.combo || 0;
  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <Row style={{ paddingTop: ins.top + 8, paddingHorizontal: 16, paddingBottom: 8 }} gap={14}>
        <Pressable testID="quit" accessibilityLabel={t('Avsluta')} onPress={() => mut(l => { l.quit = true; })} style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: c.glass, borderWidth: 1, borderColor: c.glassB, alignItems: 'center', justifyContent: 'center' }}><T raw w="b" s={18} c={c.muted}>✕</T></Pressable>
        <View style={{ flex: 1, gap: 8 }}>
          {timed ? null : <T w="b" s={15} c={c.muted}>{`Fråga ${Math.min(L.i + 1, L.q.length)} av ${L.q.length}`}</T>}
          <View style={{ height: 10, borderRadius: 99, backgroundColor: c.track, overflow: 'hidden', transform: [{ scaleX: rtl ? -1 : 1 }] }}><View style={{ width: `${Math.max(4, prog * 100)}%`, height: '100%', backgroundColor: c.pri, borderRadius: 99 }} /></View>
        </View>
        {timed ? <T raw w="x" c={c.pri}>{`⏱ ${Math.max(0, Math.ceil(((L.end || 0) - Date.now()) / 1000))}`}</T> : practice ? <T raw w="x" s={20} c={c.pri}>∞</T> : <T raw w="x" c={c.down}>{`♥ ${hearts}`}</T>}
      </Row>
      <ScrollView contentContainerStyle={{ padding: 18, gap: 10, paddingBottom: 40 }}>
        {showSay && e.t !== 'lvid' ? <Btn kind="ghost" small label="🔊 Läs upp" onPress={() => speak(qText(e), S.lang)} style={{ alignSelf: rtl ? 'flex-end' : 'flex-start' }} /> : null}
        {body()}
        {!L.st && !timed && !e.noHint && e.pat && (e.t === 'spot' || e.t === 'mc') ? <Row style={{ alignItems: 'flex-end', marginTop: 6 }} gap={12}>
          <Pressable accessibilityLabel={t('Hjälp mig förstå')} onPress={() => setKid(kidPattern(e.pat!))}><Wick size={e.t === 'spot' ? 80 : 56} /></Pressable>
          <Pressable testID="hint" onPress={() => setKid(kidPattern(e.pat!))} style={{ flex: 1, marginBottom: 24, backgroundColor: c.bub, borderColor: c.bubB, borderWidth: 1, borderRadius: 22, padding: 14 }}>
            <T w="b" s={16.5}>{e.t === 'spot' ? PAT[e.pat!].m : 'Fastnat? Tryck på mig så förklarar jag steg för steg.'}</T></Pressable>
        </Row> : null}
      </ScrollView>
      <View style={{ borderTopWidth: L.st ? 1 : 0, borderColor: ok ? c.bubB : c.down, backgroundColor: L.st ? (ok ? c.upSoft : c.downSoft) : 'transparent', borderTopLeftRadius: 26, borderTopRightRadius: 26, padding: 16, paddingBottom: ins.bottom + 16, gap: 10 }}>
        {L.st ? <Row style={{ alignItems: 'flex-start' }}><Wick mood={ok ? 'cheer' : 'sad'} size={34} lit anim={ok ? 'jump' : 'shake'} />
          <View style={{ flex: 1, gap: 4 }}>
            <T w="x" s={19} c={ok ? c.pri : c.down}>{ok ? L.msg : 'Rätt svar:'}</T>
            {ok && combo >= 3 && !S.a.focus ? <T w="x" s={13} c={c.gold}>{`${combo} i rad`}</T> : null}
            {ansTxt ? <T raw w="b" c={c.downD}>{ansTxt}</T> : null}
            {e.why && !timed ? <T s={14} c={ok ? c.upD : c.downD}>{e.why}</T> : null}
            {!timed && (e.why || !ok) ? <Pressable testID="kid-a" onPress={() => setKid({ key: 'a:' + e.id, title: 'Wicki förklarar', fb: [...(!ok && e.t === 'mc' ? [t('Rätt svar:') + ' ' + t(e.opts!.find(o => o.k === e.ans)!.l)] : []), ...(e.why ? [e.why] : [])] })}>
              <T w="x" s={12} c={ok ? c.upD : c.downD} upper>✦ Förklara steg för steg</T></Pressable> : null}
          </View></Row> : null}
        {timed && L.st ? null : e.t === 'match' && !L.st ? <Btn label="Kontrollera" disabled /> :
          <Btn testID="primary" label={e.t === 'lvid' && !L.st ? (L.lvEnd ? 'Till frågorna' : 'Hoppa till frågorna') : L.st || intro ? 'Fortsätt' : 'Kontrollera'} kind={L.st ? (ok ? 'good' : 'bad') : 'pri'} disabled={!L.st && !can} onPress={primary} />}
      </View>
      <KidSheet topic={kid} onClose={() => setKid(null)} />
      <Sheet visible={!!L.quit} onClose={() => mut(l => { l.quit = false; })}>
        <View style={{ alignItems: 'center', gap: 10 }}><Wick mood="sad" size={80} /><T w="x" s={22} center>Vill du verkligen sluta?</T><T center c={c.muted}>Du förlorar framstegen i den här lektionen.</T></View>
        <Btn label="Fortsätt lära" onPress={() => mut(l => { l.quit = false; })} />
        <Btn kind="ghost" label="Avsluta" onPress={() => { hush(); router.back(); }} />
      </Sheet>
    </View>
  );
}
