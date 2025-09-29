/**
 * Data API Route - /api/data
 * 
 * Provides employee and program data for the ARIS dashboard
 * Returns imported employee data if available, otherwise falls back to default data
 * 
 * Returns:
 * - employees: List of employees with their skills (beginner/intermediate/expert levels)
 * - programs: Available training programs
 * - analytics: Supply/demand data and trends
 */

import { NextResponse } from "next/server"

import { employeeStorage } from "@/lib/employee-storage"
import { supabaseAdmin } from "@/lib/supabase-admin"

/**
 * Production Employee Data - Gen AI Team (Sorted Alphabetically)
 * Contains employees with real email addresses and proper skill level classifications
 * All employees are Gen AI developers with Sheeba and Sowmya as seniors
 */
const employees = [
  {
    id: 'emp1',
    name: 'Ateef Hussain Sheikh',
    email: 'Sheebam@karanji.com',
    department: 'Gen AI Development',
    role: 'Gen AI Developer',
    location: 'Bangalore, India',
    availability: 'Available',
    experience: '3+ years',
    phone: '+91-9876543210',
    currentProjects: 2,
    completedProjects: 8,
    skills: [
      { skill: 'Machine Learning', level: 'intermediate' },
      { skill: 'Python', level: 'expert' },
      { skill: 'TensorFlow', level: 'intermediate' },
      { skill: 'Natural Language Processing', level: 'intermediate' },
      { skill: 'AI/ML', level: 'intermediate' },
      { skill: 'Deep Learning', level: 'beginner' }
    ]
  },
  {
    id: 'emp4',
    name: 'Grifith Sheeba Menon',
    email: 'sheebam@karanji.com',
    department: 'Gen AI Development',
    role: 'Senior Gen AI Developer',
    location: 'Kochi, India',
    availability: 'Available',
    experience: '6+ years',
    phone: '+91-9876543213',
    currentProjects: 3,
    completedProjects: 18,
    skills: [
      { skill: 'Machine Learning', level: 'expert' },
      { skill: 'Deep Learning', level: 'expert' },
      { skill: 'Python', level: 'expert' },
      { skill: 'TensorFlow', level: 'expert' },
      { skill: 'PyTorch', level: 'expert' },
      { skill: 'AI/ML', level: 'expert' },
      { skill: 'Natural Language Processing', level: 'expert' },
      { skill: 'Computer Vision', level: 'expert' }
    ]
  },
  {
    id: 'emp3',
    name: 'K Sumanth',
    email: 'KSumanth@karanji.com',
    department: 'Gen AI Development',
    role: 'Gen AI Developer',
    location: 'Hyderabad, India',
    availability: 'Busy',
    experience: '3+ years',
    phone: '+91-9876543212',
    currentProjects: 2,
    completedProjects: 10,
    skills: [
      { skill: 'Python', level: 'expert' },
      { skill: 'Machine Learning', level: 'expert' },
      { skill: 'Deep Learning', level: 'intermediate' },
      { skill: 'AI/ML', level: 'expert' },
      { skill: 'Neural Networks', level: 'intermediate' },
      { skill: 'TensorFlow', level: 'intermediate' }
    ]
  },
  {
    id: 'emp5',
    name: 'Sowmyashree',
    email: 'Athulyaroy@karanji.com',
    department: 'Gen AI Development',
    role: 'Senior Gen AI Developer',
    location: 'Bangalore, India',
    availability: 'Available',
    experience: '5+ years',
    phone: '+91-9876543214',
    currentProjects: 2,
    completedProjects: 15,
    skills: [
      { skill: 'Machine Learning', level: 'expert' },
      { skill: 'Deep Learning', level: 'expert' },
      { skill: 'Python', level: 'expert' },
      { skill: 'Natural Language Processing', level: 'expert' },
      { skill: 'AI/ML', level: 'expert' },
      { skill: 'Generative AI', level: 'expert' },
      { skill: 'LLM Development', level: 'expert' },
      { skill: 'Transformer Models', level: 'intermediate' }
    ]
  },
  {
    id: 'emp2',
    name: 'Sumith R Naik',
    email: 'sumithrnaik@karanji.com',
    department: 'Gen AI Development',
    role: 'Gen AI Developer',
    location: 'Mangalore, India',
    availability: 'Available',
    experience: '2+ years',
    phone: '+91-9876543211',
    currentProjects: 1,
    completedProjects: 6,
    skills: [
      { skill: 'Python', level: 'expert' },
      { skill: 'Machine Learning', level: 'intermediate' },
      { skill: 'Computer Vision', level: 'intermediate' },
      { skill: 'PyTorch', level: 'intermediate' },
      { skill: 'AI/ML', level: 'intermediate' },
      { skill: 'Data Science', level: 'beginner' }
    ]
  }
]

const programs = [
  {
    id: 'prog1',
    name: 'AWS Solutions Architect Professional',
    provider: 'AWS Training',
    duration: '40 hours',
    level: 'intermediate',
    description: 'Advanced AWS cloud architecture and solutions design',
    url: 'https://aws.amazon.com/training/path-architecting/',
    skills: ['AWS', 'Cloud Architecture', 'System Design']
  },
  {
    id: 'prog2',
    name: 'Kubernetes Administration (CKA)',
    provider: 'Linux Foundation',
    duration: '30 hours',
    level: 'intermediate',
    description: 'Certified Kubernetes Administrator certification training',
    url: 'https://training.linuxfoundation.org/certification/certified-kubernetes-administrator-cka/',
    skills: ['Kubernetes', 'Container Orchestration', 'DevOps']
  },
  {
    id: 'prog3',
    name: 'Advanced React Development',
    provider: 'Meta',
    duration: '25 hours',
    level: 'expert',
    description: 'Advanced React patterns, hooks, and performance optimization',
    url: 'https://www.coursera.org/learn/advanced-react',
    skills: ['React', 'JavaScript', 'Frontend Development']
  },
  {
    id: 'prog4',
    name: 'Python for Data Science',
    provider: 'IBM',
    duration: '35 hours',
    level: 'beginner',
    description: 'Python programming fundamentals for data science applications',
    url: 'https://www.coursera.org/learn/python-for-applied-data-science-ai',
    skills: ['Python', 'Data Science', 'Machine Learning']
  }
]

const analytics = {
  supplyDemand: [
    { label: "Java", supply: 2, demand: 5 },
    { label: "AWS", supply: 4, demand: 8 },
    { label: "Kubernetes", supply: 2, demand: 6 },
    { label: "React", supply: 3, demand: 4 },
    { label: "Python", supply: 1, demand: 3 },
    { label: "Docker", supply: 4, demand: 5 },
    { label: "Node.js", supply: 2, demand: 4 }
  ],
  trend: [
    { month: "2025-07", demandIndex: 65 },
    { month: "2025-08", demandIndex: 72 },
    { month: "2025-09", demandIndex: 78 },
    { month: "2025-10", demandIndex: 82 },
    { month: "2025-11", demandIndex: 89 },
    { month: "2025-12", demandIndex: 95 }
  ],
  skillGaps: [
    { skill: "AWS", currentLevel: "beginner", requiredLevel: "intermediate", gap: 2 },
    { skill: "Kubernetes", currentLevel: "beginner", requiredLevel: "expert", gap: 3 },
    { skill: "Machine Learning", currentLevel: "none", requiredLevel: "beginner", gap: 1 }
  ]
}

export async function GET() {
  try {
    // Simulate some processing time for realism
    await new Promise(resolve => setTimeout(resolve, 100))

    try {
      // Try to fetch employee master data from Supabase
      const { data: master, error: masterError } = await supabaseAdmin
        .schema('public')
        .from('employee_master')
        .select('*')
      
      if (masterError) {
        throw new Error('Supabase connection failed, using fallback data')
      }

      // Fetch all skills for all employees
      const { data: skills, error: skillsError } = await supabaseAdmin
        .schema('public')
        .from('skills_master')
        .select('*')
      if (skillsError) {
        throw new Error('Skills data fetch failed')
      }

      // Fetch all allocations for all employees
      const { data: allocations, error: allocError } = await supabaseAdmin
        .schema('public')
        .from('employee_allocation')
        .select('*')
      if (allocError) {
        throw new Error('Allocations data fetch failed')
      }

      // Combine all data into employee objects
      const employeesToReturn = master.map(emp => {
        const empSkills = skills.filter(s => s.EmployeeNumber === emp.EmployeeNumber).map(s => ({
          skill: s.SkillName,
          level: s.ProficiencyLevel,
          category: s.SkillCategory,
          certification: s.CertificationLevel
        }))
        const empAlloc = allocations.filter(a => a.EmployeeNumber === emp.EmployeeNumber)
        // You can further process empAlloc to determine availability, current project, etc.
        return {
          id: emp.EmployeeNumber,
          name: emp.EmployeeName,
          email: emp.Email,
          designation: emp.Designation,
          jobBand: emp.JobBand,
          skills: empSkills,
          allocations: empAlloc,
          role: emp.Designation,
          department: emp.Department || 'Gen AI Development',
          location: emp.Location || 'India',
          experience: emp.Experience || '2+ years',
          phone: emp.Phone,
          currentProjects: empAlloc.filter(a => !a.AllocationEndDate || new Date(a.AllocationEndDate) > new Date()).length,
          completedProjects: empAlloc.filter(a => a.AllocationEndDate && new Date(a.AllocationEndDate) <= new Date()).length,
          // Example: available if no current allocation or allocation end date is in the past
          availability: empAlloc.length === 0 || empAlloc.every(a => a.AllocationEndDate && new Date(a.AllocationEndDate) < new Date()) ? 'Available' : 'Allocated',
        }
      })
      .filter(emp => emp.skills && emp.skills.length > 0) // Filter out employees without skills for UI display
      .sort((a, b) => a.name.localeCompare(b.name)) // Sort employees alphabetically by name

      return NextResponse.json({
        success: true,
        employees: employeesToReturn,
        programs,
        analytics,
        dataSource: 'supabase'
      })
    } catch (supabaseError) {
      console.warn('Supabase data unavailable, using fallback data:', supabaseError)
      
      // Use fallback data, apply same filtering and sorting logic
      const fallbackEmployees = employees
        .filter(emp => emp.skills && emp.skills.length > 0) // Filter out employees without skills for UI display
        .sort((a, b) => a.name.localeCompare(b.name)) // Sort employees alphabetically by name
      
      return NextResponse.json({
        success: true,
        employees: fallbackEmployees,
        programs,
        analytics,
        dataSource: 'fallback'
      })
    }
  } catch (error) {
    console.error('Error fetching data:', error)
    return NextResponse.json({ 
      success: false,
      error: 'Failed to fetch data' 
    }, { status: 500 })
  }
}

export async function DELETE() {
  try {
    // Clear imported data and return to default
    employeeStorage.clear()
    
    return NextResponse.json({
      success: true,
      message: 'Imported data cleared, returning to default data'
    })
  } catch (error) {
    console.error('Error clearing data:', error)
    return NextResponse.json({ 
      success: false,
      error: 'Failed to clear data' 
    }, { status: 500 })
  }
}
