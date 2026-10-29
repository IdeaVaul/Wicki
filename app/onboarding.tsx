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

export default function Onboarding() {
  const { S, c, update, buzz, rtl } = useStore(); const ins = useSafeAreaInsets();
  const acc = useAccount();
  // Loggar man in med ett befintligt konto hämtas framstegen och introduktionen hoppas över.
  useEffect(() => { if (acc.email && S.onb) router.replace('/'); }, [acc.email, S.onb]);
  const [step, setStep] = useState(0); const [level, setLevel] = useState(0); const [goal, setGoal] = useState(20);
  const choice = (on: boolean, onPress: () => void, a: string, b: string, id: string) => <Pressable key={id} testID={id} accessibilityRole="button" accessibilityState={{ selected: on }} onPress={() => { buzz('tap'); onPress(); }}
    style={{ borderWidth: 1, borderColor: on ? c.pri : c.glassB, backgroundColor: on ? c.priSoft : c.glass, borderRadius: 18, padding: 14 }}><T w="b">{a}</T>{b ? <T s={13} c={c.muted}>{b}</T> : null}</Pressable>;
  const next = () => {
    buzz('tap'); if (step < 4) { setStep(step + 1); return; }
    const skip = [0, SECTIONS[1]?.from || 0, (SECTIONS.find(x => x.t === 'Strategier') || SECTIONS[4])?.from || 0];
    update(s => { s.goal = goal; if (level < 3) UNITS.slice(0, skip[level]).forEach(u => u.nodes.forEach(n => { s.done[n.id] = 1; })); s.onb = true; });
    if (level === 3) router.replace({ pathname: '/lesson', params: { mode: 'placement' } }); else if (level === 0) router.replace({ pathname: '/video', params: { id: 'v1' } }); else router.replace('/');
  };
  return <View style={{ flex: 1, backgroundColor: c.bg, paddingTop: ins.top + 8 }}>
    <Row style={{ paddingHorizontal: 16 }}>
      {step ? <Pressable accessibilityLabel="Tillbaka" onPress={() => setStep(step - 1)} style={{ width: 36 }}><T raw w="x" s={22} c={c.lockInk}>{rtl ? '→' : '←'}</T></Pressable> : <View style={{ width: 36 }} />}
      <View style={{ flex: 1, height: 14, borderRadius: 99, backgroundColor: c.lock, overflow: 'hidden', transform: [{ scaleX: rtl ? -1 : 1 }] }}><View style={{ width: `${(step + 1) / 5 * 100}%`, height: '100%', backgroundColor: c.up }} /></View>
    </Row>
    <ScrollView contentContainerStyle={{ padding: 20, gap: 14, alignItems: 'stretch' }}>
      {step === 0 ? <>
        <Row gap={8} style={{ flexWrap: 'wrap', justifyContent: 'center' }}>{(Object.keys(LANGS) as Lang[]).map(l => <Pill key={l} testID={'lang-' + l} label={LANGS[l]} on={S.lang === l} onPress={() => update(s => { s.lang = l; })} />)}</Row>
        <View style={{ alignItems: 'center' }}><Wick mood="cheer" size={100} lit /></View>
        <Card><T w="b">Hej! Jag är Wicki, ett candlestick-ljus. Jag lär dig trading i korta lektioner: hur priset rör sig, när man köper och säljer, och hur du skyddar dina pengar.</T></Card>
        <Card style={{ borderColor: c.gold, backgroundColor: c.goldSoft }}><T w="x">Viktigt att veta</T><T>Wicki är utbildning, inte investeringsråd. De flesta som daytradar förlorar pengar. Handla aldrig för pengar du inte har råd att förlora.</T></Card>
      </> : step === 1 ? <>
        <View style={{ alignItems: 'center' }}><Wick size={90} /></View><T w="x" s={22} center>Hur gammal är du?</T>
        <T center c={c.muted}>Wicki anpassar råden efter din ålder. Svaret sparas bara i appen.</T>
        {([['u16', 'Under 16 år'], ['u18', '16–17 år'], ['y', '18–25 år'], ['o', 'Över 25 år'], ['', 'Vill inte säga']] as const).map(([k, a]) => choice((S.age || '') === k, () => update(s => { s.age = k; }), a, '', 'age-' + (k || 'none')))}
        {S.age === 'u16' ? <Card style={{ borderColor: c.gold, backgroundColor: c.goldSoft }}><T w="x">Bra att du är nyfiken!</T><T>Wicki är gjord för dig som är 16 eller äldre. Använd den gärna tillsammans med en vuxen. Lektionerna om högriskprodukter låses upp när du fyller 18.</T></Card>
          : S.age === 'u18' ? <Card style={{ borderColor: c.gold, backgroundColor: c.goldSoft }}><T w="x">Bra att veta</T><T>Du som är 16 eller 17 får själv bestämma över pengar du tjänat på eget jobb. För att öppna konto hos en bank eller mäklare behövs oftast dina vårdnadshavare. Lektionerna om högriskprodukter låses upp när du fyller 18.</T></Card> : null}
      </> : step === 2 ? <>
        <View style={{ alignItems: 'center' }}><Wick size={90} /></View><T w="x" s={22} center>Hur mycket kan du redan?</T>
        {([['Helt ny', 'Börja med grunderna i trading'], ['Kan grunderna', 'Hoppa till diagram och mönster'], ['Har tradat förut', 'Hoppa till strategier'], ['Gör ett nivåtest', '15 frågor, Wicki väljer var du börjar']] as const).map(([a, b], k) => choice(level === k, () => setLevel(k), a, b, 'lv-' + k))}
      </> : step === 3 ? <>
        <View style={{ alignItems: 'center' }}><Wick size={90} /></View><T w="x" s={22} center>Välj ett dagligt mål</T>
        {([[10, 'Lugnt'], [20, 'Normalt'], [30, 'Seriöst'], [50, 'Intensivt']] as const).map(([g, l]) => choice(goal === g, () => setGoal(g), l, `${g} XP per dag`, 'goal-' + g))}
      </> : <>
        <View style={{ alignItems: 'center' }}><Wick size={90} /></View><T w="x" s={22} center>Vill du att Wicki anpassar sig efter dig?</T>
        <T center c={c.muted}>Välj gärna flera, eller hoppa över.</T>
        <Presets />
        <T s={12.5} c={c.muted} center>Valen sparas bara som inställningar, inte som uppgifter om dig.</T>
      </>}
    </ScrollView>
    <View style={{ padding: 16, paddingBottom: ins.bottom + 16 }}>
      <Btn testID="next" label={step === 0 ? 'Jag förstår' : step < 4 ? 'Fortsätt' : 'Nu kör vi'} onPress={next} />
      {step === 0 && !acc.email ? <Pressable testID="have-account" onPress={() => router.push('/auth')} style={{ paddingTop: 14 }}><T w="b" c={c.pri} center>Har du redan ett konto? Logga in</T></Pressable> : null}
    </View>
  </View>;
}
