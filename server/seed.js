import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { connect, col, ensureCounter, close } from "./db.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const SEED_FILE = path.join(__dirname, "data", "seed.json");

const SEED_COLLECTIONS = [
  "users",
  "profiles",
  "books",
  "categories",
  "settings",
  "borrows",
  "reservations",
  "notifications",
  "chat",
  "ratings",
];

function readSeed() {
  if (!fs.existsSync(SEED_FILE)) return null;
  return JSON.parse(fs.readFileSync(SEED_FILE, "utf8"));
}

function maxId(items) {
  return items.reduce((m, item) => Math.max(m, Number(item.id) || 0), 0);
}

export async function seedIfEmpty({ force = false } = {}) {
  const seed = readSeed();
  if (!seed) {
    console.log("[seed] seed.json topilmadi, boshlash o'tkazib yuborildi.");
    return;
  }

  for (const name of SEED_COLLECTIONS) {
    const items = seed[name] ?? [];
    const existing = await col(name).countDocuments();

    if (!force && existing > 0) {
      const max = maxId(items);
      if (items.length > 0) await ensureCounter(name, max);
      continue;
    }

    if (items.length === 0) continue;

    await col(name).deleteMany({});
    for (const item of items) {
      const copy = { ...item };
      delete copy._id;
      await col(name).insertOne(copy);
    }
    await ensureCounter(name, maxId(items));
    console.log(`[seed] ${name}: ${items.length} ta yozildi`);
  }
}

const isDirect = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);

if (isDirect) {
  const force = process.argv.includes("--force");
  connect()
    .then(async () => {
      await seedIfEmpty({ force });
      const total = await col("books").countDocuments();
      console.log(`[seed] Tayyor. Jami kitoblar: ${total}`);
    })
    .catch((err) => {
      console.error("[seed] Xatolik:", err.message);
      process.exitCode = 1;
    })
    .finally(() => close());
}