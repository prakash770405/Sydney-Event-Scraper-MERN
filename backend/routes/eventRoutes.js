const router = require("express").Router();
const Event = require("../models/Event");
const Lead = require("../models/Lead");
const auth = require("../middleware/auth");

/* =========================
   ADMIN: GET ALL EVENTS
========================= */
router.get("/", async (req, res) => {
  try {
    const events = await Event.find({ city: "Sydney" });
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch events" });
  }
});

/* =========================
   PUBLIC: IMPORTED EVENTS
========================= */
router.get("/public", async (req, res) => {
  try {
    const events = await Event.find({
      city: "Sydney",
      status: "imported"
    }).sort({ importedAt: -1 });

    res.json(events);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch public events" });
  }
});

/* =========================
   IMPORT EVENT (ADMIN)
========================= */
router.post("/import/:id", auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    event.status = "imported";
    event.importedAt = new Date();
    event.importedBy = req.user.email;

    await event.save();

    res.json({ message: "Event imported successfully" });
  } catch (err) {
    res.status(500).json({ message: "Import failed" });
  }
});

/* =========================
   SAVE LEAD WITH CONSENT
========================= */
router.post("/lead", async (req, res) => {
  try {
    const { email, eventId, consent } = req.body;

    if (!consent) {
      return res.status(400).json({ message: "Consent required" });
    }

    await Lead.create({
      email,
      eventId,
      consent,
      createdAt: new Date()
    });

    res.json({ message: "Lead saved successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to save lead" });
  }
});

router.get("/logout", (req, res) => {
  req.logout(() => {
    res.redirect("http://localhost:5173");
  });
});


module.exports = router;
