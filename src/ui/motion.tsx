import React, { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Easing, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import { useStore } from '../store';

/** Rörelse i hela appen: mjuka in-animationer, fjädrande tryck och animerade staplar.
 *  Allt stängs av när telefonen har "Minska rörelse" på eller när användaren valt Lugnt läge. */

let sysReduce = false;
AccessibilityInfo.isReduceMotionEnabled?.().then((v: boolean) => { sysReduce = !!v; }).catch(() => { });
AccessibilityInfo.addEventListener?.('reduceMotionChanged', (v: boolean) => { sysReduce = !!v; });

export function useCalm() { const { S } = useStore(); return sysReduce || !!S.a.calm; }

const SPRING = { damping: 18, stiffness: 190, mass: 0.9, useNativeDriver: true } as const;

/** Glider upp och tonar in. delay i millisekunder. */
export function Enter({ children, delay = 0, dy = 14, style, from = 'up' }: { children: React.ReactNode; delay?: number; dy?: number; style?: StyleProp<ViewStyle>; from?: 'up' | 'side' | 'scale' }) {
  const calm = useCalm(); const v = useRef(new Animated.Value(calm ? 1 : 0)).current;
  useEffect(() => {
    if (calm) { v.setValue(1); return; }
    const a = Animated.sequence([Animated.delay(delay), Animated.spring(v, { toValue: 1, ...SPRING })]); a.start(); return () => a.stop();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const tr = from === 'scale' ? [{ scale: v.interpolate({ inputRange: [0, 1], outputRange: [0.92, 1] }) }]
    : from === 'side' ? [{ translateX: v.interpolate({ inputRange: [0, 1], outputRange: [dy * 1.6, 0] }) }]
    : [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [dy, 0] }) }];
  return <Animated.View style={[{ opacity: v.interpolate({ inputRange: [0, 0.6, 1], outputRange: [0, 0.85, 1] }), transform: tr }, style]}>{children}</Animated.View>;
}

/** Varje direkt barn kommer in lite efter det förra (högst 8 steg, sedan resten på en gång). */
export function Stagger({ children, step = 55, start = 40 }: { children: React.ReactNode; step?: number; start?: number }) {
  const kids = React.Children.toArray(children);
  return <>{kids.map((k, i) => <Enter key={(k as any)?.key ?? i} delay={start + Math.min(i, 8) * step}>{k}</Enter>)}</>;
}

/** ScrollView vars innehåll glider in i tur och ordning. Byts in direkt där ScrollView användes. */
export const MScroll = React.forwardRef(function MScroll(props: any, ref: any) {
  const { children, ...rest } = props;
  return <ScrollView ref={ref} {...rest}><Stagger>{children}</Stagger></ScrollView>;
});

const OUTER = new Set(['flex', 'flexGrow', 'flexShrink', 'flexBasis', 'alignSelf', 'width', 'minWidth', 'maxWidth', 'margin', 'marginTop', 'marginBottom', 'marginLeft', 'marginRight', 'marginHorizontal', 'marginVertical', 'marginStart', 'marginEnd', 'position', 'top', 'left', 'right', 'bottom', 'zIndex']);
/** Tryckyta som fjädrar ner och tillbaka. */
export function Press({ children, style, onPress, scaleTo = 0.965, disabled, testID, accessibilityRole = 'button', accessibilityLabel, accessibilityState, hitSlop }:
  { children: React.ReactNode; style?: any; onPress?: () => void; scaleTo?: number; disabled?: boolean; testID?: string; accessibilityRole?: any; accessibilityLabel?: string; accessibilityState?: any; hitSlop?: number }) {
  const calm = useCalm(); const s = useRef(new Animated.Value(1)).current;
  const to = (x: number) => { if (calm) return; Animated.spring(s, { toValue: x, damping: 14, stiffness: 320, mass: 0.6, useNativeDriver: true }).start(); };
  // Layoutegenskaper (flex, bredd, marginaler, position) hör hemma på den yttre tryckytan, resten på det som fjädrar.
  const flat = StyleSheet.flatten(style) || {}; const outer: Record<string, unknown> = {}, inner: Record<string, unknown> = {};
  for (const k of Object.keys(flat)) (OUTER.has(k) ? outer : inner)[k] = flat[k];
  if (outer.flex != null || outer.flexGrow != null || outer.width != null) inner.flexGrow = 1;
  return <Pressable testID={testID} accessibilityRole={accessibilityRole} accessibilityLabel={accessibilityLabel} accessibilityState={accessibilityState} hitSlop={hitSlop}
    disabled={disabled} onPress={onPress} onPressIn={() => to(scaleTo)} onPressOut={() => to(1)} style={outer}>
    <Animated.View style={[inner, { transform: [{ scale: s }, ...((inner.transform as any[]) || [])] }]}>{children}</Animated.View>
  </Pressable>;
}

/** Stapel som växer mjukt till pct (0–100). */
export function Bar({ pct, color, track, h = 12, rtl, style }: { pct: number; color: string; track: string; h?: number; rtl?: boolean; style?: StyleProp<ViewStyle> }) {
  const calm = useCalm(); const v = useRef(new Animated.Value(calm ? pct : 0)).current;
  useEffect(() => { if (calm) { v.setValue(pct); return; } Animated.timing(v, { toValue: pct, duration: 650, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start(); }, [pct, calm]); // eslint-disable-line react-hooks/exhaustive-deps
  return <View style={[{ height: h, borderRadius: 99, backgroundColor: track, overflow: 'hidden', transform: [{ scaleX: rtl ? -1 : 1 }] }, style]}>
    <Animated.View style={{ height: '100%', borderRadius: 99, backgroundColor: color, width: v.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] }) }} />
  </View>;
}

/** Siffra som räknar upp. */
export function CountUp({ to, render }: { to: number; render: (n: number) => React.ReactNode }) {
  const calm = useCalm(); const [n, setN] = useState(calm ? to : 0);
  useEffect(() => {
    if (calm) { setN(to); return; } const v = new Animated.Value(0); const id = v.addListener(({ value }: { value: number }) => setN(Math.round(value)));
    Animated.timing(v, { toValue: to, duration: 800, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start(); return () => v.removeListener(id);
  }, [to, calm]);
  return <>{render(n)}</>;
}

/** Långsam puls, till exempel runt en knapp som ska upptäckas. */
export function Pulse({ children, on = true, style }: { children: React.ReactNode; on?: boolean; style?: StyleProp<ViewStyle> }) {
  const calm = useCalm(); const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (calm || !on) { v.setValue(0); return; }
    const a = Animated.loop(Animated.sequence([Animated.timing(v, { toValue: 1, duration: 900, easing: Easing.inOut(Easing.quad), useNativeDriver: true }), Animated.timing(v, { toValue: 0, duration: 900, easing: Easing.inOut(Easing.quad), useNativeDriver: true })]));
    a.start(); return () => a.stop();
  }, [on, calm]); // eslint-disable-line react-hooks/exhaustive-deps
  return <Animated.View style={[style, { transform: [{ scale: v.interpolate({ inputRange: [0, 1], outputRange: [1, 1.04] }) }] }]}>{children}</Animated.View>;
}
