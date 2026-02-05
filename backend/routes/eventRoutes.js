const router = require("express").Router();
const Event = require("../models/Event");
const Lead = require("../models/Lead");


router.get("/", async (req, res) => {
const events = await Event.find({ city: "Sydney" });
res.json(events);
});


router.post("/import/:id", async (req, res) => {
await Event.findByIdAndUpdate(req.params.id, {
status: "imported",
importedAt: new Date(),
importedBy: "admin"
});
res.json({ success: true });
});


router.post("/lead", async (req, res) => {
const lead = new Lead(req.body);
await lead.save();
res.json({ success: true });
});


module.exports = router;