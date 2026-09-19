import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const BACKUP_DIR = 'C:\\Users\\Rudy\\AppData\\Local\\Temp\\opencode\\mokky-backup';

let BASE_URL = 'https://1a40451337cdbc1f.mokky.dev';
try {
  const env = readFileSync(join(ROOT, '.env'), 'utf8');
  const m = env.match(/VITE_MOKKY_BASE_URL\s*=\s*(.+)/);
  if (m) BASE_URL = m[1].trim();
} catch {
  /* default */
}

async function api(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`${res.status} ${text.slice(0, 300)}`);
  }
  return text ? JSON.parse(text) : null;
}

function toGradeArray(value) {
  if (Array.isArray(value)) {
    return value.map((v) => Number(v)).filter((n) => Number.isFinite(n));
  }
  if (value === null || value === undefined || typeof value !== 'string') return [];
  return value
    .split(/\s+/)
    .map((v) => Number(v))
    .filter((n) => Number.isFinite(n));
}

function buildNewBooks(books) {
  const mapping = new Map();
  const fresh = books.map((b, i) => {
    const newId = i + 1;
    mapping.set(String(b.id), String(newId));
    const { id: _oldId, grades: _oldGrades, ...rest } = b;
    const grade = toGradeArray(b.grade);
    return { id: newId, ...rest, grade, grades: grade };
  });
  return { fresh, mapping };
}

async function doApply() {
  const books = await api('/books');
  console.log(`Joriy kitoblar: ${books.length}`);

  const { fresh, mapping } = buildNewBooks(books);
  const payload = JSON.stringify(fresh);

  const staging = join(BACKUP_DIR, 'reseed-payload.json');
  writeFileSync(staging, payload, 'utf8');
  console.log(`Staging saqlandi: ${staging} (${fresh.length} ta)`);

  await api('/books', { method: 'PATCH', body: payload });
  console.log('PATCH /books -> kollektsiya almashtirildi');

  try {
    writeFileSync(
      join(BACKUP_DIR, 'id-mapping.json'),
      JSON.stringify(Object.fromEntries(mapping), null, 2),
      'utf8'
    );
  } catch { /* mapping fayl oshib ketishi mumkin */ }

  const verify = await api('/books');
  const numericAll = verify.every((b) => typeof b.id === 'number');
  console.log(`Tekshiruv: jami ${verify.length}, hammasi raqamli id: ${numericAll}`);

  const target = mapping.get('book-0149');
  if (target) {
    await api('/reservations/5', {
      method: 'PATCH',
      body: JSON.stringify({ bookId: target }),
    });
    console.log(`Reservation 5 -> bookId=${target} (eski book-0149)`);
  }

  if (verify.length > 0) {
    const first = verify[0];
    const probe = await api(`/books/${first.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ description: first.description ?? '' }),
    });
    console.log(`PATCH /books/${first.id} OK -> "${probe.title}"`);
    const got = await api(`/books/${first.id}`);
    console.log(`GET /books/${first.id} OK -> "${got.title}"`);
  }

  console.log('\nMUVAFFAQIYATLI. Eski string-id yozuvlar endi yo‘q, hech narsa o‘chirish shart emas.');
  console.log(`Bunday holda kitoblar: ${verify.length}`);
}

async function doRestore() {
  const path = join(BACKUP_DIR, 'books.json');
  if (!existsSync(path)) {
    console.error(`Backup topilmadi: ${path}`);
    process.exit(1);
  }
  const books = JSON.parse(readFileSync(path, 'utf8'));
  await api('/books', { method: 'PATCH', body: JSON.stringify(books) });
  console.log(`Restore qilindi: ${books.length} ta eski yozuv (string-id) qaytarildi.`);
}

async function main() {
  const cmd = process.argv[2];
  if (cmd === '--apply') return doApply();
  if (cmd === '--restore') return doRestore();

  const books = await api('/books');
  const { fresh, mapping } = buildNewBooks(books);
  console.log(`Joriy kitoblar: ${books.length}`);
  console.log(`Yangi array: ${fresh.length} ta, hammasi raqamli id 1..${fresh.length}`);
  console.log('\nNamunalar (dry-run — API ga yozilmaydi):');
  for (const b of fresh.slice(0, 3)) {
    console.log(
      `${String(b.id).padEnd(6)} "${b.title}" | grade=${JSON.stringify(b.grade)} | author=${b.author}`
    );
  }
  const bad = fresh.filter((b) => b.title === undefined || b.author === undefined);
  if (bad.length) console.log(`Diqqat: title/author yo‘q bo‘lganlar: ${bad.length}`);
  const gradeEmpty = fresh.filter((b) => b.grade.length === 0);
  console.log(`grade bo‘sh (uzgarmaydigan): ${gradeEmpty.length}/${fresh.length}`);
  console.log('\nQo‘llash uchun: node scripts/reseed-books.mjs --apply');
  console.log('Bekor qilish uchun: node scripts/reseed-books.mjs --restore');
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});