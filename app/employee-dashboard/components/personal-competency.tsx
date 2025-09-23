"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Award, TrendingUp, Star, Target, BookOpen, Calendar, CheckCircle, Clock } from "lucide-react"
interface EmployeeData {
  id: string;
  name: string;
  // Add other fields as needed
}

interface PersonalCompetencyProps {
  employee: EmployeeData;
}

export function PersonalCompetency({ employee }: PersonalCompetencyProps) {
  const skills = [
    { name: "JavaScript", level: 90, category: "Programming", certified: true },
    { name: "React", level: 85, category: "Frontend", certified: true },
    { name: "Node.js", level: 75, category: "Backend", certified: false },
    { name: "Python", level: 70, category: "Programming", certified: true },
    { name: "AWS", level: 80, category: "Cloud", certified: true },
    { name: "Docker", level: 65, category: "DevOps", certified: false },
    { name: "TypeScript", level: 88, category: "Programming", certified: true },
    { name: "GraphQL", level: 60, category: "API", certified: false },
  ]

  const certifications = [
    { name: "AWS Solutions Architect", issuer: "Amazon", date: "2023-08-15", status: "Active" },
    { name: "React Developer Certification", issuer: "Meta", date: "2023-06-20", status: "Active" },
    { name: "JavaScript Expert", issuer: "JavaScript Institute", date: "2023-03-10", status: "Active" },
    { name: "Python Professional", issuer: "Python Software Foundation", date: "2022-11-05", status: "Active" },
    { name: "Scrum Master", issuer: "Scrum Alliance", date: "2024-01-12", status: "Expiring Soon" },
  ]

  const competencyScore = 85
  const experienceLevel = "Senior"
  const yearsExperience = 5.5

  const careerRecommendations = [
    {
      title: "Technical Lead",
      match: 92,
      description: "Lead technical projects and mentor junior developers",
      requiredSkills: ["Leadership", "System Design", "Mentoring"],
      timeline: "6-12 months",
    },
    {
      title: "Full Stack Architect",
      match: 88,
      description: "Design and implement full-stack solutions",
      requiredSkills: ["System Architecture", "Database Design", "API Design"],
      timeline: "12-18 months",
    },
    {
      title: "DevOps Engineer",
      match: 75,
      description: "Focus on infrastructure and deployment automation",
      requiredSkills: ["Kubernetes", "CI/CD", "Infrastructure as Code"],
      timeline: "18-24 months",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Competency Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-primary">
              <Target className="h-5 w-5" />
              Overall Competency
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">{competencyScore}</div>
              <div className="text-sm text-muted-foreground mb-4">AI-Calculated Score</div>
              <Progress value={competencyScore} className="h-3" />
              <div className="mt-2 text-xs text-muted-foreground">Excellent Performance</div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-secondary/5 to-secondary/10 border-secondary/20">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-secondary">
              <Star className="h-5 w-5" />
              Experience Level
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-2xl font-bold text-secondary mb-2">{experienceLevel}</div>
              <div className="text-sm text-muted-foreground mb-2">{yearsExperience} Years</div>
              <Badge variant="secondary" className="bg-secondary/10 text-secondary">
                Top 15% in Department
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-chart-1/5 to-chart-1/10 border-chart-1/20">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-chart-1">
              <Award className="h-5 w-5" />
              Certifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-4xl font-bold text-chart-1 mb-2">{certifications.length}</div>
              <div className="text-sm text-muted-foreground mb-2">Active Certifications</div>
              <div className="text-xs text-orange-600">1 Expiring Soon</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Skills & Certifications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              Skills & Proficiency
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {skills.map((skill, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{skill.name}</span>
                      {skill.certified && (
                        <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Certified
                        </Badge>
                      )}
                    </div>
                    <span className="text-sm text-muted-foreground">{skill.level}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress value={skill.level} className="flex-1 h-2" />
                    <Badge variant="secondary" className="text-xs">
                      {skill.category}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              Certifications & Experience
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {certifications.map((cert, index) => (
                <div key={index} className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium">{cert.name}</h4>
                    <p className="text-sm text-muted-foreground">{cert.issuer}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Calendar className="w-3 h-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{new Date(cert.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <Badge
                    variant={cert.status === "Active" ? "default" : "destructive"}
                    className={cert.status === "Active" ? "bg-primary text-primary-foreground" : ""}
                  >
                    {cert.status === "Expiring Soon" && <Clock className="w-3 h-3 mr-1" />}
                    {cert.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Career Path Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            AI-Generated Career Path Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {careerRecommendations.map((recommendation, index) => (
              <Card key={index} className="border-2 hover:border-primary/50 transition-colors cursor-pointer">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{recommendation.title}</CardTitle>
                    <Badge variant="secondary" className="bg-primary/10 text-primary">
                      {recommendation.match}% Match
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">{recommendation.description}</p>

                  <div className="space-y-3">
                    <div>
                      <h5 className="text-sm font-medium mb-2">Required Skills:</h5>
                      <div className="flex flex-wrap gap-1">
                        {recommendation.requiredSkills.map((skill, skillIndex) => (
                          <Badge key={skillIndex} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Timeline: {recommendation.timeline}</span>
                    </div>

                    <Button size="sm" className="w-full">
                      View Path Details
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
