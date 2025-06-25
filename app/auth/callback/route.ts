import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createServerClient, type CookieOptions } from "@supabase/ssr"

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get("next") ?? "/" // Default to "/" if no next param

  console.log("[AUTH_CALLBACK] Processing request. Origin:", origin)
  console.log("[AUTH_CALLBACK] Code received:", !!code)
  console.log("[AUTH_CALLBACK] Next path parameter:", next)
  console.log("[AUTH_CALLBACK] Full request URL:", request.url)

  if (code) {
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: CookieOptions) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name: string, options: CookieOptions) {
            cookieStore.delete({ name, ...options })
          },
        },
      },
    )
    console.log("[AUTH_CALLBACK] Attempting to exchange code for session...")
    const { error, data } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      console.log(
        "[AUTH_CALLBACK] Successfully exchanged code for session. Session data:",
        data.session ? "Exists" : "Null",
        "User data:",
        data.user ? "Exists" : "Null",
      )
      const redirectUrl = `${origin}${next}`
      console.log("[AUTH_CALLBACK] Redirecting to:", redirectUrl)
      return NextResponse.redirect(redirectUrl)
    }
    console.error("[AUTH_CALLBACK] Error exchanging code for session:", error.message, error)
  } else {
    console.warn("[AUTH_CALLBACK] No code found in searchParams.")
  }

  // return the user to an error page with instructions
  const errorMessage =
    searchParams.get("error_description") || "An unknown auth error occurred or no code was provided."
  console.error("[AUTH_CALLBACK] Redirecting to error page. Message:", errorMessage)
  const errorRedirectUrl = `${origin}/auth/auth-code-error?message=${encodeURIComponent(errorMessage)}`
  console.log("[AUTH_CALLBACK] Error redirect URL:", errorRedirectUrl)
  return NextResponse.redirect(errorRedirectUrl)
}

