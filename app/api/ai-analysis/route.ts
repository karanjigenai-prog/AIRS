import { NextRequest, NextResponse } from 'next/server'

// AI Analysis Types
interface ResourceMatch {
  id: string
  name: string
  email: string
  department: string
  role: string
  matchPercentage: number
  readinessStatus: 'ready_now' | 'ready_2weeks' | 'ready_4weeks' | 'needs_hiring'
  currentSkills: { skill: string; level: string }[]
  trainingNeeded: string[]
  estimatedReadyDate?: string
  availability: string
  experience: string
  currentProjects: number
  completedProjects: number
}

interface AnalysisResult {
  requestId: string
  readyNow: ResourceMatch[]
  ready2Weeks: ResourceMatch[]
  ready4Weeks: ResourceMatch[]
  externalHireNeeded: number
  recommendedActions: string[]
  confidenceScore: number
  analysisTime: string
  lastUpdated: string
}

// Skill level mapping
const skillLevelMap: { [key: string]: number } = {
  'beginner': 1,
  'intermediate': 2,
  'expert': 3
}

// Helper function to calculate skill match percentage
function calculateSkillMatch(requiredSkills: any[], employeeSkills: any[]): number {
  if (requiredSkills.length === 0) return 0
  if (!employeeSkills || employeeSkills.length === 0) return 0
  
  let totalMatch = 0
  let totalWeight = 0
  
  for (const required of requiredSkills) {
    const employeeSkill = employeeSkills.find(s => 
      s.skill && s.skill.toLowerCase() === required.skill.toLowerCase()
    )
    const weight = required.mandatory ? 2 : 1
    totalWeight += weight
    if (employeeSkill) {
      totalMatch += 100 * weight // If skill present, count as 100% match
      console.log(`  Skill ${required.skill}: PRESENT`)
    } else {
      totalMatch += 0
      console.log(`  Skill ${required.skill}: MISSING`)
    }
  }
  const finalMatch = totalWeight > 0 ? Math.round(totalMatch / totalWeight) : 0
  console.log(`  Final match percentage: ${finalMatch}%`)
  return finalMatch
}

// Helper function to determine readiness status
function determineReadiness(matchPercentage: number, missingSkills: string[]): 'ready_now' | 'ready_2weeks' | 'ready_4weeks' | 'needs_hiring' {
  if (matchPercentage === 100 && missingSkills.length === 0) {
    return 'ready_now'
  } else if (matchPercentage >= 70 && missingSkills.length <= 2) {
    return 'ready_2weeks'
  } else if (matchPercentage >= 50 && missingSkills.length <= 4) {
    return 'ready_4weeks'
  } else {
    return 'needs_hiring'
  }
}

// AI Analysis function
async function analyzeSkillRequest(requestId: string, requiredSkills: any[], teamSize: number) {

  try {
    // Fetch employee master data
    const { supabaseAdmin } = await import('@/lib/supabase-admin')
    const { data: master, error: masterError } = await supabaseAdmin
      .schema('public')
      .from('employee_master')
      .select('*')
    if (masterError) {
      throw new Error(masterError.message)
    }

    // Fetch all skills for all employees
    const { data: skills, error: skillsError } = await supabaseAdmin
      .schema('public')
      .from('skills_master')
      .select('*')
    if (skillsError) {
      throw new Error(skillsError.message)
    }

    // Fetch all allocations for all employees
    const { data: allocations, error: allocError } = await supabaseAdmin
      .schema('public')
      .from('employee_allocation')
      .select('*')
    if (allocError) {
      throw new Error(allocError.message)
    }

    // Combine all data into employee objects
    let employees = master.map(emp => {
      const empSkills = skills.filter(s => s.EmployeeNumber === emp.EmployeeNumber).map(s => ({
        skill: s.SkillName,
        level: s.ProficiencyLevel,
        category: s.SkillCategory,
        certification: s.CertificationLevel
      }))
      const empAlloc = allocations.filter(a => a.EmployeeNumber === emp.EmployeeNumber)
      // Example: available if no current allocation or allocation end date is in the past
      const availability = empAlloc.length === 0 || empAlloc.every(a => a.AllocationEndDate && new Date(a.AllocationEndDate) < new Date()) ? 'Available' : 'Allocated';
      return {
        id: emp.EmployeeNumber,
        name: emp.EmployeeName,
        email: emp.Email,
        designation: emp.Designation,
        jobBand: emp.JobBand,
        skills: empSkills,
        allocations: empAlloc,
        availability,
      }
    })

    console.log(`🔍 Analyzing ${employees.length} employees for ${requiredSkills.length} required skills`)
    console.log('Required skills:', requiredSkills)

    if (!employees || employees.length === 0) {
      console.log('⚠️ No employees available for analysis')
      return {
        requestId,
        readyNow: [],
        ready2Weeks: [],
        ready4Weeks: [],
        externalHireNeeded: teamSize,
        recommendedActions: [
          'No employees available - external hiring required',
          
          'Consider using contractors or external consultants'
        ],
        confidenceScore: 0,
        analysisTime: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      }
    }
    
    const matches: ResourceMatch[] = []
    
    // Normalize skill names in request and employee data
    const normalizedRequiredSkills = requiredSkills.map(s => ({
      ...s,
      skill: s.skill.trim().toLowerCase()
    }))
    const now = new Date();
    for (const employee of employees) {
      const normalizedEmployeeSkills = employee.skills.map((empSkill: any) => ({
        ...empSkill,
        skill: empSkill.skill.trim().toLowerCase()
      }))
      // Calculate match percentage
      const matchPercentage = calculateSkillMatch(normalizedRequiredSkills, normalizedEmployeeSkills)
      // Find missing skills
      const missingSkills = normalizedRequiredSkills
        .filter(required => {
          const hasSkill = normalizedEmployeeSkills.some((empSkill: any) => empSkill.skill === required.skill)
          return !hasSkill
        })
        .map((skill: any) => skill.skill)

      // Allocation logic: when will employee be free?
      let soonestFree: Date | null = null;
      if (employee.allocations && employee.allocations.length > 0) {
        // Find the soonest allocation end date in the future
        for (const alloc of employee.allocations) {
          if (alloc.AllocationEndDate) {
            const end = new Date(alloc.AllocationEndDate);
            if (end > now && (!soonestFree || end < soonestFree)) {
              soonestFree = end;
            }
          }
        }
      }

      // Determine readiness
      let readinessStatus: 'ready_now' | 'ready_2weeks' | 'ready_4weeks' | 'needs_hiring' = determineReadiness(matchPercentage, missingSkills);
      let estimatedReadyDate: string | undefined = undefined;

      // If not ready now, check if will be free in 2 or 4 weeks
      if (readinessStatus !== 'ready_now' && soonestFree) {
        const diffDays = Math.ceil((soonestFree.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays <= 14) {
          readinessStatus = 'ready_2weeks';
          estimatedReadyDate = soonestFree.toISOString().split('T')[0];
        } else if (diffDays <= 28) {
          readinessStatus = 'ready_4weeks';
          estimatedReadyDate = soonestFree.toISOString().split('T')[0];
        }
      }

      // If not ready by allocation, check if can be trained and ready in 2 or 4 weeks
      if (readinessStatus !== 'ready_now' && !soonestFree && matchPercentage >= 50) {
        // If missing skills are trainable, assume can be ready in 2 or 4 weeks
        if (matchPercentage >= 70 && missingSkills.length <= 2) {
          readinessStatus = 'ready_2weeks';
          const date = new Date();
          date.setDate(date.getDate() + 14);
          estimatedReadyDate = date.toISOString().split('T')[0];
        } else if (matchPercentage >= 50 && missingSkills.length <= 4) {
          readinessStatus = 'ready_4weeks';
          const date = new Date();
          date.setDate(date.getDate() + 28);
          estimatedReadyDate = date.toISOString().split('T')[0];
        }
      }

      const match: ResourceMatch = {
        id: employee.id,
        name: employee.name,
        email: employee.email,
        department: '', // Not available in new structure
        role: employee.designation ?? '',
        matchPercentage,
        readinessStatus,
        currentSkills: employee.skills,
        trainingNeeded: missingSkills,
        estimatedReadyDate,
        availability: employee.availability ?? 'Available',
        experience: '', // Not available in new structure
        currentProjects: 0, // Not available in new structure
        completedProjects: 0 // Not available in new structure
      }
      matches.push(match)
    }
    
    // Sort by match percentage
    matches.sort((a, b) => b.matchPercentage - a.matchPercentage)
    
  // Categorize by readiness (show all employees in each category)
  const readyNow = matches.filter(m => m.readinessStatus === 'ready_now')
  const ready2Weeks = matches.filter(m => m.readinessStatus === 'ready_2weeks')
  const ready4Weeks = matches.filter(m => m.readinessStatus === 'ready_4weeks')
  // Calculate external hire need based on total available
  const totalAvailable = readyNow.length + ready2Weeks.length + ready4Weeks.length
  const externalHireNeeded = Math.max(0, teamSize - totalAvailable)
    
    // Generate recommended actions
    const recommendedActions = []
    if (readyNow.length >= teamSize) {
      recommendedActions.push('Team can be formed immediately with available resources')
      recommendedActions.push('Schedule interviews with top candidates')
      recommendedActions.push('Prepare project onboarding materials')
    } else if (readyNow.length + ready2Weeks.length >= teamSize) {
      recommendedActions.push('Start training programs for 2-week ready candidates')
      recommendedActions.push('Begin interviews with immediately available candidates')
      recommendedActions.push('Schedule training for skill gaps')
    } else if (totalAvailable >= teamSize) {
      recommendedActions.push('Implement comprehensive training program')
      recommendedActions.push('Consider extended project timeline')
      recommendedActions.push('Prioritize critical skills training')
    } else {
      recommendedActions.push('Begin external hiring process immediately')
      recommendedActions.push('Consider augmenting team with contractors')
      recommendedActions.push('Review project scope and timeline')
    }
    
    // Calculate confidence score
    const immediateReadiness = readyNow.length / teamSize
    const confidenceScore = Math.round(
      (immediateReadiness * 0.5 + (totalAvailable / teamSize) * 0.3 + (matches.length > 0 ? 0.2 : 0)) * 100
    )
    
    const result: AnalysisResult = {
      requestId,
      readyNow,
      ready2Weeks,
      ready4Weeks,
      externalHireNeeded,
      recommendedActions,
      confidenceScore,
      analysisTime: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    }
    
    return result
  } catch (error) {
    console.error('Analysis error:', error)
    throw error
  }
}

// POST /api/ai-analysis - Analyze skill request
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { requestId, skills, teamSize } = body
    
    if (!requestId || !skills || !teamSize) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: requestId, skills, teamSize' },
        { status: 400 }
      )
    }
    
    console.log('🔍 Starting AI analysis for request:', requestId)
    
    // Perform AI analysis
    const analysis = await analyzeSkillRequest(requestId, skills, teamSize)
    
    console.log('✅ Analysis completed for request:', requestId)
    console.log('Results:', {
      readyNow: analysis.readyNow.length,
      ready2Weeks: analysis.ready2Weeks.length,
      ready4Weeks: analysis.ready4Weeks.length,
      confidenceScore: analysis.confidenceScore
    })
    
    // If the request wants only 'ready now' employees, filter and return them
    if (request.headers.get('x-ready-now-only') === 'true') {
      return NextResponse.json({
        success: true,
        readyNow: analysis.readyNow,
        message: 'Ready now employees only'
      })
    }
    // If the request wants only 'ready in 2 weeks' employees
    if (request.headers.get('x-ready-2weeks-only') === 'true') {
      return NextResponse.json({
        success: true,
        ready2Weeks: analysis.ready2Weeks,
        message: 'Ready in 2 weeks employees only'
      })
    }
    // If the request wants only 'ready in 4 weeks' employees
    if (request.headers.get('x-ready-4weeks-only') === 'true') {
      return NextResponse.json({
        success: true,
        ready4Weeks: analysis.ready4Weeks,
        message: 'Ready in 4 weeks employees only'
      })
    }
    // Otherwise, return full analysis
    return NextResponse.json({
      success: true,
      analysis,
      message: 'AI analysis completed successfully'
    })
    
  } catch (error) {
    console.error('❌ AI Analysis Error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'AI analysis failed'
      },
      { status: 500 }
    )
  }
}

// GET /api/ai-analysis - Get analysis results
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const requestId = searchParams.get('requestId')
    
    if (!requestId) {
      return NextResponse.json(
        { success: false, error: 'requestId parameter is required' },
        { status: 400 }
      )
    }
    
    // In a real application, you would fetch this from a database
    // For now, return a mock response
    return NextResponse.json({
      success: true,
      analysis: {
        requestId,
        message: 'Use POST method to generate new analysis'
      }
    })
    
  } catch (error) {
    console.error('Get analysis error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch analysis' },
      { status: 500 }
    )
  }
}
