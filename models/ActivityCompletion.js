// models/ActivityCompletion.js
const mongoose = require("mongoose");

const activityCompletionSchema = new mongoose.Schema({
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
    ref: "Course",
    required: true
  },

  // Completion status
  status: {
    type: String,
    enum: ["not_started", "in_progress", "completed"],
    default: "not_started"
  },

  // Completion details
  completedAt: Date,

  // Criteria met
  criteriaMet: {
    viewed: Boolean,
    graded: Boolean,
    gradeAchieved: Number,
    submitted: Boolean,
    postedInForum: Boolean
  },

  // Progress tracking
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },

  // Time tracking
  timeSpent: {
    type: Number, // in seconds
    default: 0
  },

  lastAccessedAt: Date,

  // Attempts (for quizzes, assignments)
  attemptCount: {
    type: Number,
    default: 0
  },

  // Grade
  grade: Number,
  gradePercentage: Number

}, { timestamps: true });

// Compound index to ensure unique completion per user per activity
activityCompletionSchema.index({ userId: 1, activityId: 1 }, { unique: true });
activityCompletionSchema.index({ courseId: 1, userId: 1 });

module.exports = mongoose.model("ActivityCompletion", activityCompletionSchema);
