import { NextResponse } from "next/server"
import { headers } from "next/headers"
import crypto from "crypto"

/**
 * @route POST /api/daily/webhook
 * @description Reçoit et traite les webhooks de Daily.co.
 */
export async function POST(request: Request) {
  const webhookSecret = process.env.DAILY_WEBHOOK_SECRET
  if (!webhookSecret) {
    console.error("Le secret du webhook Daily (DAILY_WEBHOOK_SECRET) n'est pas configuré.")
    return NextResponse.json({ error: "Configuration serveur incorrecte." }, { status: 500 })
  }

  try {
    // 1. Lire le corps de la requête en tant que texte brut
    const rawBody = await request.text()
    const payload = JSON.parse(rawBody)

    // 2. Vérifier la signature du webhook
    const signatureHeader = headers().get("daily-signature")
    if (!signatureHeader) {
      return NextResponse.json({ error: "Signature manquante." }, { status: 401 })
    }

    const [timestamp, signature] = signatureHeader.split(",").map((part) => part.split("=")[1])
    const expectedSignature = crypto.createHmac("sha256", webhookSecret).update(`${timestamp}.${rawBody}`).digest("hex")

    if (signature !== expectedSignature) {
      console.warn("Tentative de webhook avec une signature invalide.")
      return NextResponse.json({ error: "Signature invalide." }, { status: 401 })
    }

    // 3. Traiter l'événement
    const { type, room_name } = payload
    console.log(`Webhook reçu: ${type} pour la salle ${room_name}`)

    // Simuler la mise à jour de la base de données
    switch (type) {
      case "participant-joined":
        console.log(
          `[DB UPDATE] Mettre à jour le statut de la consultation pour ${room_name}: participant ${payload.participant.user_name} a rejoint.`,
        )
        // Exemple: await db.consultations.update({ where: { roomName: room_name }, data: { status: 'in-progress' } });
        break
      case "participant-left":
        console.log(
          `[DB UPDATE] Mettre à jour le statut de la consultation pour ${room_name}: participant ${payload.participant.user_name} a quitté.`,
        )
        break
      case "room-destroyed":
        console.log(`[DB UPDATE] Mettre à jour le statut de la consultation pour ${room_name}: terminée.`)
        // Exemple: await db.consultations.update({ where: { roomName: room_name }, data: { status: 'completed', endedAt: new Date() } });
        break
      default:
        console.log(`Événement non géré: ${type}`)
    }

    return NextResponse.json({ status: "success" })
  } catch (error) {
    console.error("Erreur lors du traitement du webhook Daily:", error)
    return NextResponse.json({ error: "Erreur interne du serveur." }, { status: 500 })
  }
}
