// models/Report.js
const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema({
  // Report type
  reportType: {
    type: String,
    enum: [
      "course_completion",
      "user_activity",
      "grade_report",
      "quiz_statistics",
      "participation",
      "login_report",
      "assignment_submission",
      "forum_activity",
      "custom"
    ],
    required: true
  },

  title: {
    type: String,
    required: true
  },

  description: String,

  // Context
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course"
  },

  batchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Batch"
  },

  // Filters
  filters: {
    startDate: Date,
    endDate: Date,
    userIds: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }],
    activityIds: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Activity"
    }],
    customFilters: mongoose.Schema.Types.Mixed
  },

  // Report data (stored JSON)
  data: mongoose.Schema.Types.Mixed,

  // Generated file
  fileUrl: String,
  fileFormat: {
    type: String,
    enum: ["pdf", "excel", "csv", "json"],
    default: "pdf"
  },

  // Scheduling
  isScheduled: {
    type: Boolean,
    default: false
  },

  schedule: {
    frequency: {
      type: String,
      enum: ["daily", "weekly", "monthly", "quarterly", "yearly"]
    },
    dayOfWeek: Number,
    dayOfMonth: Number,
    time: String,
    nextRunDate: Date
  },

  // Recipients for scheduled reports
  recipients: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }],

  // Generation details
  generatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  generatedAt: Date,

  // Status
  status: {
    type: String,
    enum: ["draft", "generating", "completed", "failed"],
    default: "draft"
  },

  errorMessage: String

}, { timestamps: true });

// Indexes
reportSchema.index({ reportType: 1, courseId: 1 });
reportSchema.index({ generatedBy: 1, createdAt: -1 });
reportSchema.index({ isScheduled: 1, "schedule.nextRunDate": 1 });

module.exports = mongoose.model("Report", reportSchema);
