import React, { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, TextInput, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../src/store';
import { useAccount } from '../src/account/Account';
import { Btn, Card, Row, T } from '../src/ui/kit';
import { Wick } from '../src/ui/Wick';
import { Confetti, CountUp, Enter, MScroll } from '../src/ui/motion';
import { Defs, RadialGradient, Rect, Stop, Line } from 'react-native-svg';
import { streakNow } from '../src/engine/state';
import { track } from '../src/analytics';
import * as AppleAuthentication from 'expo-apple-authentication';
import Svg, { Path } from 'react-native-svg';

/** Bakgrund i Wickis värld: svaga ljus som stiger mot ett grönt sken, så att skärmen känns som appen och inte som ett formulär. */
function Backdrop({ c }: { c: any }) {
  const cs = [[0.04, 0.62, 0.7, 1], [0.12, 0.55, 0.66, 1], [0.2, 0.58, 0.63, 0], [0.28, 0.5, 0.6, 1], [0.36, 0.44, 0.52, 1], [0.44, 0.47, 0.54, 0], [0.52, 0.38, 0.47, 1], [0.6, 0.33, 0.42, 1], [0.68, 0.36, 0.41, 0], [0.76, 0.26, 0.35, 1], [0.84, 0.2, 0.3, 1], [0.92, 0.16, 0.24, 1]];
  return <View pointerEvents="none" style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 360, opacity: 0.9 }}>
    <Svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
      <Defs><RadialGradient id="g" cx="50%" cy="30%" r="60%"><Stop offset="0" stopColor={c.pri} stopOpacity={0.28} /><Stop offset="1" stopColor={c.pri} stopOpacity={0} /></RadialGradient></Defs>
      <Rect x="0" y="0" width="100" height="100" fill="url(#g)" />
      {cs.map(([x, a, b, up], i) => <React.Fragment key={i}><Line x1={x * 100 + 1.6} x2={x * 100 + 1.6} y1={a * 100 - 4} y2={b * 100 + 4} stroke={up ? c.up : c.down} strokeOpacity={0.18} strokeWidth={0.4} />
        <Rect x={x * 100} y={a * 100} width={3.2} height={(b - a) * 100} rx={0.8} fill={up ? c.up : c.down} fillOpacity={0.16} /></React.Fragment>)}
    </Svg></View>;
}
import { appleAvailable, signInApple, signInGoogle } from '../src/account/social';
import { supabase } from '../src/account/supabase';

type Mode = 'in' | 'up' | 'reset';
/** Koncentriska hörn: inre radie = yttre radie minus marginalen, så att allt i kortet följer kortets form. */
const ROUT = 28, PAD = 12, RIN = ROUT - PAD;
/** Logga in, skapa konto eller återställ lösenord. Framstegen sparas i kontot och följer med till nya telefoner. */
export default function Auth() {
  const { S, c, t, rtl, font, sys, buzz, dark } = useStore(); const acc = useAccount(); const ins = useSafeAreaInsets();
  const p = useLocalSearchParams<{ mode?: Mode; from?: string }>();
  const [mode, setMode] = useState<Mode>(p.mode === 'up' ? 'up' : 'in'); const [email, setEmail] = useState(''); const [pw, setPw] = useState(''); const [name, setName] = useState('');
  const [show, setShow] = useState(false); const [busy, setBusy] = useState(false); const [err, setErr] = useState<string | null>(null); const [info, setInfo] = useState<string | null>(null);
  const [hasApple, setHasApple] = useState(false); const [mail, setMail] = useState(p.mode === 'up' ? false : false); const [welcome, setWelcome] = useState(false); const [poke, setPoke] = useState(0); useEffect(() => { appleAvailable().then(setHasApple); }, []);
  const social = async (kind: 'apple' | 'google') => {
    if (busy) return; setBusy(true); setErr(null); setInfo(null);
    const e = kind === 'apple' ? await signInApple() : await signInGoogle(); setBusy(false);
    if (e) { setErr(e); buzz('no'); return; }
    const { data } = await supabase.auth.getSession();
    if (data.session) { buzz('done'); track('signin_social', { method: kind, from: p.from || 'auth' }); setWelcome(true); }
  };
  const showMail = mail || mode === 'reset' || !!info || !!err;
  const valid = /\S+@\S+\.\S+/.test(email.trim()) && (mode === 'reset' || pw.length >= (mode === 'up' ? 8 : 1)) && (mode !== 'up' || name.trim().length > 0);
  const go = async () => {
    if (!valid || busy) return; setBusy(true); setErr(null); setInfo(null);
    if (mode === 'in') { const e = await acc.signIn(email, pw); setBusy(false); if (e) { setErr(e); buzz('no'); } else { buzz('done'); setWelcome(true); } return; }
    if (mode === 'up') { const r = await acc.signUp(email, pw, name); setBusy(false); if (r.err) { setErr(r.err); buzz('no'); } else if ((track('signup', { from: p.from || 'auth' }), r.confirm)) { setInfo('Nästan klart! Vi har skickat ett mejl. Bekräfta din e-post och logga sedan in.'); setMode('in'); } else { buzz('done'); setWelcome(true); } return; }
    const e = await acc.reset(email); setBusy(false); if (e) setErr(e); else { setInfo('Om det finns ett konto med den e-posten har vi skickat en länk för att välja nytt lösenord.'); setMode('in'); }
  };
  const input = (v: string, set: (s: string) => void, ph: string, o: Record<string, unknown> = {}, id = '') =>
    <TextInput testID={id} value={v} onFocus={() => setPoke(k => k + 1)} onChangeText={x => { set(x); setErr(null); }} placeholder={t(ph)} placeholderTextColor={c.muted} onSubmitEditing={go}
      style={{ minHeight: 54, borderRadius: RIN, borderWidth: 1, borderColor: c.glassB, backgroundColor: c.bg, paddingHorizontal: 16, color: c.ink, fontSize: 16.5, fontFamily: font('m'), fontWeight: sys ? '500' : undefined, textAlign: rtl ? 'right' : 'left', flex: 1 }} {...o} />;
  const title = mode === 'in' ? 'Logga in' : mode === 'up' ? 'Skapa konto' : 'Glömt lösenordet?';
  if (welcome) { const nm = (acc.name || name || '').trim().split(' ')[0];
    const stat = (v: number, l: string, col: string) => <View style={{ flex: 1, alignItems: 'center', gap: 2, paddingVertical: 12, borderRadius: RIN, backgroundColor: c.bg }}>
      <CountUp to={v} render={n => <T raw w="x" s={24} c={col}>{String(n)}</T>} /><T s={12.5} c={c.muted} center>{l}</T></View>;
    return <View style={{ flex: 1, backgroundColor: c.bg, padding: 20, paddingTop: ins.top + 40, paddingBottom: ins.bottom + 20, justifyContent: 'center', gap: 18 }}>
      <Backdrop c={c} />
      <Enter from="scale" style={{ alignItems: 'center', gap: 8 }}><Wick size={120} mood="cheer" lit anim="dance" />
        <T raw w="x" s={28} center>{nm ? `${t('Välkommen')}, ${nm}!` : t('Välkommen!')}</T><T c={c.muted} center>Dina framsteg är sparade i kontot och följer med till alla dina enheter.</T></Enter>
      <Enter delay={250}><View style={{ borderRadius: ROUT, padding: PAD, backgroundColor: c.surface, borderWidth: 1, borderColor: c.glassB, flexDirection: rtl ? 'row-reverse' : 'row', gap: 8,
        shadowColor: '#000', shadowOpacity: 0.35, shadowRadius: 24, shadowOffset: { width: 0, height: 12 }, elevation: 10 }}>
        {stat(S.xp, 'XP', c.gold)}{stat(streakNow(S), 'Dagar i rad', c.coral)}{stat(S.lessons, 'Lektioner', c.pri)}</View></Enter>
      <Btn testID="welcome-go" label="Fortsätt" onPress={() => router.back()} />
      <Confetti n={44} />
    </View>; }
  return <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, backgroundColor: c.bg }}>
    <Backdrop c={c} />
    <MScroll keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingTop: ins.top + 8, paddingHorizontal: 20, paddingBottom: ins.bottom + 30, gap: 14 }}>
      <Row><Pressable testID="close" accessibilityLabel={t('Stäng')} onPress={() => router.back()} style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: c.glass, borderWidth: 1, borderColor: c.glassB, alignItems: 'center', justifyContent: 'center' }}>
        <Ionicons name="close" size={22} color={c.muted} /></Pressable></Row>
      <View style={{ alignItems: 'center', gap: 6, marginVertical: 6 }}><Enter key={'w' + poke} from="scale"><Wick size={92} mood="cheer" lit anim={poke ? 'jump' : 'bob'} /></Enter>
        <T w="x" s={28} center>{title}</T>
        <T c={c.muted} center>{mode === 'reset' ? 'Skriv din e-post så skickar vi en länk.' : 'Spara dina framsteg och fortsätt på vilken telefon som helst.'}</T></View>
      {mode !== 'reset' && showMail ? <View style={{ flexDirection: rtl ? 'row-reverse' : 'row', backgroundColor: c.glass, borderColor: c.glassB, borderWidth: 1, borderRadius: 16, padding: 4, gap: 4 }}>
        {(['in', 'up'] as Mode[]).map(m => <Pressable key={m} testID={'mode-' + m} onPress={() => { setMode(m); setErr(null); setInfo(null); }} style={{ flex: 1, paddingVertical: 11, borderRadius: 12, backgroundColor: mode === m ? c.pri : 'transparent', alignItems: 'center' }}>
          <T w="b" c={mode === m ? c.on : c.ink}>{m === 'in' ? 'Logga in' : 'Skapa konto'}</T></Pressable>)}</View> : null}
      {mode !== 'reset' ? <View style={{ gap: 10, borderRadius: ROUT, padding: PAD, backgroundColor: c.surface, borderWidth: 1, borderColor: c.glassB, shadowColor: '#000', shadowOpacity: 0.35, shadowRadius: 24, shadowOffset: { width: 0, height: 12 }, elevation: 10 }}>
        {hasApple ? <AppleAuthentication.AppleAuthenticationButton testID="apple" buttonType={AppleAuthentication.AppleAuthenticationButtonType.CONTINUE}
          buttonStyle={dark ? AppleAuthentication.AppleAuthenticationButtonStyle.WHITE : AppleAuthentication.AppleAuthenticationButtonStyle.BLACK} cornerRadius={RIN}
          style={{ height: 56, width: '100%' }} onPress={() => social('apple')} /> : null}
        <Pressable testID="google" accessibilityRole="button" accessibilityLabel={t('Fortsätt med Google')} disabled={busy} onPress={() => social('google')}
          style={({ pressed }) => ({ height: 56, borderRadius: RIN, backgroundColor: hasApple ? 'transparent' : '#fff', borderWidth: 1, borderColor: '#DADCE0', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, transform: [{ scale: pressed ? 0.97 : 1 }] })}>
          <Svg width={20} height={20} viewBox="0 0 48 48"><Path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.6l6.7-6.7C35.6 2.4 30.2 0 24 0 14.6 0 6.6 5.4 2.7 13.3l7.8 6C12.4 13.6 17.7 9.5 24 9.5z" /><Path fill="#4285F4" d="M46.1 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.4c-.5 2.9-2.2 5.3-4.6 6.9l7.4 5.7c4.3-4 6.9-9.9 6.9-17.1z" /><Path fill="#FBBC05" d="M10.5 28.7c-.5-1.4-.8-3-.8-4.7s.3-3.3.8-4.7l-7.8-6C1 16.6 0 20.2 0 24s1 7.4 2.7 10.7l7.8-6z" /><Path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.4-5.7c-2.1 1.4-4.8 2.3-8.5 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.8 6C6.6 42.6 14.6 48 24 48z" /></Svg>
          <T w="b" s={16.5} c={hasApple ? c.ink : '#1F1F1F'}>Fortsätt med Google</T></Pressable>
        {!mail ? <Pressable testID="use-email" onPress={() => { setMail(true); setPoke(k => k + 1); }} style={{ paddingVertical: 10 }}><T w="b" c={c.muted} center>Fortsätt med e-post</T></Pressable> : null}
      </View> : null}
      {info ? <Card style={{ backgroundColor: c.upSoft, borderColor: c.bubB }}><T s={15}>{info}</T></Card> : null}
      {showMail ? <Enter from="up" style={{ gap: 14 }}>
      {mode === 'up' ? <Row>{input(name, setName, 'Vad heter du?', { autoCapitalize: 'words', textContentType: 'givenName', autoComplete: 'name', returnKeyType: 'next' }, 'name')}</Row> : null}
      <Row>{input(email, setEmail, 'E-post', { keyboardType: 'email-address', autoCapitalize: 'none', autoCorrect: false, textContentType: 'emailAddress', autoComplete: 'email', returnKeyType: 'next' }, 'email')}</Row>
      {mode !== 'reset' ? <Row>{input(pw, setPw, mode === 'up' ? 'Lösenord (minst 8 tecken)' : 'Lösenord', { secureTextEntry: !show, autoCapitalize: 'none', autoCorrect: false, textContentType: mode === 'up' ? 'newPassword' : 'password', autoComplete: mode === 'up' ? 'new-password' : 'current-password', returnKeyType: 'go' }, 'password')}
        <Pressable accessibilityLabel={t(show ? 'Dölj lösenord' : 'Visa lösenord')} onPress={() => setShow(v => !v)} style={{ width: 54, height: 54, borderRadius: RIN, backgroundColor: c.glass, borderWidth: 1, borderColor: c.glassB, alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name={show ? 'eye-off' : 'eye'} size={22} color={c.muted} /></Pressable></Row> : null}
      {err ? <T s={15} c={c.down}>{err}</T> : null}
      <Btn testID="submit" label={busy ? 'Vänta…' : mode === 'in' ? 'Logga in' : mode === 'up' ? 'Skapa konto' : 'Skicka länk'} disabled={!valid || busy} onPress={go} />
      {mode === 'in' ? <Pressable testID="forgot" onPress={() => { setMode('reset'); setErr(null); setInfo(null); }}><T w="b" c={c.pri} center>Glömt lösenordet?</T></Pressable> : null}
      {mode === 'reset' ? <Pressable onPress={() => setMode('in')}><T w="b" c={c.pri} center>Tillbaka till inloggning</T></Pressable> : null}
      </Enter> : null}
      <Btn kind="ghost" label="Fortsätt utan konto" onPress={() => router.back()} />
      <T s={12.5} c={c.muted} center>Vi sparar bara din e-post, ditt namn och dina framsteg i appen. Du kan logga ut när du vill.</T>
      {mode === 'up' ? <View style={{ flexDirection: rtl ? 'row-reverse' : 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 4 }}><T s={12.5} c={c.muted}>Genom att skapa ett konto godkänner du</T>
        <Pressable onPress={() => router.push({ pathname: '/legal', params: { doc: 'terms' } })}><T s={12.5} w="b" c={c.pri}>användarvillkoren</T></Pressable><T s={12.5} c={c.muted}>och</T>
        <Pressable onPress={() => router.push({ pathname: '/legal', params: { doc: 'privacy' } })}><T s={12.5} w="b" c={c.pri}>integritetspolicyn</T></Pressable></View> : null}
    </MScroll>
  </KeyboardAvoidingView>;
}
