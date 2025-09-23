// Gap analysis and alert logic with Supabase integration

import { differenceInCalendarDays, isBefore, addDays, addMonths } from "date-fns"
import type { Employee, RequiredSkill, GapAnalysis, GapEmployeeEntry } from "./types"
import { getEmployees, getSupplyDemand } from "./data"

function findSkillLevel(emp: Employee, name: string) {
  return emp.skills?.find((s) => s.name.toLowerCase() === name.toLowerCase())?.level ?? 0
}

function certsExpiringIn(emp: Employee, days: number) {
  const now = new Date()
  return emp.certifications
    ?.filter((c) => {
      const exp = new Date(c.expires_at)
      const diff = differenceInCalendarDays(exp, now)
      return diff <= days && !isBefore(exp, addDays(now, -1))
    })
    .map((c) => c.name) || []
}

function hasExpiredCerts(emp: Employee) {
  const now = new Date()
  return emp.certifications?.some((c) => isBefore(new Date(c.expires_at), now)) || false
}

function belowLevelDetails(emp: Employee, reqs: RequiredSkill[]) {
  const below = reqs
    .map((r) => {
      const have = findSkillLevel(emp, r.name)
      return have >= r.min_level ? null : { name: r.name, have, need: r.min_level }
    })
    .filter(Boolean) as { name: string; have: number; need: number }[]
  return below
}

export async function analyzeGap(employees: Employee[], reqs: RequiredSkill[]): Promise<GapAnalysis> {
  const readyNow: GapEmployeeEntry[] = []
  const trainable: GapEmployeeEntry[] = []
  const missing: Employee[] = []

  const expiringWindowDays = 90

  employees.forEach((emp) => {
    const below = belowLevelDetails(emp, reqs)
    const missingNames = reqs.filter((r) => findSkillLevel(emp, r.name) === 0).map((r) => r.name)

    const expiring = certsExpiringIn(emp, expiringWindowDays)

    if (below.length === 0 && missingNames.length === 0 && !hasExpiredCerts(emp)) {
      // Fully ready
      readyNow.push({ employee: emp, reason: expiring.length ? { expiringCerts: expiring } : undefined })
    } else if (below.length <= 2 && missingNames.length <= 1) {
      // Considered trainable with an estimate of upskill days ~ 7 per below or missing
      const est = (below.length + missingNames.length) * 7
      trainable.push({
        employee: emp,
        reason: { belowLevelSkills: below, missingSkills: missingNames, expiringCerts: expiring },
        estimatedUpskillDays: est,
      })
    } else {
      missing.push(emp)
    }
  })

  // Needs new hires: If ready + trainable < required team size heuristic
  const heuristicTeamSize = Math.max(2, Math.ceil(reqs.length * 2))
  const needsNewHires = Math.max(0, heuristicTeamSize - (readyNow.length + trainable.length))

  const expiringCertsCount = employees.reduce((acc, e) => acc + certsExpiringIn(e, expiringWindowDays).length, 0)

  return {
    readyNow,
    trainable,
    missing,
    needsNewHires,
    summary: {
      totalEmployees: employees.length,
      readyCount: readyNow.length,
      trainableCount: trainable.length,
      expiringCertsCount,
    },
  }
}

export function findExpiringCertAlerts(employee: Employee) {
  return certsExpiringIn(employee, 90)
}

// Returns array of { employee, certification, daysLeft } for certs expiring within the window
export async function getExpiringCertsWindow(windowDays: number) {
  try {
    const now = new Date()
    const emps = await getEmployees()
    return emps.flatMap((emp) =>
      emp.certifications
        ?.map((cert) => {
          const exp = new Date(cert.expires_at)
          const daysLeft = differenceInCalendarDays(exp, now)
          return { employee: emp, certification: cert, daysLeft }
        })
        .filter((r) => r.daysLeft >= 0 && r.daysLeft <= windowDays) || []
    )
  } catch (error) {
    console.error('Error in getExpiringCertsWindow:', error)
    return []
  }
}

// Simple projection using current demand as baseline with gradual monthly uplift
export async function predict(skill: string, months = 12) {
  try {
    const supplyDemand = await getSupplyDemand()
    const baseline = supplyDemand.find((s) => s.label.toLowerCase() === skill.toLowerCase())?.demand ?? 5

    const start = new Date()
    return Array.from({ length: Math.max(1, months) }).map((_, i) => {
      const d = addMonths(start, i)
      const month = d.toISOString().slice(0, 7) // YYYY-MM
      const growth = 1 + 0.06 * i // ~6% per month
      const noise = (i % 2 === 0 ? 0.5 : -0.3) * (1 + i * 0.1)
      const predictedDemand = Math.max(0, Math.round(baseline * growth + noise))
      return { month, predictedDemand }
    })
  } catch (error) {
    console.error('Error in predict:', error)
    return []
  }
}
