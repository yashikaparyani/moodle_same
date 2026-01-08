// controllers/course/courseController.js - Complete Course Management
const Course = require('../../models/Course');
const Category = require('../../models/Category');
const Enrollment = require('../../models/Enrollment');
const AuditService = require('../../services/auditService');
const { CacheService, CACHE_TTL } = require('../../services/cacheService');

/**
 * GET /api/courses
 * Get all courses with filters, search, and pagination
 * @access Public (filtered by visibility)
 */
exports.getAllCourses = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      visibility,
      categoryId,
      search,
      status
    } = req.query;

    // Build cache key
    const cacheKey = `courses:page:${page}:limit:${limit}:vis:${visibility || 'all'}:cat:${categoryId || 'all'}:search:${search || 'none'}`;

    // Try cache first
    const cached = await CacheService.get(cacheKey);
    if (cached) {
      return res.json({
        success: true,
        data: cached.courses,
        pagination: cached.pagination,
        cached: true
      });
    }

    // Build filter
    let filter = {};
    
    // Non-admin users can only see visible courses
    if (!req.user || req.user.role !== 'admin') {
      filter.visibility = 'show';
      filter.status = 'active';
    }
    
    if (visibility) {
      filter.visibility = visibility;
    }
    
    if (categoryId) {
      filter.categoryId = categoryId;
    }

    if (status) {
      filter.status = status;
    }
    
    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { shortName: { $regex: search, $options: 'i' } },
        { courseCode: { $regex: search, $options: 'i' } },
        { summary: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;

    const courses = await Course.find(filter)
      .populate('categoryId', 'name description')
      .populate('createdBy', 'firstName lastName email')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Course.countDocuments(filter);

    const result = {
      courses,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalCourses: total,
        limit: parseInt(limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    };

    // Cache for 5 minutes
    await CacheService.set(cacheKey, result, CACHE_TTL.MEDIUM);

    res.json({
      success: true,
      data: result.courses,
      pagination: result.pagination,
      cached: false
    });

  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching courses',
      error: error.message
    });
  }
};

/**
 * GET /api/courses/:id
 * Get single course by ID with full details
 * @access Public (if visible)
 */
exports.getCourseById = async (req, res) => {
  try {
    const courseId = req.params.id;

    // Try cache first
    const course = await CacheService.remember(
      `course:${courseId}`,
      async () => {
        return await Course.findById(courseId)
          .populate('categoryId', 'name description')
          .populate('createdBy', 'firstName lastName email');
      },
      CACHE_TTL.LONG // 1 hour
    );

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check visibility (non-admin can only see visible courses)
    if (course.visibility === 'hide' && (!req.user || req.user.role !== 'admin')) {
      return res.status(403).json({
        success: false,
        message: 'This course is not accessible'
      });
    }

    res.json({
      success: true,
      data: course
    });

  } catch (error) {
    console.error('Error fetching course:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching course',
      error: error.message
    });
  }
};

/**
 * POST /api/courses
 * Create new course
 * @access Admin, Manager, Course Creator only
 */
exports.createCourse = async (req, res) => {
  try {
    const {
      fullName,
      shortName,
      courseCode,
      categoryId,
      summary,
      startDate,
      endDate,
      visibility,
      courseImage,
      showGradebook,
      completionTracking,
      groupMode,
      tags
    } = req.body;

    // Validation
    if (!fullName || !shortName) {
      return res.status(400).json({
        success: false,
        message: 'Course full name and short name are required'
      });
    }

    // Check if short name already exists
    const existingCourse = await Course.findOne({ shortName });
    if (existingCourse) {
      return res.status(400).json({
        success: false,
        message: 'Course with this short name already exists'
      });
    }

    // Validate category if provided
    if (categoryId) {
      const category = await Category.findById(categoryId);
      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Category not found'
        });
      }
    }

    // Create course
    const course = new Course({
      fullName,
      shortName,
      courseCode,
      categoryId: categoryId || null,
      summary,
      startDate,
      endDate,
      visibility: visibility || 'show',
      courseImage,
      showGradebook: showGradebook !== undefined ? showGradebook : true,
      completionTracking: completionTracking !== undefined ? completionTracking : true,
      groupMode: groupMode || 'no_groups',
      tags: tags || [],
      createdBy: req.userId,
      status: 'active'
    });

    await course.save();

    // Populate category
    await course.populate('categoryId', 'name');

    // Invalidate course cache
    await CacheService.invalidate('course');

    // Audit log
    await AuditService.log({
      userId: req.userId,
      action: 'course_created',
      resourceType: 'course',
      resourceId: course._id,
      details: { 
        courseName: course.fullName,
        shortName: course.shortName 
      },
      ipAddress: req.ip
    });

    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      data: course
    });

  } catch (error) {
    console.error('Error creating course:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating course',
      error: error.message
    });
  }
};

/**
 * PUT /api/courses/:id
 * Update course details
 * @access Admin, Manager, Course Creator
 */
exports.updateCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check if user can edit this course
    const canEdit = 
      req.user.role === 'admin' || 
      req.user.role === 'manager' ||
      (req.user.role === 'course_creator' && course.createdBy?.toString() === req.userId);

    if (!canEdit) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to edit this course'
      });
    }

    // Update allowed fields
    const allowedFields = [
      'fullName', 'shortName', 'courseCode', 'categoryId',
      'summary', 'startDate', 'endDate', 'visibility',
      'courseImage', 'showGradebook', 'completionTracking',
      'groupMode', 'forceGroupMode', 'tags', 'status',
      'showActivityReports', 'showActivityDates',
      'showCompletionConditions', 'announcementCount',
      'hiddenSections', 'layout'
    ];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        course[field] = req.body[field];
      }
    });

    // Check if shortName is being changed and is unique
    if (req.body.shortName && req.body.shortName !== course.shortName) {
      const existingCourse = await Course.findOne({ 
        shortName: req.body.shortName,
        _id: { $ne: course._id }
      });
      
      if (existingCourse) {
        return res.status(400).json({
          success: false,
          message: 'Course with this short name already exists'
        });
      }
    }

    await course.save();

    // Invalidate cache
    await CacheService.delete(`course:${course._id}`);
    await CacheService.invalidate('course');

    // Audit log
    await AuditService.log({
      userId: req.userId,
      action: 'course_updated',
      resourceType: 'course',
      resourceId: course._id,
      details: { courseName: course.fullName },
      ipAddress: req.ip
    });

    res.json({
      success: true,
      message: 'Course updated successfully',
      data: course
    });

  } catch (error) {
    console.error('Error updating course:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating course',
      error: error.message
    });
  }
};

/**
 * DELETE /api/courses/:id
 * Delete/Hide course
 * @access Admin, Manager only
 */
exports.deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check if students are enrolled
    const enrollmentCount = await Enrollment.countDocuments({
      courseId: course._id,
      status: 'active'
    });

    if (enrollmentCount > 0) {
      // Soft delete - just hide and set inactive
      course.visibility = 'hide';
      course.status = 'inactive';
      await course.save();

      // Invalidate cache
      await CacheService.delete(`course:${course._id}`);
      await CacheService.invalidate('course');

      return res.json({
        success: true,
        message: `Course hidden (${enrollmentCount} students enrolled). Status set to inactive.`
      });
    }

    // No enrollments - safe to delete permanently
    await course.deleteOne();

    // Invalidate cache
    await CacheService.delete(`course:${course._id}`);
    await CacheService.invalidate('course');

    // Audit log
    await AuditService.log({
      userId: req.userId,
      action: 'course_deleted',
      resourceType: 'course',
      resourceId: course._id,
      details: { courseName: course.fullName },
      ipAddress: req.ip
    });

    res.json({
      success: true,
      message: 'Course deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting course:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting course',
      error: error.message
    });
  }
};

/**
 * GET /api/courses/:id/students
 * Get enrolled students in a course
 * @access Admin, Manager, Teacher, Course Creator
 */
exports.getCourseStudents = async (req, res) => {
  try {
    const courseId = req.params.id;

    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Try cache
    const enrollments = await CacheService.remember(
      `course:${courseId}:students`,
      async () => {
        return await Enrollment.find({
          courseId: courseId,
          status: 'active'
        })
          .populate('userId', 'firstName lastName email profilePicture role')
          .sort({ enrolledAt: -1 });
      },
      CACHE_TTL.MEDIUM
    );

    res.json({
      success: true,
      data: enrollments,
      count: enrollments.length
    });

  } catch (error) {
    console.error('Error fetching course students:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching course students',
      error: error.message
    });
  }
};

/**
 * GET /api/courses/stats
 * Get course statistics
 * @access Admin, Manager
 */
exports.getCourseStats = async (req, res) => {
  try {
    const stats = await CacheService.remember(
      'courses:stats',
      async () => {
        const totalCourses = await Course.countDocuments();
        const activeCourses = await Course.countDocuments({ status: 'active', visibility: 'show' });
        const hiddenCourses = await Course.countDocuments({ visibility: 'hide' });
        const inactiveCourses = await Course.countDocuments({ status: 'inactive' });
        
        const categories = await Course.aggregate([
          { $group: { _id: '$categoryId', count: { $sum: 1 } } }
        ]);

        return {
          totalCourses,
          activeCourses,
          hiddenCourses,
          inactiveCourses,
          categoriesUsed: categories.length
        };
      },
      CACHE_TTL.MEDIUM
    );

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Error fetching course stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching course statistics',
      error: error.message
    });
  }
};

module.exports = exports;
