// scripts/initializeRoles.js
/**
 * Initialize default roles and permissions
 * Run this script once after database setup
 */

const mongoose = require("mongoose");
const Role = require("../models/Role");

const defaultRoles = [
  {
    name: "admin",
    displayName: "Administrator",
    description: "Full system access",
    type: "system",
    permissions: {
      course: { create: true, view: true, edit: true, delete: true, enroll: true, unenroll: true },
      user: { create: true, view: true, edit: true, delete: true, assignRole: true },
      activity: { create: true, view: true, edit: true, delete: true, grade: true },
      assessment: { create: true, view: true, edit: true, delete: true, grade: true, viewAllSubmissions: true },
      forum: { createDiscussion: true, reply: true, viewDiscussions: true, editAnyPost: true, deleteAnyPost: true },
      report: { viewCourseReports: true, viewUserReports: true, exportReports: true },
      system: { manageSystem: true, manageCategories: true, manageBadges: true, viewLogs: true }
    },
    context: "system"
  },
  {
    name: "teacher",
    displayName: "Teacher/Instructor",
    description: "Can create and manage courses",
    type: "system",
    permissions: {
      course: { create: true, view: true, edit: true, delete: false, enroll: true, unenroll: true },
      user: { create: false, view: true, edit: false, delete: false, assignRole: false },
      activity: { create: true, view: true, edit: true, delete: true, grade: true },
      assessment: { create: true, view: true, edit: true, delete: true, grade: true, viewAllSubmissions: true },
      forum: { createDiscussion: true, reply: true, viewDiscussions: true, editAnyPost: true, deleteAnyPost: true },
      report: { viewCourseReports: true, viewUserReports: true, exportReports: true },
      system: { manageSystem: false, manageCategories: false, manageBadges: false, viewLogs: false }
    },
    context: "course"
  },
  {
    name: "student",
    displayName: "Student",
    description: "Can enroll in courses and submit assignments",
    type: "system",
    permissions: {
      course: { create: false, view: true, edit: false, delete: false, enroll: false, unenroll: false },
      user: { create: false, view: false, edit: false, delete: false, assignRole: false },
      activity: { create: false, view: true, edit: false, delete: false, grade: false },
      assessment: { create: false, view: true, edit: false, delete: false, grade: false, viewAllSubmissions: false },
      forum: { createDiscussion: true, reply: true, viewDiscussions: true, editAnyPost: false, deleteAnyPost: false },
      report: { viewCourseReports: false, viewUserReports: false, exportReports: false },
      system: { manageSystem: false, manageCategories: false, manageBadges: false, viewLogs: false }
    },
    context: "course"
  },
  {
    name: "teaching_assistant",
    displayName: "Teaching Assistant",
    description: "Can help with course management and grading",
    type: "system",
    permissions: {
      course: { create: false, view: true, edit: true, delete: false, enroll: true, unenroll: false },
      user: { create: false, view: true, edit: false, delete: false, assignRole: false },
      activity: { create: true, view: true, edit: true, delete: false, grade: true },
      assessment: { create: true, view: true, edit: true, delete: false, grade: true, viewAllSubmissions: true },
      forum: { createDiscussion: true, reply: true, viewDiscussions: true, editAnyPost: true, deleteAnyPost: false },
      report: { viewCourseReports: true, viewUserReports: false, exportReports: false },
      system: { manageSystem: false, manageCategories: false, manageBadges: false, viewLogs: false }
    },
    context: "course"
  },
  {
    name: "manager",
    displayName: "Manager",
    description: "Can manage courses and categories",
    type: "system",
    permissions: {
      course: { create: true, view: true, edit: true, delete: true, enroll: true, unenroll: true },
      user: { create: true, view: true, edit: true, delete: false, assignRole: true },
      activity: { create: true, view: true, edit: true, delete: true, grade: true },
      assessment: { create: true, view: true, edit: true, delete: true, grade: true, viewAllSubmissions: true },
      forum: { createDiscussion: true, reply: true, viewDiscussions: true, editAnyPost: true, deleteAnyPost: true },
      report: { viewCourseReports: true, viewUserReports: true, exportReports: true },
      system: { manageSystem: false, manageCategories: true, manageBadges: true, viewLogs: true }
    },
    context: "category"
  },
  {
    name: "observer",
    displayName: "Observer",
    description: "Can view courses but not participate",
    type: "system",
    permissions: {
      course: { create: false, view: true, edit: false, delete: false, enroll: false, unenroll: false },
      user: { create: false, view: false, edit: false, delete: false, assignRole: false },
      activity: { create: false, view: true, edit: false, delete: false, grade: false },
      assessment: { create: false, view: true, edit: false, delete: false, grade: false, viewAllSubmissions: false },
      forum: { createDiscussion: false, reply: false, viewDiscussions: true, editAnyPost: false, deleteAnyPost: false },
      report: { viewCourseReports: false, viewUserReports: false, exportReports: false },
      system: { manageSystem: false, manageCategories: false, manageBadges: false, viewLogs: false }
    },
    context: "course"
  },
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

async function initializeRoles() {
  try {
    // Connect to database (use your connection string)
    await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/lms", {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log("Connected to database");

    // Check if roles already exist
    const existingRoles = await Role.find({ type: "system" });
    
    if (existingRoles.length > 0) {
      console.log("Roles already exist. Skipping initialization.");
      console.log(`Found ${existingRoles.length} existing roles.`);
      process.exit(0);
    }

    // Create roles
    const createdRoles = await Role.insertMany(defaultRoles);
    console.log(`Successfully created ${createdRoles.length} default roles:`);
    createdRoles.forEach(role => {
      console.log(`  - ${role.displayName} (${role.name})`);
    });

    process.exit(0);
  } catch (error) {
    console.error("Error initializing roles:", error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  initializeRoles();
}

module.exports = initializeRoles;
