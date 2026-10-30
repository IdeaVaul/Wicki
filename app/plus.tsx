import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../src/store';
import { Btn, Card, Row, T } from '../src/ui/kit';
import { Wick } from '../src/ui/Wick';
import { LADDER, YEAR_KR, cancelPlus, nextStep, periodEnd, plusMonths, plusOn, priceNow, resumePlus, skipMonth, startPlus, tierOf } from '../src/engine/plus';
import { PL } from '../src/data/plus-dict';
import { track } from '../src/analytics';

const LOC: Record<string, string> = { sv: 'sv-SE', en: 'en-GB', fr: 'fr-FR', ar: 'ar' };

/** Wicki Plus: välj plan, se lojalitetstrappan, hantera och säg upp. Testversionen gör låtsasköp – inga pengar dras. */
export default function Plus() {
  const p = useLocalSearchParams<{ from?: string }>();
  const { S, c, rtl, update, buzz } = useStore(); const ins = useSafeAreaInsets();
  const L = PL[S.lang] || PL.sv; const [plan, setPlan] = useState<'m' | 'y'>('m'); const [ask, setAsk] = useState(false);
  const on = plusOn(S); const sub = !!S.plus && on;
  const date = (ms: number) => new Date(ms).toLocaleDateString(LOC[S.lang] || 'sv-SE', { day: 'numeric', month: 'long', year: 'numeric' });
  useEffect(() => { if (!sub) track('paywall_view', { from: p.from || 'direct' }); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const close = <Row style={{ justifyContent: 'space-between' }}>
    <Pressable testID="close" accessibilityLabel={L.close} onPress={() => router.back()} style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: c.glass, borderWidth: 1, borderColor: c.glassB, alignItems: 'center', justifyContent: 'center' }}>
      <Ionicons name="close" size={22} color={c.muted} /></Pressable>
    <View style={{ paddingHorizontal: 10, paddingVertical: 5, borderRadius: 99, backgroundColor: c.goldSoft, borderWidth: 1, borderColor: c.gold }}><T raw w="b" s={12} c={c.gold}>{L.test}</T></View>
  </Row>;

  // Trappan: tre steg, nuvarande markerat.
  const cur = sub && S.plus!.plan === 'm' ? tierOf(plusMonths(S)) : -1;
  const ladder = <Card style={{ gap: 10 }}>
    <T raw w="x" s={17}>{L.ladderT}</T>
    {LADDER.map((l, i) => { const here = i === cur; const past = cur > i;
      return <Row key={i} gap={12} style={{ alignItems: 'center' }}>
        <View style={{ width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', backgroundColor: here ? c.pri : past ? c.priSoft : c.glass, borderWidth: 1, borderColor: here ? c.pri : c.glassB }}>
          <Ionicons name={past ? 'checkmark' : i === 0 ? 'play' : 'arrow-down'} size={16} color={here ? c.on : c.pri} /></View>
        <View style={{ flex: 1 }}><T raw w="b" s={15.5}>{i === 0 ? L.step0 : L.stepN(l.from)}</T>{here ? <T raw s={12.5} c={c.pri} w="b">{L.youHere}</T> : null}</View>
        <T raw w="x" s={18} c={i === LADDER.length - 1 ? c.up : c.ink}>{`${l.kr} kr`}</T>
      </Row>; })}
    <View style={{ flexDirection: rtl ? 'row-reverse' : 'row', gap: 8, alignItems: 'flex-start', backgroundColor: c.downSoft, borderRadius: 14, padding: 10, borderWidth: 1, borderColor: c.glassB }}>
      <Ionicons name="warning" size={18} color={c.down} /><T raw s={13.5} style={{ flex: 1 }}>{L.loseNote}</T></View>
  </Card>;

  const perks = <Card style={{ gap: 10 }}>
    <T raw w="x" s={17}>{L.perksT}</T>
    {L.perks.map((x, i) => <Row key={i} gap={10} style={{ alignItems: 'flex-start' }}><Ionicons name="checkmark-circle" size={20} color={c.up} /><T raw s={15} style={{ flex: 1 }}>{x}</T></Row>)}
    <T raw s={13} c={c.muted}>{L.freeNote}</T>
  </Card>;

  if (sub) {
    const P = S.plus!; const m = plusMonths(S); const nx = nextStep(S); const end = periodEnd(S, P.cancel || undefined);
    return <View style={{ flex: 1, backgroundColor: c.bg }}>
      <ScrollView contentContainerStyle={{ paddingTop: ins.top + 8, paddingHorizontal: 20, paddingBottom: ins.bottom + 40, gap: 14 }}>
        {close}
        <View style={{ alignItems: 'center', gap: 6 }}><Wick size={90} mood="cheer" lit /><T raw w="x" s={28} center>{L.mine}</T>
          <T raw c={c.muted} center>{P.plan === 'y' ? L.yearly(YEAR_KR) : L.monthly(priceNow(S))}</T></View>
        <Card style={{ gap: 6 }}>
          <Row style={{ justifyContent: 'space-between' }}><T raw c={c.muted}>{L.member}</T><T raw w="b">{L.months(m)}</T></Row>
          <Row style={{ justifyContent: 'space-between' }}><T raw c={c.muted}>{P.cancel ? L.endsOn : L.nextPay}</T><T raw w="b">{date(end)}</T></Row>
          {P.plan === 'm' && nx && !P.cancel ? <T raw s={14} c={c.pri} w="b">{L.nextStep(nx.in, nx.kr)}</T> : null}
        </Card>
        {P.plan === 'm' ? ladder : null}
        {P.cancel ? <>
          <Card style={{ gap: 8, borderColor: c.down }}><T raw w="b">{L.canceled(date(end))}</T><T raw s={14} c={c.muted}>{L.resumeNote}</T></Card>
          <Btn testID="resume" label={L.resume} onPress={() => { update(s => resumePlus(s)); buzz('done'); track('plus_resume'); }} />
        </> : ask ? <Card style={{ gap: 10, borderColor: c.down }}>
          <T raw w="x" s={18}>{L.sureT}</T>
          <T raw s={15}>{P.plan === 'm' ? L.sure(priceNow(S), LADDER[0].kr, date(end)) : L.sureY(date(end))}</T>
          <Btn kind="good" label={L.keep} onPress={() => { setAsk(false); buzz('tap'); }} />
          <Btn testID="cancel-yes" kind="bad" label={L.cancelYes} onPress={() => { update(s => cancelPlus(s)); setAsk(false); buzz('no'); track('plus_cancel', { months: m, price: priceNow(S) }); }} />
        </Card> : <Btn testID="cancel" kind="ghost" label={L.cancel} onPress={() => { setAsk(true); buzz('tap'); }} />}
        {P.test ? <Pressable testID="skip" onPress={() => { update(s => skipMonth(s)); buzz('tap'); }} style={{ alignSelf: 'center', padding: 8 }}><T raw s={13} w="b" c={c.muted}>{L.skip}</T></Pressable> : null}
        <T raw s={12} c={c.muted} center>{L.legal}</T>
      </ScrollView>
    </View>;
  }

  const restart = !!S.plus; // haft Plus förut: lojalitetspriset är borta
  return <View style={{ flex: 1, backgroundColor: c.bg }}>
    <ScrollView contentContainerStyle={{ paddingTop: ins.top + 8, paddingHorizontal: 20, paddingBottom: ins.bottom + 40, gap: 14 }}>
      {close}
      <View style={{ alignItems: 'center', gap: 6 }}><Wick size={96} mood="cheer" lit /><T raw w="x" s={30} center>Wicki Plus</T><T raw c={c.muted} center>{L.sub}</T></View>
      {perks}
      <Row gap={10}>
        {(['m', 'y'] as const).map(k => { const sel = plan === k;
          return <Pressable key={k} testID={'plan-' + k} accessibilityRole="radio" accessibilityState={{ selected: sel }} onPress={() => { setPlan(k); buzz('tap'); }}
            style={{ flex: 1, borderRadius: 20, padding: 14, gap: 4, borderWidth: 2, borderColor: sel ? c.pri : c.glassB, backgroundColor: sel ? c.priSoft : c.glass }}>
            {k === 'y' ? <View style={{ alignSelf: rtl ? 'flex-end' : 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 99, backgroundColor: c.gold }}><T raw w="b" s={11} c="#3A2600">{L.save(Math.round((1 - YEAR_KR / (LADDER[0].kr * 12)) * 100))}</T></View> : null}
            <T raw w="b" s={15}>{k === 'm' ? L.mT : L.yT}</T>
            <T raw w="x" s={22}>{k === 'm' ? `${LADDER[0].kr} kr` : `${YEAR_KR} kr`}</T>
            <T raw s={12.5} c={c.muted}>{k === 'm' ? L.mSub : L.ySub(Math.round(YEAR_KR / 12))}</T>
          </Pressable>; })}
      </Row>
      {plan === 'm' ? ladder : null}
      {restart ? <T raw s={13.5} c={c.muted}>{L.restart}</T> : null}
      <Btn testID="buy" kind="gold" label={L.start} onPress={() => { update(s => startPlus(s, plan)); buzz('done'); track('plus_start', { plan, from: p.from || 'direct', test: true }); }} />
      <T raw s={12.5} c={c.muted} center>{L.testNote}</T>
      <T raw s={12} c={c.muted} center>{L.legal}</T>
      <Row gap={14} style={{ justifyContent: 'center' }}>
        <Pressable onPress={() => router.push({ pathname: '/legal', params: { doc: 'terms' } })}><T raw s={12.5} w="b" c={c.pri}>{L.terms}</T></Pressable>
        <Pressable onPress={() => router.push({ pathname: '/legal', params: { doc: 'privacy' } })}><T raw s={12.5} w="b" c={c.pri}>{L.privacy}</T></Pressable>
      </Row>
    </ScrollView>
  </View>;
}
