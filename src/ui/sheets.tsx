import React, { useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';
import { useStore } from '../store';
import { KIDS } from '../data/kids';
import { ARROWS } from '../data/arrows';
import { PAT, SIG } from '../data/patterns';
import { figSpec } from '../engine/charts';
import type { A11y, Fig } from '../types';
import { Btn, Card, Divider, Row, Sheet, SheetTop, SwitchRow, T } from './kit';
import { Wick } from './Wick';
import { FigView } from './Chart';
import { speak, hush } from '../speech';

export type KidTopic = { key: string; title: string; fb: string[]; fig?: Fig | null };
export const kidConcept = (t: string, d: string, fig?: string): KidTopic => ({ key: 'c:' + t, title: t, fb: [d], fig: fig ? figSpec(fig) : null });
export const kidPattern = (id: string): KidTopic => { const P = PAT[id]; return { key: 'p:' + id, title: P.n, fb: [P.m, P.w, P.f], fig: figSpec(id, 11) }; };
const EMO = ['👋', '🍬', '🔍', '💡', '🧺', '⭐', '🎯', '✅'];

/** Wicki förklarar steg för steg, som för ett barn. */
export function KidSheet({ topic, onClose }: { topic: KidTopic | null; onClose: () => void }) {
  const { S, t, c, buzz } = useStore();
  const [i, setI] = useState(0);
  const steps: string[] = React.useMemo(() => {
    if (!topic) return [];
    const hand = KIDS[S.lang]?.[topic.key]; if (hand) return hand;
    const out = [t('Okej! Vi tar det lugnt, ett litet steg i taget.')];
    if (topic.fig) out.push(t('Titta på bilden. Den visar hur det ser ut i en riktig graf.'));
    topic.fb.forEach(x => t(x).split(/(?<=[.!?؟])\s+/).filter(Boolean).forEach(y => out.push(y)));
    out.push(t('Bra jobbat! Nu kan du det här. Tryck på Jag förstår!'));
    return out.map((x, k) => /^\p{Extended_Pictographic}/u.test(x) ? x : EMO[k % EMO.length] + ' ' + x);
  }, [topic, S.lang, t]);
  useEffect(() => { setI(0); }, [topic]);
  useEffect(() => { if (topic && S.tts && steps[i]) speak(steps[i], S.lang); }, [i, topic, steps, S.tts, S.lang]);
  if (!topic) return null;
  const n = steps.length, last = i >= n - 1;
  const hand = !!KIDS[S.lang]?.[topic.key];
  const arrows = hand ? ARROWS[topic.key]?.[i] : null;
  const close = () => { hush(); onClose(); };
  return (
    <Sheet visible onClose={close}>
      <SheetTop title={topic.title} onClose={close} />
      <Row gap={6} style={{ justifyContent: 'center' }}>{steps.map((_, k) => <View key={k} style={{ height: 8, flex: 1, maxWidth: 44, borderRadius: 99, backgroundColor: k <= i ? c.up : c.line }} />)}</Row>
      <T w="x" s={12} c={c.muted} center upper>{`Steg ${i + 1} av ${n}`}</T>
      {topic.fig ? <FigView fig={topic.fig} arrows={arrows} /> : null}
      <Row style={{ alignItems: 'flex-end' }}>
        <Wick mood={last ? 'cheer' : 'happy'} size={72} lit anim={last ? 'dance' : i % 2 ? 'jump' : 'bob'} />
        <Card style={{ flex: 1 }}><T raw s={18} w="m" style={{ lineHeight: 27 * (S.big ? 1.18 : 1) }}>{steps[i]}</T></Card>
      </Row>
      <Btn kind="ghost" small label="🔊 Läs upp" onPress={() => speak(steps[i], S.lang)} style={{ alignSelf: 'center' }} />
      <Row>
        <Btn kind="ghost" label="Tillbaka" disabled={i === 0} onPress={() => { buzz('tap'); setI(i - 1); }} style={{ flex: 1 }} />
        {last ? <Btn kind="good" label="Jag förstår!" onPress={() => { buzz('ok'); close(); }} style={{ flex: 1 }} />
          : <Btn label="Nästa" onPress={() => { buzz('tap'); setI(i + 1); }} style={{ flex: 1 }} />}
      </Row>
    </Sheet>
  );
}

export function PatCard({ id }: { id: string }) {
  const { c } = useStore(); const P = PAT[id];
  const col = /Up/.test(P.sig) ? c.up : /Down/.test(P.sig) ? c.down : c.muted;
  return <Card style={{ gap: 10 }}>
    <Row style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <View style={{ flex: 1 }}><T w="x" s={20}>{P.n}</T><T raw s={13} c={c.muted}>{`${P.en} · ${P.k} `}<T s={13} c={c.muted}>ljus</T></T></View>
      <View style={{ borderRadius: 99, paddingHorizontal: 10, paddingVertical: 4, backgroundColor: col + '22' }}><T w="b" s={12} c={col}>{SIG[P.sig]}</T></View>
    </Row>
    <FigView fig={figSpec(id, 11)} />
    <T>{P.m}</T>
    <Row style={{ alignItems: 'flex-start' }}>
      <View style={{ flex: 1 }}><T w="x" s={11} c={c.muted} upper>Var</T><T s={14}>{P.w}</T></View>
      <View style={{ flex: 1 }}><T w="x" s={11} c={c.muted} upper>Bekräftelse</T><T s={14}>{P.f}</T></View>
    </Row>
  </Card>;
}

export function KidButton({ onPress }: { onPress: () => void }) {
  const { c } = useStore();
  return <Card onPress={onPress} testID="kid" style={{ paddingVertical: 8 }}><Row>
    <Wick size={40} lit anim="none" /><View style={{ flex: 1 }}><T w="x" s={15}>Wicki förklarar steg för steg</T><T s={12.5} c={c.muted}>Som för ett barn, med enkla ord.</T></View>
  </Row></Card>;
}

/* ---------- Anpassa Wicki ---------- */
type AK = keyof A11y | 'big' | 'hc' | 'tts' | 'quiet';
export const PRESETS: [string, string, string, string, AK[]][] = [
  ['focus', '🎯', 'Fokus och koncentration', 'Till exempel vid ADHD', ['focus', 'short', 'fewer', 'breaks', 'notime']],
  ['read', '📖', 'Läsa och stava', 'Till exempel vid dyslexi', ['lex', 'space', 'tint', 'readQ']],
  ['vision', '👓', 'Syn', 'Större text och tydligare kontrast', ['big', 'hc', 'readQ']],
  ['color', '🎨', 'Färgseende', 'Ljusen syns även utan färg', ['cb']],
  ['calm', '🧘', 'Lugnt läge', 'Mindre ljud, rörelse och tävling', ['calm', 'quiet', 'focus']],
  ['motor', '✋', 'Motorik', 'Större knappar och ingen tidspress', ['tap', 'notime']],
];
export function useA11y() {
  const { S, update } = useStore();
  const get = (k: AK) => k === 'quiet' ? !S.haptics : k === 'big' || k === 'hc' || k === 'tts' ? !!S[k] : !!S.a[k as keyof A11y];
  const setIn = (s: typeof S, k: AK, v: boolean) => { if (k === 'quiet') s.haptics = !v; else if (k === 'big' || k === 'hc' || k === 'tts') s[k] = v; else s.a[k as keyof A11y] = v; };
  const set = (k: AK, v: boolean) => update(s => setIn(s, k, v));
  const presetOn = (p: typeof PRESETS[number]) => p[4].every(get);
  const toggle = (id: string) => { const p = PRESETS.find(x => x[0] === id)!; const on = !presetOn(p); update(s => p[4].forEach(k => setIn(s, k, on))); };
  return { get, set, presetOn, toggle };
}
export function Presets() {
  const { c } = useStore(); const A = useA11y();
  return <View style={{ gap: 8 }}>{PRESETS.map(p => { const on = A.presetOn(p); return (
    <Pressable key={p[0]} testID={'preset-' + p[0]} accessibilityRole="button" accessibilityState={{ selected: on }} onPress={() => A.toggle(p[0])}
      style={{ borderWidth: 2, borderBottomWidth: 4, borderColor: on ? c.pri : c.line, backgroundColor: on ? c.priSoft : c.surface, borderRadius: 14, padding: 12 }}>
      <Row><T raw s={24}>{p[1]}</T><View style={{ flex: 1 }}><T w="b" s={15}>{p[2]}</T><T s={12.5} c={c.muted}>{p[3]}</T></View>{on ? <T raw w="x" c={c.pri}>✓</T> : null}</Row>
    </Pressable>); })}</View>;
}
const GROUPS: [string, [AK, string, string?][]][] = [
  ['Läsa', [['lex', 'Lättläst typsnitt'], ['space', 'Mer luft mellan bokstäver och rader'], ['tint', 'Mjuk bakgrundsfärg'], ['readQ', 'Läs upp frågor automatiskt'], ['tts', 'Läs upp Wickis förklaringar automatiskt']]],
  ['Fokus', [['focus', 'Fokusläge', 'Döljer svit, dagens mål och annat extra.'], ['short', 'Korta lektioner', 'Högst 6 frågor åt gången.'], ['fewer', 'Färre svarsalternativ', 'Tre i stället för fyra.'], ['breaks', 'Påminn mig om pauser', 'Efter ungefär 10 minuter.'], ['notime', 'Ingen tidspress', 'Döljer snabbrundan med klocka.']]],
  ['Syn och färg', [['big', 'Stor text'], ['hc', 'Hög kontrast'], ['cb', 'Färgblindvänliga ljus', 'Uppåtljus blir ihåliga och nedåtljus fyllda, så du ser skillnad utan färg.']]],
  ['Ljud och rörelse', [['quiet', 'Vibrationer'], ['calm', 'Lugnt läge', 'Inga animationer eller konfetti.']]],
  ['Motorik', [['tap', 'Större knappar']]],
];
export function A11ySheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { c } = useStore(); const A = useA11y();
  if (!open) return null;
  return <Sheet visible onClose={onClose}>
    <SheetTop title="Anpassa Wicki" onClose={onClose} icon={<Wick size={34} lit anim="none" />} />
    <T c={c.muted}>Välj det som passar dig. Du kan ändra när som helst.</T>
    <T s={12.5} c={c.muted}>Valen sparas bara som inställningar, inte som uppgifter om dig.</T>
    <T w="x" s={12} c={c.muted} upper>Snabbval</T>
    <Presets />
    {GROUPS.map(([g, rows]) => <View key={g} style={{ gap: 8 }}>
      <T w="x" s={12} c={c.muted} upper style={{ marginTop: 8 }}>{g}</T>
      <Card style={{ padding: 0 }}>{rows.map(([k, l, sub], ix) => <View key={k}>{ix ? <Divider /> : null}
        <SwitchRow testID={'a-' + k} label={l} sub={sub} value={k === 'quiet' ? !A.get('quiet') : A.get(k)} onChange={v => A.set(k, k === 'quiet' ? !v : v)} /></View>)}</Card>
    </View>)}
    <Btn label="Klar" onPress={onClose} />
  </Sheet>;
}
