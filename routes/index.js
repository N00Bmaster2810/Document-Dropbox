const express = require("express");
const router = express.Router();
const Student = require("../modals/studentSchema.js");
const bcrypt = require("bcryptjs");
const randomstring = require("randomstring");
const passport = require("passport");
const mailer = require("../misc/mailer");

router.post("/student/register", async (req, res) => {
  try {
    console.log(req.body);
	  const { name, email, password, dob, reg, branch } = req.body;
	  
	  const user = Student.findOne({ "email": email });
	  if (user) {
		  req.flash("error", "Email already exists");
		  res.render("/");
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

    req.flash("success", "please check your email");
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
      res.send("dashboard");
    } catch (err) {
      console.log(err);
      return res.redirect("/");
    }
  })(req, res, next);
});

router.get("/student/logout", (req, res) => {
  req.logOut();
  req.flash("success", "successsfully logout");
  res.render("/");
});

router.post("/student/verify", async (req, res) => {
  try {
    const { token } = req.body;
    const student = await Student.findOne({ token: token });
    if (!student) {
      req.flash("error", "wrong token");
      res.redirect("/");
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

module.exports = router;
