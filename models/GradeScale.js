// models/GradeScale.js
const mongoose = require("mongoose");

const gradeScaleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },

  description: String,

  // Course-specific or system-wide
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course"
  },

  // Scale items
  items: [{
    value: String, // A, B, C or Excellent, Good, etc.
    minPercentage: Number,
    maxPercentage: Number,
    grade: Number, // Numeric equivalent
    description: String
  }],

  // Default scale
  isDefault: {
    type: Boolean,
    default: false
  },

  isActive: {
    type: Boolean,
    default: true
  },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }

}, { timestamps: true });

module.exports = mongoose.model("GradeScale", gradeScaleSchema);
