const mongoose = require("mongoose");

const LeadSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: String,
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
  verificationCode: { type: String }, // make optional
  verified: { type: Boolean, default: false },
  consent: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model("Lead", LeadSchema);
