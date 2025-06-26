import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  const cookieStore = cookies()
  const supabase = await createRouteHandlerClient({ cookies: () => cookieStore })

  try {
    const req = await request.json()
    const { prompt } = req

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
    }

    // Basic prompt injection prevention (can be improved)
    if (prompt.toLowerCase().includes("ignore previous instructions")) {
      return NextResponse.json({ error: "Prompt blocked due to potential injection" }, { status: 400 })
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        stream: false,
      }),
    })

    if (!response.ok) {
      console.error("OpenAI API Error:", response.status, response.statusText)
      const errorData = await response.json()
      console.error("OpenAI API Error Details:", errorData)
      return NextResponse.json({ error: "Failed to generate response from OpenAI" }, { status: 500 })
    }

    const data = await response.json()

    if (!data.choices || data.choices.length === 0) {
      return NextResponse.json({ error: "No response from OpenAI" }, { status: 500 })
    }

    const aiResponse = data.choices[0].message.content

    return NextResponse.json({ output: aiResponse })
  } catch (e) {
    console.error("Server error:", e)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
