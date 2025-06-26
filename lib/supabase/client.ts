import { createBrowserClient, type SupabaseClient } from "@supabase/ssr"
// Si vous avez généré les types pour votre base de données (par exemple avec `supabase gen types typescript > lib/database.types.ts`)
// import type { Database } from '@/lib/database.types'

// Remplacez 'any' par 'Database' si vous avez les types
let clientInstance: SupabaseClient<any> | undefined

export function getSupabaseBrowserClient() {
  if (clientInstance) {
    return clientInstance
  }

  clientInstance = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  return clientInstance
}
