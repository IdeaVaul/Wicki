import React from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { useStore } from '../src/store';
import { Btn, T } from '../src/ui/kit';
import { Wick } from '../src/ui/Wick';
import { Enter } from '../src/ui/motion';

/** Egen 404: en länk som pekar fel hamnar här i stället för på en tom skärm. */
export default function NotFound() {
  const { c } = useStore();
  return <View style={{ flex: 1, backgroundColor: c.bg, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 14 }}>
    <Enter><View style={{ alignItems: 'center', gap: 10 }}><Wick size={96} mood="sad" />
      <T w="x" s={24} center>Hoppsan, sidan finns inte</T>
      <T c={c.muted} center>Länken pekar på något som inte finns i Wicki.</T></View></Enter>
    <Btn label="Till startsidan" onPress={() => router.replace('/')} />
  </View>;
}
