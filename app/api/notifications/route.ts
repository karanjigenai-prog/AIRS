/**
 * Notifications API Route - /api/notifications
 * 
 * Handles sending training notification emails to employees when HR creates skill requests
 * Targets employees with intermediate/beginner skill levels for upskilling opportunities
 * 
 * Features:
 * - Filters employees by skill level (intermediate/beginner only for skill requests requiring expert level)
 * - Sends personalized emails with training resources
 * - Tracks notification status
 */

import { NextRequest, NextResponse } from 'next/server'

interface SkillRequirement {
  skill: string
  level: string // "beginner", "intermediate", "expert"
  count: number
  mandatory: boolean
}

interface SkillRequest {
  id: string
  requestId: string
  clientName: string
  projectName: string
  skills: SkillRequirement[]
}

interface Employee {
  id: string
  name: string
  email: string
  skills: { skill: string; level: string }[]
  department?: string
  role?: string
}

/**
 * Send training notifications to employees who need to level up their skills
 * POST /api/notifications
 */
export async function POST(request: NextRequest) {
  try {
    const { skillRequest, action } = await request.json()
    
    if (action === 'send_training_notifications') {
      return await sendTrainingNotifications(skillRequest)
    }
    
    return NextResponse.json({
      success: false,
      error: 'Invalid action specified'
    }, { status: 400 })
  } catch (error) {
    console.error('Error in notifications API:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to process notification request'
    }, { status: 500 })
  }
}

/**
 * Send training notifications to employees who need skill upgrades
 */
async function sendTrainingNotifications(skillRequest: SkillRequest) {
  try {
    // Fetch current employees
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000')
    const employeesResponse = await fetch(`${baseUrl}/api/data`)
    const employeeData = await employeesResponse.json()
    
    if (!employeeData.success || !employeeData.employees) {
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch employee data'
      }, { status: 500 })
    }
    
    const employees: Employee[] = employeeData.employees
    const notificationsSent: string[] = []
    const errors: string[] = []
    
    // Process each skill requirement
    for (const skillReq of skillRequest.skills) {
      // Only send notifications for expert-level requirements
      // Target employees with intermediate/beginner levels for upskilling
      if (skillReq.level === 'expert') {
        const eligibleEmployees = findEligibleEmployeesForTraining(employees, skillReq)
        
        // Send notification emails to eligible employees
        for (const employee of eligibleEmployees) {
          try {
            const emailResult = await sendSkillUpgradeEmail(employee, skillRequest, skillReq)
            if (emailResult.success) {
              notificationsSent.push(employee.email)
            } else {
              errors.push(`Failed to send email to ${employee.email}: ${emailResult.error}`)
            }
          } catch (emailError) {
            console.error(`Email error for ${employee.email}:`, emailError)
            errors.push(`Email error for ${employee.email}: ${emailError}`)
          }
        }
      }
    }
    
    return NextResponse.json({
      success: true,
      notificationsSent: notificationsSent.length,
      emails: notificationsSent,
      errors: errors.length > 0 ? errors : undefined,
      message: `Sent ${notificationsSent.length} training notifications`
    })
  } catch (error) {
    console.error('Error sending training notifications:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to send training notifications'
    }, { status: 500 })
  }
}

/**
 * Find employees eligible for skill upgrade training
 * Targets employees with intermediate/beginner skills for expert-level requirements
 */
function findEligibleEmployeesForTraining(employees: Employee[], skillReq: SkillRequirement): Employee[] {
  return employees.filter(employee => {
    // Check if employee has this skill
    const employeeSkill = employee.skills?.find(s => 
      s.skill.toLowerCase() === skillReq.skill.toLowerCase()
    )
    
    if (employeeSkill) {
      // Employee has the skill - check if they need to level up
      const currentLevel = employeeSkill.level.toLowerCase()
      const requiredLevel = skillReq.level.toLowerCase()
      
      // Send notification if employee is intermediate/beginner and requirement is expert
      if (requiredLevel === 'expert' && (currentLevel === 'intermediate' || currentLevel === 'beginner')) {
        return true
      }
      
      // Send notification if employee is beginner and requirement is intermediate
      if (requiredLevel === 'intermediate' && currentLevel === 'beginner') {
        return true
      }
    } else {
      // Employee doesn't have this skill at all - they need training
      return true
    }
    
    return false
  })
}

/**
 * Send skill upgrade email to an employee
 */
async function sendSkillUpgradeEmail(employee: Employee, skillRequest: SkillRequest, skillReq: SkillRequirement) {
  try {
    const employeeSkill = employee.skills?.find(s => 
      s.skill.toLowerCase() === skillReq.skill.toLowerCase()
    )
    
    const currentLevel = employeeSkill?.level || 'none'
    const requiredLevel = skillReq.level
    
    let emailSubject: string
    let emailMessage: string
    
    if (currentLevel === 'none') {
      // Employee doesn't have the skill
      emailSubject = `New Skill Development Opportunity - ${skillReq.skill}`
      emailMessage = `Dear ${employee.name},

We have an exciting new project "${skillRequest.projectName}" for client ${skillRequest.clientName} that requires ${skillReq.skill} expertise.

This is a great opportunity to develop new skills and advance your career. We would like to offer you training in ${skillReq.skill} to prepare you for this project.

Training Details:
- Skill: ${skillReq.skill}
- Target Level: ${requiredLevel}
- Project: ${skillRequest.projectName}
- Client: ${skillRequest.clientName}

Please review the training resources provided and let us know your interest in participating.

Best regards,
HR Team`
    } else {
      // Employee has the skill but needs to level up
      emailSubject = `Skill Upgrade Opportunity - ${skillReq.skill} (${currentLevel} → ${requiredLevel})`
      emailMessage = `Dear ${employee.name},

We have an exciting new project "${skillRequest.projectName}" for client ${skillRequest.clientName} that requires ${skillReq.skill} at ${requiredLevel} level.

Your current ${skillReq.skill} level is ${currentLevel}, and we would like to offer you advanced training to upgrade to ${requiredLevel} level. This is an excellent opportunity for professional development and career advancement.

Training Details:
- Skill: ${skillReq.skill}
- Current Level: ${currentLevel}
- Target Level: ${requiredLevel}
- Project: ${skillRequest.projectName}
- Client: ${skillRequest.clientName}

The training will help you:
- Advance your technical skills
- Qualify for higher-level projects
- Increase your market value
- Expand career opportunities

Please review the training resources provided and confirm your participation.

Best regards,
HR Team`
    }
    
    // Send email via the email API
    const emailResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        to: employee.email,
        subject: emailSubject,
        message: emailMessage,
        type: 'skill_alignment',
        data: {
          employeeName: employee.name,
          skills: [skillReq.skill],
          currentLevel: currentLevel,
          targetLevel: requiredLevel,
          projectName: skillRequest.projectName,
          clientName: skillRequest.clientName,
          hrTeamName: 'ARIS HR Team'
        }
      })
    })
    
    const emailResult = await emailResponse.json()
    return emailResult
  } catch (error) {
    console.error('Error sending skill upgrade email:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error occurred' }
  }
}

/**
 * GET /api/notifications - Get notification history (future feature)
 */
export async function GET(request: NextRequest) {
  try {
    // Future: Return notification history from database
    return NextResponse.json({
      success: true,
      notifications: [],
      message: 'Notification history feature coming soon'
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch notifications'
    }, { status: 500 })
  }
}