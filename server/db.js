import crypto from "node:crypto";

const { MongoClient } = await import("mongodb");

export const COLLECTIONS = [
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

export const DATABASE_NAME =
  process.env.MONGODB_DB || "school_library";

export const MONGO_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017";

let client = null;
let db = null;

export async function connect() {
  if (db) return db;
  client = new MongoClient(MONGO_URI);
  await client.connect();
  db = client.db(DATABASE_NAME);

  for (const name of [...COLLECTIONS, "users", "sessions", "_counters"]) {
    if (!(await db.listCollections({ name }).hasNext())) {
      await db.createCollection(name);
    }
  }

  await db.collection("users").createIndex({ email: 1 }, { unique: true });
  await db.collection("sessions").createIndex({ token: 1 }, { unique: true });
  await db.collection("sessions").createIndex({ userId: 1 });
  await db.collection("profiles").createIndex({ email: 1 }, { unique: true });
  for (const name of [...COLLECTIONS, "users"]) {
    await db.collection(name).createIndex({ id: 1 }, { unique: true });
  }

  return db;
}

export function col(name) {
  if (!db) throw new Error("MongoDB ulanmagan; avval connect() chaqiring");
  return db.collection(name);
}

function toNumber(raw) {
  const n = Number(raw);
  return Number.isFinite(n) ? n : raw;
}

/* ------------------------- Counter (auto-id) ------------------------ */

export async function nextId(collection) {
  const result = await col("_counters").findOneAndUpdate(
    { _id: collection },
    { $inc: { value: 1 } },
    { upsert: true, returnDocument: "after" }
  );
  return result.value.value;
}

export async function ensureCounter(collection, minValue) {
  const doc = await col("_counters").findOne({ _id: collection });
  if (!doc || (doc.value ?? 0) < minValue) {
    await col("_counters").updateOne(
      { _id: collection },
      { $set: { value: minValue } },
      { upsert: true }
    );
  }
}

/* ----------------------------- CRUD -------------------------------- */

export async function list(collection, query = {}) {
  return col(collection).find(query).toArray();
}

export async function findItem(collection, rawId) {
  return col(collection).findOne({ id: toNumber(rawId) });
}

export async function create(collection, payload) {
  try {
    const id = await nextId(collection);
    const item = { ...payload, id };
    await col(collection).insertOne(item);
    return item;
  } catch (err) {
    await ensureCounter(collection, 0);
    throw err;
  }
}

export async function update(collection, rawId, patch) {
  const result = await col(collection).findOneAndUpdate(
    { id: toNumber(rawId) },
    { $set: patch },
    { returnDocument: "after" }
  );
  return result.value ?? null;
}

export async function replace(collection, rawId, doc) {
  const result = await col(collection).findOneAndReplace(
    { id: toNumber(rawId) },
    { ...doc, id: toNumber(rawId) },
    { returnDocument: "after" }
  );
  return result.value ?? null;
}

export async function remove(collection, rawId) {
  const result = await col(collection).deleteOne({ id: toNumber(rawId) });
  return result.deletedCount > 0;
}

export async function filterBy(collection, predicate) {
  const items = await list(collection);
  return items.filter(predicate);
}

/* --------------------------- Auth / sessions ------------------------ */

export async function createToken(userId) {
  const token = crypto.randomBytes(24).toString("hex");
  await col("sessions").insertOne({ token, userId });
  return token;
}

export async function getUserByToken(token) {
  const session = await col("sessions").findOne({ token });
  if (!session) return null;
  return col("users").findOne({ id: toNumber(session.userId) });
}

export async function findUserByEmail(email) {
  const normalized = String(email ?? "").trim().toLowerCase();
  const user = await col("users").findOne({ email: normalized });
  if (user) return user;
  return col("users")
    .find({})
    .toArray()
    .then((users) =>
      users.find(
        (u) => String(u.email ?? "").trim().toLowerCase() === normalized
      )
    );
}

export async function findUserById(rawId) {
  return col("users").findOne({ id: toNumber(rawId) });
}

export async function getCounters() {
  const docs = await col("_counters").find().toArray();
  const out = {};
  for (const d of docs) out[d._id] = d.value;
  return out;
}

export async function close() {
  if (client) await client.close();
  client = null;
  db = null;
}