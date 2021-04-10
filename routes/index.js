const express = require("express");
const router = express.Router();
const Student = require("../modals/studentSchema.js");
const bcrypt = require("bcryptjs");
const randomstring = require("randomstring");
const passport = require("passport");
const mailer = require("../misc/mailer");
const dashboard = require("../middleware/dashboard");
const home = require("../middleware/home");
const multer = require("multer");

router.get("/", home, (req, res) => {
  res.render("layout");
});
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

router.get("/student/dashboard", dashboard, (req, res) => {
  const student = req.user;
  res.render("dashboard", { student: student});
});

router.get("/student/submit", (req, res) => {
  res.render("form");
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "static/uploads");
  },
  filename: (req, file, cb) => {
    cb(null, req.user.reg + "-" + file.originalname);
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

router.post("/student/submit", cpUpload, async (req, res) => {
  try {
    const user = req.user;
    const domicile = req.files.domicile ? req.files.domicile[0].filename : user.domicile;
    const photograph = req.files.photograph ? req.files.photograph[0].filename : user.photograph;
    const income = req.files.income ? req.files.income[0].filename : user.income;
    const marksheet = req.files.marksheet ? req.files.marksheet[0].filename : user.marksheet;
    const adhaar = req.files.adhaar ? req.files.adhaar[0].filename : user.adhaar;
    const bonafide = req.files.bonafide ? req.files.bonafide[0].filename : user.bonafide;
    const passbook = req.files.passbook ? req.files.passbook[0].filename : user.passbook;


    console.log(adhaar);
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

module.exports = router;
