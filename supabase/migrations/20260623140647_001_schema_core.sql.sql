-- Core Moodle schema: profiles, courses, enrollments, assignments, calendar, messages

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Custom enum types
CREATE TYPE user_role AS ENUM ('student', 'teacher', 'tutor', 'admin');
CREATE TYPE assignment_type AS ENUM ('assign', 'quiz', 'forum', 'workshop');
CREATE TYPE assignment_status AS ENUM ('due', 'upcoming', 'overdue', 'submitted', 'graded');

-- =====================================================
-- PROFILES: extends auth.users with Moodle-specific data
-- =====================================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  student_id VARCHAR(20) UNIQUE,  -- e.g. "AB1234"
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  role user_role NOT NULL DEFAULT 'student',
  city VARCHAR(100),
  country VARCHAR(100),
  avatar_url TEXT,
  online BOOLEAN DEFAULT false,
  last_seen_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for profile lookups
CREATE INDEX profiles_role_idx ON profiles(role);
CREATE INDEX profiles_student_id_idx ON profiles(student_id);

-- Trigger to auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, email, role, student_id)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'first_name', 'New'),
    COALESCE(NEW.raw_user_meta_data->>'last_name', 'User'),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'student')::user_role,
    NEW.raw_user_meta_data->>'student_id'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =====================================================
-- COURSES: course catalog
-- =====================================================
CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(50) UNIQUE NOT NULL,  -- e.g. "IN00CT17-3009"
  name VARCHAR(255) NOT NULL,          -- full name
  short_name VARCHAR(100),             -- abbreviated name
  color VARCHAR(20) DEFAULT 'blue',     -- UI tile color
  ects INTEGER DEFAULT 5,
  term VARCHAR(50),                    -- e.g. "Spring 2026"
  teacher_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  teacher_name VARCHAR(200),           -- denormalized for display
  description TEXT,
  is_open BOOLEAN DEFAULT true,        -- open for enrolment
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX courses_code_idx ON courses(code);
CREATE INDEX courses_term_idx ON courses(term);

-- =====================================================
-- ENROLLMENTS: student-course relationships
-- =====================================================
CREATE TABLE enrollments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  enrolled_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_activity_at TIMESTAMPTZ,
  UNIQUE(user_id, course_id)
);

CREATE INDEX enrollments_user_idx ON enrollments(user_id);
CREATE INDEX enrollments_course_idx ON enrollments(course_id);

-- =====================================================
-- ASSIGNMENTS: activities with due dates
-- =====================================================
CREATE TABLE assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  type assignment_type NOT NULL DEFAULT 'assign',
  due_at TIMESTAMPTZ,
  description TEXT,
  max_grade NUMERIC(5,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX assignments_course_idx ON assignments(course_id);
CREATE INDEX assignments_due_idx ON assignments(due_at);

-- =====================================================
-- SUBMISSIONS: student assignment submissions
-- =====================================================
CREATE TABLE submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assignment_id UUID NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status assignment_status NOT NULL DEFAULT 'due',
  submitted_at TIMESTAMPTZ,
  grade NUMERIC(5,2),
  feedback TEXT,
  UNIQUE(assignment_id, user_id)
);

CREATE INDEX submissions_user_idx ON submissions(user_id);
CREATE INDEX submissions_assignment_idx ON submissions(assignment_id);

-- =====================================================
-- CALENDAR_EVENTS: calendar entries
-- =====================================================
CREATE TABLE calendar_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  event_type VARCHAR(50),             -- e.g. "deadline", "exam", "meeting"
  event_date DATE NOT NULL,
  event_time TIME,
  location VARCHAR(200),
  description TEXT,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX calendar_events_date_idx ON calendar_events(event_date);
CREATE INDEX calendar_events_course_idx ON calendar_events(course_id);

-- =====================================================
-- MESSAGE_THREADS: conversation threads
-- =====================================================
CREATE TABLE message_threads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  participant_a UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  participant_b UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  last_message TEXT,
  last_message_at TIMESTAMPTZ,
  last_message_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(participant_a, participant_b)
);

CREATE INDEX message_threads_participant_a_idx ON message_threads(participant_a);
CREATE INDEX message_threads_participant_b_idx ON message_threads(participant_b);

-- =====================================================
-- MESSAGES: individual messages in threads
-- =====================================================
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  thread_id UUID NOT NULL REFERENCES message_threads(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  read_at TIMESTAMPTZ,                 -- NULL if unread by recipient
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX messages_thread_idx ON messages(thread_id);
CREATE INDEX messages_sender_idx ON messages(sender_id);
CREATE INDEX messages_created_idx ON messages(created_at DESC);

-- =====================================================
-- ZERO_ACTIVITY_TRACKING: For tutor system (T_2/SW_14)
-- =====================================================
CREATE TABLE zero_activity_students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  last_login_at TIMESTAMPTZ,
  last_course_access_at TIMESTAMPTZ,
  assignment_submissions INTEGER DEFAULT 0,
  flagged_at TIMESTAMPTZ,
  notes TEXT,
  UNIQUE(course_id, user_id)
);

CREATE INDEX zero_activity_course_idx ON zero_activity_students(course_id);
CREATE INDEX zero_activity_flagged_idx ON zero_activity_students(flagged_at);
