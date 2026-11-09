import React, { useEffect, useRef, useState } from 'react';
import { Modal, Pressable, View } from 'react-native';
import { useStore } from '../store';
import { T } from './kit';
import { Enter, Ripple } from './motion';
import { track } from '../analytics';

/** Tips som pekar på en riktig knapp (som TipKit), visas en gång och bara när knappen finns på skärmen.
 *  Regler: kort text, i den ordning man använder appen, och först när det finns något att visa. */
let busy = false; // högst ett tips åt gången i hela appen
export function Tip({ id, show, text, children, below = true }: { id: string; show: boolean; text: string; children: React.ReactNode; below?: boolean }) {
  const { S, c, update } = useStore(); const ref = useRef<any>(null);
  const seen = !!S.grow?.seen?.['tip_' + id]; const [box, setBox] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  useEffect(() => {
    if (!show || seen || busy || !S.onb) return;
    const h = setTimeout(() => { if (busy) return; ref.current?.measureInWindow((x: number, y: number, w: number, hh: number) => { if (!w || !hh) return; busy = true; setBox({ x, y, w, h: hh }); track('tip_show', { id }); }); }, 900);
    return () => clearTimeout(h);
  }, [show, seen, S.onb]); // eslint-disable-line react-hooks/exhaustive-deps
  const done = () => { busy = false; setBox(null); update(s => { s.grow = s.grow || {}; s.grow.seen = { ...(s.grow.seen || {}), ['tip_' + id]: 1 }; }); };
  const pad = 8;
  return <View ref={ref} collapsable={false}>
    {children}
    <Modal visible={!!box} transparent animationType="fade" onRequestClose={done}>
      {box ? <Pressable style={{ flex: 1 }} onPress={done} accessibilityLabel={text}>
        {/* Mörkt runt om, hål över knappen */}
        <View style={{ position: 'absolute', left: 0, right: 0, top: 0, height: Math.max(0, box.y - pad), backgroundColor: 'rgba(2,6,5,0.72)' }} />
        <View style={{ position: 'absolute', left: 0, right: 0, top: box.y + box.h + pad, bottom: 0, backgroundColor: 'rgba(2,6,5,0.72)' }} />
        <View style={{ position: 'absolute', left: 0, width: Math.max(0, box.x - pad), top: box.y - pad, height: box.h + pad * 2, backgroundColor: 'rgba(2,6,5,0.72)' }} />
        <View style={{ position: 'absolute', left: box.x + box.w + pad, right: 0, top: box.y - pad, height: box.h + pad * 2, backgroundColor: 'rgba(2,6,5,0.72)' }} />
        <View style={{ position: 'absolute', left: box.x - pad, top: box.y - pad, width: box.w + pad * 2, height: box.h + pad * 2, borderRadius: 16, borderWidth: 2, borderColor: c.pri, alignItems: 'center', justifyContent: 'center' }}>
          <Ripple size={Math.max(box.w, box.h) + pad * 2} color={c.pri} /></View>
        <Enter from="scale" style={{ position: 'absolute', left: 20, right: 20, ...(below ? { top: box.y + box.h + pad + 14 } : { bottom: undefined, top: Math.max(40, box.y - pad - 110) }) }}>
          <View style={{ backgroundColor: c.surface, borderRadius: 18, padding: 14, gap: 6, borderWidth: 1, borderColor: c.pri }}>
            <T w="b" s={15.5}>{text}</T><T w="b" s={13} c={c.pri}>Okej</T></View>
        </Enter>
      </Pressable> : null}
    </Modal>
  </View>;
}
