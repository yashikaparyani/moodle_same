const CalendarEvent = require('../../models/CalendarEvent');
const User = require('../../models/User');

/**
 * Get all calendar events with optional filters
 */
exports.getEvents = async (req, res, next) => {
  try {
    const { 
      start, 
      end, 
      eventType, 
      courseId,
      batchId,
      organizationId,
      isPublic 
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

    // Filter by event type
    if (eventType) {
      filter.eventType = eventType;
    }

    // Filter by course
    if (courseId) {
      filter.courseId = courseId;
    }

    // Filter by batch
    if (batchId) {
      filter.batchId = batchId;
    }

    // Filter by organization
    if (organizationId) {
      filter.organizationId = organizationId;
    }

    // Filter by public/private
    if (isPublic !== undefined) {
      filter.isPublic = isPublic === 'true';
    } else {
      // Default: show public events or events created by/for the user
      filter.$or = [
        { isPublic: true },
        { createdByUserId: req.user._id },
        { attendees: req.user._id }
      ];
    }

    const events = await CalendarEvent.find(filter)
      .populate('createdByUserId', 'firstName lastName email')
      .sort({ startDate: 1 });

    // Transform to FullCalendar format
    const formattedEvents = events.map(event => transformEventToFullCalendar(event));

    res.json({
      success: true,
      data: formattedEvents
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get a single event by ID
 */
exports.getEventById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const event = await CalendarEvent.findOne({ 
      _id: id, 
      isDeleted: false 
    })
      .populate('createdByUserId', 'firstName lastName email');

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    res.json({
      success: true,
      data: transformEventToFullCalendar(event)
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new calendar event
 */
exports.createEvent = async (req, res, next) => {
  try {
    const {
      title,
      description,
      startDate,
      endDate,
      allDay,
      eventType,
      location,
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
      isPublic,
      attendees,
      organizationId,
      courseId,
      batchId
    } = req.body;

    // Validate required fields
    if (!title || !startDate) {
      return res.status(400).json({
        success: false,
        message: 'Title and start date are required'
      });
    }

    const event = await CalendarEvent.create({
      title,
      description,
      startDate,
      endDate,
      allDay: allDay || false,
      eventType: eventType || 'other',
      location,
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
      isPublic: isPublic || false,
      attendees,
      createdByUserId: req.user._id,
      organizationId,
      courseId,
      batchId
    });

    const createdEvent = await CalendarEvent.findById(event._id)
      .populate('createdByUserId', 'firstName lastName email');

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      data: transformEventToFullCalendar(createdEvent)
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update a calendar event
 */
exports.updateEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const event = await CalendarEvent.findOne({
      _id: id,
      isDeleted: false
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check if user has permission to update
    if (event.createdByUserId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to update this event'
      });
    }

    Object.assign(event, updates);
    await event.save();

    const updatedEvent = await CalendarEvent.findById(id)
      .populate('createdByUserId', 'firstName lastName email');

    res.json({
      success: true,
      message: 'Event updated successfully',
      data: transformEventToFullCalendar(updatedEvent)
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a calendar event (soft delete)
 */
exports.deleteEvent = async (req, res, next) => {
  try {
    const { id } = req.params;

    const event = await CalendarEvent.findOne({
      _id: id,
      isDeleted: false
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check if user has permission to delete
    if (event.createdByUserId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to delete this event'
      });
    }

    event.isDeleted = true;
    await event.save();

    res.json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Add attendee to an event
 */
exports.addAttendee = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    const event = await CalendarEvent.findOne({
      _id: id,
      isDeleted: false
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    let attendees = event.attendees || [];
    if (!attendees.includes(userId)) {
      attendees.push(userId);
      event.attendees = attendees;
      await event.save();
    }

    res.json({
      success: true,
      message: 'Attendee added successfully',
      data: { id: event._id, attendees: event.attendees }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Remove attendee from an event
 */
exports.removeAttendee = async (req, res, next) => {
  try {
    const { id, userId } = req.params;

    const event = await CalendarEvent.findOne({
      _id: id,
      isDeleted: false
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    let attendees = event.attendees || [];
    attendees = attendees.filter(attendeeId => attendeeId.toString() !== userId);
    event.attendees = attendees;
    await event.save();

    res.json({
      success: true,
      message: 'Attendee removed successfully',
      data: { id: event._id, attendees: event.attendees }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Transform event to FullCalendar event format
 */
function transformEventToFullCalendar(event) {
  const calEvent = {
    id: event._id,
    title: event.title,
    start: event.startDate,
    end: event.endDate,
    allDay: event.allDay,
    editable: event.editable,
    extendedProps: {
      description: event.description,
      eventType: event.eventType,
      location: event.location,
      isPublic: event.isPublic,
      attendees: event.attendees,
      createdBy: event.createdByUserId,
      organizationId: event.organizationId,
      courseId: event.courseId,
      batchId: event.batchId,
      type: 'event'
    }
  };

  // Add recurring properties if applicable
  if (event.isRecurring && event.recurrenceRule) {
    calEvent.rrule = event.recurrenceRule;
    if (event.recurrenceStartDate) calEvent.start = event.recurrenceStartDate;
    if (event.exceptionDates) calEvent.exdate = event.exceptionDates;
  }

  // Add styling
  if (event.color) calEvent.color = event.color;
  if (event.backgroundColor) calEvent.backgroundColor = event.backgroundColor;
  if (event.borderColor) calEvent.borderColor = event.borderColor;
  if (event.textColor) calEvent.textColor = event.textColor;
  if (event.url) calEvent.url = event.url;
  if (event.classNames) calEvent.classNames = event.classNames;

  return calEvent;
}

module.exports = exports;
