"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { TrendingUp, MapPin, Calendar, Target, Clock, Award, ArrowRight } from "lucide-react"

interface CareerPathUpdate {
  id: string
  title: string
  description: string
  type: "milestone" | "skill" | "role" | "achievement"
  date: string
  status: "completed" | "in-progress" | "upcoming"
  progress?: number
}

interface CareerGoal {
  id: string
  title: string
  targetDate: string
  progress: number
  milestones: number
  completedMilestones: number
}

interface CareerPathUpdatesProps {
  employeeData: any
}

export function CareerPathUpdates({ employeeData }: CareerPathUpdatesProps) {
  const careerGoals: CareerGoal[] = [
    {
      id: "1",
      title: "Senior Developer",
      targetDate: "2024-12-31",
      progress: 75,
      milestones: 8,
      completedMilestones: 6
    },
    {
      id: "2", 
      title: "Team Lead",
      targetDate: "2025-06-30",
      progress: 40,
      milestones: 10,
      completedMilestones: 4
    }
  ]

  const recentUpdates: CareerPathUpdate[] = [
    {
      id: "1",
      title: "Advanced React Certification Completed",
      description: "Successfully completed Advanced React Patterns certification",
      type: "achievement",
      date: "2024-01-15",
      status: "completed"
    },
    {
      id: "2",
      title: "Leadership Training - Module 3",
      description: "Currently working on Team Management fundamentals",
      type: "skill",
      date: "2024-01-10",
      status: "in-progress",
      progress: 60
    },
    {
      id: "3",
      title: "Mentorship Program Assignment",
      description: "Assigned as mentor for 2 junior developers",
      type: "role",
      date: "2024-01-08",
      status: "completed"
    },
    {
      id: "4",
      title: "Project Architecture Review Milestone",
      description: "Complete system architecture documentation for Project Alpha",
      type: "milestone",
      date: "2024-01-20",
      status: "upcoming"
    },
    {
      id: "5",
      title: "AWS Solutions Architect Training",
      description: "Starting cloud architecture specialization track",
      type: "skill",
      date: "2024-01-25",
      status: "upcoming"
    }
  ]

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "milestone": return <Target className="h-4 w-4" />
      case "skill": return <TrendingUp className="h-4 w-4" />
      case "role": return <MapPin className="h-4 w-4" />
      case "achievement": return <Award className="h-4 w-4" />
      default: return <Calendar className="h-4 w-4" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "milestone": return "bg-blue-100 text-blue-800"
      case "skill": return "bg-green-100 text-green-800"
      case "role": return "bg-purple-100 text-purple-800"
      case "achievement": return "bg-yellow-100 text-yellow-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800"
      case "in-progress": return "bg-blue-100 text-blue-800"
      case "upcoming": return "bg-orange-100 text-orange-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Career Path Updates</h2>
        <Button variant="outline" size="sm">
          <MapPin className="h-4 w-4 mr-2" />
          View Full Path
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {careerGoals.map((goal) => (
          <Card key={goal.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{goal.title}</span>
                <Badge variant="outline">
                  <Clock className="h-3 w-3 mr-1" />
                  {formatDate(goal.targetDate)}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Overall Progress</span>
                  <span>{goal.progress}%</span>
                </div>
                <Progress value={goal.progress} className="h-2" />
              </div>
              
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-600">Milestones</p>
                  <p className="font-semibold">{goal.completedMilestones} of {goal.milestones} completed</p>
                </div>
                <Button variant="outline" size="sm">
                  <ArrowRight className="h-4 w-4 mr-1" />
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Career Updates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentUpdates.map((update, index) => (
              <div key={update.id}>
                <div className="flex items-start space-x-4">
                  <div className={`p-2 rounded-full ${getTypeColor(update.type)}`}>
                    {getTypeIcon(update.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold">{update.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{update.description}</p>
                        <div className="flex items-center space-x-2 mt-2">
                          <Badge className={getStatusColor(update.status)} variant="secondary">
                            {update.status.replace('-', ' ')}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {formatDate(update.date)}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {update.progress !== undefined && (
                      <div className="mt-3 space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>{update.progress}%</span>
                        </div>
                        <Progress value={update.progress} className="h-1" />
                      </div>
                    )}
                  </div>
                </div>
                
                {index < recentUpdates.length - 1 && (
                  <Separator className="my-4" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Career Path Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">18</div>
              <p className="text-sm text-gray-600">Skills Developed</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">8</div>
              <p className="text-sm text-gray-600">Milestones Reached</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">3</div>
              <p className="text-sm text-gray-600">Certifications</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">92%</div>
              <p className="text-sm text-gray-600">On Track Rating</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recommended Next Steps</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium">Complete System Design Course</p>
                  <p className="text-sm text-gray-600">Critical for Senior Developer track</p>
                </div>
              </div>
              <Button size="sm">Start Now</Button>
            </div>
            
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                <Award className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium">Schedule 1:1 with Manager</p>
                  <p className="text-sm text-gray-600">Discuss promotion timeline</p>
                </div>
              </div>
              <Button size="sm" variant="outline">Schedule</Button>
            </div>
            
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                <MapPin className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="font-medium">Lead Technical Review Session</p>
                  <p className="text-sm text-gray-600">Demonstrate leadership skills</p>
                </div>
              </div>
              <Button size="sm" variant="outline">Plan Session</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}