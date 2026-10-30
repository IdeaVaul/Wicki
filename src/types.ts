export type Candle = { o: number; h: number; l: number; c: number; v: number };
export type PatDef = { n: string; en: string; k: number; sig: string; ctx: string; mk: (p: number) => Candle[]; m: string; w: string; f: string };
export type Concept = { t: string; d: string; fig?: string };
export type QItem = { q?: string; o?: string[]; fig?: string; why?: string; m?: [string, string][]; ord?: string[] };
export type Lesson = { t: string; c?: Concept[]; q?: QItem[]; pat?: string[] };
export type UnitDef = { key: string; title: string; les: string[]; gen: string | null };
export type NodeKind = 'les' | 'gen' | 'mix' | 'chest' | 'test';
export type PathNode = { k: NodeKind; l?: string; id: string; u: number; i: number };
export type Unit = UnitDef & { nodes: PathNode[] };
export type ColorKey = 'up' | 'down' | 'pri' | 'gold' | 'violet' | 'muted';
export type ChartLine = { y: number; c: ColorKey; t?: string };
export type ChartSeg = { a: [number, number]; b: [number, number]; c: ColorKey };
export type ChartSpec = { cs: Candle[]; segs?: ChartSeg[]; asLine?: boolean; lines?: ChartLine[]; hl?: [number, number] | null; ma?: number; vol?: boolean; pad?: number; h?: number; rsi?: boolean; note?: string };
export type Fig = { kind: 'ohlc' } | ({ kind: 'chart' } & ChartSpec);
export type Opt = { k: string; l: string };
export type Ex = {
  id: number;
  t: 'intro' | 'pintro' | 'mc' | 'match' | 'order' | 'spot' | 'lvid';
  lv?: { l: string; title: string; sc: LvScene[] };
  q?: string; c?: Concept; pat?: string;
  opts?: Opt[]; ans?: string; fig?: Fig | null; why?: string;
  key?: string; skey?: string; pu?: number;
  pairs?: { a: string; b: string }[]; L?: number[]; R?: number[];
  items?: string[]; bank?: number[];
  cs?: Candle[]; start?: number; end?: number;
  msg?: { from: string; text: string }; noHint?: boolean;
};
export type A11y = Partial<Record<'lex' | 'space' | 'tint' | 'readQ' | 'focus' | 'short' | 'fewer' | 'breaks' | 'notime' | 'cb' | 'calm' | 'tap', boolean>>;
export type Lang = 'sv' | 'en' | 'fr' | 'ar';
export type State = {
  v: 1; lang: Lang; onb: boolean; goal: number; xp: number; xpDay: Record<string, number>;
  done: Record<string, 1>; hearts: number; heartT: number;
  streak: { last: string; n: number; best: number };
  miss: Record<string, number>; srs: Record<string, { b: number; due: string }>;
  q: { d: string; xp: number; lessons: number; combo: number; best: number; simxp?: number } | null;
  sim?: SimState; simRec?: { best: number; chal: number; tries: number };
  lessons: number; perfect: number; best60: number;
  haptics: boolean; theme: 'system' | 'light' | 'dark'; skin2?: number; vids?: Record<string, number>; vrate?: number; vsound?: boolean; lvs?: Record<string, number>; lvcc?: boolean; age?: '' | 'u16' | 'u18' | 'y' | 'o';
  tts: boolean; big: boolean; hc: boolean; a: A11y;
  /** Wicki Plus. since = när nuvarande abonnemang startade (styr lojalitetspriset), cancel = när det sades upp, off = förskjutning i testläge. */
  plus?: { plan: 'm' | 'y'; since: number; cancel?: number; test?: boolean; off?: number } | null;
  /** Samtycke till anonym statistik (PostHog) och kraschrapporter (Sentry). undefined = inte frågat än. */
  stats?: boolean; did?: string;
  /** Diagramverktyg i simulatorn (indikatorer, tidsram, ritade nivåer och trendlinjer). */
  simTools?: import('./engine/simtools').SimTools;
};

/** Videoskolan */
export type VLabel = [string, string, string, string];
export type VOverlay = { t: string; y?: number; y0?: number; y1?: number; i?: number; i0?: number; i1?: number; at?: string; c?: string; l?: VLabel; l2?: VLabel;
  pts?: [number, string, string][]; e?: number; s?: number; tp?: number; b?: number };
export type VideoDef = { id: string; seed: number; n: number; a: number[][]; title: string; desc: string;
  scenes: { to: number; ov: VOverlay[]; say: string }[]; quiz: { q: string; o: string[] }[] };

/** Handelssimulator */
export type SimPos = { side: 1 | -1; qty: number; entry: number; stop: number; tp: number | null; i: number; risk: number; fee: number };
export type SimTrade = { pl: number; R: number; why: string; side: 1 | -1; n: number };
export type SimState = { v: 2; mk: 'stock' | 'fx' | 'crypto' | 'gold'; mode: 'free' | 'chal'; seed: number; i: number; cash: number; start: number; peak: number;
  pos: SimPos | null; trades: SimTrade[]; risk: number; sm: number; tp: number; end: number; res: null | 'pass' | 'fail' | 'time' };

/** Lektionsvideo före varje lektion */
export type LvScene = { k: 'intro' | 'c' | 'cx' | 'outro'; t?: string; d?: string; fig?: string | null; seed?: number; list?: string[];
  /** Nummer på begreppet, krok, exempel, misstag och sammanfattning (per språk sv, en, fr, ar). */
  n?: number; hook?: string[]; ex?: string[]; er?: string[]; key?: string[] };
