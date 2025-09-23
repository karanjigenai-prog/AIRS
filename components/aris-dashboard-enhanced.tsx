"use client"

/**
 * ARIS Enhanced Dashboard - Main Component
 * 
 * This is the primary HR workforce intelligence portal component that handles:
 * - Client skill request management
 * - Employee skill analysis and matching
 * - Training coordination and scheduling
 * - Client communication and profile sharing
 * - Email notifications and status updates
 * 
 * Features:
 * - Skills dropdown with 30+ predefined skills
 * - Real-time email functionality
 * - Indian employee data with actual email addresses
 * - Comprehensive training management
 * - Client communication dashboard
 */

import * as React from "react"
import useSWR from "swr"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getBestTrainingResourceForSkill } from "@/lib/training-links"
import { ExcelImport } from "./excel-import"
import { 
  Clock, 
  Users, 
  CheckCircle, 
  AlertTriangle, 
  Calendar, 
  TrendingUp,
  Search,
  Plus,
  Send,
  Target,
  Brain,
  Zap,
  BarChart3,
  UserCheck,
  BookOpen,
  Shield,
  Globe,
  Award,
  FileText,
  Activity,
  Briefcase,
  Settings,
  X,
  Mail,
  Upload
} from "lucide-react"

/**
 * Data fetcher function for SWR (handles API data fetching)
 */
const fetcher = (url: string) => fetch(url).then((r) => r.json())

/**
 * Interface Definitions
 * These TypeScript interfaces define the data structures used throughout the application
 */

// Individual skill requirement for a project
interface SkillRequirement {
  skill: string      // Name of the skill (e.g., 'Java', 'AWS')
  level: number      // Required proficiency level (1-5)
  count: number      // Number of employees needed with this skill
  mandatory: boolean // Whether this skill is mandatory or optional
}

// Employee resource match data structure
interface ResourceMatch {
  id: string                    // Unique employee identifier
  name: string                  // Full name of the employee
  department: string            // Department (e.g., 'Engineering')
  matchPercentage: number       // How well employee matches requirements (0-100%)
  readinessStatus: 'ready_now' | 'ready_2weeks' | 'ready_4weeks' | 'needs_hiring'
  currentSkills: { skill: string; level: number }[]  // Employee's current skill levels
  trainingNeeded: string[]      // List of training programs needed
  estimatedReadyDate?: string   // When employee will be ready (for training cases)
  workload?: string            // Current workload percentage
  availability?: string        // Availability status
  certifications?: string[]    // Professional certifications
  trainingProgress?: number    // Training completion percentage (0-100)
  trainingStatus?: 'not_started' | 'in_progress' | 'completed'
  trainingLinks?: string[]     // Links to training resources
  email?: string              // Employee email for notifications
  profileSentToClient?: boolean // Whether profile has been sent to client
}

// Main skill request data structure
interface SkillRequest {
  id: string                   // Unique request identifier
  requestId: string           // Human-readable request ID (e.g., REQ-2025-001)
  clientName: string          // Name of the requesting client
  clientEmail?: string        // Client's email for communication
  projectName: string         // Name of the project
  projectDescription?: string // Detailed project description
  requestedBy: string         // Who created the request (usually HR Team)
  requestDate: string         // When request was created
  requiredStartDate: string   // When project needs to start
  projectDurationWeeks: number // Project duration in weeks
  teamSizeRequired: number    // Total team members needed
  priority: 'urgent' | 'high' | 'medium' | 'low'
  status: 'pending' | 'analyzing' | 'proposed' | 'training_scheduled' | 'profiles_sent' | 'interviews_scheduled' | 'fulfilled'
  skills: SkillRequirement[]
  analysis?: {
    readyNow: ResourceMatch[]
    ready2Weeks: ResourceMatch[]
    ready4Weeks: ResourceMatch[]
    externalHireNeeded: number
    recommendedActions: string[]
    confidenceScore: number
    analysisTime?: string
    lastUpdated?: string
    trainingScheduled?: boolean
    profilesSentToClient?: boolean
  }
}

/**
 * ARIS Enhanced Dashboard Main Component
 * 
 * This is the core component that renders the entire HR workforce intelligence portal.
 * It manages all state, handles user interactions, and coordinates between different tabs.
 */
export function ARISEnhancedDashboard() {
  // State management for active tab navigation
  const [activeTab, setActiveTab] = React.useState<'overview' | 'requests' | 'analysis' | 'workforce' | 'training' | 'clients'>('overview')
  
  // SWR hook for data fetching with automatic revalidation
  const { data, mutate } = useSWR("/api/data", fetcher)
  const employees = data?.employees || []
  const programs = data?.programs || []
  
  /**
   * Predefined skills list for dropdown selection
   * Contains 30+ industry-standard technical skills organized by category
   */
  const availableSkills = [
    'Java', 'JavaScript', 'Python', 'React', 'Node.js', 'Angular', 'Vue.js',
    'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Spring Boot', 'Express.js',
    'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'Elasticsearch',
    'Machine Learning', 'Data Science', 'AI/ML', 'TensorFlow', 'PyTorch',
    'DevOps', 'CI/CD', 'Jenkins', 'Git', 'Linux', 'Bash/Shell',
    'Microservices', 'GraphQL', 'REST APIs', 'HTML/CSS', 'TypeScript',
    'Agile/Scrum', 'Project Management', 'System Design', 'Testing/QA'
  ]
  
  /**
   * State for new skill request form
   * Manages all input fields for creating a new client request
   */
  const [newRequest, setNewRequest] = React.useState<Partial<SkillRequest>>({
    clientName: '',
    projectName: '',
    requestedBy: 'HR Team',
    requiredStartDate: '',
    projectDurationWeeks: 12,
    teamSizeRequired: 5,
    priority: 'medium',
    skills: [],
    clientEmail: '',
    projectDescription: ''
  })
  
  /**
   * Skills management state
   * These states manage the dynamic skill addition interface
   */
  const [selectedSkill, setSelectedSkill] = React.useState('')       // Currently selected skill from dropdown
  const [skillLevel, setSkillLevel] = React.useState('3')           // Required skill level (1-5)
  const [skillCount, setSkillCount] = React.useState('1')           // Number of employees needed
  const [isMandatory, setIsMandatory] = React.useState(true)        // Whether skill is mandatory or optional
  
  /**
   * Helper function to add a new skill requirement
   * Validates input and adds skill to the current request
   */
  const addSkill = () => {
    if (selectedSkill && !newRequest.skills?.find(s => s.skill === selectedSkill)) {
      const newSkill: SkillRequirement = {
        skill: selectedSkill,
        level: parseInt(skillLevel),
        count: parseInt(skillCount),
        mandatory: isMandatory
      }
      setNewRequest({
        ...newRequest,
        skills: [...(newRequest.skills || []), newSkill]
      })
      setSelectedSkill('')
      setSkillLevel('3')
      setSkillCount('1')
      setIsMandatory(true)
    }
  }
  
  /**
   * Helper function to remove a skill requirement
   * Removes the specified skill from the current request
   */
  const removeSkill = (skillToRemove: string) => {
    setNewRequest({
      ...newRequest,
      skills: newRequest.skills?.filter(s => s.skill !== skillToRemove) || []
    })
  }
  
  /**
   * Email service function
   * Handles sending emails via the /api/email endpoint
   * Supports different email types with appropriate templates
   * 
   * @param to - Recipient email address
   * @param subject - Email subject line
   * @param message - Email message content
   * @param type - Email type for template selection ('profile_sent', 'training_scheduled', etc.)
   * @param data - Additional data for email templates
   * @returns Promise<boolean> - Success status
   */
  const sendEmail = async (to: string, subject: string, message: string, type: string = 'general', data: any = {}) => {
    try {
      const response = await fetch('/api/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to,
          subject,
          message,
          type,
          data
        }),
      })
      
      const result = await response.json()
      
      if (result.success) {
        // You can add a toast notification here
        console.log('Email sent successfully:', result)
        return true
      } else {
        console.error('Failed to send email:', result.error)
        return false
      }
    } catch (error) {
      console.error('Email error:', error)
      return false
    }
  }
  
  // Send profile to client
  const sendProfileToClient = async (employee: ResourceMatch, request: SkillRequest) => {
    if (!request.clientEmail) {
      alert('Client email not available')
      return
    }
    
    const subject = `Candidate Profile for ${request.projectName}`
    const message = `
We have identified a suitable candidate for your project requirements:

Employee: ${employee.name}
Department: ${employee.department}
Match Percentage: ${employee.matchPercentage}%
Current Skills: ${employee.currentSkills.map(s => `${s.skill} (Level ${s.level})`).join(', ')}
Availability: ${employee.availability || 'Available'}

This candidate meets your project requirements and is ready to start.
    `
    
    const success = await sendEmail(
      request.clientEmail,
      subject,
      message,
      'profile_sent',
      {
        clientName: request.clientName,
        projectName: request.projectName,
        employeeName: employee.name,
        employeeId: employee.id
      }
    )
    
    if (success) {
      // Update employee status
      employee.profileSentToClient = true
      mutate() // Refresh data
      alert('Profile sent to client successfully!')
    }
  }
  
  // Schedule training and send notifications
  const scheduleTraining = async (employee: ResourceMatch, request: SkillRequest) => {
    if (!employee.email) {
      alert('Employee email not available')
      return
    }
    
    const subject = `Training Assignment for ${request.projectName}`
    const message = `
You have been assigned to a new project that requires additional training.

Please review your training requirements and schedule in the Training section of the portal.
    `
    
    const success = await sendEmail(
      employee.email,
      subject,
      message,
      'training_scheduled',
      {
        clientName: request.clientName,
        projectName: request.projectName,
        employeeName: employee.name,
        trainingSkills: employee.trainingNeeded
      }
    )
    
    if (success) {
      // Update training status
      employee.trainingStatus = 'in_progress'
      mutate() // Refresh data
      alert('Training scheduled and notification sent!')
    }
  }

  // Real-world ARIS example data with Indian employees
  const [skillRequests, setSkillRequests] = React.useState<SkillRequest[]>([
    {
      id: '1',
      requestId: 'REQ-2025-001',
      clientName: 'TechCorp Solutions',
      clientEmail: 'contact@techcorp.com',
      projectName: 'Cloud Migration Platform',
      projectDescription: 'Migration of legacy systems to AWS cloud infrastructure',
      requestedBy: 'HR Team',
      requestDate: '2025-09-02',
      requiredStartDate: '2025-09-23',
      projectDurationWeeks: 24,
      teamSizeRequired: 5,
      priority: 'high',
      status: 'training_scheduled',
      skills: [
        { skill: 'Java', level: 4, count: 3, mandatory: true },
        { skill: 'AWS', level: 3, count: 5, mandatory: true },
        { skill: 'Kubernetes', level: 3, count: 5, mandatory: true },
        { skill: 'Spring Boot', level: 3, count: 3, mandatory: false }
      ],
      analysis: {
        readyNow: [
          {
            id: 'emp1',
            name: 'Grifith Sheeba Menon', 
            department: 'Developer',
            matchPercentage: 95,
            readinessStatus: 'ready_now',
            currentSkills: [
              { skill: 'Java', level: 5 },
              { skill: 'AWS', level: 4 },
              { skill: 'Kubernetes', level: 4 },
              { skill: 'Spring Boot', level: 4 }
            ],
            trainingNeeded: [],
            workload: '75%',
            availability: 'Available Now',
            certifications: ['Oracle Java SE 11 Certified', 'AWS Solutions Architect'],
            email: 'sheebam@karanji.com', 
            trainingStatus: 'completed',
            trainingProgress: 100,
            profileSentToClient: false
          },
          {
            id: 'emp2',
            name: 'Shivani B T', 
            department: 'Developer',
            matchPercentage: 92,
            readinessStatus: 'ready_now',
            currentSkills: [
              { skill: 'Java', level: 4 },
              { skill: 'AWS', level: 4 },
              { skill: 'Kubernetes', level: 3 },
              { skill: 'Spring Boot', level: 3 }
            ],
            trainingNeeded: [],
            workload: '60%',
            availability: 'Available Now',
            certifications: ['Java SE 8 Certified', 'AWS Developer Associate'],
            email: 'shivani@karanji.com', 
            trainingStatus: 'in_progress',
            trainingProgress: 65,
            profileSentToClient: false
          },
          {
            id: 'emp3',
            name: 'Athulya Roy', // Indian employee as requested
            department: 'Engineering',
            matchPercentage: 88,
            readinessStatus: 'ready_now',
            currentSkills: [
              { skill: 'Java', level: 5 },
              { skill: 'AWS', level: 3 },
              { skill: 'Kubernetes', level: 4 },
              { skill: 'Spring Boot', level: 5 }
            ],
            trainingNeeded: [],
            workload: '70%',
            availability: 'Available Now',
            certifications: ['Oracle Java SE 11 Certified', 'CKA: Certified Kubernetes Administrator'],
            email: 'athulyaroy@gmail.com', // Real email as requested
            trainingStatus: 'completed',
            trainingProgress: 100,
            profileSentToClient: true
          },
          {
            id: 'emp4',
            name: 'Ateef Hussain Sheikh', // Indian employee as requested
            department: 'Gen AI Engineering',
            matchPercentage: 88,
            readinessStatus: 'ready_now',
            currentSkills: [
              { skill: 'Java', level: 5 },
              { skill: 'AWS', level: 3 },
              { skill: 'Kubernetes', level: 4 },
              { skill: 'Spring Boot', level: 5 }
            ],
            trainingNeeded: [],
            workload: '70%',
            availability: 'Available Now',
            certifications: ['Oracle Java SE 11 Certified', 'CKA: Certified Kubernetes Administrator'],
            email: 'athulyaroy@gmail.com', // Real email as requested
            trainingStatus: 'completed',
            trainingProgress: 100,
            profileSentToClient: true
          }
        ],
        ready2Weeks: [
          {
            id: 'emp4',
            name: 'Priya Sharma',
            department: 'Engineering',
            matchPercentage: 75,
            readinessStatus: 'ready_2weeks',
            currentSkills: [
              { skill: 'Java', level: 4 },
              { skill: 'AWS', level: 4 }
            ],
            trainingNeeded: ['Kubernetes CKA Certification', 'Spring Boot Advanced'],
            estimatedReadyDate: '2025-09-16',
            workload: '65%',
            availability: 'Training Required',
            certifications: ['Java SE 8 Certified', 'AWS Solutions Architect'],
            email: 'priya.sharma@karanji.com',
            trainingStatus: 'in_progress',
            trainingProgress: 40,
            profileSentToClient: false
          },
          {
            id: 'emp5',
            name: 'Arjun Nair',
            department: 'Engineering',
            matchPercentage: 78,
            readinessStatus: 'ready_2weeks',
            currentSkills: [
              { skill: 'Java', level: 5 },
              { skill: 'AWS', level: 3 }
            ],
            trainingNeeded: ['Kubernetes Fundamentals', 'AWS Advanced Networking'],
            estimatedReadyDate: '2025-09-16',
            workload: '55%',
            availability: 'Training Required',
            certifications: ['Oracle Java SE 11 Certified'],
            email: 'arjun.nair@karanji.com',
            trainingStatus: 'not_started',
            trainingProgress: 0,
            profileSentToClient: false
          }
        ],
        ready4Weeks: [
          {
            id: 'emp6',
            name: 'Kavya Reddy',
            department: 'Engineering',
            matchPercentage: 65,
            readinessStatus: 'ready_4weeks',
            currentSkills: [
              { skill: 'Java', level: 3 },
              { skill: 'AWS', level: 2 }
            ],
            trainingNeeded: ['Java Advanced Programming', 'AWS Solutions Architect', 'Kubernetes from Scratch', 'Spring Boot Masterclass'],
            estimatedReadyDate: '2025-09-30',
            workload: '50%',
            availability: 'Extended Training Path',
            certifications: ['Java SE 8 Certified'],
            email: 'kavya.reddy@karanji.com',
            trainingStatus: 'not_started',
            trainingProgress: 0,
            profileSentToClient: false
          },
          {
            id: 'emp7',
            name: 'Rahul Kumar',
            department: 'Engineering',
            matchPercentage: 60,
            readinessStatus: 'ready_4weeks',
            currentSkills: [
              { skill: 'Java', level: 2 },
              { skill: 'AWS', level: 3 }
            ],
            trainingNeeded: ['Java Professional', 'Kubernetes Administration', 'Microservices with Spring Boot'],
            estimatedReadyDate: '2025-09-30',
            workload: '40%',
            availability: 'Extended Training Path',
            certifications: ['AWS Developer Associate'],
            email: 'rahul.kumar@karanji.com',
            trainingStatus: 'not_started',
            trainingProgress: 0,
            profileSentToClient: false
          }
        ],
        externalHireNeeded: 0,
        recommendedActions: [
          'Deploy Griffith Sheeba Menon, Shivani B T, and Athulya Roy immediately - they meet all requirements',
          'Fast-track Kubernetes training for Priya Sharma and Arjun Nair starting Wednesday',
          'Enroll Kavya Reddy and Rahul Kumar in comprehensive 4-week skill development program',
          'Set progress checkpoints for days 5, 10, and 14 for all trainees',
          'Schedule skill verification tests for day 15',
          'Project can start on schedule with 3 developers, scaling to 5 by week 3'
        ],
        confidenceScore: 94,
        analysisTime: '2.3 minutes',
        lastUpdated: '2025-09-02T09:05:23Z'
      }
    }
  ])

  const [currentAnalysis, setCurrentAnalysis] = React.useState<SkillRequest | null>(
    skillRequests.find(req => req.id === '1') || null
  )

  // Real-time metrics matching ARIS business value
  const [realTimeMetrics] = React.useState({
    totalEmployees: 342,
    activeRequests: 7,
    avgMatchTime: 2.3, // minutes
    successRate: 94,
    skillGapsClosed: 156, // this quarter
    certificationAlerts: 12, // expiring soon
    trainingInProgress: 28,
    readyNow: 285, // immediately deployable
    ready2Weeks: 42, // with quick training
    ready4Weeks: 15, // with extended training
    clientSatisfaction: 4.8,
    timeToDeployment: 3.2, // days average
    internalVsExternal: 85, // % filled internally
    skillTrends: {
      javaGrowth: 15, // % increase in demand
      awsGrowth: 22,
      kubernetesGrowth: 18,
      reactGrowth: 5,
      pythonGrowth: 8
    }
  })

  const [alerts] = React.useState([
    {
      type: 'urgent',
      title: 'Sarah Johnson - AWS Solutions Architect expires in 28 days',
      action: 'Schedule Renewal',
      date: '2025-10-01',
      daysUntilExpiry: 28,
      priority: 'high'
    },
    {
      type: 'warning',
      title: 'Mike Chen - Kubernetes Admin expires in 43 days',
      action: 'Renewal Reminder Sent',
      date: '2025-10-15',
      daysUntilExpiry: 43,
      priority: 'medium'
    },
    {
      type: 'urgent',
      title: 'Project Alpha: Need 3 React developers by Sept 30',
      action: 'Review Gap Analysis',
      date: '2025-09-30',
      daysUntilExpiry: 28,
      priority: 'high'
    },
    {
      type: 'info',
      title: 'Priya Sharma completed React Advanced certification',
      action: 'Profile Updated',
      date: '2025-09-01',
      daysUntilExpiry: null,
      priority: 'low'
    },
    {
      type: 'warning',
      title: '5 Java developers eligible for Level 4 advancement',
      action: 'Review for Promotion',
      date: '2025-09-05',
      daysUntilExpiry: null,
      priority: 'medium'
    }
  ])

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500 text-white'
      case 'high': return 'bg-orange-500 text-white'
      case 'medium': return 'bg-blue-500 text-white'
      case 'low': return 'bg-gray-500 text-white'
      default: return 'bg-gray-500 text-white'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'analyzing': return 'bg-blue-100 text-blue-800'
      case 'proposed': return 'bg-purple-100 text-purple-800'
      case 'approved': return 'bg-green-100 text-green-800'
      case 'fulfilled': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const submitRequest = async () => {
    if (!newRequest.clientName || !newRequest.projectName || !newRequest.clientEmail) {
      alert('Please fill in required fields: Client Name, Project Name, and Client Email')
      return
    }
    
    if (!newRequest.skills || newRequest.skills.length === 0) {
      alert('Please add at least one skill requirement')
      return
    }
    
    // Create a new skill request
    const newSkillRequest: SkillRequest = {
      id: `req_${Date.now()}`,
      requestId: `REQ-2025-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
      clientName: newRequest.clientName,
      clientEmail: newRequest.clientEmail,
      projectName: newRequest.projectName,
      projectDescription: newRequest.projectDescription || '',
      requestedBy: newRequest.requestedBy || 'HR Team',
      requestDate: new Date().toISOString().split('T')[0],
      requiredStartDate: newRequest.requiredStartDate || '',
      projectDurationWeeks: newRequest.projectDurationWeeks || 12,
      teamSizeRequired: newRequest.teamSizeRequired || 5,
      priority: newRequest.priority || 'medium',
      status: 'analyzing',
      skills: newRequest.skills,
    }
    
    // Add analysis results with Indian employees (this would normally be done by AI/backend)
    newSkillRequest.analysis = {
      readyNow: [
        {
          id: 'emp1',
          name: 'Griffith Sheeba Menon',
          department: 'Engineering',
          matchPercentage: 95,
          readinessStatus: 'ready_now',
          currentSkills: [
            { skill: 'Java', level: 5 },
            { skill: 'AWS', level: 4 },
            { skill: 'Kubernetes', level: 4 },
            { skill: 'Spring Boot', level: 4 }
          ],
          trainingNeeded: [],
          workload: '75%',
          availability: 'Available Now',
          certifications: ['Oracle Java SE 11 Certified', 'AWS Solutions Architect'],
          email: 'sheebam@karanji.com',
          trainingStatus: 'completed',
          trainingProgress: 100,
          profileSentToClient: false
        }
      ],
      ready2Weeks: [
        {
          id: 'emp4',
          name: 'Priya Sharma',
          department: 'Engineering',
          matchPercentage: 75,
          readinessStatus: 'ready_2weeks',
          currentSkills: [
            { skill: 'Java', level: 4 },
            { skill: 'AWS', level: 4 }
          ],
          trainingNeeded: ['Kubernetes CKA Certification', 'Spring Boot Advanced'],
          estimatedReadyDate: '2025-09-16',
          workload: '65%',
          availability: 'Training Required',
          certifications: ['Java SE 8 Certified', 'AWS Solutions Architect'],
          email: 'priya.sharma@karanji.com',
          trainingStatus: 'in_progress',
          trainingProgress: 40,
          profileSentToClient: false
        }
      ],
      ready4Weeks: [
        {
          id: 'emp6',
          name: 'Kavya Reddy',
          department: 'Engineering',
          matchPercentage: 65,
          readinessStatus: 'ready_4weeks',
          currentSkills: [
            { skill: 'Java', level: 3 },
            { skill: 'AWS', level: 2 }
          ],
          trainingNeeded: ['Java Advanced Programming', 'AWS Solutions Architect', 'Kubernetes from Scratch', 'Spring Boot Masterclass'],
          estimatedReadyDate: '2025-09-30',
          workload: '50%',
          availability: 'Extended Training Path',
          certifications: ['Java SE 8 Certified'],
          email: 'kavya.reddy@karanji.com',
          trainingStatus: 'not_started',
          trainingProgress: 0,
          profileSentToClient: false
        }
      ],
      externalHireNeeded: 0,
      recommendedActions: [
        'Deploy Griffith Sheeba Menon immediately - meets all requirements',
        'Fast-track Kubernetes training for Priya Sharma starting Wednesday',
        'Enroll Kavya Reddy in comprehensive 4-week skill development program',
        'Set progress checkpoints for days 5, 10, and 14 for all trainees'
      ],
      confidenceScore: 92,
      analysisTime: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      trainingScheduled: false,
      profilesSentToClient: false
    }
    
    // Add to skill requests list (in a real app, this would be saved to database)
    setSkillRequests([...skillRequests, newSkillRequest])
    setCurrentAnalysis(newSkillRequest)
    
    // Reset form
    setNewRequest({
      clientName: '',
      projectName: '',
      requestedBy: 'HR Team',
      requiredStartDate: '',
      projectDurationWeeks: 12,
      teamSizeRequired: 5,
      priority: 'medium',
      skills: [],
      clientEmail: '',
      projectDescription: ''
    })
    
    // Clear skills form state
    setSelectedSkill('')
    setSkillLevel('3')
    setSkillCount('1')
    setIsMandatory(true)
    
    // Switch to analysis tab
    setActiveTab('analysis')
    
    // Show success message
    setTimeout(() => {
      const analysis = newSkillRequest.analysis
      if (analysis) {
        alert(`Request analyzed successfully! 
        
📊 Analysis Results:
✓ ${analysis.readyNow.length} employees ready now
⏱️ ${analysis.ready2Weeks.length} employees ready in 2 weeks  
📚 ${analysis.ready4Weeks.length} employees ready in 4 weeks
🎯 Confidence Score: ${analysis.confidenceScore}%

Check the Analysis tab for detailed results.`)
      }
    }, 1000)
  }

  // Helper: Generate Job Description text
  const generateJobDescription = (request: SkillRequest) => {
    return `
Job Title: ${request.projectName} Developer
Client: ${request.clientName}
Project Description: ${request.projectDescription}
Required Skills:
${request.skills.map(s => `- ${s.skill} (Level ${s.level})${s.mandatory ? ' [Mandatory]' : ''} - ${s.count} required`).join('\n')}
Team Size: ${request.teamSizeRequired}
Project Duration: ${request.projectDurationWeeks} weeks
Start Date: ${request.requiredStartDate}
Priority: ${request.priority}
Location: India (preferred)
Responsibilities:
- Work on ${request.projectName} for ${request.clientName}
- Collaborate with team members and stakeholders
- Ensure timely delivery and quality standards
Qualifications:
- Relevant certifications preferred
- Experience in listed skills
`;
  };

  // Helper: Export JD as Word document
  // --- JD Export Logic (single definition for analysis export) ---

  async function exportJDToWord(analysis: any) {
    const jdText = generateJobDescription(analysis);
    const docx = await import('docx');
    const { Document, Packer, Paragraph, TextRun } = docx;
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            new Paragraph({
              children: [new TextRun(jdText)],
            }),
          ],
        },
      ],
    });
    const blob = await Packer.toBlob(doc);
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${analysis.projectName || 'Job_Description'}.docx`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Brain className="h-8 w-8 text-blue-600" />
            ARIS
            <span className="text-lg font-normal text-muted-foreground">
              AI Resource Intelligence System
            </span>
          </h1>
          <p className="text-muted-foreground mt-1">
            Enterprise-Grade Workforce Intelligence Platform
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            <Zap className="h-3 w-3 mr-1" />
            Live System
          </Badge>
          <Badge variant="outline" className="bg-blue-50 text-blue-700">
            Production Ready
          </Badge>
        </div>
      </div>

      {/* Navigation Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="w-full">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="requests" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Requests
          </TabsTrigger>
          <TabsTrigger value="analysis" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Analysis
          </TabsTrigger>
          <TabsTrigger value="workforce" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Workforce
          </TabsTrigger>
          <TabsTrigger value="training" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Training
          </TabsTrigger>
          <TabsTrigger value="import" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Import
          </TabsTrigger>
          <TabsTrigger value="clients" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Clients
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Executive Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-l-4 border-l-blue-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Active Requests</p>
                    <p className="text-2xl font-bold">{realTimeMetrics.activeRequests}</p>
                    <p className="text-xs text-green-600">+2 this week</p>
                  </div>
                  <Clock className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-green-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Available Resources</p>
                    <p className="text-2xl font-bold">{realTimeMetrics.totalEmployees}</p>
                    <p className="text-xs text-blue-600">{realTimeMetrics.internalVsExternal}% internal fill</p>
                  </div>
                  <Users className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-purple-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Match Time</p>
                    <p className="text-2xl font-bold">{realTimeMetrics.avgMatchTime}m</p>
                    <p className="text-xs text-green-600">40% faster</p>
                  </div>
                  <Zap className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-orange-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Success Rate</p>
                    <p className="text-2xl font-bold">{realTimeMetrics.successRate}%</p>
                    <p className="text-xs text-green-600">+3% this month</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Secondary Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Client Satisfaction</p>
                    <p className="text-xl font-bold">{realTimeMetrics.clientSatisfaction}/5.0</p>
                  </div>
                  <Award className="h-6 w-6 text-yellow-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Skill Gaps Closed</p>
                    <p className="text-xl font-bold">{realTimeMetrics.skillGapsClosed}</p>
                  </div>
                  <BookOpen className="h-6 w-6 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Training In Progress</p>
                    <p className="text-xl font-bold">{realTimeMetrics.trainingInProgress}</p>
                  </div>
                  <UserCheck className="h-6 w-6 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Avg Deploy Time</p>
                    <p className="text-xl font-bold">{realTimeMetrics.timeToDeployment}d</p>
                  </div>
                  <Briefcase className="h-6 w-6 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ARIS Monday 9:05 AM Scenario Showcase */}
          <Card className="border-2 border-blue-200 bg-blue-50/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-700">
                <Clock className="h-5 w-5" />
                Live Example: Monday 9:05 AM Analysis
              </CardTitle>
              <p className="text-sm text-blue-600">
                Real-time demonstration of ARIS workflow from client request to deployment plan
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">1</div>
                    <div>
                      <p className="font-medium">9:00 AM - Client Request Received</p>
                      <p className="text-sm text-muted-foreground">Java + AWS + Kubernetes team needed</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-green-600 text-white text-xs flex items-center justify-center font-bold">2</div>
                    <div>
                      <p className="font-medium">9:02 AM - Request Entered in System</p>
                      <p className="text-sm text-muted-foreground">5 developers, 6 months, start in 3 weeks</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-purple-600 text-white text-xs flex items-center justify-center font-bold">3</div>
                    <div>
                      <p className="font-medium">9:05 AM - AI Analysis Complete</p>
                      <p className="text-sm text-muted-foreground">Full deployment strategy ready</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <p className="font-medium text-green-800">✅ Ready Now: 3 developers</p>
                    <p className="text-sm text-green-600">Can start immediately</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <p className="font-medium text-blue-800">🎯 Ready in 2 weeks: 2 developers</p>
                    <p className="text-sm text-blue-600">After Kubernetes training</p>
                  </div>
                  <div className="p-3 bg-orange-100 rounded-lg">
                    <p className="font-medium text-orange-800">📚 No external hiring needed</p>
                    <p className="text-sm text-orange-600">Team scales naturally</p>
                  </div>
                </div>
              </div>
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  <strong>Result:</strong> Project starts on schedule with 3 developers, scaling to full team of 5 by week 3. 
                  Training automatically scheduled, progress tracked, and team ready for deployment.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Requests */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Recent Skill Requests
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {skillRequests.slice(0, 3).map((request) => (
                    <div key={request.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">{request.projectName}</h4>
                        <Badge className={getPriorityColor(request.priority)}>
                          {request.priority.toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {request.clientName} • {request.teamSizeRequired} developers
                      </p>
                      <div className="flex flex-wrap gap-1 mb-3">
                        {request.skills.slice(0, 3).map((skill, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {skill.skill} L{skill.level}
                          </Badge>
                        ))}
                      </div>
                      <Button 
                        size="sm" 
                        className="w-full"
                        onClick={() => {
                          setCurrentAnalysis(request)
                          setActiveTab('analysis')
                        }}
                      >
                        View Analysis
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Alerts & Notifications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                  Priority Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {alerts.map((alert, idx) => (
                    <Alert key={idx} className={
                      alert.type === 'urgent' ? 'border-red-200 bg-red-50' :
                      alert.type === 'warning' ? 'border-orange-200 bg-orange-50' :
                      'border-blue-200 bg-blue-50'
                    }>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{alert.title}</p>
                            <p className="text-xs text-muted-foreground">{alert.date}</p>
                          </div>
                          <Button size="sm" variant="outline">
                            {alert.action}
                          </Button>
                        </div>
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Skills Market Intelligence & Predictive Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Predictive Skills Intelligence (Next 6-12 Months)
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                AI-powered analysis showing skill demand trends and gap predictions
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {[
                  { skill: 'Java', demand: 95, trend: 'up', growth: `+${realTimeMetrics.skillTrends.javaGrowth}%`, color: 'text-green-600' },
                  { skill: 'AWS', demand: 88, trend: 'up', growth: `+${realTimeMetrics.skillTrends.awsGrowth}%`, color: 'text-green-600' },
                  { skill: 'Kubernetes', demand: 82, trend: 'up', growth: `+${realTimeMetrics.skillTrends.kubernetesGrowth}%`, color: 'text-green-600' },
                  { skill: 'React', demand: 75, trend: 'stable', growth: `+${realTimeMetrics.skillTrends.reactGrowth}%`, color: 'text-blue-600' },
                  { skill: 'Python', demand: 70, trend: 'stable', growth: `+${realTimeMetrics.skillTrends.pythonGrowth}%`, color: 'text-blue-600' }
                ].map((item) => (
                  <div key={item.skill} className="text-center p-3 border rounded-lg">
                    <div className="font-medium mb-2">{item.skill}</div>
                    <Progress value={item.demand} className="mb-2" />
                    <div className="text-sm text-muted-foreground">{item.demand}% demand</div>
                    <div className={`text-xs font-semibold ${item.color}`}>{item.growth} YoY</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {item.trend === 'up' ? '🔥 High Growth' : '📈 Steady'}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>AI Recommendation:</strong> Java + AWS + Kubernetes requests increased 40% this quarter. 
                  Recommend training 8 more developers in this combination to prepare for future demands.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Requests Tab */}
        <TabsContent value="requests" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Process Client Request (HR Only)
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Enter details from client email requests to analyze resource requirements
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Client Name *</label>
                  <Input 
                    placeholder="Enter client company name"
                    value={newRequest.clientName}
                    onChange={(e) => setNewRequest({...newRequest, clientName: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Client Email *</label>
                  <Input 
                    placeholder="e.g., contact@techcorp.com"
                    type="email"
                    value={newRequest.clientEmail}
                    onChange={(e) => setNewRequest({...newRequest, clientEmail: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Project Name *</label>
                  <Input 
                    placeholder="Enter project name"
                    value={newRequest.projectName}
                    onChange={(e) => setNewRequest({...newRequest, projectName: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Required Start Date</label>
                  <Input 
                    type="date"
                    value={newRequest.requiredStartDate}
                    onChange={(e) => setNewRequest({...newRequest, requiredStartDate: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Team Size Required</label>
                  <Input 
                    type="number"
                    min="1"
                    value={newRequest.teamSizeRequired}
                    onChange={(e) => setNewRequest({...newRequest, teamSizeRequired: parseInt(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Project Duration (weeks)</label>
                  <Input 
                    type="number"
                    min="1"
                    value={newRequest.projectDurationWeeks}
                    onChange={(e) => setNewRequest({...newRequest, projectDurationWeeks: parseInt(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Priority Level</label>
                  <Select 
                    value={newRequest.priority}
                    onValueChange={(value) => setNewRequest({...newRequest, priority: value as any})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="urgent">Urgent (&lt; 1 week)</SelectItem>
                      <SelectItem value="high">High (1-2 weeks)</SelectItem>
                      <SelectItem value="medium">Medium (2-4 weeks)</SelectItem>
                      <SelectItem value="low">Low (&gt; 1 month)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">Project Description</label>
                <Textarea 
                  placeholder="Detailed project description from client..."
                  className="mt-1"
                  value={newRequest.projectDescription}
                  onChange={(e) => setNewRequest({...newRequest, projectDescription: e.target.value})}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Required Skills & Levels</label>
                
                {/* Display added skills */}
                {newRequest.skills && newRequest.skills.length > 0 && (
                  <div className="mt-2 space-y-2">
                    {newRequest.skills.map((skill, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                        <span className="text-sm">
                          <strong>{skill.skill}</strong> (Level {skill.level}) - {skill.count} developers 
                          <Badge variant={skill.mandatory ? "default" : "secondary"} className="ml-2">
                            {skill.mandatory ? "Mandatory" : "Optional"}
                          </Badge>
                        </span>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => removeSkill(skill.skill)}
                          className="h-6 w-6 p-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Add new skill */}
                <div className="mt-3 grid grid-cols-5 gap-2">
                  <div className="col-span-2">
                    <Select value={selectedSkill} onValueChange={setSelectedSkill}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select skill" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableSkills.map((skill) => (
                          <SelectItem key={skill} value={skill}>{skill}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Select value={skillLevel} onValueChange={setSkillLevel}>
                      <SelectTrigger>
                        <SelectValue placeholder="Level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Level 1</SelectItem>
                        <SelectItem value="2">Level 2</SelectItem>
                        <SelectItem value="3">Level 3</SelectItem>
                        <SelectItem value="4">Level 4</SelectItem>
                        <SelectItem value="5">Level 5</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Input 
                      type="number" 
                      placeholder="Count" 
                      value={skillCount}
                      onChange={(e) => setSkillCount(e.target.value)}
                      min="1"
                      max="20"
                    />
                  </div>
                  <div>
                    <Select value={isMandatory ? "mandatory" : "optional"} onValueChange={(value) => setIsMandatory(value === "mandatory")}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mandatory">Mandatory</SelectItem>
                        <SelectItem value="optional">Optional</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <Button 
                  variant="outline" 
                  onClick={addSkill} 
                  className="mt-2 w-full"
                  disabled={!selectedSkill}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Skill Requirement
                </Button>
              </div>

              <Alert>
                <Brain className="h-4 w-4" />
                <AlertDescription>
                  ARIS will analyze your request using AI workforce intelligence and identify suitable employees, 
                  training requirements, and provide recommendations for client response.
                </AlertDescription>
              </Alert>

              <div className="flex gap-2">
                <Button className="flex items-center gap-2" onClick={submitRequest}>
                  <Search className="h-4 w-4" />
                  Analyze Resources
                </Button>
                <Button variant="outline">
                  Save Draft
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analysis Tab */}
        <TabsContent value="analysis" className="space-y-6">
          {currentAnalysis && (
            <>
              {/* JD Export Button and AI workflow info for HR if external hire needed */}
              {(currentAnalysis.analysis?.externalHireNeeded ?? 0) > 0 && (
                <>
                  <div className="mb-4 flex justify-end">
                    <Button
                      variant="outline"
                      onClick={() => exportJDToWord(currentAnalysis)}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Export Job Description (Word)
                    </Button>
                  </div>
                  <Alert className="mb-4 bg-blue-50 border-blue-200">
                    <Brain className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-800">
                      <strong>Automated External Hiring Workflow:</strong><br />
                      If no internal employees meet the required skills for a project, the system will use AI to automatically generate a tailored Job Description (JD) based on the project requirements and export it as a downloadable Word document for HR to use in external recruitment.
                    </AlertDescription>
                  </Alert>
                </>
              )}
              {/* Analysis Header */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Brain className="h-5 w-5 text-blue-600" />
                        ARIS Analysis: {currentAnalysis.projectName}
                      </CardTitle>
                      <p className="text-muted-foreground">
                        Request ID: {currentAnalysis.requestId} • 
                        Confidence: {currentAnalysis.analysis?.confidenceScore}%
                      </p>
                    </div>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      ✅ Analysis Complete in {currentAnalysis.analysis?.analysisTime || '2.3 minutes'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {currentAnalysis.analysis?.readyNow.length || 0}
                      </div>
                      <div className="text-sm text-muted-foreground">Ready Now</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {currentAnalysis.analysis?.ready2Weeks.length || 0}
                      </div>
                      <div className="text-sm text-muted-foreground">Ready in 2 weeks</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-600">
                        {currentAnalysis.analysis?.ready4Weeks.length || 0}
                      </div>
                      <div className="text-sm text-muted-foreground">Ready in 4 weeks</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">
                        {currentAnalysis.analysis?.externalHireNeeded || 0}
                      </div>
                      <div className="text-sm text-muted-foreground">External hire needed</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Resource Matches */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Ready Now */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-green-600 flex items-center gap-2">
                      <CheckCircle className="h-5 w-5" />
                      Ready Now
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {currentAnalysis.analysis?.readyNow.map((resource) => (
                      <div key={resource.id} className="border rounded p-3">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{resource.name}</h4>
                          <Badge variant="secondary">{resource.matchPercentage}%</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{resource.department}</p>
                        <div className="text-xs mb-2">
                          <span className="text-muted-foreground">Workload: </span>
                          <span className="font-medium">{resource.workload}</span>
                          <span className="text-muted-foreground ml-2">Status: </span>
                          <span className="font-medium text-green-600">{resource.availability}</span>
                        </div>
                        <div className="space-y-1 mb-2">
                          <p className="text-xs font-medium text-muted-foreground">Skills:</p>
                          {resource.currentSkills.map((skill, idx) => (
                            <div key={idx} className="flex justify-between text-xs">
                              <span>{skill.skill}</span>
                              <span className="font-medium">L{skill.level}</span>
                            </div>
                          ))}
                        </div>
                        {resource.certifications && resource.certifications.length > 0 && (
                          <div className="mb-2">
                            <p className="text-xs font-medium text-muted-foreground mb-1">Certifications:</p>
                            <div className="flex flex-wrap gap-1">
                              {resource.certifications.map((cert, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                                  {cert}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        <Button 
                          size="sm" 
                          className="w-full mt-2"
                          onClick={() => sendProfileToClient(resource, currentAnalysis)}
                          disabled={resource.profileSentToClient}
                        >
                          <Send className="h-3 w-3 mr-1" />
                          {resource.profileSentToClient ? 'Profile Sent ✓' : 'Send Profile to Client'}
                        </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full mt-2"
                            onClick={async () => {
                              if (!resource.email) {
                                alert('Employee email not available');
                                return;
                              }
                              const subject = `You have been shortlisted!`;
                              const message = `Dear ${resource.name},\n\nCongratulations! You have been shortlisted for the project based on your skill set. Please check your dashboard for more details.`;
                              const success = await sendEmail(resource.email, subject, message, 'shortlist', { employeeId: resource.id });
                              if (success) {
                                alert('Email sent successfully!');
                              } else {
                                alert('Failed to send email.');
                              }
                            }}
                          >
                            📧 Send Email
                          </Button>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Ready in 2 Weeks */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-blue-600 flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Ready in 2 Weeks
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {currentAnalysis.analysis?.ready2Weeks.map((resource) => (
                      <div key={resource.id} className="border rounded p-3">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{resource.name}</h4>
                          <Badge variant="secondary">{resource.matchPercentage}%</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{resource.department}</p>
                        <div className="text-xs text-muted-foreground mb-2">
                          Email: {resource.email || 'Email not available'}
                        </div>
                        <div className="mb-2">
                          <p className="text-sm font-medium">Training Required:</p>
                          {resource.trainingNeeded.map((training, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs mr-1">
                              {training}
                            </Badge>
                          ))}
                        </div>
                        {resource.trainingProgress && resource.trainingProgress > 0 ? (
                          <div className="mb-2">
                            <p className="text-sm font-medium">Training Progress:</p>
                            <Progress value={resource.trainingProgress} className="mt-1" />
                            <p className="text-xs text-muted-foreground">{resource.trainingProgress}% complete</p>
                          </div>
                        ) : null}
                        <div className="flex gap-1">
                          <Button 
                            size="sm" 
                            className="flex-1"
                            onClick={() => scheduleTraining(resource, currentAnalysis)}
                            disabled={resource.trainingStatus === 'completed'}
                          >
                            <Calendar className="h-3 w-3 mr-1" />
                            {resource.trainingStatus === 'completed' ? 'Training Complete ✓' : 'Schedule Training'}
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="flex-1"
                            onClick={async () => {
                              if (!resource.email) {
                                alert('Employee email not available')
                                return
                              }
                              const subject = 'Training Request – Skill Alignment'
                              const message = 'Please review your training assignment.'
                              const success = await sendEmail(
                                resource.email,
                                subject,
                                message,
                                'skill_alignment',
                                {
                                  employeeName: resource.name,
                                  skills: (resource.trainingNeeded && resource.trainingNeeded.length > 0) ? resource.trainingNeeded : ['Python', 'Java'],
                                  trainingLink: getBestTrainingResourceForSkill(resource.trainingNeeded?.[0] || 'Java').url,
                                  hrTeamName: 'HR Team'
                                }
                              )
                              if (success) {
                                alert('Skill alignment email sent!')
                              } else {
                                alert('Failed to send email.')
                              }
                            }}
                          >
                            Send Skill Alignment Email
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              if (resource.email && currentAnalysis) {
                                sendEmail(
                                  resource.email,
                                  `Update: ${currentAnalysis.projectName}`,
                                  'Please check your training assignments and project updates.',
                                  'general'
                                )
                                alert('Employee notified successfully!')
                              } else {
                                alert('Employee email not available')
                              }
                            }}
                          >
                            Notify Employee
                          </Button>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Ready in 4 Weeks */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-orange-600 flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      Ready in 4 Weeks
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {currentAnalysis.analysis?.ready4Weeks.map((resource) => (
                      <div key={resource.id} className="border rounded p-3">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{resource.name}</h4>
                          <Badge variant="secondary">{resource.matchPercentage}%</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{resource.department}</p>
                        <div className="mb-2">
                          <p className="text-sm font-medium">Extended Training Required:</p>
                          {resource.trainingNeeded.map((training, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs mr-1">
                              {training}
                            </Badge>
                          ))}
                        </div>
                        <div className="text-xs text-muted-foreground mb-2">
                          Email: {resource.email || 'Email not available'}
                        </div>
                        <Button 
                          size="sm" 
                          className="w-full" 
                          variant="outline"
                          onClick={() => scheduleTraining(resource, currentAnalysis)}
                          disabled={resource.trainingStatus === 'completed'}
                        >
                          <Calendar className="h-3 w-3 mr-1" />
                          {resource.trainingStatus === 'completed' ? 'Training Complete ✓' : 'Schedule Training Program'}
                        </Button>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* Automated System Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-purple-600" />
                    Automated System Actions
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Actions ARIS will execute automatically based on the analysis
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      {
                        action: 'Enroll Priya Sharma and Arjun Nair in Kubernetes CKA training starting Wednesday',
                        status: 'scheduled',
                        icon: '📚',
                        detail: 'Calendar invites sent, course access granted'
                      },
                      {
                        action: 'Set progress checkpoints for training participants on days 5, 10, and 14',
                        status: 'automated',
                        icon: '📊',
                        detail: 'Automatic progress tracking enabled'
                      },
                      {
                        action: 'Schedule skill verification tests for day 15 of training',
                        status: 'scheduled',
                        icon: '✅',
                        detail: 'Assessment links will be auto-generated'
                      },
                      {
                        action: 'Deploy Griffith Sheeba Menon, Shivani B T, and Athulya Roy to project immediately',
                        status: 'ready',
                        icon: '🚀',
                        detail: 'Resources allocated, team notifications sent'
                      },
                      {
                        action: 'Generate weekly progress reports for delivery team',
                        status: 'automated',
                        icon: '📈',
                        detail: 'Every Friday at 5 PM'
                      }
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                        <div className="text-2xl">{item.icon}</div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{item.action}</p>
                          <p className="text-xs text-muted-foreground">{item.detail}</p>
                        </div>
                        <Badge variant="outline" className={
                          item.status === 'scheduled' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                          item.status === 'automated' ? 'bg-green-50 text-green-700 border-green-200' :
                          'bg-purple-50 text-purple-700 border-purple-200'
                        }>
                          {item.status === 'scheduled' ? 'Scheduled' :
                           item.status === 'automated' ? 'Automated' : 'Ready'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-purple-600" />
                    AI Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {currentAnalysis.analysis?.recommendedActions.map((action, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-3 bg-muted/50 rounded">
                        <div className="w-6 h-6 rounded-full bg-purple-600 text-white text-xs flex items-center justify-center font-bold">
                          {idx + 1}
                        </div>
                        <p className="text-sm flex-1">{action}</p>
                        <Button size="sm" variant="outline">
                          Execute
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* Workforce Tab */}
        <TabsContent value="workforce" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Workforce Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left">
                    <tr className="border-b">
                      <th className="py-2">Name</th>
                      <th className="py-2">Role</th>
                      <th className="py-2">Skills</th>
                      <th className="py-2">Utilization</th>
                      <th className="py-2">Availability</th>
                      <th className="py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employees.slice(0, 10).map((employee: any) => (
                      <tr key={employee.id} className="border-b">
                        <td className="py-2 font-medium">{employee.name}</td>
                        <td className="py-2 text-muted-foreground">{employee.role}</td>
                        <td className="py-2">
                          <div className="flex flex-wrap gap-1">
                            {employee.skills?.slice(0, 3).map((skill: any, idx: number) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {skill.name} L{skill.level}
                              </Badge>
                            )) || <span className="text-muted-foreground">No skills</span>}
                          </div>
                        </td>
                        <td className="py-2">
                          <Progress value={Math.floor(Math.random() * 100)} className="w-16" />
                        </td>
                        <td className="py-2">
                          <Badge variant="outline" className="text-xs">
                            Available
                          </Badge>
                        </td>
                        <td className="py-2">
                          <Button size="sm" variant="outline">
                            View Profile
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Training Tab */}
        <TabsContent value="training" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Active Training</p>
                    <p className="text-2xl font-bold">15</p>
                  </div>
                  <BookOpen className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Completed</p>
                    <p className="text-2xl font-bold">8</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Scheduled</p>
                    <p className="text-2xl font-bold">6</p>
                  </div>
                  <Calendar className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Success Rate</p>
                    <p className="text-2xl font-bold">94%</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Employee Training Dashboard
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    name: 'Priya Sharma',
                    training: 'Kubernetes L3 Certification',
                    progress: 65,
                    status: 'In Progress',
                    startDate: '2025-08-28',
                    expectedCompletion: '2025-09-15',
                    provider: 'Udemy',
                    link: 'https://udemy.com/kubernetes-certification',
                    projectRequest: 'TechCorp Cloud Migration'
                  },
                  {
                    name: 'Tom Wilson',
                    training: 'Java Advanced Programming',
                    progress: 0,
                    status: 'Scheduled',
                    startDate: '2025-09-05',
                    expectedCompletion: '2025-09-30',
                    provider: 'Oracle Learning',
                    link: 'https://oracle.com/java-training',
                    projectRequest: 'TechCorp Cloud Migration'
                  },
                  {
                    name: 'Sarah Park',
                    training: 'React Advanced Components',
                    progress: 100,
                    status: 'Completed',
                    startDate: '2025-08-15',
                    expectedCompletion: '2025-08-30',
                    provider: 'Udemy',
                    link: 'https://udemy.com/react-advanced',
                    projectRequest: 'DataCorp Analytics Dashboard'
                  }
                ].map((training, idx) => (
                  <div key={idx} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-semibold">{training.name}</h4>
                        <p className="text-sm text-muted-foreground">{training.training}</p>
                      </div>
                      <Badge 
                        variant="outline" 
                        className={
                          training.status === 'Completed' ? 'bg-green-100 text-green-800' :
                          training.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                          'bg-orange-100 text-orange-800'
                        }
                      >
                        {training.status}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                      <div>
                        <p className="text-sm text-muted-foreground">For Project</p>
                        <p className="font-medium text-sm">{training.projectRequest}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Expected Completion</p>
                        <p className="font-medium text-sm">{training.expectedCompletion}</p>
                      </div>
                    </div>
                    <div className="mb-3">
                      <div className="flex justify-between items-center mb-1">
                        <p className="text-sm text-muted-foreground">Progress</p>
                        <p className="text-sm font-medium">{training.progress}%</p>
                      </div>
                      <Progress value={training.progress} className="mb-2" />
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Activity className="h-3 w-3 mr-1" />
                        Track Progress
                      </Button>
                      <Button size="sm" variant="outline">
                        <Send className="h-3 w-3 mr-1" />
                        Send Reminder
                      </Button>
                      {training.status === 'Completed' && (
                        <Button size="sm" variant="outline">
                          <FileText className="h-3 w-3 mr-1" />
                          View Certificate
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Training Resources & Links</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { name: 'Udemy Business', type: 'Online Courses', link: 'https://udemy.com', skills: 'Java, React, AWS' },
                  { name: 'AWS Training', type: 'Cloud Certification', link: 'https://aws.training', skills: 'AWS, Cloud Architecture' },
                  { name: 'Oracle Learning', type: 'Java Certification', link: 'https://oracle.com/learning', skills: 'Java, Database' },
                  { name: 'Kubernetes Academy', type: 'Container Orchestration', link: 'https://kubernetes.io/training', skills: 'Kubernetes, Docker' },
                  { name: 'Microsoft Learn', type: 'Azure Certification', link: 'https://learn.microsoft.com', skills: 'Azure, .NET' },
                  { name: 'Coursera for Business', type: 'University Courses', link: 'https://coursera.org/business', skills: 'AI, Data Science' }
                ].map((resource, idx) => (
                  <div key={idx} className="border rounded p-3">
                    <h4 className="font-medium mb-2">{resource.name}</h4>
                    <p className="text-sm text-muted-foreground mb-2">{resource.type}</p>
                    <p className="text-xs text-blue-600 mb-3">{resource.skills}</p>
                    <Button size="sm" variant="outline" className="w-full">
                      <Globe className="h-3 w-3 mr-1" />
                      Visit Platform
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Import Tab */}
        <TabsContent value="import" className="space-y-6">
          <ExcelImport />
        </TabsContent>

        {/* Clients Tab */}
        <TabsContent value="clients" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Active Client Requests</p>
                    <p className="text-2xl font-bold">{realTimeMetrics.activeRequests}</p>
                  </div>
                  <FileText className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Profiles Sent</p>
                    <p className="text-2xl font-bold">12</p>
                  </div>
                  <Send className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Interviews Scheduled</p>
                    <p className="text-2xl font-bold">8</p>
                  </div>
                  <Calendar className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Client Communication Dashboard</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* ...existing code for client communication... */}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
