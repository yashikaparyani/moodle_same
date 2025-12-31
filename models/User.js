// models/User.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["admin", "trainer", "candidate"], required: true },
  linkedCandidateId: { type: mongoose.Schema.Types.ObjectId, ref: "Candidate" },
  status: { type: String, default: "active" }
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
