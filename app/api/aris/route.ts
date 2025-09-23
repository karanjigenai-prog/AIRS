import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// ARIS: AI Resource Intelligence System API
// This endpoint handles the core workflow described in your example

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface SkillRequirement {
  skill: string
  level: number
  count: number
  mandatory: boolean
}

interface ResourceAnalysis {
  readyNow: ResourceMatch[]
  ready2Weeks: ResourceMatch[]
  ready4Weeks: ResourceMatch[]
  externalHireNeeded: number
  recommendedActions: string[]
  confidenceScore: number
  analysisTime: number // in minutes
}

interface ResourceMatch {
  id: string
  name: string
  department: string
  role: string
  matchPercentage: number
  readinessStatus: 'ready_now' | 'ready_2weeks' | 'ready_4weeks' | 'needs_hiring'
  currentSkills: { skill: string; level: number }[]
  trainingNeeded: string[]
  estimatedReadyDate?: string
  trainingCost?: number
  availabilityStart?: string
}

// ARIS Intelligence Engine - Core Algorithm
class ARISEngine {
  
  // Main analysis function - replicates the Monday 9:05 AM example
  static async analyzeSkillRequest(
    skills: SkillRequirement[],
    startDate: string,
    teamSize: number,
    projectDuration: number
  ): Promise<ResourceAnalysis> {
    const startTime = Date.now()
    
    // Step 1: Get all employees with their skills
    const { data: employees, error } = await supabase
      .from('employees')
      .select(`
        *,
        employee_skills (
          skill_id,
          current_level,
          skills (name, category)
        ),
        certifications (
          certification_name,
          expiry_date,
          status
        )
      `)
      .eq('status', 'active')

    if (error) throw error

    // Step 2: Analyze each employee against requirements
    const analysisResults = {
      readyNow: [] as ResourceMatch[],
      ready2Weeks: [] as ResourceMatch[],
      ready4Weeks: [] as ResourceMatch[],
      externalHireNeeded: 0,
      recommendedActions: [] as string[],
      confidenceScore: 0,
      analysisTime: 0
    }

    for (const employee of employees || []) {
      const match = this.evaluateEmployeeMatch(employee, skills)
      
      if (match.readinessStatus === 'ready_now') {
        analysisResults.readyNow.push(match)
      } else if (match.readinessStatus === 'ready_2weeks') {
        analysisResults.ready2Weeks.push(match)
      } else if (match.readinessStatus === 'ready_4weeks') {
        analysisResults.ready4Weeks.push(match)
      }
    }

    // Step 3: Calculate gaps and generate recommendations
    const totalAvailable = analysisResults.readyNow.length + 
                          analysisResults.ready2Weeks.length + 
                          analysisResults.ready4Weeks.length

    analysisResults.externalHireNeeded = Math.max(0, teamSize - totalAvailable)
    analysisResults.recommendedActions = this.generateRecommendations(
      analysisResults, 
      skills, 
      teamSize, 
      startDate
    )
    analysisResults.confidenceScore = this.calculateConfidenceScore(analysisResults, teamSize)
    analysisResults.analysisTime = (Date.now() - startTime) / 1000 / 60 // Convert to minutes

    return analysisResults
  }

  // Evaluate individual employee against skill requirements
  static evaluateEmployeeMatch(employee: any, requirements: SkillRequirement[]): ResourceMatch {
    const employeeSkills = employee.employee_skills || []
    const skillMap = new Map(
      employeeSkills.map((es: any) => [es.skills?.name, es.current_level])
    )

    let matchedSkills = 0
    let almostMatchedSkills = 0
    let currentSkills: { skill: string; level: number }[] = []
    let trainingNeeded: string[] = []

    for (const req of requirements) {
      const currentLevel = (skillMap.get(req.skill) as number) || 0
      
      if (currentLevel > 0) {
        currentSkills.push({ skill: req.skill, level: currentLevel })
      }

      if (currentLevel >= req.level) {
        matchedSkills++
      } else if (currentLevel >= req.level - 1) {
        almostMatchedSkills++
        trainingNeeded.push(`${req.skill} L${req.level} (Quick Upskill)`)
      } else if (currentLevel >= req.level - 2) {
        trainingNeeded.push(`${req.skill} L${req.level} (Extended Training)`)
      } else {
        trainingNeeded.push(`${req.skill} L${req.level} (Comprehensive Training)`)
      }
    }

    const matchPercentage = (matchedSkills / requirements.length) * 100
    
    let readinessStatus: ResourceMatch['readinessStatus'] = 'needs_hiring'
    let estimatedReadyDate: string | undefined

    if (matchedSkills === requirements.length) {
      readinessStatus = 'ready_now'
    } else if (matchedSkills + almostMatchedSkills >= requirements.length) {
      readinessStatus = 'ready_2weeks'
      estimatedReadyDate = this.addWeeksToDate(new Date(), 2)
    } else if (matchedSkills + almostMatchedSkills >= requirements.length * 0.7) {
      readinessStatus = 'ready_4weeks'
      estimatedReadyDate = this.addWeeksToDate(new Date(), 4)
    }

    return {
      id: employee.id,
      name: employee.name,
      department: employee.department,
      role: employee.role,
      matchPercentage: Math.round(matchPercentage),
      readinessStatus,
      currentSkills,
      trainingNeeded: trainingNeeded.slice(0, 3), // Limit to top 3 training needs
      estimatedReadyDate,
      trainingCost: this.estimateTrainingCost(trainingNeeded),
      availabilityStart: this.getAvailabilityDate(employee)
    }
  }

  // Generate actionable recommendations (like the Monday 9:30 AM example)
  static generateRecommendations(
    analysis: ResourceAnalysis,
    skills: SkillRequirement[],
    teamSize: number,
    startDate: string
  ): string[] {
    const recommendations = []

    // Ready now resources
    if (analysis.readyNow.length > 0) {
      const names = analysis.readyNow.slice(0, 3).map(r => r.name).join(', ')
      recommendations.push(`✅ Deploy ${names} immediately (${analysis.readyNow.length} ready now)`)
    }

    // 2-week training recommendations
    if (analysis.ready2Weeks.length > 0) {
      const skills2Week = [...new Set(
        analysis.ready2Weeks.flatMap(r => r.trainingNeeded)
      )].slice(0, 2)
      recommendations.push(
        `🚀 Fast-track training for ${analysis.ready2Weeks.length} developers: ${skills2Week.join(', ')}`
      )
    }

    // 4-week training recommendations
    if (analysis.ready4Weeks.length > 0) {
      recommendations.push(
        `📚 Start comprehensive upskilling for ${analysis.ready4Weeks.length} developers (4-week timeline)`
      )
    }

    // External hiring recommendation
    if (analysis.externalHireNeeded > 0) {
      recommendations.push(
        `🔍 Initiate external hiring process for ${analysis.externalHireNeeded} ${analysis.externalHireNeeded === 1 ? 'developer' : 'developers'}`
      )
    }

    // Timeline optimization
    const totalReady = analysis.readyNow.length + analysis.ready2Weeks.length
    if (totalReady >= teamSize) {
      recommendations.push(
        `⚡ Project can start on schedule with ${totalReady} internal resources`
      )
    } else {
      const delay = Math.ceil((teamSize - totalReady) / 2) * 2 // Estimate delay in weeks
      recommendations.push(
        `⏰ Consider extending timeline by ${delay} weeks to reduce external hiring from ${analysis.externalHireNeeded} to ${Math.max(0, analysis.externalHireNeeded - analysis.ready4Weeks.length)}`
      )
    }

    // Skills trending recommendation
    const highDemandSkills = skills.filter(s => ['Java', 'AWS', 'Kubernetes', 'React', 'Python'].includes(s.skill))
    if (highDemandSkills.length > 0) {
      recommendations.push(
        `📈 High-demand skills detected. Recommend training 8+ additional developers in this combination for future requests`
      )
    }

    return recommendations
  }

  // Calculate AI confidence score
  static calculateConfidenceScore(analysis: ResourceAnalysis, teamSize: number): number {
    const totalMatched = analysis.readyNow.length + analysis.ready2Weeks.length + analysis.ready4Weeks.length
    const coverageScore = Math.min((totalMatched / teamSize) * 100, 100)
    
    const readinessScore = (
      analysis.readyNow.length * 100 +
      analysis.ready2Weeks.length * 80 +
      analysis.ready4Weeks.length * 60
    ) / Math.max(totalMatched, 1)

    return Math.round((coverageScore * 0.6 + readinessScore * 0.4))
  }

  // Helper functions
  static addWeeksToDate(date: Date, weeks: number): string {
    const result = new Date(date)
    result.setDate(result.getDate() + weeks * 7)
    return result.toISOString().split('T')[0]
  }

  static estimateTrainingCost(trainingNeeded: string[]): number {
    // Estimate based on training complexity
    return trainingNeeded.length * 15000 // ₹15,000 per training program
  }

  static getAvailabilityDate(employee: any): string {
    // Check current project assignments (simplified)
    const today = new Date()
    today.setDate(today.getDate() + Math.floor(Math.random() * 14)) // Random 0-14 days
    return today.toISOString().split('T')[0]
  }
}

// API Endpoints
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { skills, startDate, teamSize, projectDuration } = body

    if (!skills || !Array.isArray(skills) || skills.length === 0) {
      return NextResponse.json(
        { error: 'Skills requirements are required' },
        { status: 400 }
      )
    }

    // Simulate the ARIS analysis process
    console.log(`🧠 ARIS Analysis Started for ${teamSize} person team`)
    console.log(`📋 Skills: ${skills.map((s: any) => `${s.skill} L${s.level}`).join(', ')}`)
    
    const analysis = await ARISEngine.analyzeSkillRequest(
      skills,
      startDate,
      teamSize,
      projectDuration
    )

    console.log(`✅ Analysis Complete in ${analysis.analysisTime.toFixed(1)} minutes`)
    console.log(`📊 Results: ${analysis.readyNow.length} ready, ${analysis.ready2Weeks.length} trainable 2w, ${analysis.ready4Weeks.length} trainable 4w`)

    return NextResponse.json({
      success: true,
      analysis,
      message: `ARIS analysis completed in ${analysis.analysisTime.toFixed(1)} minutes with ${analysis.confidenceScore}% confidence`
    })

  } catch (error) {
    console.error('ARIS Analysis Error:', error)
    return NextResponse.json({
      error: 'Failed to analyze skill requirements',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'dashboard'

    switch (type) {
      case 'dashboard':
        return await getDashboardMetrics()
      
      case 'trends':
        return await getSkillTrends()
      
      case 'alerts':
        return await getCertificationAlerts()
      
      default:
        return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 })
    }

  } catch (error) {
    console.error('ARIS API Error:', error)
    return NextResponse.json({
      error: 'Failed to fetch ARIS data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

async function getDashboardMetrics() {
  // Simulate real-time dashboard metrics
  const metrics = {
    activeRequests: 7,
    availableResources: 342,
    avgMatchTime: 2.3, // minutes
    successRate: 94, // percentage
    
    recentActivity: [
      {
        time: '2 minutes ago',
        action: 'Analysis completed for TechCorp Cloud Migration project',
        confidence: 92
      },
      {
        time: '15 minutes ago',
        action: '3 developers enrolled in Kubernetes training',
        status: 'in_progress'
      },
      {
        time: '1 hour ago',
        action: 'External hiring approved for 2 senior developers',
        status: 'approved'
      }
    ],

    skillDemandTop5: [
      { skill: 'Java', requests: 12, trend: 'up' },
      { skill: 'AWS', requests: 10, trend: 'up' },
      { skill: 'React', requests: 8, trend: 'stable' },
      { skill: 'Kubernetes', requests: 7, trend: 'up' },
      { skill: 'Python', requests: 6, trend: 'stable' }
    ]
  }

  return NextResponse.json(metrics)
}

async function getSkillTrends() {
  // 6-month skill demand trend
  const trends = {
    periods: ['Apr 2025', 'May 2025', 'Jun 2025', 'Jul 2025', 'Aug 2025', 'Sep 2025'],
    skills: {
      'Java': [8, 9, 12, 14, 15, 12],
      'AWS': [6, 8, 10, 12, 11, 10],
      'Kubernetes': [3, 4, 6, 8, 9, 7],
      'React': [7, 8, 8, 9, 8, 8],
      'Python': [5, 6, 7, 6, 7, 6]
    },
    predictions: {
      'Java + AWS + Kubernetes': {
        currentQuarter: 12,
        nextQuarter: 16,
        growth: '+40%',
        recommendation: 'Train 8 more developers in this combination'
      }
    }
  }

  return NextResponse.json(trends)
}

async function getCertificationAlerts() {
  // Get certifications expiring soon
  const alerts = [
    {
      employee: 'Sarah Johnson',
      certification: 'AWS Solutions Architect',
      expiryDate: '2025-09-30',
      daysLeft: 28,
      priority: 'high',
      renewalCost: 15000,
      impact: 'Currently assigned to cloud migration project'
    },
    {
      employee: 'Mike Chen',
      certification: 'Kubernetes Administrator',
      expiryDate: '2025-10-15',
      daysLeft: 43,
      priority: 'medium',
      renewalCost: 12000,
      impact: 'Required for upcoming container projects'
    }
  ]

  return NextResponse.json(alerts)
}
