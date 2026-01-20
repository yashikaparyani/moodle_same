const mongoose = require('mongoose');

const calendarEventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date
  },
  allDay: {
    type: Boolean,
    default: false
  },
  eventType: {
    type: String,
    enum: ['meeting', 'class', 'assignment', 'exam', 'holiday', 'other'],
    default: 'other'
  },
  location: {
    type: String
  },
  // Recurrence fields
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurrenceRule: {
    type: String,
    // RRULE format for recurrence pattern (e.g., FREQ=WEEKLY;BYDAY=MO,WE,FR)
  },
  recurrenceStartDate: {
    type: Date
  },
  recurrenceEndDate: {
    type: Date
  },
  exceptionDates: {
    type: [Date],
    // Array of dates to exclude from recurrence
  },
  // FullCalendar styling
  color: {
    type: String,
    // Hex color code for the event
  },
  backgroundColor: {
    type: String
  },
  borderColor: {
    type: String
  },
  textColor: {
    type: String
  },
  url: {
    type: String,
    // URL to navigate to when event is clicked
  },
  classNames: {
    type: [String]
  },
  editable: {
    type: Boolean,
    default: true
  },
  // Visibility and access
  isPublic: {
    type: Boolean,
    default: false
  },
  // Attendees/Participants
  attendees: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'User'
  },
  // Relations
  createdByUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization'
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  },
  batchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Batch'
  },
  // Metadata
  isDeleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes
calendarEventSchema.index({ createdByUserId: 1 });
calendarEventSchema.index({ organizationId: 1 });
calendarEventSchema.index({ courseId: 1 });
calendarEventSchema.index({ batchId: 1 });
calendarEventSchema.index({ startDate: 1 });
calendarEventSchema.index({ eventType: 1 });
calendarEventSchema.index({ isPublic: 1 });
calendarEventSchema.index({ isDeleted: 1 });

module.exports = mongoose.model('CalendarEvent', calendarEventSchema);
