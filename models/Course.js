// models/Course.js
const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({

  /* ===== GENERAL ===== */
  fullName: { type: String, required: true },
  shortName: { type: String, required: true, unique: true },
  courseCode: String, // Course ID number (optional)
  
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category"
  },

  visibility: {
    type: String,
    enum: ["show", "hide"],
    default: "show"
  },

  startDate: Date,
  endDate: Date,

  summary: String,

  /* ===== APPEARANCE ===== */
  showGradebook: {
    type: Boolean,
    default: true
  },

  /* ===== COMPLETION ===== */
  completionTracking: {
    type: Boolean,
    default: true
  },

  showCompletionConditions: {
    type: Boolean,
    default: true
  },

  /* ===== TAGS ===== */
  tags: [String],

  /* ===== META ===== */
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  status: {
    type: String,
    default: "active"
  }

}, { timestamps: true });

module.exports = mongoose.model("Course", courseSchema);
