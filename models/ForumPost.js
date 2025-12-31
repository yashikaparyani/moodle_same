// models/ForumPost.js
const mongoose = require("mongoose");

const forumPostSchema = new mongoose.Schema({
  forumId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Forum",
    required: true
  },

  discussionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ForumPost",
    default: null // null if this is a discussion, otherwise it's a reply
  },

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  subject: String,

  message: {
    type: String,
    required: true
  },

  attachments: [{
    filename: String,
    url: String,
    size: Number,
    mimeType: String
  }],

  // For threaded discussions
  parentPostId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ForumPost",
    default: null
  },

  // Engagement
  likes: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    likedAt: {
      type: Date,
      default: Date.now
    }
  }],

  isPinned: {
    type: Boolean,
    default: false
  },

  isDeleted: {
    type: Boolean,
    default: false
  },

  // Moderation
  editedAt: Date,
  editedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }

}, { timestamps: true });

// Indexes
forumPostSchema.index({ forumId: 1, createdAt: -1 });
forumPostSchema.index({ discussionId: 1 });
forumPostSchema.index({ userId: 1 });

module.exports = mongoose.model("ForumPost", forumPostSchema);
