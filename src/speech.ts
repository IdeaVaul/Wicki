import * as Speech from 'expo-speech';
import type { Lang } from './types';
import { TTS_LANG } from './i18n';
import { femaleVoice } from './voice';
const clean = (t: string) => String(t).replace(/[\p{Extended_Pictographic}‍️⃣]/gu, '').replace(/[↔➗➕〰]/g, ' ').replace(/\s+/g, ' ').trim();
export function speak(text: string, lang: Lang) { try { Speech.stop(); const s = clean(text); if (s) Speech.speak(s, { language: TTS_LANG[lang], voice: femaleVoice(lang), rate: 0.95 }); } catch { } }
export function hush() { try { Speech.stop(); } catch { } }
