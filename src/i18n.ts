import { DICT, RULES } from './data/i18n-data';
import { NATIVE_DICT } from './data/native-dict';
import { CDICT } from './data/course2';
import { SKIN_DICT } from './data/skin-dict';
import { YDICT } from './data/youth';
import { VDICT } from './data/videos';
import { SIM_DICT } from './data/sim-dict';
import { LV_DICT } from './data/lv-dict';
import { AUTH_DICT } from './data/auth-dict';
import { AGE_DICT } from './data/age-dict';
import { LEGAL_DICT } from './data/legal-dict';
for (const l of Object.keys(CDICT)) for (const k of Object.keys(CDICT[l])) if (DICT[l][k] == null) DICT[l][k] = CDICT[l][k];
for (const l of Object.keys(SKIN_DICT)) for (const k of Object.keys(SKIN_DICT[l])) if (DICT[l][k] == null) DICT[l][k] = SKIN_DICT[l][k];
for (const l of Object.keys(LEGAL_DICT)) for (const k of Object.keys(LEGAL_DICT[l])) if (DICT[l][k] == null) DICT[l][k] = LEGAL_DICT[l][k];
for (const l of Object.keys(AGE_DICT)) for (const k of Object.keys(AGE_DICT[l])) DICT[l][k] = AGE_DICT[l][k];
for (const l of Object.keys(AUTH_DICT)) for (const k of Object.keys(AUTH_DICT[l])) if (DICT[l][k] == null) DICT[l][k] = AUTH_DICT[l][k];
for (const l of Object.keys(LV_DICT)) for (const k of Object.keys(LV_DICT[l])) if (DICT[l][k] == null) DICT[l][k] = LV_DICT[l][k];
for (const l of Object.keys(SIM_DICT)) for (const k of Object.keys(SIM_DICT[l])) if (DICT[l][k] == null) DICT[l][k] = SIM_DICT[l][k];
for (const l of Object.keys(YDICT)) Object.assign(DICT[l], YDICT[l]);
for (const l of Object.keys(VDICT)) Object.assign(DICT[l], VDICT[l]);
for (const l of Object.keys(NATIVE_DICT)) Object.assign(DICT[l], NATIVE_DICT[l]);
import type { Lang } from './types';
export const LANGS: Record<Lang, string> = { sv: 'Svenska', en: 'English', fr: 'Français', ar: 'العربية' };
/** Översätter en svensk källsträng. Samma regler som webbversionen. */
export function tr(lang: Lang, t: string): string {
  if (lang === 'sv' || !t) return t;
  const d = DICT[lang]; if (!d) return t;
  if (d[t] != null) return d[t];
  const s = t.trim(); if (d[s] != null) return t.replace(s, d[s]);
  const pre = s.match(/^([^\p{L}\p{N}]+\s)(.+)$/u); if (pre) { const r = tr(lang, pre[2]); if (r !== pre[2]) return pre[1] + r; }
  for (const [re, rep] of RULES) {
    const m = s.match(re);
    if (m) {
      const r = rep[lang]; if (!r) return t;
      if (typeof r === 'function') return r(...m.slice(1));
      return r.replace(/\{(\d)\}/g, (_: string, i: string) => { const g = m[+i]; return d[g] != null ? d[g] : g; }).replace(/\$(\d)/g, (_: string, i: string) => m[+i]);
    }
  }
  return t;
}
export const TTS_LANG: Record<Lang, string> = { sv: 'sv-SE', en: 'en-GB', fr: 'fr-FR', ar: 'ar-SA' };
