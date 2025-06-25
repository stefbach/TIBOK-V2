import { createBrowserClient, type SupabaseClient } from "@supabase/ssr"
// Si vous avez généré les types pour votre base de données (par exemple avec `supabase gen types typescript > lib/database.types.ts`)
// import type { Database } from '@/lib/database.types'

// Remplacez 'any' par 'Database' si vous avez les types
let clientInstance: SupabaseClient<any> | undefined

export function getSupabaseBrowserClient() {
  console.log("[getSupabaseBrowserClient] Function called.")

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  console.log("[getSupabaseBrowserClient] NEXT_PUBLIC_SUPABASE_URL:", supabaseUrl ? "Exists" : "MISSING or undefined")
  console.log(
    "[getSupabaseBrowserClient] NEXT_PUBLIC_SUPABASE_ANON_KEY:",
    supabaseAnonKey ? "Exists" : "MISSING or undefined",
  )

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error(
      "[getSupabaseBrowserClient] CRITICAL ERROR: Supabase URL or Anon Key is missing. Ensure they are set in production environment variables.",
    )
    // Vous pourriez vouloir jeter une erreur ici ou retourner un client factice / null
    // pour éviter des erreurs en cascade, mais pour le débogage, le log est crucial.
    // throw new Error("Supabase URL or Anon Key is missing."); // Décommenter pour un échec plus bruyant
  }

  if (clientInstance) {
    console.log("[getSupabaseBrowserClient] Returning existing client instance.")
    return clientInstance
  }

  console.log("[getSupabaseBrowserClient] Creating new Supabase client instance...")
  try {
    clientInstance = createBrowserClient(
      supabaseUrl!, // Le '!' est ici car nous avons vérifié au-dessus, mais soyez conscient
      supabaseAnonKey!,
    )
    console.log("[getSupabaseBrowserClient] New Supabase client instance CREATED successfully.")
  } catch (error) {
    console.error("[getSupabaseBrowserClient] CRITICAL ERROR creating Supabase client:", error)
    // throw error; // Rediffuser l'erreur pour un échec plus bruyant
  }

  return clientInstance
}
