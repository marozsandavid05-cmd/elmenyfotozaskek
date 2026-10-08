# Képek előkészítése az ügyfél-anyagból (egy kép egy helyen).
# Futtatás: python tools/kepek.py  (Pillow kell)
# Kimenet: media/<nev>-<szelesseg>.webp, és media/kepek.json a méretekkel.
import os, json
from PIL import Image

SRC = os.path.join(os.path.dirname(__file__), '..', '..', 'ugyfel-anyag', 'kepek')
OUT = os.path.join(os.path.dirname(__file__), '..', 'media')

K = {
  # főoldal
  'h-gala': '031-rendezvenyfotozas-elmenyfotozas-hu.webp',
  'h-zene': '043-rendezvenyfotozas-elmenyfotozas-hu.webp',
  'h-tuz': '009-rendezvenyfotozas-elmenyfotozas-hu.webp',
  'h-divat': '033-rendezvenyfotozas-elmenyfotozas-hu.webp',
  'h-fogadas': 'MOL-rendezvenyfotok-48.webp',
  'p-pixie': 'Pixie-2000x2000-1.webp',
  'p-ai': 'AI-PRO-1-1.webp',
  'p-box': 'Selfiebox-galeria-02.webp',
  'p-foto': '027-rendezvenyfotozas-elmenyfotozas-hu.webp',
  'f-pixie-csapat': 'Pixie-rendezvenyen-10.webp',
  'f-nyomat': 'Selfiebox-galeria-08.webp',
  'f-este': 'MOL-rendezvenyfotok-30.webp',
  'f-zaro': 'MOL-rendezvenyfotok-49.webp',
  # pixie
  'x-allo': 'Pixie-9-16.webp',
  'x-beszel': 'Pixie-rendezvenyen-01.webp',
  'x-nobu-1': 'Pixie-a-Nobu-etteremben-01.webp',
  'x-nobu-2': 'Pixie-a-Nobu-etteremben-02.webp',
  'x-nobu-3': 'Pixie-a-Nobu-etteremben-03.webp',
  'x-nobu-4': 'Pixie-a-Nobu-etteremben-04.webp',
  'x-nobu-5': 'Pixie-a-Nobu-etteremben-05.webp',
  'x-nobu-6': 'Pixie-a-Nobu-etteremben-06.webp',
  'x-nobu-7': 'Pixie-a-Nobu-etteremben-07.webp',
  'x-kint-1': 'Pixie-rendezvenyen-07.webp',
  'x-kint-2': 'Pixie-rendezvenyen-03.webp',
  'x-kint-3': 'Pixie-rendezvenyen-08.webp',
  'x-kint-4': 'Pixie-rendezvenyen-09.webp',
  # ai selfie
  'a-allvany': 'AI-PRO-02-FHD.webp',
  'a-hos': 'ai-selfie-pro-01.webp',
  'a-vampir': 'ai-selfie-pro-02.webp',
  'a-telefon': '2151033638.webp',
  # selfiebox
  's-csoport': 'Selfiebox-galeria-07.webp',
  's-maszk': 'Selfiebox-galeria-06.webp',
  's-erintes': 'Selfiebox-galeria-12.webp',
  's-szamlalo': 'Selfiebox-galeria-13.webp',
  's-qr': 'Selfiebox-galeria-05.webp',
  's-eskuvo': 'Selfiebox-galeria-09.webp',
  's-g1': 'Selfiebox-galeria-01.webp',
  's-g2': 'Selfiebox-galeria-03.webp',
  's-g3': 'Selfiebox-galeria-11.webp',
  's-g4': 'Selfiebox-galeria-14.webp',
  's-g5': 'Selfiebox-1920x780-1.webp',
  's-helyszin': 'Selfiebox-galeria-10.webp',
  # rendezvényfotózás
  'r-vitorla': '039-rendezvenyfotozas-elmenyfotozas-hu.webp',
  'r-regatta': '012-rendezvenyfotozas-elmenyfotozas-hu.webp',
  'r-koncert': '005-rendezvenyfotozas-elmenyfotozas-hu.webp',
  'r-sushi': '021-rendezvenyfotozas-elmenyfotozas-hu.webp',
  'r-uszoda': '028-rendezvenyfotozas-elmenyfotozas-hu.webp',
  'r-kifuto': '032-rendezvenyfotozas-elmenyfotozas-hu.webp',
  'r-tomeg': '020-rendezvenyfotozas-elmenyfotozas-hu.webp',
  'r-kiserlet': '006-rendezvenyfotozas-elmenyfotozas-hu.webp',
  'r-portre': '019-rendezvenyfotozas-elmenyfotozas-hu.webp',
  'r-enek': 'MOL-rendezvenyfotok-40.webp',
  'r-tanc': 'MOL-rendezvenyfotok-41.webp',
  'r-torta': 'MOL-rendezvenyfotok-50.webp',
  'r-terem': 'MOL-rendezvenyfotok-11.webp',
  'r-hab': 'MOL-rendezvenyfotok-27.webp',
  'r-szivarvany': 'MOL-rendezvenyfotok-28.webp',
  'r-panel': '035-rendezvenyfotozas-elmenyfotozas-hu.webp',
  'r-bohoc': '037-rendezvenyfotozas-elmenyfotozas-hu.webp',
  'r-kuzdo': '025-rendezvenyfotozas-elmenyfotozas-hu.webp',
  'r-telefon': '014-rendezvenyfotozas-elmenyfotozas-hu.webp',
  'r-parti': '029-rendezvenyfotozas-elmenyfotozas-hu.webp',
  'r-hajo': '015-rendezvenyfotozas-elmenyfotozas-hu.webp',
  'r-zenekar': '034-rendezvenyfotozas-elmenyfotozas-hu.webp',
  'x-video': 'Pixie-1920_780.webp',
}
for i in range(1, 13):
    K[f'hatter-{i:02d}'] = f'{i:02d}-Elmenyfotozas-Hatterek.webp'

os.makedirs(OUT, exist_ok=True)
meta = {}
seen = set()
for nev, f in K.items():
    assert f not in seen, f'duplikált forrás: {f}'
    seen.add(f)
    im = Image.open(os.path.join(SRC, f))
    im = im.convert('RGBA') if nev == 'logo' else im.convert('RGB')
    w, h = im.size
    meta[nev] = {'w': w, 'h': h, 'src': f}
    widths = [1600, 800] if w > 1000 else [w]
    if nev.startswith('hatter'):
        widths = [800, 400]
    if nev == 'logo':
        widths = [w]
    outs = []
    for tw in widths:
        tw = min(tw, w)
        th = round(h * tw / w)
        r = im.resize((tw, th), Image.LANCZOS) if tw != w else im
        fn = f'{nev}-{tw}.webp'
        r.save(os.path.join(OUT, fn), 'WEBP', quality=80 if tw > 900 else 76, method=6)
        outs.append([fn, tw, th])
    meta[nev]['out'] = outs
json.dump(meta, open(os.path.join(OUT, 'kepek.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
tot = sum(os.path.getsize(os.path.join(OUT, x)) for x in os.listdir(OUT) if x.endswith('.webp'))
print(len(K), 'kép,', round(tot / 1024 / 1024, 1), 'MB')
