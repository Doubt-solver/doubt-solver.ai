-- DoubtSolver.ai Database Schema
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor → New Query)

-- 1. Enable pgvector extension for RAG
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL DEFAULT 'Student',
  grade TEXT NOT NULL DEFAULT 'Class 10',
  board TEXT NOT NULL DEFAULT 'CBSE',
  xp INTEGER NOT NULL DEFAULT 0,
  level INTEGER NOT NULL DEFAULT 1,
  streak INTEGER NOT NULL DEFAULT 0,
  last_active DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Exam sessions — stores every exam taken
CREATE TABLE IF NOT EXISTS exam_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  subject TEXT NOT NULL,
  topic TEXT DEFAULT 'General',
  difficulty TEXT DEFAULT 'Medium',
  score INTEGER NOT NULL,
  total INTEGER NOT NULL,
  xp_earned INTEGER NOT NULL DEFAULT 0,
  questions_json JSONB,
  answers_json JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. User badges — tracks earned achievements
CREATE TABLE IF NOT EXISTS user_badges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  badge_key TEXT NOT NULL,
  earned_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, badge_key)
);

-- 5. Doubt sessions — tracks AI doubt conversations
CREATE TABLE IF NOT EXISTS doubt_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  response TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Documents table for RAG (pgvector)
CREATE TABLE IF NOT EXISTS documents (
  id BIGSERIAL PRIMARY KEY,
  content TEXT NOT NULL,
  subject TEXT,
  grade TEXT,
  topic TEXT,
  source TEXT,
  embedding VECTOR(768),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. Indexes
CREATE INDEX IF NOT EXISTS idx_exam_sessions_user ON exam_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_exam_sessions_created ON exam_sessions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_exam_sessions_subject ON exam_sessions(subject);
CREATE INDEX IF NOT EXISTS idx_user_badges_user ON user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_doubt_sessions_user ON doubt_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_subject ON documents(subject);

-- 8. Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE doubt_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Profiles: all authenticated users can READ (for leaderboard), but only own UPDATE/INSERT
CREATE POLICY "Anyone can view profiles for leaderboard"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Exam sessions: users can read/insert own
CREATE POLICY "Users can view own exams"
  ON exam_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own exams"
  ON exam_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- User badges: users can read/insert own
CREATE POLICY "Users can view own badges"
  ON user_badges FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own badges"
  ON user_badges FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Doubt sessions: users can read/insert own
CREATE POLICY "Users can view own doubts"
  ON doubt_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own doubts"
  ON doubt_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Documents: readable by all authenticated
CREATE POLICY "Authenticated users can read documents"
  ON documents FOR SELECT
  TO authenticated
  USING (true);

-- 9. Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ═══════════════════════════════════════════════════════════════
-- 10. Role column on profiles (admin/teacher/student)
-- ═══════════════════════════════════════════════════════════════
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'student'
  CHECK (role IN ('student','teacher','admin'));

-- ═══════════════════════════════════════════════════════════════
-- 11. Question Bank — teacher-curated questions
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS question_bank (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_by UUID REFERENCES profiles(id),
  subject TEXT NOT NULL,
  topic TEXT NOT NULL,
  difficulty TEXT DEFAULT 'Medium',
  question_text TEXT NOT NULL,
  options JSONB NOT NULL,
  correct_index INTEGER NOT NULL,
  explanation TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_question_bank_subject ON question_bank(subject);
CREATE INDEX IF NOT EXISTS idx_question_bank_topic ON question_bank(topic);

-- ═══════════════════════════════════════════════════════════════
-- 12. Quizzes — teacher-created quizzes
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS quizzes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_by UUID REFERENCES profiles(id),
  title TEXT NOT NULL,
  subject TEXT,
  question_ids UUID[] NOT NULL,
  time_limit_min INTEGER DEFAULT 30,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ═══════════════════════════════════════════════════════════════
-- 13. Announcements
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS announcements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_by UUID REFERENCES profiles(id),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  audience TEXT DEFAULT 'all',
  is_pinned BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ═══════════════════════════════════════════════════════════════
-- 14. Problem of the Day
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS problem_of_the_day (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  scheduled_date DATE UNIQUE NOT NULL,
  question_bank_id UUID REFERENCES question_bank(id),
  custom_question JSONB,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ═══════════════════════════════════════════════════════════════
-- 15. Question Reports (students report bad AI questions)
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS question_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  reported_by UUID REFERENCES profiles(id),
  question_data JSONB NOT NULL,
  reason TEXT NOT NULL,
  status TEXT DEFAULT 'open' CHECK (status IN ('open','reviewed','resolved','dismissed')),
  admin_notes TEXT,
  resolved_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_question_reports_status ON question_reports(status);

-- ═══════════════════════════════════════════════════════════════
-- 16. Revision List (student bookmarks)
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS revision_list (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  question_data JSONB NOT NULL,
  source TEXT DEFAULT 'exam',
  notes TEXT,
  is_mastered BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_revision_list_user ON revision_list(user_id);

-- ═══════════════════════════════════════════════════════════════
-- 17. RLS for new tables
-- ═══════════════════════════════════════════════════════════════
ALTER TABLE question_bank ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE problem_of_the_day ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE revision_list ENABLE ROW LEVEL SECURITY;

-- Question Bank: admins/teachers can CRUD, students can read active
CREATE POLICY "Teachers can manage question bank"
  ON question_bank FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('teacher','admin'))
  );

CREATE POLICY "Students can view active questions"
  ON question_bank FOR SELECT
  USING (is_active = true);

-- Quizzes: admins/teachers can CRUD, students can read published
CREATE POLICY "Teachers can manage quizzes"
  ON quizzes FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('teacher','admin'))
  );

CREATE POLICY "Students can view published quizzes"
  ON quizzes FOR SELECT
  USING (is_published = true);

-- Announcements: admins/teachers can CRUD, all can read
CREATE POLICY "Teachers can manage announcements"
  ON announcements FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('teacher','admin'))
  );

CREATE POLICY "All authenticated can read announcements"
  ON announcements FOR SELECT
  TO authenticated
  USING (true);

-- PotD: admins/teachers can CRUD, all can read
CREATE POLICY "Teachers can manage PotD"
  ON problem_of_the_day FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('teacher','admin'))
  );

CREATE POLICY "All authenticated can read PotD"
  ON problem_of_the_day FOR SELECT
  TO authenticated
  USING (true);

-- Question Reports: students can insert own, admins can view/update all
CREATE POLICY "Students can insert own reports"
  ON question_reports FOR INSERT
  WITH CHECK (auth.uid() = reported_by);

CREATE POLICY "Students can view own reports"
  ON question_reports FOR SELECT
  USING (auth.uid() = reported_by);

CREATE POLICY "Admins can manage all reports"
  ON question_reports FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('teacher','admin'))
  );

-- Revision List: users can CRUD own
CREATE POLICY "Users can manage own revisions"
  ON revision_list FOR ALL
  USING (auth.uid() = user_id);
