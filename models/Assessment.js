// models/Assessment.js
const mongoose = require("mongoose");

const assessmentSchema = new mongoose.Schema({
  courseId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Course",
    required: true
  },
  
  batchId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Batch" 
  },
  
  activityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Activity"
  },
  
  title: {
    type: String,
    required: true
  },
  
  description: String,
  
  type: { 
    type: String, 
    enum: ["quiz", "assignment", "exam", "practical", "presentation", "project"],
    required: true
  },
  
  // Grading
  totalMarks: {
    type: Number,
    required: true
  },
  
  passingMarks: Number,
  
  weightage: {
    type: Number,
    default: 1 // Weight in final grade calculation
  },
  
  gradingMethod: {
    type: String,
    enum: ["points", "percentage", "rubric", "scale"],
    default: "points"
  },
  
  rubric: {
    criteria: [{
      name: String,
      description: String,
      maxPoints: Number,
      levels: [{
        name: String,
        points: Number,
        description: String
      }]
    }]
  },
  
  // Timing
  startTime: Date,
  endTime: Date,
  duration: Number, // in minutes
  
  // Settings
  attemptsAllowed: {
    type: Number,
    default: 1
  },
  
  allowLateSubmission: {
    type: Boolean,
    default: false
  },
  
  latePenalty: {
    percentage: Number,
    perDay: Boolean
  },
  
  // Visibility
  publishGrades: {
    type: Boolean,
    default: true
  },
  
  anonymousGrading: {
    type: Boolean,
    default: false
  },
  
  // Status
  status: {
    type: String,
    enum: ["draft", "active", "closed", "archived"],
    default: "draft"
  },
  
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }
  
}, { timestamps: true });

// Indexes
assessmentSchema.index({ courseId: 1, status: 1 });
assessmentSchema.index({ batchId: 1 });

module.exports = mongoose.model("Assessment", assessmentSchema);
