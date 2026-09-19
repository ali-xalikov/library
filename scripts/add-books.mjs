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

const ROWS = [
  { title: "Hayvonot olamining katta ensiklopediyasi", author: "Tuzuvchilar jamoasi (O'zbekiston milliy ensiklopediyasi)", note: 'Maktab kutubxonasi nashri, bir necha nusxa', cat: 'Ensiklopediya' },
  { title: 'Dunyo shaharlari', author: 'Tuzuvchilar jamoasi', note: 'Ensiklopedik nashr', cat: 'Ensiklopediya' },
  { title: 'Texnikaning katta ensiklopediyasi', author: 'Tuzuvchilar jamoasi', note: 'Bir necha nusxa', cat: 'Ensiklopediya' },
  { title: 'Boburnoma', author: 'Zahiriddin Muhammad Bobur', note: 'Klassik asar, bir necha nusxa', cat: 'Adabiyot' },
  { title: 'Alpomish', author: "O'zbek xalq dostoni", note: "Xalq og'zaki ijodi", cat: 'Adabiyot' },
  { title: "Qutadg'u bilig", author: 'Yusuf Xos Hojib', note: 'Turkiy adabiyot klassikasi', cat: 'Adabiyot' },
  { title: "O'zbek udumlari", author: 'Tuzuvchilar jamoasi', note: '—', cat: 'Adabiyot' },
  { title: 'Xamsa', author: 'Alisher Navoiy', note: 'Bir necha jild / nusxa', cat: 'Adabiyot' },
  { title: "O'zbek xalq maqollari", author: 'Tuzuvchilar jamoasi', note: 'Bir necha nusxa', cat: 'Adabiyot' },
  { title: "Go'ro'g'li", author: "O'zbek xalq dostoni", note: 'Bir necha nusxa', cat: 'Adabiyot' },
  { title: "XX asr o'zbek hikoyasi antologiyasi", author: 'Tuzuvchilar jamoasi', note: 'Antologiya', cat: 'Adabiyot' },
  { title: 'Shaytanat (seriya)', author: 'Tohir Malik', note: "Ko'p jildli roman, bir necha nusxa", cat: 'Adabiyot' },
  { title: "O'zbek tilining izohli lug'ati", author: 'Tahrir hay’ati (A. Madvaliyev va boshq.)', note: 'Ko‘p jildli (A–D, E–K, L–P, Q–S, T–V, X–Ch)', cat: "Lug'at" },
  { title: "O'zbekiston tarixi", author: 'Tuzuvchilar jamoasi', note: "Ko'p jildli (I, IV, V, VI, VII, IX, X, XI va b.)", cat: 'Tarix' },
  { title: 'Tom Soyerining boshidan kechirganlari', author: 'Mark Twain', note: 'Tarjima, maktab nashri', cat: 'Adabiyot' },
  { title: 'Suv ostida sakson ming kilometr', author: 'Jules Verne (Jyul Vern)', note: 'Tarjima', cat: 'Adabiyot' },
  { title: "Oq so'yloq", author: 'Jack London (Jek London)', note: 'Tarjima, bir necha nusxa', cat: 'Adabiyot' },
  { title: 'Qobusnoma', author: 'Kaykovus', note: 'Klassik asar', cat: 'Adabiyot' },
  { title: 'Robinson Kruzoning hayoti va ajoyib sarguzashtlari', author: 'Daniel Defoe', note: 'Tarjima', cat: 'Adabiyot' },
  { title: 'Rus adabiyoti asarlari (seriya)', author: 'A.S. Pushkin, L.N. Tolstoy, A.P. Chexov, M. Gorkiy va b.', note: 'Qora-qizil muqovali, raqamlangan jildlar', cat: 'Adabiyot' },
];

const multi = (note) => /bir necha nusxa/i.test(note) ? 3 : 1;

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

if (!APPLY) {
  console.log('=== DRY RUN: qo\'shiladigan kitoblar ===');
  for (const r of ROWS) {
    const copies = multi(r.note);
    console.log(`  "${r.title}" | ${r.author} | ${r.cat} | x${copies}`);
  }
  console.log(`\n  Jami: ${ROWS.length} ta kitob`);
  process.exit(0);
}

for (const r of ROWS) {
  const copies = multi(r.note);
  const body = {
    title: r.title,
    author: r.author,
    subject: r.cat,
    category: r.cat,
    grade: [8, 9, 10, 11],
    grades: [8, 9, 10, 11],
    language: "O'zbek",
    totalCopies: copies,
    availableCopies: copies,
    status: 'available',
    shelfNumber: 'A-3',
    description: `${r.title} — ${r.note}.`,
    coverSearchUrl: `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(r.title + ' kitob muqovasi')}`,
    sourceUrl: `https://books.google.com/books?q=${encodeURIComponent(r.title)}`,
  };
  const created = await api('/books', { method: 'POST', body: JSON.stringify(body) });
  const id = Array.isArray(created) ? created[0].id : created.id;
  const inv = String(id).padStart(6, '0');
  await api(`/books/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ inventoryNumber: `LIB-${inv}`, qrCode: `LIB-${inv}` }),
  });
  console.log(`CREATE #${id} "${r.title}" | x${copies} | LIB-${inv}`);
}