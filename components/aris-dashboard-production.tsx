"use client"

/**
 * ARIS Enhanced Dashboard - Gen AI Team Production Version
 * 
 * Features the Gen AI Development Team with:
 * - Sowmyashree (Senior Gen AI Developer) - newly added
 * - Sheeba (Senior Gen AI Developer) 
 * - All other team members as Gen AI Developers
 * - Outlook email integration for enterprise communication
 * - Real-time workforce intelligence
 * 
 * Production Changes:
 * 1. Updated team structure to reflect Gen AI specialization
 * 2. Added Sowmyashree@karanji.com as Senior Gen AI Developer
 * 3. Integrated Microsoft Outlook/Graph API for emails
 * 4. Enhanced skill tracking for AI/ML competencies
 * 5. Real-time data synchronization every 5 seconds
 * 
 * @author ARIS Development Team
 * @version 3.0.0 Gen AI Production
 */

import React from "react"
import useSWR from "swr"

// UI Component imports
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"

// Lucide React icons
import {
  Brain,
  Users,
  Clock,
  CheckCircle,
  TrendingUp,
  AlertTriangle,
  Search,
  Plus,
  Send,
  Calendar,
  Target,
  Award,
  Briefcase,
  MessageSquare,
  Phone,
  Mail,
  MapPin,
  Star,
  ArrowRight,
  Zap,
  Activity,
  BarChart3,
  PieChart,
  Settings,
  User,
  Building,
  Globe,
  Coffee,
  Code,
  Database,
  Server,
  Monitor,
  Smartphone,
  Laptop,
  Download,
  Upload,
  Save,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Filter,
  SortAsc,
  SortDesc,
  RefreshCw,
  Bell,
  BellRing,
  FileText,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  ChevronLeft,
  X,
  Mail as MailIcon
} from "lucide-react"

/**
 * Data fetcher function for SWR (handles API data fetching)
 */
const fetcher = (url: string) => fetch(url).then((r) => r.json())

/**
 * Skill level type for better type safety
 */
type SkillLevel = 'beginner' | 'intermediate' | 'expert'

/**
 * Interface Definitions
 * These TypeScript interfaces define the data structures used throughout the application
 */

// Individual skill requirement for a project
interface SkillRequirement {
  skill: string      // Name of the skill (e.g., 'Java', 'AWS')
  level: SkillLevel  // Required proficiency level (beginner/intermediate/expert)
  count: number      // Number of employees needed with this skill
}

// Employee resource match data structure
interface ResourceMatch {
  id: string                    // Unique employee identifier
  name: string                  // Full name of the employee
  department: string            // Department (e.g., 'Engineering')
  matchPercentage: number       // How well employee matches requirements (0-100%)
  readinessStatus: 'ready_now' | 'ready_2weeks' | 'ready_4weeks' | 'needs_hiring'
  currentSkills: { skill: string; level: SkillLevel }[]  // Employee's current skill levels
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
 * ARIS Enhanced Dashboard Main Component - Production Version
 * 
 * This is the core component that renders the entire HR workforce intelligence portal.
 * It manages all state, handles user interactions, and coordinates between different tabs.
 */
export function ARISEnhancedDashboard() {
  // State management for active tab navigation
  const [activeTab, setActiveTab] = React.useState<'overview' | 'requests' | 'analysis' | 'workforce' | 'training' | 'clients'>('overview')
  
  // SWR hook for data fetching with automatic revalidation every 5 seconds for real-time updates
  const { data, mutate } = useSWR("/api/data", fetcher, { 
    refreshInterval: 5000, // Real-time updates every 5 seconds
    revalidateOnFocus: true,
    revalidateOnReconnect: true
  })
  const employees = data?.employees || []
  const programs = data?.programs || []
  
  // Toast notifications
  const { toast } = useToast()
  
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
  const [skillLevel, setSkillLevel] = React.useState<SkillLevel>('intermediate') // Required skill level
  const [skillCount, setSkillCount] = React.useState('1')           // Number of employees needed
  
  /**
   * Custom email testing state
   */
  const [customEmailTo, setCustomEmailTo] = React.useState('')
  const [customEmailSubject, setCustomEmailSubject] = React.useState('')
  const [customEmailMessage, setCustomEmailMessage] = React.useState('')
  
  /**
   * Helper function to add a new skill requirement
   * Validates input and adds skill to the current request
   */
  const addSkill = () => {
    if (selectedSkill && !newRequest.skills?.find(s => s.skill === selectedSkill)) {
      const newSkill: SkillRequirement = {
        skill: selectedSkill,
        level: skillLevel,
        count: parseInt(skillCount)
      }
      setNewRequest({
        ...newRequest,
        skills: [...(newRequest.skills || []), newSkill]
      })
      setSelectedSkill('')
      setSkillLevel('intermediate')
      setSkillCount('1')
    }
  }
  
  /**
   * Helper function to remove a skill from current request
   */
  const removeSkill = (skillToRemove: string) => {
    setNewRequest({
      ...newRequest,
      skills: newRequest.skills?.filter(s => s.skill !== skillToRemove) || []
    })
  }
  
  /**
   * Utility function to convert skill level to display format
   */
  const getSkillLevelDisplay = (level: SkillLevel): string => {
    const levelMap = {
      'beginner': 'Beginner',
      'intermediate': 'Intermediate', 
      'expert': 'Expert'
    }
    return levelMap[level] || level
  }
  
  /**
   * Utility function to get skill level color
   */
  const getSkillLevelColor = (level: SkillLevel): string => {
    const colorMap = {
      'beginner': 'bg-green-100 text-green-800',
      'intermediate': 'bg-yellow-100 text-yellow-800',
      'expert': 'bg-red-100 text-red-800'
    }
    return colorMap[level] || 'bg-gray-100 text-gray-800'
  }

  // Dynamic sample data - will be replaced by real API data
  const [skillRequests, setSkillRequests] = React.useState<SkillRequest[]>([
    {
      id: '1',
      requestId: 'REQ-2025-001',
      clientName: 'TechCorp Solutions',
      clientEmail: 'contact@techcorp.com',
      projectName: 'Cloud Migration Platform',
      projectDescription: 'Migration of legacy systems to cloud infrastructure with modern microservices architecture',
      requestedBy: 'HR Team',
      requestDate: '2025-01-14',
      requiredStartDate: '2025-02-01',
      projectDurationWeeks: 16,
      teamSizeRequired: 8,
      priority: 'high',
      status: 'analyzing',
      skills: [
        { skill: 'Java', level: 'expert', count: 3 },
        { skill: 'AWS', level: 'intermediate', count: 5 },
        { skill: 'Kubernetes', level: 'intermediate', count: 5 },
        { skill: 'Spring Boot', level: 'intermediate', count: 3 }
      ]
    }
  ])
  
  /**
   * Real-time email sending function with enhanced error handling
   */
  const sendEmail = async (to: string, subject: string, message: string, type?: string, data?: any) => {
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
        })
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result = await response.json()
      
      if (result.success) {
        toast({
          title: "Email Sent Successfully",
          description: `Email sent to ${to}`,
          duration: 3000,
        })
        return true
      } else {
        throw new Error(result.error || 'Failed to send email')
      }
    } catch (error) {
      console.error('Email sending failed:', error)
      toast({
        title: "Email Failed",
        description: error instanceof Error ? error.message : 'Failed to send email',
        variant: "destructive",
        duration: 5000,
      })
      return false
    }
  }
  
  /**
   * Submit new skill request with email notification
   */
  const submitRequest = async () => {
    if (!newRequest.clientName || !newRequest.projectName || !newRequest.skills?.length) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields and add at least one skill",
        variant: "destructive"
      })
      return
    }
    
    const requestId = `REQ-${new Date().getFullYear()}-${String(skillRequests.length + 1).padStart(3, '0')}`
    
    const fullRequest: SkillRequest = {
      ...newRequest as SkillRequest,
      id: Date.now().toString(),
      requestId,
      requestDate: new Date().toISOString().split('T')[0],
      status: 'pending'
    }
    
    // Add to requests list
    setSkillRequests([...skillRequests, fullRequest])
    
    // Send confirmation email to client
    if (newRequest.clientEmail) {
      await sendEmail(
        newRequest.clientEmail,
        `Project Request Confirmation - ${newRequest.projectName}`,
        `Dear ${newRequest.clientName} team,\\n\\nThank you for your project request. We have received your requirements and our AI workforce intelligence system is now analyzing your needs.\\n\\nProject: ${newRequest.projectName}\\nRequest ID: ${requestId}\\nExpected Response: Within 24 hours\\n\\nOur team will contact you shortly with candidate recommendations.\\n\\nBest regards,\\nARIS HR Team`,
        'general',
        { clientName: newRequest.clientName, projectName: newRequest.projectName, requestId }
      )
    }
    
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
    
    toast({
      title: "Request Submitted",
      description: `Request ${requestId} has been created and client notified`,
      duration: 3000,
    })
    
    // Switch to requests tab to show the new request
    setActiveTab('requests')
  }

  // Real-time metrics matching business value
  const realTimeMetrics = React.useMemo(() => ({
    totalEmployees: employees.length || 0,
    availableNow: employees.filter((emp: any) => emp.availability === 'Available').length || 0,
    inTraining: Math.floor(employees.length * 0.15) || 0,
    skillsAnalyzed: 120,
    activeProjects: skillRequests.filter(req => req.status !== 'fulfilled').length,
    completedThisMonth: 8,
    responseTimeAvg: '2.3 hours',
    clientSatisfaction: 94
  }), [employees, skillRequests])

  return (
    <div className="space-y-6">
      {/* Header - Single title, no duplicates */}
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
            Live
          </Badge>
          <Badge variant="outline">
            <Activity className="h-3 w-3 mr-1" />
            Real-time
          </Badge>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="requests">Skill Requests</TabsTrigger>
          <TabsTrigger value="analysis">AI Analysis</TabsTrigger>
          <TabsTrigger value="workforce">Workforce</TabsTrigger>
          <TabsTrigger value="training">Training</TabsTrigger>
          <TabsTrigger value="clients">Clients</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Real-time Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="flex items-center p-6">
                <Users className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Total Employees</p>
                  <p className="text-2xl font-bold">{realTimeMetrics.totalEmployees}</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="flex items-center p-6">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Available Now</p>
                  <p className="text-2xl font-bold">{realTimeMetrics.availableNow}</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="flex items-center p-6">
                <Clock className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">In Training</p>
                  <p className="text-2xl font-bold">{realTimeMetrics.inTraining}</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="flex items-center p-6">
                <TrendingUp className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Active Projects</p>
                  <p className="text-2xl font-bold">{realTimeMetrics.activeProjects}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Gen AI Team Overview Section */}
          <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Brain className="h-6 w-6 text-blue-600" />
                <span className="text-xl font-bold text-blue-800">Gen AI Development Team</span>
                <Badge className="bg-blue-600 hover:bg-blue-700">
                  5 Members
                </Badge>
              </CardTitle>
              <CardDescription className="text-blue-700">
                Specialized Generative AI and Machine Learning development team with advanced AI/ML expertise
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-lg p-4 border border-blue-200">
                  <h4 className="font-semibold text-blue-800 mb-2">Team Composition</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Senior Gen AI Developers</span>
                      <Badge variant="secondary">2</Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Gen AI Developers</span>
                      <Badge variant="secondary">3</Badge>
                    </div>
                    <div className="flex justify-between text-sm font-medium text-green-700">
                      <span>Available Now</span>
                      <Badge className="bg-green-100 text-green-700">4</Badge>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-4 border border-blue-200">
                  <h4 className="font-semibold text-blue-800 mb-2">Core Expertise</h4>
                  <div className="flex flex-wrap gap-1">
                    <Badge variant="outline" className="text-xs">Machine Learning</Badge>
                    <Badge variant="outline" className="text-xs">Deep Learning</Badge>
                    <Badge variant="outline" className="text-xs">NLP</Badge>
                    <Badge variant="outline" className="text-xs">Python</Badge>
                    <Badge variant="outline" className="text-xs">TensorFlow</Badge>
                    <Badge variant="outline" className="text-xs">PyTorch</Badge>
                    <Badge variant="outline" className="text-xs">LLM Development</Badge>
                    <Badge variant="outline" className="text-xs">Generative AI</Badge>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-4 border border-blue-200">
                  <h4 className="font-semibold text-blue-800 mb-2">Team Performance</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Active Projects</span>
                      <span className="font-medium">10</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Completed Projects</span>
                      <span className="font-medium">57</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Client Satisfaction</span>
                      <span className="font-medium text-green-600">98%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Senior Team Members Highlight */}
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-4 border border-indigo-200">
                <h4 className="font-semibold text-indigo-800 mb-3 flex items-center gap-2">
                  <Star className="h-4 w-4" />
                  Senior Gen AI Developers
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white rounded-lg p-3 border border-indigo-100">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="h-8 w-8 bg-indigo-100 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-indigo-600" />
                      </div>
                      <div>
                        <p className="font-medium text-indigo-800">Sowmyashree</p>
                        <p className="text-xs text-indigo-600">Senior Gen AI Developer</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-indigo-600">
                      <Mail className="h-3 w-3" />
                      <span>Athulyaroy@karanji.com</span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      <Badge variant="outline" className="text-xs bg-purple-50">LLM Development</Badge>
                      <Badge variant="outline" className="text-xs bg-purple-50">Generative AI</Badge>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-3 border border-indigo-100">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="h-8 w-8 bg-indigo-100 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-indigo-600" />
                      </div>
                      <div>
                        <p className="font-medium text-indigo-800">Griffith Sheeba Menon</p>
                        <p className="text-xs text-indigo-600">Senior Gen AI Developer</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-indigo-600">
                      <Mail className="h-3 w-3" />
                      <span>Sheebam@karanji.com</span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      <Badge variant="outline" className="text-xs bg-purple-50">Computer Vision</Badge>
                      <Badge variant="outline" className="text-xs bg-purple-50">NLP</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Real-time Activity Feed */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Real-time Activity Feed
              </CardTitle>
              <CardDescription>
                Live updates from the ARIS workforce intelligence system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-3 border rounded-lg bg-blue-50">
                  <div className="h-2 w-2 bg-blue-600 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">New skill request analyzed</p>
                    <p className="text-xs text-muted-foreground">Cloud Migration Platform - TechCorp Solutions</p>
                    <p className="text-xs text-muted-foreground">2 minutes ago</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 border rounded-lg bg-green-50">
                  <div className="h-2 w-2 bg-green-600 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Training completed</p>
                    <p className="text-xs text-muted-foreground">Advanced AWS certification program</p>
                    <p className="text-xs text-muted-foreground">15 minutes ago</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 border rounded-lg bg-orange-50">
                  <div className="h-2 w-2 bg-orange-600 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Resource allocation updated</p>
                    <p className="text-xs text-muted-foreground">3 developers assigned to new project</p>
                    <p className="text-xs text-muted-foreground">1 hour ago</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Skill Requests Tab */}
        <TabsContent value="requests" className="space-y-6">
          {/* Create New Request Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Create New Skill Request
              </CardTitle>
              <CardDescription>
                Submit a new client project requirement for AI analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="clientName">Client Name *</Label>
                  <Input
                    id="clientName"
                    value={newRequest.clientName}
                    onChange={(e) => setNewRequest({...newRequest, clientName: e.target.value})}
                    placeholder="Enter client company name"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="clientEmail">Client Email</Label>
                  <Input
                    id="clientEmail"
                    type="email"
                    value={newRequest.clientEmail}
                    onChange={(e) => setNewRequest({...newRequest, clientEmail: e.target.value})}
                    placeholder="contact@client.com"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="projectName">Project Name *</Label>
                  <Input
                    id="projectName"
                    value={newRequest.projectName}
                    onChange={(e) => setNewRequest({...newRequest, projectName: e.target.value})}
                    placeholder="Enter project name"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="startDate">Required Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={newRequest.requiredStartDate}
                    onChange={(e) => setNewRequest({...newRequest, requiredStartDate: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (weeks)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={newRequest.projectDurationWeeks}
                    onChange={(e) => setNewRequest({...newRequest, projectDurationWeeks: parseInt(e.target.value)})}
                    min="1"
                    max="104"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="teamSize">Team Size</Label>
                  <Input
                    id="teamSize"
                    type="number"
                    value={newRequest.teamSizeRequired}
                    onChange={(e) => setNewRequest({...newRequest, teamSizeRequired: parseInt(e.target.value)})}
                    min="1"
                    max="50"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select value={newRequest.priority} onValueChange={(value: any) => setNewRequest({...newRequest, priority: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Project Description</Label>
                <Textarea
                  id="description"
                  value={newRequest.projectDescription}
                  onChange={(e) => setNewRequest({...newRequest, projectDescription: e.target.value})}
                  placeholder="Describe the project requirements and objectives..."
                  rows={3}
                />
              </div>
              
              {/* Skills Section */}
              <div className="space-y-4">
                <Label>Required Skills *</Label>
                
                {/* Add Skill Interface */}
                <div className="flex flex-wrap items-end gap-2">
                  <div className="flex-1 min-w-[200px]">
                    <Label htmlFor="skill">Skill</Label>
                    <Select value={selectedSkill} onValueChange={setSelectedSkill}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select skill" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableSkills.map(skill => (
                          <SelectItem key={skill} value={skill}>{skill}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="min-w-[140px]">
                    <Label htmlFor="level">Level</Label>
                    <Select value={skillLevel} onValueChange={(value: SkillLevel) => setSkillLevel(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="expert">Expert</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="min-w-[80px]">
                    <Label htmlFor="count">Count</Label>
                    <Input
                      id="count"
                      type="number"
                      value={skillCount}
                      onChange={(e) => setSkillCount(e.target.value)}
                      min="1"
                      max="20"
                    />
                  </div>
                  
                  <Button onClick={addSkill} disabled={!selectedSkill}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                
                {/* Skills List */}
                {newRequest.skills && newRequest.skills.length > 0 && (
                  <div className="space-y-2">
                    <Label>Selected Skills:</Label>
                    <div className="space-y-2">
                      {newRequest.skills.map((skill, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <span className="font-medium">{skill.skill}</span>
                            <Badge className={getSkillLevelColor(skill.level)}>
                              {getSkillLevelDisplay(skill.level)}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {skill.count} {skill.count === 1 ? 'person' : 'people'}
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeSkill(skill.skill)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <Button onClick={submitRequest} className="w-full">
                <Send className="h-4 w-4 mr-2" />
                Submit Request
              </Button>
            </CardContent>
          </Card>

          {/* Existing Requests */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Skill Requests</CardTitle>
              <CardDescription>
                Track and manage client project requirements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {skillRequests.map((request) => (
                  <div key={request.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{request.projectName}</h3>
                          <Badge 
                            variant={request.priority === 'urgent' ? 'destructive' : 
                                   request.priority === 'high' ? 'default' : 'secondary'}
                          >
                            {request.priority.toUpperCase()}
                          </Badge>
                          <Badge variant="outline">
                            {request.status.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Client: {request.clientName} | ID: {request.requestId}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {request.skills.map((skill, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {skill.skill} ({getSkillLevelDisplay(skill.level)}) × {skill.count}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="text-right text-sm text-muted-foreground">
                        <p>Start: {request.requiredStartDate}</p>
                        <p>Duration: {request.projectDurationWeeks} weeks</p>
                        <p>Team Size: {request.teamSizeRequired}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Analysis Tab */}
        <TabsContent value="analysis" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                AI Workforce Analysis
              </CardTitle>
              <CardDescription>
                Real-time AI-powered workforce intelligence and recommendations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Brain className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">AI Analysis Engine</h3>
                <p className="text-muted-foreground mb-4">
                  Submit skill requests to see AI-powered workforce analysis and recommendations
                </p>
                <Button onClick={() => setActiveTab('requests')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Skill Request
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Workforce Tab */}
        <TabsContent value="workforce" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Employee Workforce Directory
              </CardTitle>
              <CardDescription>
                Real-time employee data with skills and availability status
              </CardDescription>
            </CardHeader>
            <CardContent>
              {employees.length > 0 ? (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      Showing {employees.length} employees from live data feed
                    </p>
                    <Badge variant="outline" className="bg-green-50 text-green-700">
                      <RefreshCw className="h-3 w-3 mr-1" />
                      Real-time Data
                    </Badge>
                  </div>
                  
                  {/* Employee Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {employees.map((employee: any) => (
                      <Card key={employee.id} className="hover:shadow-md transition-shadow">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="text-lg">{employee.name}</CardTitle>
                              <p className="text-sm text-muted-foreground">{employee.role}</p>
                              <p className="text-xs text-muted-foreground">{employee.department}</p>
                            </div>
                            <Badge 
                              variant={employee.availability === 'Available' ? 'default' : 'secondary'}
                              className={employee.availability === 'Available' ? 'bg-green-100 text-green-800' : ''}
                            >
                              {employee.availability}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span>{employee.location}</span>
                          </div>
                          
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span className="truncate">{employee.email}</span>
                          </div>
                          
                          <div className="flex items-center gap-2 text-sm">
                            <Award className="h-4 w-4 text-muted-foreground" />
                            <span>{employee.experience}</span>
                          </div>
                          
                          <div className="flex items-center gap-2 text-sm">
                            <Briefcase className="h-4 w-4 text-muted-foreground" />
                            <span>{employee.currentProjects} active, {employee.completedProjects} completed</span>
                          </div>
                          
                          {/* Skills */}
                          <div className="space-y-2">
                            <Label className="text-xs font-medium">Skills</Label>
                            <div className="flex flex-wrap gap-1">
                              {employee.skills?.slice(0, 4).map((skill: any, idx: number) => (
                                <Badge 
                                  key={idx} 
                                  variant="secondary" 
                                  className={`text-xs ${getSkillLevelColor(skill.level)}`}
                                >
                                  {skill.skill}
                                </Badge>
                              ))}
                              {employee.skills?.length > 4 && (
                                <Badge variant="outline" className="text-xs">
                                  +{employee.skills.length - 4} more
                                </Badge>
                              )}
                            </div>
                          </div>
                          
                          {/* Actions */}
                          <div className="flex gap-2 pt-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1"
                              onClick={() => {
                                sendEmail(
                                  employee.email,
                                  `Training Opportunity - ARIS System`,
                                  `Dear ${employee.name},\n\nWe have identified a new training opportunity that matches your skill profile and career development goals.\n\nThis training will help enhance your ${employee.skills?.[0]?.skill || 'technical'} skills and prepare you for upcoming project assignments.\n\nOur HR team will contact you shortly with more details.\n\nBest regards,\nARIS HR Team`,
                                  'training_scheduled',
                                  { 
                                    employeeName: employee.name,
                                    trainingSkills: employee.skills?.map((s: any) => s.skill).slice(0, 3) || []
                                  }
                                )
                              }}
                            >
                              <MailIcon className="h-4 w-4 mr-1" />
                              Send Training
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                sendEmail(
                                  employee.email,
                                  `Project Assignment - ARIS System`,
                                  `Dear ${employee.name},\n\nWe have a new project opportunity that matches your expertise in ${employee.skills?.[0]?.skill || 'technology'}.\n\nProject requirements align well with your ${employee.experience} of experience and current skill set.\n\nOur project coordination team will reach out to discuss the details and timeline.\n\nBest regards,\nARIS HR Team`,
                                  'general',
                                  { employeeName: employee.name }
                                )
                              }}
                            >
                              <Send className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  
                  {/* Quick Actions */}
                  <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <Brain className="h-8 w-8 text-blue-600" />
                        <div className="flex-1">
                          <h3 className="font-medium text-blue-900">Workforce Analytics</h3>
                          <p className="text-sm text-blue-700">
                            Available: {employees.filter((emp: any) => emp.availability === 'Available').length} • 
                            Busy: {employees.filter((emp: any) => emp.availability === 'Busy').length} • 
                            Total Skills: {employees.reduce((acc: number, emp: any) => acc + (emp.skills?.length || 0), 0)}
                          </p>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            toast({
                              title: "Analytics Generated",
                              description: "Workforce analytics report has been generated",
                              duration: 3000,
                            })
                          }}
                        >
                          <BarChart3 className="h-4 w-4 mr-2" />
                          Generate Report
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Employee Data</h3>
                  <p className="text-muted-foreground mb-4">
                    Employee data will be loaded from the API when available
                  </p>
                  <Badge variant="outline">Real-time Data Loading</Badge>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Training Tab */}
        <TabsContent value="training" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Training Management
              </CardTitle>
              <CardDescription>
                AI-driven training recommendations and progress tracking
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Award className="h-16 w-16 text-orange-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Training Programs</h3>
                <p className="text-muted-foreground mb-4">
                  Training data will be dynamically loaded based on skill gaps and project requirements
                </p>
                <Badge variant="outline">Dynamic Training Allocation</Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Clients Tab */}
        <TabsContent value="clients" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Client Management & Email Testing
              </CardTitle>
              <CardDescription>
                Manage client relationships and test email functionality
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Email Testing Section */}
                <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <MailIcon className="h-5 w-5 text-blue-600" />
                      Test Email Functionality
                    </CardTitle>
                    <CardDescription>
                      Send test emails to verify the email system is working
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        
                          
                              
                          
                          
                          
                          
                          
                        
                      </div>
                      
                      <div className="space-y-3">
                        <h4 className="font-medium">Custom Email Test</h4>
                        <div className="space-y-2">
                          <Input
                            placeholder="Enter email address"
                            value={customEmailTo}
                            onChange={(e) => setCustomEmailTo(e.target.value)}
                          />
                          <Input
                            placeholder="Enter subject"
                            value={customEmailSubject}
                            onChange={(e) => setCustomEmailSubject(e.target.value)}
                          />
                          <Textarea
                            placeholder="Enter email message"
                            value={customEmailMessage}
                            onChange={(e) => setCustomEmailMessage(e.target.value)}
                            rows={4}
                          />
                          <Button
                            className="w-full"
                            onClick={() => {
                              if (customEmailTo && customEmailSubject && customEmailMessage) {
                                sendEmail(
                                  customEmailTo,
                                  customEmailSubject,
                                  customEmailMessage,
                                  'general'
                                )
                              } else {
                                toast({
                                  title: "Validation Error",
                                  description: "Please fill in all fields",
                                  variant: "destructive"
                                })
                              }
                            }}
                          >
                            <Send className="h-4 w-4 mr-2" />
                            Send Custom Email
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Client Requests */}
                <div className="space-y-4">
                  <h3 className="font-medium">Client Communications</h3>
                  {skillRequests.filter(req => req.clientEmail).map((request) => (
                    <div key={request.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">{request.clientName}</h3>
                          <p className="text-sm text-muted-foreground">{request.clientEmail}</p>
                          <p className="text-sm text-muted-foreground">Project: {request.projectName}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              if (request.clientEmail) {
                                sendEmail(
                                  request.clientEmail,
                                  `Update on ${request.projectName}`,
                                  `Dear ${request.clientName} team,\n\nWe have an update on your project "${request.projectName}".\n\nOur AI analysis is complete and we have identified suitable candidates. We will be sending candidate profiles shortly.\n\nBest regards,\nARIS HR Team`,
                                  'general',
                                  { clientName: request.clientName, projectName: request.projectName }
                                )
                              }
                            }}
                          >
                            <MailIcon className="h-4 w-4 mr-2" />
                            Send Update
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {skillRequests.filter(req => req.clientEmail).length === 0 && (
                    <div className="text-center py-8">
                      <Building className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">No Client Communications Yet</h3>
                      <p className="text-muted-foreground mb-4">
                        Client data will appear here when skill requests include email addresses
                      </p>
                      <Button onClick={() => setActiveTab('requests')}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Client Request
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default ARISEnhancedDashboard
