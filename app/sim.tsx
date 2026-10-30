import React, { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../src/store';
import { Btn, Card, Row, T } from '../src/ui/kit';
import { CandleChart } from '../src/ui/Chart';
import { Wick } from '../src/ui/Wick';
import type { ChartLine, SimState } from '../src/types';
import { kr } from '../src/engine/util';
import { isMinorAge } from '../src/engine/course';
import { plusOn, simPlusLock } from '../src/engine/plus';
import { SIMMK, SIMSTOPS, simClose, simEquity, simF, simGet, simNew, simOpen, simOrder, simPrice, simSeries, simStats, simStep, simUnreal, type MkKey } from '../src/engine/sim';
import { track } from '../src/analytics';

/** Handelssimulator: riskfri trading med låtsaspengar (aktie, forex, krypto, guld) och prop-utmaning. */
export default function Sim() {
  const { S, c, t, rtl, update, buzz } = useStore(); const ins = useSafeAreaInsets();
  const [side, setSide] = useState<0 | 1 | -1>(0); const [play, setPlay] = useState(false); const [msg, setMsg] = useState('');
  const mt = useRef<ReturnType<typeof setTimeout> | null>(null);
  const s: SimState = S.sim && S.sim.v === 2 ? S.sim : (null as any);
  useEffect(() => { if (!s) update(x => { simGet(x); }); }, [!!s]);
  const say = (m: string) => { setMsg(m); if (mt.current) clearTimeout(mt.current); mt.current = setTimeout(() => setMsg(''), 3200); };
  const fb = (tr: { pl: number; R: number; why: string } | null) => { if (!tr) return; buzz(tr.pl >= 0 ? 'ok' : 'no'); say(`${t(tr.why)}: ${tr.pl >= 0 ? '+' : ''}${kr(Math.round(tr.pl))} kr (${tr.R >= 0 ? '+' : ''}${tr.R.toFixed(1)}R)`); };
  const step = (n: number) => { let last: any = null; update(x => { const ss = simGet(x); last = simStep(x, ss, n); }); setTimeout(() => fb(last), 0); };
  useEffect(() => { if (!play) return; const id = setInterval(() => step(1), 520); return () => clearInterval(id); }, [play]);
  useEffect(() => { if (s && (s.res || s.i >= s.end) && play) setPlay(false); }, [s?.res, s?.i]);
  const minor = isMinorAge(S.age);
  // Utan Plus (t.ex. när Plus tagit slut): tillbaka till aktier i fri träning.
  useEffect(() => { if (s && !plusOn(S) && (s.mk !== 'stock' || s.mode === 'chal') && !s.pos) update(x => { simNew(x, 'stock', 'free'); }); }, [plusOn(S), s?.mk, s?.mode]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (s && minor && s.mode === 'chal' && !s.res && !s.pos) update(x => { simNew(x, s.mk, 'free'); }); }, [minor, s?.mode]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!s) return <View style={{ flex: 1, backgroundColor: c.bg }} />;
  const M = SIMMK[s.mk], cs = simSeries(s), vis = cs.slice(Math.max(0, s.i - 44), s.i + 1), eq = simEquity(s), pl = eq - s.start, price = simPrice(s), p = s.pos, chal = s.mode === 'chal';
  const qd = M.step < 1 ? 3 : 0;
  const lines: ChartLine[] = p ? [{ y: p.entry, c: 'pri', t: `${t(p.side > 0 ? 'Köp' : 'Blankning')} ${simF(p.entry, M.dec)}` }, { y: p.stop, c: 'down', t: `${t('Stopp')} ${simF(p.stop, M.dec)}` }, ...(p.tp ? [{ y: p.tp, c: 'up' as const, t: `${t('Mål')} ${simF(p.tp, M.dec)}` }] : [])] : [];
  const st = simStats(s), rec = S.simRec || { best: 0, chal: 0, tries: 0 }, ur = simUnreal(s);
  const seg = <V extends string | number>(opts: [V, string][], cur: V, on: (v: V) => void, id: string) =>
    <View style={{ flexDirection: rtl ? 'row-reverse' : 'row', backgroundColor: c.glass, borderColor: c.glassB, borderWidth: 1, borderRadius: 14, padding: 3, gap: 3 }}>
      {opts.map(([v, l]) => <Pressable key={String(v)} testID={id + '-' + v} accessibilityRole="button" accessibilityState={{ selected: v === cur }} onPress={() => { buzz('tap'); on(v); }}
        style={{ flex: 1, paddingVertical: 9, borderRadius: 11, backgroundColor: v === cur ? c.pri : 'transparent', alignItems: 'center' }}>
        <T w="b" s={13.5} c={v === cur ? c.on : c.ink} center>{l}</T></Pressable>)}</View>;
  const box = (k: string, v: string, col?: string) => <View style={{ flex: 1, borderRadius: 14, borderWidth: 1, borderColor: c.glassB, backgroundColor: c.glass, padding: 10 }}>
    <T s={11} w="b" c={c.muted} upper raw={k === M.sym}>{k}</T><T raw w="b" s={16} c={col}>{v}</T></View>;
  const bar = (v: number, col: string) => <View style={{ flex: 1, height: 8, borderRadius: 6, backgroundColor: c.track, overflow: 'hidden' }}><View style={{ width: `${Math.max(0, Math.min(100, v))}%`, height: '100%', backgroundColor: col, borderRadius: 6 }} /></View>;
  const o = side && !p && !s.res ? simOrder(s, side, minor) : null;
  return <View style={{ flex: 1, backgroundColor: c.bg }}>
    <ScrollView contentContainerStyle={{ paddingTop: ins.top + 8, paddingHorizontal: 16, paddingBottom: ins.bottom + 40, gap: 10 }}>
      <Row><Pressable testID="back" accessibilityLabel={t('Tillbaka')} onPress={() => { setPlay(false); router.back(); }} style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: c.glass, borderWidth: 1, borderColor: c.glassB, alignItems: 'center', justifyContent: 'center' }}>
        <Ionicons name={rtl ? 'chevron-forward' : 'chevron-back'} size={22} color={c.muted} /></Pressable></Row>
      <T w="x" s={30}>Handelssimulator</T>
      <T c={c.muted}>Riskfri träning med låtsaspengar på påhittade grafer.</T>
      {minor ? <Card style={{ padding: 12, borderColor: c.down, backgroundColor: c.downSoft }}><T s={14}>Under 18 handlar du utan hävstång och kan inte blanka. Prop-utmaningen låses upp när du är 18 år.</T></Card> : seg<'free' | 'chal'>([['free', 'Fri träning'], ['chal', plusOn(S) ? 'Prop-utmaning' : '◆ ' + t('Prop-utmaning')]], s.mode, v => { if (v === 'chal' && simPlusLock(S, 'chal')) { router.push({ pathname: '/plus', params: { from: 'sim_prop' } }); return; } setPlay(false); setSide(0); update(x => { simNew(x, s.mk, v); }); }, 'mode')}
      {seg<MkKey>((Object.keys(SIMMK) as MkKey[]).map(k => [k, simPlusLock(S, k) ? '◆ ' + t(SIMMK[k].n) : SIMMK[k].n]), s.mk, v => { if (simPlusLock(S, v)) { router.push({ pathname: '/plus', params: { from: 'sim_' + v } }); return; } if (p) { say(t('Stäng positionen först.')); return; } setPlay(false); setSide(0); update(x => { simNew(x, v, s.mode); }); }, 'mk')}
      {chal ? <Card style={{ gap: 8, padding: 12 }}>
        <Row style={{ justifyContent: 'space-between' }}><T w="b">Prop-utmaning</T><T raw s={12} c={c.muted}>{`${Math.max(0, s.end - s.i)} ${t('ljus kvar')}`}</T></Row>
        <Row><View style={{ width: 120 }}><T s={12} c={c.muted}>Mål +8 %</T></View>{bar((eq - s.start) / (s.start * 0.08) * 100, c.up)}</Row>
        <Row><View style={{ width: 120 }}><T s={12} c={c.muted}>Max förlust −10 %</T></View>{bar((s.start - eq) / (s.start * 0.1) * 100, c.down)}</Row>
      </Card> : null}
      <Row gap={8}>{box('Konto', `${kr(Math.round(eq))} kr`)}{box('Resultat', `${pl >= 0 ? '+' : ''}${kr(Math.round(pl))}`, pl >= 0 ? c.up : c.down)}{box(M.sym, simF(price, M.dec))}</Row>
      <Card style={{ padding: 8 }}><CandleChart cs={vis} lines={lines} ma={20} vol h={200} /></Card>
      {msg ? <Card style={{ padding: 10 }}><T raw w="b" s={14} center>{msg}</T></Card> : null}
      {s.res ? <Card style={{ flexDirection: rtl ? 'row-reverse' : 'row', gap: 12, alignItems: 'center', backgroundColor: s.res === 'pass' ? c.upSoft : c.glass }}>
        <Wick size={80} mood={s.res === 'pass' ? 'cheer' : 'sad'} />
        <View style={{ flex: 1, gap: 6 }}><T w="x" s={20}>{s.res === 'pass' ? 'Godkänd!' : s.res === 'fail' ? 'Kontot sprack' : 'Tiden tog slut'}</T>
          <T s={14}>{s.res === 'pass' ? 'Du nådde +8 % utan att bryta förlustgränsen. +50 XP' : s.res === 'fail' ? 'Du tappade 10 %. Så slutar de flesta prop-tester. Minska risken per affär och försök igen.' : 'Du nådde inte målet i tid. Tålamod är bra, men planen måste också ge resultat.'}</T>
          <Btn small label={t('Försök igen')} testID="sim-retry" onPress={() => update(x => { simNew(x, s.mk, 'chal'); })} style={{ alignSelf: rtl ? 'flex-end' : 'flex-start' }} /></View>
      </Card> : null}
      {o ? <Card style={{ gap: 10 }}>
        <T w="b" s={14}>Risk per affär</T>{seg<number>([[0.5, '0,5 %'], [1, '1 %'], [2, '2 %']], s.risk, v => update(x => { simGet(x).risk = v; }), 'risk')}
        <T w="b" s={14}>Stoppavstånd</T>{seg<number>(SIMSTOPS, s.sm, v => update(x => { simGet(x).sm = v; }), 'sm')}
        <T w="b" s={14}>Vinstmål</T>{seg<number>([[0, 'Inget'], [1, '1R'], [2, '2R'], [3, '3R']], s.tp, v => update(x => { simGet(x).tp = v; }), 'tp')}
        <View style={{ backgroundColor: c.track, borderRadius: 12, padding: 10, gap: 2 }}>
          <T raw s={14}>{`${t(o.side > 0 ? 'Köp' : 'Blanka')} ${simF(o.qty, qd)} ${t('st à')} ${simF(o.price, M.dec)}`}</T>
          <T raw s={14}>{`${t('Stopp:')} ${simF(o.stop, M.dec)} · ${t('risk')} ${kr(Math.round(o.realRisk))} kr`}</T>
          {o.tp ? <T raw s={14}>{`${t('Mål:')} ${simF(o.tp, M.dec)} · ${t('möjlig vinst')} ${kr(Math.round(o.realRisk * s.tp))} kr`}</T> : null}
          <T raw s={14}>{`${t('Spread-kostnad:')} ${kr(Math.round(o.fee * 100) / 100)} kr`}</T>
          {o.lev > 1 ? <T raw s={14}>{`${t('Hävstång max')} ${o.lev}:1`}</T> : null}
        </View>
        {o.capped ? <T s={13} c={c.muted}>Positionen begränsades av hävstångstaket. Din risk blir lägre än vald.</T> : null}
        <Row><Btn label={t(o.side > 0 ? 'Bekräfta köp' : 'Bekräfta blankning')} kind={o.side > 0 ? 'good' : 'bad'} disabled={o.qty <= 0} testID="sim-confirm" style={{ flex: 1 }}
          onPress={() => { const sd = o.side as 1 | -1; track('sim_trade', { mk: s.mk, mode: s.mode, side: sd }); update(x => { simOpen(simGet(x), sd, minor); }); setSide(0); buzz('tap'); }} />
          <Btn label={t('Avbryt')} kind="ghost" testID="sim-cancel" onPress={() => setSide(0)} /></Row>
      </Card> : null}
      {s.res ? null : <View style={{ flexDirection: rtl ? 'row-reverse' : 'row', flexWrap: 'wrap', gap: 8 }}>
        {p ? <Btn label={t('Stäng nu')} kind="bad" testID="sim-close" style={{ flexGrow: 1 }} onPress={() => { let tr: any = null; update(x => { const ss = simGet(x); tr = simClose(x, ss, simPrice(ss), 'Stängd'); }); setTimeout(() => fb(tr), 0); }} />
          : side ? null : <><Btn label={t('Köp')} kind="good" testID="sim-buy" style={{ flexGrow: 1 }} onPress={() => setSide(1)} />{minor ? null : <Btn label={t('Blanka')} kind="bad" testID="sim-short" style={{ flexGrow: 1 }} onPress={() => setSide(-1)} />}</>}
        <Btn small label={t(play ? 'Pausa' : 'Spela')} kind="ghost" testID="sim-play" onPress={() => setPlay(v => !v)} style={{ flexGrow: 1 }} />
        <Btn small label={t('Nästa ljus')} kind="ghost" testID="sim-step" onPress={() => step(1)} style={{ flexGrow: 1 }} />
        <Btn small label="+10" kind="ghost" testID="sim-step10" onPress={() => step(10)} style={{ flexGrow: 1 }} />
      </View>}
      {p ? <T raw s={14} c={c.muted}>{`${t(p.side > 0 ? 'Lång position' : 'Kort position')} ${simF(p.qty, qd)} · ${t('Orealiserat:')} ${ur >= 0 ? '+' : ''}${kr(Math.round(ur))} kr`}</T> : null}
      <T w="x" s={20} style={{ marginTop: 8 }}>Dina affärer</T>
      {st ? <T raw s={14} c={c.muted}>{`${st.n} ${t('affärer')} · ${st.wr} % ${t('vinnare')} · ${t('snitt')} ${st.avg.toFixed(2)}R`}</T>
        : <T s={14} c={c.muted}>Inga avslutade affärer än. Varje avslutad affär ger 5 XP (max 30 XP per dag).</T>}
      {s.trades.slice(0, 12).map(tr => <Row key={tr.n} style={{ justifyContent: 'space-between', paddingVertical: 4 }}>
        <T raw s={13.5}>{`#${tr.n} ${t(tr.side > 0 ? 'Köp' : 'Blankning')} · ${t(tr.why)}`}</T>
        <T raw s={13.5} w="b" c={tr.pl >= 0 ? c.up : c.down}>{`${tr.pl >= 0 ? '+' : ''}${kr(Math.round(tr.pl))} kr · ${tr.R >= 0 ? '+' : ''}${tr.R.toFixed(1)}R`}</T></Row>)}
      <T raw s={14} c={c.muted}>{`${t('Bästa resultat:')} ${rec.best >= 0 ? '+' : ''}${kr(rec.best)} kr · ${t('Klarade utmaningar:')} ${rec.chal}/${rec.tries}`}</T>
      <Btn small kind="ghost" label={t('Börja om med 10 000 kr')} testID="sim-reset" onPress={() => { setPlay(false); setSide(0); update(x => { simNew(x, s.mk, s.mode); }); }} />
      <T s={13} c={c.muted} center>Stoppen sätts efter hur mycket priset brukar röra sig (ATR). R betyder hur många gånger din risk du vann eller förlorade. Hävstången följer EU:s gränser för privatpersoner. Priset är påhittat.</T>
    </ScrollView>
  </View>;
}
