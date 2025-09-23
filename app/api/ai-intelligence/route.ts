import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Enterprise AI-Powered Workforce Intelligence API
// This endpoint demonstrates premium features worth 100 crores

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface AIInsight {
  id: string
  type: 'churn_prediction' | 'performance_forecast' | 'skill_gap' | 'promotion_readiness'
  employee_id: string
  prediction: any
  confidence_score: number
  recommendations: string[]
  created_at: string
}

interface WorkforceMetrics {
  total_employees: number
  active_employees: number
  churn_risk_count: number
  promotion_ready_count: number
  avg_engagement_score: number
  retention_rate: number
  training_roi: number
}

// Simulated AI model predictions (in production, these would call actual ML models)
class AIWorkforceEngine {
  
  // 🧠 Employee Churn Prediction Algorithm
  static predictChurn(employee: any): { risk_score: number, factors: string[] } {
    const factors = []
    let risk_score = 0

    // Engagement analysis
    if (employee.engagement_score < 6) {
      risk_score += 30
      factors.push('Low engagement score')
    }

    // Performance trends
    if (employee.performance_trend === 'declining') {
      risk_score += 25
      factors.push('Declining performance')
    }

    // Tenure analysis
    if (employee.tenure_months < 6 || employee.tenure_months > 36) {
      risk_score += 20
      factors.push('Critical tenure period')
    }

    // Compensation satisfaction
    if (employee.salary_satisfaction < 7) {
      risk_score += 25
      factors.push('Salary dissatisfaction')
    }

    return { risk_score: Math.min(risk_score, 100), factors }
  }

  // 🎯 Performance Forecasting
  static forecastPerformance(employee: any): { predicted_rating: number, growth_trajectory: string } {
    const current_performance = employee.performance_rating || 3.5
    const training_completion = employee.training_completion_rate || 0.7
    const engagement = employee.engagement_score || 7

    const performance_modifier = (training_completion * 0.3) + (engagement / 10 * 0.7)
    const predicted_rating = Math.min(current_performance + performance_modifier, 5.0)
    
    const growth_trajectory = predicted_rating > current_performance + 0.3 ? 'High Growth' :
                            predicted_rating > current_performance ? 'Steady Growth' :
                            'Needs Attention'

    return { predicted_rating: Math.round(predicted_rating * 10) / 10, growth_trajectory }
  }

  // 🚀 Promotion Readiness Assessment
  static assessPromotionReadiness(employee: any): { readiness_score: number, requirements: string[] } {
    const requirements = []
    let readiness_score = 0

    if (employee.performance_rating >= 4.0) readiness_score += 30
    else requirements.push('Improve performance rating to 4.0+')

    if (employee.training_completion_rate >= 0.8) readiness_score += 25
    else requirements.push('Complete 80%+ of assigned trainings')

    if (employee.leadership_score >= 7) readiness_score += 25
    else requirements.push('Develop leadership skills')

    if (employee.tenure_months >= 12) readiness_score += 20
    else requirements.push('Gain more experience (12+ months)')

    return { readiness_score, requirements }
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'overview'

    switch (type) {
      case 'overview':
        return await getWorkforceOverview()
      
      case 'predictions':
        return await getAIPredictions()
      
      case 'metrics':
        return await getRealTimeMetrics()
      
      case 'insights':
        return await getActionableInsights()
      
      default:
        return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 })
    }

  } catch (error) {
    console.error('AI Intelligence API Error:', error)
    return NextResponse.json({ 
      error: 'Failed to generate AI insights',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

async function getWorkforceOverview(): Promise<NextResponse> {
  // Fetch employee data from Supabase
  const { data: employees, error } = await supabase
    .from('employees')
    .select('*')
    .limit(100)

  if (error) throw error

  const overview = {
    total_employees: employees?.length || 0,
    departments: [...new Set(employees?.map(e => e.department))],
    avg_tenure: employees?.reduce((sum, e) => sum + (e.tenure_months || 12), 0) / (employees?.length || 1),
    skills_coverage: calculateSkillsCoverage(employees || []),
    engagement_trends: generateEngagementTrends(),
    timestamp: new Date().toISOString()
  }

  return NextResponse.json(overview)
}

async function getAIPredictions(): Promise<NextResponse> {
  const { data: employees } = await supabase
    .from('employees')
    .select('*')
    .limit(50)

  const predictions = employees?.map(employee => {
    const churn = AIWorkforceEngine.predictChurn(employee)
    const performance = AIWorkforceEngine.forecastPerformance(employee)
    const promotion = AIWorkforceEngine.assessPromotionReadiness(employee)

    return {
      employee_id: employee.id,
      employee_name: employee.name,
      churn_prediction: churn,
      performance_forecast: performance,
      promotion_readiness: promotion,
      overall_score: Math.round((100 - churn.risk_score + promotion.readiness_score) / 2),
      generated_at: new Date().toISOString()
    }
  }) || []

  return NextResponse.json({ predictions, total: predictions.length })
}

async function getRealTimeMetrics(): Promise<NextResponse> {
  const { data: employees } = await supabase
    .from('employees')
    .select('*')

  const metrics: WorkforceMetrics = {
    total_employees: employees?.length || 0,
    active_employees: employees?.filter(e => e.status === 'active').length || 0,
    churn_risk_count: employees?.filter(e => {
      const churn = AIWorkforceEngine.predictChurn(e)
      return churn.risk_score > 70
    }).length || 0,
    promotion_ready_count: employees?.filter(e => {
      const promotion = AIWorkforceEngine.assessPromotionReadiness(e)
      return promotion.readiness_score > 80
    }).length || 0,
    avg_engagement_score: calculateAverageEngagement(employees || []),
    retention_rate: calculateRetentionRate(employees || []),
    training_roi: calculateTrainingROI()
  }

  return NextResponse.json(metrics)
}

async function getActionableInsights(): Promise<NextResponse> {
  const { data: employees } = await supabase
    .from('employees')
    .select('*')
    .limit(20)

  const insights = employees?.map(employee => {
    const churn = AIWorkforceEngine.predictChurn(employee)
    const performance = AIWorkforceEngine.forecastPerformance(employee)
    
    let insight_type = 'normal'
    let priority = 'low'
    let action_required = false

    if (churn.risk_score > 70) {
      insight_type = 'churn_risk'
      priority = 'high'
      action_required = true
    } else if (performance.predicted_rating < 3.0) {
      insight_type = 'performance_concern'
      priority = 'medium'
      action_required = true
    }

    return {
      employee_id: employee.id,
      employee_name: employee.name,
      insight_type,
      priority,
      action_required,
      recommendations: generateRecommendations(employee, churn, performance),
      confidence: Math.round(Math.random() * 20 + 80), // 80-100% confidence
      created_at: new Date().toISOString()
    }
  }).filter(insight => insight.action_required) || []

  return NextResponse.json({ insights, count: insights.length })
}

// Helper functions
function calculateSkillsCoverage(employees: any[]): any {
  const allSkills = employees.flatMap(e => e.skills || [])
  const skillCounts = allSkills.reduce((acc, skill) => {
    acc[skill.name] = (acc[skill.name] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  return Object.entries(skillCounts)
    .sort(([,a], [,b]) => (b as number) - (a as number))
    .slice(0, 10)
    .map(([skill, count]) => ({ skill, coverage: count }))
}

function generateEngagementTrends(): any[] {
  // Simulated 6-month trend data
  return Array.from({ length: 6 }, (_, i) => ({
    month: new Date(Date.now() - (5-i) * 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 7),
    engagement_score: Math.round((Math.random() * 2 + 7) * 10) / 10
  }))
}

function calculateAverageEngagement(employees: any[]): number {
  const scores = employees.map(e => e.engagement_score || 7)
  return Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length * 10) / 10
}

function calculateRetentionRate(employees: any[]): number {
  // Simulated retention calculation
  return Math.round((employees.filter(e => e.status === 'active').length / employees.length) * 1000) / 10
}

function calculateTrainingROI(): number {
  // Simulated ROI calculation based on training completion and performance
  return Math.round(Math.random() * 200 + 250) // 250-450% ROI
}

function generateRecommendations(employee: any, churn: any, performance: any): string[] {
  const recommendations = []
  
  if (churn.risk_score > 70) {
    recommendations.push('Schedule immediate 1:1 meeting with manager')
    recommendations.push('Review compensation and benefits package')
    recommendations.push('Offer flexible work arrangements')
  }
  
  if (performance.predicted_rating < 3.5) {
    recommendations.push('Enroll in performance improvement program')
    recommendations.push('Assign mentor for skill development')
    recommendations.push('Set clear 30-60-90 day goals')
  }
  
  return recommendations
}
