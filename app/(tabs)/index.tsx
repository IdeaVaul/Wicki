import React, { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { Redirect, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../../src/store';
import { ALLN, nodeName, adultLock } from '../../src/engine/course';
import { plusLock } from '../../src/engine/plus';
import { GOAL, Q, addXP, dueKeys, heartsNow, litToday, streakNow } from '../../src/engine/state';
import { GREET, WTIPS } from '../../src/data/mascot';
import { GREET2 } from '../../src/data/skin-dict';
import { pick } from '../../src/engine/util';
import { Btn, Card, Row, T } from '../../src/ui/kit';
import { Wick } from '../../src/ui/Wick';
import { Screen } from '../../src/ui/Header';
import { BgCandles, CandlesIcon, Ring } from '../../src/ui/Deco';
import { VIDEOS } from '../../src/data/videos';
import { vidMins } from '../../src/engine/video';
import { useRefresh } from '../../src/ui/Refresh';

/** Hem: svit, XP och hjärtan, Wicki som hälsar, dagens mål och nästa lektion. */
export default function Home() {
  const { S, c, update, buzz, rtl, t } = useStore(); const ins = useSafeAreaInsets();
  const [tip, setTip] = useState<string | null>(null);
  const refresh = useRefresh(() => setTip(pick(WTIPS[S.lang] || WTIPS.sv)), ins.top);
  if (!S.onb) return <Redirect href="/onboarding" />;
  const copy = JSON.parse(JSON.stringify(S));
  const dx = Math.min(Q(copy).xp, GOAL(S)), g = GOAL(S), pct = Math.round(dx / g * 100);
  const cur = ALLN.find(n => !S.done[n.id] && !adultLock(S, n) && !plusLock(S, n));
  const G = GREET[S.lang] || GREET.sv, G2 = GREET2[S.lang] || GREET2.sv; const hr = new Date().getHours();
  const hi = G.t[hr < 5 ? 3 : hr < 12 ? 0 : hr < 18 ? 1 : hr < 23 ? 2 : 3];
  const msg = !S.lessons ? G2.r1 : g - Q(copy).xp > 0 ? G2.r2 : G2.r3;
  const due = dueKeys(S).length;
  const go = () => { if (!cur) { router.push('/practice'); return; }
    if (cur.k === 'chest') { update(s => { s.done[cur.id] = 1; addXP(s, 20); }); buzz('done'); return; }
    router.push({ pathname: '/lesson', params: { mode: 'node', id: cur.id } }); };
  const chip = (icon: keyof typeof Ionicons.glyphMap, col: string, val: string, lab: string) =>
    <View style={{ flex: 1, flexDirection: rtl ? 'row-reverse' : 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 11, borderRadius: 99, backgroundColor: c.glass, borderWidth: 1, borderColor: c.glassB }}>
      <Ionicons name={icon} size={18} color={col} /><T raw w="x" s={15}>{val}</T><T w="b" s={14}>{lab}</T></View>;
  return <Screen>
    <ScrollView refreshControl={refresh} contentContainerStyle={{ paddingTop: ins.top + 10, paddingHorizontal: 16, paddingBottom: ins.bottom + 120, gap: 14 }}>
      {S.a.focus ? null : <Row gap={8}>
        {chip('flame', litToday(S) ? '#FF9A1F' : c.lockInk, String(streakNow(S)), 'dagar')}
        {chip('star', c.gold, String(S.xp), 'XP')}
        {chip('heart', c.down, String(heartsNow(copy)), 'hjärtan')}
      </Row>}
      <View style={{ minHeight: 250, flexDirection: rtl ? 'row-reverse' : 'row', alignItems: 'flex-start', gap: 6, paddingTop: 8 }}>
        <BgCandles seed={7} n={30} style={{ top: 30, bottom: 10, [rtl ? 'left' : 'right']: -16, width: '62%' }} opacity={0.5} />
        <Pressable accessibilityLabel="Wicki" onPress={() => { buzz('tap'); setTip(pick(WTIPS[S.lang] || WTIPS.sv)); }}><Wick mood={dx >= g ? 'cheer' : 'happy'} size={150} /></Pressable>
        <View style={{ flex: 1, marginTop: 18, backgroundColor: c.bub, borderColor: c.bubB, borderWidth: 1, borderRadius: 22, padding: 16, maxWidth: 240 }}>
          {tip ? <T raw w="b" s={17}>{tip}</T> : <><T raw w="x" s={22}>{hi}</T><T raw w="b" s={18}>{msg}</T></>}
        </View>
      </View>
      {S.a.focus ? null : <Card style={{ flexDirection: rtl ? 'row-reverse' : 'row', alignItems: 'center', gap: 14 }}>
        <View style={{ flex: 1, gap: 12 }}>
          <Row gap={6}><T w="b" s={17}>Dagligt mål:</T><T raw w="b" s={17} c={c.pri}>{`${dx} / ${g} XP`}</T></Row>
          <View style={{ height: 12, borderRadius: 99, backgroundColor: c.track, overflow: 'hidden', transform: [{ scaleX: rtl ? -1 : 1 }] }}><View style={{ width: `${pct}%`, height: '100%', borderRadius: 99, backgroundColor: c.pri }} /></View>
        </View>
        <Ring pct={pct} />
      </Card>}
      {cur ? <Card onPress={go} testID="next" style={{ flexDirection: rtl ? 'row-reverse' : 'row', alignItems: 'center', gap: 14 }}>
        <View style={{ width: 58, height: 58, borderRadius: 16, backgroundColor: c.priSoft, borderWidth: 1, borderColor: c.glassB, alignItems: 'center', justifyContent: 'center' }}><CandlesIcon /></View>
        <View style={{ flex: 1, gap: 3 }}><T w="b" s={17}>{`Enhet ${cur.u + 1}`}</T><T w="b" s={16}>{nodeName(cur)}</T>
          <T raw s={14} c={c.muted}>{`${cur.k === 'les' ? 4 : 3} min · +${cur.k === 'test' ? 20 : 10} XP`}</T></View>
        <Ionicons name={rtl ? 'chevron-back' : 'chevron-forward'} size={22} color={c.muted} />
      </Card> : <Card><T w="b" s={17}>Du har klarat hela kursen!</T><T c={c.muted}>Repetera och öva så sitter kunskapen kvar.</T></Card>}
      <Btn testID="start" label={!cur ? 'Öva' : cur.k === 'chest' ? 'Öppna kistan' : 'Starta lektion'} onPress={go}
        right={<Ionicons name={rtl ? 'arrow-back' : 'arrow-forward'} size={20} color={c.on} />} />
      {(() => { const nv = VIDEOS.find(x => !(S.vids || {})[x.id]) || VIDEOS[0]; return <Card testID="video" onPress={() => router.push({ pathname: '/video', params: { id: nv.id } })} style={{ flexDirection: rtl ? 'row-reverse' : 'row', alignItems: 'center', gap: 14 }}>
        <View style={{ width: 58, height: 58, borderRadius: 16, backgroundColor: c.priSoft, borderWidth: 1, borderColor: c.glassB, alignItems: 'center', justifyContent: 'center' }}><Ionicons name="film" size={28} color={c.pri} /></View>
        <View style={{ flex: 1, gap: 3 }}><T w="b" s={17}>Videoskolan</T><T w="b" s={15}>{nv.title}</T><T raw s={14} c={c.muted}>{`${vidMins(nv, t)} ${t('min')} · ${t('Fortsätt titta')}`}</T></View>
        <Ionicons name="play" size={22} color={c.muted} /></Card>; })()}
      <Row style={{ justifyContent: 'center' }}><Ionicons name="stats-chart" size={20} color={c.muted} /><View><T s={14} c={c.muted}>Små steg idag.</T><T s={14} c={c.muted}>Större resultat imorgon.</T></View></Row>
      {due ? <Card onPress={() => router.push({ pathname: '/lesson', params: { mode: 'review' } })} testID="review"><Row>
        <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: c.priSoft, alignItems: 'center', justifyContent: 'center' }}><Ionicons name="flash" size={20} color={c.pri} /></View>
        <View style={{ flex: 1 }}><T w="b">Dagens repetition</T><T s={13} c={c.muted}>Repetera det du lärt dig innan du glömmer det.</T></View>
        <View style={{ minWidth: 30, height: 30, borderRadius: 99, backgroundColor: c.gold, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8 }}><T raw w="x" c="#3b2a00">{String(due)}</T></View>
      </Row></Card> : null}
    </ScrollView>
  </Screen>;
}
