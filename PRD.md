# Product Requirements Document (PRD)

## Dual-College Student Portal + AI Assistant

**Version:** 1.0.0  
**Product Type:** Web Application for Academic Information Management

---

## 1. Product Overview

The Dual-College Student Portal is a web application designed to provide verified academic information and AI-powered assistance to students from two colleges under one university. The platform serves as a centralized hub for academic calendars, syllabi, notices, and critically, exam schedules during exam week.

### Key Objectives

- Provide students with a single source of truth for academic information
- Deliver personalized exam schedules with zero tolerance for data errors
- Enable quick query resolution through an AI assistant with verified data sources
- Support two distinct colleges within a unified platform

---

## 2. Target Users

### Students
- Enrolled in one of two colleges under the university
- Need access to academic resources, schedules, and verified information
- Require personalized exam schedules during exam periods
- Prefer quick, AI-assisted responses to common academic queries

### Administrators (Internal Team)
- Authorized team members managing official academic data
- Responsible for uploading exam schedules and maintaining content accuracy
- Pre-created accounts (no public admin signup)

---

## 3. Core Features

### 3.1 User Authentication & Verification

**Student Signup & Verification**
- Account registration with college selection (2 colleges)
- Email verification required before full access
- Registration fields: College, Student Email, Register Number, Full Name, Password
- Secure password requirements (minimum 8 characters, 1 uppercase, 1 number)

**Student Login**
- JWT-based authentication
- Session management with access and refresh tokens
- Secure password reset functionality

**Admin Access**
- Pre-created accounts (manual database creation)
- Separate role-based permissions
- No public admin signup interface

### 3.2 Dashboard

**Overview Hub**
- Welcome banner with student name
- Quick access cards for all major features
- Exam count badge when schedule is available
- Upcoming events widget
- Latest notices preview with "new" indicators

### 3.3 College Activity Calendar

**Event Management**
- Display college-specific events, workshops, and holidays
- Filter by event type (workshop, holiday, exam, cultural)
- Color-coded by college
- Event details including date, time, and venue

### 3.4 Syllabus / Curriculum

**Course Materials**
- Department and semester-wise organization
- PDF viewing and download capabilities
- Subject-wise syllabus access
- Structured by College → Department → Semester → Subject

### 3.5 Notices / Circulars

**Official Announcements**
- Chronological feed of official updates
- Filter by college (or "Both")
- Priority levels (normal, important, urgent)
- Pin important notices to top
- "New" badge for unread notices

### 3.6 My Exams (Critical Feature)

**Personalized Exam Schedule**
- **Strict filtering:** Display ONLY exams matching student's college + registration number
- Exam details: Subject name, date, time, venue
- Chronological sorting
- **Safety rule:** If no exam data uploaded, display "Exam schedule not available yet"
- Read-only view (no student editing)
- Zero tolerance for incorrect exam information

**Admin Exam Management**
- Excel file upload for exam schedules
- Backend parsing and validation
- Data validation before insertion
- Preview and confirmation workflow

### 3.7 AI Assistant

**Intelligent Query Handling**
- Embedded chat interface within website
- Hybrid routing system for query classification
- Verified data sources only
- Zero hallucination policy for critical information (exam dates/times/venues)

**Query Classification System (Phase 1)**
- Step 1: LLM classifier determines if query is about exams (YES/NO)
- Step 2: Routing based on classification
  - YES → Query exam database directly
  - NO → Use RAG retrieval from syllabus/calendar/notices

**Safety Guardrails**
- Never synthesize exam information
- Explicit "Information not available" messages when data doesn't exist
- Source attribution for responses
- Privacy protection (no exposure of other students' data)

---

## 4. Technical Specifications

### 4.1 Technology Stack

**Frontend**
- Framework: React.js
- Styling: Tailwind CSS
- State Management: React Context API
- Routing: React Router v6
- HTTP Client: Axios

**Backend**
- Runtime: Node.js
- Framework: Express.js
- Validation: Joi / Zod

**Database & Services**
- Database: Supabase (PostgreSQL)
- Authentication: Supabase Auth (JWT)
- File Storage: Supabase Storage
- Vector Database: Supabase pgvector (for embeddings)

**AI/ML Stack**
- LLM Integration: OpenAI API / Anthropic Claude API
- RAG Framework: LangChain
- Orchestration: LangGraph (Phase 2)

### 4.2 API Endpoints Structure

**Authentication Routes** (`/api/v1/auth/`)
- `POST /signup` - Student registration
- `POST /login` - User authentication
- `POST /logout` - User logout (secured)
- `GET /verify-email/:token` - Email verification
- `POST /forgot-password` - Password reset request
- `POST /reset-password/:token` - Password reset confirmation
- `POST /refresh-token` - Refresh access token

**Student Routes** (`/api/v1/student/`)
- `GET /dashboard` - Dashboard data (secured)
- `GET /exams` - Personal exam schedule (secured)
- `GET /syllabus` - Syllabus list (secured)
- `GET /syllabus/:id/download` - Download syllabus PDF (secured)
- `GET /calendar` - College events (secured)
- `GET /notices` - Notices feed (secured)
- `POST /ai/chat` - AI assistant query (secured)

**Admin Routes** (`/api/v1/admin/`)
- `POST /login` - Admin authentication
- `POST /exams/upload` - Upload exam Excel (Admin only)
- `POST /exams/validate` - Validate exam data (Admin only)
- `POST /syllabus/upload` - Upload syllabus (Admin only)
- `POST /notices/create` - Create notice (Admin only)
- `PUT /notices/:id` - Update notice (Admin only)
- `DELETE /notices/:id` - Delete notice (Admin only)

**Health Check** (`/api/v1/health/`)
- `GET /` - System health status

### 4.3 Data Models

**Users Table**
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  reg_no VARCHAR(50) NOT NULL,
  college VARCHAR(100) NOT NULL,
  role VARCHAR(20) DEFAULT 'student' CHECK (role IN ('student', 'admin')),
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(college, reg_no)
);
```

**Exams Table**
```sql
CREATE TABLE exams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  college VARCHAR(100) NOT NULL,
  reg_no VARCHAR(50) NOT NULL,
  student_name VARCHAR(255) NOT NULL,
  department VARCHAR(100) NOT NULL,
  exam_name VARCHAR(255) NOT NULL,
  exam_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  venue VARCHAR(255),
  uploaded_by UUID REFERENCES users(id),
  uploaded_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT unique_exam_per_student UNIQUE(college, reg_no, exam_name, exam_date)
);
```

**Syllabus Table**
```sql
CREATE TABLE syllabus (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  college VARCHAR(100) NOT NULL,
  department VARCHAR(100) NOT NULL,
  semester INT NOT NULL,
  subject_code VARCHAR(50) NOT NULL,
  subject_name VARCHAR(255) NOT NULL,
  pdf_url TEXT NOT NULL,
  uploaded_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(college, department, semester, subject_code)
);
```

**Calendar Events Table**
```sql
CREATE TABLE calendar_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  college VARCHAR(100) NOT NULL,
  event_type VARCHAR(50) NOT NULL,
  venue VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Notices Table**
```sql
CREATE TABLE notices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  college VARCHAR(100) NOT NULL,
  priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('normal', 'important', 'urgent')),
  is_pinned BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMP DEFAULT NOW()
);
```

**AI Chat History Table** (Optional)
```sql
CREATE TABLE chat_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  response TEXT NOT NULL,
  query_type VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 5. Permission & Access Control

### Role Definitions

**Student Role**
- View dashboard and all student-facing features
- Access personal exam schedule (filtered by college + reg_no)
- View syllabus, calendar, and notices
- Use AI assistant
- Cannot upload or modify official data

**Admin Role**
- All student permissions
- Upload exam schedules via Excel
- Upload syllabus PDFs
- Create, update, and delete notices
- Manage calendar events
- Pre-created accounts only (manual database insertion)

### Data Access Rules

**Exam Schedule Access**
- Students see ONLY exams matching their college AND registration number
- Query filter: `WHERE college = $college AND reg_no = $reg_no`
- No cross-student data visibility
- Database-level constraints enforce uniqueness

**General Content Access**
- Syllabus: Filtered by college (students see their college's content)
- Calendar: Filtered by college
- Notices: Can be college-specific or "Both"
- AI responses: Never expose other students' personal data

---

## 6. AI Assistant Specifications

### Query Classification Flow

**Step 1: Classification**
- Use LLM to determine if query is about exam schedules
- Prompt: "Is this query about exam schedule/date/time/venue? Reply only YES or NO."
- Classification response: YES or NO

**Step 2: Routing Logic**

```javascript
if (classification === "YES") {
  // Route to exam database
  const exams = await getStudentExams(studentId, college, regNo);
  
  if (exams.length === 0) {
    return "Exam schedule has not been uploaded yet. Please check back later.";
  }
  
  return formatExamResponse(exams, userQuery);
  
} else {
  // Route to RAG retrieval
  const context = await retrieveFromRAG(userQuery, {
    sources: ['syllabus', 'calendar', 'notices']
  });
  
  return generateRAGResponse(context, userQuery);
}
```

### RAG Implementation

**Knowledge Base Sources**
- Syllabus documents (PDF → text chunks → embeddings)
- Calendar events
- Notices and circulars

**Retrieval Process**
1. User query → embedding generation
2. Similarity search in vector database
3. Top-K relevant chunks retrieved
4. Context provided to LLM for response generation

**Safety Rules**
- Zero hallucination policy for exam information
- Never guess or synthesize exam dates/times/venues
- Always query database directly for exam-related queries
- Cite sources when possible for non-exam queries
- Privacy protection: never expose other students' data

### Conversation UI Features

- Chat bubble interface
- Typing indicators
- Copy response button
- User feedback mechanism (thumbs up/down)
- Session-based conversation (no cross-session memory initially)

---

## 7. Exam Management System

### Admin Upload Workflow

**Step 1: Excel Upload**
- File input accepting .xlsx, .xls, .csv formats
- File size limit: 10MB
- College selector (if applicable)

**Step 2: Excel Parsing & Validation**

**Expected Excel Columns:**
| Column Name | Required | Data Type | Example |
|-------------|----------|-----------|---------|
| RegNo | Yes | String | CS21001 |
| StudentName | Yes | String | John Doe |
| Department | Yes | String | Computer Science |
| ExamName | Yes | String | Data Science |
| ExamDate | Yes | Date | 2026-02-15 |
| StartTime | No | Time | 09:00 |
| EndTime | No | Time | 12:00 |
| Venue | No | String | Hall A, Room 101 |

**Validation Rules:**
- Required fields must not be empty
- Date format validation
- Time format validation (if provided)
- RegNo alphanumeric check
- No duplicate exam entries for same student + subject + date

**Step 3: Preview & Confirmation**
- Display first 10 rows with validation status
- Show total counts: valid entries, warnings, errors
- Admin can review and confirm or fix and re-upload

**Step 4: Database Insertion**
- Bulk insert with transaction support
- Audit trail logging (uploaded_by, uploaded_at)
- Real-time status update to students (optional)

### Student Exam View Query

```sql
SELECT 
  exam_name,
  exam_date,
  start_time,
  end_time,
  venue,
  department
FROM exams
WHERE 
  college = $1 
  AND reg_no = $2
  AND exam_date >= CURRENT_DATE
ORDER BY exam_date ASC, start_time ASC;
```

**Performance Optimization:**
- Index on `(college, reg_no, exam_date)`
- Caching strategy for frequently accessed data (Phase 2)

---

## 8. Security & Privacy

### Authentication Security
- Password hashing with bcrypt (minimum 10 rounds)
- JWT tokens with 1-hour expiry for access tokens
- Refresh tokens with 7-day expiry
- Rate limiting on login attempts (5 attempts per 15 minutes)
- HTTPS enforcement in production
- Email verification required before account activation

### Authorization & Access Control
- Role-based access control (RBAC)
- Middleware verification for protected routes
- Students restricted to their own data only
- Admin-only routes protected with role checks

### Data Privacy
- Strict exam data isolation by college + reg_no
- No cross-student data exposure
- PII protection in API responses
- Secure file storage with private bucket policies
- Data retention policy for logs (90 days)

### Input Validation & Security
- All user inputs sanitized (XSS prevention)
- SQL injection prevention via parameterized queries
- File upload validation (type, size)
- CORS configuration (whitelist frontend domain)
- API rate limiting (100 requests per minute per user)

---

## 9. Success Criteria

### Key Performance Indicators (KPIs)

**User Adoption**
- 80% of eligible students signup within 2 weeks of launch
- Metric: Total registered users / Total eligible students

**Engagement**
- Daily Active Users (DAU): 40% during regular semester
- DAU during exam week: 85%
- AI Assistant usage: Average 3 queries per student per week

**Reliability**
- Uptime: 99.5% (especially critical during exam week)
- API response time: <500ms for 95th percentile
- Zero critical bugs in exam data display

**Data Accuracy**
- Exam data accuracy: 100% (zero tolerance)
- Student reports of incorrect exam info: 0 incidents
- AI hallucination incidents for exam queries: 0

**User Satisfaction**
- Feature usage during exam week:
  - Exam schedule: 90% of users
  - AI assistant: 60% of users
  - Syllabus: 50% of users
  - Calendar: 30% of users

---

## 10. File Management

### Syllabus Files
- Supported formats: PDF
- Storage: Supabase Storage (private buckets)
- Max file size: 10MB per file
- Access control: College-specific permissions

### Exam Excel Files
- Supported formats: .xlsx, .xls, .csv
- Parsing library: xlsx (Node.js)
- Validation before database insertion
- Backup of uploaded files for audit purposes

### File Security
- Virus scanning in production (ClamAV)
- File type validation on upload
- Secure file URLs with expiry (Supabase signed URLs)
- Access logs for file downloads

---

## 11. System Requirements

### Frontend Requirements
- Modern web browser (Chrome, Firefox, Safari, Edge)
- JavaScript enabled
- Responsive design support (mobile, tablet, desktop)
- Minimum screen resolution: 320px width

### Backend Requirements
- Node.js v18 or higher
- PostgreSQL 14 or higher (via Supabase)
- Minimum 2GB RAM
- 10GB storage for files and database

### Third-Party Services
- Supabase account (database, auth, storage)
- OpenAI API key or Anthropic API key
- SMTP service for email verification (Gmail, SendGrid, etc.)

---

## 12. Environment Variables

### Backend (.env)
```bash
# Server
PORT=5000
NODE_ENV=production

# Supabase
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_KEY=xxx

# JWT
JWT_SECRET=xxx
JWT_EXPIRES_IN=1h
REFRESH_TOKEN_EXPIRES_IN=7d

# AI/LLM
OPENAI_API_KEY=xxx
# OR
ANTHROPIC_API_KEY=xxx

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=xxx
SMTP_PASS=xxx

# Frontend URL
FRONTEND_URL=
```

### Frontend (.env)
```bash
REACT_APP_API_URL=
REACT_APP_SUPABASE_URL=https://xxx.supabase.co
REACT_APP_SUPABASE_ANON_KEY=xxx
```

---

## 13. Future Enhancements (Post-Launch)

### Phase 2 Features
- Mobile app (React Native) with push notifications
- Advanced AI conversation memory across sessions
- LangGraph integration for complex multi-step queries
- Student study group finder and collaboration features
- Export exam schedule as PDF
- Dark mode theme

### Phase 3 Features
- Integration with university LMS (Moodle, Canvas)
- Analytics dashboard for administrators
- Email notifications for new notices
- Multi-language support
- Gamification (badges, engagement rewards)

---

## Document Information

**Version:** 1.0.0  
**Last Updated:** February 3, 2026  
**Document Owner:** Development Team  
**Status:** Active Development

---

**End of Document**