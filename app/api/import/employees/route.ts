import { NextRequest, NextResponse } from 'next/server'
import * as XLSX from 'xlsx';
import { employeeStorage, convertImportedData } from '@/lib/employee-storage'
import { supabaseAdmin } from '@/lib/supabase-admin'

interface EmployeeData {
  id: string
  name: string
  email: string
  department: string
  role: string
  location: string
  availability: string
  experience: string
  phone: string
  currentProjects: number
  completedProjects: number
  hireDate: string
  skills: string[]
  certifications: string[]
  status: 'active' | 'inactive'
}

interface ImportResult {
  success: boolean
  totalRows: number
  importedRows: number
  errors: string[]
  warnings: string[]
  data: EmployeeData[]
}

/**
 * POST /api/import/employees
 * Handles Excel file import for employee data
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const action = formData.get('action') as string

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel'
    ]
    
    if (!allowedTypes.includes(file.type) && !file.name.match(/\.(xlsx|xls)$/)) {
      return NextResponse.json(
        { success: false, error: 'Invalid file type. Please upload an Excel file (.xlsx or .xls)' },
        { status: 400 }
      )
    }

    // Read the Excel file
    const buffer = await file.arrayBuffer()
    const workbook = XLSX.read(buffer, { type: 'array' })
    
    // Get the first worksheet
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    
    // Convert to JSON
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })
    
    if (jsonData.length < 2) {
      return NextResponse.json(
        { success: false, error: 'File must contain at least a header row and one data row' },
        { status: 400 }
      )
    }

    // Get headers (first row)
    const headers = jsonData[0] as string[]
    const dataRows = jsonData.slice(1) as any[][]

    // Expected column mapping
    const columnMap: { [key: string]: string } = {
      'id': 'id',
      'name': 'name',
      'email': 'email',
      'department': 'department',
      'role': 'role',
      'location': 'location',
      'availability': 'availability',
      'experience': 'experience',
      'phone': 'phone',
      'currentprojects': 'currentProjects',
      'current_projects': 'currentProjects',
      'completedprojects': 'completedProjects',
      'completed_projects': 'completedProjects',
      'skills': 'skills',
      'hire date': 'hireDate',
      'hire_date': 'hireDate',
      'certifications': 'certifications',
      'status': 'status'
    }

    // Find column indices
    const columnIndices: { [key: string]: number } = {}
    headers.forEach((header, index) => {
      const normalizedHeader = header.toLowerCase().trim()
      if (columnMap[normalizedHeader]) {
        columnIndices[columnMap[normalizedHeader]] = index
      }
    })

    // Validate required columns
    const requiredColumns = ['name', 'email', 'department', 'role']
    const missingColumns = requiredColumns.filter(col => columnIndices[col] === undefined)
    
    if (missingColumns.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Missing required columns: ${missingColumns.join(', ')}. Please check the template format.` 
        },
        { status: 400 }
      )
    }

    // Process data rows
    const employees: EmployeeData[] = []
    const errors: string[] = []
    const warnings: string[] = []

    dataRows.forEach((row, index) => {
      const rowNumber = index + 2 // +2 because we start from row 2 (after header)
      
      try {
        // Extract data from row
        const id = row[columnIndices.id]?.toString().trim() || ''
        const name = row[columnIndices.name]?.toString().trim()
        const email = row[columnIndices.email]?.toString().trim()
        const department = row[columnIndices.department]?.toString().trim()
        const role = row[columnIndices.role]?.toString().trim()
        const location = row[columnIndices.location]?.toString().trim() || 'Not specified'
        const availability = row[columnIndices.availability]?.toString().trim() || 'Available'
        const experience = row[columnIndices.experience]?.toString().trim() || 'Not specified'
        const phone = row[columnIndices.phone]?.toString().trim() || 'Not specified'
        const currentProjects = parseInt(row[columnIndices.currentProjects]?.toString().trim() || '0') || 0
        const completedProjects = parseInt(row[columnIndices.completedProjects]?.toString().trim() || '0') || 0
        const hireDate = row[columnIndices.hireDate]?.toString().trim()
        const skillsStr = row[columnIndices.skills]?.toString().trim() || ''
        const certificationsStr = row[columnIndices.certifications]?.toString().trim() || ''
        const status = row[columnIndices.status]?.toString().trim().toLowerCase() || 'active'

        // Validate required fields
        if (!name) {
          errors.push(`Row ${rowNumber}: Name is required`)
          return
        }
        
        if (!email) {
          errors.push(`Row ${rowNumber}: Email is required`)
          return
        }
        
        if (!department) {
          errors.push(`Row ${rowNumber}: Department is required`)
          return
        }
        
        if (!role) {
          errors.push(`Row ${rowNumber}: Role is required`)
          return
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
          errors.push(`Row ${rowNumber}: Invalid email format: ${email}`)
          return
        }

        // Validate status
        if (status !== 'active' && status !== 'inactive') {
          warnings.push(`Row ${rowNumber}: Invalid status '${status}', defaulting to 'active'`)
        }

        // Parse skills and certifications
        const skills = skillsStr ? skillsStr.split(',').map((s: string) => s.trim()).filter((s: string) => s) : []
        const certifications = certificationsStr ? certificationsStr.split(',').map((c: string) => c.trim()).filter((c: string) => c) : []

        // Validate hire date format
        let formattedHireDate = hireDate
        if (hireDate) {
          try {
            // Handle different date formats
            const date = new Date(hireDate)
            if (isNaN(date.getTime())) {
              warnings.push(`Row ${rowNumber}: Invalid hire date format: ${hireDate}`)
              formattedHireDate = new Date().toISOString().split('T')[0] // Default to today
            } else {
              formattedHireDate = date.toISOString().split('T')[0]
            }
          } catch {
            warnings.push(`Row ${rowNumber}: Invalid hire date format: ${hireDate}`)
            formattedHireDate = new Date().toISOString().split('T')[0]
          }
        } else {
          formattedHireDate = new Date().toISOString().split('T')[0]
        }

        const employee: EmployeeData = {
          id: id || `emp_${Date.now()}_${index}`,
          name,
          email,
          department,
          role,
          location,
          availability,
          experience,
          phone,
          currentProjects,
          completedProjects,
          hireDate: formattedHireDate,
          skills,
          certifications,
          status: (status === 'active' || status === 'inactive') ? status : 'active'
        }

        employees.push(employee)

      } catch (error) {
        errors.push(`Row ${rowNumber}: Error processing data - ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    })

    // If this is just a preview, return the data without saving
    if (action === 'preview') {
      return NextResponse.json({
        success: true,
        data: employees,
        totalRows: dataRows.length,
        errors: errors.slice(0, 10), // Limit errors in preview
        warnings: warnings.slice(0, 10) // Limit warnings in preview
      })
    }

    // For actual import, save to storage and database
    if (action === 'import') {
      try {
        // Convert imported data to storage format
        const storedEmployees = convertImportedData(employees)
        
        // Store in employee storage
        employeeStorage.addEmployees(storedEmployees)

        // Upsert into Supabase
        // Map to DB schema: skills as JSONB, certifications as TEXT[]
        const dbRows = storedEmployees.map(emp => ({
          id: emp.id,
          name: emp.name,
          email: emp.email,
          department: emp.department,
          role: emp.role,
          location: emp.location,
          availability: emp.availability,
          experience: emp.experience,
          phone: emp.phone,
          current_projects: emp.currentProjects ?? 0,
          completed_projects: emp.completedProjects ?? 0,
          hire_date: emp.hireDate,
          skills: emp.skills, // JSONB
          certifications: emp.certifications, // TEXT[]
          status: emp.status
        }))

        // Attempt 1: upsert with explicit conflict target on primary key 'id'
        let { error: upsertError } = await supabaseAdmin
          .schema('public')
          .from('employees')
          .upsert(dbRows, { onConflict: 'id', ignoreDuplicates: false })

        // Attempt 2: if the table doesn't have a PK/unique on id, try upsert without conflict target
        if (upsertError) {
          console.warn('Supabase upsert with onConflict=id failed, retrying without onConflict:', upsertError)
          const attempt = await supabaseAdmin
            .schema('public')
            .from('employees')
            .upsert(dbRows)
          upsertError = attempt.error || null
        }

        // Attempt 3: If upsert still fails (e.g., missing constraints), fallback to plain insert
        if (upsertError) {
          console.warn('Supabase upsert without onConflict failed, falling back to insert:', upsertError)
          const insertAttempt = await supabaseAdmin
            .schema('public')
            .from('employees')
            .insert(dbRows)
          upsertError = insertAttempt.error || null
        }

        if (upsertError) {
          console.error('Supabase write failed:', upsertError)
          // Provide actionable error back to client to aid debugging
          return NextResponse.json(
            {
              success: false,
              error: 'Database upsert failed',
              supabase: {
                message: upsertError.message,
                details: (upsertError as any).details || null,
                hint: (upsertError as any).hint || null,
                code: (upsertError as any).code || null
              }
            },
            { status: 500 }
          )
        }
        
        const result: ImportResult = {
          success: true,
          totalRows: employees.length,
          importedRows: employees.length,
          errors,
          warnings,
          data: employees
        }

        return NextResponse.json(result)
      } catch (error) {
        return NextResponse.json(
          { 
            success: false, 
            error: `Failed to store imported data: ${error instanceof Error ? error.message : 'Unknown error'}` 
          },
          { status: 500 }
        )
      }
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action specified' },
      { status: 400 }
    )

  } catch (error) {
    console.error('Import error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to process file' 
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/import/employees
 * Get import status or download template
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const action = searchParams.get('action')

  if (action === 'template') {
    // Generate and return Excel template
    const templateData = [
      ['id', 'name', 'email', 'department', 'role', 'location', 'availability', 'experience', 'phone', 'currentProjects', 'completedProjects', 'skills'],
      ['EMP001', 'John Doe', 'john.doe@company.com', 'Engineering', 'Software Developer', 'New York, NY', 'Available', '5+ years', '+1-555-0123', '2', '15', 'Java, React, AWS'],
      ['EMP002', 'Jane Smith', 'jane.smith@company.com', 'Marketing', 'Marketing Manager', 'San Francisco, CA', 'Available', '3+ years', '+1-555-0124', '1', '8', 'Digital Marketing, Analytics']
    ]

    const worksheet = XLSX.utils.aoa_to_sheet(templateData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Employees')

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="employee_import_template.xlsx"'
      }
    })
  }

  return NextResponse.json({
    success: true,
    message: 'Employee import API is ready'
  })
}
