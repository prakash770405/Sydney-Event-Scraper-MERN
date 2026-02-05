const mongoose = require("mongoose");


const leadSchema = new mongoose.Schema({
email: String,
consent: Boolean,
eventId: mongoose.Schema.Types.ObjectId,
createdAt: { type: Date, default: Date.now }
});


module.exports = mongoose.model("Lead", leadSchema);