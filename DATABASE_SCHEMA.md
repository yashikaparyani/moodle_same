# LMS Database Schema Documentation

## Overview
This database schema is designed to support a comprehensive Learning Management System (LMS) similar to Moodle, covering all essential features from course management to assessment, communication, and reporting.

---

## Core Entities

### 1. **User Management**

#### User
The central user model supporting multiple roles and authentication methods.
- Authentication: Email, username, password, OAuth
- Profile: Names, photo, bio, contact info, address
- Preferences: Notifications, timezone, language, display settings
- Status tracking: Active, suspended, inactive, pending
- Last activity and login tracking

#### Role
Granular permission system for access control.
- Permissions for: Course, User, Activity, Assessment, Forum, Reports, System
- Context-based: System, Course, Category levels
- System and custom roles

#### UserRole
Maps users to roles within specific contexts.
- Supports multiple roles per user
- Time-limited role assignments
- Context-specific (system, course, category)

---

### 2. **Course Management**

#### Course
Complete course definition with all Moodle-like features.
- **General**: Name, code, category, visibility, dates, summary
- **Format**: Layout, hidden sections behavior
- **Appearance**: Language, announcements, gradebook visibility, activity reports
- **Completion**: Tracking and condition display
- **Groups**: Mode, force mode, default grouping
- **Tags**: Course categorization
- **Image**: Course banner/thumbnail

#### Category
Hierarchical course organization.
- Nested categories (parent-child)
- Name, description

#### Section
Course content organization (topics/weeks).
- Title, summary, order
- Visibility, availability dates
- Access restrictions (date, grade, completion, group)
- Highlighted sections

#### Activity
Universal activity model for all course content types.
- **Types**: assignment, quiz, forum, resource, page, url, file, scorm, workshop, survey, feedback, chat, wiki, glossary, database, lesson, choice, book, h5p, video
- **Display**: Visibility, availability dates, order
- **Completion**: View, grade, submission requirements
- **Restrictions**: Date, grade, completion, group-based
- **Assignment fields**: Due dates, submission types, late submission
- **Quiz fields**: Time limit, attempts, grading
- **Resource fields**: Files, URLs, content

---

### 3. **Assessment & Grading**

#### Assessment
General assessment container.
- Types: quiz, assignment, exam, practical, presentation, project
- Grading: Points, percentage, rubric, scale
- Timing: Start, end, duration
- Settings: Attempts, late submission, penalties
- Rubric support with criteria and levels

#### Quiz
Detailed quiz configuration.
- Timing: Time limit, open/close dates
- Grading: Total marks, passing grade, method (highest, average, first, last)
- Question behavior: Deferred, immediate, interactive
- Navigation: Free or sequential
- Review options: During and after attempt
- Security: Password protection, browser restrictions
- Overall feedback based on grade ranges

#### Question
Flexible question model supporting multiple types.
- **Types**: multiple_choice, true_false, short_answer, essay, numerical, matching, calculated, fill_in_blanks, drag_and_drop, ordering
- **Multiple Choice**: Options with partial credit, feedback
- **Matching**: Question-answer pairs
- **Numerical**: Answer with tolerance and units
- **Calculated**: Formula with variables
- **Fill in Blanks**: Multiple blanks with accepted answers
- Hints with penalties
- Attachments and media
- Tags, difficulty, usage tracking
- Question bank categorization

#### QuizAttempt
Individual quiz attempt tracking.
- Attempt number, timing, status
- Question responses with correctness and marks
- Auto-grading support
- Overall feedback and grading
- IP address and user agent tracking

#### Submission
Assignment submissions with grading workflow.
- Types: File, text, or both
- Multiple files support
- Late submission tracking
- Attempt numbering
- Status workflow: draft → submitted → graded → returned
- Feedback with files
- Inline comments
- Plagiarism checking
- Group submissions

#### Grade
Comprehensive grading system.
- Grade items: Activity, assessment, category, course
- Multiple grade types: Raw, final, percentage, letter
- Pass/fail indicators
- Scale-based grading
- Feedback with formatting
- Override support with audit trail
- Hidden/locked/excluded grades
- Links to submissions and attempts

#### GradeScale
Configurable grading scales.
- Letter grades or descriptive scales
- Percentage ranges
- Course-specific or system-wide

---

### 4. **Communication**

#### Forum
Discussion forums with various types.
- **Types**: general, single discussion, Q&A, blog-style
- Subscription settings
- Read tracking
- Attachments support
- Optional grading
- Word count display

#### ForumPost
Forum posts and replies.
- Threaded discussions
- Subject and message
- Attachments
- Likes/reactions
- Pinning and moderation
- Edit tracking

#### Message
Direct messaging between users.
- Subject, body, attachments
- Read status and tracking
- Thread support
- Deletion by sender/receiver

#### Announcement
Course and site announcements.
- Target audience: All, students, teachers, custom
- Pinning and priority levels
- Publishing schedule
- Email notifications
- Read tracking
- Attachments

---

### 5. **Progress & Completion**

#### Enrollment
Course enrollment with progress tracking.
- Role in course: student, teacher, teaching_assistant, observer
- Enrollment method: manual, self, guest, cohort
- Progress percentage
- Activity completion tracking
- Grade tracking: Current, final, letter
- Time spent tracking
- Certificate status
- Group assignments

#### ActivityCompletion
Individual activity completion tracking.
- Status: not_started, in_progress, completed
- Criteria met: viewed, graded, submitted, etc.
- Progress percentage
- Time spent
- Attempt count
- Grade achieved

#### Completion (Legacy)
Original completion tracking for backward compatibility.

---

### 6. **Achievements**

#### Badge
Digital badges with criteria.
- **Criteria types**: manual, course_completion, activity_completion, grade, competency, custom
- Image and description
- Expiry period
- Issuer information
- Course-specific or system-wide

#### BadgeIssued
Issued badges to users.
- Issue and expiry dates
- Unique verification hash
- Public/private visibility
- Revocation support with reason

#### Certificate
Course completion certificates.
- Template configuration (HTML/URL)
- Criteria: Completion, minimum grade, specific activities
- Orientation and size settings
- Auto-issuance
- Digital signature support
- Validity period

#### CertificateIssued
Issued certificates with tracking.
- Unique certificate code
- PDF generation
- QR code for verification
- Final grade at issuance
- Revocation support

---

### 7. **Groups & Cohorts**

#### Group
Course-level groups for collaborative learning.
- Grouping membership
- Enrollment key for self-enrollment
- Capacity limits
- Messaging settings
- Visibility

#### GroupMember
Group membership tracking.
- Member or leader roles
- Join date tracking

#### Grouping
Collections of groups.
- Course-specific
- Used for activity restrictions

#### Cohort
Site-wide user collections.
- Manual or dynamic (rule-based) membership
- System or category level
- Automated enrollment
- Sync settings

---

### 8. **Calendar & Events**

#### Event
Calendar events and deadlines.
- **Types**: user, course, category, site
- **Categories**: assignment, quiz, exam, meeting, holiday, deadline
- Recurrence patterns
- All-day events
- Virtual meeting URLs
- Reminders
- Visibility control

---

### 9. **Notifications**

#### Notification
System notifications for users.
- **Types**: enrollment, due dates, grading, forum activity, messages, badges, certificates, announcements
- Priority levels
- Related entity references
- Action URLs
- Read status
- Scheduled delivery
- Multi-channel: web, email, SMS

---

### 10. **Resources & Files**

#### Resource (Fixed from Resourse.js typo)
Course learning resources.
- **Types**: pdf, video, link, file, audio, document, presentation, spreadsheet, image, archive
- File uploads or external URLs
- Display settings
- Access tracking (views, downloads)
- Visibility and availability

#### File
Centralized file management.
- Context-based storage
- Metadata: size, mime type, extension
- Access control
- Download tracking
- Virus scanning
- Soft delete support

---

### 11. **Batch System (Training-specific)**

#### Batch
Course instances/cohorts with schedules.
- Instructor assignments
- Schedule configuration (days, times, venue)
- Capacity management
- Enrollment settings
- Status workflow
- Online/offline/hybrid support
- Fees tracking

#### BatchMember
Batch enrollment with performance tracking.
- Roll number and seat assignment
- Attendance statistics
- Performance metrics
- Final results and ranking
- Payment tracking

#### Attendance
Class attendance tracking.
- Status: present, absent, late, excused, half_day
- Check-in/out times
- Location and IP tracking
- Notes and modifications
- Session references

---

### 12. **Reports & Analytics**

#### Report
Comprehensive reporting system.
- **Types**: course_completion, user_activity, grade_report, quiz_statistics, participation, login_report, assignment_submission, forum_activity
- Filters: Date ranges, users, activities
- Multiple formats: PDF, Excel, CSV, JSON
- Scheduled reports with recipients
- Generation status tracking

#### Log
System and user activity logging.
- Event types for all major actions
- Request information (IP, user agent, method, URL)
- Performance metrics
- Error tracking
- TTL for automatic cleanup (90 days)

---

### 13. **System Configuration**

#### Settings
Global system configuration.
- **Site**: Name, description, logo, favicon, contact info
- **Theme**: Colors, fonts, custom CSS
- **Email**: SMTP configuration
- **Authentication**: Registration, verification, password rules, OAuth
- **Course**: Default format, guest access, upload limits
- **Grading**: Default scales, display settings
- **Notifications**: Email, push, frequency
- **Localization**: Language, timezone, date/time formats
- **Storage**: Provider configuration (local, S3, Azure, GCP)
- **Video Conferencing**: Provider integration
- **Analytics**: Google Analytics, etc.
- **Maintenance**: Mode settings

#### Tag
Content tagging system.
- Type-specific: course, activity, user, question
- Color coding
- Usage tracking
- Official/system tags

---

### 14. **Legacy Models**

#### Candidate
Original student/candidate model (Consider using User model for new implementations).
- Complete profile information
- Education history
- Documents
- Emergency contacts
- Custom fields

#### Attempt
Original quiz/assessment attempt model (Use QuizAttempt for quizzes).

---

## Database Relationships Summary

### One-to-Many
- User → Enrollments, Submissions, Messages (sent/received), Notifications, Badges, Certificates
- Course → Sections, Activities, Enrollments, Assessments, Batches, Events
- Section → Activities, Resources
- Quiz → Questions, QuizAttempts
- Activity → ActivityCompletions, Submissions, Grades
- Batch → BatchMembers, Attendance
- Forum → ForumPosts

### Many-to-Many
- User ↔ Role (via UserRole)
- User ↔ Group (via GroupMember)
- User ↔ Cohort
- Course ↔ Category
- Group ↔ Grouping

### Polymorphic
- Grade.gradeItemType → Activity, Assessment, Category, Course
- File.contextType → Course, Activity, User, Submission, Forum, Message, etc.

---

## Indexes Summary

All models include strategic indexes on:
- Foreign keys for efficient joins
- Frequently queried fields (status, dates)
- Compound indexes for unique constraints
- Text indexes for search where applicable

---

## Key Features Covered

✅ Course Management with sections and activities
✅ Multiple activity types (15+)
✅ Comprehensive assessment system
✅ Quiz engine with 10+ question types
✅ Assignment submission and grading
✅ Discussion forums
✅ Direct messaging
✅ Announcements
✅ Calendar and events
✅ Notifications system
✅ Progress and completion tracking
✅ Badges and certificates
✅ Groups and cohorts
✅ Role-based access control
✅ Attendance tracking
✅ Batch/cohort management
✅ Grade book with multiple scales
✅ File management
✅ Reporting and analytics
✅ Activity logging
✅ System configuration
✅ Multi-language support
✅ Multiple authentication methods

---

## Migration Notes

### For Existing Data:
1. **User Migration**: Map existing candidates to User model
2. **Activity Migration**: Convert existing resources to Activity model
3. **Enrollment**: Update to include role and progress tracking
4. **Grading**: Migrate to new Grade model structure
5. **Legacy Support**: Keep Candidate, Attempt, Completion for backward compatibility

### Recommended Order of Implementation:
1. Core models: User, Role, UserRole
2. Course structure: Category, Course, Section, Activity
3. Enrollment and progress
4. Assessments: Quiz, Question, QuizAttempt
5. Submissions and grading
6. Communication: Forum, Message, Notification
7. Achievements: Badge, Certificate
8. Groups and cohorts
9. Reports and analytics
10. System configuration

---

## Best Practices

1. **Always use indexes** on foreign keys and frequently queried fields
2. **Soft delete** important data (isDeleted flag) rather than hard delete
3. **Audit trails** - Track who created/modified and when
4. **Validation** - Use schema validation and enum constraints
5. **Timestamps** - Enable timestamps on all models
6. **Status workflows** - Use enums for clear state management
7. **Referential integrity** - Use proper refs and cascading deletes
8. **Performance** - Use compound indexes for common query patterns
9. **Security** - Never store sensitive data in logs
10. **TTL indexes** - Auto-cleanup old logs and temporary data

---

## API Endpoints Needed (Recommendations)

Based on this schema, you should implement endpoints for:
- Authentication & Authorization
- User Management
- Course CRUD operations
- Section & Activity management
- Enrollment management
- Assessment creation & taking
- Submission & grading
- Forum discussions
- Messaging
- Notifications
- Calendar & Events
- Progress tracking
- Reports
- File uploads/downloads
- Settings management

---

This schema provides a solid foundation for a full-featured LMS comparable to Moodle!
