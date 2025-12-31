// models/Section.js
const mongoose = require("mongoose");

const sectionSchema = new mongoose.Schema({
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
  title: String,
  order: Number
});

module.exports = mongoose.model("Section", sectionSchema);
