// models/Notification.js
const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  type: {
    type: String,
    enum: [
      "course_enrollment",
      "assignment_due",
      "assignment_graded",
      "quiz_available",
      "quiz_graded",
      "forum_post",
      "forum_reply",
      "message_received",
      "badge_earned",
      "certificate_issued",
      "course_updated",
      "announcement",
      "reminder",
      "system"
    ],
    required: true
  },

  title: {
    type: String,
    required: true
  },

  message: {
    type: String,
    required: true
  },

  // Reference to related entity
  relatedType: {
    type: String,
    enum: ["Course", "Activity", "Assessment", "Forum", "ForumPost", "Message", "Badge", "Certificate"]
  },

  relatedId: mongoose.Schema.Types.ObjectId,

  // Link to navigate to
  actionUrl: String,

  isRead: {
    type: Boolean,
    default: false
  },

  readAt: Date,

  priority: {
    type: String,
    enum: ["low", "normal", "high"],
    default: "normal"
  },

  // For scheduled notifications
  scheduledFor: Date,
  isSent: {
    type: Boolean,
    default: false
  },

  // Delivery channels
  channels: {
    web: { type: Boolean, default: true },
    email: { type: Boolean, default: false },
    sms: { type: Boolean, default: false }
  }

}, { timestamps: true });

// Indexes
notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ scheduledFor: 1, isSent: 1 });

module.exports = mongoose.model("Notification", notificationSchema);
