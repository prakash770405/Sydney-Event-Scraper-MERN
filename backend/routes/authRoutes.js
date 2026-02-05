const router = require("express").Router();
const passport = require("passport");


router.get("/google",
passport.authenticate("google", { scope: ["profile", "email"] })
);


router.get("/google/callback",
passport.authenticate("google", { session: false }),
(req, res) => res.redirect("http://localhost:5173/dashboard")
);


module.exports = router;