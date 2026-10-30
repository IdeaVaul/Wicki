import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts, Rubik_500Medium, Rubik_700Bold, Rubik_800ExtraBold } from '@expo-google-fonts/rubik';
import { Lexend_500Medium, Lexend_700Bold, Lexend_800ExtraBold } from '@expo-google-fonts/lexend';
import { IBMPlexSansArabic_500Medium, IBMPlexSansArabic_700Bold } from '@expo-google-fonts/ibm-plex-sans-arabic';
import { StoreProvider, useStore } from '../src/store';
import { AccountProvider } from '../src/account/Account';

function Inner() {
  const { ready, dark, c } = useStore();
  if (!ready) return null;
  return <>
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
