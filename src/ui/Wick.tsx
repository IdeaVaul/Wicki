import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Image } from 'react-native';
import Svg, { Circle, Ellipse, G, Path, Rect } from 'react-native-svg';
import { useStore } from '../store';
import { litToday, streakNow } from '../engine/state';
export type Mood = 'happy' | 'cheer' | 'sad';
const IMG = require('../../assets/wick.png');
/** Maskoten Wicki, ett levande candlestick-ljus. Glad och jublande Wicki är 3D-bilden från skisserna; ledsen Wicki ritas som ett rött ljus. */
export function Wick({ mood = 'happy', size = 80, lit, anim = 'bob' }: { mood?: Mood; size?: number; lit?: boolean; anim?: 'bob' | 'jump' | 'shake' | 'dance' | 'none' }) {
  const { S, c } = useStore();
  const isLit = lit != null ? lit : litToday(S);
  const body = mood === 'sad' ? c.down : c.up, bd = mood === 'sad' ? c.downD : c.upD;
  const fs = 0.75 + Math.min(streakNow(S), 14) * 0.035;
  const v = useRef(new Animated.Value(0)).current;
  const calm = !!S.a.calm;
  useEffect(() => {
    if (calm || anim === 'none') return;
    let a: Animated.CompositeAnimation;
    if (anim === 'bob' || anim === 'dance') a = Animated.loop(Animated.sequence([Animated.timing(v, { toValue: 1, duration: anim === 'dance' ? 380 : 1400, easing: Easing.inOut(Easing.sin), useNativeDriver: true }), Animated.timing(v, { toValue: 0, duration: anim === 'dance' ? 380 : 1400, easing: Easing.inOut(Easing.sin), useNativeDriver: true })]));
    else a = Animated.sequence([Animated.timing(v, { toValue: 1, duration: 160, useNativeDriver: true }), Animated.timing(v, { toValue: 0, duration: 260, easing: Easing.bounce, useNativeDriver: true })]);
    a.start(); return () => a.stop();
  }, [anim, calm, v]);
  const tf = anim === 'shake' ? [{ translateX: v.interpolate({ inputRange: [0, 0.25, 0.5, 0.75, 1], outputRange: [0, -5, 5, -3, 0] }) }]
    : anim === 'jump' ? [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [0, -size * 0.18] }) }]
      : anim === 'dance' ? [{ rotate: v.interpolate({ inputRange: [0, 1], outputRange: ['-6deg', '6deg'] }) }]
        : [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [0, -size * 0.04] }) }];
  const ink = mood === 'sad' ? '#2A0B0D' : '#0B1A12';
  if (mood !== 'sad') return (
    <Animated.View style={{ width: Math.round(size * 0.86), height: Math.round(size * 1.42), transform: tf }} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Image source={IMG} style={{ width: '100%', height: '100%' }} resizeMode="contain" />
    </Animated.View>);
  return (
    <Animated.View style={{ width: size, height: Math.round(size * 1.42), transform: tf }} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Svg width={size} height={Math.round(size * 1.42)} viewBox="0 -30 100 142">
        {isLit ? <G transform={`translate(50 5) scale(${fs}) translate(-50 -5)`}>
          <Path d="M50 -26C60 -14 62 -4 50 5C38 -4 40 -14 50 -26Z" fill="#F7B733" />
          <Path d="M50 -15C56 -8 56 -1 50 4C44 -1 44 -8 50 -15Z" fill="#FF7A1A" />
          <Ellipse cx="50" cy="-8" rx="9" ry="12" fill="#FFD36B" opacity={0.25} /></G>
          : <Path d="M50 -1c-5-5 5-8 0-13c-4-4 4-7 0-11" stroke={c.lockInk} strokeWidth={2.6} fill="none" strokeLinecap="round" />}
        {(mood as Mood) === 'cheer' ? <><Path d="M24 52L10 34" stroke={bd} strokeWidth={6} strokeLinecap="round" /><Path d="M76 52l14-18" stroke={bd} strokeWidth={6} strokeLinecap="round" /></>
          : mood === 'sad' ? <Path d="M24 62l-8 12M76 62l8 12" stroke={bd} strokeWidth={6} strokeLinecap="round" />
            : <><Path d="M24 58l-12 4" stroke={bd} strokeWidth={6} strokeLinecap="round" /><Path d="M76 56l12-8" stroke={bd} strokeWidth={6} strokeLinecap="round" /></>}
        <Path d="M50 2v20M50 88v20" stroke={bd} strokeWidth={6} strokeLinecap="round" />
        <Rect x={24} y={20} width={52} height={70} rx={14} fill={body} />
        <Rect x={30} y={26} width={10} height={26} rx={5} fill="#fff" opacity={0.22} />
        {(mood as Mood) === 'cheer' ? <Path d="M36 50q5-6 10 0M54 50q5-6 10 0" stroke={ink} strokeWidth={3.4} fill="none" strokeLinecap="round" />
          : mood === 'sad' ? <><Circle cx={41} cy={52} r={4.2} fill={ink} /><Circle cx={59} cy={52} r={4.2} fill={ink} /><Path d="M34 44l9 3M66 44l-9 3" stroke={ink} strokeWidth={2.8} strokeLinecap="round" /></>
            : <><Circle cx={41} cy={50} r={4.6} fill={ink} /><Circle cx={59} cy={50} r={4.6} fill={ink} /><Circle cx={42.6} cy={48.4} r={1.5} fill="#fff" /><Circle cx={60.6} cy={48.4} r={1.5} fill="#fff" /></>}
        {mood === 'sad' ? <Path d="M43 68q7-6 14 0" stroke={ink} strokeWidth={3} fill="none" strokeLinecap="round" />
          : (mood as Mood) === 'cheer' ? <Path d="M40 60q10 12 20 0z" fill={ink} /> : <Path d="M42 61q8 7 16 0" stroke={ink} strokeWidth={3.2} fill="none" strokeLinecap="round" />}
        <Circle cx={33} cy={60} r={3.6} fill="#fff" opacity={0.28} /><Circle cx={67} cy={60} r={3.6} fill="#fff" opacity={0.28} />
      </Svg>
    </Animated.View>
  );
}
