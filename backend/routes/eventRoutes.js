const router = require("express").Router();
const Event = require("../models/Event");
const Lead = require("../models/Lead");
const auth = require("../middleware/auth");
const emailApi = require("../config/email");

/* =========================
   HELPER: Generate 4-digit code
========================= */
function generateVerificationCode() {
  return Math.floor(1000 + Math.random() * 9000).toString(); // 1000-9999
}

/* =========================
   ADMIN: GET ALL EVENTS
========================= */
router.get("/", async (req, res) => {
  try {
    const events = await Event.find({ city: "Sydney" });
    res.json(events);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch events" });
  }
});

/* =========================
   PUBLIC: IMPORTED EVENTS
========================= */
router.get("/public", async (req, res) => {
  try {
    const events = await Event.find({ city: "Sydney", status: "imported" }).sort({ importedAt: -1 });
    res.json(events);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch public events" });
  }
});

/* =========================
   IMPORT EVENT (ADMIN)
========================= */
router.post("/import/:id", auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });

    if (!req.user) return res.status(401).json({ message: "User not authenticated" });
    
    if (!req.user.email) {
      console.error("User object missing email:", req.user);
      return res.status(400).json({ message: "User email not found in session" });
    }

    event.status = "imported";
    event.importedAt = new Date();
    event.importedBy = req.user.email;

    await event.save();

    res.json({ message: "Event imported successfully", event });
  } catch (err) {
    console.error("Import error:", err);
    res.status(500).json({ message: "Import failed: " + err.message });
  }
});

/* =========================
   SAVE LEAD & SEND 4-DIGIT VERIFICATION CODE
========================= */
router.post("/lead", async (req, res) => {
  try {
    const { email, eventId, consent } = req.body;
    if (!email || !eventId) return res.status(400).json({ message: "Email & eventId required" });
    if (!consent) return res.status(400).json({ message: "Consent required" });

    const verificationCode = generateVerificationCode();

    // Find existing lead
    let lead = await Lead.findOne({ email, eventId });

    if (lead) {
      lead.verificationCode = verificationCode;
      lead.verified = false;
    } else {
      lead = new Lead({
        email,
        eventId,
        consent,
        verificationCode,
        verified: false
      });
    }

    await lead.save();

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: "Event not found" });

    // Send verification code email
    const sendSmtpEmail = {
      to: [{ email }],
      templateId: parseInt(process.env.BREVO_TEMPLATE_ID),
      params: { EVENT_TITLE: event.title, VERIFICATION_CODE: verificationCode },
      subject: `Confirm your ticket for ${event.title}`,
      sender: { name: "Event Tickets", email: process.env.BREVO_SENDER_EMAIL }
    };

    await emailApi.sendTransacEmail(sendSmtpEmail);

    res.json({ message: "Verification code sent to your email!" });

  } catch (err) {
    console.error(err.response ? err.response.body : err);
    res.status(500).json({ message: "Failed to save lead" });
  }
});

/* =========================
   LOGOUT (Optional)
========================= */
router.get("/logout", (req, res) => {
  req.logout(() => {
    res.redirect("http://localhost:5173");
  });
});

module.exports = router;
