"use client"

import React, { useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Alert, AlertDescription } from './ui/alert'
import { Progress } from './ui/progress'
import { Badge } from './ui/badge'
import { 
  Upload, 
  FileSpreadsheet, 
  CheckCircle, 
  AlertCircle, 
  Download,
  Users,
  X,
  Eye,
  Activity
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import useSWR from 'swr'

interface EmployeeData {
  id: string
  name: string
  email: string
  department: string
  role: string
  hireDate: string
  skills: string[]
  certifications: string[]
  status: 'active' | 'inactive'
  availability?: string
  location?: string
}

interface ImportResult {
  success: boolean
  totalRows: number
  importedRows: number
  errors: string[]
  warnings: string[]
  data: EmployeeData[]
}

export function ExcelImport() {
  const [isDragOver, setIsDragOver] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [importResult, setImportResult] = useState<ImportResult | null>(null)
  const [previewData, setPreviewData] = useState<EmployeeData[]>([])
  const [showPreview, setShowPreview] = useState(false)
  const { toast } = useToast()
  
  // Data fetcher for refreshing employee data
  const fetcher = (url: string) => fetch(url).then((r) => r.json())
  const { data: employeeData, mutate: mutateEmployees } = useSWR("/api/data", fetcher)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const files = Array.from(e.dataTransfer.files)
    const excelFile = files.find(file => 
      file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      file.type === 'application/vnd.ms-excel' ||
      file.name.endsWith('.xlsx') ||
      file.name.endsWith('.xls')
    )
    
    if (excelFile) {
      setSelectedFile(excelFile)
    } else {
      toast({
        title: "Invalid file type",
        description: "Please select an Excel file (.xlsx or .xls)",
        variant: "destructive"
      })
    }
  }, [toast])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  const handlePreview = async () => {
    if (!selectedFile) return

    setIsUploading(true)
    setUploadProgress(0)

    try {
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('action', 'preview')

      const response = await fetch('/api/import/employees', {
        method: 'POST',
        body: formData
      })

      const result = await response.json()

      if (result.success) {
        setPreviewData(result.data)
        setShowPreview(true)
        toast({
          title: "Preview generated",
          description: `Found ${result.data.length} employees in the file`
        })
      } else {
        toast({
          title: "Preview failed",
          description: result.error || "Failed to preview file",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to preview file",
        variant: "destructive"
      })
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const handleImport = async () => {
    if (!selectedFile) return

    setIsUploading(true)
    setUploadProgress(0)

    try {
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('action', 'import')

      const response = await fetch('/api/import/employees', {
        method: 'POST',
        body: formData
      })

      const result = await response.json()

      if (result.success) {
        setImportResult(result)
        // Refresh employee data to show imported data in Employee Directory
        mutateEmployees()
        toast({
          title: "Import successful",
          description: `Successfully imported ${result.importedRows} out of ${result.totalRows} employees`
        })
      } else {
        toast({
          title: "Import failed",
          description: result.error || "Failed to import employees",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to import employees",
        variant: "destructive"
      })
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const downloadTemplate = () => {
    // Create a simple CSV template for download
    const templateData = [
      ['id', 'name', 'email', 'department', 'role', 'location', 'availability', 'experience', 'phone', 'currentProjects', 'completedProjects', 'skills'],
      ['EMP001', 'John Doe', 'john.doe@company.com', 'Engineering', 'Software Developer', 'New York, NY', 'Available', '5+ years', '+1-555-0123', '2', '15', 'Java, React, AWS'],
      ['EMP002', 'Jane Smith', 'jane.smith@company.com', 'Marketing', 'Marketing Manager', 'San Francisco, CA', 'Available', '3+ years', '+1-555-0124', '1', '8', 'Digital Marketing, Analytics']
    ]

    const csvContent = templateData.map(row => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'employee_import_template.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const clearFile = () => {
    setSelectedFile(null)
    setImportResult(null)
    setPreviewData([])
    setShowPreview(false)
  }

  const clearImportedData = async () => {
    try {
      const response = await fetch('/api/data', {
        method: 'DELETE'
      })
      const result = await response.json()
      
      if (result.success) {
        // Refresh employee data to show default data
        mutateEmployees()
        toast({
          title: "Data cleared",
          description: "Imported data has been cleared, returning to default data"
        })
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to clear data",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to clear data",
        variant: "destructive"
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Data Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Current Data Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                {employeeData?.dataSource === 'imported' 
                  ? `Showing imported data (${employeeData?.totalEmployees || 0} employees)`
                  : employeeData?.dataSource === 'none'
                  ? `No employee data available - import your data to get started`
                  : `Loading...`
                }
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Last updated: {employeeData?.lastUpdated ? new Date(employeeData.lastUpdated).toLocaleString() : 'Never'}
              </p>
            </div>
            {employeeData?.dataSource === 'imported' ? (
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Imported Data Active
              </Badge>
            ) : employeeData?.dataSource === 'none' ? (
              <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                No Data - Import Required
              </Badge>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Import Employee Data
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Template Download and Data Management */}
          <div className="flex items-center justify-between p-4 border rounded-lg bg-blue-50">
            <div>
              <h4 className="font-medium text-blue-900">Download Template</h4>
              <p className="text-sm text-blue-700">Get the Excel template with the correct format</p>
              <p className="text-xs text-blue-600 mt-1">
                Required columns: id, name, email, department, role, location, availability, experience, phone, currentProjects, completedProjects, skills
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={downloadTemplate} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Download Template
              </Button>
              <Button onClick={clearImportedData} variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                <X className="h-4 w-4 mr-2" />
                Clear Imported Data
              </Button>
            </div>
          </div>

          {/* File Upload Area */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragOver 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">Drop your Excel file here</h3>
            <p className="text-gray-600 mb-4">or click to browse</p>
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileSelect}
              className="hidden"
              id="file-upload"
            />
            <Button asChild variant="outline">
              <label htmlFor="file-upload" className="cursor-pointer">
                Choose File
              </label>
            </Button>
          </div>

          {/* Selected File */}
          {selectedFile && (
            <div className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="h-4 w-4 text-green-600" />
                <span className="font-medium">{selectedFile.name}</span>
                <Badge variant="secondary">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </Badge>
              </div>
              <Button onClick={clearFile} variant="ghost" size="sm">
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Upload Progress */}
          {isUploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Processing file...</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="w-full" />
            </div>
          )}

          {/* Action Buttons */}
          {selectedFile && !isUploading && (
            <div className="flex gap-2">
              <Button onClick={handlePreview} variant="outline">
                <Eye className="h-4 w-4 mr-2" />
                Preview Data
              </Button>
              <Button onClick={handleImport}>
                <Users className="h-4 w-4 mr-2" />
                Import Employees
              </Button>
            </div>
          )}

          {/* Preview Data */}
          {showPreview && previewData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Preview Data ({previewData.length} employees)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">ID</th>
                        <th className="text-left p-2">Name</th>
                        <th className="text-left p-2">Email</th>
                        <th className="text-left p-2">Department</th>
                        <th className="text-left p-2">Role</th>
                        <th className="text-left p-2">Location</th>
                        <th className="text-left p-2">Availability</th>
                        <th className="text-left p-2">Skills</th>
                      </tr>
                    </thead>
                    <tbody>
                      {previewData.slice(0, 5).map((employee, index) => (
                        <tr key={index} className="border-b">
                          <td className="p-2 text-xs">{employee.id || 'N/A'}</td>
                          <td className="p-2">{employee.name}</td>
                          <td className="p-2">{employee.email}</td>
                          <td className="p-2">{employee.department}</td>
                          <td className="p-2">{employee.role}</td>
                          <td className="p-2 text-xs">{employee.location || 'N/A'}</td>
                          <td className="p-2">
                            <Badge variant={employee.availability === 'Available' ? 'default' : 'secondary'} className="text-xs">
                              {employee.availability || 'N/A'}
                            </Badge>
                          </td>
                          <td className="p-2">
                            <div className="flex flex-wrap gap-1">
                              {employee.skills.slice(0, 2).map((skill, i) => (
                                <Badge key={i} variant="outline" className="text-xs">
                                  {skill}
                                </Badge>
                              ))}
                              {employee.skills.length > 2 && (
                                <Badge variant="outline" className="text-xs">
                                  +{employee.skills.length - 2}
                                </Badge>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {previewData.length > 5 && (
                    <p className="text-sm text-gray-600 mt-2">
                      Showing first 5 of {previewData.length} employees
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Import Results */}
          {importResult && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {importResult.success ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-600" />
                  )}
                  Import Results
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 border rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{importResult.totalRows}</div>
                    <div className="text-sm text-gray-600">Total Rows</div>
                  </div>
                  <div className="text-center p-3 border rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{importResult.importedRows}</div>
                    <div className="text-sm text-gray-600">Imported</div>
                  </div>
                  <div className="text-center p-3 border rounded-lg">
                    <div className="text-2xl font-bold text-red-600">{importResult.errors.length}</div>
                    <div className="text-sm text-gray-600">Errors</div>
                  </div>
                </div>

                {importResult.errors.length > 0 && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <div className="font-medium mb-2">Import Errors:</div>
                      <ul className="list-disc list-inside space-y-1">
                        {importResult.errors.map((error, index) => (
                          <li key={index} className="text-sm">{error}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}

                {importResult.warnings.length > 0 && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <div className="font-medium mb-2">Warnings:</div>
                      <ul className="list-disc list-inside space-y-1">
                        {importResult.warnings.map((warning, index) => (
                          <li key={index} className="text-sm">{warning}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
