import React, { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import * as Linking from 'expo-linking';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStore } from '../src/store';
import { Btn, Card, T } from '../src/ui/kit';
import { Wick } from '../src/ui/Wick';
import { Enter } from '../src/ui/motion';
import { supabase } from '../src/account/supabase';
import { authErr } from '../src/account/Account';
import { track } from '../src/analytics';

/** Länkar från mejl (bekräfta e-post, nytt lösenord) och inloggning öppnar wick://auth-callback.
 *  Läser token ur länken, loggar in, och visar formuläret för nytt lösenord när länken gäller återställning. */
function param(url: string, k: string) { const m = url.match(new RegExp('[?#&]' + k + '=([^&#]+)')); return m ? decodeURIComponent(m[1]) : null; }

type St = 'wait' | 'recovery' | 'done' | 'saved' | 'bad';
export default function AuthCallback() {
  const { c, t, rtl, font, buzz } = useStore(); const ins = useSafeAreaInsets(); const url = Linking.useURL();
  const [st, setSt] = useState<St>('wait'); const [pw, setPw] = useState(''); const [busy, setBusy] = useState(false); const [err, setErr] = useState<string | null>(null);
  useEffect(() => {
    let on = true;
    (async () => {
      const u = url || (await Linking.getInitialURL()) || ''; if (!u) { setTimeout(() => { if (on && st === 'wait') setSt('bad'); }, 2500); return; }
      if (param(u, 'error_description')) { setSt('bad'); return; }
      const type = param(u, 'type'); const code = param(u, 'code'); const at = param(u, 'access_token'), rt = param(u, 'refresh_token');
      let ok = false;
      if (code) ok = !(await supabase.auth.exchangeCodeForSession(code)).error;
      else if (at && rt) ok = !(await supabase.auth.setSession({ access_token: at, refresh_token: rt })).error;
      else ok = !!(await supabase.auth.getSession()).data.session;
      if (!on) return;
      setSt(!ok ? 'bad' : type === 'recovery' ? 'recovery' : 'done'); if (ok) track('auth_link', { type: type || 'login' });
    })();
    return () => { on = false; };
  }, [url]); // eslint-disable-line react-hooks/exhaustive-deps
  const save = async () => {
    if (pw.length < 8 || busy) return; setBusy(true); setErr(null);
    const { error } = await supabase.auth.updateUser({ password: pw }); setBusy(false);
    if (error) { setErr(authErr(error.message) || 'Något gick fel. Försök igen.'); buzz('no'); return; }
    buzz('done'); setSt('saved');
  };
  const home = () => router.replace('/');
  return <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, backgroundColor: c.bg }}>
    <View style={{ flex: 1, paddingTop: ins.top + 40, paddingHorizontal: 20, paddingBottom: ins.bottom + 24, gap: 16, justifyContent: 'center' }}>
      <Enter><View style={{ alignItems: 'center', gap: 8 }}><Wick size={88} mood={st === 'bad' ? 'sad' : 'cheer'} lit={st !== 'bad'} />
        <T w="x" s={24} center>{st === 'wait' ? 'Ett ögonblick…' : st === 'recovery' ? 'Välj ett nytt lösenord' : st === 'saved' ? 'Lösenordet är bytt' : st === 'done' ? 'Klart! Du är inloggad' : 'Länken fungerar inte'}</T>
        <T c={c.muted} center>{st === 'recovery' ? 'Minst 8 tecken.' : st === 'bad' ? 'Länken kan ha gått ut eller redan använts. Be om en ny från inloggningen.' : st === 'wait' ? '' : 'Dina framsteg sparas nu i kontot.'}</T></View></Enter>
      {st === 'recovery' ? <Card style={{ gap: 12 }}>
        <TextInput testID="newpw" value={pw} onChangeText={x => { setPw(x); setErr(null); }} placeholder={t('Nytt lösenord')} placeholderTextColor={c.muted} secureTextEntry autoCapitalize="none" autoCorrect={false} textContentType="newPassword" onSubmitEditing={save}
          style={{ minHeight: 54, borderRadius: 16, borderWidth: 1, borderColor: c.glassB, backgroundColor: c.glass, paddingHorizontal: 16, color: c.ink, fontSize: 16.5, fontFamily: font('m'), textAlign: rtl ? 'right' : 'left' }} />
        {err ? <T c={c.down}>{err}</T> : null}
        <Btn testID="savepw" label={busy ? 'Vänta…' : 'Spara lösenordet'} disabled={pw.length < 8 || busy} onPress={save} />
      </Card> : null}
      {st === 'done' || st === 'saved' ? <Btn label="Fortsätt" onPress={home} /> : null}
      {st === 'bad' ? <Btn label="Till inloggningen" onPress={() => router.replace({ pathname: '/auth', params: { mode: 'in' } })} /> : null}
    </View>
  </KeyboardAvoidingView>;
}
