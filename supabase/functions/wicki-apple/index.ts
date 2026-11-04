// Wicki: Logga in med Apple. Sparar Apples refresh token vid inloggning och återkallar den när kontot raderas (App Store 5.1.1(v)).
// Hemligheter: APPLE_TEAM_ID, APPLE_KEY_ID, APPLE_PRIVATE_KEY (innehållet i .p8-filen), valfri APPLE_CLIENT_ID (standard com.bahradine.wick).
const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type', 'Access-Control-Allow-Methods': 'POST, OPTIONS' };
const json = (b: unknown, status = 200) => new Response(JSON.stringify(b), { status, headers: { ...cors, 'Content-Type': 'application/json' } });
const URL_ = Deno.env.get('SUPABASE_URL')!, SR = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const CLIENT = Deno.env.get('APPLE_CLIENT_ID') || 'com.bahradine.wick';

const b64u = (b: ArrayBuffer | Uint8Array | string) => {
  const u = typeof b === 'string' ? new TextEncoder().encode(b) : new Uint8Array(b as ArrayBuffer);
  let s = ''; u.forEach(x => s += String.fromCharCode(x)); return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};
async function clientSecret(): Promise<string | null> {
  const team = Deno.env.get('APPLE_TEAM_ID'), kid = Deno.env.get('APPLE_KEY_ID'), pem = Deno.env.get('APPLE_PRIVATE_KEY');
  if (!team || !kid || !pem) return null;
  const der = Uint8Array.from(atob(pem.replace(/-----[^-]+-----/g, '').replace(/\\n|\s/g, '')), c => c.charCodeAt(0));
  const key = await crypto.subtle.importKey('pkcs8', der, { name: 'ECDSA', namedCurve: 'P-256' }, false, ['sign']);
  const now = Math.floor(Date.now() / 1000);
  const data = b64u(JSON.stringify({ alg: 'ES256', kid })) + '.' + b64u(JSON.stringify({ iss: team, iat: now, exp: now + 300, aud: 'https://appleid.apple.com', sub: CLIENT }));
  const sig = await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, key, new TextEncoder().encode(data));
  return data + '.' + b64u(sig);
}
const db = (path: string, init: RequestInit = {}) => fetch(`${URL_}/rest/v1/${path}`, { ...init, headers: { apikey: SR, Authorization: `Bearer ${SR}`, 'Content-Type': 'application/json', ...(init.headers || {}) } });

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  try {
    const u = await fetch(`${URL_}/auth/v1/user`, { headers: { apikey: SR, Authorization: req.headers.get('Authorization') || '' } });
    if (!u.ok) return json({ error: 'auth' }, 401);
    const uid = (await u.json()).id as string;
    const body = await req.json().catch(() => ({}));
    const secret = await clientSecret(); if (!secret) return json({ ok: false, error: 'nokey' });
    if (body.action === 'store' && typeof body.code === 'string') {
      const r = await fetch('https://appleid.apple.com/auth/token', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ client_id: CLIENT, client_secret: secret, code: body.code, grant_type: 'authorization_code' }) });
      const j = await r.json().catch(() => ({}));
      if (!j.refresh_token) return json({ ok: false, error: 'apple ' + r.status });
      await db('wicki_apple_tokens', { method: 'POST', headers: { Prefer: 'resolution=merge-duplicates' }, body: JSON.stringify({ user_id: uid, refresh_token: j.refresh_token }) });
      return json({ ok: true });
    }
    if (body.action === 'revoke') {
      const r = await db(`wicki_apple_tokens?user_id=eq.${uid}&select=refresh_token`); const rows = await r.json().catch(() => []);
      const tok = rows?.[0]?.refresh_token; if (!tok) return json({ ok: true, none: true });
      const rv = await fetch('https://appleid.apple.com/auth/revoke', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ client_id: CLIENT, client_secret: secret, token: tok, token_type_hint: 'refresh_token' }) });
      if (rv.ok) await db(`wicki_apple_tokens?user_id=eq.${uid}`, { method: 'DELETE' });
      return json({ ok: rv.ok });
    }
    return json({ error: 'bad request' }, 400);
  } catch (e) { return json({ error: String(e).slice(0, 200) }, 500); }
});
