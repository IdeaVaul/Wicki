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
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: c.bg } }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="lesson" options={{ presentation: 'fullScreenModal', gestureEnabled: false }} />
      <Stack.Screen name="onboarding" options={{ presentation: 'fullScreenModal', gestureEnabled: false }} />
      <Stack.Screen name="videos" />
      <Stack.Screen name="sim" />
      <Stack.Screen name="auth" options={{ presentation: 'modal' }} />
      <Stack.Screen name="legal" options={{ presentation: 'modal' }} />
      <Stack.Screen name="video" options={{ presentation: 'fullScreenModal', gestureEnabled: false }} />
      <Stack.Screen name="myths" options={{ presentation: 'fullScreenModal' }} />
      <Stack.Screen name="pause" options={{ presentation: 'fullScreenModal' }} />
    </Stack>
  </>;
}
export default function Root() {
  const [loaded] = useFonts({ Rubik_500Medium, Rubik_700Bold, Rubik_800ExtraBold, Lexend_500Medium, Lexend_700Bold, Lexend_800ExtraBold, IBMPlexSansArabic_500Medium, IBMPlexSansArabic_700Bold });
  if (!loaded) return null;
  return <SafeAreaProvider><StoreProvider><AccountProvider><Inner /></AccountProvider></StoreProvider></SafeAreaProvider>;
}
