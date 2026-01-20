# FullCalendar Backend API Documentation

## Overview
This backend implementation provides comprehensive APIs for FullCalendar.io integration with support for both tasks and events, including single and recurring occurrences.

## Features
- ✅ Task Management (CRUD operations)
- ✅ Calendar Event Management (CRUD operations)
- ✅ Single and Recurring Events/Tasks
- ✅ RRULE support for recurrence patterns
- ✅ Exception dates for recurring items
- ✅ FullCalendar-compatible JSON format
- ✅ User assignment and attendee management
- ✅ Multi-tenancy (organization-based)
- ✅ Soft delete functionality
- ✅ Authentication and authorization

## Models

### Task Model
**Collection:** `tasks`

**Fields:**
- `title` (String, required) - Task title
- `description` (String) - Task description
- `startDate` (Date, required) - Task start date/time
- `endDate` (Date) - Task end date/time
- `dueDate` (Date) - Task due date
- `allDay` (Boolean, default: false) - All-day task flag
- `status` (Enum: pending, in_progress, completed, cancelled)
- `priority` (Enum: low, medium, high, urgent)
- `isRecurring` (Boolean, default: false) - Recurring task flag
- `recurrenceRule` (String) - RRULE format for recurrence
- `recurrenceStartDate` (Date) - Start date for recurrence
- `recurrenceEndDate` (Date) - End date for recurrence
- `exceptionDates` (Array of Dates) - Dates to exclude from recurrence
- `color` (String) - Hex color code
- `backgroundColor` (String) - Background color
- `borderColor` (String) - Border color
- `textColor` (String) - Text color
- `url` (String) - URL to navigate when clicked
- `classNames` (Array of Strings) - CSS class names
- `editable` (Boolean, default: true) - Whether task is editable
- `assignedToUserId` (ObjectId) - User assigned to the task
- `createdByUserId` (ObjectId, required) - User who created the task
- `organizationId` (ObjectId) - Associated organization
- `courseId` (ObjectId) - Associated course
- `isDeleted` (Boolean, default: false) - Soft delete flag

### CalendarEvent Model
**Collection:** `calendar_events`

**Fields:**
- `title` (String, required) - Event title
- `description` (String) - Event description
- `startDate` (Date, required) - Event start date/time
- `endDate` (Date) - Event end date/time
- `allDay` (Boolean, default: false) - All-day event flag
- `eventType` (Enum: meeting, class, assignment, exam, holiday, other)
- `location` (String) - Event location
- `isRecurring` (Boolean, default: false) - Recurring event flag
- `recurrenceRule` (String) - RRULE format for recurrence
- `recurrenceStartDate` (Date) - Start date for recurrence
- `recurrenceEndDate` (Date) - End date for recurrence
- `exceptionDates` (Array of Dates) - Dates to exclude from recurrence
- `color` (String) - Hex color code
- `backgroundColor` (String) - Background color
- `borderColor` (String) - Border color
- `textColor` (String) - Text color
- `url` (String) - URL to navigate when clicked
- `classNames` (Array of Strings) - CSS class names
- `editable` (Boolean, default: true) - Whether event is editable
- `isPublic` (Boolean, default: false) - Public/private flag
- `attendees` (Array of ObjectIds) - User IDs of attendees
- `createdByUserId` (ObjectId, required) - User who created the event
- `organizationId` (ObjectId) - Associated organization
- `courseId` (ObjectId) - Associated course
- `batchId` (ObjectId) - Associated batch
- `isDeleted` (Boolean, default: false) - Soft delete flag

## API Endpoints

### Task APIs

#### Get All Tasks
```
GET /api/tasks
```

**Query Parameters:**
- `start` - Start date (ISO 8601 format)
- `end` - End date (ISO 8601 format)
- `status` - Filter by status (pending, in_progress, completed, cancelled)
- `priority` - Filter by priority (low, medium, high, urgent)
- `assignedTo` - Filter by assigned user ID
- `courseId` - Filter by course ID
- `organizationId` - Filter by organization ID

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "648a1b2c3d4e5f6g7h8i9j0k",
      "title": "Complete assignment",
      "start": "2026-01-25T10:00:00.000Z",
      "end": "2026-01-25T11:00:00.000Z",
      "allDay": false,
      "editable": true,
      "rrule": "FREQ=WEEKLY;BYDAY=MO,WE,FR",
      "backgroundColor": "#3788d8",
      "extendedProps": {
        "description": "Complete the assignment",
        "status": "pending",
        "priority": "high",
        "type": "task"
      }
    }
  ]
}
```

#### Get Task by ID
```
GET /api/tasks/:id
```

#### Create Task
```
POST /api/tasks
```

**Request Body:**
```json
{
  "title": "New Task",
  "description": "Task description",
  "startDate": "2026-01-25T10:00:00.000Z",
  "endDate": "2026-01-25T11:00:00.000Z",
  "allDay": false,
  "status": "pending",
  "priority": "medium",
  "isRecurring": true,
  "recurrenceRule": "FREQ=WEEKLY;BYDAY=MO,WE,FR",
  "assignedToUserId": "648a1b2c3d4e5f6g7h8i9j0k",
  "courseId": "648a1b2c3d4e5f6g7h8i9j0k"
}
```

#### Update Task
```
PUT /api/tasks/:id
```

#### Delete Task
```
DELETE /api/tasks/:id
```

#### Update Task Status
```
PATCH /api/tasks/:id/status
```

**Request Body:**
```json
{
  "status": "completed"
}
```

### Calendar Event APIs

#### Get All Events
```
GET /api/calendar-events
```

**Query Parameters:**
- `start` - Start date (ISO 8601 format)
- `end` - End date (ISO 8601 format)
- `eventType` - Filter by event type (meeting, class, assignment, exam, holiday, other)
- `courseId` - Filter by course ID
- `batchId` - Filter by batch ID
- `organizationId` - Filter by organization ID
- `isPublic` - Filter by public/private (true/false)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "648a1b2c3d4e5f6g7h8i9j0k",
      "title": "Weekly Class",
      "start": "2026-01-25T10:00:00.000Z",
      "end": "2026-01-25T11:00:00.000Z",
      "allDay": false,
      "editable": true,
      "rrule": "FREQ=WEEKLY;BYDAY=MO,WE,FR;COUNT=30",
      "backgroundColor": "#3788d8",
      "extendedProps": {
        "description": "Regular weekly class",
        "eventType": "class",
        "location": "Room 101",
        "isPublic": true,
        "type": "event"
      }
    }
  ]
}
```

#### Get Event by ID
```
GET /api/calendar-events/:id
```

#### Create Event
```
POST /api/calendar-events
```

**Request Body:**
```json
{
  "title": "New Event",
  "description": "Event description",
  "startDate": "2026-01-25T10:00:00.000Z",
  "endDate": "2026-01-25T11:00:00.000Z",
  "allDay": false,
  "eventType": "meeting",
  "location": "Conference Room A",
  "isRecurring": true,
  "recurrenceRule": "FREQ=WEEKLY;BYDAY=MO,WE,FR;COUNT=10",
  "isPublic": false,
  "attendees": ["648a1b2c3d4e5f6g7h8i9j0k"],
  "courseId": "648a1b2c3d4e5f6g7h8i9j0k"
}
```

#### Update Event
```
PUT /api/calendar-events/:id
```

#### Delete Event
```
DELETE /api/calendar-events/:id
```

#### Add Attendee
```
POST /api/calendar-events/:id/attendees
```

**Request Body:**
```json
{
  "userId": "648a1b2c3d4e5f6g7h8i9j0k"
}
```

#### Remove Attendee
```
DELETE /api/calendar-events/:id/attendees/:userId
```

## RRULE Examples

### Daily Recurrence
```
FREQ=DAILY;COUNT=10
```
Repeats daily for 10 occurrences.

### Weekly Recurrence
```
FREQ=WEEKLY;BYDAY=MO,WE,FR;UNTIL=20260630T000000Z
```
Repeats every Monday, Wednesday, and Friday until June 30, 2026.

### Monthly Recurrence
```
FREQ=MONTHLY;BYMONTHDAY=15;COUNT=12
```
Repeats on the 15th of each month for 12 occurrences.

### Complex Recurrence
```
FREQ=WEEKLY;INTERVAL=2;BYDAY=TU,TH;COUNT=20
```
Repeats every 2 weeks on Tuesday and Thursday for 20 occurrences.

## Exception Dates

To exclude specific dates from a recurring event/task, use the `exceptionDates` field:

```json
{
  "isRecurring": true,
  "recurrenceRule": "FREQ=WEEKLY;BYDAY=MO,WE,FR",
  "exceptionDates": [
    "2026-02-14T00:00:00.000Z",
    "2026-02-21T00:00:00.000Z"
  ]
}
```

## Authentication

All endpoints require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Authorization

- Users can only view/edit tasks assigned to them or created by them
- Users can view public events or events they created/are attending
- Only the creator can update or delete tasks/events

## Frontend Integration (Angular)

### Install FullCalendar
```bash
npm install @fullcalendar/angular @fullcalendar/core @fullcalendar/daygrid @fullcalendar/timegrid @fullcalendar/interaction @fullcalendar/rrule
```

### Fetch Events
```typescript
// In your Angular service
getEvents(start: string, end: string): Observable<any> {
  return this.http.get(`${API_URL}/api/calendar-events`, {
    params: { start, end }
  });
}

getTasks(start: string, end: string): Observable<any> {
  return this.http.get(`${API_URL}/api/tasks`, {
    params: { start, end }
  });
}

// Combine both events and tasks
getAllCalendarItems(start: string, end: string): Observable<any> {
  return forkJoin({
    events: this.getEvents(start, end),
    tasks: this.getTasks(start, end)
  }).pipe(
    map(({ events, tasks }) => [...events.data, ...tasks.data])
  );
}
```

### FullCalendar Component
```typescript
import { Component, OnInit } from '@angular/core';
import { CalendarOptions } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import rrulePlugin from '@fullcalendar/rrule';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html'
})
export class CalendarComponent implements OnInit {
  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin, rrulePlugin],
    initialView: 'dayGridMonth',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay'
    },
    events: (info, successCallback, failureCallback) => {
      this.calendarService.getAllCalendarItems(
        info.start.toISOString(),
        info.end.toISOString()
      ).subscribe(
        data => successCallback(data),
        error => failureCallback(error)
      );
    },
    eventClick: this.handleEventClick.bind(this),
    dateClick: this.handleDateClick.bind(this),
    editable: true,
    selectable: true
  };

  handleEventClick(arg: any) {
    // Handle event click
    console.log('Event clicked:', arg.event);
  }

  handleDateClick(arg: any) {
    // Handle date click (create new event/task)
    console.log('Date clicked:', arg.date);
  }
}
```

## Notes

- All dates should be in ISO 8601 format
- The backend returns data in FullCalendar-compatible JSON format
- Recurring events/tasks use the RRULE standard (RFC 5545)
- Soft delete is implemented - deleted items are not permanently removed
- Multi-tenancy is supported through organization context
- All responses include a `success` field to indicate operation status
