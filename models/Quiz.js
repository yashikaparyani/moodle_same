const mongoose = require("mongoose");

const quizSchema = new mongoose.Schema({
  activityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Activity",
    required: true
  },
  
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true
  },
  
  title: {
    type: String,
    required: true
  },
  
  description: String,
  
  // Timing
  timeLimit: Number, // in minutes
  openDate: Date,
  closeDate: Date,
  
  // Grading
  totalMarks: Number,
  passingGrade: Number,
  gradeToPass: Number,
  
  gradeMethod: {
    type: String,
    enum: ["highest", "average", "first", "last"],
    default: "highest"
  },
  
  // Attempts
  attemptsAllowed: {
    type: Number,
    default: 1 // 0 = unlimited
  },
  
  // Question behavior
  questionBehavior: {
    type: String,
    enum: ["deferred", "immediate", "interactive"],
    default: "deferred"
  },
  
  shuffleQuestions: {
    type: Boolean,
    default: false
  },
  
  shuffleAnswers: {
    type: Boolean,
    default: true
  },
  
  // Navigation
  navigationMethod: {
    type: String,
    enum: ["free", "sequential"],
    default: "free"
  },
  
  // Review options
  reviewOptions: {
    duringAttempt: {
      showCorrectness: { type: Boolean, default: false },
      showMarks: { type: Boolean, default: false },
      showFeedback: { type: Boolean, default: false }
    },
    afterAttempt: {
      showCorrectness: { type: Boolean, default: true },
      showMarks: { type: Boolean, default: true },
      showFeedback: { type: Boolean, default: true }
    }
  },
  
  // Security
  requirePassword: {
    type: Boolean,
    default: false
  },
  
  password: String,
  
  browserSecurity: {
    type: String,
    enum: ["none", "popup", "full_screen"],
    default: "none"
  },
  
  // Overall feedback
  overallFeedback: [{
    gradeFrom: Number,
    gradeTo: Number,
    feedback: String
  }],
  
  // Questions
  questions: [{
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Question"
    },
    order: Number,
    marks: Number
  }],
  
  status: {
    type: String,
    enum: ["draft", "active", "archived"],
    default: "draft"
  },
  
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }
  
}, { timestamps: true });

// Indexes
quizSchema.index({ courseId: 1 });
quizSchema.index({ activityId: 1 });

module.exports = mongoose.model("Quiz", quizSchema);
