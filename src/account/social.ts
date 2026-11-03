import { Platform } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as WebBrowser from 'expo-web-browser';
import * as Crypto from 'expo-crypto';
import * as Linking from 'expo-linking';
import Constants from 'expo-constants';
import { supabase } from './supabase';
import { authErr } from './Account';

/** Inloggning med Apple (inbyggd i iOS) och Google (Supabase OAuth i en säker webbläsarflik).
 *  Svarar null när det gick bra eller användaren avbröt, annars ett felmeddelande (svensk källsträng). */

WebBrowser.maybeCompleteAuthSession?.();

export async function appleAvailable() {
  if (Platform.OS !== 'ios') return false;
  // Av tills appens profil hos Apple har rätten för Logga in med Apple (app.json → extra.appleSignIn).
  if ((Constants.expoConfig?.extra as any)?.appleSignIn === false) return false;
  try { return await AppleAuthentication.isAvailableAsync(); } catch { return false; }
}

export async function signInApple(): Promise<string | null> {
  try {
    const raw = Crypto.randomUUID();
    const hashed = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, raw);
    const cred = await AppleAuthentication.signInAsync({
      requestedScopes: [AppleAuthentication.AppleAuthenticationScope.FULL_NAME, AppleAuthentication.AppleAuthenticationScope.EMAIL],
      nonce: hashed,
    });
    if (!cred.identityToken) return 'Något gick fel. Försök igen.';
    const { error } = await supabase.auth.signInWithIdToken({ provider: 'apple', token: cred.identityToken, nonce: raw });
    if (error) return /provider is not enabled|unsupported provider/i.test(error.message) ? 'Inloggning med Apple är inte påslagen än.' : authErr(error.message);
    // Apple skickar namnet bara första gången: spara det i kontot.
    const n = [cred.fullName?.givenName, cred.fullName?.familyName].filter(Boolean).join(' ');
    if (n) await supabase.auth.updateUser({ data: { name: n } }).catch(() => { });
    return null;
  } catch (e: any) {
    if (e?.code === 'ERR_REQUEST_CANCELED' || e?.code === 'ERR_CANCELED') return null;
    return 'Något gick fel. Försök igen.';
  }
}

/** Plockar ut en parameter ur både ?query och #fragment. */
function param(url: string, k: string) {
  const m = url.match(new RegExp('[?#&]' + k + '=([^&#]+)')); return m ? decodeURIComponent(m[1]) : null;
}

export async function signInGoogle(): Promise<string | null> {
  try {
    const redirectTo = Linking.createURL('auth-callback');
    const { data, error } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo, skipBrowserRedirect: true, queryParams: { prompt: 'select_account' } } });
    if (error || !data?.url) return error && /provider is not enabled|unsupported provider/i.test(error.message) ? 'Inloggning med Google är inte påslagen än.' : authErr(error?.message || 'error');
    const res = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
    if (res.type !== 'success' || !res.url) return null; // avbrutet
    const errDesc = param(res.url, 'error_description'); if (errDesc) return /not enabled/i.test(errDesc) ? 'Inloggning med Google är inte påslagen än.' : authErr(errDesc);
    const code = param(res.url, 'code');
    if (code) { const r = await supabase.auth.exchangeCodeForSession(code); return r.error ? authErr(r.error.message) : null; }
    const at = param(res.url, 'access_token'), rt = param(res.url, 'refresh_token');
    if (at && rt) { const r = await supabase.auth.setSession({ access_token: at, refresh_token: rt }); return r.error ? authErr(r.error.message) : null; }
    return 'Något gick fel. Försök igen.';
  } catch { return 'Något gick fel. Försök igen.'; }
}
