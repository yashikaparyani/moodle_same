// scripts/initializeGradeScales.js
/**
 * Initialize default grade scales
 * Run this script once after database setup
 */

const mongoose = require("mongoose");
const GradeScale = require("../models/GradeScale");

const defaultGradeScales = [
  {
    name: "Letter Grade (A-F)",
    description: "Standard letter grading system",
    isDefault: true,
    items: [
      { value: "A+", minPercentage: 97, maxPercentage: 100, grade: 4.0, description: "Excellent" },
      { value: "A", minPercentage: 93, maxPercentage: 96, grade: 4.0, description: "Excellent" },
      { value: "A-", minPercentage: 90, maxPercentage: 92, grade: 3.7, description: "Very Good" },
      { value: "B+", minPercentage: 87, maxPercentage: 89, grade: 3.3, description: "Very Good" },
      { value: "B", minPercentage: 83, maxPercentage: 86, grade: 3.0, description: "Good" },
      { value: "B-", minPercentage: 80, maxPercentage: 82, grade: 2.7, description: "Good" },
      { value: "C+", minPercentage: 77, maxPercentage: 79, grade: 2.3, description: "Satisfactory" },
      { value: "C", minPercentage: 73, maxPercentage: 76, grade: 2.0, description: "Satisfactory" },
      { value: "C-", minPercentage: 70, maxPercentage: 72, grade: 1.7, description: "Satisfactory" },
      { value: "D+", minPercentage: 67, maxPercentage: 69, grade: 1.3, description: "Poor" },
      { value: "D", minPercentage: 63, maxPercentage: 66, grade: 1.0, description: "Poor" },
      { value: "D-", minPercentage: 60, maxPercentage: 62, grade: 0.7, description: "Poor" },
      { value: "F", minPercentage: 0, maxPercentage: 59, grade: 0.0, description: "Fail" }
    ]
  },
  {
    name: "Pass/Fail",
    description: "Binary pass or fail grading",
    items: [
      { value: "Pass", minPercentage: 60, maxPercentage: 100, grade: 1.0, description: "Passed" },
      { value: "Fail", minPercentage: 0, maxPercentage: 59, grade: 0.0, description: "Failed" }
    ]
  },
  {
    name: "Descriptive Scale",
    description: "Descriptive grading scale",
    items: [
      { value: "Excellent", minPercentage: 90, maxPercentage: 100, grade: 5.0, description: "Outstanding performance" },
      { value: "Very Good", minPercentage: 80, maxPercentage: 89, grade: 4.0, description: "Above expectations" },
      { value: "Good", minPercentage: 70, maxPercentage: 79, grade: 3.0, description: "Meets expectations" },
      { value: "Satisfactory", minPercentage: 60, maxPercentage: 69, grade: 2.0, description: "Adequate performance" },
      { value: "Needs Improvement", minPercentage: 50, maxPercentage: 59, grade: 1.0, description: "Below expectations" },
      { value: "Unsatisfactory", minPercentage: 0, maxPercentage: 49, grade: 0.0, description: "Does not meet expectations" }
    ]
  },
  {
    name: "10-Point Scale",
    description: "Numeric scale from 0-10",
    items: [
      { value: "10", minPercentage: 95, maxPercentage: 100, grade: 10.0, description: "Perfect" },
      { value: "9", minPercentage: 85, maxPercentage: 94, grade: 9.0, description: "Excellent" },
      { value: "8", minPercentage: 75, maxPercentage: 84, grade: 8.0, description: "Very Good" },
      { value: "7", minPercentage: 65, maxPercentage: 74, grade: 7.0, description: "Good" },
      { value: "6", minPercentage: 55, maxPercentage: 64, grade: 6.0, description: "Satisfactory" },
      { value: "5", minPercentage: 45, maxPercentage: 54, grade: 5.0, description: "Adequate" },
      { value: "4", minPercentage: 35, maxPercentage: 44, grade: 4.0, description: "Poor" },
      { value: "3", minPercentage: 25, maxPercentage: 34, grade: 3.0, description: "Very Poor" },
      { value: "2", minPercentage: 15, maxPercentage: 24, grade: 2.0, description: "Extremely Poor" },
      { value: "1", minPercentage: 5, maxPercentage: 14, grade: 1.0, description: "Unacceptable" },
      { value: "0", minPercentage: 0, maxPercentage: 4, grade: 0.0, description: "No submission" }
    ]
  }
];

async function initializeGradeScales() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/lms", {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log("Connected to database");

    // Check if grade scales already exist
    const existingScales = await GradeScale.find();
    
    if (existingScales.length > 0) {
      console.log("Grade scales already exist. Skipping initialization.");
      console.log(`Found ${existingScales.length} existing grade scales.`);
      process.exit(0);
    }

    // Create grade scales
    const createdScales = await GradeScale.insertMany(defaultGradeScales);
    console.log(`Successfully created ${createdScales.length} default grade scales:`);
    createdScales.forEach(scale => {
      console.log(`  - ${scale.name} (${scale.items.length} items)`);
    });

    process.exit(0);
  } catch (error) {
    console.error("Error initializing grade scales:", error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  initializeGradeScales();
}

module.exports = initializeGradeScales;
