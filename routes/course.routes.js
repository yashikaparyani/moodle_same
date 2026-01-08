// routes/course.routes.js - Complete Course Routes
const express = require('express');
const router = express.Router();

const courseController = require('../controllers/course/courseController');
const { authenticate } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

/**
 * @route   GET /api/courses/stats
 * @desc    Get course statistics
 * @access  Admin, Manager
 */
router.get(
  '/stats',
  authenticate,
  authorize('admin', 'manager'),
  courseController.getCourseStats
);

/**
 * @route   GET /api/courses
 * @desc    Get all courses (with filters, search, pagination)
 * @access  Public (shows only visible courses for non-admin)
 */
router.get('/', courseController.getAllCourses);

/**
 * @route   GET /api/courses/:id
 * @desc    Get single course details
 * @access  Public (if visible)
 */
router.get('/:id', courseController.getCourseById);

/**
 * @route   POST /api/courses
 * @desc    Create new course
 * @access  Admin, Manager, Course Creator
 */
router.post(
  '/',
  authenticate,
  authorize('admin', 'manager', 'course_creator'),
  courseController.createCourse
);

/**
 * @route   PUT /api/courses/:id
 * @desc    Update course
 * @access  Admin, Manager, Course Creator (own courses)
 */
router.put(
  '/:id',
  authenticate,
  authorize('admin', 'manager', 'course_creator'),
  courseController.updateCourse
);

/**
 * @route   DELETE /api/courses/:id
 * @desc    Delete/Hide course
 * @access  Admin, Manager
 */
router.delete(
  '/:id',
  authenticate,
  authorize('admin', 'manager'),
  courseController.deleteCourse
);

/**
 * @route   GET /api/courses/:id/students
 * @desc    Get enrolled students in course
 * @access  Admin, Manager, Teacher, Course Creator
 */
router.get(
  '/:id/students',
  authenticate,
  authorize('admin', 'manager', 'teacher', 'course_creator'),
  courseController.getCourseStudents
);

module.exports = router;
