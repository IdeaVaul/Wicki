import React, { useState } from 'react';
import { FlatList, Pressable, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { useStore } from '../../src/store';
import { PAT } from '../../src/data/patterns';
import { GLOSS, CFIG } from '../../src/engine/course';
import { Btn, Card, Pill, Row, Sheet, SheetTop, T } from '../../src/ui/kit';
import { Header, Screen } from '../../src/ui/Header';
import { KidSheet, KidTopic, PatCard, kidConcept, kidPattern } from '../../src/ui/sheets';
import { CandleChart } from '../../src/ui/Chart';
import { patCandles } from '../../src/engine/charts';

export default function Library() {
  const { c, t, font, S, rtl } = useStore();
  const [tab, setTab] = useState<'mon' | 'beg'>('mon');
  const [f, setF] = useState('all'); const [q, setQ] = useState('');
  const [pat, setPat] = useState<string | null>(null); const [kid, setKid] = useState<KidTopic | null>(null);
  const ids = Object.keys(PAT).filter(id => { const g = PAT[id].sig; return f === 'all' || (f === 'up' && /Up/.test(g) && /rev/.test(g)) || (f === 'down' && /Down/.test(g) && /rev/.test(g)) || (f === 'neu' && g === 'neutral') || (f === 'cont' && /cont/.test(g)); });
  const ql = q.toLowerCase();
  const terms = GLOSS.filter(([a, b]) => !ql || a.toLowerCase().includes(ql) || b.toLowerCase().includes(ql) || t(a).toLowerCase().includes(ql) || t(b).toLowerCase().includes(ql));
  const head = <View style={{ gap: 12, marginBottom: 12 }}>
    <T w="x" s={26}>Bibliotek</T>
    <Row gap={8}><Pill label="Mönster" on={tab === 'mon'} onPress={() => setTab('mon')} /><Pill label="Begrepp" on={tab === 'beg'} onPress={() => setTab('beg')} /></Row>
    {tab === 'mon' ? <Row gap={8} style={{ flexWrap: 'wrap' }}>{[['all', 'Alla'], ['up', 'Vändning upp'], ['down', 'Vändning ner'], ['neu', 'Obeslutsamhet'], ['cont', 'Fortsättning']].map(([k, l]) => <Pill key={k} label={l} on={f === k} onPress={() => setF(k)} />)}</Row>
      : <TextInput value={q} onChangeText={setQ} placeholder={t('Sök begrepp…')} placeholderTextColor={c.muted} accessibilityLabel={t('Sök begrepp…')}
        style={{ borderWidth: 2, borderColor: c.line, borderRadius: 14, padding: 12, backgroundColor: c.surface, color: c.ink, fontFamily: font('m'), fontSize: 16 * (S.big ? 1.18 : 1), textAlign: rtl ? 'right' : 'left' }} />}
  </View>;
  return <Screen><Header />
    {tab === 'mon' ? <FlatList key="mon" data={ids} numColumns={2} keyExtractor={x => x} ListHeaderComponent={head} contentContainerStyle={{ padding: 16, paddingBottom: 130 }} columnWrapperStyle={{ gap: 10 }}
      renderItem={({ item }) => { const P = PAT[item]; const r = patCandles(item, 11); return <Pressable testID={'pat-' + item} onPress={() => setPat(item)} style={{ flex: 1, marginBottom: 10, borderWidth: 2, borderBottomWidth: 4, borderColor: c.line, borderRadius: 14, backgroundColor: c.surface, padding: 8, gap: 4 }}>
        <CandleChart cs={r.cs.slice(-P.k - 3)} h={90} pad={8} hl={[3, 3 + P.k - 1]} /><T w="b" s={14}>{P.n}</T></Pressable>; }} />
      : <FlatList key="beg" data={terms} keyExtractor={x => x[0]} ListHeaderComponent={head} contentContainerStyle={{ padding: 16, paddingBottom: 130, gap: 10 }}
        ListEmptyComponent={<T c={c.muted}>Inget begrepp matchar.</T>}
        renderItem={({ item: [a, b] }) => <Card style={{ gap: 4 }}><T w="x" s={16}>{a}</T><T s={14.5}>{b}</T>
          <Pressable onPress={() => { const pid = Object.keys(PAT).find(id => PAT[id].n === a); setKid(pid ? kidPattern(pid) : kidConcept(a, b, CFIG[a])); }}><T w="x" s={12} c={c.pri} upper>✦ Steg för steg</T></Pressable></Card>} />}
    {pat ? <Sheet visible onClose={() => setPat(null)}>
      <SheetTop title="Mönster" onClose={() => setPat(null)} />
      <PatCard id={pat} />
      <Btn kind="ghost" label="Wicki förklarar steg för steg" onPress={() => setKid(kidPattern(pat))} />
      <Btn label="Öva på mönstret" onPress={() => { const id = pat; setPat(null); router.push({ pathname: '/lesson', params: { mode: 'pat', id } }); }} />
      <KidSheet topic={kid} onClose={() => setKid(null)} />
    </Sheet> : <KidSheet topic={kid} onClose={() => setKid(null)} />}
  </Screen>;
}
