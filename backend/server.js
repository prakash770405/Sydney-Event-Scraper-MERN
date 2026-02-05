const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const passport = require("passport");
require("dotenv").config();
require("./config/passport");


const app = express();
app.use(cors());
app.use(express.json());
app.use(passport.initialize());


mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB Connected"));


app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/events", require("./routes/eventRoutes"));


app.listen(5000, () => console.log("Server running on 5000"));