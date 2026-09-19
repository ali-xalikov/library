import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { CATALOG } from './data/catalog.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

let BASE_URL = 'https://1a40451337cdbc1f.mokky.dev';
try {
  const env = readFileSync(join(ROOT, '.env'), 'utf8');
  const m = env.match(/VITE_MOKKY_BASE_URL\s*=\s*(.+)/);
  if (m) BASE_URL = m[1].trim();
} catch {
  /* default */
}

const APPLY = process.argv.includes('--apply');

const norm = (s) =>
  String(s ?? '')
    .toLowerCase()
    .replace(/[’'`]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const toks = (s) => norm(s).split(' ').filter(Boolean);

function editDist(a, b) {
  if (a === b) return 0;
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)]);
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
    }
  }
  return dp[m][n];
}

function tokenSimilarity(aToks, bToks) {
  const used = new Set();
  let matched = 0;
  for (const ta of aToks) {
    let best = null, bestD = 4;
    bToks.forEach((tb, i) => {
      if (used.has(i)) return;
      if (ta === tb) { best = { i, d: 0 }; bestD = 0; return; }
      const d = editDist(ta, tb);
      if (d <= bestD) { best = { i, d }; bestD = d; }
    });
    if (best && bestD <= 1) { matched++; used.add(best.i); }
  }
  const denom = Math.min(aToks.length, bToks.length) || 1;
  return matched / denom;
}

function bigramSim(a, b) {
  const g = (s) => {
    const out = new Map();
    for (let i = 0; i < s.length - 1; i++) {
      const k = s.slice(i, i + 2);
      out.set(k, (out.get(k) ?? 0) + 1);
    }
    return out;
  };
  const ga = g(a), gb = g(b);
  let inter = 0;
  for (const [k, v] of ga) inter += Math.min(v, gb.get(k) ?? 0);
  const total = [...ga.values()].reduce((x, y) => x + y, 0) + [...gb.values()].reduce((x, y) => x + y, 0);
  return total ? (2 * inter) / total : 0;
}

/* Aniq belgilangan maxsus holatlar: db title norm -> catalog index (0-based) */
const OVERRIDES = {
  'tarbiya kitobi 1 2 3 4': 0,
  'voy onajonimcholiqushi': 107,
  'abdulla qahhor o tmishdan ertaklar': 30,
  'asqatrtog tomonlarda': 52,
  'graf monte kristo': 26,
  'robindranat tagor aka uka': 28,
  'otkir xoshimov hikoyalar': 24,
  'saylanma uzb': 20,
  'saylanma 2': 23,
  'ruskie skazki': 63,
  '30 shagov russkomu yaziku': 78,
  'robinzon kruzoning hayoti va sarguzashtlari': 74,
  'nafs kishanlari': 95,
  "o tkan kunlar": 118,
  'arab xalq ertaklari': 127,
  'yuragimga yaqin kishilar': 130,
  'olmos kamar': 131,
  'sen bahorni sog inmadingmi': 134,
  "jilg alar qoshigi": 137,
  "aloviddinning sehrli chirogi": 142,
  'uzbek xalq maqollari': 144,
  'alvido guzallik': 147,
};

/* Duplikat kitoblar (shaharlik kuyov x2, baliqchi x2, kichkina shahzoda x2)
   va katalogda yo'qlari (qish xalovati, bobomni sog'inib) MIN_SCORE tufayli
   avtomatik yo'q qilinadi — EXCLUDE kerak emas. */

const MIN_SCORE = 0.5;

async function api(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`${options.method ?? 'GET'} ${path} -> ${res.status}: ${body.slice(0, 200)}`);
  }
  if (res.status === 204) return null;
  const text = await res.text();
  if (!text) return null;
  return JSON.parse(text);
}

const books = await api('/books');
const bookToks = books.map((b) => toks(b.title));

const usedCat = new Set();
const usedBook = new Set();
const assignment = []; /* {book, catIndex, score, exact} */

for (let bi = 0; bi < books.length; bi++) {
  const dbNorm = norm(books[bi].title);
  if (OVERRIDES[dbNorm] !== undefined && !usedCat.has(OVERRIDES[dbNorm])) {
    const ci = OVERRIDES[dbNorm];
    if (!usedBook.has(bi)) {
      assignment.push({ book: bi, catIndex: ci, score: 1, exact: false, override: true });
      usedCat.add(ci); usedBook.add(bi);
      continue;
    }
  }
  let best = -1, bestScore = 0;
  for (let ci = 0; ci < CATALOG.length; ci++) {
    if (usedCat.has(ci)) continue;
    const a = bookToks[bi], b = toks(CATALOG[ci].title);
    const scored =
      0.5 * tokenSimilarity(a, b) +
      0.3 * tokenSimilarity(b, a) +
      0.2 * bigramSim(norm(books[bi].title), norm(CATALOG[ci].title));
    if (scored > bestScore) { best = ci; bestScore = scored; }
  }
  if (best >= 0 && bestScore >= MIN_SCORE) {
    assignment.push({ book: bi, catIndex: best, score: bestScore, exact: false });
    usedCat.add(best); usedBook.add(bi);
  }
}

const report = assignment
  .slice()
  .sort((x, y) => x.book - y.book);

console.log('=== MOSLASHUV ===');
let patched = 0;
for (const r of report) {
  const b = books[r.book];
  const c = CATALOG[r.catIndex];
  const flag = r.override ? ' [OVERRIDE]' : r.exact ? ' [exact]' : '';
  console.log(`#${String(r.book + 1).padStart(3)}  ${r.score.toFixed(3)}${flag}  "${b.title}"  -->  "${c.title}" | ${c.author}`);
  if (APPLY) {
    await api(`/books/${b.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ title: c.title, author: c.author }),
    });
    patched++;
  }
}

const unmatchedBooks = books.filter((_, i) => !usedBook.has(i));
const unmatchedCat = CATALOG.map((c, i) => ({ ...c, i })).filter((c) => !usedCat.has(c.i));

console.log(`\n=== NATIJA: ${report.length} mos, ${APPLY ? `PATCH ${patched} ta kitob` : 'dry-run'} ===`);
console.log('\n-- Mos kelmagan DB kitoblar --');
for (const b of unmatchedBooks) console.log(`  #${b.id} "${b.title}"`);
console.log('\n-- Katalogda ortib qolgan qatorlar --');
for (const c of unmatchedCat) console.log(`  [${c.i + 1}] "${c.title}" | ${c.author}`);

/* ===== APPLY: dublikatlarni nusxa soni bilan birlashtirish, o'chirish, yangilarini qo'shish ===== */
if (APPLY) {
  const res = await api('/books');
  const now = new Map(res.map((b) => [String(b.id), b]));

  /* (saqlanadigan id, o'chiriladigan id) */
  const MERGES = [
    [25, 76],
    [49, 93],
    [100, 129],
  ];
  for (const [keepId, delId] of MERGES) {
    const keep = now.get(String(keepId));
    const del = now.get(String(delId));
    if (!keep || !del) {
      console.log(`SKIP merge #${keepId}<-#${delId} (topilmadi)`);
      continue;
    }
    const total = (keep.totalCopies ?? 1) + (del.totalCopies ?? 1);
    const avail = (keep.availableCopies ?? 1) + (del.availableCopies ?? 1);
    await api(`/books/${keepId}`, {
      method: 'PATCH',
      body: JSON.stringify({ totalCopies: total, availableCopies: avail }),
    });
    await api(`/books/${delId}`, { method: 'DELETE' });
    console.log(`MERGE #${delId} -> #${keepId}: totalCopies=${total}, availableCopies=${avail}`);
  }

  for (const delId of [123, 134]) {
    await api(`/books/${delId}`, { method: 'DELETE' });
    console.log(`DELETE #${delId}`);
  }

  const NEW_BOOKS = [1, 2, 3, 108].map((ci) => ({
    title: CATALOG[ci].title,
    author: CATALOG[ci].author,
    subject: 'Adabiyot',
    category: 'Adabiyot',
    grade: [8, 9, 10, 11],
    grades: [8, 9, 10, 11],
    language: "O'zbek",
    totalCopies: 1,
    availableCopies: 1,
    status: 'available',
    shelfNumber: 'A-1',
    description: `${CATALOG[ci].title} — maktab kutubxonasi fondidagi kitob.`,
  }));
  for (const nb of NEW_BOOKS) {
    const created = await api('/books', {
      method: 'POST',
      body: JSON.stringify(nb),
    });
    const id = Array.isArray(created) ? created[0].id : created.id;
    const inv = String(id).padStart(6, '0');
    await api(`/books/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ inventoryNumber: `LIB-${inv}`, qrCode: `LIB-${inv}` }),
    });
    console.log(`CREATE "${nb.title}" id=${id} LIB-${inv}`);
  }
}