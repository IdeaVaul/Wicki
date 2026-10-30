import React from 'react';
import { Pressable, View } from 'react-native';
import Svg, { G, Line, Path, Polyline, Rect, Text as SText } from 'react-native-svg';
import { arrList, type ArrowStep } from '../data/arrows';
import { useStore } from '../store';
import type { ChartSpec, Fig } from '../types';
import { rsiOf } from '../engine/charts';
import { T } from './kit';

/** extra = egna linjer per ljus (t.ex. MA 50, Bollingerband). onTap = tryck i grafen ger ljusindex och pris (för att rita). */
export type Extra = { pts: (number | null)[]; c: 'up' | 'down' | 'pri' | 'gold' | 'violet' | 'muted'; dash?: boolean; wdt?: number };
type P = ChartSpec & { sel?: number | null; onSpot?: (i: number) => void; w?: number; arrows?: ArrowStep; extra?: Extra[]; onTap?: (i: number, price: number) => void };
/** Pil som pekar på (x, y). dir = åt vilket håll pilen pekar. */
function Arr({ x, y, dir, color, bg, sc = 1 }: { x: number; y: number; dir: 'down' | 'up' | 'left' | 'right'; color: string; bg: string; sc?: number }) {
  const rot = { down: 0, up: 180, left: 90, right: -90 }[dir];
  return <G transform={`rotate(${rot} ${x} ${y}) translate(${x} ${y}) scale(${sc}) translate(${-x} ${-y})`}><Path d={`M${x} ${y}l-7 -10h4.4v-12h5.2v12h4.4z`} fill={color} stroke={bg} strokeWidth={1.4} strokeLinejoin="round" /></G>;
}
function swings(cs: ChartSpec['cs'], hi: boolean) { const out: number[] = []; for (let i = 2; i < cs.length - 2; i++) { const v = hi ? cs[i].h : cs[i].l; let ok = true; for (let k = i - 2; k <= i + 2; k++) { if (k === i) continue; const w = hi ? cs[k].h : cs[k].l; if (hi ? w > v : w < v) { ok = false; break; } } if (ok && (!out.length || i - out[out.length - 1] > 2)) out.push(i); } return out; }
/** Candlestick-graf. I färgblindläge blir uppåtljus ihåliga. */
export function CandleChart({ cs, lines = [], segs = [], asLine = false, ma = 0, vol = false, hl = null, pad = 8, h = 170, sel = null, onSpot, rsi, w = 320, arrows, extra = [], onTap }: P) {
  const { c, S, t, font } = useStore();
  const ph = vol ? h * 0.76 : h;
  const sy = [...segs.flatMap(g => [g.a[1], g.b[1]]), ...extra.flatMap(e => e.pts.filter((v): v is number => v != null))];
  const lo = Math.min(...cs.map(x => x.l), ...lines.map(l => l.y), ...sy), hi = Math.max(...cs.map(x => x.h), ...lines.map(l => l.y), ...sy), span = (hi - lo) || 1;
  const Y = (v: number) => pad + (hi - v) / span * (ph - 2 * pad), cw = (w - 2 * pad) / cs.length, bw = Math.min(28, Math.max(2, cw * 0.62));
  const cb = !!S.a.cb;
  const maPts: string[] = [];
  if (ma) cs.forEach((x, i) => { if (i < ma - 1) return; const a = cs.slice(i - ma + 1, i + 1).reduce((s, y) => s + y.c, 0) / ma; maPts.push(`${(pad + i * cw + cw / 2).toFixed(1)},${Y(a).toFixed(1)}`); });
  const mv = Math.max(...cs.map(x => x.v));
  const AR = arrList(arrows).filter(a => a.rsi == null && !a.ohlc);
  const marks: React.ReactNode[] = [];
  const A = (x: number, y: number, d: 'down' | 'up' | 'left' | 'right', sc = 1) => marks.push(<Arr key={'a' + marks.length} x={x} y={y} dir={d} color={c.pri} bg={c.surface} sc={sc} />);
  const at = (ii: number | 'last', p?: string) => { const i = ii === 'last' ? cs.length - 1 : ii; const x0 = cs[i]; if (!x0) return; const x = pad + i * cw + cw / 2;
    if (p === 'high') A(x, Y(x0.h) - 3, 'down'); else if (p === 'low') A(x, Y(x0.l) + 3, 'up');
    else if (p === 'body') { const y1 = Y(Math.max(x0.o, x0.c)), y2 = Y(Math.min(x0.o, x0.c)); marks.push(<Rect key={'r' + marks.length} x={x - bw / 2 - 3} y={y1 - 3} width={bw + 6} height={Math.max(1.6, y2 - y1) + 6} rx={4} fill="none" stroke={c.pri} strokeWidth={2.4} />); A(x, Y(x0.h) - 3, 'down'); }
    else { const yy = p === 'close' ? Y(x0.c) : Y(x0.o); marks.push(<Line key={'m' + marks.length} x1={x - bw / 2 - 2} x2={x + bw / 2 + 5} y1={yy} y2={yy} stroke={c.pri} strokeWidth={3} strokeLinecap="round" />); A(x + bw / 2 + 6, yy, 'left', 0.62); } };
  AR.forEach(a => {
    if (a.i != null) at(a.i, a.p); else if (a.pi != null && hl) at(hl[0] + a.pi, a.p);
    else if (a.pat && hl) { let best = hl[0]; for (let k = hl[0]; k <= hl[1]; k++) if (a.pat === 'low' ? cs[k].l < cs[best].l : cs[k].h > cs[best].h) best = k; at(best, a.pat); }
    else if (a.peaks) swings(cs, true).slice(-a.peaks).forEach(i => at(i, 'high'));
    else if (a.troughs) swings(cs, false).slice(-a.troughs).forEach(i => at(i, 'low'));
    else if (a.line != null) A(pad + (w - 2 * pad) * 0.12, Y(a.line) - 3, 'down');
    else if (a.vol && vol) { let bi = 0; cs.forEach((x, i) => { if (a.vol === 'max' ? x.v > cs[bi].v : x.v < cs[bi].v) bi = i; }); const bh = cs[bi].v / mv * (h - ph - 6); A(pad + bi * cw + cw * 0.19 + bw / 2, h - bh - 3, 'down'); }
    else if (a.ma && ma) { const i = cs.length - 1; const av = cs.slice(i - ma + 1, i + 1).reduce((s, x) => s + x.c, 0) / ma; A(pad + i * cw + cw / 2, Y(av) - 3, 'down'); }
  });
  const top = AR.length ? 24 : 0;
  const [box, setBox] = React.useState({ w: 1, h: 1 });
  const tap = (e: { nativeEvent: { locationX: number; locationY: number } }) => { if (!onTap) return;
    const x = e.nativeEvent.locationX / box.w * w, y = e.nativeEvent.locationY / box.h * (h + 2 * top) - top;
    const i = Math.max(0, Math.min(cs.length - 1, Math.floor((x - pad) / cw))); const price = hi - (y - pad) / (ph - 2 * pad) * span; onTap(i, price); };
  const main = (
    <Pressable disabled={!onTap} onPress={tap} onLayout={e => setBox({ w: e.nativeEvent.layout.width || 1, h: e.nativeEvent.layout.height || 1 })} style={{ width: '100%', aspectRatio: w / (h + 2 * top) }}>
      <Svg width="100%" height="100%" viewBox={`0 ${-top} ${w} ${h + 2 * top}`} accessibilityLabel={t('Kursgraf')}>
        {hl ? <Rect x={pad + hl[0] * cw - 2} y={2} width={(hl[1] - hl[0] + 1) * cw + 4} height={ph - 4} rx={8} fill={c.hl} stroke={c.pri} strokeWidth={1.5} strokeDasharray="4 3" /> : null}
        {asLine ? <Polyline points={cs.map((x, i) => `${(pad + i * cw + cw / 2).toFixed(1)},${Y(x.c).toFixed(1)}`).join(' ')} fill="none" stroke={c.pri} strokeWidth={2.6} strokeLinejoin="round" /> : cs.map((x, i) => {
          const cx = pad + i * cw + cw / 2, up = x.c >= x.o, col = up ? c.up : c.down, holl = cb && up;
          const y1 = Y(Math.max(x.o, x.c)), y2 = Y(Math.min(x.o, x.c));
          return <React.Fragment key={i}>
            <Line x1={cx} x2={cx} y1={Y(x.h)} y2={Y(x.l)} stroke={col} strokeWidth={1.6} />
            <Rect x={cx - bw / 2} y={y1} width={bw} height={Math.max(1.6, y2 - y1)} rx={1.5} fill={holl ? c.surface : col} stroke={col} strokeWidth={holl ? 2 : 0} />
          </React.Fragment>;
        })}
        {sel != null ? <Rect x={pad + sel * cw} y={2} width={cw} height={ph - 4} rx={4} fill={c.hl} stroke={c.pri} strokeWidth={2.5} /> : null}
        {extra.map((e, k) => { const pts = e.pts.map((v, i) => v == null ? null : `${(pad + i * cw + cw / 2).toFixed(1)},${Y(v).toFixed(1)}`).filter(Boolean).join(' '); return pts ? <Polyline key={'e' + k} points={pts} fill="none" stroke={c[e.c]} strokeWidth={e.wdt || 2} strokeDasharray={e.dash ? '5 4' : undefined} strokeLinejoin="round" /> : null; })}
        {ma ? <Polyline points={maPts.join(' ')} fill="none" stroke={c.gold} strokeWidth={2.6} strokeLinejoin="round" /> : null}
        {segs.map((g, i) => { const X = (t: number) => pad + t * (w - 2 * pad); return <Line key={'g' + i} x1={X(g.a[0])} x2={X(g.b[0])} y1={Y(g.a[1])} y2={Y(g.b[1])} stroke={c[g.c]} strokeWidth={2.2} strokeLinecap="round" />; })}
        {lines.map((l, i) => <React.Fragment key={'l' + i}>
          <Line x1={pad} x2={w - pad} y1={Y(l.y)} y2={Y(l.y)} stroke={c[l.c]} strokeWidth={2} strokeDasharray="6 4" />
          {l.t ? <SText x={w - pad - 2} y={Y(l.y) - 5} textAnchor="end" fill={c[l.c]} fontSize={11} fontFamily={font('b')}>{t(l.t)}</SText> : null}
        </React.Fragment>)}
        {vol ? cs.map((x, i) => { const bh = x.v / mv * (h - ph - 6); return <Rect key={'v' + i} x={pad + i * cw + cw * 0.19} y={h - bh} width={bw} height={bh} fill={x.c >= x.o ? c.up : c.down} opacity={0.45} />; }) : null}
        {marks}
        {onSpot ? cs.map((_, i) => <Rect key={'s' + i} x={pad + i * cw} y={0} width={cw} height={ph} fill="transparent" onPress={() => onSpot(i)} />) : null}
      </Svg>
    </Pressable>
  );
  if (!rsi) return main;
  const r = rsiOf(cs); const rh = 70, RY = (v: number) => 8 + (100 - v) / 100 * (rh - 16); const last = r[r.length - 1] || 50;
  const pts = r.map((v, i) => v == null ? null : `${(pad + i * cw + cw / 2).toFixed(1)},${RY(v).toFixed(1)}`).filter(Boolean).join(' ');
  const RA = arrList(arrows).filter(a => a.rsi != null); const rt = RA.length ? 24 : 0;
  return <View>{main}<View style={{ width: '100%', aspectRatio: w / (rh + rt) }}><Svg width="100%" height="100%" viewBox={`0 ${-rt} ${w} ${rh + rt}`}>
    <Rect x={pad} y={RY(70)} width={w - 2 * pad} height={RY(30) - RY(70)} fill={c.hl} />
    <Line x1={pad} x2={w - pad} y1={RY(70)} y2={RY(70)} stroke={c.down} strokeDasharray="4 3" /><Line x1={pad} x2={w - pad} y1={RY(30)} y2={RY(30)} stroke={c.up} strokeDasharray="4 3" />
    <SText x={pad + 2} y={RY(70) - 3} fill={c.down} fontSize={10} fontFamily={font('b')}>70</SText><SText x={pad + 2} y={RY(30) + 11} fill={c.up} fontSize={10} fontFamily={font('b')}>30</SText>
    <Polyline points={pts} fill="none" stroke={c.violet} strokeWidth={2.2} />
    <SText x={w - pad} y={RY(last) - 5} textAnchor="end" fill={c.violet} fontSize={11} fontFamily={font('x')}>{`RSI ${Math.round(last)}`}</SText>
    {RA.map((a, k) => a.rsi === 'last' ? <Arr key={k} x={pad + (cs.length - 1) * cw + cw / 2 - 14} y={RY(last)} dir="right" color={c.pri} bg={c.surface} /> : <Arr key={k} x={pad + (w - 2 * pad) * 0.5} y={RY(a.rsi as number) - 2} dir="down" color={c.pri} bg={c.surface} />)}
  </Svg></View></View>;
}
const OA: Record<string, [number, number]> = { high: [94, 14], low: [94, 156], close: [80, 44], open: [80, 122], body: [80, 83], wick: [94, 30] };
export function OhlcFig({ arrows }: { arrows?: ArrowStep }) {
  const { c, t, font } = useStore();
  const L = (y: number, s: string) => <React.Fragment key={s}><Line x1={118} x2={144} y1={y} y2={y} stroke={c.muted} strokeDasharray="3 3" /><SText x={150} y={y + 4} fill={c.ink} fontSize={13} fontFamily={font('b')}>{t(s)}</SText></React.Fragment>;
  return <View style={{ width: '100%', aspectRatio: 320 / 170 }}><Svg width="100%" height="100%" viewBox="0 0 320 170">
    <Line x1={100} x2={100} y1={14} y2={156} stroke={c.up} strokeWidth={3} /><Rect x={82} y={44} width={36} height={78} rx={4} fill={S_cb(c)} />
    {L(14, 'Högsta (H)')}{L(44, 'Stängning (C)')}{L(122, 'Öppning (O)')}{L(156, 'Lägsta (L)')}
    <SText x={40} y={88} textAnchor="middle" fill={c.muted} fontSize={12} fontFamily={font('b')}>{t('kropp')}</SText>
    <SText x={40} y={22} textAnchor="middle" fill={c.muted} fontSize={12} fontFamily={font('b')}>{t('veke')}</SText>
    {arrList(arrows).filter(a => a.ohlc && OA[a.ohlc]).map((a, k) => <Arr key={k} x={OA[a.ohlc!][0]} y={OA[a.ohlc!][1]} dir="right" color={c.pri} bg={c.surface} />)}
  </Svg></View>;
}
const S_cb = (c: { up: string }) => c.up;
export function FigView({ fig, sel, onSpot, arrows }: { fig: Fig; sel?: number | null; onSpot?: (i: number) => void; arrows?: ArrowStep }) {
  const { c } = useStore();
  return <View style={{ backgroundColor: c.surface, borderColor: c.line, borderWidth: 2, borderRadius: 16, padding: 6 }}>
    {fig.kind === 'ohlc' ? <OhlcFig arrows={arrows} /> : <CandleChart {...fig} sel={sel} onSpot={onSpot} arrows={arrows} />}
    {fig.kind === 'chart' && fig.note ? <T s={12} c={c.muted} style={{ marginTop: 4, marginHorizontal: 6 }}>{fig.note}</T> : null}
  </View>;
}
