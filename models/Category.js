// models/Category.js
const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  // Organization (Multi-tenancy)
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Organization",
    required: false,
    index: true
  },
  
  name: String,
  description: String,
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    default: null
  }
});

// Indexes for organization scoping
categorySchema.index({ organizationId: 1, name: 1 });
categorySchema.index({ organizationId: 1, parentId: 1 });

module.exports = mongoose.model("Category", categorySchema);
