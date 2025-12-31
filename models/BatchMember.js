// models/BatchMember.js
const mongoose = require("mongoose");

const batchMemberSchema = new mongoose.Schema({
  batchId: { type: mongoose.Schema.Types.ObjectId, ref: "Batch" },
  candidateId: { type: mongoose.Schema.Types.ObjectId, ref: "Candidate" },
  rollNo: String,
  status: String
}, { timestamps: true });

module.exports = mongoose.model("BatchMember", batchMemberSchema);
