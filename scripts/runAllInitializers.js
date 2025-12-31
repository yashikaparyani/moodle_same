// scripts/runAllInitializers.js
/**
 * Run all initialization scripts
 * Execute this once after setting up the database
 */

const initializeRoles = require('./initializeRoles');
const initializeSettings = require('./initializeSettings');
const initializeGradeScales = require('./initializeGradeScales');

async function runAllInitializers() {
  console.log("=================================");
  console.log("Starting LMS Database Initialization");
  console.log("=================================\n");

  try {
    console.log("1. Initializing Roles...");
    await initializeRoles();
    console.log("✓ Roles initialized\n");

    console.log("2. Initializing Settings...");
    await initializeSettings();
    console.log("✓ Settings initialized\n");

    console.log("3. Initializing Grade Scales...");
    await initializeGradeScales();
    console.log("✓ Grade Scales initialized\n");

    console.log("=================================");
    console.log("Database initialization complete!");
    console.log("=================================");
  } catch (error) {
    console.error("\n❌ Initialization failed:", error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  runAllInitializers();
}

module.exports = runAllInitializers;
