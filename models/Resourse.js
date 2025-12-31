// models/Resource.js
const mongoose = require("mongoose");

const resourceSchema = new mongoose.Schema({
  sectionId: { type: mongoose.Schema.Types.ObjectId, ref: "Section" },
  type: { type: String, enum: ["pdf", "video", "link"] },
  title: String,
  url: String
});

module.exports = mongoose.model("Resource", resourceSchema);
