import React, { useState } from 'react';
import { RefreshControl } from 'react-native';
import { useStore } from '../store';
import { useAccount } from '../account/Account';

/** Dra ner för att uppdatera, som i alla stora appar. Hämtar kontots framsteg om man är inloggad och kör ev. extra (t.ex. nytt tips). */
export function useRefresh(extra?: () => void, offset = 0) {
  const { c, buzz } = useStore(); const acc = useAccount(); const [on, setOn] = useState(false);
  const onRefresh = async () => {
    setOn(true); buzz('tap'); extra?.();
    const t0 = Date.now(); await acc.refresh();
    const left = 700 - (Date.now() - t0); if (left > 0) await new Promise(r => setTimeout(r, left));
    setOn(false);
  };
  return <RefreshControl refreshing={on} onRefresh={onRefresh} tintColor={c.pri} colors={[c.pri]} progressBackgroundColor={c.surface} progressViewOffset={offset} />;
}
