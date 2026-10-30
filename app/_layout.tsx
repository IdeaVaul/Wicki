import React, { useEffect } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Stack, usePathname, type ErrorBoundaryProps } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts, Rubik_500Medium, Rubik_700Bold, Rubik_800ExtraBold } from '@expo-google-fonts/rubik';
import { Lexend_500Medium, Lexend_700Bold, Lexend_800ExtraBold } from '@expo-google-fonts/lexend';
import { IBMPlexSansArabic_500Medium, IBMPlexSansArabic_700Bold } from '@expo-google-fonts/ibm-plex-sans-arabic';
import { StoreProvider, useStore } from '../src/store';
import { AccountProvider } from '../src/account/Account';
import { hookErrors, newId, reportError, screen, setTelemetry } from '../src/analytics';
import { plusOn } from '../src/engine/plus';

/** Håller statistik och kraschrapporter i takt med samtycket, och loggar vilken skärm man är på. */
function Telemetry() {
  const { S, update } = useStore(); const path = usePathname();
  useEffect(() => { if (S.stats && !S.did) update(s => { s.did = newId(); }); }, [S.stats, S.did]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { setTelemetry({ ok: !!S.stats, did: S.did || '', lang: S.lang, age: S.age, plus: plusOn(S) }); hookErrors(); }, [S.stats, S.did, S.lang, S.age, S.plus]);
  useEffect(() => { screen(path || '/'); }, [path, S.stats, S.did]);
  return null;
}

/** Om en skärm kraschar: visa en vänlig ruta, skicka rapporten och låt användaren försöka igen. */
export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  useEffect(() => { reportError(error, { boundary: true }, true); }, [error]);
  return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 28, gap: 14, backgroundColor: '#0B1311' }}>
    <Text style={{ fontSize: 44 }}>🕯️</Text>
    <Text style={{ color: '#fff', fontSize: 22, fontWeight: '800', textAlign: 'center' }}>Oj, något gick fel</Text>
    <Text style={{ color: '#9FB2AC', fontSize: 15, textAlign: 'center' }}>Something went wrong. Dina framsteg är sparade.</Text>
    <Pressable onPress={retry} style={{ backgroundColor: '#2FE39A', paddingHorizontal: 26, paddingVertical: 14, borderRadius: 99 }}><Text style={{ color: '#03150D', fontWeight: '800', fontSize: 16 }}>Försök igen</Text></Pressable>
  </View>;
}

function Inner() {
  const { ready, dark, c } = useStore();
  if (!ready) return null;
  return <>
    <Telemetry />
    <StatusBar style={dark ? 'light' : 'dark'} />
    {/* Svep från vänsterkanten (var som helst på skärmen) = tillbaka, som i Instagram och TikTok. */}
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: c.bg }, gestureEnabled: true, fullScreenGestureEnabled: true }}>
      <Stack.Screen name="(tabs)" />
      {/* Helskärmsvyer visas som vanliga skärmar som glider upp, inte som iOS-modaler. En ersatt (replace) iOS-modal kunde lämna
          ett osynligt lager kvar ovanpå flikarna så att Kurs, Öva och Profil slutade svara på tryck. */}
      {/* Lektionen har egen Avsluta-knapp: ett råkat svep ska inte kasta bort halva lektionen. */}
      <Stack.Screen name="lesson" options={{ animation: 'slide_from_bottom', gestureEnabled: false }} />
      <Stack.Screen name="onboarding" options={{ animation: 'fade', gestureEnabled: false }} />
      <Stack.Screen name="videos" />
      <Stack.Screen name="sim" />
      <Stack.Screen name="auth" options={{ presentation: 'modal' }} />
      <Stack.Screen name="legal" options={{ presentation: 'modal' }} />
      <Stack.Screen name="plus" options={{ presentation: 'modal' }} />
      <Stack.Screen name="video" />
      <Stack.Screen name="myths" />
      <Stack.Screen name="pause" options={{ animation: 'fade', gestureEnabled: false }} />
    </Stack>
  </>;
}
export default function Root() {
  const [loaded] = useFonts({ Rubik_500Medium, Rubik_700Bold, Rubik_800ExtraBold, Lexend_500Medium, Lexend_700Bold, Lexend_800ExtraBold, IBMPlexSansArabic_500Medium, IBMPlexSansArabic_700Bold });
  if (!loaded) return null;
  return <SafeAreaProvider><StoreProvider><AccountProvider><Inner /></AccountProvider></StoreProvider></SafeAreaProvider>;
}
