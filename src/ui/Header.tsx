import React from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStore } from '../store';
import { heartsNow, streakNow, litToday } from '../engine/state';
import { Row, T } from './kit';
import { Wick } from './Wick';
export function Header() {
  const { S, c } = useStore(); const ins = useSafeAreaInsets();
  const h = heartsNow(JSON.parse(JSON.stringify(S)));
  return <Row style={{ paddingTop: ins.top + 6, paddingHorizontal: 16, paddingBottom: 8, backgroundColor: c.bg, justifyContent: 'space-between' }}>
    <Row gap={6}><Wick size={20} anim="none" /><T raw w="x" s={20} c={c.pri}>Wicki</T></Row>
    <Row gap={14}>
      {S.a.focus ? null : <T raw w="x" c={litToday(S) ? c.coral : c.lockInk}>{`🔥 ${streakNow(S)}`}</T>}
      <T raw w="x" c={c.down}>{`♥ ${h}`}</T>
    </Row>
  </Row>;
}
export const Screen = ({ children }: { children: React.ReactNode }) => { const { c } = useStore(); return <View style={{ flex: 1, backgroundColor: c.bg }}>{children}</View>; };
