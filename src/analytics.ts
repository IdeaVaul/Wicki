import { Platform } from 'react-native';
import { CONFIG } from './config';

/** Statistik (PostHog) och kraschrapporter (Sentry) via deras vanliga HTTP-API, utan extra paket så att allt fungerar i Expo Go.
 *  Inget skickas förrän användaren sagt ja, och inget skickas som pekar ut personen: bara ett slumpat id, språk och åldersgrupp. */
const st = { ok: false, did: '', lang: 'sv', age: '', plus: false, screen: '' };
let queue: Record<string, unknown>[] = []; let timer: ReturnType<typeof setTimeout> | null = null;

export function setTelemetry(o: { ok: boolean; did: string; lang: string; age?: string; plus?: boolean }) {
  st.ok = !!o.ok && !!o.did; st.did = o.did; st.lang = o.lang; st.age = o.age || ''; st.plus = !!o.plus;
  if (!st.ok) queue = [];
}
export const newId = () => 'w' + Date.now().toString(36) + Math.random().toString(36).slice(2, 10);

function flush() {
  timer = null; if (!queue.length || !CONFIG.posthogKey || !st.ok) { queue = []; return; }
  const batch = queue; queue = [];
  fetch(CONFIG.posthogHost.replace(/\/$/, '') + '/batch/', { method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ api_key: CONFIG.posthogKey, batch }) }).catch(() => { });
}
/** Logga en händelse, t.ex. track('lesson_done', { unit: 3 }). */
export function track(event: string, props: Record<string, unknown> = {}) {
  if (!st.ok || !CONFIG.posthogKey) return;
  queue.push({ event, distinct_id: st.did, timestamp: new Date().toISOString(),
    properties: { ...props, $lib: 'wicki-rn', $os: Platform.OS, $screen_name: st.screen || undefined, lang: st.lang, age_group: st.age || undefined, plus: st.plus, $process_person_profile: false } });
  if (!timer) timer = setTimeout(flush, 4000);
  if (queue.length >= 20) { if (timer) clearTimeout(timer); flush(); }
}
export function screen(name: string) { if (name === st.screen) return; st.screen = name; track('$screen', { $screen_name: name }); }

/** Sentry: skicka ett fel som "envelope". */
function dsn() { const m = /^https:\/\/([^@]+)@([^/]+)\/(\d+)$/.exec(CONFIG.sentryDsn.trim()); return m ? { key: m[1], host: m[2], id: m[3] } : null; }
const frames = (stack?: string) => (stack || '').split('\n').slice(0, 40).map(l => l.trim()).filter(Boolean).reverse().map(l => {
  const m = /^(?:at )?(.*?)[@ (]+(.*?):(\d+):(\d+)\)?$/.exec(l); return m ? { function: m[1] || '?', filename: m[2], lineno: +m[3], colno: +m[4] } : { function: l };
});
export function reportError(err: unknown, extra: Record<string, unknown> = {}, fatal = false) {
  const d = dsn(); if (!st.ok || !d) return;
  const e = err instanceof Error ? err : new Error(String(err));
  const id = Array.from({ length: 32 }, () => '0123456789abcdef'[Math.floor(Math.random() * 16)]).join('');
  const ev = { event_id: id, timestamp: Date.now() / 1000, platform: 'javascript', level: fatal ? 'fatal' : 'error', release: CONFIG.release,
    environment: __DEV__ ? 'development' : 'preview', user: { id: st.did }, tags: { os: Platform.OS, lang: st.lang, screen: st.screen, plus: String(st.plus) }, extra,
    exception: { values: [{ type: e.name, value: e.message, stacktrace: { frames: frames(e.stack) }, mechanism: { type: fatal ? 'onerror' : 'generic', handled: !fatal } }] } };
  const body = JSON.stringify({ event_id: id, sent_at: new Date().toISOString() }) + '\n' + JSON.stringify({ type: 'event' }) + '\n' + JSON.stringify(ev);
  fetch(`https://${d.host}/api/${d.id}/envelope/?sentry_key=${d.key}&sentry_version=7`, { method: 'POST', headers: { 'Content-Type': 'application/x-sentry-envelope' }, body }).catch(() => { });
  track('app_error', { message: e.message.slice(0, 120), fatal });
}
/** Fånga ohanterade fel i hela appen. Anropas en gång vid start. */
let hooked = false;
export function hookErrors() {
  if (hooked) return; hooked = true;
  const EU = (globalThis as any).ErrorUtils; if (!EU?.getGlobalHandler) return;
  const prev = EU.getGlobalHandler();
  EU.setGlobalHandler((e: unknown, fatal?: boolean) => { try { reportError(e, {}, !!fatal); flush(); } catch { } prev?.(e, fatal); });
}
