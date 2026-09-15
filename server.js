import express from "express";
import axios from "axios";
import * as cheerio from "cheerio";

const app = express();
const PORT = 3001;

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

app.listen(PORT, () => {
  console.log(`Server: http://localhost:${PORT}`);
});
