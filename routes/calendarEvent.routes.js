const express = require('express');
const router = express.Router();
const calendarEventController = require('../controllers/calendar/calendarEventController');
const { authenticate } = require('../middleware/authMiddleware');

// Apply authentication middleware to all routes
router.use(authenticate);

/**
 * @swagger
 * tags:
 *   name: Calendar Events
 *   description: Calendar event management
 */

/**
 * @swagger
 * /api/calendar-events:
 *   get:
 *     summary: Get all calendar events
 *     tags: [Calendar Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: start
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Start date for filtering events
 *       - in: query
 *         name: end
 *         schema:
 *           type: string
 *           format: date-time
 *         description: End date for filtering events
 *       - in: query
 *         name: eventType
 *         schema:
 *           type: string
 *           enum: [meeting, class, assignment, exam, holiday, other]
 *       - in: query
 *         name: courseId
 *         schema:
 *           type: integer
 *       - in: query
 *         name: batchId
 *         schema:
 *           type: integer
 *       - in: query
 *         name: organizationId
 *         schema:
 *           type: integer
 *       - in: query
 *         name: isPublic
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: List of events in FullCalendar format
 */
router.get('/', calendarEventController.getEvents);

/**
 * @swagger
 * /api/calendar-events/{id}:
 *   get:
 *     summary: Get an event by ID
 *     tags: [Calendar Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Event details
 *       404:
 *         description: Event not found
 */
router.get('/:id', calendarEventController.getEventById);

/**
 * @swagger
 * /api/calendar-events:
 *   post:
 *     summary: Create a new calendar event
 *     tags: [Calendar Events]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - startDate
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               startDate:
 *                 type: string
 *                 format: date-time
 *               endDate:
 *                 type: string
 *                 format: date-time
 *               allDay:
 *                 type: boolean
 *               eventType:
 *                 type: string
 *                 enum: [meeting, class, assignment, exam, holiday, other]
 *               location:
 *                 type: string
 *               isRecurring:
 *                 type: boolean
 *               recurrenceRule:
 *                 type: string
 *                 description: RRULE format (e.g., FREQ=WEEKLY;BYDAY=MO,WE,FR)
 *               isPublic:
 *                 type: boolean
 *               attendees:
 *                 type: array
 *                 items:
 *                   type: integer
 *               courseId:
 *                 type: integer
 *               batchId:
 *                 type: integer
 *               organizationId:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Event created successfully
 */
router.post('/', calendarEventController.createEvent);

/**
 * @swagger
 * /api/calendar-events/{id}:
 *   put:
 *     summary: Update a calendar event
 *     tags: [Calendar Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Event updated successfully
 *       404:
 *         description: Event not found
 */
router.put('/:id', calendarEventController.updateEvent);

/**
 * @swagger
 * /api/calendar-events/{id}:
 *   delete:
 *     summary: Delete a calendar event
 *     tags: [Calendar Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Event deleted successfully
 *       404:
 *         description: Event not found
 */
router.delete('/:id', calendarEventController.deleteEvent);

/**
 * @swagger
 * /api/calendar-events/{id}/attendees:
 *   post:
 *     summary: Add an attendee to an event
 *     tags: [Calendar Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *             properties:
 *               userId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Attendee added successfully
 */
router.post('/:id/attendees', calendarEventController.addAttendee);

/**
 * @swagger
 * /api/calendar-events/{id}/attendees/{userId}:
 *   delete:
 *     summary: Remove an attendee from an event
 *     tags: [Calendar Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Attendee removed successfully
 */
router.delete('/:id/attendees/:userId', calendarEventController.removeAttendee);

module.exports = router;
