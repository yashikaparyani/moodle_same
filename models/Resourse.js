// models/Resource.js (Fixed typo from Resourse.js)
const mongoose = require("mongoose");

const resourceSchema = new mongoose.Schema({
  sectionId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Section",
    required: true
  },
  
  activityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Activity"
  },
  
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course"
  },
  
  type: { 
    type: String, 
    enum: ["pdf", "video", "link", "file", "audio", "document", "presentation", "spreadsheet", "image", "archive"],
    required: true
  },
  
  title: {
    type: String,
    required: true
  },
  
  description: String,
  
  url: String,
  
  // File information (if uploaded)
  fileId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "File"
  },
  
  fileName: String,
  fileSize: Number,
  mimeType: String,
  
  // For external links
  externalUrl: String,
  openInNewWindow: {
    type: Boolean,
    default: true
  },
  
  // Display settings
  displayInline: {
    type: Boolean,
    default: false
  },
  
  showSize: {
    type: Boolean,
    default: true
  },
  
  showType: {
    type: Boolean,
    default: true
  },
  
  // Access tracking
  viewCount: {
    type: Number,
    default: 0
  },
  
  downloadCount: {
    type: Number,
    default: 0
  },
  
  // Ordering
  order: {
    type: Number,
    default: 0
  },
  
  // Visibility
  visible: {
    type: Boolean,
    default: true
  },
  
  availableFrom: Date,
  availableUntil: Date,
  
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }
  
}, { timestamps: true });

// Indexes
resourceSchema.index({ sectionId: 1, order: 1 });
resourceSchema.index({ activityId: 1 });
resourceSchema.index({ courseId: 1 });

module.exports = mongoose.model("Resource", resourceSchema);
