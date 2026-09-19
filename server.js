import express from "express";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import multer from "multer";
import axios from "axios";
import * as cheerio from "cheerio";

import {
  connect,
  list,
  create,
  update,
  remove,
  findItem,
  createToken,
  getUserByToken,
  findUserByEmail,
  getCounters,
} from "./server/db.js";
import { seedIfEmpty } from "./server/seed.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json({ limit: "5mb" }));
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, Accept"
  );
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

/* ------------------------------------------------------------------ */
/*  Ommaviy statik papkalar                                            */
/* ------------------------------------------------------------------ */

app.use("/uploads", express.static(path.join(__dirname, "server", "uploads")));
app.use(express.static(path.join(__dirname, "public")));
if (fs.existsSync(path.join(__dirname, "dist"))) {
  app.use(express.static(path.join(__dirname, "dist")));
}

/* ------------------------------------------------------------------ */
/*  Autentifikatsiya (Mokky uslubida)                                 */
/* ------------------------------------------------------------------ */

function publicUser(user) {
  if (!user) return null;
  return { id: user.id, fullName: user.fullName, email: user.email };
}

function bearerToken(req) {
  const header = req.headers.authorization || "";
  if (header.startsWith("Bearer ")) return header.slice(7).trim();
  return null;
}

app.post("/register", async (req, res) => {
  try {
    const { fullName, email, password } = req.body ?? {};
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "Barcha maydonlar kiritilishi shart" });
    }
    const normalizedEmail = String(email).trim().toLowerCase();
    if (await findUserByEmail(normalizedEmail)) {
      return res.status(409).json({ message: "Bu email allaqachon ro'yxatdan o'tgan" });
    }
    const user = await create("users", {
      fullName,
      email: normalizedEmail,
      password,
    });
    const token = await createToken(user.id);
    res.status(201).json({ token, data: publicUser(user) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post("/auth", async (req, res) => {
  try {
    const { email, password } = req.body ?? {};
    const user = await findUserByEmail(email);
    if (!user || user.password !== password) {
      return res.status(401).json({ message: "Email yoki parol noto'g'ri" });
    }
    const token = await createToken(user.id);
    res.json({ token, data: publicUser(user) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get("/auth_me", async (req, res) => {
  try {
    const token = bearerToken(req);
    const user = token ? await getUserByToken(token) : null;
    if (!user) {
      return res.status(401).json({ message: "Avtorizatsiya talab qilinadi" });
    }
    res.json(publicUser(user));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ------------------------------------------------------------------ */
/*  Yuklash (fayllar)                                                 */
/* ------------------------------------------------------------------ */

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, "server", "uploads")),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || "").slice(0, 12);
    const base = path
      .basename(file.originalname || "file", ext)
      .replace(/[^a-zA-Z0-9_.-]/g, "_")
      .slice(0, 60);
    cb(null, `${Date.now()}-${base}${ext}`);
  },
});
const upload = multer({ storage });

app.post("/uploads", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Fayl yuborilmadi" });
    }
    const item = await create("uploads", {
      originalName: req.file.originalname,
      size: req.file.size,
    });
    res.status(201).json({ id: item.id, url: `/uploads/${req.file.filename}` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ------------------------------------------------------------------ */
/*  Shaxsiy ro'yxatlar (Mokky CRUD)                                   */
/* ------------------------------------------------------------------ */

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

function sendItem(res, item, status = 200) {
  if (!item) {
    return res.status(404).json({ message: "Ma'lumot topilmadi" });
  }
  res.status(status).json(item);
}

const matchesQuery = (item, query) => {
  for (const [key, rawValue] of Object.entries(query)) {
    if (key.startsWith("_")) continue;
    const value = String(rawValue);
    const itemValue = item?.[key];
    if (itemValue === undefined || itemValue === null) return false;
    if (Array.isArray(itemValue)) {
      if (!itemValue.some((v) => String(v) === value)) return false;
    } else if (String(itemValue) !== value) {
      return false;
    }
  }
  return true;
};

for (const collection of COLLECTIONS) {
  app.get(`/${collection}`, async (req, res) => {
    try {
      let items = await list(collection);
      const query = req.query ?? {};

      if (Object.keys(query).length > 0) {
        const filtered = items.filter((item) => matchesQuery(item, query));
        if ("search" in query && String(query.search).trim() !== "") {
          const q = String(query.search).trim().toLowerCase();
          items = filtered.filter((item) =>
            Object.values(item)
              .filter((v) => typeof v === "string" || typeof v === "number")
              .some((v) => String(v).toLowerCase().includes(q))
          );
        } else {
          items = filtered;
        }
      }

      const limit = Number(query.limit) || null;
      if (limit && limit > 0) items = items.slice(0, limit);

      res.json(items);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

  app.get(`/${collection}/:id`, async (req, res) => {
    try {
      sendItem(res, await findItem(collection, req.params.id));
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

  app.post(`/${collection}`, async (req, res) => {
    try {
      if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
        return res.status(400).json({ message: "Noto'g'ri ma'lumot" });
      }
      const payload = { ...req.body };

      if (collection === "profiles") {
        const token = bearerToken(req);
        const user = token ? await getUserByToken(token) : null;
        if (user && !payload.user_id) payload.user_id = user.id;
      }

      sendItem(res, await create(collection, payload), 201);
    } catch (err) {
      if (err?.code === 11000) {
        return res.status(409).json({ message: "Bunday ma'lumot allaqachon mavjud" });
      }
      res.status(500).json({ message: err.message });
    }
  });

  app.patch(`/${collection}/:id`, async (req, res) => {
    try {
      sendItem(res, await update(collection, req.params.id, req.body ?? {}));
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

  app.put(`/${collection}/:id`, async (req, res) => {
    try {
      sendItem(res, await update(collection, req.params.id, req.body ?? {}));
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

  app.delete(`/${collection}/:id`, async (req, res) => {
    try {
      const ok = await remove(collection, req.params.id);
      if (!ok) return res.status(404).json({ message: "Ma'lumot topilmadi" });
      res.status(200).json({ message: "O'chirildi" });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
}

/* ------------------------------------------------------------------ */
/*  Xizmat yo'nalishlari                                              */
/* ------------------------------------------------------------------ */

app.get("/api/health", async (req, res) => {
  try {
    const booksCount = (await list("books")).length;
    res.json({ success: true, database: "MongoDB (onlayn)", books: booksCount });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get("/api/counters", async (req, res) => {
  try {
    res.json(await getCounters());
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ------------------------------------------------------------------ */
/*  Scraper: EMaktabdan o'quvchilar (asl server.js vazifasi)          */
/* ------------------------------------------------------------------ */

const EMaktabURL =
  "https://schools.emaktab.uz/v2/school?school=1000001905595&view=members&group=students&filter=";

const TOTAL_PAGES = 267;
const CONCURRENCY = 1;
const MAX_RETRIES = 3;

async function getStudentsFromPage(page) {
  const url = `${EMaktabURL}&page=${page}`;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(`Request page ${page}, urinish ${attempt}`);

      const response = await axios.get(url, {
        headers: {
          "User-Agent": "Mozilla/5.0",
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        },
        timeout: 20000,
      });

      const $ = cheerio.load(response.data);

      const students = [];
      const seen = new Set();

      $("a.u").each((index, element) => {
        const name = $(element).text().trim();
        const href = $(element).attr("href") || "";

        if (!name) return;

        try {
          const userId = new URL(
            href,
            "https://schools.emaktab.uz"
          ).searchParams.get("user");

          if (userId && !seen.has(userId)) {
            seen.add(userId);

            students.push({
              id: userId,
              name,
            });
          }
        } catch {}
      });

      return students;
    } catch (error) {
      console.log(
        `Page ${page}, urinish ${attempt}/${MAX_RETRIES}: ${error.message}`
      );

      if (attempt === MAX_RETRIES) {
        throw error;
      }

      await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
    }
  }
}

app.get("/api/students", async (req, res) => {
  try {
    const allStudents = new Map();

    console.log("");
    console.log("================================");
    console.log("O'quvchilarni yuklash boshlandi");
    console.log("================================");

    for (let start = 1; start <= TOTAL_PAGES; start += CONCURRENCY) {
      const pages = [];

      for (
        let page = start;
        page < start + CONCURRENCY && page <= TOTAL_PAGES;
        page++
      ) {
        pages.push(page);
      }

      console.log("");
      console.log(`Yuklanmoqda: ${pages[0]}-${pages[pages.length - 1]}`);

      const results = await Promise.allSettled(
        pages.map((page) => getStudentsFromPage(page))
      );

      results.forEach((result, index) => {
        const page = pages[index];

        if (result.status === "fulfilled") {
          for (const student of result.value) {
            if (!allStudents.has(student.id)) {
              allStudents.set(student.id, student);
            }
          }

          console.log(
            `✓ Page ${page}: ${result.value.length} ta | Jami: ${allStudents.size}`
          );
        } else {
          console.log(`✗ Page ${page}: ${result.reason?.message || "xatolik"}`);
        }
      });
    }

    const students = Array.from(allStudents.values());

    console.log("");
    console.log("================================");
    console.log(`JAMI O'QUVCHILAR: ${students.length}`);
    console.log("================================");

    res.json({
      success: true,
      total: students.length,
      pages: TOTAL_PAGES,
      students,
    });
  } catch (error) {
    console.error("SERVER ERROR:", error);

    res.status(500).json({
      success: false,
      message: "O'quvchilarni olishda xatolik",
      error: error.message,
    });
  }
});

/* ------------------------------------------------------------------ */
/*  SPA fallback                                                      */
/* ------------------------------------------------------------------ */

app.get("*", (req, res, next) => {
  const distIndex = path.join(__dirname, "dist", "index.html");
  if (fs.existsSync(distIndex) && !req.path.startsWith("/api/")) {
    return res.sendFile(distIndex);
  }
  next();
});

/* ------------------------------------------------------------------ */
/*  Ishga tushirish                                                   */
/* ------------------------------------------------------------------ */

const MAX_RETRIES_START = 5;

async function start() {
  for (let attempt = 1; attempt <= MAX_RETRIES_START; attempt++) {
    try {
      await connect();
      console.log(`MongoDB ulandi: ${process.env.MONGODB_URI || "mongodb://127.0.0.1:27017"}`);
      await seedIfEmpty();
      break;
    } catch (err) {
      console.error(
        `[start] MongoDB ulanishi muvaffaqiyatsiz (${attempt}/${MAX_RETRIES_START}): ${err.message}`
      );
      if (attempt === MAX_RETRIES_START) {
        console.error("Server ishga tushmayapti. MONGODB_URI ni tekshiring.");
        process.exit(1);
      }
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }
  }

  app.listen(PORT, () => {
    console.log(`School Library server: http://localhost:${PORT}`);
    console.log(`Ma'lumotlar bazasi: MongoDB Atlas (onlayn)`);
    console.log(`Demo parol: demo123`);
  });
}

start();