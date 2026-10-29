import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import { useStore } from '../store';
import { TTS_LANG } from '../i18n';
import type { Ex } from '../types';
import { figSpec } from '../engine/charts';
import { lvParts, lvSay } from '../engine/lessonvideo';
import { FigView } from './Chart';
import { BgCandles } from './Deco';
import { T } from './kit';
import { Wick } from './Wick';
import { femaleVoice } from '../voice';

const RATES = [1, 1.25, 1.5, 0.85];
const MINT = '#2FE39A', INK = '#04120c';
const words = (s: string) => s.split(/\s+/).filter(Boolean).length;
const fmt = (ms: number) => { const s = Math.max(0, Math.round(ms / 1000)); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };

/** Lektionsvideo som en riktig videospelare: mörk scen, textning ovanpå, tidslinje med kapitel, hastighet, CC och kapitellista. */
export function LessonVideo({ ex, onEnded }: { ex: Ex; onEnded?: () => void }) {
  const { S, c, t, rtl, update } = useStore();
  const lv = ex.lv!; const sc = lv.sc; const ar = S.lang === 'ar';
  const [si, setSi] = useState(0); const [part, setPart] = useState(0);
  const [playing, setPlaying] = useState(false); const [ended, setEnded] = useState(false);
  const [sound, setSound] = useState(S.vsound !== false); const [cc, setCc] = useState(S.lvcc !== false);
  const [bw, setBw] = useState(1); const [rate, setRate] = useState(S.vrate || 1); const [now, setNow] = useState(0); const t0 = useRef(0);
  const tok = useRef(0); const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const fade = useRef(new Animated.Value(0)).current; const talk = useRef(new Animated.Value(0)).current;
  const clear = () => { timers.current.forEach(x => clearTimeout(x)); timers.current = []; try { Speech.stop(); } catch { } };
  const txtOf = (i: number) => lvSay(sc[i], lv.title, t, ar);
  const est = (i: number) => words(txtOf(i)) * 400 / rate + 650;
  const total = sc.reduce((a, _, i) => a + est(i), 0);

  const play = useCallback((idx: number) => {
    const my = ++tok.current; clear(); setSi(idx); setPart(0); setPlaying(true); setEnded(false); t0.current = Date.now();
    fade.setValue(0); Animated.timing(fade, { toValue: 1, duration: 500, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
    const parts = lvParts(txtOf(idx)); let fired = false;
    const done = () => { if (tok.current !== my || fired) return; fired = true; timers.current.push(setTimeout(() => {
      if (tok.current !== my) return;
      if (idx < sc.length - 1) play(idx + 1);
      else { setPlaying(false); setEnded(true); update(s => { s.lvs = s.lvs || {}; s.lvs[lv.l] = 1; }); onEnded?.(); }
    }, 650)); };
    const ms = (p: string) => words(p) * 400 / rate;
    if (sound) {
      parts.forEach((p, k) => { try { Speech.speak(p, { language: TTS_LANG[S.lang], voice: femaleVoice(S.lang), rate: 0.95 * rate, onStart: () => { if (tok.current === my) setPart(k); },
        onDone: k === parts.length - 1 ? done : undefined, onError: () => void timers.current.push(setTimeout(done, ms(p))) }); } catch { } });
      const e = parts.reduce((a, p) => a + ms(p), 0) * 1.15 + 3000;
      const wd = () => timers.current.push(setTimeout(async () => { if (tok.current !== my) return; let sp = false; try { sp = await Speech.isSpeakingAsync(); } catch { } if (sp) wd(); else done(); }, e));
      wd();
    } else { let acc = 0; parts.forEach((p, k) => { timers.current.push(setTimeout(() => { if (tok.current === my) setPart(k); }, acc)); acc += ms(p); }); timers.current.push(setTimeout(done, acc)); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sound, rate, S.lang, t]);

  useEffect(() => { play(0); return () => { tok.current++; clear(); }; }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (!playing) return; const iv = setInterval(() => setNow(Date.now()), 250);
    const loop = Animated.loop(Animated.sequence([Animated.timing(talk, { toValue: 1, duration: 260, useNativeDriver: true }), Animated.timing(talk, { toValue: 0, duration: 260, useNativeDriver: true })])); loop.start();
    return () => { clearInterval(iv); loop.stop(); }; }, [playing]); // eslint-disable-line react-hooks/exhaustive-deps
  const stop = () => { tok.current++; clear(); setPlaying(false); };
  const toggle = () => { if (playing) stop(); else play(ended ? 0 : si); };
  const go = (i: number) => { const k = Math.max(0, Math.min(sc.length - 1, i)); play(k); };
  const cycleRate = () => { const r = RATES[(RATES.indexOf(rate) + 1) % RATES.length] || 1; setRate(r); update(s => { s.vrate = r; }); stop(); };
  const toggleSound = () => { const v = !sound; setSound(v); update(s => { s.vsound = v; }); stop(); };
  const toggleCc = () => { const v = !cc; setCc(v); update(s => { s.lvcc = v; }); };

  let pos = 0; for (let i = 0; i < si; i++) pos += est(i); pos = ended ? total : pos + (playing ? Math.min(est(si) * 0.97, now - t0.current) : 0); pos = Math.max(0, pos);
  const frac = Math.min(1, pos / total);
  const s = sc[si]; const nC = sc.length - 2; const parts = lvParts(txtOf(si));
  const cap = cc && s.k === 'c' && !(!s.fig && part <= 1) ? parts[part] || '' : '';
  const rise = { opacity: fade, transform: [{ translateY: fade.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) }] };
  const W = (txt: string, sz: number, col: string, w: 'b' | 'x' = 'x', center = true) => <T raw w={w} s={sz} c={col} center={center}>{txt}</T>;

  const stage = s.k === 'intro'
    ? <Animated.View style={[{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10, padding: 16, paddingBottom: 60 }, rise]}>
      {W(t('Lektionen förklarad').toUpperCase(), 11, MINT)}{W(t(lv.title), 24, '#fff')}
      <View style={{ flexDirection: rtl ? 'row-reverse' : 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 6 }}>
        {s.list!.map((x, k) => <View key={k} style={{ flexDirection: rtl ? 'row-reverse' : 'row', alignItems: 'center', gap: 6, paddingVertical: 4, paddingLeft: rtl ? 10 : 4, paddingRight: rtl ? 4 : 10, borderRadius: 99, backgroundColor: 'rgba(255,255,255,0.08)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)' }}>
          <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: MINT, alignItems: 'center', justifyContent: 'center' }}><T raw w="x" s={11} c={INK}>{String(k + 1)}</T></View>{W(t(x), 12.5, '#fff', 'b')}</View>)}</View></Animated.View>
    : s.k === 'outro'
      ? <Animated.View style={[{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8, paddingBottom: 64 }, rise]}><Wick mood="cheer" size={64} lit anim="jump" />{W(t('Nu testar vi!'), 24, '#fff')}{W(t('Svara på frågorna för att klara steget.'), 14, 'rgba(255,255,255,0.75)', 'b')}</Animated.View>
      : <View style={{ flex: 1 }}>
        <Animated.View style={[{ alignSelf: rtl ? 'flex-end' : 'flex-start', flexDirection: rtl ? 'row-reverse' : 'row', alignItems: 'center', gap: 8, margin: 10, padding: 5, paddingHorizontal: 6, borderRadius: 12, backgroundColor: 'rgba(5,16,12,0.75)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', maxWidth: '92%' }, rise]}>
          <View style={{ paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, backgroundColor: MINT }}><T raw w="x" s={12} c={INK}>{`${si}/${nC}`}</T></View>
          <T raw w="x" s={14.5} c="#fff" lines={1} style={{ flexShrink: 1 }}>{t(s.t!)}</T></Animated.View>
        {s.fig ? <Animated.View style={[{ flex: 1, paddingHorizontal: 6, paddingBottom: 56, justifyContent: 'center' }, { opacity: fade, transform: [{ scale: fade.interpolate({ inputRange: [0, 1], outputRange: [0.94, 1] }) }] }]}><FigView fig={figSpec(s.fig, s.seed)} /></Animated.View>
          : <Animated.View style={[{ flex: 1, justifyContent: 'center', paddingHorizontal: 20, paddingBottom: 64, gap: 8 }, rise]}>
            <T raw w="x" s={28} c={MINT} style={{ lineHeight: 32 }}>{t(s.t!)}</T>
            <T raw w="b" s={17} c="#fff">{(lvParts(t(s.d!))[0] || '')}</T></Animated.View>}
      </View>;

  const ctl = (id: string, icon: any, fn: () => void, label: string, on = true) => <Pressable key={id} testID={'lv-' + id} accessibilityRole="button" accessibilityLabel={t(label)} onPress={fn} hitSlop={6}
    style={{ width: 36, height: 34, alignItems: 'center', justifyContent: 'center', opacity: on ? 1 : 0.45 }}>{typeof icon === 'string' ? <Ionicons name={icon as any} size={21} color="#fff" /> : icon}</Pressable>;
  const ticks: number[] = []; { let a = 0; for (let i = 0; i < sc.length - 1; i++) { a += est(i); ticks.push(a / total); } }

  return <View style={{ gap: 12 }}>
    <View style={{ borderRadius: 20, overflow: 'hidden', backgroundColor: '#07140f', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' }}>
      <Pressable onPress={toggle} accessibilityLabel={t(playing ? 'Pausa' : 'Spela upp')} style={{ aspectRatio: 16 / 11 }}>
        <BgCandles seed={si * 13 + 5} n={30} style={{ top: 0, bottom: 0, left: 0, right: 0 }} opacity={0.14} />
        {stage}
        {s.k === 'c' ? <Animated.View pointerEvents="none" style={{ position: 'absolute', bottom: 50, [rtl ? 'left' : 'right']: 6, transform: [{ translateY: talk.interpolate({ inputRange: [0, 1], outputRange: [0, -3] }) }] }}><Wick size={44} lit anim="none" /></Animated.View> : null}
        {cap ? <View pointerEvents="none" style={{ position: 'absolute', left: 12, right: 52, bottom: 54, alignItems: 'center' }}>
          <View style={{ backgroundColor: 'rgba(0,0,0,0.68)', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 }}><T raw w="b" s={13.5} c="#fff" center>{cap}</T></View></View> : null}
        {!playing && !ended && s.k !== 'outro' ? <View pointerEvents="none" style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 40, alignItems: 'center', justifyContent: 'center' }}>
          <View style={{ width: 70, height: 70, borderRadius: 35, backgroundColor: MINT, alignItems: 'center', justifyContent: 'center', shadowColor: MINT, shadowOpacity: 0.5, shadowRadius: 14 }}><Ionicons name="play" size={32} color={INK} /></View></View> : null}
        <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 10, paddingBottom: 4, backgroundColor: 'rgba(0,0,0,0.45)' }}>
          <Pressable testID="lv-seek" onLayout={e => setBw(e.nativeEvent.layout.width || 1)} onPress={e => { const f = e.nativeEvent.locationX / bw; let a = 0, i = 0; for (; i < sc.length; i++) { a += est(i); if (a >= f * total) break; } go(Math.min(i, sc.length - 1)); }} style={{ height: 16, justifyContent: 'center', transform: [{ scaleX: rtl ? -1 : 1 }] }}>
            <View style={{ height: 3, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.25)' }} />
            <View style={{ position: 'absolute', left: 0, width: `${frac * 100}%`, height: 3, borderRadius: 3, backgroundColor: MINT }} />
            {ticks.map((f, k) => <View key={k} style={{ position: 'absolute', left: `${f * 100}%`, width: 3, height: 5, marginLeft: -1.5, backgroundColor: '#05100c' }} />)}
            <View style={{ position: 'absolute', left: `${frac * 100}%`, width: 11, height: 11, marginLeft: -5.5, borderRadius: 6, backgroundColor: '#fff' }} />
          </Pressable>
          <View style={{ flexDirection: rtl ? 'row-reverse' : 'row', alignItems: 'center' }}>
            {ctl('play', playing ? 'pause' : 'play', toggle, playing ? 'Pausa' : 'Spela upp')}
            {ctl('prev', rtl ? 'play-skip-forward' : 'play-skip-back', () => go(si - 1), 'Föregående')}
            {ctl('next', rtl ? 'play-skip-back' : 'play-skip-forward', () => go(si + 1), 'Nästa')}
            <T raw s={12} c="rgba(255,255,255,0.85)" style={{ marginHorizontal: 6 }}>{`${fmt(pos)} / ${fmt(total)}`}</T>
            <View style={{ flex: 1 }} />
            {ctl('spd', <T raw w="x" s={12.5} c="#fff">{`${String(rate).replace('.', ar || S.lang === 'en' ? '.' : ',')}×`}</T>, cycleRate, 'Hastighet')}
            {ctl('cc', <T raw w="x" s={12.5} c="#fff">CC</T>, toggleCc, 'Textning', cc)}
            {ctl('snd', sound ? 'volume-high' : 'volume-mute', toggleSound, 'Ljud', sound)}
          </View>
        </View>
      </Pressable>
    </View>
    <View style={{ gap: 2 }}>
      <T w="x" s={11.5} c={c.pri} upper>{`${t('Video')} · ${t('Lektionen förklarad')}`}</T>
      <T raw w="x" s={21}>{t(lv.title)}</T>
    </View>
    <View style={{ gap: 6 }}>
      {sc.map((x, i) => { const st = ended || i < si ? 'done' : i === si ? 'on' : ''; const title = x.k === 'intro' ? t('Introduktion') : x.k === 'outro' ? t('Nu testar vi!') : t(x.t!);
        return <Pressable key={i} testID={'lv-ch-' + i} accessibilityRole="button" onPress={() => go(i)}
          style={{ flexDirection: rtl ? 'row-reverse' : 'row', alignItems: 'center', gap: 12, padding: 11, borderRadius: 14, borderWidth: 1, borderColor: st === 'on' ? c.pri : c.glassB, backgroundColor: st === 'on' ? c.priSoft : c.glass }}>
          <View style={{ width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: st ? c.pri : c.track }}>
            {st === 'done' ? <Ionicons name="checkmark" size={16} color={c.on} /> : st === 'on' && playing ? <Ionicons name="volume-medium" size={15} color={c.on} /> : <T raw w="x" s={13} c={st ? c.on : c.ink}>{String(i + 1)}</T>}</View>
          <T raw w="b" s={15} style={{ flex: 1 }}>{title}</T><T raw s={12.5} c={c.muted}>{fmt(est(i))}</T></Pressable>; })}
    </View>
    <T s={12.5} c={c.muted} center>Rösten är datorgenererad och läser på ditt språk.</T>
  </View>;
}
