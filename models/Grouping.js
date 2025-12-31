// models/Grouping.js
const mongoose = require("mongoose");

const groupingSchema = new mongoose.Schema({
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

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }

}, { timestamps: true });

module.exports = mongoose.model("Grouping", groupingSchema);
