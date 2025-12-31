const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  // Question bank category
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category"
  },
  
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course"
  },
  
  questionText: {
    type: String,
    required: true
  },
  
  questionType: { 
    type: String, 
    enum: [
      "multiple_choice",
      "true_false",
      "short_answer",
      "essay",
      "numerical",
      "matching",
      "calculated",
      "fill_in_blanks",
      "drag_and_drop",
      "ordering"
    ],
    required: true
  },
  
  // Default marks for this question
  defaultMarks: {
    type: Number,
    default: 1
  },
  
  // General feedback
  generalFeedback: String,
  
  // For multiple choice questions
  options: [{
    text: String,
    isCorrect: Boolean,
    feedback: String,
    fraction: Number // Partial credit (0-1)
  }],
  
  // For true/false
  correctAnswer: mongoose.Schema.Types.Mixed,
  
  // For short answer/essay
  acceptedAnswers: [{
    answer: String,
    caseSensitive: Boolean,
    fraction: Number
  }],
  
  // For matching questions
  matchingPairs: [{
    question: String,
    answer: String
  }],
  
  // For numerical questions
  numericalAnswer: {
    value: Number,
    tolerance: Number,
    unit: String
  },
  
  // For calculated questions
  formula: String,
  variables: [{
    name: String,
    min: Number,
    max: Number
  }],
  
  // For fill in the blanks
  blanks: [{
    position: Number,
    acceptedAnswers: [String],
    caseSensitive: Boolean
  }],
  
  // Hints
  hints: [{
    text: String,
    penaltyPercentage: Number
  }],
  
  // Question images/media
  attachments: [{
    type: String,
    url: String
  }],
  
  // Tags for organization
  tags: [String],
  
  // Difficulty level
  difficulty: {
    type: String,
    enum: ["easy", "medium", "hard"],
    default: "medium"
  },
  
  // Usage tracking
  usageCount: {
    type: Number,
    default: 0
  },
  
  // Status
  status: {
    type: String,
    enum: ["draft", "ready", "archived"],
    default: "draft"
  },
  
  // For question bank sharing
  isPublic: {
    type: Boolean,
    default: false
  },
  
  // Legacy fields
  assessmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Assessment" },
  question: String,
  marks: Number,
  
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }
  
}, { timestamps: true });

// Indexes
questionSchema.index({ courseId: 1, categoryId: 1 });
questionSchema.index({ questionType: 1 });
questionSchema.index({ tags: 1 });

module.exports = mongoose.model("Question", questionSchema);
