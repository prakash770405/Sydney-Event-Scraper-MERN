const puppeteer = require("puppeteer");
const mongoose = require("mongoose");
const Event = require("../models/Event");
require("dotenv").config();

async function scrape() {
    let browser;

    try {
        // ✅ Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB connected");

        // ✅ Launch browser
        browser = await puppeteer.launch({
            headless: "new",
            defaultViewport: null,
            args: ["--no-sandbox", "--disable-setuid-sandbox"]
        });

        const page = await browser.newPage();

        // ✅ Open Eventbrite Sydney page
        await page.goto(
            "https://www.eventbrite.com.au/d/australia--sydney/events/",
            { waitUntil: "networkidle2", timeout: 0 }
        );

        // ✅ Scrape ONLY text in browser context
        const scrapedEvents = await page.evaluate(() => {
            return Array.from(document.querySelectorAll("a[href*='/e/']"))
                .map(el => el.innerText.trim())
                .filter(title => title.length > 10)
                .slice(0, 15)
                .map(title => ({
                    title,
                    source: "Eventbrite",
                    city: "Sydney"
                }));
        });

        // ✅ Add dates in Node.js context
        const events = scrapedEvents.map(event => ({
            ...event,
            lastScrapedAt: new Date(),
            status: "new"
        }));

        console.log("Events found:", events.length);

        // ✅ Insert without duplicates
        for (const event of events) {
            await Event.updateOne(
                { title: event.title },
                { $setOnInsert: event },
                { upsert: true }
            );
        }

        console.log("Events inserted into DB");

    } catch (error) {
        console.error("Scraping failed:", error.message);
    } finally {
        // ✅ Cleanup
        if (browser) await browser.close();
        await mongoose.connection.close();
        console.log("Browser & DB closed");
    }
}

// ✅ Run scraper
scrape();
