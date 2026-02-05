const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const session = require("express-session");
const passport = require("passport");
require("dotenv").config();
require("./config/passport");

const app = express();

/* =========================
   MIDDLEWARE
========================= */

app.use(
  cors({
    origin: "http://localhost:5173", // frontend URL
    credentials: true                // ALLOW COOKIES
  })
);

app.use(express.json());

/* =========================
   SESSION CONFIG (CRITICAL)
========================= */

app.use(
  session({
    name: "connect.sid",
    secret: process.env.SESSION_SECRET || "dev_secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false,     // MUST be false on localhost
      sameSite: "lax"
    }
  })
);

/* =========================
   PASSPORT
========================= */

app.use(passport.initialize());
app.use(passport.session());

/* =========================
   DATABASE
========================= */

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.error(err));

/* =========================
   ROUTES
========================= */

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/events", require("./routes/eventRoutes"));
app.get("/api/debug/session", (req, res) => {
  res.json({
    session: req.session,
    user: req.user || null
  });
});


/* =========================
   SERVER
========================= */

app.listen(5000, () => {
  console.log("Server running on 5000");
});
