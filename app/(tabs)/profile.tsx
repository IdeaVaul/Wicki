import React, { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useStore } from '../../src/store';
import { ALLN } from '../../src/engine/course';
import { GOAL, streakNow, weekDays } from '../../src/engine/state';
import { LANGS } from '../../src/i18n';
import type { Lang } from '../../src/types';
import { Btn, Card, Divider, Pill, Row, Sheet, SheetTop, SwitchRow, T } from '../../src/ui/kit';
import { Header, Screen } from '../../src/ui/Header';
import { A11ySheet } from '../../src/ui/sheets';
import { Wick } from '../../src/ui/Wick';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAccount } from '../../src/account/Account';

const ABOUT = ['Wicki är en app för utbildning. Inget i appen är investeringsråd eller en uppmaning att köpa eller sälja något.', 'Trading är riskfyllt. De flesta som daytradar förlorar pengar. Handla aldrig för pengar du inte har råd att förlora.', 'Graferna i appen är påhittade övningsgrafer, inte riktiga kurser. Simulatorn använder låtsaspengar.', 'För att öppna ett eget konto för aktiehandel krävs i regel att man är 18 år. Barn kan lära sig här utan att handla på riktigt.', 'Dina framsteg sparas bara på den här enheten.', 'Behöver du personlig rådgivning, vänd dig till en rådgivare med tillstånd från Finansinspektionen.'];
const LOC: Record<Lang, string> = { sv: 'sv-SE', en: 'en-GB', fr: 'fr-FR', ar: 'ar' };
export default function Profile() {
  const { S, c, t, update } = useStore(); const acc = useAccount(); const [out, setOut] = useState(false); const [del, setDel] = useState(false); const [delErr, setDelErr] = useState<string | null>(null); const [delBusy, setDelBusy] = useState(false);
  const [a11y, setA11y] = useState(false); const [about, setAbout] = useState(false);
  const lesDone = ALLN.filter(n => n.k === 'les' && S.done[n.id]).length, lesAll = ALLN.filter(n => n.k === 'les').length;
  const wd = weekDays(S); const max = Math.max(GOAL(S), ...wd.map(d => d.xp));
  const stat = (v: string, l: string, col: string) => <Card style={{ flex: 1, gap: 2 }}><T raw w="x" s={22} c={col}>{v}</T><T s={12.5} c={c.muted}>{l}</T></Card>;
  return <Screen><Header /><ScrollView contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 130 }}>
    <Row><Wick size={60} lit /><View style={{ flex: 1 }}><T w="x" s={24}>Profil</T><T raw c={c.muted}>{`${lesDone} / ${lesAll}`}</T></View></Row>
    {S.a.focus ? null : <Row>{stat(String(streakNow(S)), 'Svit', c.coral)}{stat(String(S.xp), 'Total XP', c.gold)}{stat(String(S.perfect), 'Felfria lektioner', c.up)}</Row>}
    {S.a.focus ? null : <Card style={{ gap: 10 }}><T w="x">Den här veckan</T>
      <Row style={{ alignItems: 'flex-end', height: 110 }}>{wd.map(d => <View key={d.key} style={{ flex: 1, alignItems: 'center', gap: 4 }}>
        <View style={{ width: '70%', height: Math.max(4, d.xp / max * 80), backgroundColor: d.xp >= GOAL(S) ? c.gold : c.pri, borderRadius: 6 }} />
        <T raw s={11} c={c.muted}>{new Intl.DateTimeFormat(LOC[S.lang], { weekday: 'narrow' }).format(d.date)}</T></View>)}</Row></Card>}
    <Card testID="account" style={{ gap: 10 }}>
      {acc.email ? <>
        <Row><View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: c.priSoft, alignItems: 'center', justifyContent: 'center' }}><T raw w="x" s={18} c={c.pri}>{(acc.name || acc.email || '?').slice(0, 1).toUpperCase()}</T></View>
          <View style={{ flex: 1 }}><T raw w="b">{acc.name || acc.email}</T><T raw s={13} c={c.muted}>{acc.email}</T></View></Row>
        <Row gap={6}><Ionicons name={acc.syncing ? 'sync' : 'cloud-done'} size={16} color={c.up} /><T s={13} c={c.muted}>{acc.syncing ? 'Sparar…' : 'Dina framsteg sparas i ditt konto.'}</T></Row>
        <Btn testID="logout" kind="ghost" label="Logga ut" onPress={() => setOut(true)} />
      </> : <>
        <Row><Ionicons name="person-circle" size={40} color={c.pri} /><View style={{ flex: 1 }}><T w="b">Spara dina framsteg</T><T s={13} c={c.muted}>Logga in så följer dina framsteg med till nya telefoner.</T></View></Row>
        <Btn testID="login" label="Logga in eller skapa konto" onPress={() => router.push('/auth')} />
      </>}
    </Card>
    {out ? <Sheet visible onClose={() => setOut(false)}><View style={{ alignItems: 'center', gap: 8 }}><Wick size={72} mood="sad" /><T w="x" s={22} center>Logga ut?</T>
      <T c={c.muted} center>Dina framsteg är sparade i kontot. Logga in igen när du vill fortsätta.</T></View>
      <Btn testID="logout-yes" kind="bad" label="Logga ut" onPress={async () => { setOut(false); await acc.signOut(); }} /><Btn kind="ghost" label="Avbryt" onPress={() => setOut(false)} /></Sheet> : null}
    <Card testID="age" style={{ gap: 8 }}><T w="b">Ålder</T><T s={13} c={c.muted}>Används för att anpassa innehållet. Lektioner om högriskprodukter kräver att du är 18.</T>
      <Row gap={8} style={{ flexWrap: 'wrap' }}>{([['u16', 'Under 16 år'], ['u18', '16–17 år'], ['y', '18–25 år'], ['o', 'Över 25 år'], ['', 'Vill inte säga']] as const).map(([k, l]) => <Pill key={k || 'none'} label={l} on={(S.age || '') === k} onPress={() => update(s => { s.age = k; })} />)}</Row></Card>
    <Card testID="legal" style={{ gap: 6 }}><T w="b">Juridik och data</T>
      <Row gap={18}><Pressable testID="terms" onPress={() => router.push({ pathname: '/legal', params: { doc: 'terms' } })}><T w="b" c={c.pri}>Användarvillkor</T></Pressable>
        <Pressable testID="privacy" onPress={() => router.push({ pathname: '/legal', params: { doc: 'privacy' } })}><T w="b" c={c.pri}>Integritetspolicy</T></Pressable></Row>
      <Pressable testID="delete" onPress={() => { setDelErr(null); setDel(true); }} style={{ paddingTop: 6 }}><T w="b" c={c.down}>{acc.email ? 'Radera mitt konto' : 'Radera all min data'}</T></Pressable></Card>
    {del ? <Sheet visible onClose={() => setDel(false)}><View style={{ alignItems: 'center', gap: 8 }}><Wick size={72} mood="sad" /><T w="x" s={22} center>{acc.email ? 'Radera kontot?' : 'Radera all data?'}</T>
      <T c={c.muted} center>{acc.email ? 'Ditt konto, dina framsteg och dina inställningar raderas för alltid. Det går inte att ångra. Samma inloggning används av Presento och tas också bort.' : 'Dina framsteg och inställningar på den här telefonen raderas för alltid. Det går inte att ångra.'}</T>
      {delErr ? <T c={c.down} center>{delErr}</T> : null}</View>
      <Btn testID="delete-yes" kind="bad" disabled={delBusy} label={delBusy ? 'Vänta…' : acc.email ? 'Radera kontot' : 'Radera all data'} onPress={async () => { setDelBusy(true); const e = await acc.deleteAll(); setDelBusy(false); if (e) setDelErr(e); else { setDel(false); router.replace('/onboarding'); } }} />
      <Btn kind="ghost" label="Avbryt" onPress={() => setDel(false)} /></Sheet> : null}
    <T w="x" s={18}>Inställningar</T>
    <Btn testID="a11y" label="Anpassa Wicki" onPress={() => setA11y(true)} />
    <Card style={{ padding: 0 }}>
      <View style={{ padding: 14, gap: 8 }}><T w="b">Språk</T><Row gap={8} style={{ flexWrap: 'wrap' }}>{(Object.keys(LANGS) as Lang[]).map(l => <Pill key={l} label={LANGS[l]} on={S.lang === l} onPress={() => update(s => { s.lang = l; })} />)}</Row></View><Divider />
      <View style={{ padding: 14, gap: 8 }}><T w="b">Tema</T><Row gap={8}>{([['system', 'Auto'], ['light', 'Ljust'], ['dark', 'Mörkt']] as const).map(([k, l]) => <Pill key={k} label={l} on={S.theme === k} onPress={() => update(s => { s.theme = k; })} />)}</Row></View><Divider />
      <View style={{ padding: 14, gap: 8 }}><T w="b">Dagligt mål</T><Row gap={8}>{[10, 20, 30, 50].map(g => <Pill key={g} label={g + ' XP'} on={GOAL(S) === g} onPress={() => update(s => { s.goal = g; })} />)}</Row></View><Divider />
      <SwitchRow label="Vibrationer" value={S.haptics} onChange={v => update(s => { s.haptics = v; })} />
    </Card>
    <Btn kind="ghost" label="Om Wicki och ansvar" onPress={() => setAbout(true)} />
    <A11ySheet open={a11y} onClose={() => setA11y(false)} />
    {about ? <Sheet visible onClose={() => setAbout(false)}><SheetTop title="Om Wicki" onClose={() => setAbout(false)} icon={<Wick size={34} lit anim="none" />} />
      {ABOUT.map(p => <T key={p}>{p}</T>)}<Btn label="Stäng" onPress={() => setAbout(false)} /></Sheet> : null}
  </ScrollView></Screen>;
}
