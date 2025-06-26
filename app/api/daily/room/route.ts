import { NextResponse } from "next/server"
import { dailyApi } from "@/lib/daily"

/**
 * @route POST /api/daily/room
 * @description Crée une nouvelle salle de consultation sur Daily.co.
 * @body { doctorId: string, patientId: string, consultationId: string }
 * @returns { roomUrl: string, roomName: string }
 */
export async function POST(request: Request) {
  try {
    const { consultationId } = await request.json()

    if (!consultationId) {
      return NextResponse.json({ error: "consultationId est requis." }, { status: 400 })
    }

    const roomName = `tibok-consult-${consultationId}-${Date.now()}`
    const twoHoursFromNow = Math.round(Date.now() / 1000) + 7200 // 2 heures

    const response = await dailyApi.post("/rooms", {
      name: roomName,
      privacy: "private",
      properties: {
        max_participants: 2,
        start_video_off: false,
        start_audio_off: false,
        enable_recording: "cloud",
        exp: twoHoursFromNow,
        // Stocker des métadonnées utiles
        eject_at_room_exp: true,
        metadata: {
          consultationId: consultationId,
        },
      },
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error("Erreur lors de la création de la salle Daily:", errorData)
      return NextResponse.json(
        { error: "Impossible de créer la salle de consultation.", details: errorData },
        { status: response.status },
      )
    }

    const room = await response.json()

    return NextResponse.json({ roomUrl: room.url, roomName: room.name })
  } catch (error) {
    console.error("Erreur interne dans /api/daily/room:", error)
    return NextResponse.json({ error: "Erreur interne du serveur." }, { status: 500 })
  }
}
