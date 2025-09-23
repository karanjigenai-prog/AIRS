// Types for ARIS with Supabase integration

export type SkillLevel = 1 | 2 | 3 | 4 | 5

export type Skill = {
  name: string
  level: SkillLevel
  last_used?: string // ISO date
}

export type Certification = {
  name: string
  issuer?: string
  expires_at: string // ISO date
}

export type TrainingEnrollment = {
  program_id: string
  status: "enrolled" | "in_progress" | "completed"
  progress: number // 0-100
  started_at?: string
  completed_at?: string
}

export type Employee = {
  id: string
  name: string
  role: string
  skills: Skill[]
  certifications: Certification[]
  trainings: TrainingEnrollment[]
  created_at?: string
  updated_at?: string
}

export type RequiredSkill = {
  name: string
  min_level: SkillLevel
}

export type SkillRequest = {
  id: string
  requested_by: "delivery" | "hr" | "system"
  created_at: string
  skills: RequiredSkill[]
  status: "open" | "in_review" | "fulfilled" | "closed"
  analysis_snapshot?: GapAnalysis
  updated_at?: string
}

export type GapBucketReason = {
  missingSkills?: string[]
  belowLevelSkills?: { name: string; have: number; need: number }[]
  expiringCerts?: string[]
}

export type GapEmployeeEntry = {
  employee: Employee
  reason?: GapBucketReason
  estimatedUpskillDays?: number
}

export type GapAnalysis = {
  readyNow: GapEmployeeEntry[]
  trainable: GapEmployeeEntry[]
  missing: Employee[]
  needsNewHires: number
  summary: {
    totalEmployees: number
    readyCount: number
    trainableCount: number
    expiringCertsCount: number
  }
}

export type TrainingProgram = {
  id: string
  name: string
  skills_covered: { name: string; to_level: SkillLevel }[]
  est_days: number
  provider?: string
  created_at?: string
  updated_at?: string
}

export type SupplyDemandPoint = {
  label: string
  supply: number
  demand: number
}

export type TrendPoint = {
  month: string
  demandIndex: number
}
