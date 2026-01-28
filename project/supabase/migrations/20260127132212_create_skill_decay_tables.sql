/*
  # Skill Decay Tracker Platform Schema

  ## Overview
  Creates the complete database schema for tracking skills, practice activities, 
  and calculating decay over time using forgetting curve algorithms.

  ## New Tables
  
  ### `skills`
  Stores user skills with proficiency and decay settings
  - `id` (uuid, primary key)
  - `user_id` (uuid, references auth.users)
  - `name` (text) - Skill name (e.g., "Java", "React", "DSA")
  - `category` (text) - Category (e.g., "Programming", "Framework", "Database")
  - `initial_proficiency` (integer) - Starting proficiency (0-100)
  - `current_score` (numeric) - Current skill score (0-100)
  - `decay_rate` (numeric) - How fast skill decays (0.01-0.1)
  - `last_practiced_at` (timestamptz) - Last practice timestamp
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### `activities`
  Logs practice sessions for skills
  - `id` (uuid, primary key)
  - `user_id` (uuid, references auth.users)
  - `skill_id` (uuid, references skills)
  - `activity_type` (text) - Type: "coding", "reading", "project", "practice"
  - `duration_minutes` (integer) - Time spent
  - `difficulty` (integer) - Difficulty level (1-5)
  - `notes` (text) - Optional practice notes
  - `practiced_at` (timestamptz) - When practice occurred
  - `created_at` (timestamptz)

  ### `skill_snapshots`
  Historical skill scores for tracking decay over time
  - `id` (uuid, primary key)
  - `skill_id` (uuid, references skills)
  - `score` (numeric) - Skill score at this point
  - `snapshot_date` (timestamptz)
  - `created_at` (timestamptz)

  ## Security
  - Enable RLS on all tables
  - Users can only access their own data
  - Authenticated users required for all operations
*/

-- Create skills table
CREATE TABLE IF NOT EXISTS skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  category text NOT NULL,
  initial_proficiency integer NOT NULL CHECK (initial_proficiency >= 0 AND initial_proficiency <= 100),
  current_score numeric NOT NULL DEFAULT 100 CHECK (current_score >= 0 AND current_score <= 100),
  decay_rate numeric NOT NULL DEFAULT 0.05 CHECK (decay_rate >= 0.01 AND decay_rate <= 0.2),
  last_practiced_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create activities table
CREATE TABLE IF NOT EXISTS activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  skill_id uuid REFERENCES skills(id) ON DELETE CASCADE NOT NULL,
  activity_type text NOT NULL CHECK (activity_type IN ('coding', 'reading', 'project', 'practice', 'tutorial')),
  duration_minutes integer NOT NULL CHECK (duration_minutes > 0),
  difficulty integer NOT NULL DEFAULT 3 CHECK (difficulty >= 1 AND difficulty <= 5),
  notes text DEFAULT '',
  practiced_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Create skill_snapshots table
CREATE TABLE IF NOT EXISTS skill_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  skill_id uuid REFERENCES skills(id) ON DELETE CASCADE NOT NULL,
  score numeric NOT NULL CHECK (score >= 0 AND score <= 100),
  snapshot_date timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_snapshots ENABLE ROW LEVEL SECURITY;

-- RLS Policies for skills table
CREATE POLICY "Users can view own skills"
  ON skills FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own skills"
  ON skills FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own skills"
  ON skills FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own skills"
  ON skills FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for activities table
CREATE POLICY "Users can view own activities"
  ON activities FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own activities"
  ON activities FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own activities"
  ON activities FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own activities"
  ON activities FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for skill_snapshots table
CREATE POLICY "Users can view snapshots of own skills"
  ON skill_snapshots FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM skills
      WHERE skills.id = skill_snapshots.skill_id
      AND skills.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert snapshots for own skills"
  ON skill_snapshots FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM skills
      WHERE skills.id = skill_snapshots.skill_id
      AND skills.user_id = auth.uid()
    )
  );

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_skills_user_id ON skills(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_user_id ON activities(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_skill_id ON activities(skill_id);
CREATE INDEX IF NOT EXISTS idx_skill_snapshots_skill_id ON skill_snapshots(skill_id);
CREATE INDEX IF NOT EXISTS idx_activities_practiced_at ON activities(practiced_at DESC);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for skills table
CREATE TRIGGER update_skills_updated_at
  BEFORE UPDATE ON skills
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();