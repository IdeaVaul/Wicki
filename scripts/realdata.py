"""Hämtar riktiga historiska dagsljus till lektionerna (src/data/real.ts).
Körs av GitHub Actions (.github/workflows/realdata.yml). Källor: Stooq (index, aktier, råvaror, valutor) och Binance (krypto)."""
import csv, io, json, urllib.request, datetime as dt

UA = {'User-Agent': 'Mozilla/5.0 (Wicki data job)'}
def get(url):
    return urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=40).read().decode()

def stooq(sym):
    rows = list(csv.reader(io.StringIO(get(f'https://stooq.com/q/d/l/?s={sym}&i=d'))))[1:]
    return [(r[0], float(r[1]), float(r[2]), float(r[3]), float(r[4])) for r in rows if len(r) >= 5 and r[4] not in ('', 'null')]

def binance(sym, start):
    out = []; t = int(dt.datetime.fromisoformat(start).replace(tzinfo=dt.timezone.utc).timestamp() * 1000)
    while True:
        a = json.loads(get(f'https://api.binance.com/api/v3/klines?symbol={sym}&interval=1d&startTime={t}&limit=1000'))
        if not a: break
        out += [(dt.datetime.utcfromtimestamp(k[0] / 1000).strftime('%Y-%m-%d'), float(k[1]), float(k[2]), float(k[3]), float(k[4])) for k in a]
        t = a[-1][0] + 864e5
        if len(a) < 1000: break
    return out

# id, namn, källa, symbol, från, till
SETS = [
    ('omx', 'OMXS30', 'stooq', '^omxs', '2023-01-01', '2026-12-31'),
    ('spx', 'S&P 500', 'stooq', '^spx', '2023-01-01', '2026-12-31'),
    ('spx2020', 'S&P 500 (coronakraschen)', 'stooq', '^spx', '2019-11-01', '2020-09-30'),
    ('aapl', 'Apple', 'stooq', 'aapl.us', '2023-06-01', '2026-12-31'),
    ('tsla', 'Tesla', 'stooq', 'tsla.us', '2023-06-01', '2026-12-31'),
    ('nvda', 'Nvidia', 'stooq', 'nvda.us', '2023-06-01', '2026-12-31'),
    ('gold', 'Guld', 'stooq', 'xauusd', '2023-06-01', '2026-12-31'),
    ('eurusd', 'EUR/USD', 'stooq', 'eurusd', '2023-06-01', '2026-12-31'),
    ('btc', 'Bitcoin', 'binance', 'BTCUSDT', '2023-06-01', '2026-12-31'),
    ('eth', 'Ethereum', 'binance', 'ETHUSDT', '2023-06-01', '2026-12-31'),
    ('btc2021', 'Bitcoin (toppen 2021)', 'binance', 'BTCUSDT', '2021-01-01', '2021-12-31'),
]
out = []
for sid, name, src, sym, a, b in SETS:
    try:
        rows = stooq(sym) if src == 'stooq' else binance(sym, a)
        rows = [r for r in rows if a <= r[0] <= b][-420:]
        if len(rows) < 60: print('för få', sid, len(rows)); continue
        dec = 4 if rows[-1][4] < 10 else 2
        out.append({'id': sid, 'name': name, 'src': 'Stooq' if src == 'stooq' else 'Binance', 'dates': [r[0] for r in rows], 'cs': [[round(x, dec) for x in r[1:]] for r in rows]})
        print('ok', sid, len(rows), rows[0][0], rows[-1][0])
    except Exception as e:
        print('fel', sid, e)
ts = '/** Riktiga historiska dagsljus [öppning, högsta, lägsta, stängning]. Genereras av scripts/realdata.py (GitHub Actions). Hämtad ' + dt.date.today().isoformat() + '. */\n'
ts += 'export type RealSet = { id: string; name: string; src: string; dates: string[]; cs: number[][] };\n'
ts += 'export const REAL: RealSet[] = ' + json.dumps(out, ensure_ascii=False, separators=(',', ':')) + ';\n'
open('src/data/real.ts', 'w').write(ts)
print('skrev', len(out), 'serier')
