export const shuffle = <T,>(a: T[]): T[] => { for (let i = a.length - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };
export const pick = <T,>(a: T[]): T => a[(Math.random() * a.length) | 0];
export const range = (n: number) => [...Array(n).keys()];
export const ri = (a: number, b: number) => a + ((Math.random() * (b - a + 1)) | 0);
export const kr = (n: number) => { const s = (Math.round(n * 100) / 100).toString().split('.'); s[0] = s[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' '); return s.join(','); };
export const day = (d: Date) => { const z = new Date(d.getTime() - d.getTimezoneOffset() * 6e4); return z.toISOString().slice(0, 10); };
export const today = () => day(new Date());
export const yday = () => day(new Date(Date.now() - 864e5));
export const addDays = (n: number) => day(new Date(Date.now() + n * 864e5));
