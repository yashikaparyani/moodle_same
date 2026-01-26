const Task = require('../../models/Task');
const User = require('../../models/User');

/**
 * Get all tasks for a user with optional filters
 */
exports.getTasks = async (req, res, next) => {
  try {
    const { 
      start, 
      end, 
      status, 
      priority, 
      assignedTo, 
      courseId,
      organizationId 
    } = req.query;

    const filter = {
      isDeleted: false
    };

    // Filter by date range if provided
    if (start && end) {
      filter.startDate = {
        $gte: new Date(start),
        $lte: new Date(end)
      };
    }

    // Filter by status
    if (status) {
      filter.status = status;
    }

    // Filter by priority
    if (priority) {
      filter.priority = priority;
    }

    // Filter by assigned user
    if (assignedTo) {
      filter.assignedToUserId = assignedTo;
    } else {
      // Admins and platform admins can see all tasks
      const isAdmin = req.user.role === 'admin' || req.user.isPlatformAdmin;
      
      if (!isAdmin) {
        // Default: show tasks assigned to current user or created by them
        filter.$or = [
          { assignedToUserId: req.user._id },
          { createdByUserId: req.user._id }
        ];
      }
      // If admin, no additional filter is applied (see all tasks)
    }

    // Filter by course
    if (courseId) {
      filter.courseId = courseId;
    }

    // Filter by organization
    if (organizationId) {
      filter.organizationId = organizationId;
    }

    const tasks = await Task.find(filter)
      .populate('assignedToUserId', 'firstName lastName email')
      .populate('createdByUserId', 'firstName lastName email')
      .sort({ startDate: 1 });

    // Transform to FullCalendar format
    const formattedTasks = tasks.map(task => transformTaskToFullCalendar(task));

    res.json({
      success: true,
      data: formattedTasks
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get a single task by ID
 */
exports.getTaskById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const task = await Task.findOne({
      _id: id,
      isDeleted: false
    })
      .populate('assignedToUserId', 'firstName lastName email')
      .populate('createdByUserId', 'firstName lastName email');

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    res.json({
      success: true,
      data: transformTaskToFullCalendar(task)
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new task
 */
exports.createTask = async (req, res, next) => {
  try {
    const {
      title,
      description,
      startDate,
      endDate,
      dueDate,
      allDay,
      status,
      priority,
      isRecurring,
      recurrenceRule,
      recurrenceStartDate,
      recurrenceEndDate,
      exceptionDates,
      color,
      backgroundColor,
      borderColor,
      textColor,
      url,
      classNames,
      assignedToUserId,
      organizationId,
      courseId
    } = req.body;

    // Validate required fields
    if (!title || !startDate) {
      return res.status(400).json({
        success: false,
        message: 'Title and start date are required'
      });
    }

    const task = await Task.create({
      title,
      description,
      startDate,
      endDate,
      dueDate,
      allDay: allDay || false,
      status: status || 'pending',
      priority: priority || 'medium',
      isRecurring: isRecurring || false,
      recurrenceRule,
      recurrenceStartDate,
      recurrenceEndDate,
      exceptionDates,
      color,
      backgroundColor,
      borderColor,
      textColor,
      url,
      classNames,
      assignedToUserId,
      createdByUserId: req.user._id,
      organizationId,
      courseId
    });

    const createdTask = await Task.findById(task._id)
      .populate('assignedToUserId', 'firstName lastName email')
      .populate('createdByUserId', 'firstName lastName email');

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: transformTaskToFullCalendar(createdTask)
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update a task
 */
exports.updateTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const task = await Task.findOne({
      _id: id,
      isDeleted: false
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Check if user has permission to update
    if (task.createdByUserId.toString() !== req.user._id.toString() && 
        task.assignedToUserId && task.assignedToUserId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to update this task'
      });
    }

    Object.assign(task, updates);
    await task.save();

    const updatedTask = await Task.findById(id)
      .populate('assignedToUserId', 'firstName lastName email')
      .populate('createdByUserId', 'firstName lastName email');

    res.json({
      success: true,
      message: 'Task updated successfully',
      data: transformTaskToFullCalendar(updatedTask)
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a task (soft delete)
 */
exports.deleteTask = async (req, res, next) => {
  try {
    const { id } = req.params;

    const task = await Task.findOne({
      _id: id,
      isDeleted: false
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Check if user has permission to delete
    if (task.createdByUserId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to delete this task'
      });
    }

    task.isDeleted = true;
    await task.save();

    res.json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update task status
 */
exports.updateTaskStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['pending', 'in_progress', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value'
      });
    }

    const task = await Task.findOne({
      _id: id,
      isDeleted: false
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    task.status = status;
    await task.save();

    res.json({
      success: true,
      message: 'Task status updated successfully',
      data: { id: task._id, status: task.status }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Transform task to FullCalendar event format
 */
function transformTaskToFullCalendar(task) {
  const event = {
    id: task._id,
    title: task.title,
    start: task.startDate,
    end: task.endDate,
    allDay: task.allDay,
    editable: task.editable,
    extendedProps: {
      description: task.description,
      dueDate: task.dueDate,
      status: task.status,
      priority: task.priority,
      assignedTo: task.assignedToUserId,
      createdBy: task.createdByUserId,
      organizationId: task.organizationId,
      courseId: task.courseId,
      type: 'task'
    }
  };

  // Add recurring properties if applicable
  if (task.isRecurring && task.recurrenceRule) {
    event.rrule = task.recurrenceRule;
    if (task.recurrenceStartDate) event.start = task.recurrenceStartDate;
    if (task.exceptionDates) event.exdate = task.exceptionDates;
  }

  // Add styling
  if (task.color) event.color = task.color;
  if (task.backgroundColor) event.backgroundColor = task.backgroundColor;
  if (task.borderColor) event.borderColor = task.borderColor;
  if (task.textColor) event.textColor = task.textColor;
  if (task.url) event.url = task.url;
  if (task.classNames) event.classNames = task.classNames;

  return event;
}

module.exports = exports;
