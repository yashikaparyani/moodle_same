// models/Submission.js
const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema({
  assessmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Assessment" },
  candidateId: { type: mongoose.Schema.Types.ObjectId, ref: "Candidate" },
  fileUrl: String,
  marks: Number,
  feedback: String,
  evaluatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  evaluatedAt: Date
});

module.exports = mongoose.model("Submission", submissionSchema);
