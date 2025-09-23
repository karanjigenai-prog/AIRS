/**
 * Employee Storage System
 * Simple in-memory storage for imported employee data
 * In production, this would be replaced with a database
 */

interface StoredEmployee {
  id: string
  name: string
  email: string
  department: string
  role: string
  hireDate: string
  skills: { skill: string; level: string }[]
  certifications: string[]
  status: 'active' | 'inactive'
  location?: string
  availability?: string
  experience?: string
  phone?: string
  currentProjects?: number
  completedProjects?: number
}

class EmployeeStorage {
  private employees: StoredEmployee[] = []
  private lastUpdated: Date = new Date()

  // Add or update employees
  addEmployees(employees: StoredEmployee[]): void {
    this.employees = employees.map(emp => ({
      ...emp,
      id: emp.id || this.generateId(emp.email),
      location: emp.location || 'Not specified',
      availability: emp.availability || 'Available',
      experience: emp.experience || 'Not specified',
      phone: emp.phone || 'Not specified',
      currentProjects: emp.currentProjects || 0,
      completedProjects: emp.completedProjects || 0,
      skills: emp.skills.map(skill => ({
        skill: skill.skill,
        level: skill.level || 'intermediate'
      }))
    }))
    this.lastUpdated = new Date()
  }

  // Get all employees
  getAllEmployees(): StoredEmployee[] {
    return this.employees
  }

  // Get employee count
  getEmployeeCount(): number {
    return this.employees.length
  }

  // Get available employees
  getAvailableEmployees(): StoredEmployee[] {
    return this.employees.filter(emp => emp.availability === 'Available')
  }

  // Get last updated time
  getLastUpdated(): Date {
    return this.lastUpdated
  }

  // Clear all data
  clear(): void {
    this.employees = []
    this.lastUpdated = new Date()
  }

  // Generate ID from email
  private generateId(email: string): string {
    return `emp_${email.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}`
  }
}

// Export singleton instance
export const employeeStorage = new EmployeeStorage()

// Helper function to convert imported data to storage format
export function convertImportedData(importedData: any[]): StoredEmployee[] {
  return importedData.map((emp, index) => ({
    id: emp.id || `imported_${index}_${Date.now()}`,
    name: emp.name,
    email: emp.email,
    department: emp.department,
    role: emp.role,
    location: emp.location || 'Not specified',
    availability: emp.availability || 'Available',
    experience: emp.experience || 'Not specified',
    phone: emp.phone || 'Not specified',
    currentProjects: emp.currentProjects || 0,
    completedProjects: emp.completedProjects || 0,
    hireDate: emp.hireDate,
    skills: emp.skills.map((skill: string) => ({
      skill: skill,
      level: 'intermediate' // Default level for imported skills
    })),
    certifications: emp.certifications || [],
    status: emp.status
  }))
}
