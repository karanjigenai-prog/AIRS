import { getExpiringCertsWindow } from "@/lib/analysis"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const items = await getExpiringCertsWindow(90)
    const formattedItems = items.map((r) => {
      let severity: "red" | "amber" | "yellow"
      if (r.daysLeft <= 30) severity = "red"
      else if (r.daysLeft <= 60) severity = "amber"
      else severity = "yellow"
      return { ...r, severity }
    })
    
    return NextResponse.json({ items: formattedItems })
  } catch (error) {
    console.error('Error fetching alerts:', error)
    return NextResponse.json({ error: 'Failed to fetch alerts' }, { status: 500 })
  }
}
