// models/Activity.js
const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema({
  sectionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Section",
    required: true
  },
  
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true
  },

  title: {
    type: String,
    required: true
  },

  type: {
    type: String,
    enum: [
      "assignment",
      "quiz",
      "forum",
      "resource",
      "page",
      "url",
      "file",
      "scorm",
      "workshop",
      "survey",
      "feedback",
      "chat",
      "wiki",
      "glossary",
      "database",
      "lesson",
      "choice",
      "book",
      "h5p",
      "video"
    ],
    required: true
  },

  description: String,
  content: String, // For page/book type content

  // Resource-specific fields
  resourceUrl: String,
  resourceType: String, // pdf, video, link, etc.
  fileUrl: String,
  fileSize: Number,
  mimeType: String,

  // Assignment-specific fields
  dueDate: Date,
  submissionType: {
    type: String,
    enum: ["file", "text", "both", "none"]
  },
  maxGrade: Number,
  allowLateSubmission: {
    type: Boolean,
    default: false
  },
  cutoffDate: Date,

  // Quiz-specific fields
  quizId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Quiz"
  },
  timeLimit: Number, // in minutes
  attempts: Number, // allowed attempts

  // Display settings
  visibility: {
    type: String,
    enum: ["visible", "hidden", "stealth"],
    default: "visible"
  },

  availableFrom: Date,
  availableUntil: Date,

  // Completion tracking
  completionEnabled: {
    type: Boolean,
    default: true
  },

  completionCriteria: {
    viewRequired: Boolean,
    gradeRequired: Boolean,
    minimumGrade: Number,
    submitRequired: Boolean,
    postInForum: Boolean
  },

  // Ordering
  order: {
    type: Number,
    default: 0
  },

  // Access restrictions
  restrictions: [{
    type: {
      type: String,
      enum: ["date", "grade", "completion", "group"]
    },
    value: mongoose.Schema.Types.Mixed
  }],

  // Settings
  settings: mongoose.Schema.Types.Mixed,

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }

}, { timestamps: true });

// Index for efficient queries
activitySchema.index({ courseId: 1, sectionId: 1, order: 1 });
activitySchema.index({ type: 1 });

module.exports = mongoose.model("Activity", activitySchema);
