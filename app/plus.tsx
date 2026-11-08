import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { router, useLocalSearchParams, Redirect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../src/store';
import { Btn, Card, Row, T } from '../src/ui/kit';
import { Wick } from '../src/ui/Wick';
import { PLUS_ENABLED, TRIAL_DAYS, LADDER, YEAR_KR, cancelPlus, nextStep, periodEnd, plusMonths, plusOn, priceNow, resumePlus, skipMonth, startPlus, tierOf } from '../src/engine/plus';
import { PL } from '../src/data/plus-dict';
import { track } from '../src/analytics';
import { Confetti, MScroll } from '../src/ui/motion';

const LOC: Record<string, string> = { sv: 'sv-SE', en: 'en-GB', fr: 'fr-FR', ar: 'ar' };

/** Texter för betalväggen i TradingView-stil: rubrik efter var man kom ifrån, jämförelse, frågor och bekräftelse. */
type PXT = { ctx: Record<string, string>; trial: string; trialSub: (kr: string) => string; cmpT: string; free: string; rows: [string, boolean | string, boolean | string][];
  faqT: string; faq: [string, string][]; welT: string; welSub: (d: string) => string; go: string; trialUntil: (d: string) => string };
const PX: Record<string, PXT> = {
  sv: { ctx: { course: 'Lås upp nästa avsnitt', sim_prop: 'Ta prop-utmaningen', sim: 'Handla alla marknader', ai: 'Fråga Wicki AI utan gräns', def: 'Gå hela vägen med Wicki' },
    trial: `Prova gratis i ${TRIAL_DAYS} dagar`, trialSub: kr => `Sedan ${kr}. Säg upp när du vill – innan provperioden tar slut kostar det ingenting.`,
    cmpT: 'Gratis eller Plus', free: 'Gratis',
    rows: [['Grunder, risk och bluffar', true, true], ['Övningar på riktiga grafer', true, true], ['Simulator: aktier', true, true], ['Strategier, makro och fler marknader', false, true],
      ['Simulator: forex, krypto och guld', false, true], ['Prop-utmaningen', false, true]],
    faqT: 'Vanliga frågor', faq: [['Kan jag säga upp när som helst?', 'Ja. Du säger upp i App Store och behåller Plus tills perioden du betalat för tar slut.'],
      ['Vad händer efter provperioden?', 'Om du inte säger upp startar prenumerationen automatiskt.'], ['Är grunderna fortfarande gratis?', 'Ja. Allt om risk, grunder och bluffar är alltid gratis.']],
    welT: 'Välkommen till Wicki Plus!', welSub: d => `Allt är upplåst. Nästa dragning: ${d}.`, go: 'Börja lära', trialUntil: d => `Gratis till ${d}` },
  en: { ctx: { course: 'Unlock the next section', sim_prop: 'Take the prop challenge', sim: 'Trade every market', ai: 'Ask Wicki AI without limits', def: 'Go all the way with Wicki' },
    trial: `Try free for ${TRIAL_DAYS} days`, trialSub: kr => `Then ${kr}. Cancel any time – nothing is charged before the trial ends.`,
    cmpT: 'Free or Plus', free: 'Free',
    rows: [['Basics, risk and scams', true, true], ['Exercises on real charts', true, true], ['Simulator: stocks', true, true], ['Strategies, macro and more markets', false, true],
      ['Simulator: forex, crypto and gold', false, true], ['The prop challenge', false, true]],
    faqT: 'Questions', faq: [['Can I cancel any time?', 'Yes. Cancel in the App Store and keep Plus until the period you paid for ends.'],
      ['What happens after the trial?', 'If you don’t cancel, the subscription starts automatically.'], ['Are the basics still free?', 'Yes. Everything about risk, basics and scams is always free.']],
    welT: 'Welcome to Wicki Plus!', welSub: d => `Everything is unlocked. Next charge: ${d}.`, go: 'Start learning', trialUntil: d => `Free until ${d}` },
  fr: { ctx: { course: 'Débloque la section suivante', sim_prop: 'Relève le défi prop', sim: 'Trade tous les marchés', ai: 'Demande à Wicki AI sans limite', def: 'Va jusqu’au bout avec Wicki' },
    trial: `Essai gratuit de ${TRIAL_DAYS} jours`, trialSub: kr => `Ensuite ${kr}. Résilie quand tu veux – rien n’est facturé avant la fin de l’essai.`,
    cmpT: 'Gratuit ou Plus', free: 'Gratuit',
    rows: [['Bases, risque et arnaques', true, true], ['Exercices sur de vrais graphiques', true, true], ['Simulateur : actions', true, true], ['Stratégies, macro et plus de marchés', false, true],
      ['Simulateur : forex, crypto et or', false, true], ['Le défi prop', false, true]],
    faqT: 'Questions fréquentes', faq: [['Puis-je résilier à tout moment ?', 'Oui. Résilie dans l’App Store et garde Plus jusqu’à la fin de la période payée.'],
      ['Que se passe-t-il après l’essai ?', 'Si tu ne résilies pas, l’abonnement démarre automatiquement.'], ['Les bases restent-elles gratuites ?', 'Oui. Tout sur le risque, les bases et les arnaques reste gratuit.']],
    welT: 'Bienvenue dans Wicki Plus !', welSub: d => `Tout est débloqué. Prochain prélèvement : ${d}.`, go: 'Commencer', trialUntil: d => `Gratuit jusqu’au ${d}` },
  ar: { ctx: { course: 'افتح القسم التالي', sim_prop: 'خُض تحدي الحساب الممول', sim: 'تداول في كل الأسواق', ai: 'اسأل Wicki AI بلا حدود', def: 'أكمل الطريق مع Wicki' },
    trial: `جرّب مجانًا لمدة ${TRIAL_DAYS} يومًا`, trialSub: kr => `ثم ${kr}. ألغِ متى شئت، ولا يُخصم شيء قبل انتهاء التجربة.`,
    cmpT: 'مجاني أم Plus', free: 'مجاني',
    rows: [['الأساسيات والمخاطر والاحتيال', true, true], ['تمارين على رسوم حقيقية', true, true], ['المحاكي: الأسهم', true, true], ['الاستراتيجيات والاقتصاد الكلي وأسواق أكثر', false, true],
      ['المحاكي: الفوركس والعملات المشفرة والذهب', false, true], ['تحدي الحساب الممول', false, true]],
    faqT: 'أسئلة شائعة', faq: [['هل يمكنني الإلغاء في أي وقت؟', 'نعم. ألغِ من App Store واحتفظ بـ Plus حتى نهاية الفترة المدفوعة.'],
      ['ماذا يحدث بعد التجربة؟', 'إذا لم تُلغِ، يبدأ الاشتراك تلقائيًا.'], ['هل تبقى الأساسيات مجانية؟', 'نعم. كل ما يتعلق بالمخاطر والأساسيات والاحتيال مجاني دائمًا.']],
    welT: 'مرحبًا بك في Wicki Plus!', welSub: d => `كل شيء مفتوح. الخصم التالي: ${d}.`, go: 'ابدأ التعلّم', trialUntil: d => `مجاني حتى ${d}` },
};


/** Wicki Plus: välj plan, se lojalitetstrappan, hantera och säg upp. Testversionen gör låtsasköp – inga pengar dras. */
export default function Plus() {
  if (!PLUS_ENABLED) return <Redirect href="/" />;
  return <PlusScreen />;
}
function PlusScreen() {
  const p = useLocalSearchParams<{ from?: string }>();
  const { S, c, rtl, update, buzz } = useStore(); const ins = useSafeAreaInsets();
  const L = PL[S.lang] || PL.sv; const [plan, setPlan] = useState<'m' | 'y'>('m'); const [ask, setAsk] = useState(false);
  const X = PX[S.lang] || PX.sv; const [done, setDone] = useState(false); const [faq, setFaq] = useState(-1);
  const from = p.from || 'direct'; const ctxKey = from.startsWith('sim_prop') ? 'sim_prop' : from.startsWith('sim') ? 'sim' : from === 'course' ? 'course' : from === 'ai' ? 'ai' : 'def';
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

  if (done && S.plus) {
    const nxt = S.plus.trial || periodEnd(S);
    return <View style={{ flex: 1, backgroundColor: c.bg, padding: 24, paddingTop: ins.top + 40, paddingBottom: ins.bottom + 24, justifyContent: 'center', gap: 16 }}>
      <View style={{ alignItems: 'center', gap: 10 }}><Wick size={120} mood="cheer" lit anim="dance" /><T raw w="x" s={28} center>{X.welT}</T><T raw c={c.muted} center>{X.welSub(date(nxt))}</T></View>
      <Btn testID="plus-go" kind="gold" label={X.go} onPress={() => router.back()} />
      <Confetti n={60} />
    </View>;
  }
  if (sub) {
    const P = S.plus!; const m = plusMonths(S); const nx = nextStep(S); const end = periodEnd(S, P.cancel || undefined);
    return <View style={{ flex: 1, backgroundColor: c.bg }}>
      <MScroll contentContainerStyle={{ paddingTop: ins.top + 8, paddingHorizontal: 20, paddingBottom: ins.bottom + 40, gap: 14 }}>
        {close}
        <View style={{ alignItems: 'center', gap: 6 }}><Wick size={90} mood="cheer" lit /><T raw w="x" s={28} center>{L.mine}</T>
          <T raw c={c.muted} center>{P.plan === 'y' ? L.yearly(YEAR_KR) : L.monthly(priceNow(S))}</T>{P.trial && P.trial > Date.now() ? <T raw w="b" c={c.up} center>{X.trialUntil(date(P.trial))}</T> : null}</View>
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
      </MScroll>
    </View>;
  }

  const restart = !!S.plus; // haft Plus förut: lojalitetspriset är borta
  return <View style={{ flex: 1, backgroundColor: c.bg }}>
    <MScroll contentContainerStyle={{ paddingTop: ins.top + 8, paddingHorizontal: 20, paddingBottom: ins.bottom + 40, gap: 14 }}>
      {close}
      <View style={{ alignItems: 'center', gap: 6 }}><Wick size={96} mood="cheer" lit /><T raw w="b" s={13} c={c.gold} upper>Wicki Plus</T><T raw w="x" s={28} center>{X.ctx[ctxKey]}</T><T raw c={c.muted} center>{L.sub}</T></View>
      {perks}
      <Card style={{ gap: 8 }}>
        <T raw w="x" s={17}>{X.cmpT}</T>
        <Row style={{ justifyContent: 'flex-end' }}><T raw w="b" s={12.5} c={c.muted} style={{ width: 70 }} center>{X.free}</T><T raw w="b" s={12.5} c={c.gold} style={{ width: 70 }} center>Plus</T></Row>
        {X.rows.map(([f, a, b], i) => <Row key={i} style={{ paddingVertical: 6, borderTopWidth: 1, borderColor: c.glassB }}>
          <T raw s={14} style={{ flex: 1 }}>{f}</T>
          {[a, b].map((v, k) => <View key={k} style={{ width: 70, alignItems: 'center' }}>{typeof v === 'string' ? <T raw w="b" s={12.5} c={k ? c.gold : c.muted} center>{v}</T>
            : <Ionicons name={v ? 'checkmark-circle' : 'remove'} size={20} color={v ? (k ? c.gold : c.up) : c.muted} />}</View>)}
        </Row>)}
      </Card>
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
      <Btn testID="buy" kind="gold" label={restart ? L.start : X.trial} onPress={() => { update(s => startPlus(s, plan)); buzz('done'); setDone(true); track('plus_start', { plan, from, test: true, trial: !restart }); }} />
      {restart ? null : <T raw s={13} c={c.muted} center>{X.trialSub(plan === 'm' ? `${LADDER[0].kr} kr/mån` : `${YEAR_KR} kr/år`)}</T>}
      <Card style={{ gap: 4 }}><T raw w="x" s={17}>{X.faqT}</T>
        {X.faq.map(([q, a], i) => <Pressable key={i} onPress={() => setFaq(faq === i ? -1 : i)} style={{ paddingVertical: 8, borderTopWidth: i ? 1 : 0, borderColor: c.glassB, gap: 4 }}>
          <Row style={{ justifyContent: 'space-between' }}><T raw w="b" s={14.5} style={{ flex: 1 }}>{q}</T><Ionicons name={faq === i ? 'chevron-up' : 'chevron-down'} size={18} color={c.muted} /></Row>
          {faq === i ? <T raw s={14} c={c.muted}>{a}</T> : null}</Pressable>)}</Card>
      <T raw s={12.5} c={c.muted} center>{L.testNote}</T>
      <T raw s={12} c={c.muted} center>{L.legal}</T>
      <Row gap={14} style={{ justifyContent: 'center' }}>
        <Pressable onPress={() => router.push({ pathname: '/legal', params: { doc: 'terms' } })}><T raw s={12.5} w="b" c={c.pri}>{L.terms}</T></Pressable>
        <Pressable onPress={() => router.push({ pathname: '/legal', params: { doc: 'privacy' } })}><T raw s={12.5} w="b" c={c.pri}>{L.privacy}</T></Pressable>
      </Row>
    </MScroll>
  </View>;
}
