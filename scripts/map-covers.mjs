import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

let BASE_URL = 'https://1a40451337cdbc1f.mokky.dev';
try {
  const env = readFileSync(join(ROOT, '.env'), 'utf8');
  const m = env.match(/VITE_MOKKY_BASE_URL\s*=\s*(.+)/);
  if (m) BASE_URL = m[1].trim();
} catch {}

const APPLY = process.argv.includes('--apply');

async function api(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`${options.method ?? 'GET'} ${path} -> ${res.status}: ${body.slice(0, 200)}`);
  }
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

const norm = (s) =>
  String(s ?? '')
    .toLowerCase()
    .replace(/['’‘`"]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const src = readFileSync('./scripts/apply-covers.mjs', 'utf8');
const arrMatch = src.match(/const COVERS = \[([\s\S]*?)\n\];/);
const COVERS = [...arrMatch[1].matchAll(/'([^']+)'/g)].map((x) => x[1]);
const COVERS_UNIQ = [...new Set(COVERS)];

const mapMatch = src.match(/const MAPPING = \{([\s\S]*?)\n\};/);
const MAPPING = [...mapMatch[1].matchAll(/:\s*'([^']+)'/g)].map((x) => x[1]);

const HINTS = [
  ['otmishdan', 'otmishdan ertaklar'],
  ['oz-yurtingdan', 'oz yurtingdan ayrilma'],
  ['robinzon', 'robinzon kruzo'],
  ['men-aldagan', 'men anglagan hayot'],
  ['saratonda', 'saratonda qor yogdi'],
  ['tilla-uzuk', 'tilla uzuk'],
  ['ilinj', 'ilinj'],
  ['aljabir', 'aljabrning tugilishi'],
  ['adabiyot-muallimi', 'adabiyot muallimi'],
  ['tinchlikni', 'tinchlikni uluglaymiz'],
  ['vrungel', 'kapitan vrungelning sarguzashtlari'],
  ['besh-bolali', 'besh bolali yigitcha'],
  ['alpomish', 'alpomish'],
  ['zumrad', 'zumrad va qimmat'],
  ['jannati', 'jannati odamlar'],
  ['olmos', 'olmos kamar'],
  ['buvamni', 'buvamni soginib'],
  ['erk', 'erk'],
  ['aloviddin', 'aloviddinning sehrli chirogi'],
  ['odil', 'odil hokim'],
  ['yer-va-el', 'yer va el'],
  ['jinoyat', 'jinoyat va jazo'],
  ['erkagi', 'erkagi bor uy'],
  ['qobusz', 'qobusnoma'],
];

const books = await api('/books');
const byNorm = new Map();
for (const b of books) {
  const k = norm(b.title);
  if (!byNorm.has(k)) byNorm.set(k, []);
  byNorm.get(k).push(b);
}

/* 1) MAPPING orqali avval qo'yilgan (title bo'yicha aniq) — ularni saqlaymiz */
const verifiedMapping = new Map(); /* url -> [ids] */
for (const url of MAPPING) {
  const hits = books.filter((b) => b.coverImage === url);
  if (hits.length) verifiedMapping.set(url, hits.map((b) => b.id));
}

/* 2) COVERS slug orqali title'ga aniq moslashuvchilar */
const slugMatched = [];
const used = new Set();
for (const url of COVERS_UNIQ) {
  const slug = url.split('?')[0].split('/').pop().replace(/\.(jpg|jpeg|png|webp|gif)$/i, '').toLowerCase();
  let found = null;
  for (const [hint, titleKey] of HINTS) {
    if (slug.includes(hint)) {
      const cands = byNorm.get(titleKey) ?? [];
      found = cands.find((b) => !used.has(b.id)) ?? null;
      if (found) break;
    }
  }
  if (found) {
    slugMatched.push({ id: found.id, title: found.title, url, slug: slug.slice(0, 40) });
    used.add(found.id);
  }
}

const slugIds = new Set(slugMatched.map((m) => String(m.id)));
const mappingIds = new Set([...verifiedMapping.values()].flat().map(String));

/* 3) Yakuniy qaror */
const KEEP = new Set(slugIds);
for (const id of mappingIds) KEEP.add(id);

const withCover = books.filter((b) => b.coverImage);
const keepList = withCover.filter((b) => KEEP.has(String(b.id)));
const clearList = withCover.filter((b) => !KEEP.has(String(b.id)) && String(b.id) !== '117');

console.log(`=== SAQLANADI (aniq mos): ${keepList.length} ta ===`);
for (const b of [...keepList].sort((a, b) => a.id - b.id)) console.log(`  #${b.id} "${b.title}"`);

console.log(`\n=== O'CHIRILADI (tartib bilan tushgan, mos emas): ${clearList.length} ta ===`);
for (const b of [...clearList].sort((a, b) => a.id - b.id)) console.log(`  #${b.id} "${b.title}"`);

const noCover = books.filter((b) => !b.coverImage);
console.log(`\n=== Hozirda coversiz: ${noCover.length} ta (o'zgarmaydi) ===`);
for (const b of [...noCover].sort((a, b) => a.id - b.id).slice(0, 999))
  console.log(`  #${b.id} "${b.title}"`);

if (APPLY) {
  let set = 0, cleared = 0;
  /* Slug-aniglarini yangilab qo'yamiz (uning coversi boshqa URL bo'lsa) */
  for (const m of slugMatched) {
    const b = books.find((bk) => String(bk.id) === String(m.id));
    if (b && b.coverImage !== m.url) {
      await api(`/books/${m.id}`, { method: 'PATCH', body: JSON.stringify({ coverImage: m.url }) });
      set++;
      console.log(`  SET #${m.id} <- ${m.slug}...`);
    }
  }
  for (const b of clearList) {
    await api(`/books/${b.id}`, { method: 'PATCH', body: JSON.stringify({ coverImage: '' }) });
    cleared++;
    console.log(`  CLEAR #${b.id} "${b.title}"`);
  }
  console.log(`\n=== Yakun: ${set} yangilandi, ${cleared} tozalandi ===`);
}