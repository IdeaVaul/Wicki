import React, { useRef, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../src/store';
import { useAccount } from '../src/account/Account';
import { askAI } from '../src/online';
import { track } from '../src/analytics';
import { Btn, Pill, Row, T } from '../src/ui/kit';
import { Enter } from '../src/ui/motion';
import { Wick } from '../src/ui/Wick';

const IDEAS = ['Vad är skillnaden mellan en aktie och en fond?', 'Hur sätter jag en bra stop-loss?', 'Vad betyder RSI?', 'Varför förlorar de flesta daytraders pengar?'];

/** Fråga Wicki: AI-chatt om trading och sparande. Bara utbildning, aldrig råd om köp och sälj. */
export default function Ask() {
  const { S, c, t, rtl, font, buzz } = useStore(); const acc = useAccount(); const ins = useSafeAreaInsets();
  const [msgs, setMsgs] = useState<{ me: boolean; text: string; err?: boolean }[]>([]); const [q, setQ] = useState(''); const [busy, setBusy] = useState(false);
  const sv = useRef<any>(null);
  const send = async (text: string) => {
    const s = text.trim(); if (!s || busy) return; buzz('tap'); setQ(''); setBusy(true); setMsgs(m => [...m, { me: true, text: s }]); track('ai_chat');
    const r = await askAI({ mode: 'ask', question: s }, S.lang, S.age); setBusy(false);
    setMsgs(m => [...m, r.text ? { me: false, text: r.text } : { me: false, err: true, text: t(r.err === 'limit' ? 'Du har ställt många frågor i dag. Nya frågor går att ställa i morgon.' : r.err === 'nokey' ? 'Wicki AI är inte påslagen än.' : 'Ingen anslutning. Försök igen.') }]);
    setTimeout(() => sv.current?.scrollToEnd?.({ animated: true }), 80);
  };
  const back = <Pressable accessibilityLabel={t('Tillbaka')} onPress={() => router.back()} style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: c.glass, borderWidth: 1, borderColor: c.glassB, alignItems: 'center', justifyContent: 'center' }}>
    <Ionicons name={rtl ? 'chevron-forward' : 'chevron-back'} size={22} color={c.ink} /></Pressable>;
  return <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, backgroundColor: c.bg }}>
    <Row style={{ paddingTop: ins.top + 8, paddingHorizontal: 16, paddingBottom: 8 }}>{back}<Wick size={34} lit anim="none" /><View style={{ flex: 1 }}><T w="x" s={20}>Fråga Wicki</T><T s={12} c={c.muted}>AI kan ha fel. Utbildning, inte investeringsråd.</T></View></Row>
    {!acc.email ? <Enter from="scale" style={{ padding: 20, gap: 14, alignItems: 'center' }}><Wick mood="cheer" size={100} lit anim="jump" />
      <T center>Ställ vilken fråga du vill om trading och sparande, så förklarar Wicki på ditt språk.</T>
      <Btn label="Skapa gratis konto" onPress={() => router.push({ pathname: '/auth', params: { mode: 'up', from: 'ask' } })} style={{ alignSelf: 'stretch' }} /></Enter>
      : <>
        <ScrollView ref={sv} contentContainerStyle={{ padding: 16, gap: 10 }}>
          {msgs.length === 0 ? <Enter style={{ gap: 10 }}><T w="b" c={c.muted}>Prova att fråga:</T>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>{IDEAS.map(x => <Pill key={x} label={x} onPress={() => send(t(x))} />)}</View></Enter> : null}
          {msgs.map((m, i) => <Enter key={i} from={m.me ? 'side' : 'up'} dy={m.me ? (rtl ? -14 : 14) : 14}>
            <View style={{ alignSelf: m.me === !rtl ? 'flex-end' : 'flex-start', maxWidth: '88%', padding: 12, borderRadius: 18, backgroundColor: m.me ? c.pri : m.err ? c.downSoft : c.glass, borderWidth: m.me ? 0 : 1, borderColor: c.glassB }}>
              <T raw s={15.5} c={m.me ? c.on : c.ink}>{m.text}</T></View></Enter>)}
          {busy ? <Row><ActivityIndicator color={c.pri} /><T c={c.muted}>Wicki tänker…</T></Row> : null}
        </ScrollView>
        <Row style={{ padding: 12, paddingBottom: ins.bottom + 10, borderTopWidth: 1, borderColor: c.line }}>
          <TextInput testID="ask-input" value={q} onChangeText={setQ} placeholder={t('Skriv din fråga…')} placeholderTextColor={c.muted} multiline maxLength={500}
            style={{ flex: 1, maxHeight: 110, minHeight: 46, borderRadius: 18, borderWidth: 1, borderColor: c.glassB, backgroundColor: c.surface, paddingHorizontal: 14, paddingTop: 12, color: c.ink, fontFamily: font('m'), fontSize: 16, textAlign: rtl ? 'right' : 'left' }} />
          <Pressable testID="ask-send" accessibilityLabel={t('Skicka')} disabled={!q.trim() || busy} onPress={() => send(q)} style={{ width: 46, height: 46, borderRadius: 23, backgroundColor: q.trim() ? c.pri : c.track, alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="arrow-up" size={22} color={c.on} /></Pressable>
        </Row>
      </>}
  </KeyboardAvoidingView>;
}
