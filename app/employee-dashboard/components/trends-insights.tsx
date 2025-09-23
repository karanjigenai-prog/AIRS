interface EmployeeData {
  id: string;
  name: string;
  // Add other fields as needed
}

interface TrendsInsightsProps {
  employee: EmployeeData;
}

"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  BarChart,
  AreaChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Area,
} from "recharts"
import {
  TrendingUp,
  BarChart3,
  PieChartIcon,
  Users,
  Award,
  BookOpen,
  Target,
  ArrowUpRight,
  Activity,
  RefreshCw,
  Clock,
  ExternalLink,
} from "lucide-react"
import { useRealTimeIndustryData } from "./real-time-data-service"
import { LoadingSpinner } from "./ui/loading-spinner"

export function TrendsInsights() {
  const { trendingSkills, marketInsights, skillDemandData, isLoading, lastUpdated, refreshData } =
    useRealTimeIndustryData()

  // Sample data for charts (keeping some static data for demonstration)
  const skillTrendsData = [
    { month: "Jan", JavaScript: 85, React: 80, Python: 70, AWS: 75 },
    { month: "Feb", JavaScript: 87, React: 82, Python: 72, AWS: 78 },
    { month: "Mar", JavaScript: 89, React: 85, Python: 75, AWS: 80 },
    { month: "Apr", JavaScript: 90, React: 87, Python: 78, AWS: 82 },
    { month: "May", JavaScript: 92, React: 89, Python: 80, AWS: 85 },
    { month: "Jun", JavaScript: 94, React: 91, Python: 82, AWS: 87 },
  ]

  const learningActivityData = [
    { week: "Week 1", hours: 8, courses: 2 },
    { week: "Week 2", hours: 12, courses: 3 },
    { week: "Week 3", hours: 6, courses: 1 },
    { week: "Week 4", hours: 15, courses: 4 },
    { week: "Week 5", hours: 10, courses: 2 },
    { week: "Week 6", hours: 18, courses: 5 },
  ]

  const competencyDistribution = [
    { name: "Expert", value: 25, color: "#15803d" },
    { name: "Advanced", value: 35, color: "#84cc16" },
    { name: "Intermediate", value: 30, color: "#fbbf24" },
    { name: "Beginner", value: 10, color: "#f472b6" },
  ]

  const departmentComparison = [
    { department: "Engineering", avgScore: 82, employees: 45 },
    { department: "Product", avgScore: 78, employees: 25 },
    { department: "Design", avgScore: 85, employees: 18 },
    { department: "Marketing", avgScore: 72, employees: 32 },
    { department: "Sales", avgScore: 68, employees: 28 },
  ]

  const calculateRealTimeMetrics = () => {
    if (skillDemandData.length === 0) return { avgGrowth: 0, topSkillDemand: 0, marketOpportunities: 0 }

    const avgGrowth = skillDemandData.reduce((sum, skill) => sum + skill.growth, 0) / skillDemandData.length
    const topSkillDemand = Math.max(...skillDemandData.map((skill) => skill.demand))
    const marketOpportunities = skillDemandData.filter((skill) => skill.demand > 85).length

    return { avgGrowth, topSkillDemand, marketOpportunities }
  }

  const { avgGrowth, topSkillDemand, marketOpportunities } = calculateRealTimeMetrics()

  return (
    <div className="space-y-6">
      {/* Real-time Data Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Live Industry Trends & Insights</h2>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
            <Clock className="w-4 h-4" />
            <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>
          </div>
        </div>
        <Button
          onClick={refreshData}
          variant="outline"
          size="sm"
          disabled={isLoading}
          className="flex items-center gap-2 bg-transparent"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          Refresh Data
        </Button>
      </div>

      {/* Key Metrics Overview - Updated with real-time data */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Learning Hours</p>
                <p className="text-2xl font-bold">69h</p>
                <div className="flex items-center gap-1 text-xs text-primary">
                  <TrendingUp className="w-3 h-3" />
                  <span>+23% vs last month</span>
                </div>
              </div>
              <div className="p-2 bg-primary/10 rounded-lg">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-secondary/5 to-secondary/10 border-secondary/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Industry Growth</p>
                <p className="text-2xl font-bold">+{Math.round(avgGrowth)}%</p>
                <div className="flex items-center gap-1 text-xs text-secondary">
                  <TrendingUp className="w-3 h-3" />
                  <span>Live market data</span>
                </div>
              </div>
              <div className="p-2 bg-secondary/10 rounded-lg">
                <Target className="h-5 w-5 text-secondary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-chart-1/5 to-chart-1/10 border-chart-1/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Market Demand</p>
                <p className="text-2xl font-bold">{topSkillDemand}%</p>
                <div className="flex items-center gap-1 text-xs text-chart-1">
                  <ArrowUpRight className="w-3 h-3" />
                  <span>Peak skill demand</span>
                </div>
              </div>
              <div className="p-2 bg-chart-1/10 rounded-lg">
                <Users className="h-5 w-5 text-chart-1" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-chart-2/5 to-chart-2/10 border-chart-2/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Hot Opportunities</p>
                <p className="text-2xl font-bold">{marketOpportunities}</p>
                <div className="flex items-center gap-1 text-xs text-chart-2">
                  <TrendingUp className="w-3 h-3" />
                  <span>High-demand skills</span>
                </div>
              </div>
              <div className="p-2 bg-chart-2/10 rounded-lg">
                <Activity className="h-5 w-5 text-chart-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Real-time Industry Demand Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Live Industry Demand Analysis
              <Badge variant="outline" className="ml-auto bg-primary/10 text-primary border-primary/20">
                Real-time
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-[300px]">
                <LoadingSpinner />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={skillDemandData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="skill" />
                  <YAxis />
                  <Tooltip
                    formatter={(value, name) => [
                      name === "demand"
                        ? `${value}% demand`
                        : name === "growth"
                          ? `+${value}% growth`
                          : `$${(value as number).toLocaleString()} avg salary`,
                      name === "demand" ? "Market Demand" : name === "growth" ? "Growth Rate" : "Average Salary",
                    ]}
                  />
                  <Bar dataKey="demand" fill="#15803d" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Skill Progress Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Your Skill Progress Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={skillTrendsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="JavaScript" stroke="#15803d" strokeWidth={2} />
                <Line type="monotone" dataKey="React" stroke="#84cc16" strokeWidth={2} />
                <Line type="monotone" dataKey="Python" stroke="#fbbf24" strokeWidth={2} />
                <Line type="monotone" dataKey="AWS" stroke="#f472b6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Learning Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Learning Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={learningActivityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="hours" stackId="1" stroke="#15803d" fill="#15803d" fillOpacity={0.6} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Competency Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon className="h-5 w-5 text-primary" />
              Competency Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={competencyDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {competencyDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Live Trending Skills */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Live Trending Skills in Your Industry
            <Badge variant="outline" className="ml-auto bg-primary/10 text-primary border-primary/20">
              Updated {lastUpdated.toLocaleTimeString()}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-[200px]">
              <LoadingSpinner />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {trendingSkills.map((skill, index) => (
                <Card key={index} className="border-2 hover:border-primary/50 transition-colors">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{skill.skill}</h4>
                        <Badge
                          variant="outline"
                          className={
                            skill.demand === "Very High"
                              ? "border-red-200 text-red-700 bg-red-50"
                              : skill.demand === "High"
                                ? "border-orange-200 text-orange-700 bg-orange-50"
                                : "border-blue-200 text-blue-700 bg-blue-50"
                          }
                        >
                          {skill.demand}
                        </Badge>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Badge variant="secondary" className="bg-primary/10 text-primary">
                            {skill.category}
                          </Badge>
                          <div className="flex items-center gap-1 text-sm font-medium text-primary">
                            <TrendingUp className="w-4 h-4" />
                            {skill.growth}
                          </div>
                        </div>

                        <div className="text-sm text-muted-foreground">Salary: {skill.salaryRange}</div>

                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">Market Score:</span>
                          <Progress value={skill.marketScore} className="h-2 flex-1" />
                          <span className="text-xs font-medium">{skill.marketScore}%</span>
                        </div>
                      </div>

                      <Button size="sm" variant="outline" className="w-full bg-transparent">
                        Explore Learning Path
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Department Comparison */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Department Performance Comparison
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {departmentComparison.map((dept, index) => (
              <div key={index} className="flex items-center justify-between p-3 border border-border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-12 text-center">
                    <span className="text-sm font-medium">{dept.department}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-muted-foreground">Avg Score</span>
                      <span className="text-sm font-medium">{dept.avgScore}%</span>
                    </div>
                    <Progress value={dept.avgScore} className="h-2" />
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">{dept.employees} employees</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Live Market Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            Live Market Insights & Recommendations
            <Badge variant="outline" className="ml-auto bg-primary/10 text-primary border-primary/20">
              Real-time
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-[200px]">
              <LoadingSpinner />
            </div>
          ) : (
            <div className="space-y-4">
              {marketInsights.map((insight, index) => (
                <div
                  key={index}
                  className={`p-4 border-l-4 rounded-lg ${
                    insight.type === "success"
                      ? "border-l-primary bg-primary/5"
                      : insight.type === "warning"
                        ? "border-l-orange-500 bg-orange-50"
                        : "border-l-blue-500 bg-blue-50"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium">{insight.title}</h4>
                        <Badge
                          variant="outline"
                          className={
                            insight.priority === "high"
                              ? "border-red-200 text-red-700 bg-red-50"
                              : insight.priority === "medium"
                                ? "border-yellow-200 text-yellow-700 bg-yellow-50"
                                : "border-blue-200 text-blue-700 bg-blue-50"
                          }
                        >
                          {insight.priority} priority
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{insight.description}</p>
                      <p className="text-sm font-medium mb-2">{insight.action}</p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <ExternalLink className="w-3 h-3" />
                        <span>Source: {insight.source}</span>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      Take Action
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
