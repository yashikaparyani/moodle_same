// models/Role.js
const mongoose = require("mongoose");

const roleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },

  displayName: {
    type: String,
    required: true
  },

  description: String,

  // Role type
  type: {
    type: String,
    enum: ["system", "custom"],
    default: "custom"
  },

  // Permissions
  permissions: {
    // Course permissions
    course: {
      create: { type: Boolean, default: false },
      view: { type: Boolean, default: false },
      edit: { type: Boolean, default: false },
      delete: { type: Boolean, default: false },
      enroll: { type: Boolean, default: false },
      unenroll: { type: Boolean, default: false }
    },

    // User permissions
    user: {
      create: { type: Boolean, default: false },
      view: { type: Boolean, default: false },
      edit: { type: Boolean, default: false },
      delete: { type: Boolean, default: false },
      assignRole: { type: Boolean, default: false }
    },

    // Activity permissions
    activity: {
      create: { type: Boolean, default: false },
      view: { type: Boolean, default: false },
      edit: { type: Boolean, default: false },
      delete: { type: Boolean, default: false },
      grade: { type: Boolean, default: false }
    },

    // Assessment permissions
    assessment: {
      create: { type: Boolean, default: false },
      view: { type: Boolean, default: false },
      edit: { type: Boolean, default: false },
      delete: { type: Boolean, default: false },
      grade: { type: Boolean, default: false },
      viewAllSubmissions: { type: Boolean, default: false }
    },

    // Forum permissions
    forum: {
      createDiscussion: { type: Boolean, default: false },
      reply: { type: Boolean, default: false },
      viewDiscussions: { type: Boolean, default: false },
      editAnyPost: { type: Boolean, default: false },
      deleteAnyPost: { type: Boolean, default: false }
    },

    // Report permissions
    report: {
      viewCourseReports: { type: Boolean, default: false },
      viewUserReports: { type: Boolean, default: false },
      exportReports: { type: Boolean, default: false }
    },

    // System permissions
    system: {
      manageSystem: { type: Boolean, default: false },
      manageCategories: { type: Boolean, default: false },
      manageBadges: { type: Boolean, default: false },
      viewLogs: { type: Boolean, default: false }
    }
  },

  // Context where role can be assigned
  context: {
    type: String,
    enum: ["system", "course", "category"],
    default: "course"
  }

}, { timestamps: true });

module.exports = mongoose.model("Role", roleSchema);
