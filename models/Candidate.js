// models/Candidate.js
const mongoose = require("mongoose");

const candidateSchema = new mongoose.Schema({
  fullName: String,
  email: String,
  phone: String,
  dob: Date,
  registrationNo: String,
  status: { type: String, default: "active" }
}, { timestamps: true });

module.exports = mongoose.model("Candidate", candidateSchema);
