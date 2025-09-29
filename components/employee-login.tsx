"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User, Mail, Lock, Building, MapPin, Calendar, Briefcase } from "lucide-react"

interface EmployeeLoginProps {
  onLogin: (employeeData: any) => void
}

export default function EmployeeLogin({ onLogin }: EmployeeLoginProps) {
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  })
  const [isLoading, setIsLoading] = useState(false)

  // Demo employee data
  const demoEmployee = {
    id: "emp001",
    name: "Alex Johnson",
    email: "alex.johnson@karanji.com",
    role: "Senior Software Engineer",
    department: "Engineering",
    location: "Hyderabad, India",
    avatar: "/placeholder-user.jpg",
    joinDate: "2022-03-15",
    skills: [
      { name: "React", level: "Expert", progress: 90 },
      { name: "Node.js", level: "Advanced", progress: 85 },
      { name: "TypeScript", level: "Advanced", progress: 80 },
      { name: "Python", level: "Intermediate", progress: 65 }
    ],
    certifications: [
      { name: "AWS Solutions Architect", issuer: "Amazon", date: "2023-08-15" },
      { name: "React Developer", issuer: "Meta", date: "2023-05-20" }
    ],
    currentProjects: [
      { name: "ARIS Platform", progress: 75, deadline: "2025-12-01" }
    ],
    upcomingTraining: [
      { name: "Advanced React Patterns", date: "2025-10-15", provider: "Udemy" },
      { name: "AWS DevOps", date: "2025-11-01", provider: "AWS Training" }
    ]
  }

  const handleLogin = async () => {
    setIsLoading(true)
    
    // Simulate login process
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // For demo purposes, accept any email/password
    if (loginData.email && loginData.password) {
      onLogin(demoEmployee)
    }
    
    setIsLoading(false)
  }

  const handleDemoLogin = () => {
    setLoginData({
      email: 'alex.johnson@karanji.com',
      password: 'demo123'
    })
    onLogin(demoEmployee)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="space-y-1 pb-8">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
              <User className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center text-gray-900">
            Employee Portal
          </CardTitle>
          <p className="text-center text-gray-600">
            Access your career dashboard
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@karanji.com"
                  className="pl-10"
                  value={loginData.email}
                  onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  className="pl-10"
                  value={loginData.password}
                  onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                />
              </div>
            </div>
          </div>

          <Button
            onClick={handleLogin}
            className="w-full"
            disabled={!loginData.email || !loginData.password || isLoading}
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-500">Or</span>
            </div>
          </div>

          <Button
            variant="outline"
            onClick={handleDemoLogin}
            className="w-full"
          >
            Try Demo Account
          </Button>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600 text-center">
              Demo Credentials: alex.johnson@karanji.com / demo123
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}