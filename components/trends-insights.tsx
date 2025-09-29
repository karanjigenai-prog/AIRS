"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TrendingUp, TrendingDown, BarChart3, Users, Target, Calendar, ArrowUpRight, ArrowDownRight, Minus } from "lucide-react"

interface TrendData {
  label: string
  value: number
  change: number
  changeType: "increase" | "decrease" | "stable"
  period: string
}

interface SkillTrend {
  skill: string
  demand: number
  growth: number
  difficulty: "Low" | "Medium" | "High"
  timeToMaster: string
  relatedRoles: string[]
}

interface TeamInsight {
  title: string
  description: string
  impact: "High" | "Medium" | "Low"
  category: string
  recommendation: string
}

interface TrendsInsightsProps {
  employeeData: any
}

export function TrendsInsights({ employeeData }: TrendsInsightsProps) {
  const skillTrends: SkillTrend[] = [
    {
      skill: "AI/Machine Learning",
      demand: 95,
      growth: 45,
      difficulty: "High",
      timeToMaster: "12-18 months",
      relatedRoles: ["ML Engineer", "Data Scientist", "AI Researcher"]
    },
    {
      skill: "Cloud Architecture",
      demand: 88,
      growth: 32,
      difficulty: "Medium",
      timeToMaster: "6-9 months",
      relatedRoles: ["Cloud Architect", "DevOps Engineer", "Solutions Architect"]
    },
    {
      skill: "Cybersecurity",
      demand: 91,
      growth: 38,
      difficulty: "High",
      timeToMaster: "9-12 months",
      relatedRoles: ["Security Engineer", "Security Analyst", "CISO"]
    },
    {
      skill: "React/Frontend",
      demand: 82,
      growth: 15,
      difficulty: "Medium",
      timeToMaster: "4-6 months",
      relatedRoles: ["Frontend Developer", "Full Stack Developer", "UI Engineer"]
    }
  ]

  const performanceTrends: TrendData[] = [
    { label: "Skill Completion Rate", value: 87, change: 12, changeType: "increase", period: "vs last quarter" },
    { label: "Learning Hours/Week", value: 8.5, change: -0.8, changeType: "decrease", period: "vs last month" },
    { label: "Course Engagement", value: 92, change: 5, changeType: "increase", period: "vs last quarter" },
    { label: "Peer Collaboration", value: 76, change: 0, changeType: "stable", period: "vs last month" }
  ]

  const teamInsights: TeamInsight[] = [
    {
      title: "Frontend Skills Gap Identified",
      description: "Team lacks advanced React patterns expertise for upcoming projects",
      impact: "High",
      category: "Skills Gap",
      recommendation: "Recommend React Advanced Patterns training for 3-4 team members"
    },
    {
      title: "High Engagement in Cloud Training", 
      description: "80% of team actively pursuing cloud certifications",
      impact: "Medium",
      category: "Positive Trend",
      recommendation: "Consider establishing Cloud Center of Excellence"
    },
    {
      title: "Leadership Development Opportunity",
      description: "Senior developers ready for leadership training programs", 
      impact: "High",
      category: "Career Growth",
      recommendation: "Enroll qualified candidates in leadership development track"
    }
  ]

  const getTrendIcon = (changeType: string) => {
    switch (changeType) {
      case "increase": return <ArrowUpRight className="h-4 w-4 text-green-600" />
      case "decrease": return <ArrowDownRight className="h-4 w-4 text-red-600" />
      case "stable": return <Minus className="h-4 w-4 text-gray-600" />
      default: return <Minus className="h-4 w-4" />
    }
  }

  const getTrendColor = (changeType: string) => {
    switch (changeType) {
      case "increase": return "text-green-600"
      case "decrease": return "text-red-600"
      case "stable": return "text-gray-600"
      default: return "text-gray-600"
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Low": return "bg-green-100 text-green-800"
      case "Medium": return "bg-yellow-100 text-yellow-800"
      case "High": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "High": return "bg-red-100 text-red-800"
      case "Medium": return "bg-yellow-100 text-yellow-800"
      case "Low": return "bg-green-100 text-green-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Trends & Insights</h2>
        <Button variant="outline" size="sm">
          <BarChart3 className="h-4 w-4 mr-2" />
          Full Analytics
        </Button>
      </div>

      <Tabs defaultValue="skills" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="skills">Skill Trends</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="team">Team Insights</TabsTrigger>
          <TabsTrigger value="market">Market Data</TabsTrigger>
        </TabsList>

        <TabsContent value="skills" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Trending Skills in Your Field
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {skillTrends.map((trend, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold">{trend.skill}</h3>
                        <Badge className={getDifficultyColor(trend.difficulty)}>
                          {trend.difficulty}
                        </Badge>
                      </div>
                      <div className="mt-2 grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Demand</p>
                          <p className="font-medium">{trend.demand}%</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Growth</p>
                          <p className="font-medium text-green-600">+{trend.growth}%</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Time to Master</p>
                          <p className="font-medium">{trend.timeToMaster}</p>
                        </div>
                      </div>
                      <div className="mt-2">
                        <p className="text-xs text-gray-500">
                          Related roles: {trend.relatedRoles.join(", ")}
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Learn More
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            {performanceTrends.map((trend, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{trend.label}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-2xl font-bold">{trend.value}{trend.label.includes('Rate') || trend.label.includes('Engagement') ? '%' : ''}</span>
                        <div className="flex items-center space-x-1">
                          {getTrendIcon(trend.changeType)}
                          <span className={`text-sm font-medium ${getTrendColor(trend.changeType)}`}>
                            {trend.changeType === "stable" ? "0" : `${trend.change > 0 ? '+' : ''}${trend.change}`}
                            {trend.label.includes('Rate') || trend.label.includes('Engagement') ? '%' : ''}
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{trend.period}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Performance Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    <h3 className="font-semibold text-green-800">Strong Performance Areas</h3>
                  </div>
                  <p className="text-sm text-green-700 mt-1">
                    Your skill completion rate and course engagement are well above team average. 
                    Keep up the excellent learning momentum!
                  </p>
                </div>
                
                <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="flex items-center space-x-2">
                    <Target className="h-5 w-5 text-yellow-600" />
                    <h3 className="font-semibold text-yellow-800">Areas for Improvement</h3>
                  </div>
                  <p className="text-sm text-yellow-700 mt-1">
                    Learning hours decreased slightly this month. Consider scheduling dedicated learning blocks 
                    to maintain consistent progress.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team" className="space-y-6">
          <div className="grid gap-4">
            {teamInsights.map((insight, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-semibold">{insight.title}</h3>
                        <Badge className={getImpactColor(insight.impact)}>
                          {insight.impact} Impact
                        </Badge>
                        <Badge variant="outline">{insight.category}</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{insight.description}</p>
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm font-medium text-blue-800">Recommendation:</p>
                        <p className="text-sm text-blue-700">{insight.recommendation}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Team Metrics Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">24</div>
                  <p className="text-sm text-gray-600">Active Learners</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">156</div>
                  <p className="text-sm text-gray-600">Skills Developed</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">89%</div>
                  <p className="text-sm text-gray-600">Goal Achievement</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600">42</div>
                  <p className="text-sm text-gray-600">Certifications</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="market" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Industry Market Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">Software Development Market</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Job Growth</p>
                      <p className="font-medium text-green-600">+22% YoY</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Avg Salary</p>
                      <p className="font-medium">$95,000</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Remote Jobs</p>
                      <p className="font-medium">78%</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Skill Demand</p>
                      <p className="font-medium text-blue-600">Very High</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">Emerging Technologies</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span>Generative AI</span>
                      <Badge className="bg-red-100 text-red-800">Hot</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Edge Computing</span>
                      <Badge className="bg-orange-100 text-orange-800">Growing</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Quantum Computing</span>
                      <Badge className="bg-blue-100 text-blue-800">Emerging</Badge>
                    </div>
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">Recommended Focus Areas</h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>AI/ML integration in web applications</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>Advanced cloud-native architectures</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span>DevSecOps and security automation</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}