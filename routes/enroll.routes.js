const express = require("express");
const Enrollment = require("../models/Enrollment");

const router = express.Router();

router.post("/", async (req, res) => {
  const enrollment = await Enrollment.create(req.body);
  res.json(enrollment);
});

module.exports = router;
