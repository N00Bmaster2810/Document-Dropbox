const express = require("express");
require("dotenv").config();
const bodyParser = require("body-parser")
const expressLayouts = require("express-ejs-layouts");
const mongoose = require("mongoose");
const app = express();
const passport = require("passport");
const session = require("express-session"); //package for session
const flash = require("connect-flash"); //package for displaying messages on the front end


app.use(expressLayouts);
app.set("view engine", "ejs");



app.get('/', (req, res) => {
	res.send("Welcome to hack 36");
})
const PORT = process.env.PORT || 3000;
mongoose.connect(process.env.CONNECTION_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true
});



//session config
app.use(
  session({
    secret: process.env.COOKIE_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 },
    unset: "destroy",
  })
);

app.use(flash());

//passport config for sessions and storing login data
const passportInit = require("./config/passport");
app.use(passport.initialize());
app.use(passport.session());

//Global middleware can be used accessed anywhere so as to help store the user login in session
app.use((req, res, next) => {
  res.locals.session = req.session;
  next();
});

app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.isAuthenticated = req.user ? true : false;
  next();
});


app.use(express.static("public"));
app.use(express.json());

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);


app.listen(PORT, console.log("server started"));
