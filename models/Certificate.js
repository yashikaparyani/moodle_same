// models/Certificate.js
const mongoose = require("mongoose");

const certificateSchema = new mongoose.Schema({
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true
  },

  name: {
    type: String,
    required: true
  },

  description: String,

  // Template
  templateUrl: String,
  templateHtml: String,

  // Criteria for issuing
  criteria: {
    completionRequired: {
      type: Boolean,
      default: true
    },
    minimumGrade: Number,
    allActivitiesComplete: {
      type: Boolean,
      default: false
    },
    specificActivities: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Activity"
    }]
  },

  // Certificate settings
  orientation: {
    type: String,
    enum: ["portrait", "landscape"],
    default: "landscape"
  },

  size: {
    type: String,
    enum: ["A4", "Letter"],
    default: "A4"
  },

  // Automatic issuance
  autoIssue: {
    type: Boolean,
    default: true
  },

  // Validity
  validityPeriod: Number, // in days, null = permanent

  // Digital signature
  digitallySign: {
    type: Boolean,
    default: false
  },

  signatureImageUrl: String,

  isActive: {
    type: Boolean,
    default: true
  },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }

}, { timestamps: true });

module.exports = mongoose.model("Certificate", certificateSchema);
