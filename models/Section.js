// models/Section.js
const mongoose = require("mongoose");

const sectionSchema = new mongoose.Schema({
  courseId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Course",
    required: true
  },
  
  title: {
    type: String,
    required: true
  },
  
  summary: String,
  
  order: {
    type: Number,
    default: 0
  },
  
  // Visibility
  visible: {
    type: Boolean,
    default: true
  },
  
  // Availability dates
  availableFrom: Date,
  availableUntil: Date,
  
  // Restrictions
  restrictions: [{
    type: {
      type: String,
      enum: ["date", "grade", "completion", "group"]
    },
    value: mongoose.Schema.Types.Mixed
  }],
  
  // Highlighted section
  isHighlighted: {
    type: Boolean,
    default: false
  },
  
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }
  
}, { timestamps: true });

// Index for efficient queries
sectionSchema.index({ courseId: 1, order: 1 });

module.exports = mongoose.model("Section", sectionSchema);
