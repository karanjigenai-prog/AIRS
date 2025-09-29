import { NextRequest, NextResponse } from 'next/server'
import { getEmployees, enrollUserInProgram } from '@/lib/data'
import { analyzeGap } from '@/lib/analysis'
import { getTrainingResourcesForSkill } from '@/lib/training-links'

type RequirementSkill = {
  name: string
  min_level: 1 | 2 | 3 | 4 | 5
  mandatory?: boolean
}

type RequirementPayload = {
  jobRole: string
  jobBand?: string
  requiredCertifications?: string[]
  skills: RequirementSkill[]
  teamSize?: number
  autoEnroll?: {
    programId: string
    employeeIds: string[]
  }
}

function meetsJobBand(employeeBand?: string, requiredBand?: string) {
  if (!requiredBand) return true
  if (!employeeBand) return false
  return employeeBand.trim().toLowerCase() === requiredBand.trim().toLowerCase()
}

function hasCertifications(empCerts: { name?: string }[] | string[] | undefined, required: string[] | undefined) {
  if (!required || required.length === 0) return true
  if (!empCerts || (Array.isArray(empCerts) && empCerts.length === 0)) return false
  const names = (empCerts as any[]).map((c) => (typeof c === 'string' ? c : c?.name)).filter(Boolean)
  return required.every((rc) => names.some((n) => String(n).trim().toLowerCase() === rc.trim().toLowerCase()))
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as RequirementPayload
    if (!body || !body.skills || !Array.isArray(body.skills) || body.skills.length === 0) {
      return NextResponse.json({ success: false, error: 'Missing skills in request' }, { status: 400 })
    }

    const employees = await getEmployees()

    const prefiltered = employees.filter((e: any) => {
      const bandOk = meetsJobBand(e?.jobBand || e?.band || e?.roleBand, body.jobBand)
      const certOk = hasCertifications(e?.certifications, body.requiredCertifications)
      return bandOk && certOk
    })

    const gap = await analyzeGap(prefiltered as any, body.skills.map((s) => ({ name: s.name, min_level: s.min_level })))

    const trainableWithTraining = gap.trainable.map((entry) => {
      const missing = [
        ...(entry.reason?.missingSkills || []),
        ...(entry.reason?.belowLevelSkills?.map((b) => b.name) || []),
      ]
      const recos = Array.from(new Set(missing.flatMap((skill) => getTrainingResourcesForSkill(skill))))
      return { ...entry, trainingRecommendations: recos }
    })

    let enrollmentResults: { employeeId: string; ok: boolean }[] | undefined = undefined
    if (body.autoEnroll?.programId && Array.isArray(body.autoEnroll.employeeIds) && body.autoEnroll.employeeIds.length > 0) {
      const programId = body.autoEnroll.programId
      const results: { employeeId: string; ok: boolean }[] = []
      for (const empId of body.autoEnroll.employeeIds) {
        const ok = await enrollUserInProgram(empId, programId)
        results.push({ employeeId: empId, ok })
      }
      enrollmentResults = results
    }

    const aiReasoning = {
      analysisApproach: "Multi-criteria matching based on skills, job band, certifications, and experience",
      filteringSteps: [
        `Initial employee pool: ${employees.length} employees`,
        `Filtered by job band '${body.jobBand || 'any'}': ${prefiltered.length} employees`,
        `Filtered by required certifications: ${prefiltered.length} employees`,
        `Skills gap analysis: ${gap.readyNow.length} ready, ${gap.trainable.length} trainable`
      ],
      matchingCriteria: {
        jobBand: body.jobBand ? `Required: ${body.jobBand}` : "No specific band requirement",
        certifications: body.requiredCertifications?.length ? `Required: ${body.requiredCertifications.join(', ')}` : "No certification requirements",
        skills: body.skills.map(s => `${s.name} (Level ${s.min_level}${s.mandatory ? ', mandatory' : ''})`).join(', ')
      },
      recommendations: [
        gap.readyNow.length > 0 ? `${gap.readyNow.length} employees are ready for immediate assignment` : "No employees are immediately ready",
        gap.trainable.length > 0 ? `${gap.trainable.length} employees can be trained within 2-4 weeks` : "No trainable employees found",
        gap.needsNewHires > 0 ? `${gap.needsNewHires} new hires may be needed` : "Sufficient internal talent available"
      ]
    }

    return NextResponse.json({
      success: true,
      jobRole: body.jobRole,
      jobBand: body.jobBand,
      requiredCertifications: body.requiredCertifications || [],
      aiReasoning,
      counts: {
        considered: employees.length,
        prefiltered: prefiltered.length,
        readyNow: gap.readyNow.length,
        trainable: gap.trainable.length,
        missing: gap.missing.length,
        needsNewHires: gap.needsNewHires,
      },
      readyNow: gap.readyNow,
      trainable: trainableWithTraining,
      missing: gap.missing,
      enrollmentResults,
    })
  } catch (error) {
    console.error('Competency eligibility error:', error)
    return NextResponse.json({ success: false, error: 'Eligibility analysis failed' }, { status: 500 })
  }
}

