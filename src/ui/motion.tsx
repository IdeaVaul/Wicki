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

/* ---------------- Fler animationer: konfetti, +XP, skak, flimmer och studs ---------------- */
const CONF_COLORS = ['#3DDC97', '#F5C451', '#FF6B6B', '#5EA8FF', '#B98CFF', '#FF9A1F'];
/** Konfetti som regnar över skärmen en gång. Lägg den sist i en vy med flex: 1. */
export function Confetti({ n = 42, run = true }: { n?: number; run?: boolean }) {
  const calm = useCalm(); const [box, setBox] = useState({ w: 0, h: 0 });
  const parts = useRef(Array.from({ length: n }, (_, i) => ({ x: Math.random(), d: 0.45 + Math.random() * 0.55, delay: Math.random() * 350, rot: (Math.random() * 2 - 1) * 720,
    sw: (Math.random() * 2 - 1) * 40, w: 6 + Math.random() * 6, h: 10 + Math.random() * 8, col: CONF_COLORS[i % CONF_COLORS.length], round: Math.random() < 0.3, v: new Animated.Value(0) }))).current;
  useEffect(() => {
    if (calm || !run || !box.h) return;
    const a = Animated.parallel(parts.map(p => Animated.timing(p.v, { toValue: 1, duration: 1600 + p.d * 1200, delay: p.delay, easing: Easing.out(Easing.quad), useNativeDriver: true })));
    a.start(); return () => a.stop();
  }, [run, calm, box.h]); // eslint-disable-line react-hooks/exhaustive-deps
  if (calm || !run) return null;
  return <View pointerEvents="none" onLayout={e => setBox({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })} style={StyleSheet.absoluteFill}>
    {box.h ? parts.map((p, i) => <Animated.View key={i} style={{ position: 'absolute', left: p.x * box.w, top: -20, width: p.w, height: p.round ? p.w : p.h, borderRadius: p.round ? p.w / 2 : 2, backgroundColor: p.col,
      opacity: p.v.interpolate({ inputRange: [0, 0.8, 1], outputRange: [1, 1, 0] }),
      transform: [{ translateY: p.v.interpolate({ inputRange: [0, 1], outputRange: [0, box.h * p.d + 40] }) }, { translateX: p.v.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, p.sw, -p.sw / 2] }) },
        { rotate: p.v.interpolate({ inputRange: [0, 1], outputRange: ['0deg', `${p.rot}deg`] }) }] }} />) : null}
  </View>;
}

/** Texten (till exempel "+10 XP") stiger uppåt och tonar bort varje gång k ändras. */
export function FlyUp({ k, children, style }: { k: string | number | null; children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  const calm = useCalm(); const v = useRef(new Animated.Value(1)).current;
  useEffect(() => { if (k == null || calm) return; v.setValue(0); Animated.timing(v, { toValue: 1, duration: 900, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start(); }, [k]); // eslint-disable-line react-hooks/exhaustive-deps
  if (k == null || calm) return null;
  return <Animated.View pointerEvents="none" style={[style, { opacity: v.interpolate({ inputRange: [0, 0.15, 0.7, 1], outputRange: [0, 1, 1, 0] }),
    transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [10, -46] }) }, { scale: v.interpolate({ inputRange: [0, 0.2, 1], outputRange: [0.6, 1.15, 1] }) }] }]}>{children}</Animated.View>;
}

/** Skakar till när k ändras (fel svar). */
export function Shake({ k, children, style }: { k: string | number | null; children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  const calm = useCalm(); const v = useRef(new Animated.Value(0)).current;
  useEffect(() => { if (k == null || calm) return; v.setValue(0);
    Animated.sequence([0.9, -0.8, 0.6, -0.4, 0.2, 0].map(x => Animated.timing(v, { toValue: x, duration: 55, useNativeDriver: true }))).start(); }, [k]); // eslint-disable-line react-hooks/exhaustive-deps
  return <Animated.View style={[style, { transform: [{ translateX: v.interpolate({ inputRange: [-1, 1], outputRange: [-10, 10] }) }] }]}>{children}</Animated.View>;
}

/** Fladdrande låga: liten oregelbunden puls, till exempel på svitlågan när dagen är klar. */
export function Flicker({ children, on = true }: { children: React.ReactNode; on?: boolean }) {
  const calm = useCalm(); const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (calm || !on) { v.setValue(0); return; }
    const a = Animated.loop(Animated.sequence([[1, 380], [0.4, 260], [0.9, 300], [0, 420]].map(([x, d]) => Animated.timing(v, { toValue: x, duration: d, easing: Easing.inOut(Easing.sin), useNativeDriver: true }))));
    a.start(); return () => a.stop();
  }, [on, calm]); // eslint-disable-line react-hooks/exhaustive-deps
  return <Animated.View style={{ transform: [{ scale: v.interpolate({ inputRange: [0, 1], outputRange: [1, 1.14] }) }, { rotate: v.interpolate({ inputRange: [0, 1], outputRange: ['-3deg', '4deg'] }) }] }}>{children}</Animated.View>;
}

/** Studsar till när den blir aktiv (flikikoner, valda kort). */
export function Pop({ on, children }: { on: boolean; children: React.ReactNode }) {
  const calm = useCalm(); const v = useRef(new Animated.Value(on ? 1 : 0)).current; const first = useRef(true);
  useEffect(() => { if (first.current) { first.current = false; return; } if (!on || calm) return; v.setValue(0);
    Animated.spring(v, { toValue: 1, damping: 7, stiffness: 260, mass: 0.6, useNativeDriver: true }).start(); }, [on]); // eslint-disable-line react-hooks/exhaustive-deps
  return <Animated.View style={{ transform: [{ scale: v.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1] }) }, { translateY: v.interpolate({ inputRange: [0, 1], outputRange: [-4, 0] }) }] }}>{children}</Animated.View>;
}

/** Ring som pulserar utåt runt något, till exempel nästa lektion i kursvägen. */
export function Ripple({ size, color, on = true }: { size: number; color: string; on?: boolean }) {
  const calm = useCalm(); const v = useRef(new Animated.Value(0)).current;
  useEffect(() => { if (calm || !on) return; const a = Animated.loop(Animated.timing(v, { toValue: 1, duration: 1600, easing: Easing.out(Easing.quad), useNativeDriver: true })); a.start(); return () => a.stop(); }, [on, calm]); // eslint-disable-line react-hooks/exhaustive-deps
  if (calm || !on) return null;
  return <Animated.View pointerEvents="none" style={{ position: 'absolute', width: size, height: size, borderRadius: size / 2, borderWidth: 3, borderColor: color,
    opacity: v.interpolate({ inputRange: [0, 1], outputRange: [0.7, 0] }), transform: [{ scale: v.interpolate({ inputRange: [0, 1], outputRange: [1, 1.6] }) }] }} />;
}

/** Grafen ritas fram från vänster till höger första gången den visas. */
export function useWipe(len = 900) {
  const calm = useCalm(); const v = useRef(new Animated.Value(calm ? 1 : 0)).current; const [w, setW] = useState(0); const done = useRef(calm);
  useEffect(() => { if (!w || done.current) return; done.current = true; Animated.timing(v, { toValue: 1, duration: len, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start(); }, [w]); // eslint-disable-line react-hooks/exhaustive-deps
  return { setW, width: w ? v.interpolate({ inputRange: [0, 1], outputRange: [0, w] }) : undefined, w };
}
