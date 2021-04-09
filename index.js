const express = require("express");
require("dotenv").config();
const expressLayouts = require("express-ejs-layouts");
const mongoose = require("mongoose");
const app = express();

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


app.listen(PORT, console.log("server started"));
