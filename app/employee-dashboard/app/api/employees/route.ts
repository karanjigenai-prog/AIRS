import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")
    const department = searchParams.get("department")

    // In a real implementation, this would call the Python backend
    // For now, return mock data that matches the database structure
    const mockEmployees = [
      {
        id: "emp_001",
        name: "Ateef Hussain",
        email: "AteefHussain@karanji.com",
        department: "Gen AI Development",
        position: "Gen AI Developer",
        hire_date: "2023-01-15",
        years_experience: 3.5,
        competency_score: 87,
      },
      {
        id: "emp_002",
        name: "Sumith R Naik",
        email: "sumithrnaik@karanji.com",
        department: "Gen AI Development",
        position: "Gen AI Developer",
        hire_date: "2023-01-15",
        years_experience: 1.2,
        competency_score: 82,
      },
      // Add other employees...
    ]

    let filteredEmployees = mockEmployees

    if (search) {
      filteredEmployees = filteredEmployees.filter(
        (emp) =>
          emp.name.toLowerCase().includes(search.toLowerCase()) ||
          emp.email.toLowerCase().includes(search.toLowerCase()),
      )
    }

    if (department && department !== "all") {
      filteredEmployees = filteredEmployees.filter((emp) => emp.department === department)
    }

    return NextResponse.json({ employees: filteredEmployees })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch employees" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const employeeData = await request.json()

    // In a real implementation, this would call the Python backend to add employee
    console.log("[v0] Adding employee:", employeeData)

    // Simulate successful creation
    const newEmployee = {
      id: `emp_${Date.now()}`,
      ...employeeData,
      hire_date: new Date().toISOString().split("T")[0],
      competency_score: 0,
    }

    return NextResponse.json({ employee: newEmployee, success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to add employee" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, ...employeeData } = await request.json()

    // In a real implementation, this would call the Python backend to update employee
    console.log("[v0] Updating employee:", id, employeeData)

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to update employee" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Employee ID required" }, { status: 400 })
    }

    // In a real implementation, this would call the Python backend to delete employee
    console.log("[v0] Deleting employee:", id)

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete employee" }, { status: 500 })
  }
}
