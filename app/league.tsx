import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, Share, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../src/store';
import { useAccount } from '../src/account/Account';
import { REACTS, addFriend, friendTrades, league, myProfile, pushWeekXP, reactTrade, removeFriend, rename, weekXP, type FriendTrade, type Profile, type Rank } from '../src/online';
import { Switch } from 'react-native';
import { track } from '../src/analytics';
import { Btn, Card, Pill, Row, Sheet, SheetTop, T } from '../src/ui/kit';
import { MScroll, Enter } from '../src/ui/motion';
import { Wick } from '../src/ui/Wick';

const MKN: Record<string, string> = { stock: 'Aktie', fx: 'Forex', crypto: 'Krypto', gold: 'Guld' };
function ago(iso: string) { const m = Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 6e4)); return m < 60 ? `${m} min` : m < 1440 ? `${Math.round(m / 60)} h` : `${Math.round(m / 1440)} d`; }

/** Veckoliga och vänner: XP den här veckan mot alla som spelar och mot dina vänner. Nollställs varje måndag. */
export default function League() {
  const { S, c, t, rtl, font, buzz, update } = useStore(); const acc = useAccount(); const ins = useSafeAreaInsets();
  const [tab, setTab] = useState<'all' | 'friends'>('all'); const [me, setMe] = useState<Profile | null>(null);
  const [data, setData] = useState<{ top: Rank[]; friends: Rank[]; myPlace: number | null } | null>(null);
  const [feed, setFeed] = useState<FriendTrade[] | null>(null); const [code, setCode] = useState(''); const [msg, setMsg] = useState<string | null>(null); const [edit, setEdit] = useState(false); const [nm, setNm] = useState('');
  const load = useCallback(async () => {
    if (!acc.uid) return; const p = await myProfile(acc.uid, acc.name); setMe(p);
    await pushWeekXP(acc.uid, weekXP(S)).catch(() => { }); setData(await league(acc.uid).catch(() => ({ top: [], friends: [], myPlace: null }))); setFeed(await friendTrades(acc.uid).catch(() => []));
  }, [acc.uid]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { load(); track('league_open'); }, [load]);
  const days = 7 - ((new Date().getDay() + 6) % 7);

  const back = <Pressable accessibilityLabel={t('Tillbaka')} onPress={() => router.back()} style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: c.glass, borderWidth: 1, borderColor: c.glassB, alignItems: 'center', justifyContent: 'center' }}>
    <Ionicons name={rtl ? 'chevron-forward' : 'chevron-back'} size={22} color={c.ink} /></Pressable>;
  if (!acc.email) return <View style={{ flex: 1, backgroundColor: c.bg, paddingTop: ins.top + 8, paddingHorizontal: 20, gap: 16 }}>
    {back}
    <Enter from="scale" style={{ alignItems: 'center', gap: 12, marginTop: 30 }}><Wick mood="cheer" size={110} lit anim="jump" />
      <T w="x" s={26} center>Veckoligan</T>
      <T center c={c.muted}>Tävla med din XP mot andra som lär sig trading, och utmana dina vänner. Ligan börjar om varje måndag.</T>
      <Btn label="Skapa gratis konto" onPress={() => router.push({ pathname: '/auth', params: { mode: 'up', from: 'league' } })} style={{ alignSelf: 'stretch' }} />
      <Pressable onPress={() => router.push('/auth')}><T w="b" c={c.pri}>Har du redan ett konto? Logga in</T></Pressable></Enter>
  </View>;

  const list = tab === 'all' ? data?.top : data?.friends;
  const row = (r: Rank, i: number) => <Enter key={r.user_id} delay={Math.min(i, 12) * 40}><View style={{ flexDirection: rtl ? 'row-reverse' : 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 16,
    backgroundColor: r.me ? c.priSoft : c.glass, borderWidth: 1, borderColor: r.me ? c.pri : c.glassB }}>
    <T raw w="x" s={16} c={i < 3 ? c.gold : c.muted} style={{ width: 28 }} center>{i < 3 ? ['🥇', '🥈', '🥉'][i] : String(i + 1)}</T>
    <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: r.me ? c.pri : c.surface, alignItems: 'center', justifyContent: 'center' }}><T raw w="x" c={r.me ? c.on : c.ink}>{r.name.slice(0, 1).toUpperCase()}</T></View>
    <T raw w="b" style={{ flex: 1 }} lines={1}>{r.me ? `${r.name} (${t('du')})` : r.name}</T>
    <T raw w="x" c={c.gold}>{`${r.xp} XP`}</T>
    {tab === 'friends' && !r.me ? <Pressable hitSlop={8} accessibilityLabel={t('Ta bort vän')} onPress={async () => { await removeFriend(r.user_id); buzz('tap'); load(); }}><Ionicons name="close" size={18} color={c.muted} /></Pressable> : null}
  </View></Enter>;

  return <View style={{ flex: 1, backgroundColor: c.bg }}>
    <MScroll contentContainerStyle={{ paddingTop: ins.top + 8, paddingHorizontal: 16, paddingBottom: ins.bottom + 40, gap: 12 }}>
      <Row>{back}<View style={{ flex: 1 }}><T w="x" s={26}>Veckoligan</T><T raw s={13} c={c.muted}>{`${t('Börjar om om')} ${days} ${t(days === 1 ? 'dag' : 'dagar')}`}</T></View></Row>
      <Card style={{ flexDirection: rtl ? 'row-reverse' : 'row', alignItems: 'center', gap: 12 }}><Wick size={56} lit mood="cheer" />
        <View style={{ flex: 1 }}><T raw w="x" s={22} c={c.gold}>{`${weekXP(S)} XP`}</T><T s={13} c={c.muted}>Din XP den här veckan</T>
          {data?.myPlace ? <T raw w="b" s={14}>{`${t('Plats')} ${data.myPlace}`}</T> : null}</View></Card>
      <Row gap={8}><Pill label="Alla" on={tab === 'all'} onPress={() => setTab('all')} testID="lg-all" /><Pill label="Vänner" on={tab === 'friends'} onPress={() => setTab('friends')} testID="lg-friends" /></Row>
      {tab === 'friends' ? <Card style={{ gap: 10 }}>
        <T w="b">Lägg till en vän</T>
        <Row><TextInput testID="friend-code" value={code} onChangeText={x => { setCode(x.toUpperCase()); setMsg(null); }} autoCapitalize="characters" maxLength={6} placeholder={t('Vänkod')} placeholderTextColor={c.muted}
          style={{ flex: 1, minHeight: 48, borderRadius: 14, borderWidth: 1, borderColor: c.glassB, backgroundColor: c.surface, paddingHorizontal: 14, color: c.ink, fontFamily: font('b'), fontSize: 18, letterSpacing: 3 }} />
          <Btn small label="Lägg till" disabled={code.length !== 6} onPress={async () => { const r = await addFriend(code); setMsg(r); if (r === 'ok') { buzz('done'); setCode(''); track('friend_add'); load(); } else buzz('no'); }} /></Row>
        {msg ? <T s={13} c={msg === 'ok' ? c.up : c.down}>{msg === 'ok' ? 'Vän tillagd!' : msg === 'notfound' ? 'Ingen har den koden.' : msg === 'self' ? 'Det är din egen kod.' : 'Något gick fel. Försök igen.'}</T> : null}
        {me ? <Row style={{ justifyContent: 'space-between' }}><View><T s={13} c={c.muted}>Din vänkod</T><T raw w="x" s={22} style={{ letterSpacing: 3 }}>{me.code}</T></View>
          <Btn small kind="ghost" label="Dela" left={<Ionicons name="share-outline" size={18} color={c.ink} />} onPress={() => { track('friend_share'); Share.share({ message: t('Tävla mot mig i Wicki! Min vänkod är') + ' ' + me.code }).catch(() => { }); }} /></Row> : null}
      </Card> : null}
      {!data ? <ActivityIndicator color={c.pri} /> : list && list.length ? list.map(row)
        : <Card><T c={c.muted} center>{tab === 'all' ? 'Ingen har samlat XP den här veckan än. Bli först!' : 'Lägg till vänner med deras vänkod för att tävla mot dem.'}</T></Card>}
      {tab === 'friends' ? <>
        <T w="x" s={20} style={{ marginTop: 8 }}>Vännernas trades</T>
        <Card style={{ flexDirection: rtl ? 'row-reverse' : 'row', alignItems: 'center', gap: 10, padding: 12 }}>
          <View style={{ flex: 1 }}><T w="b" s={14}>Dela mina simulator-trades</T><T s={12.5} c={c.muted}>Bara dina vänner ser dem. Resultat i procent och R, aldrig belopp.</T></View>
          <Switch value={S.grow?.share !== false} onValueChange={v => { update(x => { x.grow = { ...(x.grow || {}), share: v }; }); track('trade_share_toggle', { on: v }); }} trackColor={{ true: c.pri, false: c.lock }} />
        </Card>
        {!feed ? null : feed.length ? feed.map((x, i) => { const up = x.pl_pct >= 0;
          return <Enter key={x.id} delay={Math.min(i, 10) * 40}><Card style={{ gap: 8, padding: 12 }}>
            <Row style={{ justifyContent: 'space-between' }}>
              <Row gap={8} style={{ flex: 1 }}><View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: x.me ? c.pri : c.surface, alignItems: 'center', justifyContent: 'center' }}><T raw w="x" c={x.me ? c.on : c.ink}>{x.name.slice(0, 1).toUpperCase()}</T></View>
                <View style={{ flex: 1 }}><T raw w="b" lines={1}>{x.me ? `${x.name} (${t('du')})` : x.name}</T>
                  <T raw s={12} c={c.muted}>{`${t(x.side > 0 ? 'Köp' : 'Blankning')} · ${t(MKN[x.mk] || x.mk)}${x.mode === 'chal' ? ' · ' + t('Prop-utmaning') : ''} · ${ago(x.at)}`}</T></View></Row>
              <View style={{ alignItems: rtl ? 'flex-start' : 'flex-end' }}><T raw w="x" s={17} c={up ? c.up : c.down}>{`${up ? '+' : ''}${x.pl_pct.toFixed(2)} %`}</T><T raw s={12} c={c.muted}>{`${x.r >= 0 ? '+' : ''}${x.r.toFixed(1)}R · ${t(x.why)}`}</T></View>
            </Row>
            <Row gap={8}>{REACTS.map(([k, e]) => { const on = x.mine === k; const n = x.reacts[k] || 0;
              return <Pressable key={k} disabled={x.me} accessibilityLabel={k} onPress={async () => { if (!acc.uid) return; buzz('tap'); const nx = on ? null : k;
                setFeed(f => (f || []).map(y => { if (y.id !== x.id) return y; const r = { ...y.reacts }; if (y.mine) r[y.mine] = Math.max(0, (r[y.mine] || 1) - 1); if (nx) r[nx] = (r[nx] || 0) + 1; return { ...y, mine: nx, reacts: r }; }));
                track('trade_react', { emoji: nx || 'none' }); await reactTrade(acc.uid, x.id, nx).catch(() => { }); }}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 99, borderWidth: 1, borderColor: on ? c.pri : c.glassB, backgroundColor: on ? c.priSoft : c.glass, opacity: x.me && !n ? 0.5 : 1 }}>
                <T raw s={15}>{e}</T>{n ? <T raw w="b" s={13}>{String(n)}</T> : null}</Pressable>; })}</Row>
          </Card></Enter>; })
          : <Card><T c={c.muted} center>Inga trades än. När du och dina vänner avslutar affärer i simulatorn syns de här.</T></Card>}
      </> : null}
      {me ? <Pressable onPress={() => { setNm(me.name); setEdit(true); }}><T s={13} c={c.pri} center>{`${t('Ditt namn i ligan')}: ${me.name} · ${t('Ändra')}`}</T></Pressable> : null}
    </MScroll>
    <Sheet visible={edit} onClose={() => setEdit(false)}>
      <SheetTop title="Ditt namn i ligan" onClose={() => setEdit(false)} />
      <TextInput value={nm} onChangeText={setNm} maxLength={24} style={{ minHeight: 50, borderRadius: 14, borderWidth: 1, borderColor: c.glassB, backgroundColor: c.surface, paddingHorizontal: 14, color: c.ink, fontFamily: font('b'), fontSize: 17 }} />
      <T s={12.5} c={c.muted}>Syns för alla i ligan. Använd gärna ett smeknamn.</T>
      <Btn label="Spara" disabled={!nm.trim()} onPress={async () => { if (acc.uid) await rename(acc.uid, nm); setEdit(false); load(); }} />
    </Sheet>
  </View>;
}
