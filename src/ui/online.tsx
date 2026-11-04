import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, ScrollView, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Polyline } from 'react-native-svg';
import { useStore } from '../store';
import { useAccount } from '../account/Account';
import { askAI, pushWeekXP, quotes, weekXP, type AiReq, type Quote } from '../online';
import { track } from '../analytics';
import { Btn, Card, Row, Sheet, SheetTop, T } from './kit';
import { Enter, Press } from './motion';
import { Wick } from './Wick';
import { CandleChart } from './Chart';

/* ---------------- Marknaden nu (Hem) ---------------- */
function Spark({ cs, up, w = 84, h = 30 }: { cs: number[][]; up: boolean; w?: number; h?: number }) {
  const { c } = useStore(); const v = cs.map(x => x[3]); if (v.length < 2) return null;
  const lo = Math.min(...v), hi = Math.max(...v), sp = hi - lo || 1;
  const pts = v.map((y, i) => `${(i / (v.length - 1) * w).toFixed(1)},${(h - (y - lo) / sp * h).toFixed(1)}`).join(' ');
  return <Svg width={w} height={h}><Polyline points={pts} fill="none" stroke={up ? c.up : c.down} strokeWidth={2} strokeLinejoin="round" /></Svg>;
}
const fmt = (p: number) => p >= 1000 ? Math.round(p).toLocaleString('sv-SE') : p >= 10 ? p.toFixed(2) : p.toFixed(4);

export function MarketCard() {
  const { c, t, rtl } = useStore(); const [q, setQ] = useState<Quote[] | null>(null); const [err, setErr] = useState(false); const [open, setOpen] = useState<Quote | null>(null);
  useEffect(() => { let on = true; quotes().then(v => { if (!on) return; if (v && v.length) setQ(v); else setErr(true); }); return () => { on = false; }; }, []);
  if (err) return null;
  return <Card testID="market" style={{ gap: 10 }}>
    <Row style={{ justifyContent: 'space-between' }}><Row gap={6}><Ionicons name="pulse" size={18} color={c.pri} /><T w="x" s={17}>Marknaden nu</T></Row>
      <T s={11.5} c={c.muted}>Riktiga kurser, något fördröjda</T></Row>
    {!q ? <ActivityIndicator color={c.pri} /> : <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, flexDirection: rtl ? 'row-reverse' : 'row' }}>
      {q.map((x, i) => <Enter key={x.id} delay={i * 60} from="side"><Press testID={'mk-' + x.id} onPress={() => { track('market_open', { id: x.id }); setOpen(x); }}
        style={{ width: 128, padding: 10, borderRadius: 16, backgroundColor: c.surface, borderWidth: 1, borderColor: c.glassB, gap: 4 }}>
        <T raw w="b" s={13.5} lines={1}>{t(x.name)}</T>
        <T raw w="x" s={16}>{fmt(x.price)}</T>
        <T raw w="b" s={12.5} c={x.ch >= 0 ? c.up : c.down}>{`${x.ch >= 0 ? '▲' : '▼'} ${Math.abs(x.ch).toFixed(2)} %`}</T>
        <Spark cs={x.cs.slice(-40)} up={x.ch >= 0} w={104} />
      </Press></Enter>)}
    </ScrollView>}
    <T raw s={11} c={c.muted}>Powered by CoinGecko · Source: ECB statistics</T>
    <Sheet visible={!!open} onClose={() => setOpen(null)}>
      {open ? <>
        <SheetTop title={t(open.name)} onClose={() => setOpen(null)} />
        <Row style={{ justifyContent: 'space-between' }}><T raw w="x" s={26}>{fmt(open.price)}</T><T raw w="x" s={16} c={open.ch >= 0 ? c.up : c.down}>{`${open.ch >= 0 ? '+' : ''}${open.ch.toFixed(2)} %`}</T></Row>
        <CandleChart cs={open.cs.map(r => ({ o: r[0], h: r[1], l: r[2], c: r[3], v: 0 }))} h={220} pad={8} ma={open.line ? 0 : 20} asLine={!!open.line} />
        <T raw s={12} c={c.muted}>{`${open.line ? t('Dagliga referenskurser') : t('Timljus')} · ${open.src === 'CoinGecko' ? 'Powered by CoinGecko' : 'Source: ECB statistics'} · ${open.at.replace('T', ' ').slice(0, 16)}`}</T>
        <T s={13} c={c.muted}>Kurserna visas för att du ska öva på att läsa riktiga grafer. Det är inga råd om att köpa eller sälja.</T>
        <Btn label="Öva på riktiga grafer" onPress={() => { setOpen(null); router.push({ pathname: '/lesson', params: { mode: 'real' } }); }} />
      </> : null}
    </Sheet>
  </Card>;
}

/* ---------------- AI-förklaring i lektionen ---------------- */
const AIERR: Record<string, string> = { auth: 'Skapa ett gratis konto för att fråga Wicki AI.', limit: 'Du har ställt många frågor i dag. Nya frågor går att ställa i morgon.', nokey: 'Wicki AI är inte påslagen än.', net: 'Ingen anslutning. Försök igen.' };
export function AiSheet({ open, onClose, req }: { open: boolean; onClose: () => void; req: AiReq | null }) {
  const { S, c } = useStore(); const acc = useAccount(); const [txt, setTxt] = useState<string | null>(null); const [err, setErr] = useState<string | null>(null);
  useEffect(() => {
    if (!open || !req) return; setTxt(null); setErr(null);
    if (!acc.email) { setErr('auth'); return; }
    track('ai_ask', { mode: req.mode }); askAI(req, S.lang, S.age).then(r => { if (r.text) setTxt(r.text); else setErr(r.err || 'net'); });
  }, [open, req]); // eslint-disable-line react-hooks/exhaustive-deps
  return <Sheet visible={open} onClose={onClose}>
    <SheetTop title="Wicki AI förklarar" onClose={onClose} icon={<Wick size={30} lit anim="none" />} />
    {txt ? <Enter><Card><T raw s={16}>{txt}</T></Card></Enter>
      : err ? <Card style={{ gap: 10 }}><T>{AIERR[err] || AIERR.net}</T>{err === 'auth' ? <Btn label="Skapa gratis konto" onPress={() => { onClose(); router.push({ pathname: '/auth', params: { mode: 'up', from: 'ai' } }); }} /> : null}</Card>
      : <Row style={{ justifyContent: 'center', paddingVertical: 18 }}><ActivityIndicator color={c.pri} /><T c={c.muted}>Wicki tänker…</T></Row>}
    <T s={11.5} c={c.muted} center>AI kan ha fel. Wicki ger utbildning, inte investeringsråd.</T>
  </Sheet>;
}

/* ---------------- Synk av veckans XP till ligan ---------------- */
export function useLeagueSync() {
  const { S } = useStore(); const acc = useAccount(); const last = useRef(-1);
  useEffect(() => {
    if (!acc.uid) return; const xp = weekXP(S); if (xp === last.current) return;
    const h = setTimeout(() => { last.current = xp; pushWeekXP(acc.uid!, xp).catch(() => { }); }, 2500); return () => clearTimeout(h);
  }, [S.xp, acc.uid]); // eslint-disable-line react-hooks/exhaustive-deps
}
