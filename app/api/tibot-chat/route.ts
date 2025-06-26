import { openai } from "@ai-sdk/openai"
import { streamText, type CoreMessage } from "ai"

// IMPORTANT! Set the runtime to edge
// export const runtime = 'edge'; // Removed as per instructions for AI SDK

export async function POST(req: Request) {
  const { message, history, language }: { message: string; history: CoreMessage[]; language: "fr" | "en" } =
    await req.json()

  // Use the API key directly here.
  // In a real production app, you'd use process.env.OPENAI_API_KEY
  const apiKey =
    "sk-proj-OFlTWIHBSEKhUCmLgLKcT3BlbkFJ8kOnzasPKcdKl1a77-JOc7dvp3y3kkz4UdCb28UJXCE22uEcrBNcEblCtRwGrI4-_bjkAtoKwA"

  const systemPrompt =
    language === "fr"
      ? `Vous êtes TiBot, un assistant médical IA amical et serviable pour la plateforme TIBOK.
      Votre rôle est de fournir des informations de santé générales, des conseils de base et d'orienter les utilisateurs vers des médecins si nécessaire.
      Ne posez pas de diagnostic. Ne prescrivez pas de médicaments.
      Soyez concis et clair. Répondez toujours en français.
      Si la question est complexe ou nécessite un avis médical, conseillez de consulter un médecin TIBOK.
      Si la question n'est pas liée à la santé, déclinez poliment.
      Voici l'historique de la conversation (les messages les plus récents en dernier):`
      : `You are TiBot, a friendly and helpful AI medical assistant for the TIBOK platform.
      Your role is to provide general health information, basic advice, and guide users to doctors if necessary.
      Do not diagnose. Do not prescribe medication.
      Be concise and clear. Always respond in English.
      If the question is complex or requires medical advice, advise consulting a TIBOK doctor.
      If the question is not health-related, politely decline.
      Here is the conversation history (most recent messages last):`

  const messages: CoreMessage[] = [
    { role: "system", content: systemPrompt },
    ...history,
    { role: "user", content: message },
  ]

  try {
    const result = await streamText({
      model: openai("gpt-4o"), // Pass API key here
      messages,
      temperature: 0.7,
      maxTokens: 300,
    })

    // Respond with the stream
    return result.toDataStreamResponse()
  } catch (error) {
    console.error("Error in TiBot API route:", error)
    let errorMessage = "An unexpected error occurred."
    if (error instanceof Error) {
      errorMessage = error.message
    }
    return Response.json({ error: "Failed to get response from AI.", details: errorMessage }, { status: 500 })
  }
}
