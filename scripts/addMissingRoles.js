// scripts/addMissingRoles.js
/**
 * Add missing Course Creator and Non-editing Teacher roles
 * Run this if roles already exist in database
 */

const mongoose = require("mongoose");
const Role = require("../models/Role");
require('dotenv').config();

const missingRoles = [
  {
    name: "course_creator",
    displayName: "Course Creator",
    description: "Can create and manage their own courses",
    type: "system",
    permissions: {
      course: { create: true, view: true, edit: true, delete: true, enroll: false, unenroll: false },
      user: { create: false, view: true, edit: false, delete: false, assignRole: false },
      activity: { create: true, view: true, edit: true, delete: true, grade: false },
      assessment: { create: true, view: true, edit: true, delete: true, grade: false, viewAllSubmissions: false },
      forum: { createDiscussion: true, reply: true, viewDiscussions: true, editAnyPost: false, deleteAnyPost: false },
      report: { viewCourseReports: true, viewUserReports: false, exportReports: false },
      system: { manageSystem: false, manageCategories: false, manageBadges: false, viewLogs: false }
    },
    context: "course"
  },
  {
    name: "non_editing_teacher",
    displayName: "Non-editing Teacher",
    description: "Can grade and interact but cannot edit course content",
    type: "system",
    permissions: {
      course: { create: false, view: true, edit: false, delete: false, enroll: false, unenroll: false },
      user: { create: false, view: true, edit: false, delete: false, assignRole: false },
      activity: { create: false, view: true, edit: false, delete: false, grade: true },
      assessment: { create: false, view: true, edit: false, delete: false, grade: true, viewAllSubmissions: true },
      forum: { createDiscussion: true, reply: true, viewDiscussions: true, editAnyPost: false, deleteAnyPost: false },
      report: { viewCourseReports: true, viewUserReports: false, exportReports: false },
      system: { manageSystem: false, manageCategories: false, manageBadges: false, viewLogs: false }
    },
    context: "course"
  }
];

async function addMissingRoles() {
  try {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/moodle_lms");
    console.log("✅ Connected to database");

    for (const roleData of missingRoles) {
      // Check if role already exists
      const existingRole = await Role.findOne({ name: roleData.name });
      
      if (existingRole) {
        console.log(`⏭️  Role '${roleData.displayName}' already exists - skipping`);
        continue;
      }

      // Create new role
      const newRole = await Role.create(roleData);
      console.log(`✅ Created role: ${newRole.displayName} (${newRole.name})`);
    }

    console.log("\n✅ All missing roles have been added!");
    
    // Display all system roles
    const allRoles = await Role.find({ type: "system" }).select('name displayName');
    console.log("\n📋 Current System Roles:");
    allRoles.forEach(role => {
      console.log(`   - ${role.displayName} (${role.name})`);
    });

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error adding roles:", error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  addMissingRoles();
}

module.exports = addMissingRoles;
