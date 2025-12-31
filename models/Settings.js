// models/Settings.js
const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema({
  // Site settings
  siteName: {
    type: String,
    default: "Learning Management System"
  },

  siteDescription: String,
  siteLogo: String,
  siteFavicon: String,

  // Contact information
  supportEmail: String,
  supportPhone: String,
  address: String,

  // Theme and branding
  theme: {
    primaryColor: String,
    secondaryColor: String,
    fontFamily: String,
    customCSS: String
  },

  // Email settings
  email: {
    smtpHost: String,
    smtpPort: Number,
    smtpUser: String,
    smtpPassword: String,
    fromEmail: String,
    fromName: String
  },

  // Authentication settings
  authentication: {
    allowSelfRegistration: {
      type: Boolean,
      default: true
    },
    requireEmailVerification: {
      type: Boolean,
      default: true
    },
    defaultRole: {
      type: String,
      default: "student"
    },
    passwordMinLength: {
      type: Number,
      default: 8
    },
    passwordRequireUppercase: {
      type: Boolean,
      default: true
    },
    passwordRequireNumbers: {
      type: Boolean,
      default: true
    },
    passwordRequireSpecialChars: {
      type: Boolean,
      default: false
    },
    sessionTimeout: {
      type: Number,
      default: 3600 // seconds
    },
    enableOAuth: {
      type: Boolean,
      default: false
    },
    oauthProviders: [{
      provider: String,
      clientId: String,
      clientSecret: String,
      enabled: Boolean
    }]
  },

  // Course settings
  course: {
    defaultCourseFormat: {
      type: String,
      default: "topics"
    },
    allowGuestAccess: {
      type: Boolean,
      default: false
    },
    maxUploadSize: {
      type: Number,
      default: 10485760 // 10MB in bytes
    }
  },

  // Grading settings
  grading: {
    defaultGradeScale: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "GradeScale"
    },
    showGradeLetters: {
      type: Boolean,
      default: true
    },
    showGradePercentages: {
      type: Boolean,
      default: true
    }
  },

  // Notification settings
  notifications: {
    enableEmailNotifications: {
      type: Boolean,
      default: true
    },
    enablePushNotifications: {
      type: Boolean,
      default: false
    },
    notificationFrequency: {
      type: String,
      enum: ["immediate", "daily", "weekly"],
      default: "immediate"
    }
  },

  // Language and localization
  localization: {
    defaultLanguage: {
      type: String,
      default: "en"
    },
    defaultTimezone: {
      type: String,
      default: "UTC"
    },
    dateFormat: {
      type: String,
      default: "DD/MM/YYYY"
    },
    timeFormat: {
      type: String,
      default: "HH:mm"
    }
  },

  // File storage
  storage: {
    provider: {
      type: String,
      enum: ["local", "s3", "azure", "gcp"],
      default: "local"
    },
    localPath: String,
    s3Bucket: String,
    s3Region: String,
    s3AccessKey: String,
    s3SecretKey: String
  },

  // Video conferencing
  videoConferencing: {
    enabled: {
      type: Boolean,
      default: false
    },
    provider: {
      type: String,
      enum: ["zoom", "teams", "meet", "jitsi"],
      default: "jitsi"
    },
    apiKey: String,
    apiSecret: String
  },

  // Analytics
  analytics: {
    enabled: {
      type: Boolean,
      default: true
    },
    googleAnalyticsId: String
  },

  // Maintenance mode
  maintenance: {
    enabled: {
      type: Boolean,
      default: false
    },
    message: String
  },

  // Custom fields
  customFields: mongoose.Schema.Types.Mixed,

  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }

}, { timestamps: true });

module.exports = mongoose.model("Settings", settingsSchema);
