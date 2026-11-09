import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Image, StyleSheet, View } from 'react-native';
import { useCalm } from './motion';

/** Animerad startskärm: tar över exakt där telefonens startbild slutar (samma bild, färg och storlek),
 *  låter Wicki hoppa till och vinka, och zoomar sedan ut mot appen. Hoppas över i Lugnt läge. */
export function Splash() {
  const calm = useCalm(); const [done, setDone] = useState(false);
  const jump = useRef(new Animated.Value(0)).current, out = useRef(new Animated.Value(0)).current, glow = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (calm) { setDone(true); return; }
    Animated.sequence([
      Animated.parallel([
        Animated.sequence([Animated.timing(jump, { toValue: 1, duration: 260, easing: Easing.out(Easing.quad), useNativeDriver: true }),
          Animated.spring(jump, { toValue: 0, damping: 6, stiffness: 220, mass: 0.7, useNativeDriver: true })]),
        Animated.timing(glow, { toValue: 1, duration: 520, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]),
      Animated.timing(out, { toValue: 1, duration: 380, delay: 120, easing: Easing.in(Easing.cubic), useNativeDriver: true }),
    ]).start(() => setDone(true));
  }, [calm]); // eslint-disable-line react-hooks/exhaustive-deps
  if (done) return null;
  return <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: '#06150F', alignItems: 'center', justifyContent: 'center', opacity: out.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }) }]}>
    <Animated.View style={{ position: 'absolute', width: 260, height: 260, borderRadius: 130, backgroundColor: '#3DDC97', opacity: glow.interpolate({ inputRange: [0, 1], outputRange: [0, 0.14] }),
      transform: [{ scale: glow.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1.3] }) }] }} />
    <Animated.View style={{ transform: [
      { translateY: jump.interpolate({ inputRange: [0, 1], outputRange: [0, -26] }) },
      { scaleX: jump.interpolate({ inputRange: [0, 1], outputRange: [1, 0.96] }) },
      { scaleY: jump.interpolate({ inputRange: [0, 1], outputRange: [1, 1.05] }) },
      { scale: out.interpolate({ inputRange: [0, 1], outputRange: [1, 1.6] }) }] }}>
      <Image source={require('../../assets/splash-icon.png')} style={{ width: 240, height: 240 }} resizeMode="contain" />
    </Animated.View>
    <View />
  </Animated.View>;
}
