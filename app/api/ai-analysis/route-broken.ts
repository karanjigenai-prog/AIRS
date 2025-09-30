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

    // Combine all data into employee objects
    employees = master.map(emp => {
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
        role: emp.Designation,
        department: emp.Department || 'Gen AI Development',
        location: emp.Location || 'India',
        experience: emp.Experience || '2+ years',
        phone: emp.Phone,
        currentProjects: empAlloc.filter(a => !a.AllocationEndDate || new Date(a.AllocationEndDate) > new Date()).length,
        completedProjects: empAlloc.filter(a => a.AllocationEndDate && new Date(a.AllocationEndDate) <= new Date()).length,
        skills: empSkills,
        allocations: empAlloc,
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
      const dataResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/data`)
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
          /*availability: 'Available',
          experience: '3+ years',
          currentProjects: 2,
          completedProjects: 8,
          skills: [
            { skill: 'Machine Learning', level: 'intermediate' },
            { skill: 'Python', level: 'expert' },
            { skill: 'TensorFlow', level: 'intermediate' },
            { skill: 'Natural Language Processing', level: 'intermediate' },
            { skill: 'AI/ML', level: 'intermediate' },
            { skill: 'Deep Learning', level: 'beginner' }
          ]
        },
        {
          id: 'emp2',
          name: 'Grifith Sheeba Menon',
          email: 'sheebam@karanji.com',
          role: 'Senior Gen AI Developer',
          department: 'Gen AI Development',
          availability: 'Available',
          experience: '6+ years',
          currentProjects: 3,
          completedProjects: 18,
          skills: [
            { skill: 'Machine Learning', level: 'expert' },
            { skill: 'Deep Learning', level: 'expert' },
            { skill: 'Python', level: 'expert' },
            { skill: 'TensorFlow', level: 'expert' },
            { skill: 'PyTorch', level: 'expert' },
            { skill: 'AI/ML', level: 'expert' },
            { skill: 'Natural Language Processing', level: 'expert' },
            { skill: 'Computer Vision', level: 'expert' }
          ]
        },
        {
          id: 'emp3',
          name: 'K Sumanth',
          email: 'KSumanth@karanji.com',
          role: 'Gen AI Developer',
          department: 'Gen AI Development',
          availability: 'Busy',
          experience: '3+ years',
          currentProjects: 2,
          completedProjects: 10,
          skills: [
            { skill: 'Python', level: 'expert' },
            { skill: 'Machine Learning', level: 'expert' },
            { skill: 'Deep Learning', level: 'intermediate' },
            { skill: 'AI/ML', level: 'expert' },
            { skill: 'Neural Networks', level: 'intermediate' },
            { skill: 'TensorFlow', level: 'intermediate' }
          ]
        },
        {
          id: 'emp4',
          name: 'Sowmyashree',
          email: 'Athulyaroy@karanji.com',
          role: 'Senior Gen AI Developer',
          department: 'Gen AI Development',
          availability: 'Available',
          experience: '5+ years',
          currentProjects: 2,
          completedProjects: 15,
          skills: [
            { skill: 'Machine Learning', level: 'expert' },
            { skill: 'Deep Learning', level: 'expert' },
            { skill: 'Python', level: 'expert' },
            { skill: 'Natural Language Processing', level: 'expert' },
            { skill: 'AI/ML', level: 'expert' },
            { skill: 'Generative AI', level: 'expert' },
            { skill: 'LLM Development', level: 'expert' },
            { skill: 'Transformer Models', level: 'intermediate' }
          ]
        },
        {
          id: 'emp5',
          name: 'Sumith R Naik',
          email: 'sumithrnaik@karanji.com',
          role: 'Gen AI Developer',
          department: 'Gen AI Development',
          availability: 'Available',
          experience: '2+ years',
          currentProjects: 1,
          completedProjects: 6,
          skills: [
            { skill: 'Python', level: 'expert' },
            { skill: 'Machine Learning', level: 'intermediate' },
            { skill: 'Computer Vision', level: 'intermediate' },
            { skill: 'PyTorch', level: 'intermediate' },
            { skill: 'AI/ML', level: 'intermediate' },
            { skill: 'Data Science', level: 'beginner' }
          ]
        }
      ].filter(emp => emp.skills && emp.skills.length > 0) // Filter employees without skills
       .sort((a, b) => a.name.localeCompare(b.name)) // Sort alphabetically
      
      console.log(`📦 Using hardcoded fallback: ${employees.length} employees`)
    }
  }*/

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
    
    // Normalize skill names in request and employee data
    const normalizedRequiredSkills = requiredSkills.map(s => ({
      ...s,
      skill: s.skill.trim().toLowerCase()
    }));
    const now = new Date();
    let directSkillEmployees: ResourceMatch[] = [];
    let ready2Weeks: ResourceMatch[] = [];
    let ready4Weeks: ResourceMatch[] = [];
    let similarSkillEmployees: ResourceMatch[] = [];

  for (const employee of employees) {
      const normalizedEmployeeSkills = employee.skills.map((empSkill: any) => ({
        ...empSkill,
        skill: empSkill.skill.trim().toLowerCase()
      }));
      // Check if employee has ALL required skills
      const hasAllSkills = normalizedRequiredSkills.every(required =>
        normalizedEmployeeSkills.some((empSkill: any) => empSkill.skill === required.skill)
      );
      // Calculate match percentage
      const matchPercentage = calculateSkillMatch(normalizedRequiredSkills, normalizedEmployeeSkills);
      // Find missing skills
      const missingSkills = normalizedRequiredSkills
        .filter(required => {
          const hasSkill = normalizedEmployeeSkills.some((empSkill: any) => empSkill.skill === required.skill)
          return !hasSkill
        })
        .map((skill: any) => skill.skill);

      // Allocation logic: when will employee be free?
      let soonestFree: Date | null = null;
      if (employee.allocations && employee.allocations.length > 0) {
        for (const alloc of employee.allocations) {
          if (alloc.AllocationEndDate) {
            const end = new Date(alloc.AllocationEndDate);
            if (end > now && (!soonestFree || end < soonestFree)) {
              soonestFree = end;
            }
          }
        }
      }

      let readinessStatus: 'ready_now' | 'ready_2weeks' | 'ready_4weeks' | 'needs_hiring' = 'needs_hiring';
      let estimatedReadyDate: string | undefined = undefined;

      if (hasAllSkills) {
        if (employee.availability === 'Available') {
          readinessStatus = 'ready_now';
          directSkillEmployees.push({
            id: employee.id,
            name: employee.name,
            email: employee.email,
            department: '',
            role: employee.designation ?? '',
            matchPercentage,
            readinessStatus,
            currentSkills: employee.skills,
            trainingNeeded: missingSkills,
            estimatedReadyDate,
            availability: employee.availability ?? 'Available',
            experience: '',
            currentProjects: 0,
            completedProjects: 0
          });
        } else if (soonestFree) {
          const diffDays = Math.ceil((soonestFree.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          if (diffDays <= 14) {
            readinessStatus = 'ready_2weeks';
            estimatedReadyDate = soonestFree.toISOString().split('T')[0];
            ready2Weeks.push({
              id: employee.id,
              name: employee.name,
              email: employee.email,
              department: '',
              role: employee.designation ?? '',
              matchPercentage,
              readinessStatus,
              currentSkills: employee.skills,
              trainingNeeded: missingSkills,
              estimatedReadyDate,
              availability: employee.availability ?? 'Allocated',
              experience: '',
              currentProjects: 0,
              completedProjects: 0
            });
          } else if (diffDays <= 28) {
            readinessStatus = 'ready_4weeks';
            estimatedReadyDate = soonestFree.toISOString().split('T')[0];
            ready4Weeks.push({
              id: employee.id,
              name: employee.name,
              email: employee.email,
              department: '',
              role: employee.designation ?? '',
              matchPercentage,
              readinessStatus,
              currentSkills: employee.skills,
              trainingNeeded: missingSkills,
              estimatedReadyDate,
              availability: employee.availability ?? 'Allocated',
              experience: '',
              currentProjects: 0,
              completedProjects: 0
            });
          }
        }
      } else {
        // If not direct match, check for similar/related skills (basic similarity: same category or partial match)
        const hasSimilar = normalizedRequiredSkills.some(required =>
          normalizedEmployeeSkills.some((empSkill: any) => empSkill.category && empSkill.category === required.category)
        );
        if (hasSimilar) {
          readinessStatus = 'ready_2weeks';
          const date = new Date();
          date.setDate(date.getDate() + 14);
          estimatedReadyDate = date.toISOString().split('T')[0];
          similarSkillEmployees.push({
            id: employee.id,
            name: employee.name,
            email: employee.email,
            department: '',
            role: employee.designation ?? '',
            matchPercentage,
            readinessStatus,
            currentSkills: employee.skills,
            trainingNeeded: missingSkills,
            estimatedReadyDate,
            availability: employee.availability ?? 'Available',
            experience: '',
            currentProjects: 0,
            completedProjects: 0
          });
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
      };
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
    };
    
    // (Old matches/readyNow/ready2Weeks/ready4Weeks code removed; only new logic is used above)
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
