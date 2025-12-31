// models/Question.js
const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  assessmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Assessment" },
  question: String,
  options: [String],
  correctAnswer: Number,
  marks: Number
});

module.exports = mongoose.model("Question", questionSchema);
