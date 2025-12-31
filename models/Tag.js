// models/Tag.js
const mongoose = require("mongoose");

const tagSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },

  description: String,

  // Context
  tagType: {
    type: String,
    enum: ["course", "activity", "user", "question", "general"],
    default: "general"
  },

  // Color for UI
  color: String,

  // Usage count
  usageCount: {
    type: Number,
    default: 0
  },

  // For official/system tags
  isOfficial: {
    type: Boolean,
    default: false
  },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }

}, { timestamps: true });

// Index
tagSchema.index({ name: 1 });
tagSchema.index({ tagType: 1 });

module.exports = mongoose.model("Tag", tagSchema);
