const mongoose = require("mongoose");

const leadSchema = new mongoose.Schema({
  email: String,
  eventId: mongoose.Schema.Types.ObjectId,
  consent: Boolean,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Lead", leadSchema);
