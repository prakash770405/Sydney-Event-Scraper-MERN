const puppeteer = require("puppeteer");
const mongoose = require("mongoose");
const Event = require("../models/Event");
require("dotenv").config();

async function scrape() {
  let browser;

  try {
    // 1️⃣ Connect DB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");

    // 2️⃣ Launch browser
    browser = await puppeteer.launch({
      headless: "new",
      defaultViewport: null,
      args: ["--no-sandbox", "--disable-setuid-sandbox"]
    });

    const page = await browser.newPage();

    // 3️⃣ Go to Sydney events page
    await page.goto(
      "https://www.eventbrite.com.au/d/australia--sydney/events/",
      { waitUntil: "networkidle2", timeout: 0 }
    );

    // 4️⃣ Scrape raw data ONLY
    const scrapedEvents = await page.evaluate(() => {
      return Array.from(document.querySelectorAll("a[href*='/e/']"))
        .map(el => ({
          title: el.innerText.trim(),
          originalUrl: el.href
        }))
        .filter(e => e.title.length > 10)
        .slice(0, 15)
        .map(e => ({
          title: e.title,
          originalUrl: e.originalUrl,
          city: "Sydney",
          source: "Eventbrite"
        }));
    });

    // 5️⃣ Add lifecycle metadata (Node.js context)
    const events = scrapedEvents.map(event => ({
      ...event,
      lastScrapedAt: new Date(),
      status: "new"
    }));

    console.log("Events scraped:", events.length);

    // 6️⃣ Store titles for inactive detection
    const scrapedTitles = new Set(events.map(e => e.title));

    // 7️⃣ Insert / update events (NO duplicates)
    for (const event of events) {
      await Event.updateOne(
        { title: event.title },
        { $setOnInsert: event },
        { upsert: true }
      );
    }

    // 8️⃣ Mark missing events as inactive
    await Event.updateMany(
      {
        city: "Sydney",
        title: { $nin: Array.from(scrapedTitles) }
      },
      { status: "inactive" }
    );

    console.log("Scraping + update completed");

  } catch (err) {
    console.error("Scraping failed:", err.message);
  } finally {
    if (browser) await browser.close();
    await mongoose.connection.close();
    console.log("Browser & DB closed");
  }
}

// ▶️ Run scraper
scrape();
