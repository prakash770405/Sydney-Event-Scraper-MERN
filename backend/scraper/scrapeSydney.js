const puppeteer = require("puppeteer");
const mongoose = require("mongoose");
const Event = require("../models/Event");
require("dotenv").config();

async function scrape() {
  let browser;
  let allEventsCollected = [];
  const targetCount = 20; // Want at least 20 events with images
  const maxPages = 5; // Max pages to scrape

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

    // Scrape multiple pages until we have at least 20 events with images
    for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
      console.log(`\n--- Scraping page ${pageNum} ---`);
      
      const page = await browser.newPage();
      page.setDefaultTimeout(30000);
      page.setDefaultNavigationTimeout(30000);
      
      // Construct URL with page parameter
      const url = `https://www.eventbrite.com.au/d/australia--sydney/events/?page=${pageNum}`;
      try {
        await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });
      } catch (err) {
        console.log(`Navigation to page ${pageNum} timed out, continuing...`);
      }

      // Scroll to load lazy images
      await autoScroll(page);

      // Wait for event links
      try {
        await page.waitForSelector("a[href*='/e/']", { timeout: 10000 });
      } catch (err) {
        console.log(`No event links found on page ${pageNum}`);
        await page.close();
        break; // Stop if no events found
      }

      const scrapedEvents = await page.evaluate(() => {
        const links = Array.from(document.querySelectorAll("a[href*='/e/']"));

        const events = links.map(link => {
          const title = link.innerText.trim();
          const originalUrl = link.href;
          const img = link.closest("div")?.querySelector("img")?.src || "";

          return { title, originalUrl, image: img, city: "Sydney", source: "Eventbrite" };
        });

        // Filter out too short titles & remove duplicates on this page
        const filtered = [];
        const seen = new Set();
        for (const e of events) {
          if (e.title.length > 5 && !seen.has(e.title)) {
            filtered.push(e);
            seen.add(e.title);
          }
        }

        return filtered;
      });

      console.log(`Found ${scrapedEvents.length} events on page ${pageNum}`);
      
      // Add metadata and collect
      const pageEvents = scrapedEvents.map(e => ({ ...e, lastScrapedAt: new Date(), status: "new" }));
      allEventsCollected = allEventsCollected.concat(pageEvents);

      // Remove duplicates across all pages
      const uniqueEvents = [];
      const seenTitles = new Set();
      for (const ev of allEventsCollected) {
        if (!seenTitles.has(ev.title)) {
          uniqueEvents.push(ev);
          seenTitles.add(ev.title);
        }
      }
      allEventsCollected = uniqueEvents;

      await page.close();

      // Check if we have enough events; if yes, start deep-scraping
      const eventsWithoutImages = allEventsCollected.filter(ev => !ev.image || !ev.image.trim());
      if (allEventsCollected.length >= targetCount * 2 && eventsWithoutImages.length > 0) {
        // Start deep-scraping while collecting more pages if needed
        console.log(`Collected ${allEventsCollected.length} events so far. Starting deep-scrape...`);
        break;
      }

      if (allEventsCollected.length >= targetCount) {
        console.log(`Reached target of ${targetCount} events. Stopping page scraping.`);
        break;
      }
    }

    if (!allEventsCollected.length) {
      console.log("No events found!");
      return { added: 0, updated: 0 };
    }

    console.log(`Total events collected: ${allEventsCollected.length}`);
    console.log(`Preparing to deep-scrape up to ${Math.min(allEventsCollected.length, 15)} event pages for descriptions/images...`);

    // For richer data (short description, og:image), visit event pages (limit to 15 to be thorough)
    const deepLimit = Math.min(allEventsCollected.length, 15);
    for (let i = 0; i < deepLimit; i++) {
      const ev = allEventsCollected[i];
      try {
        const evtPage = await browser.newPage();
        evtPage.setDefaultTimeout(30000);
        await evtPage.goto(ev.originalUrl, { waitUntil: "domcontentloaded", timeout: 30000 });

        // Try to extract meta description / og:description and og:image
        const meta = await evtPage.evaluate(() => {
          const getMeta = (name) => {
            const el = document.querySelector(`meta[property="${name}"]`) || document.querySelector(`meta[name="${name}"]`);
            return el ? el.content : null;
          };

          const ogDesc = getMeta('og:description');
          const metaDesc = getMeta('description');
          const twitterImage = getMeta('twitter:image');
          const ogImage = getMeta('og:image');

          // fallback: first paragraph text on the page
          const p = document.querySelector('article p') || document.querySelector('p');
          const firstP = p ? p.innerText.trim() : null;

          return { ogDesc, metaDesc, firstP, ogImage, twitterImage };
        });

        ev.description = (meta.ogDesc || meta.metaDesc || meta.firstP || "").slice(0, 320);
        ev.image = ev.image || meta.ogImage || meta.twitterImage || ev.image || "";

        await evtPage.close();
      } catch (err) {
        console.warn(`Deep-scrape failed for ${ev.originalUrl}:`, err.message);
        // Fallback: try fetching the page HTML and parse meta tags (useful when navigation times out)
        try {
          // use global fetch when available; add a short timeout via AbortController
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 20000);
          const headers = { 'User-Agent': 'Mozilla/5.0 (compatible; Scraper/1.0; +https://example.com)' };

          const res = await fetch(ev.originalUrl, { signal: controller.signal, headers });
          clearTimeout(timeoutId);

          if (res.ok) {
            const html = await res.text();

            const ogImageMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i) || html.match(/<meta[^>]*name=["']twitter:image["'][^>]*content=["']([^"']+)["']/i);
            const ogDescMatch = html.match(/<meta[^>]*(?:property=["']og:description["']|name=["']description["'])[^>]*content=["']([^"']+)["']/i);
            const firstPMatch = html.match(/<p[^>]*>([^<]{30,}?)<\//i);

            const ogDesc = ogDescMatch ? ogDescMatch[1] : null;
            const ogImage = ogImageMatch ? ogImageMatch[1] : null;

            ev.description = (ogDesc || (firstPMatch ? firstPMatch[1] : "") || "").slice(0, 320);
            ev.image = ev.image || (ogImage ? ogImage.split('?')[0] : "");
          }
        } catch (err2) {
          console.warn(`Fallback fetch failed for ${ev.originalUrl}:`, err2.message);
        }
      }
    }
    console.log("Events scraped:", allEventsCollected.length);

    // Filter: only keep events with images
    const eventsWithImages = allEventsCollected.filter(ev => ev.image && ev.image.trim());
    console.log(`Filtered to ${eventsWithImages.length} events with images (out of ${allEventsCollected.length} total)`);

    if (!eventsWithImages.length) {
      console.log("No events with images found after filtering!");
      return { added: 0, updated: 0 };
    }

    const titles = new Set(eventsWithImages.map(e => e.title));

    // Upsert DB
    let added = 0;
    let updated = 0;
    
    for (const event of eventsWithImages) {
      const updateDoc = {
        $set: {
          lastScrapedAt: event.lastScrapedAt,
          city: event.city,
          source: event.source,
          originalUrl: event.originalUrl,
          image: event.image || "",
          description: event.description || "",
          status: event.status || "new"
        },
        $setOnInsert: {
          title: event.title,
          importedAt: null,
          importedBy: null
        }
      };

      const result = await Event.updateOne({ title: event.title }, updateDoc, { upsert: true });
      if (result.upsertedCount && result.upsertedCount > 0) {
        added++;
      } else if (result.modifiedCount && result.modifiedCount > 0) {
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
