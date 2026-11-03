import React, { useEffect, useState } from 'react';
import { Linking, Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../store';
import { useAccount } from '../account/Account';
import { addXP, streakNow } from '../engine/state';
import { track } from '../analytics';
import { askPush, pushPerm, reschedule, type Perm } from '../notify';
import { Btn, Card, Pill, Row, Sheet, T } from './kit';
import { Bar, CountUp, Enter, Press, Pulse, Stagger } from './motion';
import { Wick } from './Wick';

/* ---------------------------------------------------------------------------------------------
 * Upptäcktsark: första gången man öppnar en funktion förklarar Wicki kort vad den gör.
 * ------------------------------------------------------------------------------------------- */
type Disc = { icon: string; title: string; pts: string[]; cta?: string };
export const DISCOVER: Record<string, Disc> = {
  course: { icon: 'map', title: 'Din kursväg', pts: ['Varje ring är en kort lektion på 3–5 minuter.', 'Kistor ger bonus-XP på vägen.', 'Ett prov i slutet av varje enhet visar att du kan det.'] },
  practice: { icon: 'barbell', title: 'Öva gör kunskapen bestående', pts: ['Wicki väljer det du håller på att glömma, i lagom dos.', 'Snabbrundan: så många rätt du hinner på 60 sekunder.', 'Repetera misstag ger tillbaka ett hjärta.'] },
  sim: { icon: 'trending-up', title: 'Handla utan risk', pts: ['Handla med låtsaspengar på realistiska prisrörelser.', 'Bestäm stop-loss och mål innan du köper.', 'Lägg till verktyg som MA, RSI och egna nivåer.'], cta: 'Prova nu' },
  videos: { icon: 'film', title: 'Lär dig på grafen', pts: ['Korta videor med röst, rakt på grafen.', 'Varje video slutar med tre frågor.', 'Slå på textning om du vill läsa samtidigt.'] },
  library: { icon: 'library', title: 'Alla mönster och begrepp', pts: ['Allt du lärt dig finns samlat här.', 'Tryck på Steg för steg så förklarar Wicki enkelt.', 'Sök när du stöter på ett ord du inte kan.'] },
  profile: { icon: 'person', title: 'Din profil', pts: ['Se din svit, din XP och veckans framsteg.', 'Ändra språk, tema, påminnelser och anpassningar.', 'Spara framstegen med ett konto när du vill.'] },
};

/** Lägg <Discover id="sim" /> på en skärm. Visas en gång, en stund efter att skärmen kommit in. */
export function Discover({ id }: { id: keyof typeof DISCOVER }) {
  const { S, c, update, buzz } = useStore(); const d = DISCOVER[id];
  const seen = !!S.grow?.seen?.[id]; const [open, setOpen] = useState(false);
  useEffect(() => { if (seen || !S.onb) return; const h = setTimeout(() => { setOpen(true); track('discover', { id }); }, 650); return () => clearTimeout(h); }, [seen, S.onb]); // eslint-disable-line react-hooks/exhaustive-deps
  const close = () => { setOpen(false); update(s => { s.grow = s.grow || {}; s.grow.seen = { ...(s.grow.seen || {}), [id]: 1 }; }); };
  if (seen && !open) return null;
  return <Sheet visible={open} onClose={close}>
    <Stagger step={70}>
      <Row style={{ justifyContent: 'center' }}><View style={{ width: 64, height: 64, borderRadius: 20, backgroundColor: c.priSoft, borderWidth: 1, borderColor: c.glassB, alignItems: 'center', justifyContent: 'center' }}><Ionicons name={d.icon as any} size={32} color={c.pri} /></View></Row>
      <T w="x" s={23} center>{d.title}</T>
      {d.pts.map((p, i) => <Row key={p} style={{ alignItems: 'flex-start' }}><View style={{ width: 26, height: 26, borderRadius: 13, backgroundColor: c.pri, alignItems: 'center', justifyContent: 'center', marginTop: 1 }}><T raw w="x" s={13} c={c.on}>{String(i + 1)}</T></View><T style={{ flex: 1 }}>{p}</T></Row>)}
      <Btn testID={'disc-' + id} label={d.cta || 'Uppfattat'} onPress={() => { buzz('ok'); close(); }} />
    </Stagger>
  </Sheet>;
}

/* ---------------------------------------------------------------------------------------------
 * Kom-igång-lista på Hem: sex steg som tillsammans visar allt Wicki kan. Kontot kommer sist.
 * ------------------------------------------------------------------------------------------- */
type Item = { id: string; icon: string; label: string; done: boolean; go: () => void };
export function useChecklist(onPush: () => void) {
  const { S } = useStore(); const acc = useAccount(); const ck = S.grow?.ck || {};
  const items: Item[] = [
    { id: 'lesson', icon: 'book', label: 'Gör din första lektion', done: S.lessons > 0, go: () => router.push('/course') },
    { id: 'video', icon: 'film', label: 'Titta på en video i Videoskolan', done: Object.keys(S.vids || {}).length > 0 || !!ck.video, go: () => router.push('/videos') },
    { id: 'sim', icon: 'trending-up', label: 'Gör en låtsastrade i simulatorn', done: !!(S.sim?.trades?.length || S.simRec?.tries) || !!ck.sim, go: () => router.push('/sim') },
    { id: 'review', icon: 'barbell', label: 'Repetera i Öva-fliken', done: !!ck.review, go: () => router.push('/practice') },
    { id: 'push', icon: 'notifications', label: 'Slå på påminnelser', done: !!S.grow?.push, go: onPush },
    { id: 'account', icon: 'cloud-upload', label: 'Spara dina framsteg med ett konto', done: !!acc.email, go: () => router.push({ pathname: '/auth', params: { mode: 'up', from: 'checklist' } }) },
  ];
  return items;
}

export function Checklist({ onPush }: { onPush: () => void }) {
  const { S, c, update, buzz, rtl, t } = useStore(); const items = useChecklist(onPush);
  const n = items.filter(i => i.done).length, all = n === items.length;
  const [party, setParty] = useState(false);
  useEffect(() => {
    if (all && !S.grow?.ckDone) { update(s => { s.grow = s.grow || {}; s.grow.ckDone = 1; addXP(s, 50); }); buzz('done'); setParty(true); track('checklist_done'); }
  }, [all]); // eslint-disable-line react-hooks/exhaustive-deps
  if (S.grow?.ckHide || (S.grow?.ckDone && !party) || S.a.focus) return null;
  const next = items.find(i => !i.done);
  return <Card testID="checklist" style={{ gap: 12, borderColor: c.bubB }}>
    <Row style={{ justifyContent: 'space-between' }}>
      <View style={{ flex: 1 }}><T w="x" s={18}>Kom igång med Wicki</T>
        <T raw s={13} c={c.muted}>{`${n}/${items.length} ${t('klara')} · ${t('+50 XP när allt är klart')}`}</T></View>
      {party ? null : <Pressable testID="ck-hide" hitSlop={10} onPress={() => update(s => { s.grow = s.grow || {}; s.grow.ckHide = 1; })}><T w="b" s={13} c={c.muted}>Dölj</T></Pressable>}
    </Row>
    <Bar pct={n / items.length * 100} color={c.up} track={c.track} h={10} rtl={rtl} />
    {party ? <Enter from="scale"><Row style={{ justifyContent: 'center' }}><Wick mood="cheer" size={64} lit anim="dance" />
      <View style={{ flex: 1, gap: 4 }}><T w="x" s={17}>Allt klart! Du har hittat allt i Wicki.</T><CountUp to={50} render={x => <T raw w="x" s={20} c={c.gold}>{`+${x} XP`}</T>} /></View></Row>
      <Btn small kind="ghost" label="Stäng" onPress={() => setParty(false)} /></Enter>
      : items.map(i => {
        const on = i === next;
        const row = <Press key={i.id} testID={'ck-' + i.id} disabled={i.done} onPress={() => { buzz('tap'); track('checklist_tap', { id: i.id }); i.go(); }}
          style={{ flexDirection: rtl ? 'row-reverse' : 'row', alignItems: 'center', gap: 12, paddingVertical: 9, paddingHorizontal: 10, borderRadius: 14, backgroundColor: on ? c.priSoft : 'transparent', borderWidth: on ? 1 : 0, borderColor: c.pri }}>
          <View style={{ width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: i.done ? c.up : c.glass, borderWidth: i.done ? 0 : 1, borderColor: c.glassB }}>
            <Ionicons name={(i.done ? 'checkmark' : i.icon) as any} size={16} color={i.done ? c.on : c.muted} /></View>
          <T w="b" s={15} c={i.done ? c.muted : c.ink} style={{ flex: 1, textDecorationLine: i.done ? 'line-through' : 'none' }}>{i.label}</T>
          {i.done ? null : <Ionicons name={rtl ? 'chevron-back' : 'chevron-forward'} size={18} color={on ? c.pri : c.muted} />}
        </Press>;
        return on ? <Pulse key={i.id}>{row}</Pulse> : row;
      })}
  </Card>;
}

/* ---------------------------------------------------------------------------------------------
 * Påminnelser: mjuk fråga först (i appen), systemets fråga bara om användaren säger ja.
 * ------------------------------------------------------------------------------------------- */
const HOURS: [number, string][] = [[8, 'Morgon'], [12, 'Lunch'], [18, 'Kväll'], [20, 'Sen kväll']];
export function PushSheet({ open, onClose, from }: { open: boolean; onClose: () => void; from: string }) {
  const { S, c, update, buzz } = useStore(); const [h, setH] = useState(S.grow?.hour ?? 18); const [perm, setPerm] = useState<Perm>('undetermined');
  useEffect(() => { if (open) { pushPerm().then(setPerm); track('push_ask', { from }); } }, [open]); // eslint-disable-line react-hooks/exhaustive-deps
  const yes = async () => {
    const ok = await askPush();
    update(s => { s.grow = s.grow || {}; s.grow.push = ok; s.grow.hour = h; s.grow.askAt = Date.now(); s.grow.askN = (s.grow.askN || 0) + 1; });
    track(ok ? 'push_on' : 'push_denied', { hour: h, from }); if (ok) buzz('done'); else setPerm(await pushPerm());
    if (ok) onClose();
  };
  const later = () => { update(s => { s.grow = s.grow || {}; s.grow.askAt = Date.now(); s.grow.askN = (s.grow.askN || 0) + 1; }); track('push_later', { from }); onClose(); };
  return <Sheet visible={open} onClose={later}>
    <Stagger step={70}>
      <View style={{ alignItems: 'center' }}><Wick mood="cheer" size={86} lit anim="jump" /></View>
      <T w="x" s={23} center>Ska Wicki påminna dig?</T>
      <T center c={c.muted}>En kort påminnelse om dagen hjälper dig att hålla svitlågan vid liv. Högst en om dagen, aldrig mitt i natten.</T>
      <T w="b" center>När passar det bäst?</T>
      <Row gap={8} style={{ flexWrap: 'wrap', justifyContent: 'center' }}>{HOURS.map(([x, l]) => <Pill key={x} testID={'hour-' + x} label={l} on={h === x} onPress={() => setH(x)} />)}</Row>
      {perm === 'denied' ? <Card style={{ gap: 8, borderColor: c.gold, backgroundColor: c.goldSoft }}><T s={14}>Påminnelser är avstängda i telefonens inställningar. Slå på dem där för Wicki.</T>
        <Btn small kind="gold" label="Öppna inställningar" onPress={() => Linking.openSettings?.()} /></Card>
        : <Btn testID="push-yes" label="Ja, påminn mig" onPress={yes} right={<Ionicons name="notifications" size={20} color={c.on} />} />}
      <Btn kind="ghost" label="Inte nu" onPress={later} />
    </Stagger>
  </Sheet>;
}

/** Påminnelseinställning i Profil. */
export function PushCard() {
  const { S, c, update } = useStore(); const [ask, setAsk] = useState(false); const on = !!S.grow?.push;
  return <Card testID="push-card" style={{ gap: 10 }}>
    <Row><Ionicons name="notifications" size={22} color={c.pri} /><View style={{ flex: 1 }}><T w="b">Påminnelser</T>
      <T s={13} c={c.muted}>Wicki anpassar påminnelsen efter din svit, dina repetitioner och nästa lektion.</T></View></Row>
    {on ? <Row gap={8} style={{ flexWrap: 'wrap' }}>{HOURS.map(([x, l]) => <Pill key={x} label={l} on={(S.grow?.hour ?? 18) === x} onPress={() => update(s => { s.grow = s.grow || {}; s.grow.hour = x; })} />)}</Row> : null}
    <Btn small kind={on ? 'ghost' : 'pri'} label={on ? 'Stäng av' : 'Slå på påminnelser'} onPress={() => on ? update(s => { s.grow = s.grow || {}; s.grow.push = false; }) : setAsk(true)} />
    <PushSheet open={ask} onClose={() => setAsk(false)} from="profile" />
  </Card>;
}

/* ---------------------------------------------------------------------------------------------
 * Sen registrering: kontot erbjuds först när det finns något att förlora (efter tre lektioner),
 * med det användaren byggt upp framför sig. Högst tre gånger, med minst fem dagar emellan.
 * ------------------------------------------------------------------------------------------- */
export function SaveSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { S, c, rtl } = useStore();
  useEffect(() => { if (open) track('save_prompt', { lessons: S.lessons, xp: S.xp }); }, [open]); // eslint-disable-line react-hooks/exhaustive-deps
  const tile = (v: number, l: string, col: string, icon: string) => <View style={{ flex: 1, alignItems: 'center', gap: 2, paddingVertical: 12, borderRadius: 16, backgroundColor: c.glass, borderWidth: 1, borderColor: c.glassB }}>
    <Ionicons name={icon as any} size={20} color={col} /><CountUp to={v} render={x => <T raw w="x" s={22} c={col}>{String(x)}</T>} /><T s={12} c={c.muted} center>{l}</T></View>;
  return <Sheet visible={open} onClose={onClose}>
    <Stagger step={80}>
      <View style={{ alignItems: 'center' }}><Wick mood="cheer" size={86} lit anim="dance" /></View>
      <T w="x" s={24} center>Spara det du har byggt</T>
      <Row style={{ flexDirection: rtl ? 'row-reverse' : 'row' }}>{tile(S.xp, 'XP', c.gold, 'star')}{tile(S.lessons, 'lektioner', c.pri, 'book')}{tile(streakNow(S), 'dagar i rad', c.coral, 'flame')}</Row>
      <T center c={c.muted}>Skapa ett gratis konto så följer dina framsteg med till nya telefoner och du tappar aldrig din svit.</T>
      <Btn testID="save-yes" label="Skapa gratis konto" onPress={() => { track('save_yes'); onClose(); router.push({ pathname: '/auth', params: { mode: 'up', from: 'save' } }); }} />
      <T s={12.5} c={c.muted} center>Tar 20 sekunder. Inget kort behövs.</T>
      <Btn kind="ghost" label="Inte nu" onPress={() => { track('save_later'); onClose(); }} />
    </Stagger>
  </Sheet>;
}

let shownThisSession = false;
/** Hem visar högst ett av arken per besök: först påminnelser (efter första lektionen), sedan kontot (efter tre). */
export function HomeNudges({ pushOpen, setPushOpen }: { pushOpen: boolean; setPushOpen: (v: boolean) => void }) {
  const { S, update } = useStore(); const acc = useAccount(); const [save, setSave] = useState(false);
  const g = S.grow || {}; const day = 864e5;
  useEffect(() => {
    if (shownThisSession || !S.onb) return;
    const wantPush = S.lessons >= 1 && !g.push && (g.askN || 0) < 2 && (!g.askAt || Date.now() - g.askAt > 4 * day);
    const wantSave = !acc.email && S.lessons >= 3 && (g.saveN || 0) < 3 && (!g.saveAt || Date.now() - g.saveAt > 5 * day);
    if (!wantPush && !wantSave) return;
    const h = setTimeout(() => {
      shownThisSession = true;
      if (wantPush) setPushOpen(true);
      else { setSave(true); update(s => { s.grow = s.grow || {}; s.grow.saveAt = Date.now(); s.grow.saveN = (s.grow.saveN || 0) + 1; }); }
    }, 900);
    return () => clearTimeout(h);
  }, [S.lessons, acc.email, S.onb]); // eslint-disable-line react-hooks/exhaustive-deps
  return <>
    <PushSheet open={pushOpen} onClose={() => setPushOpen(false)} from="home" />
    <SaveSheet open={save} onClose={() => setSave(false)} />
  </>;
}

/** Håller schemat för påminnelser i takt med framstegen. Monteras en gång i roten. */
export function useReminders() {
  const { S, ready } = useStore();
  const sig = [S.grow?.push, S.grow?.hour, S.lessons, S.streak.last, S.lang, Object.keys(S.done).length, Object.keys(S.vids || {}).length, S.sim?.trades?.length || 0, S.onb].join('|');
  useEffect(() => { if (!ready) return; const h = setTimeout(() => reschedule(S), 1200); return () => clearTimeout(h); }, [sig, ready]); // eslint-disable-line react-hooks/exhaustive-deps
}
