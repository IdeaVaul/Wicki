import React from 'react';
import { Pressable, View } from 'react-native';
import { Tabs, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../../src/store';
import { KURS } from '../../src/data/skin-dict';
import { T } from '../../src/ui/kit';

type Item = { name: string; label: string; raw?: boolean; on: keyof typeof Ionicons.glyphMap; off: keyof typeof Ionicons.glyphMap };

const SIMLAB: Record<string, string> = { sv: 'Simulator', en: 'Simulator', fr: 'Simulateur', ar: 'المحاكي' };

/** Svävande flikrad i glas: Hem längst till vänster, Profil längst till höger, max fem platser och huvudhandlingen
 *  (handelssimulatorn) som en stor knapp i mitten – samma mönster som Instagram, TikTok och YouTube. */
function TabBar({ state, navigation }: { state: { index: number; routes: { name: string; key: string }[] }; navigation: any }) {
  const { c, S, rtl } = useStore(); const ins = useSafeAreaInsets();
  const items: Item[] = [
    { name: 'index', label: 'Hem', on: 'home', off: 'home-outline' },
    { name: 'course', label: KURS[S.lang] || 'Kurs', raw: true, on: 'book', off: 'book-outline' },
    { name: 'practice', label: 'Öva', on: 'stats-chart', off: 'stats-chart-outline' },
    { name: 'profile', label: 'Profil', on: 'person', off: 'person-outline' },
  ];
  const curName = state.routes[state.index]?.name === 'library' ? 'practice' : state.routes[state.index]?.name;
  return <View pointerEvents="box-none" style={{ position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 14, paddingBottom: ins.bottom + 8 }}>
    <View style={{ flexDirection: rtl ? 'row-reverse' : 'row', backgroundColor: c.tabbg, borderRadius: 30, borderWidth: 1, borderColor: c.glassB, padding: 6,
      shadowColor: '#000', shadowOpacity: 0.45, shadowRadius: 24, shadowOffset: { width: 0, height: 12 }, elevation: 12 }}>
      {items.map((it, i) => { const on = curName === it.name;
        const mid = i === 2 ? <Pressable key="sim" testID="tab-sim" accessibilityRole="button" accessibilityLabel={SIMLAB[S.lang] || SIMLAB.sv}
          onPress={() => router.push('/sim')} style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          {({ pressed }) => <View style={{ width: S.a.tap ? 60 : 54, height: S.a.tap ? 60 : 54, borderRadius: 30, backgroundColor: c.pri, alignItems: 'center', justifyContent: 'center',
            transform: [{ scale: pressed ? 0.92 : 1 }], shadowColor: c.pri, shadowOpacity: 0.5, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 6 }}>
            <Ionicons name="trending-up" size={S.a.tap ? 30 : 27} color={c.on} /></View>}
        </Pressable> : null;
        return <React.Fragment key={it.name}>{mid}
        return <Pressable testID={'tab-' + it.name} accessibilityRole="tab" accessibilityState={{ selected: on }} accessibilityLabel={it.label}
          onPress={() => navigation.navigate(it.name)}
          style={{ flex: 1, alignItems: 'center', gap: 3, paddingVertical: S.a.tap ? 12 : 8, borderRadius: 24, backgroundColor: on ? c.priSoft : 'transparent' }}>
          <Ionicons name={on ? it.on : it.off} size={S.a.tap ? 28 : 24} color={on ? c.pri : c.muted} />
          <T raw={it.raw} w="b" s={12} c={on ? c.pri : c.muted} center>{it.label}</T>
        </Pressable></React.Fragment>; })}
    </View>
  </View>;
}

export default function TabsLayout() {
  return <Tabs screenOptions={{ headerShown: false }} tabBar={(p: any) => <TabBar {...p} />}>
    <Tabs.Screen name="index" />
    <Tabs.Screen name="course" />
    <Tabs.Screen name="practice" />
    <Tabs.Screen name="profile" />
    <Tabs.Screen name="library" options={{ href: null }} />
  </Tabs>;
}
