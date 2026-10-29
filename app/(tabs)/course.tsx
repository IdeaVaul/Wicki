import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { Redirect, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path } from 'react-native-svg';
import { useStore } from '../../src/store';
import { ALLN, UNITS, SECTIONS, RISKY, nodeName, adultLock, isMinorAge } from '../../src/engine/course';
import { addXP } from '../../src/engine/state';
import { CONTENT } from '../../src/data/content';
import { KURS } from '../../src/data/skin-dict';
import type { PathNode } from '../../src/types';
import { Btn, Card, Pill, Row, Sheet, SheetTop, T } from '../../src/ui/kit';
import { Screen } from '../../src/ui/Header';
import { PatCard, KidSheet, KidTopic, kidConcept } from '../../src/ui/sheets';

const KPX = [0.30, 0.38, 0.46, 0.38, 0.30, 0.22, 0.16, 0.22];
const NKIND: Record<string, string> = { les: 'Lektion', gen: 'Mönsterövning', mix: 'Repetition', chest: 'Skattkista', test: 'Enhetstest' };
const secOf = (ui: number) => { let s = 0; SECTIONS.forEach((x, k) => { if (x.from <= ui) s = k; }); return s; };
const ICON: Record<string, keyof typeof Ionicons.glyphMap> = { les: 'star', gen: 'bar-chart', mix: 'barbell', chest: 'gift', test: 'trophy' };

function RiskTag({ adult }: { adult?: boolean }) { const { c } = useStore(); if (adult) return <View style={{ alignSelf: 'flex-start', marginTop: 4, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 99, backgroundColor: c.downSoft, borderWidth: 1, borderColor: c.down }}><T raw w="x" s={11} c={c.down}>18+</T></View>; return <View style={{ alignSelf: 'flex-start', marginTop: 4, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 99, backgroundColor: c.downSoft, borderWidth: 1, borderColor: c.down }}><T w="x" s={11} c={c.down} upper>Hög risk</T></View>; }
function RiskNote() { const { c, S } = useStore(); const minor = S.age === 'u18' || S.age === 'u16';
  return <View style={{ backgroundColor: c.downSoft, borderRadius: 12, padding: 10, gap: 4 }}><RiskTag />
    <T s={13.5} c={c.muted}>Här lär du dig om produkter där man lätt kan förlora mer än man tror. Det är kunskap, inte en uppmaning.</T>
    {minor ? <T s={13.5} c={c.muted}>Den här enheten handlar om produkter med hög risk. Den låses upp när du är 18 år.</T> : null}</View>; }
/** Kurs: alla enheter som kort, den öppna enheten som en slingrande stig (som i skisserna). */
export default function Course() {
  const { S, c, update, buzz, t, rtl } = useStore(); const ins = useSafeAreaInsets();
  const [open, setOpen] = useState<number | null>(null);
  const [sec, setSec] = useState<number | null>(null);
  const [pickSec, setPickSec] = useState(false);
  const [pop, setPop] = useState<string | null>(null);
  const [guide, setGuide] = useState<number | null>(null);
  const [kid, setKid] = useState<KidTopic | null>(null);
  const [w, setW] = useState(340);
  const cur = useMemo(() => ALLN.find(n => !S.done[n.id] && !adultLock(S, n)), [S.done, S.age]);
  if (!S.onb) return <Redirect href="/onboarding" />;
  const curU = cur ? cur.u : -1; const openU = open != null ? open : curU;
  const go = (n: PathNode) => { setPop(null); if (adultLock(S, n)) { buzz('no'); return; } if (n.k === 'chest') { update(s => { s.done[n.id] = 1; addXP(s, 20); }); buzz('done'); return; } router.push({ pathname: '/lesson', params: { mode: 'node', id: n.id } }); };

  const path = (ui: number) => {
    const u = UNITS[ui]; const H0 = 46, RH = 88; const n0 = u.nodes.length; const tot = H0 + n0 * RH + 50;
    const ys = Array.from({ length: n0 + 1 }, (_, i) => H0 + i * RH);
    const xs = ys.map((_, i) => { const px = KPX[i % KPX.length]; return rtl ? w * (1 - px) : w * px; });
    const curI = cur && cur.u === ui ? u.nodes.indexOf(cur) : -1;
    const dn = u.nodes.filter(n => S.done[n.id]).length;
    const segs = u.nodes.map((n, k) => { const i = k + 1; const solid = !!S.done[n.id] || n === cur;
      return <Path key={n.id} d={`M${xs[i - 1]} ${ys[i - 1]}C${xs[i - 1]} ${ys[i - 1] + RH * 0.55},${xs[i]} ${ys[i] - RH * 0.55},${xs[i]} ${ys[i]}`}
        stroke={solid ? c.pri : c.muted} strokeOpacity={solid ? 0.55 : 0.45} strokeWidth={solid ? 7 : 5} strokeDasharray={solid ? undefined : '1 11'} strokeLinecap="round" fill="none" />; });
    const lab = (x: number, y: number, children: React.ReactNode, onPress: () => void, key: string) =>
      <Pressable key={key} onPress={onPress} style={{ position: 'absolute', top: y - 32, height: 64, justifyContent: 'center', ...(rtl ? { right: w - x + 46, left: 0 } : { left: x + 46, right: 0 }) }}>{children}</Pressable>;
    return <View key={'p' + ui} style={{ height: tot }} onLayout={e => setW(e.nativeEvent.layout.width)}>
      <Svg width={w} height={tot} style={{ position: 'absolute' }}>{segs}</Svg>
      <Pressable accessibilityLabel={t('Guide')} onPress={() => setGuide(ui)} style={{ position: 'absolute', left: xs[0] - 26, top: ys[0] - 26, width: 52, height: 52, borderRadius: 26, backgroundColor: c.glass, borderWidth: 1, borderColor: c.bubB, alignItems: 'center', justifyContent: 'center' }}>
        <Ionicons name="book" size={22} color={c.pri} /></Pressable>
      {lab(xs[0], ys[0], <><T w="b" s={16.5}>{`Enhet ${ui + 1}`}</T><T w="b" s={15} lines={1}>{u.title}</T><T raw s={13} c={c.muted}>{`${t('Guide')} · ${dn}/${n0} ${t('nivåer klara')}`}</T></>, () => { setOpen(-1); setPop(null); }, 'h')}
      {u.nodes.map((n, k) => { const i = k + 1; const st = adultLock(S, n) ? 'locked' : S.done[n.id] ? 'done' : n === cur ? 'cur' : (curI >= 0 && k > curI && k <= curI + 2) ? 'next' : 'locked';
        const big = st === 'cur'; const sz = big ? 70 : 60;
        const bg = st === 'done' ? c.pri : big ? c.gold : c.lock; const fg = st === 'done' ? c.on : big ? '#5A3B00' : st === 'next' ? c.ink : c.lockInk;
        const ic: keyof typeof Ionicons.glyphMap = st === 'done' ? 'checkmark' : st === 'locked' && n.k !== 'chest' && n.k !== 'test' ? 'lock-closed' : ICON[n.k];
        return <React.Fragment key={n.id}>
          <Pressable testID={'node-' + n.id} accessibilityRole="button" accessibilityLabel={t(nodeName(n))} onPress={() => { buzz('tap'); setPop(pop === n.id ? null : n.id); }}
            style={({ pressed }) => ({ position: 'absolute', left: xs[i] - sz / 2, top: ys[i] - sz / 2, width: sz, height: sz, borderRadius: sz / 2, backgroundColor: bg, alignItems: 'center', justifyContent: 'center',
              borderWidth: big ? 4 : 1, borderColor: big ? '#FFD95C' : st === 'done' ? 'transparent' : c.glassB, transform: [{ scale: pressed ? 0.94 : 1 }],
              shadowColor: big ? c.gold : c.pri, shadowOpacity: big || st === 'done' ? 0.6 : 0, shadowRadius: big ? 20 : 10, shadowOffset: { width: 0, height: 0 }, elevation: big ? 10 : 0 })}>
            <Ionicons name={ic} size={big ? 32 : 26} color={fg} /></Pressable>
          {lab(xs[i], ys[i], <><T w="b" s={big ? 18 : 16.5} c={st === 'locked' ? c.muted : c.ink} lines={2}>{nodeName(n)}</T>{NKIND[n.k] && NKIND[n.k] !== nodeName(n) ? <T s={13.5} c={c.muted}>{NKIND[n.k]}</T> : null}</>, () => { buzz('tap'); setPop(pop === n.id ? null : n.id); }, 'l' + n.id)}
          {pop === n.id ? <View style={{ position: 'absolute', left: 0, right: 0, top: ys[i] + 44, zIndex: 5, alignItems: 'center' }}>
            <Card style={{ width: 300, gap: 8, backgroundColor: c.surface, borderColor: st === 'cur' || st === 'done' ? c.bubB : c.glassB }}>
              <T w="x" s={17}>{nodeName(n)}</T>
              {k === 0 && RISKY.has(u.key) ? <RiskNote /> : null}
              {adultLock(S, n) ? <T c={c.muted}>Den här enheten är för dig som är 18 år eller äldre.</T> : st === 'locked' || st === 'next' ? <T c={c.muted}>Klara alla nivåer ovanför för att låsa upp.</T> : <>
                <T raw s={13} c={c.muted}>{t(`Nivå ${n.i + 1} av ${u.nodes.length}`)}</T>
                {n.k === 'chest' && st === 'done' ? null : <Btn testID="go" label={n.k === 'chest' ? 'Öppna' : st === 'done' ? 'Öva igen +5 XP' : `Starta +${n.k === 'test' ? 20 : 10} XP`} onPress={() => go(n)} />}</>}
            </Card></View> : null}
        </React.Fragment>; })}
    </View>;
  };

  const rows: React.ReactNode[] = []; let last = -1;
  UNITS.forEach((u, ui) => { const sc = secOf(ui); if (sec != null && sc !== sec) return;
    if (sc !== last) { last = sc; rows.push(<View key={'s' + sc} style={{ marginTop: 18, marginBottom: 2, gap: 2 }}><T w="x" s={11.5} c={c.pri} upper>{`Sektion ${sc + 1}`}</T><T w="b" s={13} c={c.muted}>{SECTIONS[sc].t}</T></View>); }
    if (ui === openU) { rows.push(path(ui)); return; }
    const all = u.nodes.length, dn = u.nodes.filter(n => S.done[n.id]).length; const ad = isMinorAge(S.age) && RISKY.has(u.key); const st = ad ? 'locked' : dn === all ? 'done' : ui === curU ? 'cur' : dn ? 'open' : 'locked';
    rows.push(<Card key={u.key} testID={'unit-' + ui} onPress={() => { setOpen(ui); setPop(null); }} style={{ flexDirection: rtl ? 'row-reverse' : 'row', alignItems: 'center', gap: 14, paddingVertical: 12 }}>
      <View style={{ width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', borderWidth: 1,
        backgroundColor: st === 'done' ? c.pri : st === 'locked' ? c.lock : c.goldSoft, borderColor: st === 'done' ? 'transparent' : st === 'locked' ? c.glassB : c.gold }}>
        <Ionicons name={st === 'done' ? 'checkmark' : st === 'locked' ? 'lock-closed' : 'star'} size={20} color={st === 'done' ? c.on : st === 'locked' ? c.lockInk : c.gold} /></View>
      <View style={{ flex: 1 }}><T w="b" s={16}>{`Enhet ${ui + 1}`}</T><T w="b" s={15} lines={2}>{u.title}</T>{RISKY.has(u.key) ? <RiskTag adult={ad} /> : null}{ad ? <T s={13} c={c.muted}>Låses upp när du är 18 år</T> : null}
        {st === 'done' ? null : <T raw s={13} c={c.muted}>{`${dn}/${all} ${t('nivåer klara')}`}</T>}</View>
      <Ionicons name={rtl ? 'chevron-back' : 'chevron-forward'} size={20} color={c.muted} />
    </Card>); });

  return <Screen>
    <ScrollView contentContainerStyle={{ paddingTop: ins.top + 10, paddingHorizontal: 16, paddingBottom: ins.bottom + 120, gap: 8 }}>
      <Row style={{ justifyContent: 'space-between', marginBottom: 4 }}>
        <T raw w="x" s={34}>{KURS[S.lang] || 'Kurs'}</T>
        <Pressable testID="sec" onPress={() => setPickSec(true)} style={{ flexDirection: rtl ? 'row-reverse' : 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 99, backgroundColor: c.glass, borderWidth: 1, borderColor: c.glassB, maxWidth: '58%' }}>
          <T w="b" s={14} lines={1}>{sec == null ? 'Alla enheter' : SECTIONS[sec].t}</T><Ionicons name="chevron-down" size={16} color={c.muted} /></Pressable>
      </Row>
      {rows}
      <T s={12.5} c={c.muted} center style={{ marginTop: 10 }}>Wicki lär ut kunskap, inte investeringsråd. All handel med värdepapper innebär risk och du kan förlora pengar.</T>
    </ScrollView>
    <Sheet visible={pickSec} onClose={() => setPickSec(false)}>
      <SheetTop title={t('Visa')} onClose={() => setPickSec(false)} />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        <Pill label="Alla enheter" on={sec == null} onPress={() => { setSec(null); setOpen(null); setPickSec(false); }} />
        {SECTIONS.map((s, k) => <Pill key={k} label={s.t} on={sec === k} onPress={() => { setSec(k); setOpen(null); setPickSec(false); }} />)}
      </View>
    </Sheet>
    {guide != null ? <Sheet visible onClose={() => setGuide(null)}>
      <SheetTop title={t(`Enhet ${guide + 1}: ${UNITS[guide].title}`)} onClose={() => setGuide(null)} />
      {UNITS[guide].les.flatMap(l => CONTENT[l].pat || []).map(id => <PatCard key={id} id={id} />)}
      {UNITS[guide].les.flatMap(l => CONTENT[l].c || []).map(cc => <Card key={cc.t} onPress={() => setKid(kidConcept(cc.t, cc.d, cc.fig))} style={{ gap: 4 }}><T w="x" s={17}>{cc.t}</T><T>{cc.d}</T><T w="x" s={12} c={c.pri} upper>✦ Steg för steg</T></Card>)}
      <KidSheet topic={kid} onClose={() => setKid(null)} />
    </Sheet> : null}
  </Screen>;
}
