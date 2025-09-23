import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Employee {
  id: string
  name: string
  role: string
  skills: Skill[]
  certifications: Certification[]
  trainings: TrainingEnrollment[]
  created_at?: string
  updated_at?: string
}

export interface Skill {
  name: string
  level: number
  last_used?: string
}

export interface Certification {
  name: string
  issuer?: string
  expires_at: string
}

export interface TrainingEnrollment {
  program_id: string
  status: 'enrolled' | 'in_progress' | 'completed'
  progress: number
  started_at?: string
  completed_at?: string
}

export interface TrainingProgram {
  id: string
  name: string
  skills_covered: { name: string; to_level: number }[]
  est_days: number
  provider?: string
  created_at?: string
  updated_at?: string
}

export interface SkillRequest {
  id: string
  requested_by: 'delivery' | 'hr' | 'system'
  created_at: string
  skills: { name: string; min_level: number }[]
  status: 'open' | 'in_review' | 'fulfilled' | 'closed'
  analysis_snapshot?: any
  updated_at?: string
}
