import React from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../src/store';
import { LEGAL } from '../src/data/legal';
import { T } from '../src/ui/kit';

/** Användarvillkor eller integritetspolicy. Svenska för svenska, annars engelska. */
export default function Legal() {
  const p = useLocalSearchParams<{ doc: 'terms' | 'privacy' }>();
  const { S, c, t, rtl } = useStore(); const ins = useSafeAreaInsets();
  const sv = S.lang === 'sv'; const d = (sv ? LEGAL.sv : LEGAL.en)[p.doc === 'privacy' ? 'privacy' : 'terms'];
  return <View style={{ flex: 1, backgroundColor: c.bg }}>
    <ScrollView contentContainerStyle={{ paddingTop: ins.top + 8, paddingHorizontal: 20, paddingBottom: ins.bottom + 40, gap: 10 }}>
      <View style={{ flexDirection: rtl ? 'row-reverse' : 'row' }}><Pressable testID="close" accessibilityLabel={t('Stäng')} onPress={() => router.back()} style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: c.glass, borderWidth: 1, borderColor: c.glassB, alignItems: 'center', justifyContent: 'center' }}>
        <Ionicons name="close" size={22} color={c.muted} /></Pressable></View>
      <T raw w="x" s={28}>{d.title}</T>
      <T raw s={13} c={c.muted}>{`${sv ? 'Senast uppdaterad' : 'Last updated'}: ${sv ? LEGAL.version : LEGAL.version_en}`}</T>
      <T raw s={15.5}>{d.intro}</T>
      {d.s.map(([h, body]) => <View key={h} style={{ gap: 4, marginTop: 6 }}><T raw w="b" s={16.5}>{h}</T><T raw s={15.5}>{body}</T></View>)}
    </ScrollView>
  </View>;
}
