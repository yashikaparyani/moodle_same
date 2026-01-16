// routes/course.routes.js - Complete Course Routes
const express = require('express');
const router = express.Router();

const courseController = require('../controllers/course/courseController');
const { authenticate } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

/**
 * @swagger
 * /api/courses/stats:
 *   get:
 *     summary: Get course statistics
 *     description: Get statistics about courses - Admin/Manager only
 *     tags: [Courses]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Course statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 stats:
 *                   type: object
 *                   properties:
 *                     totalCourses:
 *                       type: integer
 *                       example: 45
 *                     visibleCourses:
 *                       type: integer
 *                       example: 40
 *                     totalEnrollments:
 *                       type: integer
 *                       example: 250
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get(
  '/stats',
  authenticate,
  authorize('admin', 'manager'),
  courseController.getCourseStats
);

/**
 * @swagger
 * /api/courses:
 *   get:
 *     summary: Get all courses
 *     description: Get all courses with filters, search, and pagination. Shows only visible courses for non-admin users.
 *     tags: [Courses]
 *     security: []
 *     parameters:
 *       - $ref: '#/components/parameters/PageParam'
 *       - $ref: '#/components/parameters/LimitParam'
 *       - $ref: '#/components/parameters/SearchParam'
 *       - $ref: '#/components/parameters/SortParam'
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category ID
 *       - in: query
 *         name: visible
 *         schema:
 *           type: boolean
 *         description: Filter by visibility (admin only)
 *     responses:
 *       200:
 *         description: Courses retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 courses:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Course'
 *                 pagination:
 *                   $ref: '#/components/schemas/PaginationMeta'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/', courseController.getAllCourses);

/**
 * @swagger
 * /api/courses/{id}:
 *   get:
 *     summary: Get course by ID
 *     description: Get detailed information about a specific course
 *     tags: [Courses]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Course ID
 *         example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Course retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 course:
 *                   $ref: '#/components/schemas/Course'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/:id', courseController.getCourseById);

/**
 * @swagger
 * /api/courses:
 *   post:
 *     summary: Create new course
 *     description: Create a new course - Admin/Manager/Course Creator only
 *     tags: [Courses]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fullName
 *               - shortName
 *               - category
 *             properties:
 *               fullName:
 *                 type: string
 *                 example: "Introduction to Web Development"
 *               shortName:
 *                 type: string
 *                 example: "WEB101"
 *               description:
 *                 type: string
 *                 example: "Learn the fundamentals of web development"
 *               category:
 *                 type: string
 *                 example: "507f1f77bcf86cd799439011"
 *               startDate:
 *                 type: string
 *                 format: date-time
 *                 example: "2024-01-15T00:00:00.000Z"
 *               endDate:
 *                 type: string
 *                 format: date-time
 *                 example: "2024-06-15T00:00:00.000Z"
 *               visible:
 *                 type: boolean
 *                 example: true
 *               enrollmentKey:
 *                 type: string
 *                 example: "WEB101-2024"
 *               maxStudents:
 *                 type: integer
 *                 example: 50
 *     responses:
 *       201:
 *         description: Course created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Course created successfully"
 *                 course:
 *                   $ref: '#/components/schemas/Course'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post(
  '/',
  authenticate,
  authorize('admin', 'manager', 'course_creator'),
  courseController.createCourse
);

/**
 * @swagger
 * /api/courses/{id}:
 *   put:
 *     summary: Update course
 *     description: Update an existing course - Admin/Manager/Course Creator (own courses) only
 *     tags: [Courses]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Course ID
 *         example: "507f1f77bcf86cd799439011"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *                 example: "Updated Course Name"
 *               shortName:
 *                 type: string
 *                 example: "WEB101"
 *               description:
 *                 type: string
 *                 example: "Updated course description"
 *               category:
 *                 type: string
 *                 example: "507f1f77bcf86cd799439011"
 *               startDate:
 *                 type: string
 *                 format: date-time
 *               endDate:
 *                 type: string
 *                 format: date-time
 *               visible:
 *                 type: boolean
 *               maxStudents:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Course updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Course updated successfully"
 *                 course:
 *                   $ref: '#/components/schemas/Course'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.put(
  '/:id',
  authenticate,
  authorize('admin', 'manager', 'course_creator'),
  courseController.updateCourse
);

/**
 * @swagger
 * /api/courses/{id}:
 *   delete:
 *     summary: Delete/Hide course
 *     description: Delete or hide a course - Admin/Manager only
 *     tags: [Courses]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Course ID
 *         example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Course deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Course deleted successfully"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.delete(
  '/:id',
  authenticate,
  authorize('admin', 'manager'),
  courseController.deleteCourse
);

/**
 * @swagger
 * /api/courses/{id}/students:
 *   get:
 *     summary: Get enrolled students
 *     description: Get list of students enrolled in a course - Admin/Manager/Teacher/Course Creator only
 *     tags: [Courses]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Course ID
 *         example: "507f1f77bcf86cd799439011"
 *       - $ref: '#/components/parameters/PageParam'
 *       - $ref: '#/components/parameters/LimitParam'
 *     responses:
 *       200:
 *         description: Enrolled students retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 students:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *                 pagination:
 *                   $ref: '#/components/schemas/PaginationMeta'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get(
  '/:id/students',
  authenticate,
  authorize('admin', 'manager', 'teacher', 'course_creator'),
  courseController.getCourseStudents
);

module.exports = router;
