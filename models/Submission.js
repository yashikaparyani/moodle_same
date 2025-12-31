const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema({
  activityId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Activity",
    required: true
  },
  
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User",
    required: true
  },
  
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course"
  },
  
  // Submission type
  submissionType: {
    type: String,
    enum: ["file", "text", "both"],
    required: true
  },
  
  // File submission
  files: [{
    filename: String,
    url: String,
    size: Number,
    mimeType: String,
    uploadedAt: Date
  }],
  
  // Text submission
  textContent: String,
  
  // Submission details
  submittedAt: {
    type: Date,
    default: Date.now
  },
  
  isLate: {
    type: Boolean,
    default: false
  },
  
  attemptNumber: {
    type: Number,
    default: 1
  },
  
  // Status
  status: {
    type: String,
    enum: ["draft", "submitted", "graded", "returned", "reopened"],
    default: "submitted"
  },
  
  // Grading
  grade: Number,
  maxGrade: Number,
  gradePercentage: Number,
  
  gradedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  
  gradedAt: Date,
  
  // Feedback
  feedback: String,
  feedbackFiles: [{
    filename: String,
    url: String
  }],
  
  // Inline comments/annotations
  comments: [{
    text: String,
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Plagiarism check
  plagiarismCheck: {
    checked: Boolean,
    score: Number,
    report: String
  },
  
  // Group submission
  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Group"
  },
  
  // Legacy fields
  assessmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Assessment" },
  candidateId: { type: mongoose.Schema.Types.ObjectId, ref: "Candidate" },
  fileUrl: String,
  marks: Number,
  evaluatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  evaluatedAt: Date
  
}, { timestamps: true });

// Indexes
submissionSchema.index({ activityId: 1, userId: 1, attemptNumber: 1 });
submissionSchema.index({ status: 1 });
submissionSchema.index({ courseId: 1, status: 1 });

module.exports = mongoose.model("Submission", submissionSchema);
