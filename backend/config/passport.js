const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/api/auth/google/callback"
    },
    async (accessToken, refreshToken, profile, done) => {
      // Store minimum required user info
      const user = {
        googleId: profile.id,
        email: profile.emails[0].value,
        name: profile.displayName
      };

      // VERY IMPORTANT
      return done(null, user);
    }
  )
);

/* =========================
   SESSION SERIALIZATION
========================= */

passport.serializeUser((user, done) => {
  done(null, user); // store user in session
});

passport.deserializeUser((user, done) => {
  done(null, user); // retrieve user from session
});

module.exports = passport;
