// routes/category.routes.js - Category Management Routes
const express = require('express');
const router = express.Router();

const categoryController = require('../controllers/course/categoryController');
const { authenticate } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

/**
 * @route   GET /api/categories
 * @desc    Get all categories (tree structure)
 * @access  Public
 */
router.get('/', categoryController.getAllCategories);

/**
 * @route   GET /api/categories/flat
 * @desc    Get all categories (flat list)
 * @access  Public
 */
router.get('/flat', categoryController.getFlatCategories);

/**
 * @route   GET /api/categories/:id
 * @desc    Get single category with courses
 * @access  Public
 */
router.get('/:id', categoryController.getCategoryById);

/**
 * @route   GET /api/categories/:id/courses
 * @desc    Get all courses in category
 * @access  Public
 */
router.get('/:id/courses', categoryController.getCategoryCourses);

/**
 * @route   POST /api/categories
 * @desc    Create new category
 * @access  Admin, Manager
 */
router.post(
  '/',
  authenticate,
  authorize('admin', 'manager'),
  categoryController.createCategory
);

/**
 * @route   PUT /api/categories/:id
 * @desc    Update category
 * @access  Admin, Manager
 */
router.put(
  '/:id',
  authenticate,
  authorize('admin', 'manager'),
  categoryController.updateCategory
);

/**
 * @route   DELETE /api/categories/:id
 * @desc    Delete category
 * @access  Admin, Manager
 */
router.delete(
  '/:id',
  authenticate,
  authorize('admin', 'manager'),
  categoryController.deleteCategory
);

module.exports = router;
