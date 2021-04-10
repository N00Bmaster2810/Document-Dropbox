const express = require("express");
const router = express.Router();
const Student = require("../modals/studentSchema.js");
const bcrypt = require("bcryptjs");
const randomstring = require("randomstring");
const passport = require("passport");
const mailer = require("../misc/mailer");
const dashboard = require("../middleware/dashboard");

router.post("/student/register", async (req, res) => {
  try {
    console.log(req.body);
    const { name, email, password, dob, reg, branch } = req.body;

    const stu = await Student.findOne({ email: email });
    if (stu) {
      req.flash("error", "Email already exists");
      return res.redirect("/");
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const token = randomstring.generate();

    const student = new Student({
      name,
      email,
      password: hashPassword,
      dob,
      reg,
      branch,
      token,
    });
    await student.save();

    const html = `Hi there
		<br/> This is your token to verify the email address
		<br/>
		Token: <b>${token}</b>
		<br/>
		On the following page:
		<a href="http://localhost:3000/student/verify">http://localhost:3000/student/verify</a>
		<br/> <br/>
		`;

    await mailer.sendEmail("hack.mnnit.36@gmail.com", email, "Please verify your email", html);

    req.flash("success", "An email has been sent to your registered email-id. Please refer to it to verify your account.");
    res.redirect("/");
  } catch (err) {
    console.log(err);
    res.send({ status: "error", err });
  }
});

router.post("/student/login", (req, res, next) => {
  passport.authenticate("local", async (err, user, info) => {
    try {
      console.log(req.body);
      if (err) {
        req.flash("error", info.message);
        console.log(info.message);
        return next(err);
      }
      if (!user) {
        req.flash("error", info.message);
        console.log(info.message);
        return res.redirect("/");
      }
      req.logIn(user, (err) => {
        if (err) {
          req.flash("error", info.message);
          return next(err);
        }
        res.redirect("/student/dashboard");
      });
    } catch (err) {
      console.log(err);
      return res.redirect("/");
    }
  })(req, res, next);
});

router.get("/student/logout", (req, res) => {
  console.log(req.user);
  req.logOut();
  req.flash("success", "successsfully logout");
  res.redirect("/");
});

router.post("/student/verify", async (req, res) => {
  try {
    const { token } = req.body;
    const student = await Student.findOne({ token: token });
    if (!student) {
      req.flash("error", "wrong token");
      res.redirect("/student/verify");
    }
    student.isVerified = true;
    student.token = "";
    await student.save();
    req.flash("success", "successsfully verified");
    res.redirect("/");
  } catch (err) {
    console.log(err);
  }
});

router.get("/student/verify", (req, res) => {
  res.render("verify");
});

router.get("/student/dashboard",dashboard, (req, res) => {
  res.render("dashboard");
});

module.exports = router;
