// Route: GET/POST /api/requests - list and create skill requests with analysis snapshot

import { NextResponse } from "next/server"
import { getEmployees, getRequests, addRequest } from "@/lib/data"
import { analyzeGap } from "@/lib/analysis"
import type { RequiredSkill } from "@/lib/types"

export async function GET() {
  try {
    const requests = await getRequests()
    return NextResponse.json({ requests })
  } catch (error) {
    console.error('Error fetching requests:', error)
    return NextResponse.json({ error: 'Failed to fetch requests' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const skills = (body?.skills || []) as RequiredSkill[]
    const requested_by = (body?.requestedBy || "delivery") as "delivery" | "hr" | "system"

    if (!Array.isArray(skills) || skills.length === 0) {
      return NextResponse.json({ error: "skills required" }, { status: 400 })
    }

    const employees = await getEmployees()
    const analysis = await analyzeGap(employees, skills)
    const saved = await addRequest({ 
      requested_by, 
      skills, 
      analysisSnapshot: analysis 
    })

    if (!saved) {
      return NextResponse.json({ error: "Failed to save request" }, { status: 500 })
    }

    return NextResponse.json({ request: saved, analysis })
  } catch (error) {
    console.error('Error creating request:', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
