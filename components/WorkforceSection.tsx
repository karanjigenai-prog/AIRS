import React from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Mail, Users, Upload, Clock, Send } from "lucide-react"
import type { ResourceMatch } from "./aris-dashboard-clean"

interface WorkforceSectionProps {
  emailData: { to: string; subject: string; message: string; type?: string }
  setEmailData: React.Dispatch<React.SetStateAction<{ to: string; subject: string; message: string; type?: string }>>
  sendEmail: () => void
  isSendingEmail: boolean
  employeeData: any
  employees: ResourceMatch[]
    setActiveTab: React.Dispatch<React.SetStateAction<"overview" | "requests" | "analysis" | "workforce" | "import">>
}

export function WorkforceSection({
  emailData, setEmailData, sendEmail, isSendingEmail, employeeData, employees, setActiveTab
}: WorkforceSectionProps) {
  return (
    <>
      {/* Email Communication */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Communication
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">To *</label>
              <Input
                value={emailData.to}
                onChange={(e) => setEmailData({...emailData, to: e.target.value})}
                placeholder="recipient@company.com"
                type="email"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Subject *</label>
              <Input
                value={emailData.subject}
                onChange={(e) => setEmailData({...emailData, subject: e.target.value})}
                placeholder="Email subject"
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Message *</label>
            <Textarea
              value={emailData.message}
              onChange={(e) => setEmailData({...emailData, message: e.target.value})}
              placeholder="Type your message here..."
              rows={6}
            />
          </div>
          <Button 
            onClick={sendEmail} 
            disabled={isSendingEmail}
            className="w-full"
          >
            {isSendingEmail ? (
              <>
                <Clock className="h-4 w-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Send Email
              </>
            )}
          </Button>
        </CardContent>
      </Card>
      {/* Employee Directory */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Employee Directory
            {employeeData?.dataSource === 'imported' && (
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Imported Data
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {employees.map((employee) => (
              <div key={employee.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold">{employee.name}</h3>
                    <p className="text-sm text-muted-foreground">{employee.role}</p>
                    <p className="text-xs text-muted-foreground">{employee.email}</p>
                  </div>
                  <div className="text-right">
                    <Badge className={employee.availability === 'Available' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                      {employee.availability}
                    </Badge>
                  </div>
                </div>
                <div className="mb-3">
                  <span className="text-xs font-medium text-muted-foreground">Skills:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {employee.currentSkills.map((skill: { skill: string; level: string }, index: number) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {skill.skill} ({skill.level})
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Experience: {employee.experience}</span>
                  <span>Projects: {employee.currentProjects} active, {employee.completedProjects} completed</span>
                </div>
              </div>
            ))}
            {employees.length === 0 && (
              <div className="text-center py-12">
                <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Employee Data Available</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Import your employee data using the Import tab to get started with workforce management.
                </p>
                <Button 
                  onClick={() => setActiveTab('import')}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Go to Import Tab
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </>
  )
}
