"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Target, TrendingUp, Award, Clock } from "lucide-react"

interface CompetencyData {
  skill: string
  currentLevel: number
  targetLevel: number
  progress: number
  category: string
}

interface PersonalCompetencyProps {
  employeeData: any
}

export function PersonalCompetency({ employeeData }: PersonalCompetencyProps) {
  const competencies: CompetencyData[] = [
    { skill: "React Development", currentLevel: 4, targetLevel: 5, progress: 80, category: "Technical" },
    { skill: "Project Management", currentLevel: 3, targetLevel: 4, progress: 60, category: "Leadership" },
    { skill: "Team Collaboration", currentLevel: 4, targetLevel: 5, progress: 90, category: "Soft Skills" },
    { skill: "AWS Cloud", currentLevel: 2, targetLevel: 4, progress: 40, category: "Technical" }
  ]

  const getLevelName = (level: number) => {
    const levels = ["Novice", "Beginner", "Intermediate", "Advanced", "Expert"]
    return levels[level - 1] || "Unknown"
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Technical": return "bg-blue-100 text-blue-800"
      case "Leadership": return "bg-purple-100 text-purple-800"
      case "Soft Skills": return "bg-green-100 text-green-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Personal Competency Map</h2>
        <Button variant="outline" size="sm">
          <Target className="h-4 w-4 mr-2" />
          Set Goals
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {competencies.map((competency, index) => (
          <Card key={index}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{competency.skill}</CardTitle>
                <Badge className={getCategoryColor(competency.category)}>
                  {competency.category}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-600">Current Level</p>
                  <p className="font-semibold">{getLevelName(competency.currentLevel)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Target Level</p>
                  <p className="font-semibold">{getLevelName(competency.targetLevel)}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress to Target</span>
                  <span>{competency.progress}%</span>
                </div>
                <Progress value={competency.progress} className="h-2" />
              </div>
              
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="h-4 w-4 mr-1" />
                  Est. 2-3 months
                </div>
                <Button variant="outline" size="sm">
                  View Path
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Award className="h-5 w-5 mr-2" />
            Achievement Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">12</div>
              <p className="text-sm text-gray-600">Skills Mastered</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">85%</div>
              <p className="text-sm text-gray-600">Goal Completion</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">3</div>
              <p className="text-sm text-gray-600">Certifications Earned</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}