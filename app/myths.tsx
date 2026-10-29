import React, { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStore } from '../src/store';
import { MYTHS } from '../src/data/youth';
import { addXP } from '../src/engine/state';
import { Btn, Card, Row, T } from '../src/ui/kit';
import { Wick } from '../src/ui/Wick';

/** Snabbkort: en myt om pengar, tryck för att se sanningen. Ungefär 15 sekunder per kort. */
export default function Myths() {
  const { c, update, buzz, rtl } = useStore(); const ins = useSafeAreaInsets();
  const [i, setI] = useState(0); const [flip, setFlip] = useState(false);
  const done = i >= MYTHS.length;
  const next = () => { buzz('tap'); if (!flip) { setFlip(true); return; } const n = i + 1; setI(n); setFlip(false); if (n >= MYTHS.length) { update(s => addXP(s, 5)); buzz('done'); } };
  return <View style={{ flex: 1, backgroundColor: c.bg, paddingTop: ins.top + 8 }}>
    <Row style={{ paddingHorizontal: 16 }} gap={14}>
      <Pressable testID="quit" accessibilityLabel="Stäng" onPress={() => router.back()} style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: c.glass, borderWidth: 1, borderColor: c.glassB, alignItems: 'center', justifyContent: 'center' }}><T raw w="b" s={18} c={c.muted}>✕</T></Pressable>
      <View style={{ flex: 1, flexDirection: rtl ? 'row-reverse' : 'row', gap: 4 }}>{MYTHS.map((_, k) => <View key={k} style={{ flex: 1, height: 6, borderRadius: 3, backgroundColor: k <= i ? c.pri : c.track }} />)}</View>
    </Row>
    {done ? <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 20 }}>
      <Wick mood="cheer" size={110} anim="dance" /><T w="x" s={28} center>Klar!</T><T raw c={c.muted}>+5 XP</T>
      <Btn label="Fortsätt" onPress={() => router.back()} style={{ alignSelf: 'stretch' }} /></View>
      : <ScrollView contentContainerStyle={{ padding: 18, gap: 12, paddingBottom: ins.bottom + 30 }}>
        <T w="x" s={28}>Snabbkort</T>
        <Card style={{ gap: 10, minHeight: 130, justifyContent: 'center' }}>
          <View style={{ alignSelf: rtl ? 'flex-end' : 'flex-start', backgroundColor: c.downSoft, borderRadius: 99, paddingHorizontal: 10, paddingVertical: 3 }}><T w="x" s={12} c={c.down} upper>Myt</T></View>
          <T w="x" s={22}>{MYTHS[i][0]}</T></Card>
        {flip ? <Card style={{ gap: 10, borderColor: c.bubB, backgroundColor: c.priSoft }}>
          <View style={{ alignSelf: rtl ? 'flex-end' : 'flex-start', backgroundColor: c.priSoft, borderRadius: 99, paddingHorizontal: 10, paddingVertical: 3 }}><T w="x" s={12} c={c.pri} upper>Sanningen</T></View>
          <T s={17}>{MYTHS[i][1]}</T></Card> : null}
        <Btn testID="next" label={flip ? 'Nästa kort' : 'Visa sanningen'} onPress={next} />
      </ScrollView>}
  </View>;
}
