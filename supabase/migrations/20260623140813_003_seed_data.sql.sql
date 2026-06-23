-- Seed courses and settings - user profiles are auto-created via auth trigger

-- =====================================================
-- COURSES: Student's enrolled courses (teacher_id will be set later when teachers join)
-- =====================================================
INSERT INTO courses (code, name, short_name, color, ects, term, teacher_name, is_open) VALUES
  ('IN00CT17-3009', 'Artificial Intelligence 10 ects (Spring 2026)', 'Artificial Intelligence', 'cyan', 10, 'Spring 2026', 'Dr. Aila Mäkelä', true),
  ('TVTKESA2026', 'TVT Kesäprojektit / Summer project', 'Summer project', 'navy', 5, 'Summer 2026', 'Markus Salo', true),
  ('T771010D', 'Company-Oriented Product Development', 'Product Development', 'tan', 5, 'Spring 2026', 'Henna Virtanen', true),
  ('thesis-din', 'Thesis DIN', 'Thesis DIN', 'amber', 15, 'Spring 2026', 'Prof. Olli Räsänen', true),
  ('ID00ER99-3001', 'Software testing (Spring 2026)', 'Software testing', 'magenta', 5, 'Spring 2026', 'Riikka Niemi', true),
  ('ID00CS54-3004', 'Data Storage and Data Analysis', 'Data Storage & Analysis', 'purple', 5, 'Spring 2026', 'Janne Koskinen', true),
  ('YY00DU46-3008:1', 'DIN23SP S25 Professional Development', 'Professional Development', 'blue', 2, 'Spring 2026', 'Sari Lehto', true);

-- =====================================================
-- COURSES: Catalog (available for enrolment, user not enrolled)
-- =====================================================
INSERT INTO courses (code, name, short_name, color, ects, term, teacher_name, is_open) VALUES
  ('ID00DA22-3002', 'Introduction to Machine Learning', 'Machine Learning', 'teal', 5, 'Autumn 2026', 'Dr. Aila Mäkelä', true),
  ('TX00EA01-3010', 'Cloud Deployment with Pouta & Rahti', 'Cloud Deployment', 'blue', 5, 'Autumn 2026', 'Markus Salo', true),
  ('ID00BL19-3003', 'Web Automation & Agents', 'Web Automation', 'purple', 5, 'Autumn 2026', 'Riikka Niemi', true),
  ('LX00CG12-3001', 'Academic Finnish for Engineers', 'Academic Finnish', 'magenta', 3, 'Autumn 2026', 'Sari Lehto', false);

-- =====================================================
-- ASSIGNMENTS / TIMELINE activities
-- =====================================================
DO $$
DECLARE
  course1_id UUID;
  course3_id UUID;
  course5_id UUID;
  course6_id UUID;
BEGIN
  SELECT id INTO course5_id FROM courses WHERE code = 'ID00ER99-3001';
  SELECT id INTO course1_id FROM courses WHERE code = 'IN00CT17-3009';
  SELECT id INTO course6_id FROM courses WHERE code = 'ID00CS54-3004';
  SELECT id INTO course3_id FROM courses WHERE code = 'T771010D';

  INSERT INTO assignments (course_id, title, type, due_at) VALUES
    (course5_id, 'Submit: Test plan v2', 'assign', now() + interval '23 hours'),
    (course1_id, 'Quiz 4 — Search algorithms', 'quiz', now() + interval '1 day 14 hours'),
    (course6_id, 'Lab report 3', 'assign', '2026-06-24 17:00:00'),
    (course3_id, 'Sprint review submission', 'assign', '2026-06-26 12:00:00');
END $$;

-- =====================================================
-- CALENDAR EVENTS (June 2026)
-- =====================================================
DO $$
DECLARE
  course1_id UUID;
  course2_id UUID;
  course3_id UUID;
  course4_id UUID;
  course5_id UUID;
  course6_id UUID;
BEGIN
  SELECT id INTO course1_id FROM courses WHERE code = 'IN00CT17-3009';
  SELECT id INTO course2_id FROM courses WHERE code = 'TVTKESA2026';
  SELECT id INTO course3_id FROM courses WHERE code = 'T771010D';
  SELECT id INTO course4_id FROM courses WHERE code = 'thesis-din';
  SELECT id INTO course5_id FROM courses WHERE code = 'ID00ER99-3001';
  SELECT id INTO course6_id FROM courses WHERE code = 'ID00CS54-3004';

  INSERT INTO calendar_events (course_id, title, event_type, event_date, event_time) VALUES
    (course5_id, 'Exam (retake) opens', 'exam', '2026-06-10', NULL),
    (course5_id, 'Test plan v2 due', 'deadline', '2026-06-12', NULL),
    (course1_id, 'Quiz 4', 'quiz', '2026-06-13', NULL),
    (course3_id, 'Sprint review', 'meeting', '2026-06-18', NULL),
    (course4_id, 'Thesis check-in', 'meeting', '2026-06-20', NULL),
    (course6_id, 'Lab report 3 due', 'deadline', '2026-06-24', NULL),
    (course2_id, 'Summer project kickoff', 'meeting', '2026-06-26', NULL);
END $$;
