import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStore } from '../src/store';
import { LANGS } from '../src/i18n';
import { UNITS, SECTIONS } from '../src/engine/course';
import type { Lang } from '../src/types';
import { Btn, Card, Pill, Row, T } from '../src/ui/kit';
import { Wick } from '../src/ui/Wick';
import { Presets } from '../src/ui/sheets';
import { useAccount } from '../src/account/Account';
import { STATS } from '../src/data/plus-dict';
import { track } from '../src/analytics';
import { Ionicons } from '@expo/vector-icons';
import { PAINS } from '../src/data/grow-dict';
import { Bar, Enter, Stagger } from '../src/ui/motion';

const LAST = 6;

export default function Onboarding() {
  const { S, c, update, buzz, rtl, t } = useStore(); const ins = useSafeAreaInsets();
  const acc = useAccount(); const ST = STATS[S.lang] || STATS.sv;
  // Loggar man in med ett befintligt konto hämtas framstegen och introduktionen hoppas över.
  useEffect(() => { if (acc.email && S.onb) router.replace('/'); }, [acc.email, S.onb]);
  const [step, setStep] = useState(0); const [level, setLevel] = useState(0); const [goal, setGoal] = useState(20); const [pains, setPains] = useState<string[]>([]);
  const dreams = (pains.length ? PAINS.filter(p => pains.includes(p.id)) : PAINS.filter(p => ['start', 'charts', 'lose'].includes(p.id)));
  const choice = (on: boolean, onPress: () => void, a: string, b: string, id: string) => <Pressable key={id} testID={id} accessibilityRole="button" accessibilityState={{ selected: on }} onPress={() => { buzz('tap'); onPress(); }}
    style={{ borderWidth: 1, borderColor: on ? c.pri : c.glassB, backgroundColor: on ? c.priSoft : c.glass, borderRadius: 18, padding: 14 }}><T w="b">{a}</T>{b ? <T s={13} c={c.muted}>{b}</T> : null}</Pressable>;
  const next = () => {
    buzz('tap'); if (step === 1) track('onboarding_pains', { pains: pains.join(',') || 'none' }); if (step < LAST) { setStep(step + 1); return; }
    const skip = [0, SECTIONS[1]?.from || 0, (SECTIONS.find(x => x.t === 'Strategier') || SECTIONS[4])?.from || 0];
    track('onboarding_done', { level, goal, stats: !!S.stats, pains: pains.join(',') });
    update(s => { s.goal = goal; s.grow = { ...(s.grow || {}), pains }; if (level < 3) UNITS.slice(0, skip[level]).forEach(u => u.nodes.forEach(n => { s.done[n.id] = 1; })); s.onb = true; });
    // Först till flikarna, sedan nästa steg ovanpå, så att Tillbaka alltid landar på Hem.
    router.replace('/');
    if (level === 3) setTimeout(() => router.push({ pathname: '/lesson', params: { mode: 'placement' } }), 60);
    else if (level === 0) setTimeout(() => router.push({ pathname: '/video', params: { id: 'v1' } }), 60);
  };
  return <View style={{ flex: 1, backgroundColor: c.bg, paddingTop: ins.top + 8 }}>
    <Row style={{ paddingHorizontal: 16 }}>
      {step ? <Pressable accessibilityLabel="Tillbaka" onPress={() => setStep(step - 1)} style={{ width: 36 }}><T raw w="x" s={22} c={c.lockInk}>{rtl ? '→' : '←'}</T></Pressable> : <View style={{ width: 36 }} />}
      <View style={{ flex: 1 }}><Bar pct={(step + 1) / (LAST + 1) * 100} color={c.up} track={c.lock} h={14} rtl={rtl} /></View>
    </Row>
    <ScrollView contentContainerStyle={{ padding: 20, gap: 14, alignItems: 'stretch' }}>
      <Enter key={'s' + step} from="side" dy={rtl ? -18 : 18} style={{ gap: 14 }}><Stagger step={60}>
      {step === 0 ? <>
        <Row gap={8} style={{ flexWrap: 'wrap', justifyContent: 'center' }}>{(Object.keys(LANGS) as Lang[]).map(l => <Pill key={l} testID={'lang-' + l} label={LANGS[l]} on={S.lang === l} onPress={() => update(s => { s.lang = l; })} />)}</Row>
        <View style={{ alignItems: 'center' }}><Wick mood="cheer" size={100} lit /></View>
        <Card><T w="b">Hej! Jag är Wicki, ett candlestick-ljus. Jag lär dig trading i korta lektioner: hur priset rör sig, när man köper och säljer, och hur du skyddar dina pengar.</T></Card>
        <Card style={{ borderColor: c.gold, backgroundColor: c.goldSoft }}><T w="x">Viktigt att veta</T><T>Wicki är utbildning, inte investeringsråd. De flesta som daytradar förlorar pengar. Handla aldrig för pengar du inte har råd att förlora.</T></Card>
      </> : step === 1 ? <>
        <View style={{ alignItems: 'center' }}><Wick size={90} /></View><T w="x" s={22} center>Vad är svårast med trading just nu?</T>
        <T center c={c.muted}>Välj allt som stämmer. Wicki bygger din plan efter det.</T>
        {PAINS.map(p => { const on = pains.includes(p.id); return <Pressable key={p.id} testID={'pain-' + p.id} accessibilityRole="checkbox" accessibilityState={{ checked: on }}
          onPress={() => { buzz('tap'); setPains(on ? pains.filter(x => x !== p.id) : [...pains, p.id]); }}
          style={{ flexDirection: rtl ? 'row-reverse' : 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: on ? c.pri : c.glassB, backgroundColor: on ? c.priSoft : c.glass, borderRadius: 18, padding: 14 }}>
          <Ionicons name={p.icon as any} size={22} color={on ? c.pri : c.muted} /><T w="b" style={{ flex: 1 }}>{p.pain}</T>
          <View style={{ width: 24, height: 24, borderRadius: 7, borderWidth: 2, borderColor: on ? c.pri : c.glassB, backgroundColor: on ? c.pri : 'transparent', alignItems: 'center', justifyContent: 'center' }}>{on ? <Ionicons name="checkmark" size={16} color={c.on} /> : null}</View>
        </Pressable>; })}
      </> : step === 2 ? <>
        <View style={{ alignItems: 'center' }}><Wick size={90} /></View><T w="x" s={22} center>Hur gammal är du?</T>
        <T center c={c.muted}>Wicki anpassar råden efter din ålder. Svaret sparas bara i appen.</T>
        {([['u16', 'Under 16 år'], ['u18', '16–17 år'], ['y', '18–25 år'], ['o', 'Över 25 år'], ['', 'Vill inte säga']] as const).map(([k, a]) => choice((S.age || '') === k, () => update(s => { s.age = k; }), a, '', 'age-' + (k || 'none')))}
        {S.age === 'u16' ? <Card style={{ borderColor: c.gold, backgroundColor: c.goldSoft }}><T w="x">Bra att du är nyfiken!</T><T>Wicki är gjord för dig som är 16 eller äldre. Använd den gärna tillsammans med en vuxen. Lektionerna om högriskprodukter låses upp när du fyller 18.</T></Card>
          : S.age === 'u18' ? <Card style={{ borderColor: c.gold, backgroundColor: c.goldSoft }}><T w="x">Bra att veta</T><T>Du som är 16 eller 17 får själv bestämma över pengar du tjänat på eget jobb. För att öppna konto hos en bank eller mäklare behövs oftast dina vårdnadshavare. Lektionerna om högriskprodukter låses upp när du fyller 18.</T></Card> : null}
      </> : step === 3 ? <>
        <View style={{ alignItems: 'center' }}><Wick size={90} /></View><T w="x" s={22} center>Hur mycket kan du redan?</T>
        {([['Helt ny', 'Börja med grunderna i trading'], ['Kan grunderna', 'Hoppa till diagram och mönster'], ['Har tradat förut', 'Hoppa till strategier'], ['Gör ett nivåtest', '15 frågor, Wicki väljer var du börjar']] as const).map(([a, b], k) => choice(level === k, () => setLevel(k), a, b, 'lv-' + k))}
      </> : step === 4 ? <>
        <View style={{ alignItems: 'center' }}><Wick size={90} /></View><T w="x" s={22} center>Välj ett dagligt mål</T>
        {([[10, 'Lugnt'], [20, 'Normalt'], [30, 'Seriöst'], [50, 'Intensivt']] as const).map(([g, l]) => choice(goal === g, () => setGoal(g), l, `${g} XP per dag`, 'goal-' + g))}
      </> : step === 5 ? <>
        <Enter from="scale" style={{ alignItems: 'center' }}><Wick mood="cheer" size={110} lit anim="dance" /></Enter>
        <T w="x" s={26} center>Din plan är klar</T>
        <T w="b" s={17} center c={c.muted}>Om 30 dagar kan du:</T>
        {dreams.map((p, i) => <Enter key={p.id} delay={350 + i * 260} from="side" dy={rtl ? -20 : 20}>
          <View testID={'dream-' + p.id} style={{ flexDirection: rtl ? 'row-reverse' : 'row', alignItems: 'center', gap: 12, borderRadius: 18, padding: 14, backgroundColor: c.upSoft, borderWidth: 1, borderColor: c.up }}>
            <Enter delay={600 + i * 260} from="scale"><View style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: c.up, alignItems: 'center', justifyContent: 'center' }}><Ionicons name="checkmark" size={18} color={c.on} /></View></Enter>
            <View style={{ flex: 1, gap: 2 }}><T w="b">{p.dream}</T><T w="x" s={12} c={c.upD} upper>{p.when}</T></View>
          </View></Enter>)}
        <Row style={{ justifyContent: 'center' }}><Ionicons name="flame" size={18} color={c.coral} /><T raw w="b" c={c.muted}>{`${t('Ditt dagliga mål')}: ${goal} XP`}</T></Row>
        <T s={12.5} c={c.muted} center>Wicki lär dig förstå marknaden och skydda dina pengar. Ingen kan lova vinster, och det gör inte vi heller.</T>
      </> : <>
        <View style={{ alignItems: 'center' }}><Wick size={90} /></View><T w="x" s={22} center>Vill du att Wicki anpassar sig efter dig?</T>
        <T center c={c.muted}>Välj gärna flera, eller hoppa över.</T>
        <Presets />
        <T s={12.5} c={c.muted} center>Valen sparas bara som inställningar, inte som uppgifter om dig.</T>
        <Card testID="stats-ask" style={{ gap: 8 }}><T raw w="x">{ST[0]}</T><T raw s={13.5} c={c.muted}>{ST[1]}</T>
          <Row gap={8}>{([[true, ST[2]], [false, ST[3]]] as const).map(([v, l]) => <View key={String(v)} style={{ flex: 1 }}>{choice(S.stats === v, () => update(s => { s.stats = v; }), l, '', 'stats-' + v)}</View>)}</Row></Card>
      </>}
      </Stagger></Enter>
    </ScrollView>
    <View style={{ padding: 16, paddingBottom: ins.bottom + 16 }}>
      <Btn testID="next" label={step === 0 ? 'Jag förstår' : step === 4 ? 'Visa min plan' : step < LAST ? 'Fortsätt' : 'Nu kör vi'} onPress={next} />
      {step === 0 && !acc.email ? <Pressable testID="have-account" onPress={() => router.push('/auth')} style={{ paddingTop: 14 }}><T w="b" c={c.pri} center>Har du redan ett konto? Logga in</T></Pressable> : null}
    </View>
  </View>;
}
