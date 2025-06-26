import { NextResponse } from "next/server"
import { dailyApi } from "@/lib/daily"

/**
 * @route POST /api/daily/join
 * @description Génère un token pour rejoindre une salle Daily.co.
 * @body { roomName: string, userName: string, userType: 'patient' | 'doctor' }
 * @returns { token: string }
 */
export async function POST(request: Request) {
  try {
    const { roomName, userName, userType } = await request.json()

    if (!roomName || !userName || !userType) {
      return NextResponse.json({ error: "roomName, userName, et userType sont requis." }, { status: 400 })
    }

    const twoHoursFromNow = Math.round(Date.now() / 1000) + 7200 // 2 heures

    const properties = {
      room_name: roomName,
      user_name: userName,
      exp: twoHoursFromNow,
      // Le médecin est propriétaire de la salle, le patient ne l'est pas.
      is_owner: userType === "doctor",
      // Permissions spécifiques
      enable_screenshare: userType === "doctor",
      enable_recording: userType === "doctor",
    }

    const response = await dailyApi.post("/meeting-tokens", properties)

    if (!response.ok) {
      const errorData = await response.json()
      console.error("Erreur lors de la création du token Daily:", errorData)
      return NextResponse.json(
        { error: "Impossible de générer le token de participation.", details: errorData },
        { status: response.status },
      )
    }

    const { token } = await response.json()

    return NextResponse.json({ token })
  } catch (error) {
    console.error("Erreur interne dans /api/daily/join:", error)
    return NextResponse.json({ error: "Erreur interne du serveur." }, { status: 500 })
  }
}
