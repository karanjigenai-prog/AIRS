"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { BookOpen, Clock, Users, Star, Search, Play, CheckCircle, Award, Calendar, Lock } from "lucide-react"
interface EmployeeData {
  id: string;
  name: string;
  // Add other fields as needed
}

interface TrainingCenterProps {
  employee: EmployeeData;
}

export function TrainingCenter({ employee }: TrainingCenterProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")

  const inProgressCourses = [
    {
      id: 1,
      title: "Advanced React Patterns",
      provider: "Tech Academy",
      progress: 65,
      totalLessons: 24,
      completedLessons: 16,
      estimatedTime: "2 hours remaining",
      category: "Frontend",
    },
    {
      id: 2,
      title: "AWS Solutions Architecture",
      provider: "Amazon Web Services",
      progress: 40,
      totalLessons: 18,
      completedLessons: 7,
      estimatedTime: "4 hours remaining",
      category: "Cloud",
    },
    {
      id: 3,
      title: "Leadership Fundamentals",
      provider: "Management Institute",
      progress: 80,
      totalLessons: 12,
      completedLessons: 10,
      estimatedTime: "1 hour remaining",
      category: "Leadership",
    },
  ]

  const availableCourses = [
    {
      id: 4,
      title: "Machine Learning Fundamentals",
      provider: "AI Institute",
      duration: "8 weeks",
      rating: 4.8,
      students: 1250,
      price: "Free",
      type: "free",
      category: "AI/ML",
      description: "Learn the basics of machine learning and data science",
      skills: ["Python", "TensorFlow", "Data Analysis"],
    },
    {
      id: 5,
      title: "Advanced TypeScript",
      provider: "Code Masters",
      duration: "4 weeks",
      rating: 4.9,
      students: 890,
      price: "$199",
      type: "paid",
      category: "Programming",
      description: "Master advanced TypeScript concepts and patterns",
      skills: ["TypeScript", "Advanced Patterns", "Type Safety"],
    },
    {
      id: 6,
      title: "DevOps with Kubernetes",
      provider: "Cloud Native Academy",
      duration: "6 weeks",
      rating: 4.7,
      students: 2100,
      price: "$299",
      type: "paid",
      category: "DevOps",
      description: "Complete guide to container orchestration with Kubernetes",
      skills: ["Kubernetes", "Docker", "CI/CD"],
    },
    {
      id: 7,
      title: "UX Design Principles",
      provider: "Design School",
      duration: "5 weeks",
      rating: 4.6,
      students: 750,
      price: "Free",
      type: "free",
      category: "Design",
      description: "Learn fundamental UX design principles and methodologies",
      skills: ["User Research", "Wireframing", "Prototyping"],
    },
    {
      id: 8,
      title: "Project Management Professional",
      provider: "PM Institute",
      duration: "12 weeks",
      rating: 4.8,
      students: 1800,
      price: "$499",
      type: "paid",
      category: "Management",
      description: "Comprehensive PMP certification preparation course",
      skills: ["Project Planning", "Risk Management", "Team Leadership"],
    },
  ]

  const categories = [
    "all",
    "Programming",
    "Frontend",
    "Backend",
    "Cloud",
    "AI/ML",
    "DevOps",
    "Design",
    "Management",
    "Leadership",
  ]

  const filteredCourses = availableCourses.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || course.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleEnrollment = (course: any) => {
    if (course.type === "free") {
      // Direct enrollment for free courses
      alert(`Enrolled in ${course.title}! You can start learning immediately.`)
    } else {
      // Request manager approval for paid courses
      alert(`Enrollment request for ${course.title} has been sent to your manager for approval.`)
    }
  }

  return (
    <div className="space-y-6">
      {/* Training Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">12</p>
                <p className="text-xs text-muted-foreground">Completed Courses</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-secondary/5 to-secondary/10 border-secondary/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-secondary/10 rounded-lg">
                <Play className="h-5 w-5 text-secondary" />
              </div>
              <div>
                <p className="text-2xl font-bold">3</p>
                <p className="text-xs text-muted-foreground">In Progress</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-chart-1/5 to-chart-1/10 border-chart-1/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-chart-1/10 rounded-lg">
                <Award className="h-5 w-5 text-chart-1" />
              </div>
              <div>
                <p className="text-2xl font-bold">8</p>
                <p className="text-xs text-muted-foreground">Certificates Earned</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-chart-2/5 to-chart-2/10 border-chart-2/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-chart-2/10 rounded-lg">
                <Clock className="h-5 w-5 text-chart-2" />
              </div>
              <div>
                <p className="text-2xl font-bold">45h</p>
                <p className="text-xs text-muted-foreground">Learning Hours</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Courses in Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5 text-primary" />
            Courses in Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {inProgressCourses.map((course) => (
              <div key={course.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium">{course.title}</h4>
                  <p className="text-sm text-muted-foreground">{course.provider}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-2">
                      <Progress value={course.progress} className="w-24 h-2" />
                      <span className="text-sm text-muted-foreground">{course.progress}%</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {course.completedLessons}/{course.totalLessons} lessons
                    </Badge>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {course.estimatedTime}
                    </div>
                  </div>
                </div>
                <Button size="sm">Continue</Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Browse Training Courses */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5 text-primary" />
            Browse Training Courses
          </CardTitle>
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className="capitalize"
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <Card key={course.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg leading-tight">{course.title}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">{course.provider}</p>
                    </div>
                    <Badge
                      variant={course.type === "free" ? "secondary" : "outline"}
                      className={course.type === "free" ? "bg-primary/10 text-primary" : ""}
                    >
                      {course.type === "free" ? (
                        <>
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Free
                        </>
                      ) : (
                        <>
                          <Lock className="w-3 h-3 mr-1" />
                          {course.price}
                        </>
                      )}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">{course.description}</p>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span>{course.rating}</span>
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Users className="w-4 h-4" />
                        <span>{course.students.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <span>{course.duration}</span>
                      </div>
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground mb-2">Skills you'll learn:</p>
                      <div className="flex flex-wrap gap-1">
                        {course.skills.map((skill, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <Button
                      className="w-full"
                      onClick={() => handleEnrollment(course)}
                      variant={course.type === "free" ? "default" : "outline"}
                    >
                      {course.type === "free" ? "Enroll Now" : "Request Approval"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
