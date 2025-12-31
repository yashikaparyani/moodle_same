// models/Attendance.js
const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({
  batchId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Batch",
    required: true
  },
  
  candidateId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Candidate" 
  },
  
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course"
  },
  
  sessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Session"
  },
  
  date: {
    type: Date,
    required: true
  },
  
  status: { 
    type: String, 
    enum: ["present", "absent", "late", "excused", "half_day"],
    default: "present"
  },
  
  // Time tracking
  checkInTime: Date,
  checkOutTime: Date,
  duration: Number, // in minutes
  
  // Location (for online/offline tracking)
  location: String,
  ipAddress: String,
  
  // Notes
  notes: String,
  
  // Marked by
  markedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  
  markedAt: {
    type: Date,
    default: Date.now
  },
  
  // Modified info
  modifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  
  modifiedAt: Date
  
}, { timestamps: true });

// Compound index to prevent duplicate attendance
attendanceSchema.index({ batchId: 1, candidateId: 1, date: 1 }, { unique: true });
attendanceSchema.index({ userId: 1, date: 1 });

module.exports = mongoose.model("Attendance", attendanceSchema);
