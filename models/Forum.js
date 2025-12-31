// models/Forum.js
const mongoose = require("mongoose");

const forumSchema = new mongoose.Schema({
  activityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Activity",
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

  description: String,

  forumType: {
    type: String,
    enum: ["general", "single", "eachuser", "qanda", "blog"],
    default: "general"
  },

  // Subscription settings
  forceSubscribe: {
    type: Boolean,
    default: false
  },

  // Tracking
  trackingType: {
    type: String,
    enum: ["off", "optional", "on"],
    default: "optional"
  },

  // Post settings
  maxAttachments: {
    type: Number,
    default: 5
  },

  maxBytes: {
    type: Number,
    default: 5242880 // 5MB
  },

  // Grading
  graded: {
    type: Boolean,
    default: false
  },

  maxGrade: Number,

  // Advanced features
  allowDiscussions: {
    type: Boolean,
    default: true
  },

  displayWordCount: {
    type: Boolean,
    default: false
  }

}, { timestamps: true });

module.exports = mongoose.model("Forum", forumSchema);
