import { NextRequest, NextResponse } from 'next/server'

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
  estimatedReadyDate: string
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

// Skill level mapping for comparison
const skillLevelMap: { [key: string]: number } = {
  'beginner': 1,
  'intermediate': 2,
  'expert': 3
}

function calculateSkillMatch(requiredSkills: any[], employeeSkills: any[]): number {
  if (!requiredSkills || !employeeSkills || requiredSkills.length === 0) return 0
  
  let totalMatch = 0
  let totalRequired = requiredSkills.length
  
  for (const required of requiredSkills) {
    const employeeSkill = employeeSkills.find((empSkill: any) => 
      empSkill.skill?.toLowerCase() === required.skill?.toLowerCase()
    )
    
    if (employeeSkill) {
      const requiredLevel = skillLevelMap[required.level] || 1
      const employeeLevel = skillLevelMap[employeeSkill.level] || 1
      
      if (employeeLevel >= requiredLevel) {
        totalMatch += 1 // Full match
      } else {
        totalMatch += employeeLevel / requiredLevel // Partial match
      }
    }
  }
  
  return Math.round((totalMatch / totalRequired) * 100)
}

function determineReadiness(matchPercentage: number, missingSkills: string[]): 'ready_now' | 'ready_2weeks' | 'ready_4weeks' | 'needs_hiring' {
  if (matchPercentage >= 80) return 'ready_now'
  if (matchPercentage >= 60) return 'ready_2weeks'
  if (matchPercentage >= 40) return 'ready_4weeks'
  return 'needs_hiring'
}

async function analyzeSkillRequest(requestId: string, requiredSkills: any[], teamSize: number) {
  let employees: any[] = []
  
  try {
    // Try to fetch from Supabase first
    const { supabaseAdmin } = await import('@/lib/supabase-admin')
    const { data: master, error: masterError } = await supabaseAdmin
      .schema('public')
      .from('employee_master')
      .select('*')
    
    if (masterError) {
      throw new Error(`Supabase error: ${masterError.message}`)
    }

    // Fetch all skills for all employees
    const { data: skills, error: skillsError } = await supabaseAdmin
      .schema('public')
      .from('skills_master')
      .select('*')
    if (skillsError) {
      throw new Error(`Skills error: ${skillsError.message}`)
    }

    // Fetch all allocations for all employees
    const { data: allocations, error: allocError } = await supabaseAdmin
      .schema('public')
      .from('employee_allocation')
      .select('*')
    if (allocError) {
      throw new Error(`Allocations error: ${allocError.message}`)
    }

    // Process and combine the data
    employees = (master || []).map((employee: any) => {
      const empSkills = (skills || [])
        .filter((skill: any) => skill.employee_id === employee.employee_id)
        .map((skill: any) => ({
          skill: skill.skill_name,
          level: skill.skill_level,
          category: skill.skill_category
        }))

      const allocation = (allocations || []).find((alloc: any) => alloc.employee_id === employee.employee_id)
      const availability = allocation ? 
        (allocation.current_allocation_percentage >= 100 ? 'Busy' : 'Available') : 'Available'

      return {
        id: employee.employee_id,
        name: employee.employee_name,
        email: employee.email_id,
        role: employee.designation,
        department: employee.department,
        skills: empSkills,
        availability,
      }
    })
    .filter(emp => emp.skills && emp.skills.length > 0) // Filter out employees without skills
    .sort((a, b) => a.name.localeCompare(b.name)) // Sort alphabetically

    console.log(`✅ Using Supabase data: ${employees.length} employees with skills`)
  } catch (supabaseError) {
    console.warn('⚠️ Supabase unavailable, using fallback employee data:', supabaseError)
    
    // Fetch from the data API as fallback
    try {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
        (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3002')
      const dataResponse = await fetch(`${baseUrl}/api/data`)
      const dataResult = await dataResponse.json()
      
      if (dataResult.success && dataResult.employees) {
        employees = dataResult.employees
        console.log(`✅ Using fallback data: ${employees.length} employees`)
      } else {
        throw new Error('Fallback data API failed')
      }
    } catch (fallbackError) {
      console.error('❌ Both Supabase and fallback data API failed:', fallbackError)
      
      // Return error response instead of using hardcoded data
      throw new Error('Unable to fetch employee data from database. Please ensure the database is accessible.')
    }
  }

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

  // Analyze each employee
  const readyNow: ResourceMatch[] = []
  const ready2Weeks: ResourceMatch[] = []
  const ready4Weeks: ResourceMatch[] = []
  const directSkillEmployees: ResourceMatch[] = []
  const similarSkillEmployees: ResourceMatch[] = []

  // First, normalize required skills for comparison
  const normalizedRequiredSkills = requiredSkills.map(skill => ({
    ...skill,
    skill: skill.skill?.toLowerCase()?.trim(),
    category: skill.category?.toLowerCase()?.trim() || 'general'
  }))

  for (const employee of employees) {
    const employeeSkills = employee.skills || []
    const normalizedEmployeeSkills = employeeSkills.map((skill: any) => ({
      ...skill,
      skill: skill.skill?.toLowerCase()?.trim(),
      category: skill.category?.toLowerCase()?.trim() || 'general'
    }))

    const matchPercentage = calculateSkillMatch(normalizedRequiredSkills, normalizedEmployeeSkills)
    
    // Find missing skills
    const missingSkills = normalizedRequiredSkills
      .filter(required => !normalizedEmployeeSkills.some((empSkill: any) => 
        empSkill.skill === required.skill && 
        skillLevelMap[empSkill.level] >= skillLevelMap[required.level]
      ))
      .map(skill => skill.skill)

    const readinessStatus = determineReadiness(matchPercentage, missingSkills)
    
    let estimatedReadyDate = new Date().toISOString().split('T')[0]
    
    if (readinessStatus === 'ready_2weeks') {
      const date = new Date()
      date.setDate(date.getDate() + 14)
      estimatedReadyDate = date.toISOString().split('T')[0]
    } else if (readinessStatus === 'ready_4weeks') {
      const date = new Date()
      date.setDate(date.getDate() + 28)
      estimatedReadyDate = date.toISOString().split('T')[0]
    }

    const resourceMatch: ResourceMatch = {
      id: employee.id,
      name: employee.name,
      email: employee.email,
      department: employee.department || '',
      role: employee.role || employee.designation || '',
      matchPercentage,
      readinessStatus,
      currentSkills: employeeSkills,
      trainingNeeded: missingSkills,
      estimatedReadyDate,
      availability: employee.availability || 'Available',
      experience: employee.experience || '',
      currentProjects: employee.currentProjects || 0,
      completedProjects: employee.completedProjects || 0
    }

    // Check for direct skill matches (exact skill + level matches)
    const hasDirectMatch = normalizedRequiredSkills.some(required => 
      normalizedEmployeeSkills.some((empSkill: any) => {
        const skillMatch = empSkill.skill === required.skill
        const levelMatch = skillLevelMap[empSkill.level] >= skillLevelMap[required.level]
        return skillMatch && levelMatch
      })
    )

    if (hasDirectMatch && readinessStatus === 'ready_now') {
      directSkillEmployees.push(resourceMatch)
      readyNow.push(resourceMatch)
    } else {
      // If not direct match, check for similar/related skills (basic similarity: same category or partial match)
      const hasSimilar = normalizedRequiredSkills.some(required =>
        normalizedEmployeeSkills.some((empSkill: any) => empSkill.category && empSkill.category === required.category)
      )
      if (hasSimilar) {
        if (readinessStatus === 'ready_2weeks') {
          ready2Weeks.push(resourceMatch)
          similarSkillEmployees.push(resourceMatch)
        } else if (readinessStatus === 'ready_4weeks') {
          ready4Weeks.push(resourceMatch)
          similarSkillEmployees.push(resourceMatch)
        }
      }
    }
  }

  // If any direct skill employees, show them in the correct readiness buckets
  if (directSkillEmployees.length > 0 || ready2Weeks.length > 0 || ready4Weeks.length > 0) {
    return {
      requestId,
      readyNow: directSkillEmployees,
      ready2Weeks,
      ready4Weeks,
      externalHireNeeded: Math.max(0, teamSize - (directSkillEmployees.length + ready2Weeks.length + ready4Weeks.length)),
      recommendedActions: [
        'Team can be formed with available and soon-to-be-available resources',
        'Schedule interviews with top candidates',
        'Prepare project onboarding materials'
      ],
      confidenceScore: 100,
      analysisTime: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    }
  }

  // Otherwise, show similar/trainable employees as ready in 2 weeks
  return {
    requestId,
    readyNow: [],
    ready2Weeks: similarSkillEmployees,
    ready4Weeks: [],
    externalHireNeeded: Math.max(0, teamSize - similarSkillEmployees.length),
    recommendedActions: [
      'Start training programs for 2-week ready candidates',
      'Begin interviews with trainable candidates',
      'Schedule training for skill gaps'
    ],
    confidenceScore: similarSkillEmployees.length > 0 ? 70 : 0,
    analysisTime: new Date().toISOString(),
    lastUpdated: new Date().toISOString()
  }
  
  // (Old matches/readyNow/ready2Weeks/ready4Weeks code removed; only new logic is used above)
}

// POST /api/ai-analysis - Analyze skill request
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('📥 Received AI analysis request:', JSON.stringify(body, null, 2))
    
    const { requestId, skills, teamSize } = body
    
    if (!requestId || !skills || !Array.isArray(skills) || !teamSize) {
      console.log('❌ Missing required fields:', { requestId: !!requestId, skills: !!skills, isArray: Array.isArray(skills), teamSize: !!teamSize })
      return NextResponse.json(
        { success: false, error: 'Missing required fields: requestId, skills, or teamSize' },
        { status: 400 }
      )
    }

    console.log(`🔍 Starting AI analysis for request ${requestId}`)
    console.log(`📊 Analyzing ${skills.length} skills for team size ${teamSize}`)
    console.log('🎯 Required skills:', JSON.stringify(skills, null, 2))
    
    const analysis = await analyzeSkillRequest(requestId, skills, teamSize)
    
    console.log(`✅ Analysis completed for ${requestId}`)
    console.log(`📈 Results: ${analysis.readyNow.length} ready now, ${analysis.ready2Weeks.length} ready in 2 weeks, ${analysis.ready4Weeks.length} ready in 4 weeks`)
    
    return NextResponse.json({
      success: true,
      analysis
    })
  } catch (error) {
    console.error('❌ AI Analysis error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Analysis failed',
        details: 'Please check server logs for more information'
      },
      { status: 500 }
    )
  }
}

// GET /api/ai-analysis - Get cached analysis (placeholder for future caching)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const requestId = searchParams.get('requestId')
    
    if (!requestId) {
      return NextResponse.json(
        { success: false, error: 'requestId is required' },
        { status: 400 }
      )
    }
    
    // For now, return a message that caching is not implemented
    return NextResponse.json({
      success: false,
      message: 'Analysis caching not yet implemented. Use POST to generate new analysis.'
    })
  } catch (error) {
    console.error('GET AI Analysis error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve analysis' },
      { status: 500 }
    )
  }
}