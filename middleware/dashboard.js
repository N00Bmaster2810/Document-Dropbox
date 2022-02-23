const dashboard = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  req.flash("error", "You have to login first");
  res.redirect("/");
};

module.exports = dashboard;
