import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Line, Rect } from 'react-native-svg';
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
import { Bar, Enter, Press, Stagger } from '../src/ui/motion';
import { CandleChart } from '../src/ui/Chart';
import { askPush } from '../src/notify';

/** Introduktionen, inspirerad av Brilliant: Wicki presenterar sig som coach, frågar en sak i taget med stora valkort,
 *  låter dig lösa en riktig uppgift direkt, föreslår en tid för påminnelser och visar sedan din plan. Konto behövs inte. */
const LAST = 10;
const MOTIVES = [
  { id: 'understand', icon: 'library', l: 'Förstå börsen' }, { id: 'invest', icon: 'trending-up', l: 'Börja investera' },
  { id: 'trade', icon: 'pulse', l: 'Lära mig trading' }, { id: 'safe', icon: 'shield-checkmark', l: 'Skydda mina pengar' },
] as const;
const TIMES = [
  { h: 8, icon: 'partly-sunny', l: 'På morgonen' }, { h: 12, icon: 'sunny', l: 'På lunchen' },
  { h: 19, icon: 'moon', l: 'På kvällen' }, { h: 18, icon: 'time', l: 'Någon annan tid' },
] as const;
const GOALS = [[10, 'Lugnt', 'leaf'], [20, 'Normalt', 'walk'], [30, 'Seriöst', 'bicycle'], [50, 'Intensivt', 'rocket']] as const;
const LEVELS = [['Helt ny', 'Börja med grunderna i trading'], ['Kan grunderna', 'Hoppa till diagram och mönster'], ['Har tradat förut', 'Hoppa till strategier'], ['Gör ett nivåtest', '15 frågor, Wicki väljer var du börjar']] as const;

/** En liten graf per nivå: ett ljus, några ljus, en trend med linje, ett frågetecken. */
function MiniCandles({ k, on }: { k: number; on: boolean }) {
  const { c } = useStore(); const up = on ? c.pri : c.up, dn = c.down;
  if (k === 3) return <Ionicons name="help-circle" size={44} color={on ? c.pri : c.muted} />;
  const sets: [number, number, boolean][][] = [[[14, 30, true]], [[8, 22, true], [16, 26, false], [12, 28, true]], [[30, 40, true], [24, 34, true], [18, 28, false], [14, 24, true], [6, 16, true]]];
  const cs = sets[k]; const w = 12, gap = 6, W = cs.length * (w + gap);
  return <Svg width={Math.max(W, 40)} height={46}>
    {k === 2 ? <Line x1={0} y1={44} x2={W} y2={14} stroke={c.gold} strokeWidth={2} strokeDasharray="4 3" /> : null}
    {cs.map(([y1, y2, isUp], i) => { const x = i * (w + gap) + 3; return <React.Fragment key={i}>
      <Line x1={x + w / 2} y1={y1 - 5} x2={x + w / 2} y2={y2 + 5} stroke={isUp ? up : dn} strokeWidth={2} />
      <Rect x={x} y={y1} width={w} height={y2 - y1} rx={3} fill={isUp ? up : dn} /></React.Fragment>; })}
  </Svg>;
}

/** Wicki ställer frågan, som i en chatt. */
function Ask({ q, sub, mood = 'happy' }: { q: string; sub?: string; mood?: 'happy' | 'cheer' }) {
  const { c, rtl } = useStore();
  return <View style={{ flexDirection: rtl ? 'row-reverse' : 'row', alignItems: 'center', gap: 12, paddingVertical: 4 }}>
    <Wick size={64} mood={mood} lit anim="bob" />
    <View style={{ flex: 1, gap: 4 }}><T w="x" s={21}>{q}</T>{sub ? <T s={14} c={c.muted}>{sub}</T> : null}</View>
  </View>;
}

export default function Onboarding() {
  const { S, c, update, buzz, rtl, t } = useStore(); const ins = useSafeAreaInsets();
  const acc = useAccount(); const ST = STATS[S.lang] || STATS.sv;
  // Loggar man in med ett befintligt konto hämtas framstegen och introduktionen hoppas över.
  useEffect(() => { if (acc.email && S.onb) router.replace('/'); }, [acc.email, S.onb]);
  const [step, setStep] = useState(0); const [level, setLevel] = useState(0); const [goal, setGoal] = useState(20); const [pains, setPains] = useState<string[]>([]);
  const [motive, setMotive] = useState<string | null>(null); const [hour, setHour] = useState<number | null>(null); const [taste, setTaste] = useState<'up' | 'down' | null>(null);
  const dreams = (pains.length ? PAINS.filter(p => pains.includes(p.id)) : PAINS.filter(p => ['start', 'charts', 'lose'].includes(p.id)));
  // En tydlig upptrend med högre toppar och bottnar för smakprovet.
  const trend = useMemo(() => { const n = [0.6, -0.4, 1.1, 0.2, -0.7, 1.4, 0.5, -0.3, 1.2, 0.8, -0.5, 1.6, 0.4, -0.2, 1.3, 0.9, -0.6, 1.5];
    let p = 100; return n.map((d, i) => { const o = p; const cl = o + d * 1.4 + 0.9; p = cl; const hi = Math.max(o, cl) + 0.6 + (i % 3) * 0.2, lo = Math.min(o, cl) - 0.6 - (i % 2) * 0.3; return { o, h: hi, l: lo, c: cl, v: 0 }; }); }, []);
  const choice = (on: boolean, onPress: () => void, a: string, b: string, id: string) => <Press key={id} testID={id} accessibilityState={{ selected: on }} onPress={() => { buzz('tap'); onPress(); }}
    style={{ borderWidth: on ? 2 : 1, borderColor: on ? c.pri : c.glassB, backgroundColor: on ? c.priSoft : c.glass, borderRadius: 18, padding: on ? 13 : 14 }}><T w="b">{a}</T>{b ? <T s={13} c={c.muted}>{b}</T> : null}</Press>;
  /** Stort valkort i rutnät, som hos Brilliant. */
  const tile = (on: boolean, onPress: () => void, label: string, art: React.ReactNode, id: string, sub?: string) => <Press key={id} testID={id} accessibilityState={{ selected: on }} onPress={() => { buzz('tap'); onPress(); }}
    style={{ width: '48%', minHeight: 138, borderRadius: 22, borderWidth: on ? 2 : 1, borderColor: on ? c.pri : c.glassB, backgroundColor: on ? c.priSoft : c.glass, alignItems: 'center', justifyContent: 'center', padding: 12, gap: 10 }}>
    {art}<T w="b" center s={15}>{label}</T>{sub ? <T raw s={12} c={c.muted} center>{sub}</T> : null}
    {on ? <View style={{ position: 'absolute', top: 10, right: rtl ? undefined : 10, left: rtl ? 10 : undefined, width: 22, height: 22, borderRadius: 11, backgroundColor: c.pri, alignItems: 'center', justifyContent: 'center' }}><Ionicons name="checkmark" size={15} color={c.on} /></View> : null}
  </Press>;
  const icon = (name: string, on: boolean, color?: string) => <View style={{ width: 54, height: 54, borderRadius: 27, backgroundColor: on ? c.pri : c.surface, alignItems: 'center', justifyContent: 'center' }}><Ionicons name={name as any} size={28} color={on ? c.on : color || c.pri} /></View>;
  const grid = (kids: React.ReactNode) => <View style={{ flexDirection: rtl ? 'row-reverse' : 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 12 }}>{kids}</View>;

  const finish = () => {
    const skip = [0, SECTIONS[1]?.from || 0, (SECTIONS.find(x => x.t === 'Strategier') || SECTIONS[4])?.from || 0];
    track('onboarding_done', { level, goal, stats: !!S.stats, pains: pains.join(','), motive: motive || 'none', hour: hour ?? -1, taste: taste || 'none' });
    update(s => { s.goal = goal; s.grow = { ...(s.grow || {}), pains, motive: motive || undefined, ...(hour != null ? { hour } : {}) }; if (level < 3) UNITS.slice(0, skip[level]).forEach(u => u.nodes.forEach(n => { s.done[n.id] = 1; })); s.onb = true; });
    // Först till flikarna, sedan nästa steg ovanpå, så att Tillbaka alltid landar på Hem.
    router.replace('/');
    if (level === 3) setTimeout(() => router.push({ pathname: '/lesson', params: { mode: 'placement' } }), 60);
    else if (level === 0) setTimeout(() => router.push({ pathname: '/video', params: { id: 'v1' } }), 60);
  };
  const next = () => {
    buzz('tap');
    if (step === 1) track('onboarding_motive', { motive: motive || 'none' });
    if (step === 2) track('onboarding_pains', { pains: pains.join(',') || 'none' });
    if (step < LAST) { setStep(step + 1); return; } finish();
  };
  const pushYes = async () => {
    const ok = await askPush();
    update(s => { s.grow = s.grow || {}; s.grow.push = ok; s.grow.hour = hour ?? 18; s.grow.askAt = Date.now(); s.grow.askN = (s.grow.askN || 0) + 1; });
    track(ok ? 'push_on' : 'push_denied', { hour: hour ?? 18, from: 'onboarding' }); if (ok) buzz('done'); setStep(step + 1);
  };
  const blocked = (step === 1 && !motive) || (step === 5 && !taste) || (step === 7 && hour == null);
  const label = step === 0 ? 'Kom igång' : step === 8 ? 'Slå på påminnelser' : step === LAST ? 'Nu kör vi' : 'Fortsätt';
  return <View style={{ flex: 1, backgroundColor: c.bg, paddingTop: ins.top + 8 }}>
    <Row style={{ paddingHorizontal: 16 }}>
      {step ? <Pressable accessibilityLabel={t('Tillbaka')} onPress={() => setStep(step - 1)} style={{ width: 36 }}><Ionicons name={rtl ? 'chevron-forward' : 'chevron-back'} size={26} color={c.lockInk} /></Pressable> : <View style={{ width: 36 }} />}
      <View style={{ flex: 1 }}><Bar pct={(step + 1) / (LAST + 1) * 100} color={c.up} track={c.lock} h={12} rtl={rtl} /></View>
    </Row>
    <ScrollView contentContainerStyle={{ padding: 20, gap: 16, alignItems: 'stretch', flexGrow: 1 }}>
      <Enter key={'s' + step} from="side" dy={rtl ? -18 : 18} style={{ gap: 16, flexGrow: 1 }}><Stagger step={60}>
      {step === 0 ? <>
        <Row gap={8} style={{ flexWrap: 'wrap', justifyContent: 'center' }}>{(Object.keys(LANGS) as Lang[]).map(l => <Pill key={l} testID={'lang-' + l} label={LANGS[l]} on={S.lang === l} onPress={() => update(s => { s.lang = l; })} />)}</Row>
        <Enter from="scale" style={{ alignItems: 'center', paddingTop: 28 }}><Wick mood="cheer" size={150} lit anim="dance" /></Enter>
        <T w="x" s={28} center>Hej! Jag är Wicki.</T>
        <T w="b" s={18} center c={c.muted}>Jag blir din personliga tradingcoach.</T>
        <T s={12.5} c={c.muted} center style={{ paddingTop: 18 }}>Wicki är utbildning, inte investeringsråd. Handla aldrig för pengar du inte har råd att förlora.</T>
      </> : step === 1 ? <>
        <Ask q="Vad vill du uppnå?" sub="Wicki anpassar lektionerna efter det." />
        {grid(MOTIVES.map(m => tile(motive === m.id, () => setMotive(m.id), m.l, icon(m.icon, motive === m.id), 'motive-' + m.id)))}
      </> : step === 2 ? <>
        <Ask q="Vad är svårast med trading just nu?" sub="Välj allt som stämmer. Wicki bygger din plan efter det." />
        {grid(PAINS.map(p => { const on = pains.includes(p.id); return tile(on, () => setPains(on ? pains.filter(x => x !== p.id) : [...pains, p.id]), p.pain, icon(p.icon, on), 'pain-' + p.id); }))}
      </> : step === 3 ? <>
        <Ask q="Hur gammal är du?" sub="Wicki anpassar råden efter din ålder. Svaret sparas bara i appen." />
        {([['u16', 'Under 16 år'], ['u18', '16–17 år'], ['y', '18–25 år'], ['o', 'Över 25 år'], ['', 'Vill inte säga']] as const).map(([k, a]) => choice((S.age || '') === k, () => update(s => { s.age = k; }), a, '', 'age-' + (k || 'none')))}
        {S.age === 'u16' ? <Card style={{ borderColor: c.gold, backgroundColor: c.goldSoft }}><T w="x">Bra att du är nyfiken!</T><T>Wicki är gjord för dig som är 16 eller äldre. Använd den gärna tillsammans med en vuxen. Lektionerna om högriskprodukter låses upp när du fyller 18.</T></Card>
          : S.age === 'u18' ? <Card style={{ borderColor: c.gold, backgroundColor: c.goldSoft }}><T w="x">Bra att veta</T><T>Du som är 16 eller 17 får själv bestämma över pengar du tjänat på eget jobb. För att öppna konto hos en bank eller mäklare behövs oftast dina vårdnadshavare. Lektionerna om högriskprodukter låses upp när du fyller 18.</T></Card> : null}
      </> : step === 4 ? <>
        <Ask q="Hur mycket kan du redan?" />
        {grid(LEVELS.map(([a, b], k) => tile(level === k, () => setLevel(k), a, <MiniCandles k={k} on={level === k} />, 'lv-' + k, t(b))))}
      </> : step === 5 ? <>
        <Ask q="Låt oss testa direkt!" sub="Går priset upp eller ner i den här grafen?" mood={taste === 'up' ? 'cheer' : 'happy'} />
        <Card style={{ padding: 10 }}><CandleChart cs={trend} h={190} pad={8} /></Card>
        <Row gap={10}>
          {(['up', 'down'] as const).map(k => { const on = taste === k, right = k === 'up'; const col = !taste ? c.glassB : right ? c.up : on ? c.down : c.glassB;
            return <Press key={k} testID={'taste-' + k} disabled={!!taste} onPress={() => { setTaste(k); buzz(right ? 'done' : 'no'); track('onboarding_taste', { ok: right }); }}
              style={{ flex: 1, minHeight: 64, borderRadius: 18, borderWidth: 2, borderColor: col, backgroundColor: taste && right ? c.upSoft : on ? c.downSoft : c.glass, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 }}>
              <Ionicons name={right ? 'trending-up' : 'trending-down'} size={24} color={right ? c.up : c.down} /><T w="x" s={18}>{right ? 'Upp' : 'Ner'}</T></Press>; })}
        </Row>
        {taste ? <Enter from="scale"><Card style={{ gap: 6, borderColor: taste === 'up' ? c.up : c.gold, backgroundColor: taste === 'up' ? c.upSoft : c.goldSoft }}>
          <T w="x">{taste === 'up' ? 'Snyggt! Du läste just din första graf.' : 'Nästan! Titta på bottnarna.'}</T>
          <T s={14}>{taste === 'up' ? 'Högre toppar och högre bottnar betyder att trenden går uppåt.' : 'De blir högre och högre. Det betyder att trenden går uppåt.'}</T></Card></Enter> : null}
      </> : step === 6 ? <>
        <Ask q="Välj ett dagligt mål" sub="Du kan ändra det när som helst." />
        {grid(GOALS.map(([g, l, ic]) => tile(goal === g, () => setGoal(g), l, icon(ic, goal === g), 'goal-' + g, `${g} XP · ${t('ca')} ${Math.round(g / 4)} min`)))}
      </> : step === 7 ? <>
        <Ask q="När passar det att lära dig?" sub="Wicki påminner dig vid rätt tid." />
        {grid(TIMES.map(x => tile(hour === x.h, () => setHour(x.h), x.l, icon(x.icon, hour === x.h, x.icon === 'moon' ? c.gold : undefined), 'time-' + x.h)))}
      </> : step === 8 ? <>
        <Enter from="scale" style={{ alignItems: 'center', paddingTop: 20 }}><Wick mood="cheer" size={110} lit anim="jump" /></Enter>
        <Card style={{ flexDirection: rtl ? 'row-reverse' : 'row', alignItems: 'center', gap: 12, padding: 14 }}>
          <View style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: c.pri, alignItems: 'center', justifyContent: 'center' }}><Ionicons name="flame" size={22} color={c.on} /></View>
          <View style={{ flex: 1 }}><Row style={{ justifyContent: 'space-between' }}><T w="x" s={15}>Din svit väntar!</T><T s={12} c={c.muted}>nu</T></Row><T s={13.5} c={c.muted}>Fem minuter i dag så håller lågan.</T></View>
        </Card>
        <T w="x" s={24} center>Nå ditt mål med påminnelser</T>
        <T center c={c.muted}>En kort påminnelse om dagen hjälper dig att hålla svitlågan vid liv. Högst en om dagen.</T>
      </> : step === 9 ? <>
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
        <Ask q="Vill du att Wicki anpassar sig efter dig?" sub="Välj gärna flera, eller hoppa över." />
        <Presets />
        <T s={12.5} c={c.muted} center>Valen sparas bara som inställningar, inte som uppgifter om dig.</T>
        <Card testID="stats-ask" style={{ gap: 8 }}><T raw w="x">{ST[0]}</T><T raw s={13.5} c={c.muted}>{ST[1]}</T>
          <Row gap={8}>{([[true, ST[2]], [false, ST[3]]] as const).map(([v, l]) => <View key={String(v)} style={{ flex: 1 }}>{choice(S.stats === v, () => update(s => { s.stats = v; }), l, '', 'stats-' + v)}</View>)}</Row></Card>
      </>}
      </Stagger></Enter>
    </ScrollView>
    <View style={{ padding: 16, paddingBottom: ins.bottom + 16, gap: 10 }}>
      <Btn testID="next" label={label} disabled={blocked} onPress={step === 8 ? pushYes : next} right={step === 8 ? <Ionicons name="notifications" size={20} color={c.on} /> : undefined} />
      {step === 8 ? <Btn kind="ghost" label="Inte nu" onPress={() => { track('push_later', { from: 'onboarding' }); update(s => { s.grow = s.grow || {}; s.grow.askAt = Date.now(); s.grow.askN = (s.grow.askN || 0) + 1; }); setStep(step + 1); }} /> : null}
      {step === 0 && !acc.email ? <Pressable testID="have-account" onPress={() => router.push('/auth')} style={{ paddingTop: 4 }}><T w="b" c={c.pri} center>Har du redan ett konto? Logga in</T></Pressable> : null}
    </View>
  </View>;
}
