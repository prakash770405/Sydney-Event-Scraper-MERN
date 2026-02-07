const puppeteer = require("puppeteer");
const mongoose = require("mongoose");
const Event = require("../models/Event");
require("dotenv").config();

async function scrape() {
  let browser;

  try {
    // Only connect if not already connected
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGO_URI);
      console.log("MongoDB connected");
    }

    browser = await puppeteer.launch({
      headless: "new",
      defaultViewport: null,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    
    // Set timeout for page operations (30 seconds)
    page.setDefaultTimeout(30000);
    page.setDefaultNavigationTimeout(30000);
    
    await page.goto(
      "https://www.eventbrite.com.au/d/australia--sydney/events/",
      { waitUntil: "networkidle2", timeout: 30000 }
    );

    // Scroll to load lazy images
    await autoScroll(page);

    // Wait for at least one link to appear (with fallback timeout)
    try {
      await page.waitForSelector("a[href*='/e/']", { timeout: 15000 });
    } catch (err) {
      console.log("Timeout waiting for event links. Continuing anyway...");
    }

    const scrapedEvents = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll("a[href*='/e/']"));

      const events = links.map(link => {
        const title = link.innerText.trim();
        const originalUrl = link.href;

        // Try to get image from the nearest img inside parent div
        const img = link.closest("div")?.querySelector("img")?.src || "";

        return { title, originalUrl, image: img, city: "Sydney", source: "Eventbrite" };
      });

      // Filter out too short titles & remove duplicates
      const filtered = [];
      const seen = new Set();
      for (const e of events) {
        if (e.title.length > 5 && !seen.has(e.title)) {
          filtered.push(e);
          seen.add(e.title);
        }
      }

      return filtered.slice(0, 20); // limit to first 20 events
    });

    if (!scrapedEvents.length) {
      console.log("No events found!");
      return { added: 0, updated: 0 };
    }

    // Add metadata
    const events = scrapedEvents.map(e => ({ ...e, lastScrapedAt: new Date(), status: "new" }));
    console.log("Events scraped:", events.length);

    const titles = new Set(events.map(e => e.title));

    // Upsert DB
    let added = 0;
    let updated = 0;
    
    for (const event of events) {
      const result = await Event.updateOne(
        { title: event.title },
        { $setOnInsert: event },
        { upsert: true }
      );
      if (result.upsertedCount > 0) {
        added++;
      } else if (result.modifiedCount > 0) {
        updated++;
      }
    }

    // Mark missing events inactive
    await Event.updateMany(
      { city: "Sydney", title: { $nin: Array.from(titles) } },
      { status: "inactive" }
    );

    console.log("Scraping + DB update done ✅");
    return { added, updated };
  } catch (err) {
    console.error("Scraping failed:", err.message);
    console.error("Full error:", err);
    throw new Error(`Scraping failed: ${err.message}`);
  } finally {
    if (browser) await browser.close();
    // Don't close MongoDB connection - let the server manage it
  }
}

// Auto-scroll to load images
async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise(resolve => {
      let totalHeight = 0;
      const distance = 200;
      const timer = setInterval(() => {
        window.scrollBy(0, distance);
        totalHeight += distance;
        if (totalHeight >= document.body.scrollHeight - window.innerHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 200);
    });
  });
}

module.exports = scrape;
