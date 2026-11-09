import React from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../store';
import { litToday, streakNow, dueKeys } from '../engine/state';
import { today } from '../engine/util';
import { MAX_FREEZE, nextMile, sx } from '../engine/streak';
import { Btn, Card, Row, Sheet, SheetTop, T } from './kit';
import { Bar, Enter, Flicker } from './motion';
import { Wick } from './Wick';
import { track } from '../analytics';

/** Svitarket: svit, rekord, skydd, nästa milstolpe och lagning. Öppnas från lågan i sidhuvudet. */
export function StreakSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { S, c, t, rtl } = useStore(); const x = sx(S); const n = streakNow(S); const lit = litToday(S); const nm = nextMile(n);
  const prevM = [0, 3, 7, 14, 30, 50, 100, 200, 365].filter(v => v <= n).pop() || 0;
  const row = (icon: string, col: string, title: string, sub: string) => <Row gap={12} style={{ alignItems: 'flex-start' }}>
    <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: c.glass, alignItems: 'center', justifyContent: 'center' }}><Ionicons name={icon as any} size={20} color={col} /></View>
    <View style={{ flex: 1 }}><T w="b">{title}</T><T s={13} c={c.muted}>{sub}</T></View></Row>;
  return <Sheet visible={open} onClose={onClose}>
    <SheetTop title="Din svit" onClose={onClose} />
    <Enter from="scale" style={{ alignItems: 'center', gap: 4 }}>
      <Flicker on={lit}><T raw s={64}>{lit ? '🔥' : '🕯️'}</T></Flicker>
      <T raw w="x" s={40} c={lit ? c.coral : c.ink}>{String(n)}</T>
      <T c={c.muted}>{lit ? 'Dagens låga är tänd!' : n ? 'Gör en lektion i dag så håller lågan.' : 'Gör en lektion för att tända lågan.'}</T>
    </Enter>
    <Card style={{ gap: 8 }}>
      <Row style={{ justifyContent: 'space-between' }}><T w="b">Nästa milstolpe</T><T raw w="x" c={c.gold}>{`${n} / ${nm}`}</T></Row>
      <Bar pct={Math.min(100, (n - prevM) / Math.max(1, nm - prevM) * 100)} color={c.gold} track={c.track} h={10} rtl={rtl} />
      <T raw s={12.5} c={c.muted}>{`${t('Rekord')}: ${S.streak.best || 0} ${t('dagar')}`}</T>
    </Card>
    {x.repair && x.repair.day === today() ? <Card style={{ gap: 6, borderColor: c.coral }}>
      <T w="x">Laga din svit</T>
      <T raw s={14}>{`${t('Du missade en dag. Gör')} ${x.repair.need} ${t('lektioner i dag så får du tillbaka din svit på')} ${x.repair.prev} ${t('dagar')}.`}</T>
      <Bar pct={x.repair.done / x.repair.need * 100} color={c.coral} track={c.track} h={10} rtl={rtl} />
    </Card> : null}
    <Card style={{ gap: 12 }}>
      {row('snow', '#7FD4FF', `${t('Svitskydd')}: ${x.freeze} / ${MAX_FREEZE}`, 'Missar du en dag använder Wicki ett skydd automatiskt. Du får ett nytt var sjunde dag i rad.')}
      {row('alarm', c.coral, 'Påminnelse innan lågan slocknar', 'Har du inte övat på kvällen får du en påminnelse, högst en om dagen.')}
      {row('construct', c.gold, 'Laga svitten', 'Missade du en dag utan skydd kan du laga svitten nästa dag med två lektioner.')}
    </Card>
    <Btn label={lit ? 'Öva lite till' : 'Tänd lågan nu'} onPress={() => { onClose(); router.push({ pathname: '/lesson', params: { mode: dueKeys(S).length ? 'review' : 'practice' } }); }} />
  </Sheet>;
}

/** Kort på Hem: välkommen tillbaka, svitskydd som använts och lagning som pågår. */
export function StreakCards() {
  const { S, c, t, update } = useStore(); const x = sx(S); const td = today();
  const cards: React.ReactNode[] = [];
  if (x.back === td && !litToday(S)) cards.push(<Enter key="back"><Card style={{ gap: 8, borderColor: c.pri }}>
    <Row gap={12}><Wick size={56} mood="cheer" lit anim="jump" /><View style={{ flex: 1 }}><T w="x" s={18}>Välkommen tillbaka!</T>
      <T s={14} c={c.muted}>Skönt att se dig. Börja lugnt med en kort repetition på några minuter.</T></View></Row>
    <Btn label="Starta en snabb repetition" onPress={() => { track('resurrect_start'); router.push({ pathname: '/lesson', params: { mode: dueKeys(S).length ? 'review' : 'practice' } }); }} /></Card></Enter>);
  if (x.used === td && x.seenUsed !== td) cards.push(<Enter key="used"><Card style={{ gap: 6, borderColor: '#7FD4FF' }}>
    <Row gap={10}><T raw s={28}>🧊</T><View style={{ flex: 1 }}><T w="x">Svitskyddet räddade din svit!</T>
      <T raw s={13.5} c={c.muted}>{`${t('Din svit på')} ${S.streak.n} ${t('dagar lever. Skydd kvar')}: ${x.freeze}`}</T></View></Row>
    <Btn small kind="ghost" label="Okej" onPress={() => update(s => { sx(s).seenUsed = td; })} /></Card></Enter>);
  if (x.repair && x.repair.day === td) cards.push(<Enter key="rep"><Card style={{ gap: 6, borderColor: c.coral }}>
    <T w="x">Laga din svit</T>
    <T raw s={14}>{`${t('Gör')} ${x.repair.need - x.repair.done} ${t('lektioner till i dag så får du tillbaka din svit på')} ${x.repair.prev} ${t('dagar')}.`}</T></Card></Enter>);
  return <>{cards}</>;
}
