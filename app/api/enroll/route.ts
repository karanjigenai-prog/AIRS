// Route: POST /api/enroll - enroll a user to a training program

import { NextResponse } from "next/server"
import { enrollUserInProgram } from "@/lib/data"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { userId, programId } = body || {}
    
    if (!userId || !programId) {
      return NextResponse.json({ error: "userId and programId required" }, { status: 400 })
    }
    
    const success = await enrollUserInProgram(userId, programId)
    
    if (!success) {
      return NextResponse.json({ error: "Failed to enroll user" }, { status: 500 })
    }
    
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Error enrolling user:', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
