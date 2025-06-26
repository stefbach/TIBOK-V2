import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const room_name = searchParams.get("room_name")

  if (!room_name) {
    return NextResponse.json({ error: "Missing room_name parameter" }, { status: 400 })
  }

  try {
    const supabase = await createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )

    const { data: rooms, error } = await supabase.from("rooms").select("*").eq("room_name", room_name)

    if (error) {
      console.error("Error fetching room:", error)
      return NextResponse.json({ error: "Failed to fetch room" }, { status: 500 })
    }

    if (!rooms || rooms.length === 0) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 })
    }

    return NextResponse.json(rooms[0])
  } catch (e) {
    console.error("Unexpected error:", e)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { room_name, scheduled_time } = await request.json()

    if (!room_name || !scheduled_time) {
      return NextResponse.json({ error: "Missing room_name or scheduled_time in request body" }, { status: 400 })
    }

    const supabase = await createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )

    const { data, error } = await supabase.from("rooms").insert([{ room_name, scheduled_time }]).select()

    if (error) {
      console.error("Error creating room:", error)
      return NextResponse.json({ error: "Failed to create room" }, { status: 500 })
    }

    return NextResponse.json({ message: "Room created successfully", data }, { status: 201 })
  } catch (e) {
    console.error("Unexpected error:", e)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
