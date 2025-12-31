const express = require("express");
const Course = require("../models/Course");

const router = express.Router();

router.post("/", async (req, res) => {
  const course = await Course.create(req.body);
  res.json(course);
});

router.get("/", async (req, res) => {
  const courses = await Course.find().populate("teacherId", "name");
  res.json(courses);
});

module.exports = router;
