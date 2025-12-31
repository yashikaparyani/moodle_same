// models/Badge.js
const mongoose = require("mongoose");

const badgeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },

  description: {
    type: String,
    required: true
  },

  imageUrl: String,

  // Badge criteria
  criteria: {
    type: {
      type: String,
      enum: ["manual", "course_completion", "activity_completion", "grade", "competency", "custom"],
      required: true
    },
    
    // For course completion
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course"
    },

    // For activity completion
    activityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Activity"
    },

    // For grade-based badges
    minimumGrade: Number,

    // For custom criteria
    customDescription: String
  },

  // Badge settings
  status: {
    type: String,
    enum: ["active", "inactive", "archived"],
    default: "active"
  },

  expiryPeriod: Number, // in days, null = never expires

  // Badge issuer info
  issuerName: String,
  issuerEmail: String,
  issuerUrl: String,

  // For course-specific badges
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course"
  },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }

}, { timestamps: true });

module.exports = mongoose.model("Badge", badgeSchema);
