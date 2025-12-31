// models/BatchMember.js
const mongoose = require("mongoose");

const batchMemberSchema = new mongoose.Schema({
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
  
  // Identification
  rollNo: String,
  seatNo: String,
  
  // Enrollment
  enrolledAt: {
    type: Date,
    default: Date.now
  },
  
  enrolledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  
  // Status
  status: {
    type: String,
    enum: ["active", "inactive", "completed", "dropped", "transferred"],
    default: "active"
  },
  
  // Attendance summary
  attendanceStats: {
    totalClasses: { type: Number, default: 0 },
    present: { type: Number, default: 0 },
    absent: { type: Number, default: 0 },
    late: { type: Number, default: 0 },
    percentage: { type: Number, default: 0 }
  },
  
  // Performance
  performanceStats: {
    averageGrade: Number,
    totalAssignments: { type: Number, default: 0 },
    completedAssignments: { type: Number, default: 0 },
    totalQuizzes: { type: Number, default: 0 },
    completedQuizzes: { type: Number, default: 0 }
  },
  
  // Final results
  finalGrade: Number,
  finalPercentage: Number,
  letterGrade: String,
  rank: Number,
  
  // Completion
  completedAt: Date,
  certificateIssued: {
    type: Boolean,
    default: false
  },
  
  // Notes
  notes: String,
  
  // Payment info
  paymentStatus: {
    type: String,
    enum: ["pending", "partial", "paid", "overdue"],
    default: "pending"
  },
  
  feesPaid: Number,
  feesTotal: Number
  
}, { timestamps: true });

// Compound index to prevent duplicate memberships
batchMemberSchema.index({ batchId: 1, candidateId: 1 }, { unique: true });
batchMemberSchema.index({ batchId: 1, userId: 1 });
batchMemberSchema.index({ status: 1 });

module.exports = mongoose.model("BatchMember", batchMemberSchema);
