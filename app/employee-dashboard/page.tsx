"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card"
import { Button } from "./components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "./components/ui/avatar"
import { Badge } from "./components/ui/badge"
import { Progress } from "./components/ui/progress"
import { AnimatedCounter } from "./components/ui/animated-counter"
import { SkillProgressRing } from "./components/ui/skill-progress-ring"
import { NotificationToast } from "./components/notification-toast"
import EmployeeLogin from "./components/employee-login"
import AdminPanel from "./components/admin-panel"
import {
  User,
  BookOpen,
  TrendingUp,
  Award,
  Menu,
  X,
  Target,
  Calendar,
  BarChart3,
  GraduationCap,
  Star,
  Clock,
  CheckCircle,
  Bell,
  Settings,
  LogOut,
  Shield,
} from "lucide-react"
import { PersonalCompetency } from "./components/personal-competency"
import { TrainingCenter } from "./components/training-center"
import { CareerPathUpdates } from "./components/career-path-updates"
import { TrendsInsights } from "./components/trends-insights"

interface EmployeeData {
  id: string
  name: string
  email: string
  department: string
  position: string
  photo_url?: string
  years_experience: number
  competency_score: number
  skills: Array<{
    name: string
    category: string
    current_level: number
    target_level: number
    is_certified: boolean
  }>
  certifications: Array<{
    name: string
    issuer: string
    issue_date: string
    expiry_date: string
    status: string
  }>
}

export default function EmployeeDashboard() {
  const [activeSection, setActiveSection] = useState("overview")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showNotification, setShowNotification] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [employee, setEmployee] = useState<EmployeeData | null>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isAdminMode, setIsAdminMode] = useState(false)

  const navigationItems = [
    { id: "overview", label: "Dashboard Overview", icon: BarChart3 },
    { id: "competency", label: "Personal Competency", icon: User },
    { id: "training", label: "Training Center", icon: BookOpen },
    { id: "career", label: "Career Path Updates", icon: TrendingUp },
    { id: "insights", label: "Trends & Insights", icon: Award },
    { id: "admin", label: "Admin Panel", icon: Shield, adminOnly: true },
  ]

  const handleLogin = (employeeData: EmployeeData) => {
    setEmployee(employeeData)
    setIsLoggedIn(true)
    setIsLoading(false)
    setShowNotification(true)

    const adminEmails = ["admin@karanji.com", "AteefHussain@karanji.com"] // Demo admin access
    setIsAdminMode(adminEmails.includes(employeeData.email))
  }

  const handleLogout = () => {
    setEmployee(null)
    setIsLoggedIn(false)
    setActiveSection("overview")
    setShowNotification(false)
    setIsAdminMode(false)
  }

  const toggleAdminMode = () => {
    if (isAdminMode) {
      setActiveSection("admin")
    }
  }

  useEffect(() => {
    if (isLoggedIn && employee) {
      const timer = setTimeout(() => {
        setShowNotification(true)
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [isLoggedIn, employee])

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.altKey && isLoggedIn) {
        const keyMap: { [key: string]: string } = {
          "1": "overview",
          "2": "competency",
          "3": "training",
          "4": "career",
          "5": "insights",
          "6": isAdminMode ? "admin" : "",
        }

        if (keyMap[e.key] && keyMap[e.key] !== "") {
          setActiveSection(keyMap[e.key])
          e.preventDefault()
        }
      }
    }

    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [isLoggedIn, isAdminMode])

  if (!isLoggedIn || !employee) {
    return <EmployeeLogin onLogin={handleLogin} />
  }

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto"></div>
            <p className="text-muted-foreground">Loading your dashboard...</p>
          </div>
        </div>
      )
    }

    switch (activeSection) {
      case "competency":
        return <PersonalCompetency employee={employee} />
      case "training":
        return <TrainingCenter employee={employee} />
      case "career":
        return <CareerPathUpdates employee={employee} />
      case "insights":
        return <TrendsInsights />
      case "admin":
        return isAdminMode ? <AdminPanel /> : <div className="text-center p-8 text-muted-foreground">Access Denied</div>
      default:
        return (
          <div className="space-y-6">
            <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20 hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <div className="relative">
                    <Avatar className="h-24 w-24 border-4 border-primary/20">
                      <AvatarImage src={employee.photo_url || "/professional-woman-smiling.png"} alt={employee.name} />
                      <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                        {employee.name.split(" ").map((n) => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-2 -right-2 bg-primary rounded-full p-1">
                      <CheckCircle className="h-4 w-4 text-primary-foreground" />
                    </div>
                  </div>
                  <div className="text-center md:text-left flex-1">
                    <h2 className="text-3xl font-bold text-foreground mb-2">{employee.name}</h2>
                    <p className="text-lg text-muted-foreground mb-4">{employee.department}</p>
                    <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                      <Badge variant="secondary" className="bg-primary/10 text-primary animate-pulse">
                        <Star className="w-3 h-3 mr-1" />
                        {employee.position}
                      </Badge>
                      <Badge variant="outline">
                        <Clock className="w-3 h-3 mr-1" />
                        {Math.floor(employee.years_experience)} Years Experience
                      </Badge>
                      {isAdminMode && (
                        <Badge variant="default" className="bg-orange-500 hover:bg-orange-600">
                          <Shield className="w-3 h-3 mr-1" />
                          Admin Access
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="text-center">
                    <SkillProgressRing progress={employee.competency_score} size={100}>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">
                          <AnimatedCounter value={employee.competency_score} />
                        </div>
                        <div className="text-xs text-muted-foreground">Score</div>
                      </div>
                    </SkillProgressRing>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer hover:scale-105 group" onClick={() => setActiveSection("competency")}> 
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-primary transition-colors">Skills & Certification</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                      <GraduationCap className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">
                        <AnimatedCounter value={employee.skills.length} />
                      </p>
                      <p className="text-xs text-muted-foreground">Active Skills</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Avg Level</span>
                      <span>
                        {Math.round(employee.skills.reduce((acc, skill) => acc + skill.current_level, 0) / employee.skills.length)}%
                      </span>
                    </div>
                    <Progress value={Math.round(employee.skills.reduce((acc, skill) => acc + skill.current_level, 0) / employee.skills.length)} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer hover:scale-105 group" onClick={() => setActiveSection("competency")}> 
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-secondary transition-colors">Certifications, Experience Level</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-secondary/10 rounded-lg group-hover:bg-secondary/20 transition-colors">
                      <Award className="h-5 w-5 text-secondary" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">
                        <AnimatedCounter value={employee.certifications.length} />
                      </p>
                      <p className="text-xs text-muted-foreground">Certifications</p>
                    </div>
                  </div>
                  <div className="mt-4 space-y-2">
                    {employee.certifications.slice(0, 2).map((cert, index) => (
                      <Badge key={index} variant="outline" className="text-xs animate-in fade-in-50" style={{ animationDelay: `${index * 200}ms` }}>{cert.name}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer hover:scale-105 group" onClick={() => setActiveSection("competency")}> 
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-chart-1 transition-colors">AI-calculated Competency Score</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-chart-1/10 rounded-lg group-hover:bg-chart-1/20 transition-colors">
                      <Target className="h-5 w-5 text-chart-1" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">
                        <AnimatedCounter value={employee.competency_score} />
                      </p>
                      <p className="text-xs text-muted-foreground">Overall Score</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Performance</span>
                      <span className="text-primary font-medium">
                        {employee.competency_score >= 90
                          ? "Excellent"
                          : employee.competency_score >= 80
                            ? "Very Good"
                            : employee.competency_score >= 70
                              ? "Good"
                              : "Developing"}
                      </span>
                    </div>
                    <Progress value={employee.competency_score} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer hover:scale-105 group" onClick={() => setActiveSection("career")}> 
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-chart-2 transition-colors">Career Path Recommendations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-chart-2/10 rounded-lg group-hover:bg-chart-2/20 transition-colors">
                      <TrendingUp className="h-5 w-5 text-chart-2" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">
                        <AnimatedCounter value={3} />
                      </p>
                      <p className="text-xs text-muted-foreground">Active Paths</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-sm text-muted-foreground">Next milestone:</p>
                    <p className="text-sm font-medium">Senior {employee.position}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2 bg-transparent hover:bg-primary/5 hover:border-primary/50 transition-all group" onClick={() => setActiveSection("training")}> 
                    <BookOpen className="h-6 w-6 text-primary group-hover:scale-110 transition-transform" />
                    <span>Browse Training</span>
                  </Button>
                  <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2 bg-transparent hover:bg-primary/5 hover:border-primary/50 transition-all group" onClick={() => setActiveSection("competency")}> 
                    <User className="h-6 w-6 text-primary group-hover:scale-110 transition-transform" />
                    <span>Update Skills</span>
                  </Button>
                  <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2 bg-transparent hover:bg-primary/5 hover:border-primary/50 transition-all group" onClick={() => setActiveSection("insights")}> 
                    <BarChart3 className="h-6 w-6 text-primary group-hover:scale-110 transition-transform" />
                    <span>View Analytics</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {showNotification && (
        <NotificationToast
          title={`Welcome back, ${employee.name.split(" ")[0]}!`}
          message="Your dashboard has been updated with the latest data and recommendations."
          type="reminder"
          onClose={() => setShowNotification(false)}
        />
      )}

      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <div
        className={`fixed left-0 top-0 h-full w-64 bg-sidebar border-r border-sidebar-border z-50 transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-xl font-bold text-sidebar-foreground">Employee Portal</h1>
            <Button variant="ghost" size="sm" className="lg:hidden" onClick={() => setSidebarOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <nav className="space-y-2">
            {navigationItems.map((item, index) => {
              const Icon = item.icon
              if (item.adminOnly && !isAdminMode) return null

              return (
                <Button
                  key={item.id}
                  variant={activeSection === item.id ? "default" : "ghost"}
                  className={`w-full justify-start gap-3 transition-all hover:scale-105 ${
                    activeSection === item.id
                      ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-md"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  }`}
                  onClick={() => {
                    setActiveSection(item.id)
                    setSidebarOpen(false)
                  }}
                  title={`${item.label} (Alt+${index + 1})`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Button>
              )
            })}
          </nav>

          <div className="absolute bottom-6 left-6 right-6">
            <div className="border-t border-sidebar-border pt-4">
              <div className="flex items-center gap-3 mb-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={employee.photo_url || "/professional-woman-smiling.png"} alt={employee.name} />
                  <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                    {employee.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-sidebar-foreground truncate">{employee.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{employee.department}</p>
                </div>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" className="flex-1 h-8 px-2">
                  <Settings className="h-3 w-3" />
                </Button>
                <Button variant="ghost" size="sm" className="flex-1 h-8 px-2" onClick={handleLogout}>
                  <LogOut className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="lg:ml-64">
        <header className="bg-card border-b border-border p-4 sticky top-0 z-30 backdrop-blur-sm bg-card/95">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" className="lg:hidden" onClick={() => setSidebarOpen(true)}>
                <Menu className="h-4 w-4" />
              </Button>
              <h1 className="text-2xl font-bold text-card-foreground">
                {navigationItems.find((item) => item.id === activeSection)?.label || "Employee Dashboard"}
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-4 w-4" />
                <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full text-xs flex items-center justify-center text-white">
                  2
                </span>
              </Button>
              <Badge variant="outline" className="hidden sm:flex">
                <Calendar className="w-3 h-3 mr-1" />
                {new Date().toLocaleDateString()}
              </Badge>
            </div>
          </div>
        </header>

        <main className="p-6">{renderContent()}</main>
      </div>
    </div>
  )
}
