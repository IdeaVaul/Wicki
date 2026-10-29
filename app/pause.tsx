import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, View } from 'react-native';
import { router } from 'expo-router';
import { useStore } from '../src/store';
import { session } from '../src/session';
import { Btn, T } from '../src/ui/kit';
import { Wick } from '../src/ui/Wick';

/** Paus med andningscirkel, för den som valt pauspåminnelser. */
export default function Pause() {
  const { c, S, buzz } = useStore();
  const [st, setSt] = useState<'ask' | 'run' | 'done'>('ask'); const [left, setLeft] = useState(120);
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => { if (st !== 'run') return; const iv = setInterval(() => setLeft(x => { if (x <= 1) { clearInterval(iv); session.lastBreak = Date.now(); setSt('done'); buzz('done'); return 0; } return x - 1; }), 1000);
    const a = Animated.loop(Animated.sequence([Animated.timing(v, { toValue: 1, duration: 4000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }), Animated.timing(v, { toValue: 0, duration: 4000, easing: Easing.inOut(Easing.sin), useNativeDriver: true })])); a.start();
    return () => { clearInterval(iv); a.stop(); }; }, [st]); // eslint-disable-line react-hooks/exhaustive-deps
  const done = () => { session.lastBreak = Date.now(); router.back(); };
  const phaseIn = Math.floor((120 - left) / 4) % 2 === 0;
  return <View style={{ flex: 1, backgroundColor: c.bg, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 16 }}>
    {st === 'ask' ? <><Wick size={96} lit /><T w="x" s={24} center>Paus</T><T center>Bra jobbat! Du har pluggat en stund. Vill du ta en kort paus?</T>
      <Btn kind="good" label="Ta en paus" onPress={() => setSt('run')} style={{ alignSelf: 'stretch' }} /><Btn kind="ghost" label="Fortsätt ändå" onPress={done} style={{ alignSelf: 'stretch' }} /></>
      : st === 'run' ? <>
        <Animated.View style={{ width: 150, height: 150, borderRadius: 75, borderWidth: 3, borderColor: c.up, backgroundColor: c.upSoft, transform: [{ scale: S.a.calm ? 1 : v.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1.05] }) }] }} />
        <T w="x" s={22} center>{phaseIn ? 'Andas in…' : 'Andas ut…'}</T>
        <T raw w="x" s={22} center>{`${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}`}</T>
        <T center c={c.muted}>Res dig gärna, sträck på dig och drick lite vatten.</T>
        <Btn kind="ghost" label="Fortsätt ändå" onPress={done} style={{ alignSelf: 'stretch' }} /></>
        : <><Wick mood="cheer" size={96} lit anim="jump" /><T w="x" s={22} center>Pausen är klar. Välkommen tillbaka!</T><Btn label="Fortsätt" onPress={done} style={{ alignSelf: 'stretch' }} /></>}
  </View>;
}
