const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  title: { type: String, unique: true },
  dateTime: String,
  venue: String,
  city: String,
  description: String,
  category: String,
  image: String,
  source: String,
  originalUrl: String,
  status: { type: String, default: "new" },
  lastScrapedAt: Date,
  importedAt: Date,
  importedBy: String
});

module.exports = mongoose.model("Event", eventSchema);
