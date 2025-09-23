import { NextRequest, NextResponse } from 'next/server'

// Skill Request Interface
interface SkillRequirement {
  skill: string
  level: string // Changed to string for "beginner", "intermediate", "expert"
  count: number
  mandatory: boolean
}

interface SkillRequest {
  id: string
  requestId: string
  clientName: string
  clientEmail?: string
  projectName: string
  projectDescription?: string
  requestedBy: string
  requestDate: string
  requiredStartDate: string
  projectDurationWeeks: number
  teamSizeRequired: number
  priority: 'urgent' | 'high' | 'medium' | 'low'
  status: 'pending' | 'analyzing' | 'proposed' | 'training_scheduled' | 'profiles_sent' | 'interviews_scheduled' | 'fulfilled'
  skills: SkillRequirement[]
  analysis?: any
}

// In-memory storage for skill requests (in production, use a database)
let skillRequests: SkillRequest[] = [
  {
    id: '1',
    requestId: 'REQ-2025-001',
    clientName: 'TechCorp Solutions',
    clientEmail: 'contact@techcorp.com',
    projectName: 'AI Platform Development',
    projectDescription: 'Building next-generation AI platform with machine learning capabilities',
    requestedBy: 'HR Team',
    requestDate: '2025-09-02',
    requiredStartDate: '2025-09-23',
    projectDurationWeeks: 16,
    teamSizeRequired: 4,
    priority: 'high',
    status: 'analyzing',
    skills: [
      { skill: 'Python', level: 'expert', count: 3, mandatory: true },
      { skill: 'Machine Learning', level: 'expert', count: 2, mandatory: true },
      { skill: 'TensorFlow', level: 'intermediate', count: 2, mandatory: true },
      { skill: 'Deep Learning', level: 'intermediate', count: 2, mandatory: false }
    ]
  },
  {
    id: '2', 
    requestId: 'REQ-2025-002',
    clientName: 'DataFlow Analytics',
    clientEmail: 'projects@dataflow.com',
    projectName: 'Real-time Analytics Dashboard',
    projectDescription: 'Development of real-time data processing and visualization platform',
    requestedBy: 'Sales Team',
    requestDate: '2025-09-01',
    requiredStartDate: '2025-09-15',
    projectDurationWeeks: 12,
    teamSizeRequired: 3,
    priority: 'medium',
    status: 'pending',
    skills: [
      { skill: 'React', level: 'expert', count: 2, mandatory: true },
      { skill: 'Node.js', level: 'intermediate', count: 2, mandatory: true },
      { skill: 'MongoDB', level: 'intermediate', count: 1, mandatory: false }
    ]
  }
]

// GET /api/skill-requests - Get all skill requests
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    
    let filteredRequests = skillRequests
    
    if (status) {
      filteredRequests = skillRequests.filter(req => req.status === status)
    }
    
    return NextResponse.json({
      success: true,
      requests: filteredRequests,
      total: filteredRequests.length
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch skill requests' },
      { status: 500 }
    )
  }
}

// POST /api/skill-requests - Create new skill request
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const newRequest: SkillRequest = {
      id: Date.now().toString(),
      requestId: `REQ-2025-${String(skillRequests.length + 1).padStart(3, '0')}`,
      clientName: body.clientName,
      clientEmail: body.clientEmail,
      projectName: body.projectName,
      projectDescription: body.projectDescription,
      requestedBy: body.requestedBy || 'HR Team',
      requestDate: new Date().toISOString().split('T')[0],
      requiredStartDate: body.requiredStartDate,
      projectDurationWeeks: body.projectDurationWeeks || 12,
      teamSizeRequired: body.teamSizeRequired || 3,
      priority: body.priority || 'medium',
      status: 'pending',
      skills: body.skills || []
    }
    
    skillRequests.push(newRequest)
    
    return NextResponse.json({
      success: true,
      request: newRequest,
      message: 'Skill request created successfully'
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to create skill request' },
      { status: 500 }
    )
  }
}

// PUT /api/skill-requests - Update skill request
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updates } = body
    
    const requestIndex = skillRequests.findIndex(req => req.id === id)
    
    if (requestIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Skill request not found' },
        { status: 404 }
      )
    }
    
    skillRequests[requestIndex] = { ...skillRequests[requestIndex], ...updates }
    
    return NextResponse.json({
      success: true,
      request: skillRequests[requestIndex],
      message: 'Skill request updated successfully'
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to update skill request' },
      { status: 500 }
    )
  }
}
