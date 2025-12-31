// models/Grade.js
const mongoose = require("mongoose");

const gradeSchema = new mongoose.Schema({
  candidateId: { type: mongoose.Schema.Types.ObjectId, ref: "Candidate" },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
  batchId: { type: mongoose.Schema.Types.ObjectId, ref: "Batch" },
  assessmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Assessment" },
  marks: Number,
  grade: String,
  gradedAt: Date
});

module.exports = mongoose.model("Grade", gradeSchema);
