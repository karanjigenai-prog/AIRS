import { NextRequest, NextResponse } from 'next/server'

type RequirementSkill = {
  name: string
  min_level: 1 | 2 | 3 | 4 | 5
  mandatory?: boolean
}

type ParsedRequirement = {
  jobRole: string
  jobBand?: string
  requiredCertifications?: string[]
  skills: RequirementSkill[]
}

function parseLevel(input: string | undefined): 1 | 2 | 3 | 4 | 5 {
  if (!input) return 3
  const norm = input.toString().trim().toLowerCase()
  const map: Record<string, 1 | 2 | 3 | 4 | 5> = {
    beginner: 1,
    junior: 2,
    intermediate: 3,
    mid: 3,
    senior: 4,
    advanced: 4,
    expert: 5,
    lead: 5,
  }
  if (map[norm] !== undefined) return map[norm]
  const num = parseInt(norm, 10)
  if ([1, 2, 3, 4, 5].includes(num)) return num as 1 | 2 | 3 | 4 | 5
  return 3
}

function parseBoolean(input: string | undefined): boolean | undefined {
  if (input == null) return undefined
  const norm = input.toString().trim().toLowerCase()
  if (['true', 'yes', 'y', '1'].includes(norm)) return true
  if (['false', 'no', 'n', '0'].includes(norm)) return false
  return undefined
}

function parseCsv(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let inQuotes = false
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    if (ch === '"') {
      if (inQuotes && text[i + 1] === '"') {
        field += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (ch === ',' && !inQuotes) {
      row.push(field)
      field = ''
    } else if ((ch === '\n' || ch === '\r') && !inQuotes) {
      if (ch === '\r' && text[i + 1] === '\n') i++
      row.push(field)
      rows.push(row)
      row = []
      field = ''
    } else {
      field += ch
    }
  }
  row.push(field)
  if (row.length > 1 || row[0].trim() !== '') rows.push(row)
  return rows
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const action = (formData.get('action') as string) || 'parse'

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 })
    }

    if (!file.name.endsWith('.csv') && file.type !== 'text/csv') {
      return NextResponse.json({ success: false, error: 'Please upload a CSV file' }, { status: 400 })
    }

    const text = await file.text()
    const rows = parseCsv(text)
    if (rows.length < 2) {
      return NextResponse.json({ success: false, error: 'CSV must have header and at least one row' }, { status: 400 })
    }

    const headers = rows[0].map((h) => h.trim().toLowerCase())
    
    // More flexible column detection
    const findColumn = (possibleNames: string[]) => {
      for (const name of possibleNames) {
        const idx = headers.indexOf(name.toLowerCase())
        if (idx !== -1) return idx
      }
      return -1
    }
    
    const idx = {
      jobRole: findColumn(['job_role', 'role', 'job role', 'position', 'title']),
      jobBand: findColumn(['job_band', 'band', 'job band', 'level', 'grade']),
      certifications: findColumn(['certifications', 'certs', 'cert', 'certification']),
      skill: findColumn(['skill', 'skills', 'competency', 'competencies']),
      level: findColumn(['level', 'skill_level', 'proficiency', 'rating']),
      mandatory: findColumn(['mandatory', 'required', 'essential', 'must_have']),
    }

    // Provide helpful error message with available columns
    if (idx.jobRole === -1 || idx.skill === -1) {
      const missing = []
      if (idx.jobRole === -1) missing.push('job role (try: job_role, role, position, title)')
      if (idx.skill === -1) missing.push('skill (try: skill, skills, competency)')
      
      return NextResponse.json({
        success: false, 
        error: `Missing required columns: ${missing.join(', ')}. Available columns: ${headers.join(', ')}`,
        availableColumns: headers,
        expectedColumns: ['job_role', 'skill']
      }, { status: 400 })
    }

    const groups = new Map<string, ParsedRequirement>()
    for (let r = 1; r < rows.length; r++) {
      const row = rows[r]
      if (!row || row.length === 0) continue
      const jobRole = (row[idx.jobRole] || '').trim()
      const skill = (row[idx.skill] || '').trim()
      if (!jobRole || !skill) continue
      const jobBand = idx.jobBand >= 0 ? (row[idx.jobBand] || '').trim() : undefined
      const certsRaw = idx.certifications >= 0 ? (row[idx.certifications] || '').trim() : ''
      const requiredCertifications = certsRaw ? certsRaw.split(',').map((c) => c.trim()).filter(Boolean) : []
      const level = parseLevel(idx.level >= 0 ? row[idx.level] : undefined)
      const mandatory = parseBoolean(idx.mandatory >= 0 ? row[idx.mandatory] : undefined)

      const key = `${jobRole}__${jobBand || ''}`
      if (!groups.has(key)) {
        groups.set(key, {
          jobRole,
          jobBand: jobBand || undefined,
          requiredCertifications: requiredCertifications.length ? requiredCertifications : undefined,
          skills: [],
        })
      }
      const grp = groups.get(key)!
      grp.skills.push({ name: skill, min_level: level, mandatory })
    }

    const parsed = Array.from(groups.values())

    if (action === 'parse') {
      return NextResponse.json({ success: true, roles: parsed, totalRoles: parsed.length })
    }

    if (action === 'analyze') {
      const target = parsed[0]
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/competency`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(target),
      })
      const analysis = await res.json()
      return NextResponse.json({ success: true, roles: parsed, analysis })
    }

    return NextResponse.json({ success: true, roles: parsed })
  } catch (error) {
    console.error('Job role requirements CSV parse error:', error)
    return NextResponse.json({ success: false, error: 'Failed to parse CSV' }, { status: 500 })
  }
}
