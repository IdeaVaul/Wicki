import React from 'react';
import { View, ViewStyle, StyleProp } from 'react-native';
import Svg, { Circle, Path, Rect, Text as SvgText } from 'react-native-svg';
import { useStore } from '../store';

/** Svaga candlesticks i bakgrunden, som i skisserna. */
export function BgCandles({ seed = 3, n = 26, style, opacity = 0.4 }: { seed?: number; n?: number; style?: StyleProp<ViewStyle>; opacity?: number }) {
  let s = seed * 7919 + 13, p = 50; const R = () => (s = (s * 16807) % 2147483647) / 2147483647;
  const els: React.ReactNode[] = []; const Y = (v: number) => (100 - v) * 1.6;
  for (let i = 0; i < n; i++) {
    const o = p; p += (R() - 0.42) * 6; const c = p, hi = Math.max(o, c) + R() * 3, lo = Math.min(o, c) - R() * 3, x = i * 10 + 5, col = c >= o ? '#2FE39A' : '#FF4D5E';
    els.push(<Path key={'w' + i} d={`M${x} ${Y(hi)}V${Y(lo)}`} stroke={col} strokeWidth={1} />);
    els.push(<Rect key={'b' + i} x={x - 3} y={Y(Math.max(o, c))} width={6} height={Math.max(1.5, Math.abs(o - c) * 1.6)} rx={1} fill={col} />);
  }
  return <View pointerEvents="none" style={[{ position: 'absolute', opacity }, style]}>
    <Svg width="100%" height="100%" viewBox={`0 0 ${n * 10} 160`} preserveAspectRatio="none">{els}</Svg></View>;
}

/** Ring för dagens mål. */
export function Ring({ pct, size = 84 }: { pct: number; size?: number }) {
  const { c } = useStore(); const r = 34, C = 2 * Math.PI * r;
  return <Svg width={size} height={size} viewBox="0 0 84 84">
    <Circle cx={42} cy={42} r={r} fill="none" stroke={c.track} strokeWidth={8} />
    <Circle cx={42} cy={42} r={r} fill="none" stroke={c.pri} strokeWidth={8} strokeLinecap="round" strokeDasharray={`${(C * pct / 100).toFixed(1)} ${C.toFixed(1)}`} transform="rotate(-90 42 42)" />
    <SvgText x={42} y={48} textAnchor="middle" fontSize={18} fontWeight="800" fill={c.ink}>{`${pct}%`}</SvgText>
  </Svg>;
}

/** Ikon med två ljus (grönt och rött). */
export function CandlesIcon({ size = 32 }: { size?: number }) {
  return <Svg width={size} height={size} viewBox="0 0 32 32">
    <Path d="M11 4v24" stroke="#2FE39A" strokeWidth={1.8} strokeLinecap="round" /><Rect x={7} y={9} width={8} height={13} rx={2} fill="#2FE39A" />
    <Path d="M21 6v20" stroke="#FF4D5E" strokeWidth={1.8} strokeLinecap="round" /><Rect x={17} y={10} width={8} height={10} rx={2} fill="#FF4D5E" />
  </Svg>;
}
