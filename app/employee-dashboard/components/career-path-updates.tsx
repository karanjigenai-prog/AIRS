"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Target,
  Calendar,
  CheckCircle,
  Clock,
  AlertTriangle,
  TrendingUp,
  Award,
  BookOpen,
  ArrowRight,
  Star,
} from "lucide-react"
  interface EmployeeData {
    id: string;
    name: string;
    // Add other fields as needed
  }

  interface CareerPathUpdatesProps {
    employee: EmployeeData;
  }

  export function CareerPathUpdates({ employee }: CareerPathUpdatesProps) {
  const [selectedPath, setSelectedPath] = useState("technical-lead")

  const careerPaths = [
    {
      id: "technical-lead",
      title: "Technical Lead",
      currentLevel: "Senior Developer",
      targetLevel: "Technical Lead",
      progress: 75,
      estimatedCompletion: "6-8 months",
      priority: "high",
    },
    {
      id: "full-stack-architect",
      title: "Full Stack Architect",
      currentLevel: "Senior Developer",
      targetLevel: "Solutions Architect",
      progress: 45,
      estimatedCompletion: "12-15 months",
      priority: "medium",
    },
    {
      id: "engineering-manager",
      title: "Engineering Manager",
      currentLevel: "Senior Developer",
      targetLevel: "Engineering Manager",
      progress: 30,
      estimatedCompletion: "18-24 months",
      priority: "low",
    },
  ]

  const requiredSkills = [
    {
      skill: "Team Leadership",
      currentLevel: 60,
      requiredLevel: 85,
      status: "in-progress",
      deadline: "2024-06-15",
      resources: ["Leadership Fundamentals Course", "Mentoring Program", "Management Workshop"],
    },
    {
      skill: "System Architecture",
      currentLevel: 70,
      requiredLevel: 90,
      status: "in-progress",
      deadline: "2024-07-30",
      resources: ["Architecture Patterns Course", "Design Review Sessions", "Technical Documentation"],
    },
    {
      skill: "Project Management",
      currentLevel: 45,
      requiredLevel: 80,
      status: "not-started",
      deadline: "2024-08-15",
      resources: ["PMP Certification", "Agile Methodology Course", "Project Planning Tools"],
    },
    {
      skill: "Technical Mentoring",
      currentLevel: 80,
      requiredLevel: 85,
      status: "almost-complete",
      deadline: "2024-05-30",
      resources: ["Mentoring Best Practices", "Code Review Guidelines", "Knowledge Sharing Sessions"],
    },
    {
      skill: "Strategic Planning",
      currentLevel: 25,
      requiredLevel: 75,
      status: "not-started",
      deadline: "2024-09-30",
      resources: ["Strategic Thinking Course", "Business Analysis", "Roadmap Planning Workshop"],
    },
  ]

  const milestones = [
    {
      id: 1,
      title: "Complete Leadership Training",
      description: "Finish the Leadership Fundamentals course and apply learnings",
      status: "completed",
      completedDate: "2024-02-15",
      points: 100,
    },
    {
      id: 2,
      title: "Lead Cross-functional Project",
      description: "Successfully lead a project involving multiple teams",
      status: "in-progress",
      progress: 70,
      deadline: "2024-05-30",
      points: 150,
    },
    {
      id: 3,
      title: "Mentor Junior Developers",
      description: "Actively mentor 2-3 junior developers for 6 months",
      status: "in-progress",
      progress: 85,
      deadline: "2024-06-15",
      points: 120,
    },
    {
      id: 4,
      title: "Architecture Review Participation",
      description: "Participate in 5 architecture review sessions",
      status: "not-started",
      deadline: "2024-07-30",
      points: 80,
    },
    {
      id: 5,
      title: "Technical Presentation",
      description: "Present technical solution to stakeholders",
      status: "not-started",
      deadline: "2024-08-15",
      points: 100,
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-primary text-primary-foreground"
      case "in-progress":
        return "bg-secondary text-secondary-foreground"
      case "almost-complete":
        return "bg-chart-1 text-white"
      case "not-started":
        return "bg-muted text-muted-foreground"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4" />
      case "in-progress":
        return <Clock className="w-4 h-4" />
      case "almost-complete":
        return <TrendingUp className="w-4 h-4" />
      case "not-started":
        return <AlertTriangle className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  const selectedPathData = careerPaths.find((path) => path.id === selectedPath)

  return (
    <div className="space-y-6">
      {/* Career Path Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Active Career Paths
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {careerPaths.map((path) => (
              <Card
                key={path.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedPath === path.id ? "border-primary bg-primary/5" : ""
                }`}
                onClick={() => setSelectedPath(path.id)}
              >
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">{path.title}</h3>
                      <Badge
                        variant="outline"
                        className={
                          path.priority === "high"
                            ? "border-red-200 text-red-700 bg-red-50"
                            : path.priority === "medium"
                              ? "border-yellow-200 text-yellow-700 bg-yellow-50"
                              : "border-blue-200 text-blue-700 bg-blue-50"
                        }
                      >
                        {path.priority} priority
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{path.currentLevel}</span>
                        <ArrowRight className="w-3 h-3" />
                        <span className="font-medium text-foreground">{path.targetLevel}</span>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>{path.progress}%</span>
                        </div>
                        <Progress value={path.progress} className="h-2" />
                      </div>

                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        <span>ETA: {path.estimatedCompletion}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Required Skills & Deadlines */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            Required Skills & Deadlines - {selectedPathData?.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {requiredSkills.map((skill, index) => (
              <div key={index} className="border border-border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <h4 className="font-medium">{skill.skill}</h4>
                    <Badge className={getStatusColor(skill.status)}>
                      {getStatusIcon(skill.status)}
                      <span className="ml-1 capitalize">{skill.status.replace("-", " ")}</span>
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>Due: {new Date(skill.deadline).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Current Level: {skill.currentLevel}%</span>
                    <span className="text-sm">Required: {skill.requiredLevel}%</span>
                  </div>
                  <Progress value={(skill.currentLevel / skill.requiredLevel) * 100} className="h-2" />

                  <div>
                    <p className="text-sm font-medium mb-2">Recommended Resources:</p>
                    <div className="flex flex-wrap gap-2">
                      {skill.resources.map((resource, resourceIndex) => (
                        <Badge key={resourceIndex} variant="outline" className="text-xs">
                          {resource}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      View Resources
                    </Button>
                    <Button size="sm">Start Learning</Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Career Milestones */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            Career Milestones & Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {milestones.map((milestone, index) => (
              <div key={milestone.id} className="flex items-start gap-4 p-4 border border-border rounded-lg">
                <div className="flex-shrink-0 mt-1">
                  {milestone.status === "completed" ? (
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-primary-foreground" />
                    </div>
                  ) : milestone.status === "in-progress" ? (
                    <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
                      <Clock className="w-4 h-4 text-secondary-foreground" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                      <Target className="w-4 h-4 text-muted-foreground" />
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{milestone.title}</h4>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        <Star className="w-3 h-3 mr-1" />
                        {milestone.points} pts
                      </Badge>
                      {milestone.status === "completed" && (
                        <Badge className="bg-primary text-primary-foreground text-xs">Completed</Badge>
                      )}
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground mb-3">{milestone.description}</p>

                  {milestone.status === "in-progress" && milestone.progress && (
                    <div className="space-y-2 mb-3">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{milestone.progress}%</span>
                      </div>
                      <Progress value={milestone.progress} className="h-2" />
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      {milestone.status === "completed" ? (
                        <span>Completed: {new Date(milestone.completedDate!).toLocaleDateString()}</span>
                      ) : (
                        <span>Deadline: {new Date(milestone.deadline!).toLocaleDateString()}</span>
                      )}
                    </div>
                    {milestone.status !== "completed" && (
                      <Button size="sm" variant="outline">
                        View Details
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Career Progress Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="p-6 text-center">
            <div className="space-y-2">
              <div className="text-3xl font-bold text-primary">550</div>
              <div className="text-sm text-muted-foreground">Total Career Points</div>
              <div className="text-xs text-muted-foreground">+150 this month</div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-secondary/5 to-secondary/10 border-secondary/20">
          <CardContent className="p-6 text-center">
            <div className="space-y-2">
              <div className="text-3xl font-bold text-secondary">2</div>
              <div className="text-sm text-muted-foreground">Milestones Completed</div>
              <div className="text-xs text-muted-foreground">3 in progress</div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-chart-1/5 to-chart-1/10 border-chart-1/20">
          <CardContent className="p-6 text-center">
            <div className="space-y-2">
              <div className="text-3xl font-bold text-chart-1">75%</div>
              <div className="text-sm text-muted-foreground">Path Completion</div>
              <div className="text-xs text-muted-foreground">6-8 months remaining</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
