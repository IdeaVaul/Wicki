import * as N from 'expo-notifications';
import { Platform } from 'react-native';
import type { State } from './types';
import { ALLN, adultLock, nodeName } from './engine/course';
import { plusLock } from './engine/plus';
import { dueKeys, litToday, streakNow } from './engine/state';
import { VIDEOS } from './data/videos';
import { NTXT } from './data/grow-dict';
import { tr } from './i18n';

/** Riktade påminnelser, schemalagda lokalt i telefonen (ingen server och ingen data lämnar appen).
 *  Planen räknas om varje gång appen öppnas eller framstegen ändras, så innehållet alltid stämmer med var användaren är:
 *  svit som står på spel, begrepp som ska repeteras, nästa lektion, en ny video, simulatorn och till sist en lugn återkomst.
 *  Högst en påminnelse per dag, på den tid användaren valt, och helt tyst efter drygt en vecka utan besök. */

try {
  N.setNotificationHandler({ handleNotification: async () => ({ shouldShowBanner: false, shouldShowList: true, shouldPlaySound: false, shouldSetBadge: false, shouldShowAlert: false }) });
} catch { }

export type Perm = 'granted' | 'denied' | 'undetermined';
export async function pushPerm(): Promise<Perm> { try { const r = await N.getPermissionsAsync(); return r.granted ? 'granted' : r.canAskAgain === false ? 'denied' : 'undetermined'; } catch { return 'undetermined'; } }
export async function askPush(): Promise<boolean> {
  try {
    const cur = await N.getPermissionsAsync(); if (cur.granted) return true;
    const r = await N.requestPermissionsAsync({ ios: { allowAlert: true, allowBadge: false, allowSound: true } }); return !!r.granted;
  } catch { return false; }
}

type Msg = { day: number; kind: string; title: string; body: string; url: string };

/** Bygger veckans påminnelser utifrån läget just nu. day = antal dagar från i dag. */
export function planMessages(S: State, now = new Date()): Msg[] {
  const L = NTXT[S.lang] || NTXT.sv; const t = (x: string) => tr(S.lang, x);
  const n = streakNow(S), lit = litToday(S), due = dueKeys(S).length;
  const cur = ALLN.find(x => !S.done[x.id] && !adultLock(S, x) && !plusLock(S, x));
  const end = (x: string) => /[.!?؟…]$/.test(x) ? x : x + '.';
  const nextName = cur ? end(t(nodeName(cur))) : '';
  const vid = VIDEOS.find(v => !(S.vids || {})[v.id]);
  const triedSim = !!(S.sim?.trades?.length || S.simRec?.tries);
  const out: Msg[] = []; const add = (day: number, kind: string, [title, body]: [string, string], url: string) => out.push({ day, kind, title, body, url });
  const lesson = cur ? `/lesson?mode=node&id=${cur.id}` : '/practice';
  // I dag: bara om dagens lågan inte redan är tänd.
  if (!lit) {
    if (n > 0) add(0, 'streak', L.streak(n), lesson);
    else if (!S.lessons) add(0, 'start', L.start(), lesson);
    else if (due) add(0, 'review', L.review(due), '/lesson?mode=review');
    else if (cur) add(0, 'next', L.next(nextName), lesson);
  }
  // I morgon: svit om den lever, annars repetition eller nästa lektion.
  if (lit && n > 0) add(1, 'streak', L.streak(n), lesson);
  else if (due) add(1, 'review', L.review(due), '/lesson?mode=review');
  else if (cur) add(1, 'next', L.next(nextName), lesson);
  // Dag 2: något nytt att upptäcka.
  if (vid) add(2, 'video', L.video(end(t(vid.title))), `/video?id=${vid.id}`);
  else if (cur) add(2, 'next', L.next(nextName), lesson);
  // Dag 3: simulatorn för den som inte provat, annars nästa lektion.
  if (!triedSim) add(3, 'sim', L.sim(), '/sim');
  else if (cur) add(3, 'next', L.next(nextName), lesson);
  // Återkomst och sedan tystnad.
  add(5, 'miss', L.miss(), due ? '/lesson?mode=review' : lesson);
  add(8, 'last', L.last(), '/');
  return out;
}

/** Avbryter gamla påminnelser och schemalägger nya. Anropas ofta, så den är billig och tyst vid fel. */
export async function reschedule(S: State) {
  try {
    await N.cancelAllScheduledNotificationsAsync();
    if (!S.grow?.push || !S.onb) return;
    if ((await pushPerm()) !== 'granted') return;
    if (Platform.OS === 'android') await N.setNotificationChannelAsync('reminders', { name: tr(S.lang, 'Påminnelser'), importance: N.AndroidImportance.DEFAULT });
    const hour = S.grow.hour ?? 19; const now = new Date();
    for (const m of planMessages(S, now)) {
      const d = new Date(now); d.setDate(d.getDate() + m.day); d.setHours(hour, m.day === 0 ? 0 : 3, 0, 0);
      if (d.getTime() < now.getTime() + 10 * 60e3) continue;
      await N.scheduleNotificationAsync({
        content: { title: m.title, body: m.body, data: { url: m.url, kind: m.kind }, ...(Platform.OS === 'android' ? { channelId: 'reminders' } : {}) },
        trigger: { type: N.SchedulableTriggerInputTypes.DATE, date: d, ...(Platform.OS === 'android' ? { channelId: 'reminders' } : {}) },
      });
    }
  } catch { /* påminnelser är en bonus, aldrig något som får krascha appen */ }
}

/** Lyssnar på tryck på en påminnelse och öppnar rätt skärm. Returnerar en städfunktion. */
export function onOpen(go: (url: string, kind: string, id: string) => void): () => void {
  try {
    N.getLastNotificationResponseAsync().then((r: any) => { const d = r?.notification?.request?.content?.data; if (d?.url) go(String(d.url), String(d.kind || ''), String(r.notification.request.identifier || '')); }).catch(() => { });
    const sub = N.addNotificationResponseReceivedListener((r: any) => { const d = r?.notification?.request?.content?.data; if (d?.url) go(String(d.url), String(d.kind || ''), String(r.notification.request.identifier || '')); });
    return () => { try { sub.remove(); } catch { } };
  } catch { return () => { }; }
}
