// models/Assessment.js
const mongoose = require("mongoose");

const assessmentSchema = new mongoose.Schema({
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
  batchId: { type: mongoose.Schema.Types.ObjectId, ref: "Batch" },
  title: String,
  type: { type: String, enum: ["quiz", "assignment", "exam"] },
  totalMarks: Number,
  startTime: Date,
  endTime: Date,
  gradingMethod: String
});

module.exports = mongoose.model("Assessment", assessmentSchema);
