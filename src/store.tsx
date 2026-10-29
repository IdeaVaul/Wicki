import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Platform, useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import type { State } from './types';
import { DEFAULT, normalize } from './engine/state';
import { makeColors, type Colors } from './theme';
import { tr } from './i18n';

const KEY = 'wick.native.v1';
type Weight = 'm' | 'b' | 'x';
type Ctx = {
  S: State; ready: boolean; update: (fn: (s: State) => void) => void;
  c: Colors; dark: boolean; t: (s: string) => string; rtl: boolean; scale: number;
  font: (w?: Weight) => string; sys: boolean; buzz: (k: 'tap' | 'ok' | 'no' | 'done') => void;
};
const Store = createContext<Ctx>(null as any);
export const useStore = () => useContext(Store);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [S, setS] = useState<State>(DEFAULT);
  const [ready, setReady] = useState(false);
  const saveT = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => { AsyncStorage.getItem(KEY).then(v => { if (v) { try { setS(normalize(JSON.parse(v))); } catch { } } setReady(true); }).catch(() => setReady(true)); }, []);
  const update = useCallback((fn: (s: State) => void) => {
    setS(prev => {
      const n: State = JSON.parse(JSON.stringify(prev)); fn(n);
      if (saveT.current) clearTimeout(saveT.current);
      saveT.current = setTimeout(() => { AsyncStorage.setItem(KEY, JSON.stringify(n)).catch(() => { }); }, 250);
      return n;
    });
  }, []);
  const scheme = useColorScheme();
  const dark = S.theme === 'dark' || (S.theme === 'system' && scheme === 'dark');
  const value = useMemo<Ctx>(() => {
    const ar = S.lang === 'ar';
    const fam = ar ? 'IBMPlexSansArabic' : S.a.lex ? 'Lexend' : 'System';
    const font = (w: Weight = 'm') => {
      if (fam === 'IBMPlexSansArabic') return w === 'm' ? 'IBMPlexSansArabic_500Medium' : 'IBMPlexSansArabic_700Bold';
      if (fam === 'System') return Platform.OS === 'ios' ? 'System' : 'sans-serif';
      return fam + (w === 'm' ? '_500Medium' : w === 'b' ? '_700Bold' : '_800ExtraBold');
    };
    const quiet = !S.haptics;
    return {
      S, ready, update, dark, c: makeColors(dark, { hc: S.hc, a: S.a }), t: (s: string) => tr(S.lang, s), rtl: ar,
      scale: S.big ? 1.18 : 1, font, sys: fam === 'System',
      buzz: k => { if (quiet) return; try {
        if (k === 'ok' || k === 'done') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        else if (k === 'no') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        else Haptics.selectionAsync();
      } catch { } },
    };
  }, [S, ready, update, dark]);
  return <Store.Provider value={value}>{children}</Store.Provider>;
}
