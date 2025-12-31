// models/Grade.js
const mongoose = require("mongoose");

const gradeSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User",
    required: true
  },
  
  courseId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Course",
    required: true
  },
  
  // Grade item (can be activity, assessment, or category)
  gradeItemType: {
    type: String,
    enum: ["activity", "assessment", "category", "course"],
    required: true
  },
  
  gradeItemId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'gradeItemType'
  },
  
  // Numeric grade
  rawGrade: Number,
  finalGrade: Number, // After applying curves, extra credit, etc.
  maxGrade: Number,
  
  // Percentage
  percentage: Number,
  
  // Letter grade
  letterGrade: String,
  
  // Pass/Fail
  isPassing: Boolean,
  
  // Scale-based grade (like rubric)
  scaleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "GradeScale"
  },
  scaleGrade: String,
  
  // Feedback
  feedback: String,
  feedbackFormat: {
    type: String,
    enum: ["text", "html"],
    default: "text"
  },
  
  // Grader information
  gradedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  
  gradedAt: Date,
  
  // Override (manual adjustment)
  isOverridden: {
    type: Boolean,
    default: false
  },
  
  overriddenBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  
  overrideReason: String,
  
  // Excluded from calculations
  isExcluded: {
    type: Boolean,
    default: false
  },
  
  // Hidden from student
  isHidden: {
    type: Boolean,
    default: false
  },
  
  // Locked (cannot be changed)
  isLocked: {
    type: Boolean,
    default: false
  },
  
  // Submission reference
  submissionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Submission"
  },
  
  attemptId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Attempt"
  },
  
  // Legacy fields
  candidateId: { type: mongoose.Schema.Types.ObjectId, ref: "Candidate" },
  batchId: { type: mongoose.Schema.Types.ObjectId, ref: "Batch" },
  assessmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Assessment" },
  marks: Number,
  grade: String
  
}, { timestamps: true });

// Indexes
gradeSchema.index({ userId: 1, courseId: 1, gradeItemType: 1, gradeItemId: 1 });
gradeSchema.index({ courseId: 1, gradeItemType: 1 });
gradeSchema.index({ submissionId: 1 });

module.exports = mongoose.model("Grade", gradeSchema);
