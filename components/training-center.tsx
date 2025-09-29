"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, Users, Clock, Star, Play, Download } from "lucide-react"

interface Course {
  id: string
  title: string
  instructor: string
  duration: string
  rating: number
  enrolled: number
  level: string
  category: string
  thumbnail: string
  description: string
  progress?: number
  status: "not-started" | "in-progress" | "completed"
}

interface TrainingCenterProps {
  employeeData: any
}

export function TrainingCenter({ employeeData }: TrainingCenterProps) {
  const courses: Course[] = [
    {
      id: "1",
      title: "Advanced React Patterns",
      instructor: "Sarah Johnson",
      duration: "4.5 hours",
      rating: 4.8,
      enrolled: 1250,
      level: "Advanced",
      category: "Frontend",
      thumbnail: "/placeholder.jpg",
      description: "Master advanced React patterns and best practices",
      progress: 65,
      status: "in-progress"
    },
    {
      id: "2", 
      title: "Leadership in Tech",
      instructor: "Michael Chen",
      duration: "6 hours",
      rating: 4.9,
      enrolled: 890,
      level: "Intermediate",
      category: "Leadership",
      thumbnail: "/placeholder.jpg",
      description: "Develop leadership skills for technical roles",
      status: "not-started"
    },
    {
      id: "3",
      title: "AWS Cloud Architecture",
      instructor: "Jennifer Davis",
      duration: "8 hours", 
      rating: 4.7,
      enrolled: 2100,
      level: "Intermediate",
      category: "Cloud",
      thumbnail: "/placeholder.jpg",
      description: "Design scalable cloud solutions with AWS",
      progress: 100,
      status: "completed"
    },
    {
      id: "4",
      title: "Agile Project Management",
      instructor: "David Wilson",
      duration: "3 hours",
      rating: 4.6,
      enrolled: 1750,
      level: "Beginner",
      category: "Management",
      thumbnail: "/placeholder.jpg", 
      description: "Learn agile methodologies and project management",
      status: "not-started"
    }
  ]

  const getLevelColor = (level: string) => {
    switch (level) {
      case "Beginner": return "bg-green-100 text-green-800"
      case "Intermediate": return "bg-yellow-100 text-yellow-800"
      case "Advanced": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800"
      case "in-progress": return "bg-blue-100 text-blue-800"
      case "not-started": return "bg-gray-100 text-gray-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed": return "Completed"
      case "in-progress": return "In Progress"
      case "not-started": return "Start Course"
      default: return "Unknown"
    }
  }

  const inProgressCourses = courses.filter(course => course.status === "in-progress")
  const completedCourses = courses.filter(course => course.status === "completed")
  const availableCourses = courses.filter(course => course.status === "not-started")

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Training Center</h2>
        <Button variant="outline" size="sm">
          <BookOpen className="h-4 w-4 mr-2" />
          Browse Catalog
        </Button>
      </div>

      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="in-progress">In Progress ({inProgressCourses.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completedCourses.length})</TabsTrigger>
          <TabsTrigger value="explore">Explore</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <BookOpen className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="text-2xl font-bold">{courses.length}</p>
                    <p className="text-sm text-gray-600">Total Courses</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Play className="h-8 w-8 text-orange-600" />
                  <div>
                    <p className="text-2xl font-bold">{inProgressCourses.length}</p>
                    <p className="text-sm text-gray-600">In Progress</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Star className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="text-2xl font-bold">{completedCourses.length}</p>
                    <p className="text-sm text-gray-600">Completed</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Clock className="h-8 w-8 text-purple-600" />
                  <div>
                    <p className="text-2xl font-bold">24h</p>
                    <p className="text-sm text-gray-600">Learning Time</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {inProgressCourses.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Continue Learning</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {inProgressCourses.map((course) => (
                    <div key={course.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                      <div className="flex-shrink-0 w-16 h-16 bg-gray-200 rounded"></div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold">{course.title}</h3>
                        <p className="text-sm text-gray-600">{course.instructor}</p>
                        <div className="mt-2">
                          <Progress value={course.progress || 0} className="h-2" />
                          <p className="text-xs text-gray-500 mt-1">{course.progress}% complete</p>
                        </div>
                      </div>
                      <Button>Continue</Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="in-progress" className="space-y-4">
          <div className="grid gap-4">
            {inProgressCourses.map((course) => (
              <Card key={course.id}>
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-20 h-20 bg-gray-200 rounded"></div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-semibold">{course.title}</h3>
                          <p className="text-sm text-gray-600">{course.instructor}</p>
                          <p className="text-sm text-gray-500 mt-1">{course.description}</p>
                        </div>
                        <div className="flex flex-col items-end space-y-2">
                          <Badge className={getLevelColor(course.level)}>{course.level}</Badge>
                          <div className="flex items-center space-x-1">
                            <Star className="h-4 w-4 text-yellow-400" />
                            <span className="text-sm">{course.rating}</span>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>{course.progress}%</span>
                        </div>
                        <Progress value={course.progress || 0} className="h-2" />
                      </div>
                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            {course.duration}
                          </span>
                          <span className="flex items-center">
                            <Users className="h-4 w-4 mr-1" />
                            {course.enrolled} enrolled
                          </span>
                        </div>
                        <Button>Continue Learning</Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          <div className="grid gap-4">
            {completedCourses.map((course) => (
              <Card key={course.id}>
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-20 h-20 bg-gray-200 rounded"></div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-semibold">{course.title}</h3>
                          <p className="text-sm text-gray-600">{course.instructor}</p>
                          <p className="text-sm text-gray-500 mt-1">{course.description}</p>
                        </div>
                        <div className="flex flex-col items-end space-y-2">
                          <Badge className="bg-green-100 text-green-800">Completed</Badge>
                          <div className="flex items-center space-x-1">
                            <Star className="h-4 w-4 text-yellow-400" />
                            <span className="text-sm">{course.rating}</span>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            {course.duration}
                          </span>
                          <span className="flex items-center">
                            <Users className="h-4 w-4 mr-1" />
                            {course.enrolled} enrolled
                          </span>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-1" />
                            Certificate
                          </Button>
                          <Button variant="outline" size="sm">Review</Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="explore" className="space-y-4">
          <div className="grid gap-4">
            {availableCourses.map((course) => (
              <Card key={course.id}>
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-20 h-20 bg-gray-200 rounded"></div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-semibold">{course.title}</h3>
                          <p className="text-sm text-gray-600">{course.instructor}</p>
                          <p className="text-sm text-gray-500 mt-1">{course.description}</p>
                        </div>
                        <div className="flex flex-col items-end space-y-2">
                          <Badge className={getLevelColor(course.level)}>{course.level}</Badge>
                          <div className="flex items-center space-x-1">
                            <Star className="h-4 w-4 text-yellow-400" />
                            <span className="text-sm">{course.rating}</span>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            {course.duration}
                          </span>
                          <span className="flex items-center">
                            <Users className="h-4 w-4 mr-1" />
                            {course.enrolled} enrolled
                          </span>
                        </div>
                        <Button>Enroll Now</Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}