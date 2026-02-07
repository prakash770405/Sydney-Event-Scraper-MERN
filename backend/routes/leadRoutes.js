const express = require("express");
const router = express.Router();
const Lead = require("../models/Lead");
const Event = require("../models/Event.js"); // make sure path & casing is correct
const emailApi = require("../config/email");

// Helper: Generate 4-digit code
const generateCode = () => Math.floor(1000 + Math.random() * 9000).toString();

// Helper: Send verification email
const sendVerificationEmail = async (email, code, leadId) => {
  const verifyUrl = `http://localhost:5173/verify-email/${leadId}/${code}`;
  const htmlContent = `<p>Hello,</p>
                       <p>Your 4-digit verification code is: <strong>${code}</strong></p>
                       <p>Click the link below to verify your email:</p>
                       <p><a href="${verifyUrl}">Verify Email</a></p>
                       <p>Or use this code to complete your registration.</p>`;
  const textContent = `Hello,\nYour 4-digit verification code is: ${code}\nVisit: ${verifyUrl}\nOr use this code to complete your registration.`;

  await emailApi.sendTransacEmail({
    sender: { email: process.env.BREVO_SENDER_EMAIL, name: "Sydney_event" },
    to: [{ email }],
    subject: "Your 4-digit verification code",
    htmlContent,
    textContent,
  });
};

// --------------------
// Create lead / get ticket
// --------------------
router.post("/submit", async (req, res) => {
  const { name, email, eventId } = req.body;
  if (!email || !name || !eventId) return res.status(400).json({ message: "Name, email, and eventId required" });

  try {
    // If this email was previously verified for ANY event, trust it and don't require OTP again
    const previouslyVerified = await Lead.findOne({ email, verified: true });
    if (previouslyVerified) {
      // Ensure there's a lead record for this specific event (create if missing), mark verified
      let leadForEvent = await Lead.findOne({ email, eventId });
      if (!leadForEvent) {
        leadForEvent = new Lead({
          name: name || previouslyVerified.name,
          email,
          eventId,
          verificationCode: undefined,
          verified: true
        });
        await leadForEvent.save();
      } else if (!leadForEvent.verified) {
        leadForEvent.verified = true;
        leadForEvent.verificationCode = undefined;
        await leadForEvent.save();
      }

      const event = await Event.findById(eventId);
      if (!event) return res.status(404).json({ message: "Event not found" });

      return res.json({
        message: "Email previously verified — no OTP required",
        redirectUrl: event.originalUrl || `/events/${event._id}`
      });
    }

    // Continue with existing logic: check for lead specific to this event
    let lead = await Lead.findOne({ email, eventId });
    if (lead && lead.verified) {
      const event = await Event.findById(eventId);
      if (!event) return res.status(404).json({ message: "Event not found" });

      return res.json({
        message: "Lead already verified",
        redirectUrl: event.originalUrl || `/events/${event._id}`
      });
    }

    // If lead exists but not verified, resend OTP
    if (lead && !lead.verified) {
      const code = generateCode();
      lead.verificationCode = code;
      await lead.save();
      await sendVerificationEmail(email, code, lead._id);
      return res.json({ message: "Verification code resent", leadId: lead._id });
    }

    // If lead doesn't exist, create new lead and send OTP
    const code = generateCode();
    lead = new Lead({
      name,
      email,
      eventId,
      verificationCode: code,
      verified: false
    });
    await lead.save();

    await sendVerificationEmail(email, code, lead._id);
    res.status(201).json({ message: "Lead created. Verification code sent.", leadId: lead._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// --------------------
// Verify OTP
// --------------------
router.post("/verify", async (req, res) => {
  try {
    const { leadId, code } = req.body;
    if (!leadId || !code) return res.status(400).json({ message: "Lead ID and code required" });

    const lead = await Lead.findById(leadId);
    if (!lead) return res.status(404).json({ message: "Lead not found" });

    if (lead.verified) {
      // Already verified → redirect to event
      const event = await Event.findById(lead.eventId);
      return res.json({
        message: "Lead already verified",
        redirectUrl: event.originalUrl || `/events/${event._id}`
      });
    }

    if (lead.verificationCode !== code) return res.status(400).json({ message: "Invalid verification code" });

    // ✅ Mark verified
    lead.verified = true;
    lead.verificationCode = undefined;
    await lead.save();

    const event = await Event.findById(lead.eventId);
    res.json({
      message: "Lead verified successfully",
      redirectUrl: event.originalUrl || `/events/${event._id}`
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error verifying lead" });
  }
});

module.exports = router;
