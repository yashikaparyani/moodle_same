// models/Announcement.js
const mongoose = require("mongoose");

const announcementSchema = new mongoose.Schema({
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course"
  },

  title: {
    type: String,
    required: true
  },

  content: {
    type: String,
    required: true
  },

  type: {
    type: String,
    enum: ["course", "site"],
    default: "course"
  },

  // Audience
  targetAudience: {
    type: String,
    enum: ["all", "students", "teachers", "custom"],
    default: "all"
  },

  targetRoles: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Role"
  }],

  targetUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }],

  // Publishing
  publishAt: Date,
  expiresAt: Date,

  isPinned: {
    type: Boolean,
    default: false
  },

  priority: {
    type: String,
    enum: ["low", "normal", "high", "urgent"],
    default: "normal"
  },

  // Attachments
  attachments: [{
    filename: String,
    url: String,
    size: Number
  }],

  // Notifications
  sendNotification: {
    type: Boolean,
    default: true
  },

  sendEmail: {
    type: Boolean,
    default: false
  },

  // Status
  status: {
    type: String,
    enum: ["draft", "published", "archived"],
    default: "draft"
  },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  // Read tracking
  readBy: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }]

}, { timestamps: true });

// Indexes
announcementSchema.index({ courseId: 1, publishAt: -1 });
announcementSchema.index({ type: 1, status: 1, publishAt: -1 });

module.exports = mongoose.model("Announcement", announcementSchema);
