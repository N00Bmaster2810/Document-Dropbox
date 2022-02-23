const home = (req, res, next) => {
  if (!req.isAuthenticated()) {
    return next();
  }
  res.redirect("/student/dashboard");
};

module.exports = home;
