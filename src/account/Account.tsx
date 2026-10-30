import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { useStore } from '../store';
import { DEFAULT, normalize } from '../engine/state';
import type { State } from '../types';
import { supabase } from './supabase';

type Acc = { email: string | null; name: string | null; ready: boolean; syncing: boolean; lastSync: number | null;
  signIn: (email: string, pw: string) => Promise<string | null>; signUp: (email: string, pw: string, name: string) => Promise<{ err: string | null; confirm: boolean }>;
  reset: (email: string) => Promise<string | null>; signOut: () => Promise<void>; deleteAll: () => Promise<string | null>;
  /** Dra ner för att uppdatera: hämtar kontots framsteg igen (eller laddar upp telefonens om de är nyare). */
  refresh: () => Promise<void> };
const Ctx = createContext<Acc>(null as any);
export const useAccount = () => useContext(Ctx);

/** Översätter Supabase-fel till svenska källsträngar (översätts sedan av t()). */
export function authErr(m?: string | null): string | null {
  if (!m) return null; const s = m.toLowerCase();
  if (s.includes('invalid login')) return 'Fel e-post eller lösenord.';
  if (s.includes('not confirmed')) return 'Bekräfta din e-post först. Kolla inkorgen.';
  if (s.includes('already registered') || s.includes('already been registered')) return 'Det finns redan ett konto med den e-posten. Logga in i stället.';
  if (s.includes('password') && (s.includes('6') || s.includes('short') || s.includes('weak'))) return 'Lösenordet måste vara minst 8 tecken.';
  if (s.includes('email') && s.includes('invalid')) return 'Skriv en giltig e-postadress.';
  if (s.includes('rate') || s.includes('too many')) return 'För många försök. Vänta en stund och försök igen.';
  if (s.includes('network') || s.includes('fetch')) return 'Ingen anslutning. Kontrollera internet och försök igen.';
  return 'Något gick fel. Försök igen.';
}
const KEEP: (keyof State)[] = ['lang', 'theme', 'haptics', 'tts', 'big', 'hc', 'a', 'vrate', 'vsound', 'lvcc' as keyof State];

/** Håller koll på inloggningen och synkar framstegen till Supabase (tabellen wicki_progress). */
export function AccountProvider({ children }: { children: React.ReactNode }) {
  const { S, update, ready: sReady } = useStore();
  const [uid, setUid] = useState<string | null>(null); const [email, setEmail] = useState<string | null>(null); const [name, setName] = useState<string | null>(null);
  const [ready, setReady] = useState(false); const [syncing, setSyncing] = useState(false); const [lastSync, setLastSync] = useState<number | null>(null);
  const pulled = useRef<string | null>(null); const Sref = useRef(S); Sref.current = S; const pushT = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { const u = data.session?.user; setUid(u?.id || null); setEmail(u?.email || null); setName((u?.user_metadata as any)?.name || null); setReady(true); });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => { const u = session?.user; setUid(u?.id || null); setEmail(u?.email || null); setName((u?.user_metadata as any)?.name || null); });
    const app = AppState.addEventListener('change', st => { if (st === 'active') supabase.auth.startAutoRefresh(); else supabase.auth.stopAutoRefresh(); });
    return () => { sub.subscription.unsubscribe(); app.remove(); };
  }, []);

  const push = async (id: string, s: State) => {
    setSyncing(true);
    const { error } = await supabase.from('wicki_progress').upsert({ user_id: id, state: s, xp: s.xp || 0, updated_at: new Date().toISOString() });
    setSyncing(false); if (!error) setLastSync(Date.now());
  };
  // Vid inloggning: hämta sparade framsteg. Har kontot mer XP än telefonen tar vi kontots, annars laddas telefonens upp.
  const sync = async (id: string) => {
    setSyncing(true);
    const { data, error } = await supabase.from('wicki_progress').select('state, xp').eq('user_id', id).maybeSingle();
    setSyncing(false); if (error) return;
    const local = Sref.current;
    if (data && (data.xp || 0) >= (local.xp || 0)) { update(s => { const r = normalize(data.state); Object.assign(s, r); KEEP.forEach(k => { (s as any)[k] = (local as any)[k]; }); s.onb = true; }); setLastSync(Date.now()); }
    else push(id, local);
  };
  useEffect(() => {
    if (!uid || !sReady || pulled.current === uid) return; pulled.current = uid;
    sync(uid);
  }, [uid, sReady]); // eslint-disable-line react-hooks/exhaustive-deps
  // Spara löpande (högst var tredje sekund) medan man är inloggad.
  useEffect(() => {
    if (!uid || pulled.current !== uid) return;
    if (pushT.current) clearTimeout(pushT.current);
    pushT.current = setTimeout(() => push(uid, Sref.current), 3000);
  }, [S, uid]); // eslint-disable-line react-hooks/exhaustive-deps

  /** Raderar kontot (om inloggad) och all data på enheten. Returnerar ett felmeddelande eller null. */
  const deleteAll = async (): Promise<string | null> => {
    if (uid) { if (pushT.current) clearTimeout(pushT.current); const { error } = await supabase.rpc('delete_my_account'); if (error) return 'Kontot kunde inte raderas. Kontrollera anslutningen och försök igen.'; try { await supabase.auth.signOut(); } catch { } pulled.current = null; }
    const lang = Sref.current.lang;
    update(s => { const fresh = normalize(JSON.parse(JSON.stringify(DEFAULT))); Object.keys(s).forEach(k => delete (s as any)[k]); Object.assign(s, fresh); s.lang = lang; s.onb = false; });
    return null;
  };
  const value: Acc = {
    email, name, ready, syncing, lastSync, deleteAll,
    refresh: async () => { if (uid) { try { await sync(uid); } catch { } } },
    signIn: async (e, pw) => { const { error } = await supabase.auth.signInWithPassword({ email: e.trim(), password: pw }); return authErr(error?.message); },
    signUp: async (e, pw, nm) => { if (pw.length < 8) return { err: 'Lösenordet måste vara minst 8 tecken.', confirm: false };
      const { data, error } = await supabase.auth.signUp({ email: e.trim(), password: pw, options: { data: { name: nm.trim(), app: 'wicki' } } });
      return { err: authErr(error?.message), confirm: !error && !data.session }; },
    reset: async e => { const { error } = await supabase.auth.resetPasswordForEmail(e.trim()); return authErr(error?.message); },
    signOut: async () => {
      if (uid) { if (pushT.current) clearTimeout(pushT.current); await push(uid, Sref.current); }
      await supabase.auth.signOut(); pulled.current = null;
      const local = Sref.current;
      update(s => { const fresh = normalize(JSON.parse(JSON.stringify(DEFAULT))); Object.keys(s).forEach(k => delete (s as any)[k]); Object.assign(s, fresh); KEEP.forEach(k => { (s as any)[k] = (local as any)[k]; }); s.onb = true; });
    },
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
