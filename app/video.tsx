import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import { useStore } from '../src/store';
import { VIDEOS } from '../src/data/videos';
import { vidWords } from '../src/engine/video';
import { addXP } from '../src/engine/state';
import { TTS_LANG } from '../src/i18n';
import { Btn, Card, Row, T } from '../src/ui/kit';
import { Wick } from '../src/ui/Wick';
import { VideoChart } from '../src/ui/VideoChart';
import { femaleVoice } from '../src/voice';

const RATES = [0.85, 1, 1.15, 1.3];

/** Videospelare: animerade grafscener med uppläst berättarröst och textning. */
export default function Video() {
  const p = useLocalSearchParams<{ id: string }>();
  const { S, c, t, update, rtl } = useStore(); const ins = useSafeAreaInsets();
  const v = VIDEOS.find(x => x.id === p.id) || VIDEOS[0];
  const k = VIDEOS.indexOf(v), nx = VIDEOS[k + 1];
  const [si, setSi] = useState(0); const [shown, setShown] = useState(0);
  const [playing, setPlaying] = useState(false); const [ended, setEnded] = useState(!!(S.vids || {})[v.id]);
  const [rate, setRate] = useState(S.vrate || 1); const [sound, setSound] = useState(S.vsound !== false);
  const tok = useRef(0); const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const clear = () => { timers.current.forEach(x => { clearTimeout(x); clearInterval(x as any); }); timers.current = []; try { Speech.stop(); } catch { } };
  useEffect(() => () => { tok.current++; clear(); }, []);
  const sc = v.scenes[si];

  const playScene = useCallback((idx: number, from: number) => {
    const my = ++tok.current; clear();
    const scene = v.scenes[idx]; const to = scene.to; let cur = Math.min(from, to); setShown(cur);
    const iv = setInterval(() => { if (tok.current !== my) return clearInterval(iv); if (cur < to) { cur++; setShown(cur); } else clearInterval(iv); }, 110); timers.current.push(iv as any);
    const txt = t(scene.say); let fired = false;
    const done = () => { if (tok.current !== my || fired) return; fired = true; timers.current.push(setTimeout(() => {
      if (tok.current !== my) return;
      if (idx < v.scenes.length - 1) { setSi(idx + 1); playScene(idx + 1, to); }
      else { setPlaying(false); setEnded(true); update(s => { s.vids = s.vids || {}; if (!s.vids[v.id]) { s.vids[v.id] = 1; addXP(s, 10); } }); }
    }, 700)); };
    const est = vidWords(txt) * 450 / rate + 3000;
    if (sound) { try { Speech.speak(txt, { language: TTS_LANG[S.lang], voice: femaleVoice(S.lang), rate: 0.95 * rate, onDone: done, onError: () => void timers.current.push(setTimeout(done, vidWords(txt) * 400 / rate)) }); } catch { timers.current.push(setTimeout(done, est)); } }
    else timers.current.push(setTimeout(done, vidWords(txt) * 400 / rate));
    const wd = () => timers.current.push(setTimeout(async () => { if (tok.current !== my) return; let sp = false; try { sp = await Speech.isSpeakingAsync(); } catch { } if (sp) wd(); else done(); }, est));
    if (sound) wd();
  }, [v, rate, sound, S.lang, t, update]);

  const toggle = () => { if (playing) { tok.current++; clear(); setPlaying(false); return; } let idx = si, from = si ? v.scenes[si - 1].to : 0; if (ended && si === v.scenes.length - 1) { idx = 0; from = 0; setSi(0); } setPlaying(true); playScene(idx, from); };
  const jump = (d: number) => { const idx = Math.max(0, Math.min(v.scenes.length - 1, si + d)); if (idx === si) return; setSi(idx); const from = idx ? v.scenes[idx - 1].to : 0;
    if (playing) playScene(idx, from); else { tok.current++; clear(); setShown(v.scenes[idx].to); } };
  const cycleRate = () => { const r = RATES[(RATES.indexOf(rate) + 1) % RATES.length] || 1; setRate(r); update(s => { s.vrate = r; }); };
  const toggleSound = () => { const sd = !sound; setSound(sd); update(s => { s.vsound = sd; }); if (playing) { tok.current++; clear(); setPlaying(false); } };
  const ov = sc.ov;

  return <View style={{ flex: 1, backgroundColor: c.bg }}>
    <ScrollView contentContainerStyle={{ paddingTop: ins.top + 8, paddingHorizontal: 16, paddingBottom: ins.bottom + 30, gap: 12 }}>
      <Row><Pressable testID="close" accessibilityLabel={t('Tillbaka')} onPress={() => { tok.current++; clear(); router.back(); }} style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: c.glass, borderWidth: 1, borderColor: c.glassB, alignItems: 'center', justifyContent: 'center' }}>
        <Ionicons name="close" size={22} color={c.muted} /></Pressable>
        <T raw w="x" s={12.5} c={c.pri} upper>{`${t('Video')} ${k + 1}/${VIDEOS.length}`}</T></Row>
      <T w="x" s={26}>{v.title}</T>
      <View style={{ flexDirection: rtl ? 'row-reverse' : 'row', gap: 4 }}>{v.scenes.map((_, i) => <View key={i} style={{ flex: 1, height: 5, borderRadius: 3, backgroundColor: i < si ? c.pri : i === si ? c.priSoft : c.track }} />)}</View>
      <Card style={{ padding: 8 }}><VideoChart v={v} upto={shown} ov={ov} /></Card>
      <Row style={{ alignItems: 'flex-end' }} gap={10}><Wick size={54} />
        <View style={{ flex: 1, minHeight: 96, backgroundColor: c.bub, borderColor: c.bubB, borderWidth: 1, borderRadius: 22, padding: 14 }}><T raw s={16.5}>{t(sc.say)}</T></View></Row>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 14 }}>
        <Pressable accessibilityLabel={t('Föregående')} onPress={() => jump(-1)} style={{ width: 46, height: 46, borderRadius: 23, backgroundColor: c.glass, borderWidth: 1, borderColor: c.glassB, alignItems: 'center', justifyContent: 'center' }}><Ionicons name="play-skip-back" size={20} color={c.ink} /></Pressable>
        <Pressable testID="play" accessibilityLabel={t('Spela upp')} onPress={toggle} style={{ width: 68, height: 68, borderRadius: 34, backgroundColor: c.pri, alignItems: 'center', justifyContent: 'center', shadowColor: c.pri, shadowOpacity: 0.5, shadowRadius: 16, elevation: 6 }}><Ionicons name={playing ? 'pause' : 'play'} size={30} color={c.on} /></Pressable>
        <Pressable accessibilityLabel={t('Nästa')} onPress={() => jump(1)} style={{ width: 46, height: 46, borderRadius: 23, backgroundColor: c.glass, borderWidth: 1, borderColor: c.glassB, alignItems: 'center', justifyContent: 'center' }}><Ionicons name="play-skip-forward" size={20} color={c.ink} /></Pressable>
        <Pressable onPress={cycleRate} style={{ minWidth: 58, height: 40, borderRadius: 20, paddingHorizontal: 12, backgroundColor: c.glass, borderWidth: 1, borderColor: c.glassB, alignItems: 'center', justifyContent: 'center' }}><T raw w="b" s={14}>{`${String(rate).replace('.', ',')}×`}</T></Pressable>
        <Pressable accessibilityLabel={t('Ljud')} onPress={toggleSound} style={{ width: 46, height: 46, borderRadius: 23, backgroundColor: c.glass, borderWidth: 1, borderColor: c.glassB, alignItems: 'center', justifyContent: 'center' }}><Ionicons name={sound ? 'volume-high' : 'volume-mute'} size={20} color={c.ink} /></Pressable>
      </View>
      {ended ? <Btn testID="quiz" label="Testa dig själv · 3 frågor" onPress={() => { tok.current++; clear(); router.push({ pathname: '/lesson', params: { mode: 'vquiz', id: v.id } }); }} /> : null}
      {nx ? <Btn kind="ghost" label={`${t('Nästa video:')} ${t(nx.title)}`} onPress={() => { tok.current++; clear(); router.replace({ pathname: '/video', params: { id: nx.id } }); }} /> : null}
    </ScrollView>
  </View>;
}
