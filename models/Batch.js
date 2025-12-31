// models/Batch.js
const mongoose = require("mongoose");

const batchSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  
  code: {
    type: String,
    unique: true,
    sparse: true
  },
  
  description: String,
  
  courseId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Course",
    required: true
  },
  
  // Instructor/Trainer
  trainerId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User" 
  },
  
  instructors: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }],
  
  // Schedule
  startDate: {
    type: Date,
    required: true
  },
  
  endDate: Date,
  
  schedule: [{
    dayOfWeek: {
      type: Number,
      min: 0,
      max: 6 // 0 = Sunday, 6 = Saturday
    },
    startTime: String, // HH:mm format
    endTime: String,
    venue: String,
    isOnline: Boolean
  }],
  
  // Capacity
  capacity: {
    type: Number,
    default: 30
  },
  
  currentEnrollment: {
    type: Number,
    default: 0
  },
  
  // Enrollment settings
  enrollmentOpen: {
    type: Boolean,
    default: true
  },
  
  enrollmentKey: String, // For self-enrollment
  
  // Status
  status: {
    type: String,
    enum: ["draft", "active", "completed", "cancelled", "archived"],
    default: "draft"
  },
  
  // Location
  venue: String,
  isOnline: {
    type: Boolean,
    default: false
  },
  
  meetingUrl: String,
  
  // Category/Type
  batchType: {
    type: String,
    enum: ["regular", "weekend", "fast_track", "online", "hybrid"]
  },
  
  // Fees
  fees: {
    amount: Number,
    currency: String,
    dueDate: Date
  },
  
  // Custom fields
  customFields: mongoose.Schema.Types.Mixed,
  
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }
  
}, { timestamps: true });

// Indexes
batchSchema.index({ courseId: 1, status: 1 });
batchSchema.index({ startDate: 1, endDate: 1 });
batchSchema.index({ code: 1 });

module.exports = mongoose.model("Batch", batchSchema);
