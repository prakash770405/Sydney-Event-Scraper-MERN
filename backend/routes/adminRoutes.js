const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const scrapeSydney = require("../scraper/scrapeSydney");
const Event = require("../models/Event");
const Lead = require("../models/Lead");

// Admin guard: set `ADMIN_EMAILS` in backend/.env (comma-separated) to restrict admin actions
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "").split(",").map(s => s.trim()).filter(Boolean);
function checkAdmin(req, res, next) {
  if (!req.user) return res.status(401).json({ message: "Unauthorized" });
  // If no ADMIN_EMAILS configured allow any authenticated user (legacy behaviour)
  if (ADMIN_EMAILS.length > 0 && !ADMIN_EMAILS.includes(req.user.email)) {
    return res.status(403).json({ message: "Access denied" });
  }
  return next();
}

router.post("/scrape-sydney", auth, async (req, res) => {
  try {
    // auth middleware already checks if user is authenticated
    console.log("Scraper triggered by:", req.user?.email);

    const result = await scrapeSydney();
    res.json({ 
      message: `Scraper ran successfully! Added ${result.added || 0} new events, updated ${result.updated || 0} events.`,
      result 
    });
  } catch (err) {
    console.error("Scraper error:", err);
    res.status(500).json({ message: "Failed to run scraper: " + err.message });
  }
});

// Import all new events to imported status (admin only)
router.post("/events/import-all", auth, checkAdmin, async (req, res) => {
  try {
    const result = await Event.updateMany(
      { status: "new" },
      { 
        $set: { 
          status: "imported",
          importedAt: new Date(),
          importedBy: req.user.email
        }
      }
    );

    res.json({ 
      message: `Imported ${result.modifiedCount} new events successfully!`,
      imported: result.modifiedCount
    });
  } catch (err) {
    console.error("Import all error:", err);
    res.status(500).json({ message: "Failed to import events: " + err.message });
  }
});

// Delete a single event (admin only)
router.delete('/events/:id', auth, checkAdmin, async (req, res) => {
  try {
    const ev = await Event.findByIdAndDelete(req.params.id);
    if (!ev) return res.status(404).json({ message: 'Event not found' });
    res.json({ message: 'Event deleted', event: ev });
  } catch (err) {
    console.error('Delete event error:', err);
    res.status(500).json({ message: 'Delete failed: ' + err.message });
  }
});

// Delete all events (admin only) - use with caution
router.delete('/events', auth, checkAdmin, async (req, res) => {
  try {
    const result = await Event.deleteMany({});
    res.json({ message: `Deleted ${result.deletedCount} events` });
  } catch (err) {
    console.error('Delete all events error:', err);
    res.status(500).json({ message: 'Delete all failed: ' + err.message });
  }
});

// Get all leads (admin only)
router.get('/leads', auth, checkAdmin, async (req, res) => {
  try {
    const leads = await Lead.find({})
      .populate('eventId', 'title')
      .sort({ createdAt: -1 });
    
    res.json(leads);
  } catch (err) {
    console.error('Fetch leads error:', err);
    res.status(500).json({ message: 'Failed to fetch leads: ' + err.message });
  }
});

module.exports = router;
