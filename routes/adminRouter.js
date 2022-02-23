const express = require("express");
const adminRouter = express.Router();

adminRouter.get("/", (req, res) => {
  res.render("admin");
});

adminRouter.post("/", (req, res) => {
  const { email, password } = req.body;
  if (email === "satya.20192079@mnnit.ac.in" && password === "satya1234") {
    res.render("admin-dashboard");
  } else res.redirect("/admin");
});

module.exports = adminRouter;
