// models/Event.js
const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },

  description: String,

  eventType: {
    type: String,
    enum: ["user", "course", "category", "site"],
    required: true
  },

  // Event category
  category: {
    type: String,
    enum: ["assignment", "quiz", "exam", "meeting", "holiday", "deadline", "other"],
    default: "other"
  },

  // Related entities
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course"
  },

  activityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Activity"
  },

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  // Timing
  startDate: {
    type: Date,
    required: true
  },

  endDate: Date,

  duration: Number, // in minutes

  allDay: {
    type: Boolean,
    default: false
  },

  // Recurrence
  isRecurring: {
    type: Boolean,
    default: false
  },

  recurrencePattern: {
    frequency: {
      type: String,
      enum: ["daily", "weekly", "monthly", "yearly"]
    },
    interval: Number,
    endDate: Date
  },

  // Location
  location: String,
  virtualMeetingUrl: String,

  // Visibility
  visibility: {
    type: String,
    enum: ["public", "private", "course"],
    default: "public"
  },

  // Reminders
  reminders: [{
    time: Number, // minutes before event
    sent: Boolean
  }],

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }

}, { timestamps: true });

// Indexes
eventSchema.index({ startDate: 1, endDate: 1 });
eventSchema.index({ courseId: 1, startDate: 1 });
eventSchema.index({ userId: 1, startDate: 1 });

module.exports = mongoose.model("Event", eventSchema);
