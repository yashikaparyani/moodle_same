// models/Completion.js
const mongoose = require("mongoose");

const completionSchema = new mongoose.Schema({
  candidateId: { type: mongoose.Schema.Types.ObjectId, ref: "Candidate" },
  resourceId: { type: mongoose.Schema.Types.ObjectId, ref: "Resource" },
  completedAt: Date
});

module.exports = mongoose.model("Completion", completionSchema);
