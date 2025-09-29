"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trash2, Edit, Plus, Search, Users, Award, TrendingUp, Building } from "lucide-react"

interface Employee {
  id: string
  name: string
  email: string
  department: string
  position: string
  hire_date: string
}

interface EmployeeStats {
  total_employees: number
  departments: Record<string, number>
  average_competency: number
  total_certifications: number
}

export default function AdminPanel() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [stats, setStats] = useState<EmployeeStats | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedDepartment, setSelectedDepartment] = useState("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)
  const [loading, setLoading] = useState(false)

  // Form state for adding/editing employees
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    department: "",
    position: "",
    skills: "",
    certifications: "",
    years_experience: 0,
  })

  useEffect(() => {
    loadEmployees()
    loadStats()
  }, [])

  const loadEmployees = async () => {
    setLoading(true)
    try {
      // Simulate API call - in real implementation, this would call your Python backend
      const mockEmployees: Employee[] = [
        {
          id: "emp_001",
          name: "Ateef Hussain",
          email: "AteefHussain@karanji.com",
          department: "Gen AI Development",
          position: "Gen AI Developer",
          hire_date: "2023-01-15",
        },
        {
          id: "emp_002",
          name: "Sumith R Naik",
          email: "sumithrnaik@karanji.com",
          department: "Gen AI Development",
          position: "Gen AI Developer",
          hire_date: "2023-01-15",
        },
        {
          id: "emp_003",
          name: "K Sumanth",
          email: "KSumanth@karanji.com",
          department: "Gen AI Development",
          position: "Gen AI Developer",
          hire_date: "2023-01-15",
        },
        {
          id: "emp_004",
          name: "Griffith Sheeba",
          email: "Sheeba@karanji.com",
          department: "Gen AI Development",
          position: "Gen AI Developer",
          hire_date: "2023-01-15",
        },
        {
          id: "emp_005",
          name: "Sowmyashree",
          email: "Sowmyashree@karanji.com",
          department: "Gen AI Development",
          position: "Gen AI Developer",
          hire_date: "2023-01-15",
        },
        {
          id: "emp_006",
          name: "AthulyaRoy",
          email: "AthulyaRoy@karanji.com",
          department: "Gen AI Development",
          position: "Gen AI Developer",
          hire_date: "2023-01-15",
        },
        {
          id: "emp_007",
          name: "Shivani",
          email: "Shivani@karanji.com",
          department: "Gen AI Development",
          position: "Gen AI Developer",
          hire_date: "2023-01-15",
        },
      ]
      setEmployees(mockEmployees)
    } catch (error) {
      console.error("Error loading employees:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      // Simulate API call for statistics
      const mockStats: EmployeeStats = {
        total_employees: 7,
        departments: { "Gen AI Development": 7 },
        average_competency: 82.5,
        total_certifications: 14,
      }
      setStats(mockStats)
    } catch (error) {
      console.error("Error loading stats:", error)
    }
  }

  const handleAddEmployee = async () => {
    setLoading(true)
    try {
      const newEmployee: Employee = {
        id: `emp_${Date.now()}`,
        name: formData.name,
        email: formData.email,
        department: formData.department,
        position: formData.position,
        hire_date: new Date().toISOString().split("T")[0],
      }

      setEmployees((prev) => [...prev, newEmployee])
      setIsAddDialogOpen(false)
      resetForm()

      // Show success message
      console.log("[v0] Employee added successfully:", newEmployee.name)
    } catch (error) {
      console.error("Error adding employee:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleEditEmployee = async () => {
    if (!editingEmployee) return

    setLoading(true)
    try {
      const updatedEmployee: Employee = {
        ...editingEmployee,
        name: formData.name,
        email: formData.email,
        department: formData.department,
        position: formData.position,
      }

      setEmployees((prev) => prev.map((emp) => (emp.id === editingEmployee.id ? updatedEmployee : emp)))
      setIsEditDialogOpen(false)
      setEditingEmployee(null)
      resetForm()

      console.log("[v0] Employee updated successfully:", updatedEmployee.name)
    } catch (error) {
      console.error("Error updating employee:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteEmployee = async (employeeId: string, employeeName: string) => {
    if (!confirm(`Are you sure you want to delete ${employeeName}? This action cannot be undone.`)) {
      return
    }

    setLoading(true)
    try {
      setEmployees((prev) => prev.filter((emp) => emp.id !== employeeId))
      console.log("[v0] Employee deleted successfully:", employeeName)
    } catch (error) {
      console.error("Error deleting employee:", error)
    } finally {
      setLoading(false)
    }
  }

  const openEditDialog = (employee: Employee) => {
    setEditingEmployee(employee)
    setFormData({
      name: employee.name,
      email: employee.email,
      department: employee.department,
      position: employee.position,
      skills: "",
      certifications: "",
      years_experience: 0,
    })
    setIsEditDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      department: "",
      position: "",
      skills: "",
      certifications: "",
      years_experience: 0,
    })
  }

  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesDepartment = selectedDepartment === "all" || emp.department === selectedDepartment
    return matchesSearch && matchesDepartment
  })

  const departments = Array.from(new Set(employees.map((emp) => emp.department)))

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Employee Management</h1>
          <p className="text-gray-600 mt-1">Manage employee profiles and data</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-green-600 hover:bg-green-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Employee
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add New Employee</DialogTitle>
              <DialogDescription>Enter the employee details to add them to the system.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                    placeholder="john.doe@company.com"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    value={formData.department}
                    onChange={(e) => setFormData((prev) => ({ ...prev, department: e.target.value }))}
                    placeholder="Gen AI Development"
                  />
                </div>
                <div>
                  <Label htmlFor="position">Position</Label>
                  <Input
                    id="position"
                    value={formData.position}
                    onChange={(e) => setFormData((prev) => ({ ...prev, position: e.target.value }))}
                    placeholder="Gen AI Developer"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="skills">Skills (comma-separated)</Label>
                <Textarea
                  id="skills"
                  value={formData.skills}
                  onChange={(e) => setFormData((prev) => ({ ...prev, skills: e.target.value }))}
                  placeholder="Python, React.js, machine learning"
                  rows={2}
                />
              </div>
              <div>
                <Label htmlFor="certifications">Certifications (comma-separated)</Label>
                <Textarea
                  id="certifications"
                  value={formData.certifications}
                  onChange={(e) => setFormData((prev) => ({ ...prev, certifications: e.target.value }))}
                  placeholder="AWS certification, microsoft azure"
                  rows={2}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddEmployee} disabled={loading}>
                {loading ? "Adding..." : "Add Employee"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_employees}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Departments</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Object.keys(stats.departments).length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Competency</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.average_competency}%</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Certifications</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_certifications}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search employees by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            {departments.map((dept) => (
              <SelectItem key={dept} value={dept}>
                {dept}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Employee List */}
      <Card>
        <CardHeader>
          <CardTitle>Employee Directory</CardTitle>
          <CardDescription>Manage all employee profiles and information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredEmployees.map((employee) => (
              <div
                key={employee.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 font-semibold">
                      {employee.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{employee.name}</h3>
                    <p className="text-sm text-gray-600">{employee.email}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary">{employee.department}</Badge>
                      <Badge variant="outline">{employee.position}</Badge>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => openEditDialog(employee)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteEmployee(employee.id, employee.name)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Edit Employee Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Employee</DialogTitle>
            <DialogDescription>Update the employee information.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-name">Full Name</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-department">Department</Label>
                <Input
                  id="edit-department"
                  value={formData.department}
                  onChange={(e) => setFormData((prev) => ({ ...prev, department: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="edit-position">Position</Label>
                <Input
                  id="edit-position"
                  value={formData.position}
                  onChange={(e) => setFormData((prev) => ({ ...prev, position: e.target.value }))}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditEmployee} disabled={loading}>
              {loading ? "Updating..." : "Update Employee"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
