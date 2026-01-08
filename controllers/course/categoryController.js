// controllers/course/categoryController.js - Complete Category Management
const Category = require('../../models/Category');
const Course = require('../../models/Course');
const AuditService = require('../../services/auditService');
const { CacheService, CACHE_TTL } = require('../../services/cacheService');

/**
 * GET /api/categories
 * Get all categories (tree structure with hierarchy)
 * @access Public
 */
exports.getAllCategories = async (req, res) => {
  try {
    // Try cache first
    const categoryTree = await CacheService.remember(
      'categories:tree',
      async () => {
        // Get all categories
        const categories = await Category.find().sort({ name: 1 });
        
        // Build tree structure
        return buildCategoryTree(categories);
      },
      CACHE_TTL.LONG // 1 hour
    );

    res.json({
      success: true,
      data: categoryTree,
      count: categoryTree.length
    });

  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching categories',
      error: error.message
    });
  }
};

/**
 * GET /api/categories/flat
 * Get all categories as flat list (no tree structure)
 * @access Public
 */
exports.getFlatCategories = async (req, res) => {
  try {
    const categories = await CacheService.remember(
      'categories:flat',
      async () => {
        return await Category.find()
          .populate('parentId', 'name')
          .sort({ name: 1 });
      },
      CACHE_TTL.LONG
    );

    res.json({
      success: true,
      data: categories,
      count: categories.length
    });

  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching categories',
      error: error.message
    });
  }
};

/**
 * GET /api/categories/:id
 * Get single category with courses
 * @access Public
 */
exports.getCategoryById = async (req, res) => {
  try {
    const categoryId = req.params.id;

    const result = await CacheService.remember(
      `category:${categoryId}:details`,
      async () => {
        const category = await Category.findById(categoryId)
          .populate('parentId', 'name');

        if (!category) {
          return null;
        }

        // Get courses in this category
        const courses = await Course.find({ 
          categoryId: category._id,
          visibility: 'show',
          status: 'active'
        })
          .select('fullName shortName courseImage visibility summary startDate endDate')
          .sort({ fullName: 1 });

        // Get subcategories
        const subcategories = await Category.find({
          parentId: category._id
        }).select('name description');

        return {
          category,
          courses,
          courseCount: courses.length,
          subcategories,
          subcategoryCount: subcategories.length
        };
      },
      CACHE_TTL.MEDIUM
    );

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching category',
      error: error.message
    });
  }
};

/**
 * POST /api/categories
 * Create new category
 * @access Admin, Manager only
 */
exports.createCategory = async (req, res) => {
  try {
    const { name, description, parentId } = req.body;

    // Validation
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Category name is required'
      });
    }

    // Check if category with same name already exists
    const existingCategory = await Category.findOne({ 
      name: { $regex: new RegExp(`^${name}$`, 'i') }
    });

    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: 'Category with this name already exists'
      });
    }

    // Check if parent exists
    if (parentId) {
      const parentCategory = await Category.findById(parentId);
      if (!parentCategory) {
        return res.status(404).json({
          success: false,
          message: 'Parent category not found'
        });
      }
    }

    // Create category
    const category = new Category({
      name,
      description,
      parentId: parentId || null
    });

    await category.save();

    // Populate parent if exists
    if (parentId) {
      await category.populate('parentId', 'name');
    }

    // Invalidate cache
    await CacheService.invalidate('category');

    // Audit log
    await AuditService.log({
      userId: req.userId,
      action: 'category_created',
      resourceType: 'category',
      resourceId: category._id,
      details: { categoryName: category.name },
      ipAddress: req.ip
    });

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: category
    });

  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating category',
      error: error.message
    });
  }
};

/**
 * PUT /api/categories/:id
 * Update category
 * @access Admin, Manager only
 */
exports.updateCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    const { name, description, parentId } = req.body;

    // Check if new name conflicts with existing category
    if (name && name !== category.name) {
      const existingCategory = await Category.findOne({ 
        name: { $regex: new RegExp(`^${name}$`, 'i') },
        _id: { $ne: category._id }
      });

      if (existingCategory) {
        return res.status(400).json({
          success: false,
          message: 'Category with this name already exists'
        });
      }
    }

    // Validate parent (cannot be self or descendant)
    if (parentId) {
      if (parentId === category._id.toString()) {
        return res.status(400).json({
          success: false,
          message: 'Category cannot be its own parent'
        });
      }

      const parent = await Category.findById(parentId);
      if (!parent) {
        return res.status(404).json({
          success: false,
          message: 'Parent category not found'
        });
      }

      // Check if parentId is a descendant of current category
      const isDescendant = await checkIfDescendant(category._id, parentId);
      if (isDescendant) {
        return res.status(400).json({
          success: false,
          message: 'Cannot set a subcategory as parent (circular reference)'
        });
      }
    }

    // Update fields
    if (name) category.name = name;
    if (description !== undefined) category.description = description;
    if (parentId !== undefined) category.parentId = parentId || null;

    await category.save();

    // Invalidate cache
    await CacheService.delete(`category:${category._id}:details`);
    await CacheService.invalidate('category');

    // Audit log
    await AuditService.log({
      userId: req.userId,
      action: 'category_updated',
      resourceType: 'category',
      resourceId: category._id,
      details: { categoryName: category.name },
      ipAddress: req.ip
    });

    res.json({
      success: true,
      message: 'Category updated successfully',
      data: category
    });

  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating category',
      error: error.message
    });
  }
};

/**
 * DELETE /api/categories/:id
 * Delete category
 * @access Admin, Manager only
 */
exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Check if category has courses
    const courseCount = await Course.countDocuments({
      categoryId: category._id
    });

    if (courseCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete category. It has ${courseCount} course(s). Please move or delete courses first.`
      });
    }

    // Check if category has subcategories
    const childCount = await Category.countDocuments({
      parentId: category._id
    });

    if (childCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete category. It has ${childCount} subcategory(ies). Please delete or move subcategories first.`
      });
    }

    await category.deleteOne();

    // Invalidate cache
    await CacheService.delete(`category:${category._id}:details`);
    await CacheService.invalidate('category');

    // Audit log
    await AuditService.log({
      userId: req.userId,
      action: 'category_deleted',
      resourceType: 'category',
      resourceId: category._id,
      details: { categoryName: category.name },
      ipAddress: req.ip
    });

    res.json({
      success: true,
      message: 'Category deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting category',
      error: error.message
    });
  }
};

/**
 * GET /api/categories/:id/courses
 * Get all courses in a category
 * @access Public
 */
exports.getCategoryCourses = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const categoryId = req.params.id;

    // Check if category exists
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    const skip = (page - 1) * limit;

    const courses = await Course.find({ 
      categoryId: categoryId,
      visibility: 'show',
      status: 'active'
    })
      .select('fullName shortName courseImage summary startDate endDate')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ fullName: 1 });

    const total = await Course.countDocuments({ 
      categoryId: categoryId,
      visibility: 'show',
      status: 'active'
    });

    res.json({
      success: true,
      data: {
        category: {
          _id: category._id,
          name: category.name,
          description: category.description
        },
        courses,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalCourses: total,
          hasNext: page * limit < total,
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Error fetching category courses:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching category courses',
      error: error.message
    });
  }
};

// ========== Helper Functions ==========

/**
 * Build category tree structure
 */
function buildCategoryTree(categories) {
  const categoryMap = {};
  const tree = [];

  // Create a map of all categories
  categories.forEach(cat => {
    categoryMap[cat._id] = {
      _id: cat._id,
      name: cat.name,
      description: cat.description,
      parentId: cat.parentId,
      children: []
    };
  });

  // Build tree by linking children to parents
  categories.forEach(cat => {
    if (cat.parentId) {
      const parent = categoryMap[cat.parentId];
      if (parent) {
        parent.children.push(categoryMap[cat._id]);
      }
    } else {
      // Root level category
      tree.push(categoryMap[cat._id]);
    }
  });

  return tree;
}

/**
 * Check if targetId is a descendant of categoryId
 */
async function checkIfDescendant(categoryId, targetId) {
  const target = await Category.findById(targetId);
  if (!target) return false;

  let current = target;
  while (current.parentId) {
    if (current.parentId.toString() === categoryId.toString()) {
      return true; // Found ancestor
    }
    current = await Category.findById(current.parentId);
    if (!current) break;
  }

  return false;
}

module.exports = exports;
