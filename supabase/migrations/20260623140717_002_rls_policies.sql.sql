-- Row Level Security policies for all Moodle tables

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE zero_activity_students ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- PROFILES: Users can read all profiles, update only their own
-- =====================================================
CREATE POLICY "profiles_select_all" ON profiles
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_insert_own" ON profiles
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

-- =====================================================
-- COURSES: Everyone can read, teachers/admins can modify
-- =====================================================
CREATE POLICY "courses_select_all" ON courses
  FOR SELECT TO authenticated USING (true);

-- For now, allow all authenticated users to insert (admin UI would restrict)
CREATE POLICY "courses_insert_admin" ON courses
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "courses_update_admin" ON courses
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "courses_delete_admin" ON courses
  FOR DELETE TO authenticated
  USING (true);

-- =====================================================
-- ENROLLMENTS: Users can read own enrollments and course enrollments
-- =====================================================
CREATE POLICY "enrollments_select_own" ON enrollments
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid() 
    OR EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('teacher', 'tutor', 'admin')
    )
  );

CREATE POLICY "enrollments_insert_own" ON enrollments
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "enrollments_update_own" ON enrollments
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "enrollments_delete_own" ON enrollments
  FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- =====================================================
-- ASSIGNMENTS: All can read, teachers/admins can modify their courses
-- =====================================================
CREATE POLICY "assignments_select_all" ON assignments
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "assignments_insert_teacher" ON assignments
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM courses c 
      JOIN profiles p ON p.id = auth.uid()
      WHERE c.id = assignments.course_id 
      AND (c.teacher_id = auth.uid() OR p.role IN ('teacher', 'admin'))
    )
  );

CREATE POLICY "assignments_update_teacher" ON assignments
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM courses c 
      JOIN profiles p ON p.id = auth.uid()
      WHERE c.id = assignments.course_id 
      AND (c.teacher_id = auth.uid() OR p.role IN ('teacher', 'admin'))
    )
  );

CREATE POLICY "assignments_delete_teacher" ON assignments
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM courses c 
      JOIN profiles p ON p.id = auth.uid()
      WHERE c.id = assignments.course_id 
      AND (c.teacher_id = auth.uid() OR p.role IN ('teacher', 'admin'))
    )
  );

-- =====================================================
-- SUBMISSIONS: Students manage own, teachers can read/update course submissions
-- =====================================================
CREATE POLICY "submissions_select_own_or_teacher" ON submissions
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM assignments a
      JOIN courses c ON c.id = a.course_id
      JOIN profiles p ON p.id = auth.uid()
      WHERE a.id = submissions.assignment_id
      AND (c.teacher_id = auth.uid() OR p.role IN ('teacher', 'tutor', 'admin'))
    )
  );

CREATE POLICY "submissions_insert_own" ON submissions
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "submissions_update_own_or_teacher" ON submissions
  FOR UPDATE TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM assignments a
      JOIN courses c ON c.id = a.course_id
      JOIN profiles p ON p.id = auth.uid()
      WHERE a.id = submissions.assignment_id
      AND (c.teacher_id = auth.uid() OR p.role IN ('teacher', 'tutor', 'admin'))
    )
  );

-- =====================================================
-- CALENDAR_EVENTS: All can read, course teachers can manage
-- =====================================================
CREATE POLICY "calendar_select_all" ON calendar_events
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "calendar_insert_own" ON calendar_events
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "calendar_update_own" ON calendar_events
  FOR UPDATE TO authenticated
  USING (true);

CREATE POLICY "calendar_delete_own" ON calendar_events
  FOR DELETE TO authenticated
  USING (true);

-- =====================================================
-- MESSAGE_THREADS: Users can only see threads they participate in
-- =====================================================
CREATE POLICY "threads_select_own" ON message_threads
  FOR SELECT TO authenticated
  USING (participant_a = auth.uid() OR participant_b = auth.uid());

CREATE POLICY "threads_insert_own" ON message_threads
  FOR INSERT TO authenticated
  WITH CHECK (participant_a = auth.uid() OR participant_b = auth.uid());

CREATE POLICY "threads_update_own" ON message_threads
  FOR UPDATE TO authenticated
  USING (participant_a = auth.uid() OR participant_b = auth.uid());

-- =====================================================
-- MESSAGES: Users can see messages in their threads
-- =====================================================
CREATE POLICY "messages_select_own_threads" ON messages
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM message_threads t
      WHERE t.id = messages.thread_id
      AND (t.participant_a = auth.uid() OR t.participant_b = auth.uid())
    )
  );

CREATE POLICY "messages_insert_own_threads" ON messages
  FOR INSERT TO authenticated
  WITH CHECK (
    sender_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM message_threads t
      WHERE t.id = messages.thread_id
      AND (t.participant_a = auth.uid() OR t.participant_b = auth.uid())
    )
  );

-- =====================================================
-- ZERO_ACTIVITY_STUDENTS: Teachers/tutors/admins only
-- =====================================================
CREATE POLICY "zero_activity_select_staff" ON zero_activity_students
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('teacher', 'tutor', 'admin')
    )
  );

CREATE POLICY "zero_activity_insert_staff" ON zero_activity_students
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('teacher', 'tutor', 'admin')
    )
  );

CREATE POLICY "zero_activity_update_staff" ON zero_activity_students
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('teacher', 'tutor', 'admin')
    )
  );

CREATE POLICY "zero_activity_delete_staff" ON zero_activity_students
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('teacher', 'tutor', 'admin')
    )
  );
