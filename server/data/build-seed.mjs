import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const COLLECTIONS = [
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

function read(name) {
  const file = path.join(__dirname, `${name}.json`);
  if (!fs.existsSync(file)) return [];
  const raw = fs.readFileSync(file, "utf8");
  if (!raw.trim()) return [];
  return JSON.parse(raw);
}

const data = {};
for (const name of COLLECTIONS) data[name] = read(name);

const demoPassword = "demo123";

const users = data.profiles.map((p, index) => ({
  id: p.user_id ?? p.id ?? index + 1,
  fullName: `${p.firstName ?? ""} ${p.lastName ?? ""}`.trim(),
  email: p.email,
  password: demoPassword,
  role: p.role ?? "student",
}));

const counters = {};
for (const name of COLLECTIONS) {
  const maxId = data[name].reduce((m, item) => Math.max(m, Number(item.id) || 0), 0);
  counters[name] = maxId;
}
const maxUserId = users.reduce((m, u) => Math.max(m, Number(u.id) || 0), 0);
counters.users = maxUserId;

const db = {
  users,
  sessions: [],
  profiles: data.profiles,
  books: data.books,
  categories: data.categories,
  settings: data.settings,
  borrows: data.borrows,
  reservations: data.reservations,
  notifications: data.notifications,
  chat: data.chat,
  ratings: data.ratings,
  counters,
};

const out = path.join(__dirname, "seed.json");
fs.writeFileSync(out, JSON.stringify(db, null, 2), "utf8");

console.log("seed.json yozildi");
console.log(`  users: ${db.users.length}`);
for (const name of COLLECTIONS) console.log(`  ${name}: ${db[name].length}`);
console.log(`  counters: ${JSON.stringify(counters)}`);