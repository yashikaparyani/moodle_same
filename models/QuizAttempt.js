// models/QuizAttempt.js
const mongoose = require("mongoose");

const quizAttemptSchema = new mongoose.Schema({
  quizId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Quiz",
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

  // Attempt details
  attemptNumber: {
    type: Number,
    required: true
  },

  startedAt: {
    type: Date,
    default: Date.now
  },

  submittedAt: Date,

  // Time tracking
  timeSpent: Number, // in seconds

  // Status
  status: {
    type: String,
    enum: ["in_progress", "submitted", "abandoned", "timed_out"],
    default: "in_progress"
  },

  // Responses
  responses: [{
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Question"
    },
    answer: mongoose.Schema.Types.Mixed, // Can be string, number, array
    isCorrect: Boolean,
    marksAwarded: Number,
    feedback: String,
    timeSpent: Number
  }],

  // Grading
  totalMarks: Number,
  marksObtained: Number,
  percentage: Number,
  grade: String,
  isPassing: Boolean,

  // Auto-grading
  autoGraded: {
    type: Boolean,
    default: false
  },

  gradedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  gradedAt: Date,

  // Feedback
  overallFeedback: String,

  // Browser/security info
  ipAddress: String,
  userAgent: String,

  // Review settings
  canReview: {
    type: Boolean,
    default: true
  }

}, { timestamps: true });

// Indexes
quizAttemptSchema.index({ quizId: 1, userId: 1, attemptNumber: 1 }, { unique: true });
quizAttemptSchema.index({ userId: 1, status: 1 });

module.exports = mongoose.model("QuizAttempt", quizAttemptSchema);
