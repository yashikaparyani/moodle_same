// models/Batch.js
const mongoose = require("mongoose");

const batchSchema = new mongoose.Schema({
  name: String,
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
  trainerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  startDate: Date,
  endDate: Date,
  capacity: Number,
  status: String
});

module.exports = mongoose.model("Batch", batchSchema);
