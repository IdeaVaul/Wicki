import React from 'react';
import Svg, { G, Line, Path, Rect, Text as SvgText } from 'react-native-svg';
import { useStore } from '../store';
import type { VideoDef, VOverlay, VLabel } from '../types';
import { vidCandles } from '../engine/video';

const LI: Record<string, number> = { sv: 0, en: 1, fr: 2, ar: 3 };
const W = 320, H = 230, L = 6, R = 6, T = 10, B = 10;

/** Animerad graf för Videoskolan: ljus fram till `upto` plus scenens markeringar. */
export function VideoChart({ v, upto, ov }: { v: VideoDef; upto: number; ov: VOverlay[] }) {
  const { c, S, t } = useStore();
  const cs = vidCandles(v), n = v.n, cw = (W - L - R) / n;
  const lang = LI[S.lang] ?? 0;
  const VN = (x: number) => (S.lang === 'sv' || S.lang === 'fr') ? String(x).replace('.', ',') : String(x);
  const L4 = (a?: VLabel) => (a ? a[lang] : '');
  let lo = Math.min(...cs.map(x => x.l)), hi = Math.max(...cs.map(x => x.h));
  ov.forEach(o => (['y', 'y0', 'y1', 'e', 's', 'tp'] as const).forEach(k => { const val = o[k]; if (typeof val === 'number' && val > 0) { lo = Math.min(lo, val); hi = Math.max(hi, val); } }));
  lo -= 0.6; hi += 0.9;
  const Y = (p: number) => T + (hi - p) / (hi - lo) * (H - T - B), X = (i: number) => L + i * cw;
  const col = (k?: string) => ({ up: c.up, down: c.down, gold: c.gold, violet: c.violet, pri: c.pri } as Record<string, string>)[k || 'pri'] || c.pri;
  const back: React.ReactNode[] = [], top: React.ReactNode[] = [];
  let key = 0;
  const lab = (x: number, y: number, txt: string, k?: string, anchor: 'start' | 'middle' | 'end' = 'start') => {
    const w = Math.min(200, txt.length * 6.3 + 12); let x0 = anchor === 'end' ? x - w : anchor === 'middle' ? x - w / 2 : x; x0 = Math.max(2, Math.min(W - w - 2, x0));
    top.push(<G key={'l' + key++}><Rect x={x0} y={y - 9} width={w} height={17} rx={8.5} fill={col(k)} opacity={0.92} />
      <SvgText x={x0 + w / 2} y={y + 3.6} textAnchor="middle" fontSize={10.5} fontWeight="700" fill={c.on}>{txt}</SvgText></G>);
  };
  for (let k = 0; k < 5; k++) { const y = T + k * (H - T - B) / 4; back.push(<Line key={'g' + k} x1={0} x2={W} y1={y} y2={y} stroke={c.line} strokeWidth={0.6} />); }
  ov.forEach((o, oi) => {
    const kk = 'o' + oi;
    if (o.t === 'zone') { const x0 = X(o.i0!), x1 = X(Math.min(n - 1, o.i1!)) + cw; back.push(<Rect key={kk} x={x0} y={Y(o.y1!)} width={x1 - x0} height={Math.max(2, Y(o.y0!) - Y(o.y1!))} fill={col(o.c)} opacity={0.22} />); lab(x0 + 2, Y(o.y1!) - 6, L4(o.l), o.c); }
    if (o.t === 'range') { const x0 = X(o.i0!), mid = (o.y0! + o.y1!) / 2;
      back.push(<Rect key={kk + 'a'} x={x0} y={Y(o.y1!)} width={W - R - x0} height={Y(mid) - Y(o.y1!)} fill={c.down} opacity={0.13} />, <Rect key={kk + 'b'} x={x0} y={Y(mid)} width={W - R - x0} height={Y(o.y0!) - Y(mid)} fill={c.up} opacity={0.13} />,
        <Line key={kk + 'c'} x1={x0} x2={W - R} y1={Y(mid)} y2={Y(mid)} stroke={c.gold} strokeWidth={1.2} strokeDasharray="4 3" />);
      lab(W - R - 4, Y(o.y1!) + 8, L4(o.l), 'down', 'end'); lab(W - R - 4, Y(o.y0!) - 4, L4(o.l2), 'up', 'end'); lab(x0 + 2, Y(mid) - 8, S.lang === 'ar' ? '50٪' : '50 %', 'gold'); }
    if (o.t === 'fvg') { const a = cs[o.i!], b = cs[o.i! + 2]; const up = a.h < b.l; const y0 = up ? a.h : b.h, y1 = up ? b.l : a.l; const x0 = X(o.i!);
      back.push(<Rect key={kk} x={x0} y={Y(y1)} width={W - R - x0} height={Y(y0) - Y(y1)} fill={col(o.c)} opacity={0.25} />); lab(W - R - 4, Y(y1) - 6, L4(o.l), o.c, 'end'); }
    if (o.t === 'ob') { const cc = cs[o.i!]; const x0 = X(o.i!); back.push(<Rect key={kk} x={x0} y={Y(cc.h)} width={W - R - x0} height={Math.max(2, Y(cc.l) - Y(cc.h))} fill={col(o.c)} opacity={0.28} />); lab(W - R - 4, Y(cc.l) + 12, L4(o.l), o.c, 'end'); }
    if (o.t === 'trade') { const x0 = X(o.i0!), x1 = X(Math.min(n - 1, o.i1!)) + cw;
      if ((o.tp || 0) > 0) { back.push(<Rect key={kk + 'tp'} x={x0} y={Y(o.tp!)} width={x1 - x0} height={Y(o.e!) - Y(o.tp!)} fill={c.up} opacity={0.2} />); lab(x1 - 2, Y(o.tp!) - 6, [`Mål ${VN(o.tp!)}`, `Target ${o.tp}`, `Objectif ${VN(o.tp!)}`, `الهدف ${o.tp}`][lang], 'up', 'end'); }
      back.push(<Rect key={kk + 's'} x={x0} y={Y(o.e!)} width={x1 - x0} height={Y(o.s!) - Y(o.e!)} fill={c.down} opacity={0.22} />, <Line key={kk + 'e'} x1={x0} x2={x1} y1={Y(o.e!)} y2={Y(o.e!)} stroke={c.ink} strokeWidth={1} />);
      lab(x0 - 2, Y(o.e!) - 1, [`Ingång ${VN(o.e!)}`, `Entry ${o.e}`, `Entrée ${VN(o.e!)}`, `الدخول ${o.e}`][lang], 'pri', 'end'); lab(x1 - 2, Y(o.s!) + 12, [`Stopp ${VN(o.s!)}`, `Stop ${o.s}`, `Stop ${VN(o.s!)}`, `الوقف ${o.s}`][lang], 'down', 'end'); }
    if (o.t === 'h') { back.push(<Line key={kk} x1={0} x2={W} y1={Y(o.y!)} y2={Y(o.y!)} stroke={col(o.c)} strokeWidth={1.6} strokeDasharray="5 4" />); lab(4, Y(o.y!) - 9, L4(o.l), o.c); }
    if (o.t === 'bos') { let i1 = o.i0! + 1; for (let i = o.i0! + 1; i < n; i++) { if (o.c === 'down' ? cs[i].c < o.y! : cs[i].c > o.y!) { i1 = i; break; } }
      if (i1 <= upto) { const x0 = X(o.i0!) + cw / 2, x1 = X(i1) + cw / 2; back.push(<Line key={kk} x1={x0} x2={x1} y1={Y(o.y!)} y2={Y(o.y!)} stroke={col(o.c)} strokeWidth={1.8} strokeDasharray="3 3" />); lab((x0 + x1) / 2, o.c === 'down' ? Y(o.y!) + 12 : Y(o.y!) - 8, L4(o.l), o.c, 'middle'); } }
    if (o.t === 'swings') o.pts!.forEach(([i, txt, at]) => { if (i > upto) return; const cc = cs[i]; lab(X(i) + cw / 2, at === 'h' ? Y(cc.h) - 8 : Y(cc.l) + 13, txt, (/L/.test(txt) && at === 'h') || txt === 'LL' ? 'down' : 'up', 'middle'); });
    if (o.t === 'mark' && o.i! <= upto) { const cc = cs[o.i!], x = X(o.i!) + cw / 2, up = o.at === 'l'; const y = up ? Y(cc.l) + 4 : Y(cc.h) - 4, y2 = up ? y + 16 : y - 16;
      back.push(<Path key={kk} d={`M${x} ${y}L${x - 4} ${up ? y + 7 : y - 7}M${x} ${y}L${x + 4} ${up ? y + 7 : y - 7}M${x} ${y}V${y2}`} stroke={col(o.c)} strokeWidth={2} fill="none" strokeLinecap="round" />); lab(x, up ? y2 + 9 : y2 - 5, L4(o.l), o.c, 'middle'); }
    if (o.t === 'bs') { const b = o.b!, sl = 100 - b;
      top.push(<G key={kk}><Rect x={8} y={14} width={150} height={48} rx={8} fill={c.surface} opacity={0.92} />
        <SvgText x={16} y={30} fontSize={10.5} fontWeight="700" fill={c.up}>{`${t('Köpare')} ${b} %`}</SvgText><Rect x={16} y={34} width={b * 1.3} height={6} rx={3} fill={c.up} />
        <SvgText x={16} y={51} fontSize={10.5} fontWeight="700" fill={c.down}>{`${t('Säljare')} ${sl} %`}</SvgText><Rect x={16} y={54} width={sl * 1.3} height={6} rx={3} fill={c.down} /></G>); }
  });
  const candles: React.ReactNode[] = [];
  for (let i = 0; i <= Math.min(upto, n - 1); i++) { const cc = cs[i], up = cc.c >= cc.o, x = X(i) + cw / 2, bw = Math.max(2, cw * 0.62), k = up ? c.up : c.down;
    candles.push(<G key={'c' + i}><Line x1={x} x2={x} y1={Y(cc.h)} y2={Y(cc.l)} stroke={k} strokeWidth={1.2} /><Rect x={x - bw / 2} y={Y(Math.max(cc.o, cc.c))} width={bw} height={Math.max(1.2, Math.abs(Y(cc.o) - Y(cc.c)))} rx={1} fill={k} /></G>); }
  return <Svg width="100%" height={undefined} style={{ aspectRatio: W / H }} viewBox={`0 0 ${W} ${H}`}>{back}{candles}{top}</Svg>;
}
