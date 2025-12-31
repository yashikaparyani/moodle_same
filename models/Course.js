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

  /* ===== COURSE IMAGE ===== */
  courseImage: {
    type: String // URL or file path
  },

  /* ===== FORMAT ===== */
  format: {
    type: String,
    default: "custom_sections"
  },

  hiddenSections: {
    type: String,
    enum: ["hidden", "collapsed"],
    default: "hidden"
  },

  layout: {
    type: String,
    enum: ["single_page", "multiple_pages"],
    default: "single_page"
  },

  /* ===== APPEARANCE ===== */
  forceLanguage: {
    type: String,
    default: null
  },

  announcementCount: {
    type: Number,
    default: 5
  },

  showGradebook: {
    type: Boolean,
    default: true
  },

  showActivityReports: {
    type: Boolean,
    default: false
  },

  showActivityDates: {
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

  /* ===== GROUPS ===== */
  groupMode: {
    type: String,
    enum: ["no_groups", "separate", "visible"],
    default: "no_groups"
  },

  forceGroupMode: {
    type: Boolean,
    default: false
  },

  defaultGrouping: {
    type: String,
    default: null
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
