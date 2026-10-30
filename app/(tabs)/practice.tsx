import React from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../../src/store';
import { dueKeys } from '../../src/engine/state';
import { Btn, T } from '../../src/ui/kit';
import { Screen } from '../../src/ui/Header';
import { Wick } from '../../src/ui/Wick';
import { BgCandles } from '../../src/ui/Deco';
import { useRefresh } from '../../src/ui/Refresh';

/** Öva: dagens repetition överst, sedan övningarna som rader (som i skisserna). */
export default function Practice() {
  const { S, c, t, rtl } = useStore(); const ins = useSafeAreaInsets();
  const refresh = useRefresh(undefined, ins.top);
  const due = dueKeys(S).length; const nm = Object.values(S.miss as Record<string, number>).filter(v => v > 0).length;
  const open = (mode: string) => router.push({ pathname: '/lesson', params: { mode } });
  const row = (id: string, icon: keyof typeof Ionicons.glyphMap, col: string, title: string, sub: string, onPress: () => void) =>
    <Pressable key={id} testID={'p-' + id} accessibilityRole="button" onPress={onPress}
      style={({ pressed }) => ({ flexDirection: rtl ? 'row-reverse' : 'row', alignItems: 'center', gap: 16, padding: 14, borderRadius: 20, backgroundColor: c.glass, borderWidth: 1, borderColor: c.glassB, transform: [{ scale: pressed ? 0.985 : 1 }] })}>
      <View style={{ width: 58, height: 58, borderRadius: 16, backgroundColor: col + '22', borderWidth: 1, borderColor: col + '38', alignItems: 'center', justifyContent: 'center' }}><Ionicons name={icon} size={28} color={col} /></View>
      <View style={{ flex: 1, gap: 3 }}><T w="b" s={17.5}>{title}</T><T raw s={14.5} c={c.muted}>{sub}</T></View>
      <Ionicons name={rtl ? 'chevron-back' : 'chevron-forward'} size={22} color={c.muted} />
    </Pressable>;
  return <Screen><ScrollView refreshControl={refresh} contentContainerStyle={{ paddingTop: ins.top + 10, paddingHorizontal: 16, paddingBottom: ins.bottom + 120, gap: 10 }}>
    <T w="x" s={34}>Öva</T>
    <T c={c.muted} style={{ marginBottom: 8 }}>Bygg dina kunskaper, steg för steg.</T>
    <View style={{ flexDirection: rtl ? 'row-reverse' : 'row', alignItems: 'center', borderRadius: 26, overflow: 'hidden', backgroundColor: c.heroA, borderWidth: 1, borderColor: c.bubB, padding: 20, paddingVertical: 22 }}>
      <BgCandles seed={11} n={22} style={{ top: 0, bottom: 0, [rtl ? 'left' : 'right']: 0, width: '70%' }} opacity={0.35} />
      <View style={{ flex: 1, gap: 6 }}>
        <T w="x" s={25}>Dagens repetition</T>
        <T raw s={17} c={c.muted}>{due ? `${due} ${t('begrepp redo')}` : t('Inget att repetera i dag. Snyggt!')}</T>
        <Btn testID="p-review" label={due ? 'Börja' : 'Öva ändå'} onPress={() => open(due ? 'review' : 'practice')} style={{ alignSelf: rtl ? 'flex-end' : 'flex-start', minWidth: 150, marginTop: 10 }} />
      </View>
      <View style={{ marginVertical: -14 }}><Wick size={100} /></View>
    </View>
    {row('videos', 'film', c.pri, 'Videoskolan', t('8 videor om varför priset rör sig, när man köper och säljer.'), () => router.push('/videos'))}
    {row('sim', 'stats-chart', c.up, 'Handelssimulator', t('Riskfri trading med låtsaspengar: aktier, forex, krypto och guld.'), () => router.push('/sim'))}
    {row('hunt', 'analytics', c.up, 'Mönsterjakt', t('Känn igen vanliga mönster.'), () => open('hunt'))}
    {row('next', 'trending-up', c.down, 'Vad hände sen?', t('Träna på att tolka utvecklingen.'), () => open('next'))}
    {S.a.notime ? null : row('blitz', 'stopwatch', c.gold, `${t('Snabbrunda')} · 60 ${t('sek')}`, t('Snabba frågor, stora framsteg.') + (S.best60 ? ` ${t('Rekord:')} ${S.best60}` : ''), () => open('blitz'))}
    {row('place', 'school', c.violet, 'Nivåtest', t('Se vad du kan och få en rekommendation.'), () => open('placement'))}
    {row('myths', 'flash', c.violet, 'Snabbkort', t('Myter om trading, avslöjade på 15 sekunder.'), () => router.push('/myths'))}
    {row('scam', 'shield-checkmark', c.down, 'Bedrägeri eller inte?', t('Avslöja bluffarna i 10 meddelanden.'), () => open('scam'))}
    {row('mist', 'heart', c.coral, 'Repetera misstag', (nm ? `${nm} ${t('frågor att öva på.')} ` : '') + t('Ger +1 hjärta.'), () => open('practice'))}
    {row('lib', 'library', c.gold, 'Bibliotek', t('Alla mönster och begrepp på ett ställe.'), () => router.push('/library'))}
    <T s={13} c={c.muted} center style={{ marginTop: 12 }}>Utbildning, inte investeringsråd.</T>
    <T s={13} c={c.muted} center>Alla grafer är påhittade.</T>
  </ScrollView></Screen>;
}
