const LocalStrategy = require("passport-local").Strategy;
const Student = require("../modals/studentSchema");
const bcrypt = require("bcryptjs");

const init = (passport) => {
  passport.serializeUser((user, done) => {
    done(null, user._id);
  });

  passport.deserializeUser((id, done) => {
    Student.findById(id, (err, user) => {
      done(err, user);
    });
  });

  passport.use(
    "local",
    new LocalStrategy(
      {
        usernameField: "email",
      },
      async (email, password, done) => {
        try {
          const user = await Student.findOne({ email: email });
          if (!user) {
            return done(null, false, { message: "Unknown user" });
          }

          if (!(await bcrypt.compare(password, user.password))) {
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
};

module.exports = init;
