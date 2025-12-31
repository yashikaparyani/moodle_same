// models/Message.js
const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  fromUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  toUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  subject: {
    type: String,
    required: true
  },

  body: {
    type: String,
    required: true
  },

  isRead: {
    type: Boolean,
    default: false
  },

  readAt: Date,

  isDeleted: {
    type: Boolean,
    default: false
  },

  deletedBy: {
    type: String,
    enum: ["sender", "receiver", "both"]
  },

  // Thread support
  threadId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Message"
  },

  attachments: [{
    filename: String,
    url: String,
    size: Number
  }]

}, { timestamps: true });

// Indexes for efficient queries
messageSchema.index({ toUserId: 1, isRead: 1, createdAt: -1 });
messageSchema.index({ fromUserId: 1, createdAt: -1 });
messageSchema.index({ threadId: 1 });

module.exports = mongoose.model("Message", messageSchema);
