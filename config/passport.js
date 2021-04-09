const LocalStrategy = require("passport-local").Strategy;
const passport = require("passport");
const Student = require("../modals/studentSchema");
const bcrypt = require("bcryptjs");

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await Student.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

passport.use(
  "local",
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
      passReqToCallback: false,
    },
    async (email, password, done) => {
      try {
        const user = await Student.findOne({ email: email });
        if (!user) {
          return done(null, false, { message: "Unknown user" });
        }

        if (!bcrypt.compare(password, user.password)) {
          return done(null, false, { message: "Wrong Password" });
        }

        if (!user.isVerified) {
          return done(null, false, { message: "Email not verified" });
        }

        return done(null, user);
      } catch (err) {
        return done(err, false);
      }
    }
  )
);
