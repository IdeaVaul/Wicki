// Wicki AI: förklarar ett svar eller besvarar en fråga om trading, på användarens språk.
// Kräver inloggning (JWT). Högst 40 frågor per konto och dag. Nyckeln ANTHROPIC_API_KEY ligger som hemlighet i Supabase.
import { createClient } from 'npm:@supabase/supabase-js@2';

const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type', 'Access-Control-Allow-Methods': 'POST, OPTIONS' };
const LANG: Record<string, string> = { sv: 'svenska', en: 'English', fr: 'français', ar: 'العربية' };
const json = (b: unknown, status = 200) => new Response(JSON.stringify(b), { status, headers: { ...cors, 'Content-Type': 'application/json' } });

const SYSTEM = (lang: string, age: string) => `Du är Wicki, ett vänligt candlestick-ljus som lär ut trading i en utbildningsapp.
Svara på ${LANG[lang] || 'svenska'}. Skriv kort (högst 120 ord), enkelt och konkret, med ett litet räkne- eller grafexempel när det hjälper.
Regler:
- Du ger utbildning, aldrig investeringsråd. Säg aldrig vad användaren ska köpa eller sälja, och lova aldrig vinster.
- Om någon frågar om en specifik aktie, kryptovaluta eller ett köp: förklara hur man kan resonera, inte vad man ska göra.
- Lyft risk när det är relevant: de flesta som daytradar förlorar pengar, hävstång förstärker förluster.
- ${age === 'u16' || age === 'u18' ? 'Användaren är under 18. Föreslå aldrig hävstång, CFD:er eller konton utan vårdnadshavare.' : 'Anpassa nivån till en nybörjare.'}
- Om frågan inte handlar om pengar, trading eller ekonomi: svara vänligt att du bara kan hjälpa till med det.`;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  try {
    const auth = req.headers.get('Authorization') || '';
    const sb = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, { global: { headers: { Authorization: auth } } });
    const { data: u } = await sb.auth.getUser(); if (!u?.user) return json({ error: 'auth' }, 401);
    const key = Deno.env.get('ANTHROPIC_API_KEY'); if (!key) return json({ error: 'nokey' }, 503);
    const { data: ok } = await sb.rpc('wicki_ai_take', { lim: 40 }); if (!ok) return json({ error: 'limit' }, 429);
    const b = await req.json(); const lang = String(b.lang || 'sv'); const age = String(b.age || '');
    let prompt = '';
    if (b.mode === 'explain') {
      prompt = `Frågan i lektionen: ${String(b.q || '').slice(0, 600)}\nSvarsalternativ: ${(b.opts || []).slice(0, 6).join(' | ').slice(0, 600)}\nRätt svar: ${String(b.ans || '').slice(0, 200)}\nAnvändaren svarade: ${String(b.chosen || '').slice(0, 200)}\nAppens korta förklaring: ${String(b.why || '').slice(0, 600)}\n\nFörklara steg för steg varför det rätta svaret stämmer${b.chosen && b.chosen !== b.ans ? ' och varför användarens svar inte gör det' : ''}.`;
    } else {
      prompt = String(b.question || '').slice(0, 800);
      if (!prompt.trim()) return json({ error: 'empty' }, 400);
    }
    const r = await fetch('https://api.anthropic.com/v1/messages', { method: 'POST',
      headers: { 'x-api-key': key, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
      body: JSON.stringify({ model: Deno.env.get('WICKI_AI_MODEL') || 'claude-haiku-5-5', max_tokens: 450, system: SYSTEM(lang, age), messages: [{ role: 'user', content: prompt }] }) });
    if (!r.ok) return json({ error: 'upstream', status: r.status }, 502);
    const out = await r.json(); const text = (out.content || []).filter((c: { type: string }) => c.type === 'text').map((c: { text: string }) => c.text).join('\n').trim();
    return json({ text });
  } catch (e) { return json({ error: 'server', msg: String(e).slice(0, 200) }, 500); }
});
