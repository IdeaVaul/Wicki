import React from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Switch, Text, TextStyle, View, ViewStyle, StyleProp } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStore } from '../store';

type TP = { children?: React.ReactNode; s?: number; w?: 'm' | 'b' | 'x'; c?: string; center?: boolean; raw?: boolean; style?: StyleProp<TextStyle>; lines?: number; upper?: boolean };
/** Text som översätts automatiskt (svensk källsträng) och följer anpassningarna. */
export function T({ children, s = 16, w = 'm', c, center, raw, style, lines, upper }: TP) {
  const { t, font, sys, scale, rtl, S, c: col } = useStore();
  const tx = (x: React.ReactNode): React.ReactNode => (typeof x === 'string' && !raw ? t(x) : x);
  const content = Array.isArray(children) ? children.map(tx) : tx(children);
  const sz = s * scale; const space = !!S.a.space;
  const caps = upper && !S.a.lex;
  return (
    <Text numberOfLines={lines} style={[{
      fontFamily: font(w), fontWeight: sys ? (w === 'm' ? '500' : w === 'b' ? '700' : '800') : undefined, fontSize: sz, color: c || col.ink, lineHeight: Math.round(sz * (space ? 1.7 : 1.38)),
      letterSpacing: space && !rtl ? sz * 0.035 : caps ? 0.6 : 0, textAlign: center ? 'center' : rtl ? 'right' : 'left',
      writingDirection: rtl ? 'rtl' : 'ltr', textTransform: caps ? 'uppercase' : 'none',
    }, style]}>{content}</Text>
  );
}
export function Row({ children, style, gap = 10 }: { children: React.ReactNode; style?: StyleProp<ViewStyle>; gap?: number }) {
  const { rtl } = useStore();
  return <View style={[{ flexDirection: rtl ? 'row-reverse' : 'row', alignItems: 'center', gap }, style]}>{children}</View>;
}
type BP = { label: string; onPress?: () => void; kind?: 'pri' | 'good' | 'bad' | 'ghost' | 'gold'; disabled?: boolean; small?: boolean; style?: StyleProp<ViewStyle>; testID?: string; left?: React.ReactNode };
/** Knapp: lysande mintgrön pill (enligt skisserna). */
export function Btn({ label, onPress, kind = 'pri', disabled, small, style, testID, left, right }: BP & { right?: React.ReactNode }) {
  const { c, S } = useStore();
  const map = { pri: [c.pri, c.on], good: [c.up, c.on], bad: [c.down, '#fff'], gold: [c.gold, '#3b2a00'], ghost: [c.glass, c.ink] } as const;
  const [bg, fg] = disabled ? [c.track, c.lockInk] : map[kind];
  const tap = S.a.tap; const glow = !disabled && kind !== 'ghost';
  return (
    <Pressable testID={testID} accessibilityRole="button" accessibilityLabel={label} disabled={disabled} onPress={onPress}
      style={({ pressed }) => [{ backgroundColor: bg, borderColor: c.glassB, borderWidth: kind === 'ghost' || disabled ? 1 : 0, borderRadius: 999,
        minHeight: small ? 40 : tap ? 60 : 56, paddingHorizontal: small ? 14 : 22, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8,
        shadowColor: bg, shadowOpacity: glow ? 0.5 : 0, shadowRadius: 16, shadowOffset: { width: 0, height: 6 }, elevation: glow ? 6 : 0,
        transform: [{ scale: pressed ? 0.975 : 1 }] }, style]}>
      {left}<T w="b" s={small ? 14 : 17} c={fg} center>{label}</T>{right}
    </Pressable>
  );
}
export function Card({ children, style, onPress, testID }: { children: React.ReactNode; style?: StyleProp<ViewStyle>; onPress?: () => void; testID?: string }) {
  const { c } = useStore();
  const st = [{ backgroundColor: c.glass, borderColor: c.glassB, borderWidth: 1, borderRadius: 20, padding: 16 }, style];
  if (onPress) return <Pressable testID={testID} accessibilityRole="button" onPress={onPress} style={({ pressed }) => [st, pressed && { transform: [{ scale: 0.985 }] }]}>{children}</Pressable>;
  return <View style={st}>{children}</View>;
}
export function Pill({ label, on, onPress, testID }: { label: string; on?: boolean; onPress: () => void; testID?: string }) {
  const { c, S } = useStore();
  return <Pressable testID={testID} accessibilityRole="button" accessibilityState={{ selected: !!on }} onPress={onPress}
    style={{ paddingHorizontal: 14, paddingVertical: S.a.tap ? 12 : 8, borderRadius: 99, borderWidth: 1, borderColor: on ? c.pri : c.glassB, backgroundColor: on ? c.priSoft : c.glass }}>
    <T w="b" s={14} c={on ? c.pri : c.ink}>{label}</T></Pressable>;
}
export function SwitchRow({ label, sub, value, onChange, testID }: { label: string; sub?: string; value: boolean; onChange: (v: boolean) => void; testID?: string }) {
  const { c } = useStore();
  return <Row style={{ paddingVertical: 12, paddingHorizontal: 14, justifyContent: 'space-between' }}>
    <View style={{ flex: 1 }}><T w="b" s={15}>{label}</T>{sub ? <T s={12.5} c={c.muted}>{sub}</T> : null}</View>
    <Switch testID={testID} accessibilityLabel={label} value={value} onValueChange={onChange} trackColor={{ true: c.pri, false: c.lockD }} thumbColor="#fff" />
  </Row>;
}
export const Divider = () => { const { c } = useStore(); return <View style={{ height: 1, backgroundColor: c.line }} />; };
/** Bottenark som modal. */
export function Sheet({ visible, onClose, children }: { visible: boolean; onClose: () => void; children: React.ReactNode }) {
  const { c } = useStore(); const ins = useSafeAreaInsets();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(2,6,5,0.6)' }]} onPress={onClose} accessibilityLabel="Stäng" />
      <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, maxHeight: '90%', backgroundColor: c.surface, borderTopWidth: 1, borderColor: c.glassB, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingBottom: ins.bottom + 12 }}>
        <View style={{ alignSelf: 'center', width: 44, height: 5, borderRadius: 3, backgroundColor: c.line, marginTop: 8 }} />
        <ScrollView contentContainerStyle={{ padding: 18, gap: 12 }}>{children}</ScrollView>
      </View>
    </Modal>
  );
}
export function SheetTop({ title, onClose, icon }: { title: string; onClose: () => void; icon?: React.ReactNode }) {
  const { c } = useStore();
  return <Row style={{ justifyContent: 'space-between' }}><Row style={{ flex: 1 }}>{icon}<T w="x" s={20} style={{ flexShrink: 1 }}>{title}</T></Row>
    <Pressable accessibilityRole="button" accessibilityLabel="Stäng" onPress={onClose} style={{ width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: c.glassB, backgroundColor: c.glass, alignItems: 'center', justifyContent: 'center' }}><T w="x" s={18}>✕</T></Pressable></Row>;
}
