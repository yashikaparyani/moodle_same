// models/Group.js
const mongoose = require("mongoose");

const groupSchema = new mongoose.Schema({
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

  // Grouping (collection of groups)
  groupingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Grouping"
  },

  // Picture
  pictureUrl: String,

  // Enrollment key for self-enrollment
  enrollmentKey: String,

  // Capacity
  maxMembers: Number,

  // Messaging
  enableMessaging: {
    type: Boolean,
    default: true
  },

  // Visibility
  visibility: {
    type: String,
    enum: ["visible", "hidden"],
    default: "visible"
  },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }

}, { timestamps: true });

module.exports = mongoose.model("Group", groupSchema);
