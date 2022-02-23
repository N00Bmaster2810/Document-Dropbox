const express = require("express");
const studentRouter = express.Router();
const Student = require("../modals/studentSchema.js");
const bcrypt = require("bcryptjs");
const randomstring = require("randomstring");
const passport = require("passport");
const mailer = require("../misc/mailer");
const dashboard = require("../middleware/dashboard");
const multer = require("multer");

studentRouter.get("/dashboard", dashboard, (req, res) => {
  const student = req.user;
  res.render("dashboard", { student: student });
});

studentRouter.get("/submit", (req, res) => {
  res.render("form");
});

studentRouter.get("/verify", (req, res) => {
  res.render("verify");
});

studentRouter.get("/logout", (req, res) => {
  console.log(req.user);
  req.logOut();
  req.flash("success", "successsfully logout");
  res.redirect("/");
});



studentRouter.post("/register", async (req, res) => {
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

studentRouter.post("/login", (req, res, next) => {
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

studentRouter.post("/verify", async (req, res) => {
  try {
    const { token } = req.body;
    const student = await Student.findOne({ token: token });
    if (!student) {
      req.flash("error", "wrong token");
      res.redirect("/student/verify");
    }
    student.isVerified = true;
    await student.save();
    req.flash("success", "successsfully verified");
    res.redirect("/");
  } catch (err) {
    console.log(err);
  }
});


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "static/uploads");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now().toString() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

var cpUpload = upload.fields([
  { name: "domicile", maxCount: 1 },
  { name: "photograph", maxCount: 1 },
  { name: "income", maxCount: 1 },
  { name: "marksheet", maxCount: 1 },
  { name: "adhaar", maxCount: 1 },
  { name: "passbook", maxCount: 1 },
  { name: "bonafide", maxCount: 1 },
]);

studentRouter.post("/submit", cpUpload, async (req, res) => {
  try {
    const user = req.user;
    console.log(req.files);
    const domicile = req.files.domicile[0].filename;
    const photograph = req.files.photograph[0].filename;
    const income = req.files.income[0].filename;
    const marksheet = req.files.marksheet[0].filename;
    const adhaar = req.files.adhaar[0].filename;
    const bonafide = req.files.bonafide[0].filename;
    const passbook = req.files.passbook[0].filename;
	
    await Student.findByIdAndUpdate(
      user._id,
      {
        domicile: domicile,
        photograph: photograph,
        income: income,
        marksheet: marksheet,
        adhaar: adhaar,
        passbook: passbook,
        bonafide: bonafide,
      },
      (err, doc) => {
        if (err) {
          res.status(500).send(err);
          console.log(err);
        } else {
          console.log(doc);
          res.redirect("/student/dashboard");
        }
      }
    );
  } catch (err) {
    console.log(err);
  }
});

module.exports = studentRouter;
