import React from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../src/store';
import { VIDEOS } from '../src/data/videos';
import { vidMins } from '../src/engine/video';
import { Row, T } from '../src/ui/kit';

/** Videoskolan: lista över de animerade videolektionerna. */
export default function Videos() {
  const { S, c, t, rtl } = useStore(); const ins = useSafeAreaInsets();
  const vs = S.vids || {}; const done = VIDEOS.filter(v => vs[v.id]).length; const tot = VIDEOS.reduce((a, v) => a + vidMins(v, t), 0);
  return <View style={{ flex: 1, backgroundColor: c.bg }}>
    <ScrollView contentContainerStyle={{ paddingTop: ins.top + 8, paddingHorizontal: 16, paddingBottom: ins.bottom + 40, gap: 10 }}>
      <Row><Pressable testID="back" accessibilityLabel={t('Tillbaka')} onPress={() => router.back()} style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: c.glass, borderWidth: 1, borderColor: c.glassB, alignItems: 'center', justifyContent: 'center' }}>
        <Ionicons name={rtl ? 'chevron-forward' : 'chevron-back'} size={22} color={c.muted} /></Pressable></Row>
      <T w="x" s={34}>Videoskolan</T>
      <T raw c={c.muted}>{`${t('Se trading förklaras på grafen, med röst.')} ${done}/${VIDEOS.length} ${t('klara')} · ~${tot} ${t('min')}`}</T>
      {VIDEOS.map((v, k) => <Pressable key={v.id} testID={'vid-' + v.id} accessibilityRole="button" onPress={() => router.push({ pathname: '/video', params: { id: v.id } })}
        style={({ pressed }) => ({ flexDirection: rtl ? 'row-reverse' : 'row', alignItems: 'center', gap: 16, padding: 14, borderRadius: 20, backgroundColor: c.glass, borderWidth: 1, borderColor: c.glassB, transform: [{ scale: pressed ? 0.985 : 1 }] })}>
        <View style={{ width: 58, height: 58, borderRadius: 16, backgroundColor: vs[v.id] ? c.upSoft : c.priSoft, alignItems: 'center', justifyContent: 'center' }}>
          {vs[v.id] ? <Ionicons name="checkmark" size={28} color={c.up} /> : <T raw w="x" s={22} c={c.pri}>{String(k + 1)}</T>}</View>
        <View style={{ flex: 1, gap: 3 }}><T w="b" s={17}>{v.title}</T><T raw s={14} c={c.muted}>{`${t(v.desc)} · ${vidMins(v, t)} ${t('min')}`}</T></View>
        <Ionicons name="play" size={22} color={c.muted} />
      </Pressable>)}
      <T s={13} c={c.muted} center style={{ marginTop: 8 }}>Rösten är datorgenererad och läser på ditt språk.</T>
      <T s={13} c={c.muted} center>Utbildning, inte investeringsråd.</T>
    </ScrollView>
  </View>;
}
