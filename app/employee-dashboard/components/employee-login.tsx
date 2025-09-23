"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { User, Mail, Building2, Briefcase, AlertCircle, Eye, EyeOff } from "lucide-react"

interface Employee {
  id: string
  name: string
  email: string
  department: string
  position: string
  password: string
}

interface EmployeeLoginProps {
  onLogin: (employeeData: any) => void
}

export default function EmployeeLogin({ onLogin }: EmployeeLoginProps) {
  const [email, setEmail] = useState<string>("")
  const [password, setPassword] = useState<string>("")
  const [showPassword, setShowPassword] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>("")

  const employees: Employee[] = [
    {
      id: "emp_001",
      name: "Ateef Hussain",
      email: "AteefHussain@karanji.com",
      department: "Gen AI Development",
      position: "Gen AI Developer",
      password: "ateef123",
    },
    {
      id: "emp_002",
      name: "Sumith R Naik",
      email: "sumithrnaik@karanji.com",
      department: "Gen AI Development",
      position: "Gen AI Developer",
      password: "sumith123",
    },
    {
      id: "emp_003",
      name: "K Sumanth",
      email: "KSumanth@karanji.com",
      department: "Gen AI Development",
      position: "Gen AI Developer",
      password: "sumanth123",
    },
    {
      id: "emp_004",
      name: "Griffith Sheeba",
      email: "Sheeba@karanji.com",
      department: "Gen AI Development",
      position: "Gen AI Developer",
      password: "sheeba123",
    },
    {
      id: "emp_005",
      name: "Sowmyashree",
      email: "Sowmyashree@karanji.com",
      department: "Gen AI Development",
      position: "Gen AI Developer",
      password: "sowmya123",
    },
    {
      id: "emp_006",
      name: "AthulyaRoy",
      email: "AthulyaRoy@karanji.com",
      department: "Gen AI Development",
      position: "Gen AI Developer",
      password: "athulya123",
    },
    {
      id: "emp_007",
      name: "Shivani",
      email: "Shivani@karanji.com",
      department: "Gen AI Development",
      position: "Gen AI Developer",
      password: "shivani123",
    },
  ]

  const handleLogin = async () => {
    if (!email.trim()) {
      setError("Please enter your email address")
      return
    }

    if (!password.trim()) {
      setError("Please enter your password")
      return
    }

    setIsLoading(true)
    setError("")

    const employee = employees.find((emp) => emp.email.toLowerCase() === email.toLowerCase())

    if (!employee) {
      setError("Email not found. Please check your email address and try again.")
      setIsLoading(false)
      return
    }

    if (employee.password !== password) {
      setError("Incorrect password. Please try again.")
      setIsLoading(false)
      return
    }

    await new Promise((resolve) => setTimeout(resolve, 1000))

    const mockProfileData = {
      id: employee.id,
      name: employee.name,
      email: employee.email,
      department: employee.department,
      position: employee.position,
      photo_url: "/professional-woman-smiling.png",
      years_experience: Math.floor(Math.random() * 4) + 2,
      competency_score: Math.floor(Math.random() * 20) + 75,
      skills: getSkillsForEmployee(employee.id),
      certifications: getCertificationsForEmployee(employee.id),
    }

    onLogin(mockProfileData)
    setIsLoading(false)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleLogin()
    }
  }

  const getSkillsForEmployee = (employeeId: string) => {
    const skillsMap: Record<string, any[]> = {
      emp_001: [
        { name: "Python", category: "Programming", current_level: 90, target_level: 100, is_certified: true },
        { name: "React.js", category: "Frontend", current_level: 85, target_level: 100, is_certified: true },
        { name: "Machine Learning", category: "AI/ML", current_level: 88, target_level: 100, is_certified: false },
      ],
      emp_002: [
        { name: "Java", category: "Programming", current_level: 92, target_level: 100, is_certified: true },
        { name: "Node.js", category: "Backend", current_level: 87, target_level: 100, is_certified: false },
        { name: "Data Science", category: "Analytics", current_level: 83, target_level: 100, is_certified: true },
      ],
      emp_003: [
        { name: "C++ Programming", category: "Programming", current_level: 89, target_level: 100, is_certified: false },
        { name: "Python", category: "Programming", current_level: 91, target_level: 100, is_certified: true },
        { name: "Machine Learning", category: "AI/ML", current_level: 86, target_level: 100, is_certified: true },
      ],
      emp_004: [
        { name: "React.js", category: "Frontend", current_level: 88, target_level: 100, is_certified: true },
        { name: "C Programming", category: "Programming", current_level: 84, target_level: 100, is_certified: false },
        { name: "MongoDB", category: "Database", current_level: 79, target_level: 100, is_certified: false },
      ],
      emp_005: [
        { name: "AWS", category: "Cloud", current_level: 93, target_level: 100, is_certified: true },
        { name: "React", category: "Frontend", current_level: 86, target_level: 100, is_certified: false },
        { name: "Java", category: "Programming", current_level: 82, target_level: 100, is_certified: true },
      ],
      emp_006: [
        { name: "Next.js", category: "Frontend", current_level: 90, target_level: 100, is_certified: false },
        { name: "Python", category: "Programming", current_level: 87, target_level: 100, is_certified: true },
        { name: "SQL", category: "Database", current_level: 85, target_level: 100, is_certified: true },
      ],
      emp_007: [
        { name: "C#", category: "Programming", current_level: 89, target_level: 100, is_certified: false },
        { name: "AWS", category: "Cloud", current_level: 91, target_level: 100, is_certified: true },
        { name: "Machine Learning", category: "AI/ML", current_level: 84, target_level: 100, is_certified: false },
      ],
    }

    return skillsMap[employeeId] || []
  }

  const getCertificationsForEmployee = (employeeId: string) => {
    const certificationsMap: Record<string, any[]> = {
      emp_001: [
        {
          name: "AWS Certification",
          issuer: "Amazon",
          issue_date: "2023-08-15",
          expiry_date: "2025-08-15",
          status: "active",
        },
        {
          name: "Microsoft Azure",
          issuer: "Microsoft",
          issue_date: "2023-06-20",
          expiry_date: "2025-06-20",
          status: "active",
        },
      ],
      emp_002: [
        {
          name: "JavaScript Expert",
          issuer: "JavaScript Institute",
          issue_date: "2023-07-10",
          expiry_date: "2025-07-10",
          status: "active",
        },
        {
          name: "Python Development",
          issuer: "Python Foundation",
          issue_date: "2023-05-15",
          expiry_date: "2025-05-15",
          status: "active",
        },
      ],
      emp_003: [
        {
          name: "Google Certification",
          issuer: "Google",
          issue_date: "2023-09-01",
          expiry_date: "2025-09-01",
          status: "active",
        },
        {
          name: "Advanced React Patterns",
          issuer: "React Academy",
          issue_date: "2023-04-20",
          expiry_date: "2025-04-20",
          status: "active",
        },
      ],
      emp_004: [
        {
          name: "AWS Certification",
          issuer: "Amazon",
          issue_date: "2023-07-25",
          expiry_date: "2025-07-25",
          status: "active",
        },
        {
          name: "Microsoft Azure",
          issuer: "Microsoft",
          issue_date: "2023-03-12",
          expiry_date: "2025-03-12",
          status: "active",
        },
      ],
      emp_005: [
        {
          name: "Data Science",
          issuer: "Data Science Institute",
          issue_date: "2023-08-30",
          expiry_date: "2025-08-30",
          status: "active",
        },
        {
          name: "Machine Learning",
          issuer: "ML Academy",
          issue_date: "2023-06-05",
          expiry_date: "2025-06-05",
          status: "active",
        },
      ],
      emp_006: [
        {
          name: "Google Certification",
          issuer: "Google",
          issue_date: "2023-05-20",
          expiry_date: "2025-05-20",
          status: "active",
        },
        {
          name: "JavaScript Expert",
          issuer: "JavaScript Institute",
          issue_date: "2023-07-15",
          expiry_date: "2025-07-15",
          status: "active",
        },
      ],
      emp_007: [
        {
          name: "AWS Certification",
          issuer: "Amazon",
          issue_date: "2023-09-10",
          expiry_date: "2025-09-10",
          status: "active",
        },
        {
          name: "Microsoft Azure",
          issuer: "Microsoft",
          issue_date: "2023-04-25",
          expiry_date: "2025-04-25",
          status: "active",
        },
      ],
    }

    return certificationsMap[employeeId] || []
  }

  const matchedEmployee = employees.find((emp) => emp.email.toLowerCase() === email.toLowerCase())

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
            <User className="w-8 h-8 text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-gray-900">Employee Login</CardTitle>
            <CardDescription className="text-gray-600">Enter your credentials to access the dashboard</CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Email Address</label>
              <Input
                type="email"
                placeholder="Enter your email address..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Password</label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full pr-10"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center space-x-2 text-sm text-red-600">
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </div>
            )}
          </div>

          {matchedEmployee && !error && (
            <div className="bg-green-50 rounded-lg p-4 space-y-3">
              <div className="text-sm font-medium text-gray-900 mb-2">Employee Found:</div>
              <div className="text-sm font-semibold text-green-700">{matchedEmployee.name}</div>
              <div className="flex items-center space-x-2 text-sm text-gray-700">
                <Mail className="w-4 h-4 text-green-600" />
                <span>{matchedEmployee.email}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-700">
                <Building2 className="w-4 h-4 text-green-600" />
                <span>{matchedEmployee.department}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-700">
                <Briefcase className="w-4 h-4 text-green-600" />
                <span>{matchedEmployee.position}</span>
              </div>
            </div>
          )}

          <Button
            onClick={handleLogin}
            disabled={!email.trim() || !password.trim() || isLoading}
            className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium py-2.5"
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Logging in...</span>
              </div>
            ) : (
              "Access Dashboard"
            )}
          </Button>

          <div className="text-center">
            <p className="text-xs text-gray-500 mb-2">Demo Credentials:</p>
            <div className="text-xs text-gray-600 space-y-1">
              <p>
                <strong>Email:</strong> AteefHussain@karanji.com
              </p>
              <p>
                <strong>Password:</strong> ateef123
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
