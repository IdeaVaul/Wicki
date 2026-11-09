import React from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStore } from '../store';
import { heartsNow, streakNow, litToday } from '../engine/state';
import { Flicker } from './motion';
import { StreakSheet } from './streak';
import { Tip } from './Tip';
import { Pressable } from 'react-native';
import { Row, T } from './kit';
import { Wick } from './Wick';
export function Header() {
  const { S, c } = useStore(); const ins = useSafeAreaInsets(); const [open, setOpen] = React.useState(false);
  const h = heartsNow(JSON.parse(JSON.stringify(S)));
  return <Row style={{ paddingTop: ins.top + 6, paddingHorizontal: 16, paddingBottom: 8, backgroundColor: c.bg, justifyContent: 'space-between' }}>
    <Row gap={6}><Wick size={20} anim="none" /><T raw w="x" s={20} c={c.pri}>Wicki</T></Row>
    <Row gap={14}>
      {S.a.focus ? null : <Tip id="flame" show={litToday(S)} text="Det här är din svit. Tryck på lågan för att se svitskydd och milstolpar."><Pressable testID="streak" hitSlop={10} accessibilityLabel="Svit" onPress={() => setOpen(true)}><Row gap={2}><Flicker on={litToday(S)}><T raw w="x">🔥</T></Flicker><T raw w="x" c={litToday(S) ? c.coral : c.lockInk}>{String(streakNow(S))}</T></Row></Pressable></Tip>}
      <T raw w="x" c={c.down}>{`♥ ${h}`}</T>
    </Row>
    <StreakSheet open={open} onClose={() => setOpen(false)} />
  </Row>;
}
export const Screen = ({ children }: { children: React.ReactNode }) => { const { c } = useStore(); return <View style={{ flex: 1, backgroundColor: c.bg }}>{children}</View>; };
