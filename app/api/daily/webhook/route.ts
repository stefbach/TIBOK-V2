import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const body = await req.json()

    if (!body) {
      return new NextResponse("Missing body", { status: 400 })
    }

    const { type, data } = body

    if (!type) {
      return new NextResponse("Missing type", { status: 400 })
    }

    if (!data) {
      return new NextResponse("Missing data", { status: 400 })
    }

    if (type === "meeting.ended") {
      const meetingTitle = data.properties?.find((prop: any) => prop.name === "title")?.value
      const meetingId = data.id

      if (!meetingTitle || !meetingId) {
        console.warn("Missing meeting title or ID, skipping database update.")
        return new NextResponse("Missing meeting title or ID", { status: 200 }) // Not an error, just skipping
      }

      const supabase = await createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

      const { error } = await supabase.from("meetings").update({ ended: true }).eq("daily_meeting_id", meetingId)

      if (error) {
        console.error("Error updating meeting in database:", error)
        return new NextResponse("Error updating meeting", { status: 500 })
      }

      console.log(`Meeting ${meetingTitle} (${meetingId}) marked as ended.`)
      return new NextResponse("Meeting updated", { status: 200 })
    } else {
      console.log(`Received webhook of type ${type}, skipping.`)
      return new NextResponse("Webhook received", { status: 200 })
    }
  } catch (error) {
    console.error("Error processing webhook:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
