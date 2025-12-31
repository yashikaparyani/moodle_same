// models/Attempt.js
const mongoose = require("mongoose");

const attemptSchema = new mongoose.Schema({
  assessmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Assessment" },
  candidateId: { type: mongoose.Schema.Types.ObjectId, ref: "Candidate" },
  batchId: { type: mongoose.Schema.Types.ObjectId, ref: "Batch" },
  answers: [],
  score: Number,
  status: String,
  submittedAt: Date
});

module.exports = mongoose.model("Attempt", attemptSchema);
