const mongoose = require("mongoose");

const enrollmentSchema = new mongoose.Schema({
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course"
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  progress: { type: Number, default: 0 },
  enrolledAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Enrollment", enrollmentSchema);
