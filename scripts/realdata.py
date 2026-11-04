"""Hämtar riktiga historiska kurser till lektionerna (src/data/real.ts). Körs av GitHub Actions (.github/workflows/realdata.yml).
Bara källor som tillåter visning i appar:
- CoinGecko (krypto, OHLC). Kräver texten "Powered by CoinGecko" där datan visas.
- ECB:s referenskurser för valutor, direkt från ECB:s API. Kräver källangivelse "Source: ECB statistics". Bara dagliga stängningskurser,
  därför markeras de som linjegrafer (line: true) och ritas som linje, inte som påhittade ljus."""
import json, os, urllib.request, datetime as dt
UA = {'User-Agent': 'Wicki data job', 'Accept': 'application/json'}
KEY = os.environ.get('COINGECKO_API_KEY', '')
def get(url, extra=None):
    h = dict(UA); h.update(extra or {})
    return json.loads(urllib.request.urlopen(urllib.request.Request(url, headers=h), timeout=40).read().decode())
def cg_ohlc(coin, days):
    h = {'x-cg-demo-api-key': KEY} if KEY else {}
    a = get(f'https://api.coingecko.com/api/v3/coins/{coin}/ohlc?vs_currency=usd&days={days}', h)
    fmt = '%Y-%m-%d %H:%M' if days <= 30 else '%Y-%m-%d'
    return [(dt.datetime.utcfromtimestamp(k[0] / 1000).strftime(fmt), k[1], k[2], k[3], k[4]) for k in a]
def ecb(base, quote, days):
    """ECB:s egna API (data-api.ecb.europa.eu). Kurserna anges som quote per 1 EUR, så base måste vara EUR."""
    a = (dt.date.today() - dt.timedelta(days=days)).isoformat()
    url = f'https://data-api.ecb.europa.eu/service/data/EXR/D.{quote}.EUR.SP00.A?format=csvdata&startPeriod={a}'
    txt = urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': 'Wicki data job', 'Accept': 'text/csv'}), timeout=60).read().decode()
    import csv, io
    rows = list(csv.DictReader(io.StringIO(txt)))
    pts = sorted((r['TIME_PERIOD'], float(r['OBS_VALUE'])) for r in rows if r.get('OBS_VALUE'))
    out = []
    for i, (d, c) in enumerate(pts):
        o = pts[i - 1][1] if i else c
        out.append((d, o, max(o, c), min(o, c), c))
    return out
SETS = [
    ('btc30', 'Bitcoin (4h)', 'CoinGecko', lambda: cg_ohlc('bitcoin', 30), False),
    ('eth30', 'Ethereum (4h)', 'CoinGecko', lambda: cg_ohlc('ethereum', 30), False),
    ('sol30', 'Solana (4h)', 'CoinGecko', lambda: cg_ohlc('solana', 30), False),
    ('btc365', 'Bitcoin (4d)', 'CoinGecko', lambda: cg_ohlc('bitcoin', 365), False),
    ('eth365', 'Ethereum (4d)', 'CoinGecko', lambda: cg_ohlc('ethereum', 365), False),
    ('eurusd', 'EUR/USD', 'ECB', lambda: ecb('EUR', 'USD', 600), True),
    ('eursek', 'EUR/SEK', 'ECB', lambda: ecb('EUR', 'SEK', 600), True),
    ('eurgbp', 'EUR/GBP', 'ECB', lambda: ecb('EUR', 'GBP', 600), True),
]
out = []; errs = []
for sid, name, src, f, line in SETS:
    try:
        rows = f()[-420:]
        if len(rows) < 60: errs.append(f'{sid}: för få ({len(rows)})'); continue
        dec = 4 if rows[-1][4] < 10 else 2
        o = {'id': sid, 'name': name, 'src': src, 'dates': [r[0] for r in rows], 'cs': [[round(x, dec) for x in r[1:]] for r in rows]}
        if line: o['line'] = True
        out.append(o); print('ok', sid, len(rows))
    except Exception as e:
        errs.append(f'{sid}: {e}'); print('fel', sid, e)
ts = '/** Riktiga historiska kurser [öppning, högsta, lägsta, stängning]. Genereras av scripts/realdata.py (GitHub Actions). Hämtad ' + dt.date.today().isoformat() + '.\n *  Källor: CoinGecko (krypto, kräver "Powered by CoinGecko") och ECB (valutor, kräver "Source: ECB statistics"). line = bara stängningskurser, ritas som linje. */\n'
ts += '// fel: ' + ' | '.join(errs)[:2000].replace('\n', ' ') + '\n'
ts += 'export type RealSet = { id: string; name: string; src: string; dates: string[]; cs: number[][]; line?: boolean };\n'
ts += 'export const REAL: RealSet[] = ' + json.dumps(out, ensure_ascii=False, separators=(',', ':')) + ';\n'
open('src/data/real.ts', 'w').write(ts); print('skrev', len(out), 'serier')
