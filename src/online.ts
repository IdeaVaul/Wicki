import { supabase, SUPABASE_URL, SUPABASE_KEY } from './account/supabase';
import type { State } from './types';

/** Allt som går mot nätet utöver kontot: veckoliga, vänner, AI-förklaringar och marknadsdata. */

/* ---------------- Veckoliga ---------------- */
const iso = (d: Date) => new Date(d.getTime() - d.getTimezoneOffset() * 6e4).toISOString().slice(0, 10);
/** Måndagen i den här veckan (lokal tid). */
export function weekStart(now = new Date()) { const d = new Date(now); const k = (d.getDay() + 6) % 7; d.setDate(d.getDate() - k); return iso(d); }
export function weekXP(S: State) { const w = weekStart(); return Object.entries(S.xpDay || {}).filter(([d]) => d >= w).reduce((a, [, v]) => a + (v || 0), 0); }

export type Profile = { user_id: string; name: string; code: string };
const CODE = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const newCode = () => Array.from({ length: 6 }, () => CODE[Math.floor(Math.random() * CODE.length)]).join('');

/** Hämtar eller skapar profilen (namn och vänkod) för inloggat konto. */
export async function myProfile(uid: string, name: string | null): Promise<Profile | null> {
  const { data } = await supabase.from('wicki_profiles').select('user_id,name,code').eq('user_id', uid).maybeSingle();
  if (data) return data as Profile;
  for (let k = 0; k < 4; k++) {
    const row = { user_id: uid, name: (name || 'Trader').trim().slice(0, 24) || 'Trader', code: newCode() };
    const { error } = await supabase.from('wicki_profiles').insert(row); if (!error) return row;
  }
  return null;
}
export async function rename(uid: string, name: string) { const n = name.trim().slice(0, 24); if (!n) return 'empty'; const { error } = await supabase.from('wicki_profiles').update({ name: n }).eq('user_id', uid); return error ? 'err' : null; }

/** Skickar veckans XP (anropas med fördröjning när XP ändras). */
export async function pushWeekXP(uid: string, xp: number) {
  await supabase.from('wicki_week_xp').upsert({ user_id: uid, week: weekStart(), xp: Math.max(0, Math.min(20000, Math.round(xp))), updated_at: new Date().toISOString() });
}
export type Rank = { user_id: string; name: string; xp: number; me?: boolean; friend?: boolean };
/** Veckans topplista (alla) och vännernas lista. */
export async function league(uid: string): Promise<{ top: Rank[]; friends: Rank[]; myPlace: number | null }> {
  const w = weekStart();
  const [{ data: rows }, { data: fr }] = await Promise.all([
    supabase.from('wicki_week_xp').select('user_id,xp').eq('week', w).order('xp', { ascending: false }).limit(50),
    supabase.from('wicki_friends').select('friend_id').eq('user_id', uid),
  ]);
  const fids = (fr || []).map((r: any) => r.friend_id as string);
  const { data: fxp } = fids.length ? await supabase.from('wicki_week_xp').select('user_id,xp').eq('week', w).in('user_id', [...fids, uid]) : { data: [] as any[] };
  const ids = [...new Set([...(rows || []).map((r: any) => r.user_id), ...fids, uid])];
  const { data: profs } = await supabase.from('wicki_profiles').select('user_id,name').in('user_id', ids);
  const nm = new Map<string, string>((profs || []).map((p: any) => [p.user_id, p.name]));
  const top: Rank[] = (rows || []).map((r: any) => ({ user_id: r.user_id, xp: r.xp, name: nm.get(r.user_id) || 'Trader', me: r.user_id === uid, friend: fids.includes(r.user_id) }));
  const fm = new Map<string, number>((fxp || []).map((r: any) => [r.user_id, r.xp]));
  const friends: Rank[] = [...fids, uid].map(id => ({ user_id: id, xp: fm.get(id) || 0, name: nm.get(id) || 'Trader', me: id === uid, friend: id !== uid })).sort((a, b) => b.xp - a.xp);
  const i = top.findIndex(r => r.me); return { top, friends, myPlace: i >= 0 ? i + 1 : null };
}
export async function addFriend(code: string): Promise<'ok' | 'notfound' | 'self' | 'auth' | 'err'> {
  const { data, error } = await supabase.rpc('wicki_add_friend', { friend_code: code }); return error ? 'err' : (data as any);
}
export async function removeFriend(id: string) { await supabase.rpc('wicki_remove_friend', { friend: id }); }

/* ---------------- AI ---------------- */
export type AiReq = { mode: 'explain'; q: string; opts?: string[]; ans: string; chosen?: string; why?: string } | { mode: 'ask'; question: string };
/** Frågar Wicki AI. Svarar med text eller en felkod: auth, limit, nokey, net. */
export async function askAI(req: AiReq, lang: string, age?: string): Promise<{ text?: string; err?: string }> {
  try {
    const { data: s } = await supabase.auth.getSession(); const tok = (s.session as any)?.access_token as string | undefined; if (!tok) return { err: 'auth' };
    const r = await fetch(`${SUPABASE_URL}/functions/v1/wicki-ai`, { method: 'POST', headers: { Authorization: `Bearer ${tok}`, apikey: SUPABASE_KEY, 'Content-Type': 'application/json' }, body: JSON.stringify({ ...req, lang, age }) });
    const j = await r.json().catch(() => ({})); if (j.text) return { text: j.text }; return { err: j.error || 'net' };
  } catch { return { err: 'net' }; }
}

/* ---------------- Marknadsdata ---------------- */
export type Quote = { id: string; name: string; price: number; ch: number; at: string; tf: string; src: string; cs: number[][]; line?: boolean };
let qCache: { t: number; ids: string; v: Quote[] } | null = null;
export async function quotes(ids = 'btc,eth,sol,eurusd,eursek'): Promise<Quote[] | null> {
  if (qCache && qCache.ids === ids && Date.now() - qCache.t < 60e3) return qCache.v;
  try {
    const r = await fetch(`${SUPABASE_URL}/functions/v1/wicki-quotes?ids=${ids}`, { headers: { apikey: SUPABASE_KEY } });
    const j = await r.json(); if (!Array.isArray(j.quotes)) return null; qCache = { t: Date.now(), ids, v: j.quotes }; return j.quotes;
  } catch { return null; }
}

/* ---------------- Vännernas trades (simulatorn) ---------------- */
export type FriendTrade = { id: number; user_id: string; name: string; mk: string; mode: string; side: 1 | -1; r: number; pl_pct: number; why: string; at: string;
  reacts: Record<string, number>; mine: string | null; me: boolean };
export const REACTS = [['fire', '🔥'], ['clap', '👏'], ['brain', '🧠']] as const;
/** Sparar en avslutad simulator-affär så att vännerna ser den. */
export async function shareTrade(uid: string, t: { mk: string; mode: string; side: 1 | -1; R: number; plPct: number; why: string }) {
  const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, Math.round(v * 100) / 100));
  await supabase.from('wicki_trades').insert({ user_id: uid, mk: t.mk, mode: t.mode, side: t.side, r: clamp(t.R, -50, 50), pl_pct: clamp(t.plPct, -100, 1000), why: t.why.slice(0, 24) });
}
/** Senaste affärerna från dig och dina vänner, med reaktioner. */
export async function friendTrades(uid: string): Promise<FriendTrade[]> {
  const { data: rows } = await supabase.from('wicki_trades').select('id,user_id,mk,mode,side,r,pl_pct,why,created_at').order('created_at', { ascending: false }).limit(30);
  if (!rows || !rows.length) return [];
  const ids = rows.map((r: any) => r.id); const users = [...new Set(rows.map((r: any) => r.user_id as string))];
  const [{ data: rx }, { data: profs }] = await Promise.all([
    supabase.from('wicki_trade_reacts').select('trade_id,user_id,emoji').in('trade_id', ids),
    supabase.from('wicki_profiles').select('user_id,name').in('user_id', users),
  ]);
  const nm = new Map<string, string>((profs || []).map((p: any) => [p.user_id, p.name]));
  return rows.map((r: any) => { const mine = (rx || []).find((x: any) => x.trade_id === r.id && x.user_id === uid) as any;
    const reacts: Record<string, number> = {}; (rx || []).filter((x: any) => x.trade_id === r.id).forEach((x: any) => { reacts[x.emoji] = (reacts[x.emoji] || 0) + 1; });
    return { id: r.id, user_id: r.user_id, name: nm.get(r.user_id) || 'Trader', mk: r.mk, mode: r.mode, side: r.side, r: +r.r, pl_pct: +r.pl_pct, why: r.why, at: r.created_at, reacts, mine: mine?.emoji || null, me: r.user_id === uid }; });
}
/** Sätter, byter eller tar bort din reaktion på en väns affär. */
export async function reactTrade(uid: string, id: number, emoji: string | null) {
  if (!emoji) { await supabase.from('wicki_trade_reacts').delete().eq('trade_id', id).eq('user_id', uid); return; }
  await supabase.from('wicki_trade_reacts').upsert({ trade_id: id, user_id: uid, emoji });
}
