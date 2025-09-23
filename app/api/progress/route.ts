// Route: POST /api/progress - update user training progress

import { NextResponse } from "next/server"
import { updateTrainingProgress } from "@/lib/data"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { userId, programId, progress } = body || {}
    
    if (!userId || !programId || typeof progress !== "number") {
      return NextResponse.json({ error: "userId, programId, progress required" }, { status: 400 })
    }
    
    const success = await updateTrainingProgress(userId, programId, Math.max(0, Math.min(100, progress)))
    
    if (!success) {
      return NextResponse.json({ error: "Failed to update progress" }, { status: 500 })
    }
    
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Error updating progress:', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
