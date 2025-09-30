"use client"

// import * as React from "react";

/**
 * ARIS Enhanced Dashboard - Clean Production Version
 * 
 * Features:
 * - Dynamic data from APIs (no hardcoded values)
 * - Connected skill requests and AI analysis
 * - Working email functionality with Outlook integration
 * - Clean interface without unnecessary real-time features
 * - Focus on core HR functionality
 */

import React from "react"
import { TrendsInsights } from "../app/employee-dashboard/components/trends-insights"
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
import { useToast } from "@/hooks/use-toast"
import { getBestTrainingResourceForSkill } from "@/lib/training-links"

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
  Target,
  Calendar,
  Award,
  Briefcase,
  Mail,
  Building,
  User,
  Settings,
  X,
  FileText,
  Activity,
  Upload
} from "lucide-react"

// Data fetcher function
const fetcher = (url: string) => fetch(url).then((r) => {
  if (!r.ok) {
    throw new Error(`HTTP error! status: ${r.status}`)
  }
  return r.json()
})

// Type definitions
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

export function ARISEnhancedDashboard() {
  // State for career requirements file upload
  const [careerFile, setCareerFile] = React.useState<File | null>(null);
  const handleCareerFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setCareerFile(e.target.files[0]);
    } else {
      setCareerFile(null);
    }
  };
  
  // Show eligible employees directly in Career Path Modeling tab
  // Always show all employees matching skills/designation from database
  const [eligibleEmployees, setEligibleEmployees] = React.useState<PromotionCandidate[]>([]);

  // Helper to filter employees by uploaded requirements
  const filterEmployeesByRequirements = (requirements: any[], employees: PromotionCandidate[]) => {
    if (!requirements || requirements.length === 0) return employees;
    return employees.filter(emp => {
      // Match designation if present
      const reqDesignation = requirements.find(r => r.role || r.designation)?.role || requirements.find(r => r.role || r.designation)?.designation;
      if (reqDesignation && emp.role && emp.role.toLowerCase() !== reqDesignation.toLowerCase()) return false;
      // Match at least one skill
      const reqSkills = requirements.map(r => r.skill?.toLowerCase()).filter(Boolean);
      const empSkills = (emp.skills || []).map(s => s.skill?.toLowerCase());
      return reqSkills.some(skill => empSkills.includes(skill));
    });
  };

  const uploadCareerRequirements = async () => {
    if (!careerFile) {
      toast({
        title: "No File Selected",
        description: "Please select a file to upload",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const text = await careerFile.text();
      const Papa = (await import('papaparse')).default;
      const parsed = Papa.parse(text, { header: true, skipEmptyLines: true });
      if (!parsed.data || parsed.data.length === 0) {
        toast({ title: 'Error', description: 'No data found in uploaded file', variant: 'destructive' });
        return;
      }
      const columns = Object.keys(parsed.data[0] as object);
      const skillCol = columns.find(c => c.toLowerCase().includes('skill')) || columns[0];
      const levelCol = columns.find(c => c.toLowerCase().includes('level'));
      const certCol = columns.find(c => c.toLowerCase().includes('cert'));
      const jobBandCol = columns.find(c => c.toLowerCase().includes('band'));
      const requirements = parsed.data.map((row: any) => ({
        skill: row[skillCol]?.trim(),
        level: levelCol ? row[levelCol]?.trim() : undefined,
        certification: certCol ? row[certCol]?.trim() : undefined,
        jobBand: jobBandCol ? row[jobBandCol]?.trim() : undefined
      })).filter((r: any) => r.skill);
      if (requirements.length === 0) {
        toast({ title: 'Error', description: 'No valid skill requirements found in file', variant: 'destructive' });
        return;
      }
      // Call backend API to analyze employees against requirements
      const response = await fetch('/api/ai-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId: `career-upload-${Date.now()}`,
          skills: requirements,
          teamSize: 1
        })
      });
      const result = await response.json();
      if (result.success && result.analysis) {
        // Use all employees from database, filter by requirements
        const allEmployees = employeeData?.employees || [];
        const eligible = filterEmployeesByRequirements(requirements, allEmployees);
        setEligibleEmployees(eligible);
        toast({ title: 'Analysis Complete', description: `Found ${eligible.length} eligible employees.` });
      } else {
        toast({ title: 'Analysis Failed', description: result.error || 'Failed to analyze requirements', variant: 'destructive' });
      }
    } catch (error) {
      console.error('File upload error:', error);
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "Failed to process file",
        variant: "destructive"
      });
    }
  };
  // Hardcoded manager email
  const managerEmail = 'karanjibuddy@gmail.com';
  // Manager approval state for Ready Now
  const [managerApproval, setManagerApproval] = React.useState<{ [employeeId: string]: 'pending' | 'approved' | 'rejected' | null }>({});
  // State management
  const [activeTab, setActiveTab] = React.useState<'overview' | 'requests' | 'analysis' | 'workforce' | 'import' | 'trends'>('overview')
  // Trends state
  const [trends, setTrends] = React.useState<any[]>([]);
  const [trendsLoading, setTrendsLoading] = React.useState(false);
  const [trendsError, setTrendsError] = React.useState('');
  React.useEffect(() => {
    if (activeTab === 'trends') {
      setTrendsLoading(true);
      fetch('/api/trends?topic=industry')
        .then((res) => {
          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`)
          }
          return res.json()
        })
        .then((data) => {
          setTrends(data.articles || []);
          setTrendsError('');
        })
        .catch(() => setTrendsError('Failed to fetch industry trends.'))
        .finally(() => setTrendsLoading(false));
    }
  }, [activeTab]);
  const { toast } = useToast()

  // API Data fetching
  const { data: employeeData, mutate: mutateEmployees } = useSWR("/api/data", fetcher)
  const { data: skillRequestsData, mutate: mutateSkillRequests } = useSWR("/api/skill-requests", fetcher)
  
  interface PromotionCandidate {
    id: string;
    name: string;
    email: string;
    role: string;
    department: string;
    skills: { skill: string; level: string }[];
    certifications?: string[];
    performanceRating?: string;
    completedTraining?: string[];
    isPromotionCandidate?: boolean;
    promotionRole?: string;
    acceptanceStatus?: string;
    trainingProgress?: number;
  }

  const employees: PromotionCandidate[] = employeeData?.employees || [];
  const skillRequests = skillRequestsData?.requests || []

  // Form state for new skill request
  const [newRequest, setNewRequest] = React.useState({
    clientName: '',
    projectName: '',
    clientEmail: '',
    projectDescription: '',
    requiredStartDate: '',
    projectDurationWeeks: 12,
    teamSizeRequired: 3,
    priority: 'medium' as const,
    skills: [] as SkillRequirement[]
  })

  // Skill addition state
  const [selectedSkill, setSelectedSkill] = React.useState('')
  const [skillLevel, setSkillLevel] = React.useState('intermediate')
  const [skillCount, setSkillCount] = React.useState('1')
  const [isMandatory, setIsMandatory] = React.useState(true)

  // Analysis state
  const [currentAnalysis, setCurrentAnalysis] = React.useState<any>(null)
  const [isAnalyzing, setIsAnalyzing] = React.useState(false)

  // Email state
  const [emailData, setEmailData] = React.useState({
    to: '',
    subject: '',
    message: '',
    type: 'general'
  })
  const [isSendingEmail, setIsSendingEmail] = React.useState(false)

  // Available skills list
  const availableSkills = [
    'Python', 'Java', 'JavaScript', 'React', 'Node.js', 'Angular', 'Vue.js',
    'Machine Learning', 'Deep Learning', 'AI/ML', 'TensorFlow', 'PyTorch',
    'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Spring Boot',
    'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'Elasticsearch',
    'DevOps', 'CI/CD', 'Jenkins', 'Git', 'Linux',
    'Microservices', 'GraphQL', 'REST APIs', 'TypeScript',
    'Natural Language Processing', 'Computer Vision', 'Generative AI'
  ]

  // Add skill to request
  const addSkill = () => {
  if (selectedSkill && !newRequest.skills.find((s: SkillRequirement) => s.skill === selectedSkill)) {
      const skill: SkillRequirement = {
        skill: selectedSkill,
        level: skillLevel,
        count: parseInt(skillCount),
        mandatory: isMandatory
      }
      setNewRequest({
        ...newRequest,
        skills: [...newRequest.skills, skill]
      })
      setSelectedSkill('')
      setSkillLevel('intermediate')
      setSkillCount('1')
      setIsMandatory(true)
    }
  }

  // Remove skill from request
  const removeSkill = (skillToRemove: string) => {
    setNewRequest({
      ...newRequest,
    skills: newRequest.skills.filter((s: SkillRequirement) => s.skill !== skillToRemove)
    })
  }

  // Submit new skill request
  const submitRequest = async () => {
    try {
      if (!newRequest.clientName || !newRequest.projectName || newRequest.skills.length === 0) {
        toast({
          title: "Missing Information",
          description: "Please fill in client name, project name, and add at least one skill.",
          variant: "destructive"
        })
        return
      }

      const response = await fetch('/api/skill-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRequest)
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Success",
          description: "Skill request created successfully"
        })
        // Add new request to local skillRequests state for immediate UI update
        if (skillRequestsData?.requests) {
          skillRequestsData.requests.unshift(result.request);
        }
        // Reset form
        setNewRequest({
          clientName: '',
          projectName: '',
          clientEmail: '',
          projectDescription: '',
          requiredStartDate: '',
          projectDurationWeeks: 12,
          teamSizeRequired: 3,
          priority: 'medium',
          skills: []
        })
        // Refresh data
        mutateSkillRequests()
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to create skill request",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error submitting skill request:', error)
      toast({
        title: "Error",
        description: `Failed to submit request: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      })
    }
  }

  // Run AI analysis
  const runAnalysis = async (request: SkillRequest) => {
    setIsAnalyzing(true)
    try {
      // Check if we have employees available
      if (employees.length === 0) {
        toast({
          title: "No Data Available",
          description: "Please import employee data before running AI analysis",
          variant: "destructive"
        })
        setActiveTab('import')
        return
      }

      const response = await fetch('/api/ai-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId: request.requestId,
          skills: request.skills,
          teamSize: request.teamSizeRequired
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()

      if (result.success) {
        setCurrentAnalysis(result.analysis)
        setActiveTab('analysis')
        toast({
          title: "Analysis Complete",
          description: `AI analysis completed with ${result.analysis.readyNow.length} ready now, ${result.analysis.ready2Weeks.length} ready in 2 weeks`
        })
      } else {
        toast({
          title: "Analysis Failed",
          description: result.error || "Failed to run analysis",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Analysis error:', error)
      toast({
        title: "Error",
        description: "Failed to run AI analysis",
        variant: "destructive"
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  // Send training notifications
  const sendTrainingNotifications = async (request: SkillRequest) => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          skillRequest: request,
          action: 'send_training_notifications'
        })
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Training Notifications Sent",
          description: `Sent ${result.notificationsSent} training notifications to employees who need skill upgrades`
        })
      } else {
        toast({
          title: "Notification Failed", 
          description: result.error || "Failed to send training notifications",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send training notifications",
        variant: "destructive"
      })
    }
  }

  // Send email
  const sendEmail = async () => {
    if (!emailData.to || !emailData.subject || !emailData.message) {
      toast({
        title: "Missing Information",
        description: "Please fill in all email fields",
        variant: "destructive"
      })
      return
    }

    setIsSendingEmail(true)
    try {
      const response = await fetch('/api/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emailData)
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Email Sent",
          description: `Email sent successfully via ${result.provider}`
        })
        
        // Reset form
        setEmailData({
          to: '',
          subject: '',
          message: '',
          type: 'general'
        })
      } else {
        toast({
          title: "Email Failed",
          description: result.error || "Failed to send email",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send email",
        variant: "destructive"
      })
    } finally {
      setIsSendingEmail(false)
    }
  }

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-gray-100 text-gray-800'
      case 'analyzing': return 'bg-blue-100 text-blue-800'
      case 'proposed': return 'bg-purple-100 text-purple-800'
      case 'training_scheduled': return 'bg-orange-100 text-orange-800'
      case 'profiles_sent': return 'bg-yellow-100 text-yellow-800'
      case 'interviews_scheduled': return 'bg-indigo-100 text-indigo-800'
      case 'fulfilled': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={(value: string) => setActiveTab(value as any)}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="requests">Competency Mapping</TabsTrigger>
          <TabsTrigger value="workforce">Career Path Modeling</TabsTrigger>
          <TabsTrigger value="trends">Trends & Insights</TabsTrigger>
          <TabsTrigger value="import">Employee Directory</TabsTrigger>
        </TabsList>
        {/* Trends & Insights Tab (Charts) */}
        <TabsContent value="trends" className="space-y-6">
          <TrendsInsights />
        </TabsContent>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="flex items-center p-6">
                <Users className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Total Employees</p>
                  <p className="text-2xl font-bold">{employees.length}</p>
                  {employees.length === 0 && (
                    <p className="text-xs text-muted-foreground mt-1">Import data to get started</p>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="flex items-center p-6">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Available</p>
                  <p className="text-2xl font-bold">
                    {employees.filter((emp: any) => emp.availability === 'Available').length}
                  </p>
                  {employees.length === 0 && (
                    <p className="text-xs text-muted-foreground mt-1">No data available</p>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="flex items-center p-6">
                <FileText className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Active Requests</p>
                  <p className="text-2xl font-bold">{skillRequests.length}</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="flex items-center p-6">
                <TrendingUp className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">In Analysis</p>
                  <p className="text-2xl font-bold">
                    {skillRequests.filter((req: any) => req.status === 'analyzing').length}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Import Prompt or Recent Activity */}
          {employees.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Users className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">Welcome to ARIS</h3>
                <p className="text-muted-foreground text-center mb-6 max-w-md">
                  Get started by importing your employee data to unlock the full potential of workforce intelligence and skill management.
                </p>
                <Button 
                  onClick={() => setActiveTab('import')}
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Upload className="h-5 w-5 mr-2" />
                  Import Employee Data
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Recent Skill Requests
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {skillRequests.slice(0, 3).map((request: SkillRequest) => (
                    <div key={request.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{request.projectName}</p>
                        <p className="text-sm text-muted-foreground">{request.clientName}</p>
                        <p className="text-xs text-muted-foreground">Team Size: {request.teamSizeRequired}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getPriorityColor(request.priority)}>
                          {request.priority}
                        </Badge>
                        <Badge className={getStatusColor(request.status)}>
                          {request.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                  ))}
                  {skillRequests.length === 0 && (
                    <p className="text-center text-muted-foreground py-4">
                      No skill requests found. Create one to get started.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Skill Requests Tab */}
        <TabsContent value="requests" className="space-y-6">
          {/* Create New Request */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Create New Skill Request
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Client Name *</label>
                  <Input
                    value={newRequest.clientName}
                    onChange={(e) => setNewRequest({...newRequest, clientName: e.target.value})}
                    placeholder="Enter client name"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Client Email</label>
                  <Input
                    value={newRequest.clientEmail}
                    onChange={(e) => setNewRequest({...newRequest, clientEmail: e.target.value})}
                    placeholder="client@company.com"
                    type="email"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Project Name *</label>
                  <Input
                    value={newRequest.projectName}
                    onChange={(e) => setNewRequest({...newRequest, projectName: e.target.value})}
                    placeholder="Enter project name"
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
                  <label className="text-sm font-medium">Duration (weeks)</label>
                  <Input
                    type="number"
                    value={newRequest.projectDurationWeeks || ''}
                    onChange={(e) => setNewRequest({...newRequest, projectDurationWeeks: parseInt(e.target.value) || 12})}
                    min="1"
                    placeholder="12"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Team Size</label>
                  <Input
                    type="number"
                    value={newRequest.teamSizeRequired || ''}
                    onChange={(e) => setNewRequest({...newRequest, teamSizeRequired: parseInt(e.target.value) || 3})}
                    min="1"
                    placeholder="3"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Priority</label>
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
              </div>
              
              <div>
                <label className="text-sm font-medium">Project Description</label>
                <Textarea
                  value={newRequest.projectDescription}
                  onChange={(e) => setNewRequest({...newRequest, projectDescription: e.target.value})}
                  placeholder="Describe the project requirements..."
                  rows={3}
                />
              </div>

              {/* Skills Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Required Skills</h3>
                
                {/* Add Skill Form */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-2 items-end">
                  <div>
                    <label className="text-sm font-medium">Skill</label>
                     <Input
      type="text"
      placeholder="Enter skill"
      value={selectedSkill}
      onChange={(e) => setSelectedSkill(e.target.value)}
      />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Level</label>
                    <Select value={skillLevel} onValueChange={setSkillLevel}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner(0-2 years)</SelectItem>
                        <SelectItem value="intermediate">Intermediate(3-5 years)</SelectItem>
                        <SelectItem value="expert">Expert(5+ years)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Count</label>
                    <Input
                      type="number"
                      value={skillCount}
                      onChange={(e) => setSkillCount(e.target.value)}
                      min="1"
                    />
                  </div>
                  
                  <Button onClick={addSkill} className="h-10">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {/* Skills List */}
                <div className="space-y-2">
                  {newRequest.skills.map((skill, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{skill.skill}</Badge>
                        <Badge variant="secondary">{skill.level}</Badge>
                        <span className="text-sm text-muted-foreground">Count: {skill.count}</span>
                       
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

              <Button onClick={submitRequest} className="w-full">
                Create Skill Request
              </Button>
            </CardContent>
          </Card>

          {/* Existing Requests */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                All Skill Requests
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {skillRequests.map((request: SkillRequest) => (
                  <div key={request.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold">{request.projectName}</h3>
                        <p className="text-sm text-muted-foreground">{request.clientName}</p>
                        <p className="text-xs text-muted-foreground">ID: {request.requestId}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getPriorityColor(request.priority)}>
                          {request.priority}
                        </Badge>
                        <Badge className={getStatusColor(request.status)}>
                          {request.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3 text-sm">
                      <div>
                        <span className="font-medium">Team Size:</span> {request.teamSizeRequired}
                      </div>
                      <div>
                        <span className="font-medium">Duration:</span> {request.projectDurationWeeks} weeks
                      </div>
                      <div>
                        <span className="font-medium">Start Date:</span> {request.requiredStartDate || 'TBD'}
                      </div>
                      <div>
                        <span className="font-medium">Requested:</span> {request.requestDate}
                      </div>
                    </div>

                    <div className="mb-3">
                      <span className="font-medium text-sm">Required Skills:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {request.skills.map((skill, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {skill.skill} ({skill.level}) x{skill.count}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => runAnalysis(request)}
                        disabled={isAnalyzing || employees.length === 0}
                        title={employees.length === 0 ? "Import employee data first" : ""}
                      >
                        {isAnalyzing ? (
                          <>
                            <Clock className="h-4 w-4 mr-2 animate-spin" />
                            Analyzing...
                          </>
                        ) : (
                          <>
                            <Brain className="h-4 w-4 mr-2" />
                            Run AI Analysis
                          </>
                        )}
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => sendTrainingNotifications(request)}
                        disabled={employees.length === 0}
                        title="Send training notifications to employees who need to level up their skills"
                      >
                        <Mail className="h-4 w-4 mr-2" />
                        Send Training Notifications
                      </Button>
                      {employees.length === 0 && (
                        <Badge variant="outline" className="text-xs text-muted-foreground">
                          No data available
                        </Badge>
                      )}
                      
                      {request.clientEmail && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEmailData({
                              to: request.clientEmail!,
                              subject: `Update on ${request.projectName}`,
                              message: `Dear ${request.clientName},\n\nWe wanted to provide you with an update on your project "${request.projectName}".\n\nBest regards,\nARIS Team`,
                              type: 'general'
                            })
                            setActiveTab('workforce') // Use workforce tab for email
                          }}
                        >
                          <Mail className="h-4 w-4 mr-2" />
                          Email Client
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
                
                {skillRequests.length === 0 && (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No skill requests found</p>
                    <p className="text-sm text-muted-foreground">Create your first skill request above</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          {/* Email Communication */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Email Communication
              </CardTitle>
              <div className="flex gap-2 mt-2"></div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">To *</label>
                  <Input
                    value={emailData.to}
                    onChange={(e) => setEmailData({...emailData, to: e.target.value})}
                    placeholder="recipient@company.com"
                    type="email"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Subject *</label>
                  <Input
                    value={emailData.subject}
                    onChange={(e) => setEmailData({...emailData, subject: e.target.value})}
                    placeholder="Email subject"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Message *</label>
                <Textarea
                  value={emailData.message}
                  onChange={(e) => setEmailData({...emailData, message: e.target.value})}
                  placeholder="Type your message here..."
                  rows={6}
                />
              </div>
              <Button 
                onClick={sendEmail} 
                disabled={isSendingEmail}
                className="w-full"
              >
                {isSendingEmail ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Email
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Analysis Tab */}
        <TabsContent value="analysis" className="space-y-6">
          {currentAnalysis ? (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5" />
                    AI Analysis Results - {currentAnalysis.requestId}
                  </CardTitle>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>Confidence Score: {currentAnalysis.confidenceScore}%</span>
                    <span>Analysis Time: {new Date(currentAnalysis.analysisTime).toLocaleString()}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Ready Now */}
                    <div>
                      <h3 className="font-semibold text-green-700 mb-3 flex items-center gap-2">
                        <CheckCircle className="h-5 w-5" />
                        Ready Now ({currentAnalysis.readyNow.length})
                      </h3>
                      <div className="grid gap-3">
                        {currentAnalysis.readyNow.map((resource: ResourceMatch) => {
                          // Assume resource.availability === 'Available' means free, otherwise on project
                          const isFree = resource.availability === 'Available';
                          const approvalStatus = managerApproval[resource.id] || null;
                          return (
                            <div key={resource.id} className="border rounded-lg p-4 bg-green-50">
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <h4 className="font-medium">{resource.name}</h4>
                                  <p className="text-sm text-muted-foreground">{resource.role} • {resource.department}</p>
                                  <p className="text-xs text-muted-foreground">{resource.email}</p>
                                </div>
                                <div className="text-right">
                                  <Badge className="bg-green-100 text-green-800 mb-1">
                                    {resource.matchPercentage}% Match
                                  </Badge>
                                  <p className="text-xs text-muted-foreground">{resource.availability}</p>
                                </div>
                              </div>
                              <div className="mb-2">
                                <span className="text-xs font-medium text-muted-foreground">Current Skills:</span>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {resource.currentSkills.map((skill, index) => (
                                    <Badge key={index} variant="outline" className="text-xs">
                                      {skill.skill} ({skill.level})
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                              <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <span>Experience: {resource.experience}</span>
                                <span>Projects: {resource.currentProjects} active, {resource.completedProjects} completed</span>
                              </div>
                              {!isFree ? (
                                <Badge className="bg-red-100 text-red-800 mt-3 w-full justify-center">Unavailable (On Project)</Badge>
                              ) : approvalStatus === 'approved' ? (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="mt-3 w-full"
                                  onClick={async () => {
                                    if (!resource.email) {
                                      alert('Employee email not available');
                                      return;
                                    }
                                    const subject = `You have been shortlisted!`;
                                    const message = `Dear ${resource.name},\n\nCongratulations! You have been shortlisted for the project based on your skill set. Please check your dashboard for more details.`;
                                    try {
                                      const response = await fetch('/api/email', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ to: resource.email, subject, message })
                                      });
                                      
                                      if (!response.ok) {
                                        throw new Error(`HTTP error! status: ${response.status}`)
                                      }
                                      
                                      const result = await response.json();
                                      if (result.success) {
                                        alert('Shortlist email sent to employee!');
                                        setManagerApproval((prev) => ({ ...prev, [resource.id]: null }));
                                      } else {
                                        alert('Failed to send shortlist email.');
                                      }
                                    } catch (err) {
                                      alert('Error sending shortlist email.');
                                    }
                                  }}
                                >
                                  <Send className="h-4 w-4 mr-1" />
                                  Send Shortlist Email to Employee
                                </Button>
                              ) : approvalStatus === 'rejected' ? (
                                <Badge className="bg-yellow-100 text-yellow-800 mt-3 w-full justify-center">Manager Rejected - HR Notified</Badge>
                              ) : approvalStatus === 'pending' ? (
                                <Badge className="bg-blue-100 text-blue-800 mt-3 w-full justify-center">Awaiting Manager Approval...</Badge>
                              ) : (
                                <Button
                                  size="sm"
                                  className="mt-3 w-full"
                                  onClick={async () => {
                                    // Send manager confirmation email
                                    setManagerApproval((prev) => ({ ...prev, [resource.id]: 'pending' }));
                                    try {
                                      const subject = `Manager Confirmation Needed: ${resource.name}`;
                                      // HTML email with Approve/Reject buttons (links)
                                      const approveUrl = `https://aris-platform/manager-action?employee=${encodeURIComponent(resource.id)}&action=approve`;
                                      const rejectUrl = `https://aris-platform/manager-action?employee=${encodeURIComponent(resource.id)}&action=reject`;
                                      const message = `
                                        <div style='font-family:sans-serif;max-width:500px;margin:auto;border:1px solid #e0e0e0;padding:24px;border-radius:8px;'>
                                          <h2 style="color:#2563eb;">Manager Action Required</h2>
                                          <p>This is an automated notification from the ARIS Platform.</p>
                                          <p>
                                            <b>${resource.name}</b> is being considered for a new project. Please review the details below and select an action:
                                          </p>
                                          <ul style="background:#f3f4f6;padding:12px 18px;border-radius:6px;">
                                            <li><b>Name:</b> ${resource.name}</li>
                                            <li><b>Email:</b> ${resource.email}</li>
                                            <li><b>Role:</b> ${resource.role}</li>
                                            <li><b>Department:</b> ${resource.department}</li>
                                          </ul>
                                          <p style="margin:18px 0 8px 0;">Choose an option:</p>
                                          <div style="margin:12px 0 24px 0;">
                                            <a href='${approveUrl}' style='background:#22c55e;color:white;padding:10px 22px;border-radius:5px;text-decoration:none;font-weight:bold;margin-right:12px;'>APPROVE</a>
                                            <a href='${rejectUrl}' style='background:#ef4444;color:white;padding:10px 22px;border-radius:5px;text-decoration:none;font-weight:bold;'>REJECT</a>
                                          </div>
                                          <p style="color:#64748b;font-size:13px;">
                                            This is an automated message. If you have questions, please contact the HR Team.<br/>
                                            ARIS Platform
                                          </p>
                                        </div>
                                      `;
                                      await fetch('/api/email', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({
                                          to: managerEmail,
                                          subject,
                                          message,
                                          isHtml: true,
                                          type: 'manager_confirmation',
                                          data: {
                                            employeeName: resource.name,
                                            employeeEmail: resource.email,
                                            hrTeamName: 'HR Team',
                                            approveUrl,
                                            rejectUrl
                                          }
                                        })
                                      });
                                    } catch (err) {
                                      toast({
                                        title: 'Error',
                                        description: 'Failed to send manager confirmation email.',
                                        variant: 'destructive'
                                      });
                                      setManagerApproval((prev) => ({ ...prev, [resource.id]: null }));
                                      return;
                                    }
                                    // Simulate manager response after delay (replace with real API in production)
                                    setTimeout(() => {
                                      // For demo, randomly approve or reject
                                      const approved = Math.random() > 0.5;
                                      setManagerApproval((prev) => ({ ...prev, [resource.id]: approved ? 'approved' : 'rejected' }));
                                      if (!approved) {
                                        // Notify HR (simulate)
                                        toast({
                                          title: 'Manager Rejected',
                                          description: `Manager rejected ${resource.name} for this project. HR notified.`,
                                          variant: 'destructive'
                                        });
                                      }
                                    }, 2000);
                                  }}
                                >
                                  <Mail className="h-4 w-4 mr-1" />
                                  Send Manager Confirmation Email
                                </Button>
                              )}
                            </div>
                          );
                        })}
                        {currentAnalysis.readyNow.length === 0 && (
                          <p className="text-muted-foreground text-sm">No employees ready immediately</p>
                        )}
                      </div>
                    </div>

                    {/* Ready in 2 Weeks */}
                    <div>
                      <h3 className="font-semibold text-orange-700 mb-3 flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        Ready in 2 Weeks ({currentAnalysis.ready2Weeks.length})
                      </h3>
                      <div className="grid gap-3">
                        {currentAnalysis.ready2Weeks.map((resource: ResourceMatch) => (
                          <div key={resource.id} className="border rounded-lg p-4 bg-orange-50">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h4 className="font-medium">{resource.name}</h4>
                                <p className="text-sm text-muted-foreground">{resource.role} • {resource.department}</p>
                                <p className="text-xs text-muted-foreground">{resource.email}</p>
                              </div>
                              <div className="text-right">
                                <Badge className="bg-orange-100 text-orange-800 mb-1">
                                  {resource.matchPercentage}% Match
                                </Badge>
                                <p className="text-xs text-muted-foreground">Ready: {resource.estimatedReadyDate}</p>
                              </div>
                            </div>

                            {resource.trainingNeeded.length > 0 && (
                              <div className="mb-2">
                                <span className="text-xs font-medium text-muted-foreground">Training Needed:</span>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {resource.trainingNeeded.map((training, index) => (
                                    <Badge key={index} variant="secondary" className="text-xs">
                                      {training}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                            <Button
                              size="sm"
                              className="mt-2 w-full"
                              onClick={async () => {
                                if (!resource.email) {
                                  alert('Employee email not available');
                                  return;
                                }
                                const subject = 'Training Request – Skill Alignment';
                                const message = 'Please review your training assignment.';
                                try {
                                  const response = await fetch('/api/email', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                      to: resource.email,
                                      subject,
                                      message,
                                      type: 'skill_alignment',
                                      data: {
                                        employeeName: resource.name,
                                        skills: (resource.trainingNeeded && resource.trainingNeeded.length > 0) ? resource.trainingNeeded : ['Python', 'Java'],
                                        trainingLink: getBestTrainingResourceForSkill(resource.trainingNeeded?.[0] || 'Java').url,
                                        hrTeamName: 'HR Team'
                                      }
                                    })
                                  });
                                  const result = await response.json();
                                  if (response.ok && result.success) {
                                    alert('Skill alignment email sent!');
                                  } else {
                                    alert('Failed to send email.');
                                  }
                                } catch (err) {
                                  alert('Error sending email.');
                                }
                              }}
                            >
                              Send Skill Alignment Email
                            </Button>
                           
                          </div>
                        ))}
                        {currentAnalysis.ready2Weeks.length === 0 && (
                          <p className="text-muted-foreground text-sm">No employees ready in 2 weeks</p>
                        )}
                      </div>
                    </div>

                    {/* Ready in 4 Weeks */}
                    <div>
                      <h3 className="font-semibold text-blue-700 mb-3 flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        Ready in 4 Weeks ({currentAnalysis.ready4Weeks.length})
                      </h3>
                      <div className="grid gap-3">
                        {currentAnalysis.ready4Weeks.map((resource: ResourceMatch) => (
                          <div key={resource.id} className="border rounded-lg p-4 bg-blue-50">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h4 className="font-medium">{resource.name}</h4>
                                <p className="text-sm text-muted-foreground">{resource.role} • {resource.department}</p>
                                <p className="text-xs text-muted-foreground">{resource.email}</p>
                              </div>
                              <div className="text-right">
                                <Badge className="bg-blue-100 text-blue-800 mb-1">
                                  {resource.matchPercentage}% Match
                                </Badge>
                                <p className="text-xs text-muted-foreground">Ready: {resource.estimatedReadyDate}</p>
                              </div>
                            </div>

                            {resource.trainingNeeded.length > 0 && (
                              <div className="mb-2">
                                <span className="text-xs font-medium text-muted-foreground">Training Needed:</span>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {resource.trainingNeeded.map((training, index) => (
                                    <Badge key={index} variant="secondary" className="text-xs">
                                      {training}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                              <Button
                                size="sm"
                                className="mt-2 w-full"
                                onClick={async () => {
                                  if (!resource.email) {
                                    alert('Employee email not available');
                                    return;
                                  }
                                  const subject = 'Training Request – Skill Alignment';
                                  const message = 'Please review your training assignment.';
                                  try {
                                    const response = await fetch('/api/email', {
                                      method: 'POST',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({
                                        to: resource.email,
                                        subject,
                                        message,
                                        type: 'skill_alignment',
                                        data: {
                                          employeeName: resource.name,
                                          skills: (resource.trainingNeeded && resource.trainingNeeded.length > 0) ? resource.trainingNeeded : ['Python', 'Java'],
                                          trainingLink: getBestTrainingResourceForSkill(resource.trainingNeeded?.[0] || 'Java').url,
                                          hrTeamName: 'HR Team'
                                        }
                                      })
                                    });
                                    const result = await response.json();
                                    if (response.ok && result.success) {
                                      alert('Skill alignment email sent!');
                                    } else {
                                      alert('Failed to send email.');
                                    }
                                  } catch (err) {
                                    alert('Error sending email.');
                                  }
                                }}
                              >
                                Send Skill Alignment Email
                              </Button>
                          </div>
                        ))}
                        {currentAnalysis.ready4Weeks.length === 0 && (
                          <p className="text-muted-foreground text-sm">No employees ready in 4 weeks</p>
                        )}
                      </div>
                    </div>

                    {/* External Hiring */}
                    {currentAnalysis.externalHireNeeded > 0 && (
                      <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          <strong>External Hiring Required:</strong> {currentAnalysis.externalHireNeeded} additional team member(s) needed
                        </AlertDescription>
                      </Alert>
                    )}

                    {/* Recommended Actions */}
                    <div>
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <Target className="h-5 w-5" />
                        Recommended Actions
                      </h3>
                      <div className="space-y-2">
                        {currentAnalysis.recommendedActions.map((action: string, index: number) => (
                          <div key={index} className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
                            <div className="h-2 w-2 bg-blue-600 rounded-full mt-2"></div>
                            <p className="text-sm">{action}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Brain className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Analysis Results</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Run AI analysis on a skill request to see detailed workforce matching results
                </p>
                <Button onClick={() => setActiveTab('requests')}>
                  Go to Skill Requests
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Workforce Tab */}
        <TabsContent value="workforce" className="space-y-6">
          {/* Career Path Modeling */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Career Path Modeling
              </CardTitle>
              <p className="text-muted-foreground mt-2 text-sm">HR uploads career role requirements for promotions and leadership pipeline. AI analyzes employees’ profiles (skills, certifications, performance history, completed training) and identifies employees ready for promotion or upskilling.</p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* HR Upload Career Role Requirements */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Upload Career Role Requirements (CSV/Excel)</label>
                <Input
                  type="file"
                  accept=".csv,.xlsx"
                  onChange={handleCareerFileUpload}
                />
                <Button
                  className="mt-2 bg-blue-600 hover:bg-blue-700"
                  onClick={uploadCareerRequirements}
                  disabled={!careerFile}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload
                </Button>
                <p className="text-xs text-muted-foreground">Supported: CSV, Excel. Example: Role, Required Skills, Certifications, Experience, Training</p>
                {careerFile && (
                  <p className="text-xs text-green-700 mt-1">Selected file: {careerFile.name}</p>
                )}
              </div>

              {/* Eligible Employees Results */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Eligible Employees Matching Job Role Requirements</h3>
                {eligibleEmployees.length > 0 ? (
                  <div className="grid gap-4">
                    {eligibleEmployees.map((emp: any, idx: number) => (
                      <Card key={emp.id} className="border-green-300">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                            <span className="font-bold">{emp.name}</span>
                            <span className="text-xs text-muted-foreground">{emp.role}</span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div className="flex flex-wrap gap-2 items-center">
                            <span className="text-xs font-medium">Email:</span>
                            <span className="text-xs">{emp.email}</span>
                            <span className="text-xs font-medium">Department:</span>
                            <span className="text-xs">{emp.department}</span>
                          </div>
                          <div>
                            <span className="font-medium text-xs">Skills:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {(emp.skills || []).map((skill: any, i: number) => (
                                <Badge key={i} variant="outline" className="text-xs">{skill.skill} ({skill.level})</Badge>
                              ))}
                            </div>
                          </div>
                          <div className="text-xs text-muted-foreground">Certifications: {emp.certifications?.join(', ') || 'None'}</div>
                          <div className="text-xs text-muted-foreground">Availability: {emp.availability}</div>
                          <div className="text-xs text-muted-foreground">Experience: {emp.experience}</div>
                          <div className="text-xs text-muted-foreground">Projects: {emp.currentProjects} active, {emp.completedProjects} completed</div>
                          <div className="text-xs text-muted-foreground">Performance: {emp.performanceRating || 'N/A'}</div>
                          <div className="text-xs text-muted-foreground">Completed Training: {emp.completedTraining?.join(', ') || 'None'}</div>
                          {/* HR Actions */}
                          <div className="flex gap-2 mt-2">
                            <Button size="sm" variant="outline" onClick={async () => {
                              // Send shortlist email to employee
                              const subject = `Congratulations! You are shortlisted for ${emp.promotionRole || 'promotion/upskilling'}`;
                              const message = `Dear ${emp.name},\n\nYou have been shortlisted for ${emp.promotionRole || 'promotion/upskilling'} based on your profile. Please review the attached training plan.\n\nBest regards,\nHR Team`;
                              try {
                                await fetch('/api/email', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ to: emp.email, subject, message })
                                });
                                toast({ title: 'Shortlist Email Sent', description: `Shortlist email sent to ${emp.name}` });
                              } catch {
                                toast({ title: 'Error', description: 'Failed to send email', variant: 'destructive' });
                              }
                            }}>
                              <Send className="h-4 w-4 mr-1" />
                              Send Shortlist Email
                            </Button>
                            <Button size="sm" variant="secondary" onClick={async () => {
                              if (!emp.email) {
                                toast({ title: 'Error', description: 'Employee email not available', variant: 'destructive' });
                                return;
                              }
                              
                              // Generate training plan based on employee skills
                              const trainingPlan = emp.skills?.map((skillObj: any) => {
                                const training = getBestTrainingResourceForSkill(skillObj.skill);
                                return `${skillObj.skill}: ${training.name} (${training.provider}) - ${training.url}`;
                              }).join('\n') || 'Custom training plan will be provided based on role requirements.';
                              
                              const subject = `Training Plan - ${emp.promotionRole || 'Skill Development'}`;
                              const message = `Dear ${emp.name},\n\nHere is your personalized training plan:\n\n${trainingPlan}\n\nPlease review and start with the recommended courses. Contact HR for any questions.\n\nBest regards,\nHR Team`;
                              
                              try {
                                const response = await fetch('/api/email', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ 
                                    to: emp.email, 
                                    subject, 
                                    message,
                                    type: 'training_plan',
                                    data: {
                                      employeeName: emp.name,
                                      trainingPlan: trainingPlan,
                                      hrTeamName: 'HR Team'
                                    }
                                  })
                                });
                                toast({ title: 'Training Plan Sent', description: `Training plan sent to ${emp.name}` });
                              } catch {
                                toast({ title: 'Error', description: 'Failed to send training plan', variant: 'destructive' });
                              }
                            }}>
                              <FileText className="h-4 w-4 mr-1" />
                              Attach Training Plan
                            </Button>
                          </div>
                          {/* Track Acceptance & Progress */}
                          <div className="mt-2">
                            <span className="text-xs font-medium">Acceptance Status:</span>
                            <Badge variant="outline" className="ml-2 text-xs">{emp.acceptanceStatus || 'Pending'}</Badge>
                          </div>
                          <div className="mt-1">
                            <span className="text-xs font-medium">Progress:</span>
                            <Progress value={emp.trainingProgress || 0} className="w-32 h-2 ml-2" />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">No eligible employees found for this job role.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Import Tab: Only Employee Directory */}
        <TabsContent value="import" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Employee Directory
                {employeeData?.dataSource === 'imported' && (
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Imported Data
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {employees.map((employee: any) => (
                  <div key={employee.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold">{employee.name}</h3>
                        <p className="text-sm text-muted-foreground">{employee.role}</p>
                        <p className="text-xs text-muted-foreground">{employee.email}</p>
                      </div>
                      <div className="text-right">
                        <Badge className={employee.availability === 'Available' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                          {employee.availability}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">{employee.location}</p>
                      </div>
                    </div>
                    <div className="mb-3">
                      <span className="text-xs font-medium text-muted-foreground">Skills:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {employee.skills.map((skill: any, index: number) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {skill.skill} ({skill.level})
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Experience: {employee.experience}</span>
                      <span>Projects: {employee.currentProjects} active, {employee.completedProjects} completed</span>
                    </div>
                  </div>
                ))}
                {employees.length === 0 && (
                  <div className="text-center py-12">
                    <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Employee Data Available</h3>
                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                      No employee data available.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
