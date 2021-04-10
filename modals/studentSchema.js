const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    require: true,
    unique: true,
  },
  password: {
    type: String,
    require: true,
  },
  dob: {
    type: Date,
    require: true,
  },
  reg: {
    type: String,
    require: true,
    unique: true,
  },
  branch: {
    type: String,
    require: true,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  token: { type: String },
});

module.exports = mongoose.model("Student", studentSchema);
