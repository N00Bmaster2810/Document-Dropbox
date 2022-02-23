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

router.get("/admin", (req, res) => {
  res.render("admin");
});

router.post("/admin", (req, res) => {
  const { email, password } = req.body;
  if (email === "satya.20192079@mnnit.ac.in" && password === "satya1234") {
    res.render("admin-dashboard");
  } else res.redirect("/admin");
})

module.exports = router;
