import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../src/store';
import { useAccount } from '../src/account/Account';
import { Btn, Card, Row, T } from '../src/ui/kit';
import { Wick } from '../src/ui/Wick';

type Mode = 'in' | 'up' | 'reset';
/** Logga in, skapa konto eller återställ lösenord. Framstegen sparas i kontot och följer med till nya telefoner. */
export default function Auth() {
  const { c, t, rtl, font, sys, buzz } = useStore(); const acc = useAccount(); const ins = useSafeAreaInsets();
  const [mode, setMode] = useState<Mode>('in'); const [email, setEmail] = useState(''); const [pw, setPw] = useState(''); const [name, setName] = useState('');
  const [show, setShow] = useState(false); const [busy, setBusy] = useState(false); const [err, setErr] = useState<string | null>(null); const [info, setInfo] = useState<string | null>(null);
  const valid = /\S+@\S+\.\S+/.test(email.trim()) && (mode === 'reset' || pw.length >= (mode === 'up' ? 8 : 1)) && (mode !== 'up' || name.trim().length > 0);
  const go = async () => {
    if (!valid || busy) return; setBusy(true); setErr(null); setInfo(null);
    if (mode === 'in') { const e = await acc.signIn(email, pw); setBusy(false); if (e) { setErr(e); buzz('no'); } else { buzz('done'); router.back(); } return; }
    if (mode === 'up') { const r = await acc.signUp(email, pw, name); setBusy(false); if (r.err) { setErr(r.err); buzz('no'); } else if (r.confirm) { setInfo('Nästan klart! Vi har skickat ett mejl. Bekräfta din e-post och logga sedan in.'); setMode('in'); } else { buzz('done'); router.back(); } return; }
    const e = await acc.reset(email); setBusy(false); if (e) setErr(e); else { setInfo('Om det finns ett konto med den e-posten har vi skickat en länk för att välja nytt lösenord.'); setMode('in'); }
  };
  const input = (v: string, set: (s: string) => void, ph: string, o: Record<string, unknown> = {}, id = '') =>
    <TextInput testID={id} value={v} onChangeText={x => { set(x); setErr(null); }} placeholder={t(ph)} placeholderTextColor={c.muted} onSubmitEditing={go}
      style={{ minHeight: 54, borderRadius: 16, borderWidth: 1, borderColor: c.glassB, backgroundColor: c.glass, paddingHorizontal: 16, color: c.ink, fontSize: 16.5, fontFamily: font('m'), fontWeight: sys ? '500' : undefined, textAlign: rtl ? 'right' : 'left', flex: 1 }} {...o} />;
  const title = mode === 'in' ? 'Logga in' : mode === 'up' ? 'Skapa konto' : 'Glömt lösenordet?';
  return <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, backgroundColor: c.bg }}>
    <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingTop: ins.top + 8, paddingHorizontal: 20, paddingBottom: ins.bottom + 30, gap: 14 }}>
      <Row><Pressable testID="close" accessibilityLabel={t('Stäng')} onPress={() => router.back()} style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: c.glass, borderWidth: 1, borderColor: c.glassB, alignItems: 'center', justifyContent: 'center' }}>
        <Ionicons name="close" size={22} color={c.muted} /></Pressable></Row>
      <View style={{ alignItems: 'center', gap: 6, marginVertical: 6 }}><Wick size={92} mood="cheer" lit />
        <T w="x" s={28} center>{title}</T>
        <T c={c.muted} center>{mode === 'reset' ? 'Skriv din e-post så skickar vi en länk.' : 'Spara dina framsteg och fortsätt på vilken telefon som helst.'}</T></View>
      {mode !== 'reset' ? <View style={{ flexDirection: rtl ? 'row-reverse' : 'row', backgroundColor: c.glass, borderColor: c.glassB, borderWidth: 1, borderRadius: 16, padding: 4, gap: 4 }}>
        {(['in', 'up'] as Mode[]).map(m => <Pressable key={m} testID={'mode-' + m} onPress={() => { setMode(m); setErr(null); setInfo(null); }} style={{ flex: 1, paddingVertical: 11, borderRadius: 12, backgroundColor: mode === m ? c.pri : 'transparent', alignItems: 'center' }}>
          <T w="b" c={mode === m ? c.on : c.ink}>{m === 'in' ? 'Logga in' : 'Skapa konto'}</T></Pressable>)}</View> : null}
      {info ? <Card style={{ backgroundColor: c.upSoft, borderColor: c.bubB }}><T s={15}>{info}</T></Card> : null}
      {mode === 'up' ? <Row>{input(name, setName, 'Vad heter du?', { autoCapitalize: 'words', textContentType: 'givenName', autoComplete: 'name', returnKeyType: 'next' }, 'name')}</Row> : null}
      <Row>{input(email, setEmail, 'E-post', { keyboardType: 'email-address', autoCapitalize: 'none', autoCorrect: false, textContentType: 'emailAddress', autoComplete: 'email', returnKeyType: 'next' }, 'email')}</Row>
      {mode !== 'reset' ? <Row>{input(pw, setPw, mode === 'up' ? 'Lösenord (minst 8 tecken)' : 'Lösenord', { secureTextEntry: !show, autoCapitalize: 'none', autoCorrect: false, textContentType: mode === 'up' ? 'newPassword' : 'password', autoComplete: mode === 'up' ? 'new-password' : 'current-password', returnKeyType: 'go' }, 'password')}
        <Pressable accessibilityLabel={t(show ? 'Dölj lösenord' : 'Visa lösenord')} onPress={() => setShow(v => !v)} style={{ width: 54, height: 54, borderRadius: 16, backgroundColor: c.glass, borderWidth: 1, borderColor: c.glassB, alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name={show ? 'eye-off' : 'eye'} size={22} color={c.muted} /></Pressable></Row> : null}
      {err ? <T s={15} c={c.down}>{err}</T> : null}
      <Btn testID="submit" label={busy ? 'Vänta…' : mode === 'in' ? 'Logga in' : mode === 'up' ? 'Skapa konto' : 'Skicka länk'} disabled={!valid || busy} onPress={go} />
      {mode === 'in' ? <Pressable testID="forgot" onPress={() => { setMode('reset'); setErr(null); setInfo(null); }}><T w="b" c={c.pri} center>Glömt lösenordet?</T></Pressable> : null}
      {mode === 'reset' ? <Pressable onPress={() => setMode('in')}><T w="b" c={c.pri} center>Tillbaka till inloggning</T></Pressable> : null}
      <Btn kind="ghost" label="Fortsätt utan konto" onPress={() => router.back()} />
      <T s={12.5} c={c.muted} center>Vi sparar bara din e-post, ditt namn och dina framsteg i appen. Du kan logga ut när du vill.</T>
      {mode === 'up' ? <View style={{ flexDirection: rtl ? 'row-reverse' : 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 4 }}><T s={12.5} c={c.muted}>Genom att skapa ett konto godkänner du</T>
        <Pressable onPress={() => router.push({ pathname: '/legal', params: { doc: 'terms' } })}><T s={12.5} w="b" c={c.pri}>användarvillkoren</T></Pressable><T s={12.5} c={c.muted}>och</T>
        <Pressable onPress={() => router.push({ pathname: '/legal', params: { doc: 'privacy' } })}><T s={12.5} w="b" c={c.pri}>integritetspolicyn</T></Pressable></View> : null}
    </ScrollView>
  </KeyboardAvoidingView>;
}
