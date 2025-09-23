// Real-time data layer using Supabase
// This replaces the in-memory mock database with actual persistence

import { supabase } from "./supabase"
import type { 
  Employee, 
  TrainingProgram, 
  SkillRequest, 
  SupplyDemandPoint, 
  TrendPoint 
} from "./types"

// Employee operations
export async function getEmployees(): Promise<Employee[]> {
  try {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .order('name')
    
    if (error) {
      console.error('Error fetching employees:', error)
      return []
    }
    
    return data || []
  } catch (error) {
    console.error('Error in getEmployees:', error)
    return []
  }
}

export async function updateEmployees(employees: Employee[]): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('employees')
      .upsert(employees, { onConflict: 'id' })
    
    if (error) {
      console.error('Error updating employees:', error)
      return false
    }
    
    return true
  } catch (error) {
    console.error('Error in updateEmployees:', error)
    return false
  }
}

export async function addEmployee(employee: Omit<Employee, 'id'>): Promise<Employee | null> {
  try {
    const { data, error } = await supabase
      .from('employees')
      .insert([employee])
      .select()
      .single()
    
    if (error) {
      console.error('Error adding employee:', error)
      return null
    }
    
    return data
  } catch (error) {
    console.error('Error in addEmployee:', error)
    return null
  }
}

// Training program operations
export async function getTrainingPrograms(): Promise<TrainingProgram[]> {
  try {
    const { data, error } = await supabase
      .from('training_programs')
      .select('*')
      .order('name')
    
    if (error) {
      console.error('Error fetching training programs:', error)
      return []
    }
    
    return data || []
  } catch (error) {
    console.error('Error in getTrainingPrograms:', error)
    return []
  }
}

// Skill request operations
export async function getRequests(): Promise<SkillRequest[]> {
  try {
    const { data, error } = await supabase
      .from('skill_requests')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching skill requests:', error)
      return []
    }
    
    return data || []
  } catch (error) {
    console.error('Error in getRequests:', error)
    return []
  }
}

export async function addRequest(
  req: Omit<SkillRequest, 'id' | 'created_at' | 'status'> & { 
    analysisSnapshot?: any 
  }
): Promise<SkillRequest | null> {
  try {
    const newReq = {
      ...req,
      status: 'open' as const,
      analysis_snapshot: req.analysisSnapshot
    }
    
    const { data, error } = await supabase
      .from('skill_requests')
      .insert([newReq])
      .select()
      .single()
    
    if (error) {
      console.error('Error adding skill request:', error)
      return null
    }
    
    return data
  } catch (error) {
    console.error('Error in addRequest:', error)
    return null
  }
}

// Training enrollment operations
export async function enrollUserInProgram(
  userId: string, 
  programId: string
): Promise<boolean> {
  try {
    // First, get the current user
    const { data: employee, error: fetchError } = await supabase
      .from('employees')
      .select('*')
      .eq('id', userId)
      .single()
    
    if (fetchError || !employee) {
      console.error('Employee not found:', fetchError)
      return false
    }
    
    // Check if already enrolled
    const existingTraining = employee.trainings?.find(
      (t: any) => t.program_id === programId
    )
    
    if (existingTraining) {
      console.log('User already enrolled in this program')
      return true
    }
    
    // Add new training enrollment
    const newTraining = {
      program_id: programId,
      status: 'enrolled',
      progress: 0,
      started_at: new Date().toISOString()
    }
    
    const updatedTrainings = [...(employee.trainings || []), newTraining]
    
    const { error: updateError } = await supabase
      .from('employees')
      .update({ trainings: updatedTrainings })
      .eq('id', userId)
    
    if (updateError) {
      console.error('Error enrolling user:', updateError)
      return false
    }
    
    return true
  } catch (error) {
    console.error('Error in enrollUserInProgram:', error)
    return false
  }
}

export async function updateTrainingProgress(
  userId: string, 
  programId: string, 
  progress: number
): Promise<boolean> {
  try {
    // Get current user
    const { data: employee, error: fetchError } = await supabase
      .from('employees')
      .select('*')
      .eq('id', userId)
      .single()
    
    if (fetchError || !employee) {
      console.error('Employee not found:', fetchError)
      return false
    }
    
    // Update training progress
    const updatedTrainings = (employee.trainings || []).map((training: any) => {
      if (training.program_id === programId) {
        const completed = progress >= 100
        return {
          ...training,
          progress: Math.max(0, Math.min(100, progress)),
          status: completed ? 'completed' : progress > 0 ? 'in_progress' : 'enrolled',
          completed_at: completed ? new Date().toISOString() : training.completed_at
        }
      }
      return training
    })
    
    const { error: updateError } = await supabase
      .from('employees')
      .update({ trainings: updatedTrainings })
      .eq('id', userId)
    
    if (updateError) {
      console.error('Error updating training progress:', updateError)
      return false
    }
    
    return true
  } catch (error) {
    console.error('Error in updateTrainingProgress:', error)
    return false
  }
}

// Analytics data (these could also be computed from real data)
export async function getSupplyDemand(): Promise<SupplyDemandPoint[]> {
  try {
    const employees = await getEmployees()
    
    // Calculate actual supply/demand from employee data
    const skillCounts: { [key: string]: { supply: number; demand: number } } = {}
    
    employees.forEach(emp => {
      emp.skills?.forEach(skill => {
        if (!skillCounts[skill.name]) {
          skillCounts[skill.name] = { supply: 0, demand: 5 } // Base demand
        }
        if (skill.level >= 3) { // Consider level 3+ as supply
          skillCounts[skill.name].supply++
        }
      })
    })
    
    // Convert to expected format
    return Object.entries(skillCounts).map(([name, counts]) => ({
      label: name,
      supply: counts.supply,
      demand: counts.demand
    }))
  } catch (error) {
    console.error('Error in getSupplyDemand:', error)
    // Fallback data
    return [
      { label: "Java", supply: 3, demand: 5 },
      { label: "AWS", supply: 3, demand: 6 },
      { label: "Kubernetes", supply: 2, demand: 4 },
      { label: "React", supply: 1, demand: 2 },
    ]
  }
}

export async function getTrend(): Promise<TrendPoint[]> {
  try {
    // This could be computed from historical request data
    // For now, generate trend based on current date
    const trend: TrendPoint[] = []
    const now = new Date()
    
    for (let i = 0; i < 6; i++) {
      const date = new Date(now)
      date.setMonth(date.getMonth() + i)
      
      trend.push({
        month: date.toISOString().slice(0, 7), // YYYY-MM format
        demandIndex: 60 + i * 8 + (i % 2 === 0 ? 5 : -3)
      })
    }
    
    return trend
  } catch (error) {
    console.error('Error in getTrend:', error)
    return []
  }
}
