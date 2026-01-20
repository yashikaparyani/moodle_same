const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
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
  dueDate: {
    type: Date
  },
  allDay: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  // Recurrence fields
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurrenceRule: {
    type: String,
    // RRULE format for recurrence pattern (e.g., FREQ=DAILY;COUNT=10)
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
    // Hex color code for the task
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
    // URL to navigate to when task is clicked
  },
  classNames: {
    type: [String]
  },
  editable: {
    type: Boolean,
    default: true
  },
  // Assignment fields
  assignedToUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
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
  // Metadata
  isDeleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes
taskSchema.index({ assignedToUserId: 1 });
taskSchema.index({ createdByUserId: 1 });
taskSchema.index({ organizationId: 1 });
taskSchema.index({ courseId: 1 });
taskSchema.index({ startDate: 1 });
taskSchema.index({ status: 1 });
taskSchema.index({ isDeleted: 1 });

module.exports = mongoose.model('Task', taskSchema);
