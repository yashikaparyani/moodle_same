const mongoose = require("mongoose");

const quizSchema = new mongoose.Schema({
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course"
  },
  title: String,
  timeLimit: Number,
  totalMarks: Number
});

module.exports = mongoose.model("Quiz", quizSchema);
