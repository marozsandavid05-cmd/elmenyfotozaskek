// Élményfotózás weboldal build (Node, függőség nélkül)
// Futtatás a weboldal mappából:  node tools/build.mjs
// src/<oldal>.html -> <oldal>.html a gyökérben, közös fejjel, navval, lábléccel.
// Első sor a forrásban: <!--{"title":"...","desc":"...","nav":"pixie","dark":true,"body":"p-pixie"}-->
// Kép: <img data-k="kulcs" alt="..." [sizes="..."] [data-lcp]> -> src, srcset, width, height, lazy.
// Ikon: {{i:arrow}}  ·  Egy kép egy hely: a build hibát ad, ha egy kulcs kétszer szerepel (kivétel: data-dup).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(ROOT, 'src');
const meta = JSON.parse(fs.readFileSync(path.join(ROOT, 'media', 'kepek.json'), 'utf8'));
const V = '1';
const SITE = 'https://elmenyfotozas.hu';

const ICON = {};
for (const f of fs.readdirSync(path.join(ROOT, 'tools', 'ikonok'))) {
  const svg = fs.readFileSync(path.join(ROOT, 'tools', 'ikonok', f), 'utf8').trim()
    .replace('<svg ', '<svg aria-hidden="true" focusable="false" ');
  ICON[f.replace('.svg', '')] = svg;
}

const NAV = [
  ['pixie', 'pixie.html', 'Pixie'],
  ['ai', 'ai-selfie.html', 'AI Selfie'],
  ['box', 'selfiebox.html', 'Selfiebox'],
  ['hatter', 'hatterek.html', 'Hátterek'],
  ['foto', 'rendezvenyfotozas.html', 'Rendezvényfotózás'],
  ['tudni', 'tudnivalok.html', 'Tudnivalók'],
];

function head(m, file) {
  const clean = file === 'index.html' ? '/' : '/' + file.replace('.html', '');
  return `<!DOCTYPE html>
<html lang="hu">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<script>(function(d,s){var q=location.search;try{if(/motion=1/.test(q))s.setItem('motion','1');if(/motion=0/.test(q))s.removeItem('motion');if(s.getItem('motion')==='1')d.classList.add('motion-on')}catch(e){}d.classList.add('js')})(document.documentElement,window.sessionStorage)</script>
<title>${m.title}</title>
<meta name="description" content="${m.desc}">
${m.noindex ? '<meta name="robots" content="noindex">' : ''}
<link rel="canonical" href="${SITE}${clean}">
<meta property="og:type" content="website">
<meta property="og:locale" content="hu_HU">
<meta property="og:site_name" content="Élményfotózás">
<meta property="og:title" content="${m.title}">
<meta property="og:description" content="${m.desc}">
<meta property="og:url" content="${SITE}${clean}">
${m.og ? `<meta property="og:image" content="${SITE}/media/${m.og}">` : ''}
<meta name="theme-color" content="#0C0D0F">
<link rel="icon" href="favicon.ico" sizes="any">
<link rel="icon" type="image/png" href="favicon-48.png" sizes="48x48">
<link rel="apple-touch-icon" href="apple-touch-icon.png">
<link rel="stylesheet" href="css/fonts.css?v=${V}">
<link rel="stylesheet" href="js/vendor/lenis.css">
<link rel="stylesheet" href="css/main.css?v=${V}">
${m.ld ? `<script type="application/ld+json">${JSON.stringify(m.ld)}</script>` : ''}
</head>
<body class="${m.body || ''}">
<a class="skip" href="#tartalom">Ugrás a tartalomra</a>`;
}

function nav(m) {
  const li = NAV.map(([k, h, t]) => `<li><a href="${h}"${m.nav === k ? ' aria-current="page"' : ''}>${t}</a></li>`).join('');
  const mli = [['home', 'index.html', 'Főoldal'], ...NAV, ['aj', 'ajanlatkeres.html', 'Ajánlatkérés']]
    .map(([k, h, t]) => `<li><a href="${h}"${m.nav === k ? ' aria-current="page"' : ''}>${t}</a></li>`).join('');
  return `
<header class="nav${m.dark ? ' nav--dark' : ''}" data-nav>
  <a class="nav__brand" href="index.html" aria-label="Élményfotózás, főoldal">
    <img class="lg-l" src="media/logo-vilagos.webp" alt="" width="658" height="125">
    <img class="lg-d" src="media/logo-sotet.webp" alt="" width="658" height="125">
  </a>
  <nav aria-label="Fő navigáció"><ul class="nav__links">${li}</ul></nav>
  <a class="btn nav__cta" href="ajanlatkeres.html">Ajánlatkérés</a>
  <button class="nav__burger" type="button" aria-expanded="false" aria-controls="menu" aria-label="Menü megnyitása"><span></span><span></span></button>
</header>
<div class="menu" id="menu" aria-label="Menü">
  <nav aria-label="Mobil navigáció"><ul>${mli}</ul></nav>
  <div class="menu__foot mono">
    <a href="tel:+36203192116">+36 20 319 21 16</a>
    <a href="tel:+36703700030">+36 70 370 00 30</a>
    <a href="mailto:hello@elmenyfotozas.hu">hello@elmenyfotozas.hu</a>
  </div>
</div>`;
}

const FOOT = `
<footer class="foot night">
  <div class="wrap">
    <div class="foot__top">
      <div>
        <h2>Hívj, és segítünk választani</h2>
        <p class="foot__call"><a href="tel:+36203192116">+36 20 319 21 16</a><a href="tel:+36703700030">+36 70 370 00 30</a></p>
        <a class="foot__mail tlink" href="mailto:hello@elmenyfotozas.hu">hello@elmenyfotozas.hu</a>
      </div>
      <div>
        <h2>Szolgáltatások</h2>
        <ul>
          <li><a href="pixie.html">Pixie, a selfierobot</a></li>
          <li><a href="ai-selfie.html">AI Selfie</a></li>
          <li><a href="selfiebox.html">Selfiebox</a></li>
          <li><a href="rendezvenyfotozas.html">Rendezvényfotózás</a></li>
          <li><a href="hatterek.html">Hátterek</a></li>
        </ul>
      </div>
      <div>
        <h2>Tervezéshez</h2>
        <ul>
          <li><a href="tudnivalok.html">Technikai tudnivalók</a></li>
          <li><a href="ajanlatkeres.html">Ajánlatkérés</a></li>
          <li><a href="adatkezeles.html">Adatkezelési tájékoztató</a></li>
        </ul>
        <div class="social">
          <a href="https://www.facebook.com/elmenyfotozas" target="_blank" rel="noopener" aria-label="Élményfotózás a Facebookon">{{i:facebook-logo}}</a>
          <a href="https://www.instagram.com/elmenyfotozashu/" target="_blank" rel="noopener" aria-label="Élményfotózás az Instagramon">{{i:instagram-logo}}</a>
          <a href="https://www.youtube.com/@elmenyfotozas" target="_blank" rel="noopener" aria-label="Élményfotózás a YouTube-on">{{i:youtube-logo}}</a>
        </div>
      </div>
    </div>
    <div class="foot__bottom">
      <span>Élményfotózás · Megapixel Design Kft. · 1172 Budapest, Hártya utca 16/A/2</span>
      <a href="adatkezeles.html">Adatkezelési tájékoztató</a>
    </div>
  </div>
</footer>`;

function scripts(m) {
  return `
<script src="js/vendor/gsap.min.js" defer></script>
<script src="js/vendor/ScrollTrigger.min.js" defer></script>
<script src="js/vendor/lenis.min.js" defer></script>
<script src="js/core.js?v=${V}" defer></script>
<script src="js/motion.js?v=${V}" defer></script>
</body>
</html>
`;
}

const used = new Map();
function expandImg(html, file) {
  return html.replace(/<img data-k="([^"]+)"([^>]*)>/g, (all, key, rest) => {
    const k = meta[key];
    if (!k) throw new Error(`${file}: ismeretlen kép-kulcs ${key}`);
    const dup = /data-dup/.test(rest);
    if (!dup) {
      if (used.has(key)) throw new Error(`${file}: a(z) ${key} kép már szerepel itt: ${used.get(key)}`);
      used.set(key, file);
    }
    const outs = k.out;
    const small = outs[outs.length - 1];
    const big = outs[0];
    const lcp = /data-lcp/.test(rest);
    let attrs = rest.replace(/\sdata-lcp/, '').replace(/\sdata-dup/, '');
    const srcset = outs.length > 1 ? ` srcset="${outs.map(o => `media/${o[0]} ${o[1]}w`).join(', ')}"` : '';
    const sizes = outs.length > 1 && !/sizes=/.test(attrs) ? ' sizes="(max-width: 860px) 100vw, 50vw"' : '';
    const load = lcp ? ' fetchpriority="high" decoding="async"' : (/loading=/.test(attrs) ? '' : ' loading="lazy" decoding="async"');
    const src = lcp || outs.length === 1 ? big : small;
    return `<img src="media/${src[0]}"${srcset}${sizes} width="${big[1]}" height="${big[2]}"${attrs}${load}>`;
  });
}

const pages = fs.readdirSync(SRC).filter(f => f.endsWith('.html'));
const sitemap = [];
for (const f of pages) {
  let raw = fs.readFileSync(path.join(SRC, f), 'utf8');
  const mm = raw.match(/^<!--(\{[\s\S]*?\})-->\s*/);
  if (!mm) throw new Error(`${f}: hiányzik a meta-sor`);
  const m = JSON.parse(mm[1]);
  let body = raw.slice(mm[0].length);
  body = expandImg(body, f);
  let out = head(m, f) + nav(m) + `\n<main id="tartalom">\n` + body + `\n</main>` + (m.nofoot ? '' : FOOT) + scripts(m);
  out = out.replace(/\{\{i:([a-z-]+)\}\}/g, (a, n) => { if (!ICON[n]) throw new Error(`ikon: ${n}`); return ICON[n]; });
  fs.writeFileSync(path.join(ROOT, f), out.replace(/\r\n/g, '\n'));
  if (!m.noindex) sitemap.push(f === 'index.html' ? '/' : '/' + f.replace('.html', ''));
}
fs.writeFileSync(path.join(ROOT, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemap.map(u => `  <url><loc>${SITE}${u}</loc></url>`).join('\n')}\n</urlset>\n`);
fs.writeFileSync(path.join(ROOT, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${SITE}/sitemap.xml\n`);
const unused = Object.keys(meta).filter(k => !used.has(k));
console.log(`${pages.length} oldal kész. Felhasznált kép: ${used.size}. Nem használt: ${unused.join(', ') || 'nincs'}`);
