const mongoose = require("mongoose");

const enrollmentSchema = new mongoose.Schema({
  // Organization (Multi-tenancy)
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Organization",
    required: true,
    index: true
  },
  
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true
  },
  
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  
  // Role in this specific course
  role: {
    type: String,
    enum: ["student", "teacher", "teaching_assistant", "observer"],
    default: "student"
  },
  
  // Enrollment details
  enrollmentMethod: {
    type: String,
    enum: ["manual", "self", "guest", "cohort", "imported"],
    default: "manual"
  },
  
  enrolledAt: { 
    type: Date, 
    default: Date.now 
  },
  
  enrolledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  
  // Progress tracking
  progress: { 
    type: Number, 
    min: 0,
    max: 100,
    default: 0 
  },
  
  completedActivities: {
    type: Number,
    default: 0
  },
  
  totalActivities: {
    type: Number,
    default: 0
  },
  
  // Grades
  currentGrade: Number,
  finalGrade: Number,
  letterGrade: String,
  
  // Status
  status: {
    type: String,
    enum: ["active", "suspended", "completed", "dropped", "expired"],
    default: "active"
  },
  
  // Dates
  startDate: Date,
  endDate: Date,
  completedAt: Date,
  
  // Time tracking
  totalTimeSpent: {
    type: Number, // in seconds
    default: 0
  },
  
  lastAccessedAt: Date,
  
  // Certificate
  certificateIssued: {
    type: Boolean,
    default: false
  },
  
  certificateIssuedAt: Date,
  
  // Grouping
  groupIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Group"
  }],
  
  // Notes
  notes: String,
  
  // Legacy field
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }
  
}, { timestamps: true });

// Compound index to ensure unique enrollment per organization
enrollmentSchema.index({ organizationId: 1, courseId: 1, userId: 1 }, { unique: true });
enrollmentSchema.index({ organizationId: 1, userId: 1, status: 1 });
enrollmentSchema.index({ organizationId: 1, courseId: 1, role: 1, status: 1 });

module.exports = mongoose.model("Enrollment", enrollmentSchema);
