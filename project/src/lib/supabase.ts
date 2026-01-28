import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Skill = {
  id: string;
  user_id: string;
  name: string;
  category: string;
  initial_proficiency: number;
  current_score: number;
  decay_rate: number;
  last_practiced_at: string;
  created_at: string;
  updated_at: string;
};

export type Activity = {
  id: string;
  user_id: string;
  skill_id: string;
  activity_type: 'coding' | 'reading' | 'project' | 'practice' | 'tutorial';
  duration_minutes: number;
  difficulty: number;
  notes: string;
  practiced_at: string;
  created_at: string;
};

export type SkillSnapshot = {
  id: string;
  skill_id: string;
  score: number;
  snapshot_date: string;
  created_at: string;
};
