// scripts/initializeSettings.js
/**
 * Initialize default system settings
 * Run this script once after database setup
 */

const mongoose = require("mongoose");
const Settings = require("../models/Settings");

const defaultSettings = {
  siteName: "Learning Management System",
  siteDescription: "A comprehensive learning management system",
  supportEmail: "support@lms.com",
  
  theme: {
    primaryColor: "#1976d2",
    secondaryColor: "#dc004e",
    fontFamily: "Roboto, Arial, sans-serif"
  },
  
  authentication: {
    allowSelfRegistration: true,
    requireEmailVerification: true,
    defaultRole: "student",
    passwordMinLength: 8,
    passwordRequireUppercase: true,
    passwordRequireNumbers: true,
    passwordRequireSpecialChars: false,
    sessionTimeout: 3600,
    enableOAuth: false,
    oauthProviders: []
  },
  
  course: {
    defaultCourseFormat: "topics",
    allowGuestAccess: false,
    maxUploadSize: 10485760 // 10MB
  },
  
  grading: {
    showGradeLetters: true,
    showGradePercentages: true
  },
  
  notifications: {
    enableEmailNotifications: true,
    enablePushNotifications: false,
    notificationFrequency: "immediate"
  },
  
  localization: {
    defaultLanguage: "en",
    defaultTimezone: "UTC",
    dateFormat: "DD/MM/YYYY",
    timeFormat: "HH:mm"
  },
  
  storage: {
    provider: "local",
    localPath: "./uploads"
  },
  
  videoConferencing: {
    enabled: false,
    provider: "jitsi"
  },
  
  analytics: {
    enabled: false
  },
  
  maintenance: {
    enabled: false,
    message: "System is under maintenance. Please check back later."
  }
};

async function initializeSettings() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/lms", {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log("Connected to database");

    // Check if settings already exist
    const existingSettings = await Settings.findOne();
    
    if (existingSettings) {
      console.log("Settings already exist. Skipping initialization.");
      process.exit(0);
    }

    // Create default settings
    const settings = await Settings.create(defaultSettings);
    console.log("Successfully created default system settings");
    console.log("Site Name:", settings.siteName);

    process.exit(0);
  } catch (error) {
    console.error("Error initializing settings:", error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  initializeSettings();
}

module.exports = initializeSettings;
