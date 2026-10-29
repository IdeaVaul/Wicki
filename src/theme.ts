import type { A11y, ColorKey } from './types';
const light = {
  bg: '#F3F7F5', surface: '#FFFFFF', sunk: '#E9F0ED', ink: '#0E1715', muted: '#5C6B66', line: 'rgba(10,30,25,0.10)',
  pri: '#13B877', priD: '#0E935F', priSoft: 'rgba(19,184,119,0.12)', up: '#13B877', upD: '#0E8A59', upSoft: 'rgba(19,184,119,0.12)',
  down: '#E5384A', downD: '#C42536', downSoft: 'rgba(229,56,74,0.10)', gold: '#F2B630', goldD: '#A9780A', goldSoft: 'rgba(242,182,48,0.15)',
  violet: '#7C4DFF', violetD: '#6236E0', coral: '#F06A3A', coralD: '#C04E22', ice: '#2FA8E8',
  lock: '#E3EAE7', lockD: '#D3DCD8', lockInk: '#8A9893', on: '#FFFFFF', hl: 'rgba(19,184,119,0.12)',
  glass: '#FFFFFF', glassB: 'rgba(10,30,25,0.09)', track: 'rgba(10,30,25,0.08)', bub: '#FFFFFF', bubB: 'rgba(19,184,119,0.45)',
  tabbg: 'rgba(255,255,255,0.94)', heroA: '#E6F7EF', heroB: '#D5F2E4', glow: 'rgba(19,184,119,0.10)',
};
const dark: typeof light = {
  bg: '#070C0B', surface: '#111917', sunk: '#16201E', ink: '#F3F6F5', muted: '#93A09B', line: 'rgba(255,255,255,0.085)',
  pri: '#2FE39A', priD: '#1CB97A', priSoft: 'rgba(47,227,154,0.13)', up: '#2FE39A', upD: '#22C585', upSoft: 'rgba(47,227,154,0.13)',
  down: '#FF4D5E', downD: '#FF6B79', downSoft: 'rgba(255,77,94,0.13)', gold: '#FFC83D', goldD: '#F0B323', goldSoft: 'rgba(255,200,61,0.13)',
  violet: '#A27BFF', violetD: '#8A5CF6', coral: '#FF8A5C', coralD: '#E66B3D', ice: '#5CC8FF',
  lock: '#1B2422', lockD: '#141B19', lockInk: '#6F7C78', on: '#03150D', hl: 'rgba(47,227,154,0.14)',
  glass: 'rgba(255,255,255,0.045)', glassB: 'rgba(255,255,255,0.09)', track: 'rgba(255,255,255,0.09)', bub: '#0E1D18', bubB: 'rgba(47,227,154,0.38)',
  tabbg: 'rgba(16,23,21,0.92)', heroA: '#0F2620', heroB: '#0A1512', glow: 'rgba(47,227,154,0.16)',
};
export type Colors = typeof light;
export function makeColors(isDark: boolean, o: { hc?: boolean; a?: A11y }): Colors {
  const c = { ...(isDark ? dark : light) };
  if (o.hc) { c.muted = isDark ? '#D5DCE8' : '#323A50'; c.line = isDark ? '#7383A3' : '#7F8BA3'; c.glassB = c.line; }
  if (o.a?.tint && !isDark) { c.bg = '#FBF5E6'; c.surface = '#FFFAEE'; c.sunk = '#F3EBD6'; c.glass = '#FFFAEE'; }
  if (o.a?.cb) { c.up = '#0B8F6A'; c.upD = '#06684C'; c.down = '#D55E00'; c.downD = '#9E4500'; }
  return c;
}
export const colorOf = (c: Colors, k: ColorKey) => c[k];
