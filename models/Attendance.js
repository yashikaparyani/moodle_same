// models/Attendance.js
const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({
  batchId: { type: mongoose.Schema.Types.ObjectId, ref: "Batch" },
  candidateId: { type: mongoose.Schema.Types.ObjectId, ref: "Candidate" },
  date: Date,
  status: { type: String, enum: ["present", "absent"] }
});

module.exports = mongoose.model("Attendance", attendanceSchema);
