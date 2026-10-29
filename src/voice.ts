import * as Speech from 'expo-speech';
import type { Lang } from './types';
import { TTS_LANG } from './i18n';

/** Väljer en kvinnlig röst per språk (samma lista som webben). Faller tillbaka på enhetens standardröst. */
const FEM = /female|kvinna|alva|klara|sofie|hillevi|astrid|samantha|karen|serena|kate|moira|tessa|fiona|libby|sonia|maisie|aria|jenny|emma|amélie|amelie|audrey|marie|aurélie|denise|eloise|julie|céline|celine|laila|mariam|zariyah|salma|hala|amina|lana|fatima|zira|hazel|susan/i;
const MALE = /\bmale\b|oskar|mattias|daniel|thomas|arthur|oliver|ryan|guy|henri|maged|majed|naayf|hamed|tarik|shakir|david|mark|george|james|alex\b|fred\b/i;
const cache: Partial<Record<Lang, string | null>> = {};
let all: Speech.Voice[] | null = null;
export async function warmVoices() { try { if (!all) all = await Speech.getAvailableVoicesAsync(); } catch { all = []; } return all; }
export function femaleVoice(lang: Lang): string | undefined {
  if (lang in cache) return cache[lang] || undefined;
  if (!all) { warmVoices(); return undefined; }
  const L = TTS_LANG[lang]; const norm = (v: Speech.Voice) => (v.language || '').replace('_', '-');
  const same = all.filter(v => norm(v).slice(0, 2) === L.slice(0, 2)); const exact = same.filter(v => norm(v) === L);
  const fem = (a: Speech.Voice[]) => a.filter(v => FEM.test(v.name || v.identifier) && !MALE.test((v.name || '').replace(/female/i, '')));
  const best = (a: Speech.Voice[]) => a.find(v => String(v.quality) === 'Enhanced') || a[0];
  const v = best(fem(exact)) || best(fem(same)) || best(exact.filter(x => !MALE.test(x.name || x.identifier))) || best(same.filter(x => !MALE.test(x.name || x.identifier)));
  cache[lang] = v ? v.identifier : null; return cache[lang] || undefined;
}
warmVoices();
