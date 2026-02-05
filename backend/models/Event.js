const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true, unique: true },
  city: String,
  source: String,
  originalUrl: String,

  // Optional (future use)
  dateTime: String,
  venue: String,
  description: String,
  category: String,
  image: String,

  // Lifecycle
  status: {
    type: String,
    enum: ["new", "imported", "inactive"],
    default: "new"
  },

  lastScrapedAt: Date,
  importedAt: Date,
  importedBy: String,
  importNotes: String
});

module.exports = mongoose.model("Event", eventSchema);
