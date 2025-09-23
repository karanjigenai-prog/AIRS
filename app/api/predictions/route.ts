import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { predict } from "@/lib/analysis"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const skill = searchParams.get("skill") ?? "AWS"
    const months = Number(searchParams.get("months") ?? 12)
    
    const points = await predict(skill, months)
    return NextResponse.json({ points })
  } catch (error) {
    console.error('Error generating predictions:', error)
    return NextResponse.json({ error: 'Failed to generate predictions' }, { status: 500 })
  }
}
