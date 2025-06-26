"use client"

import { createBrowserClient, type SupabaseClient } from "@supabase/ssr"

let browserClient: SupabaseClient<any> | undefined

export function getSupabaseBrowserClient(): SupabaseClient<any> {
  if (!browserClient) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!url || !anonKey) {
      throw new Error("NEXT_PUBLIC_SUPABASE_URL ou NEXT_PUBLIC_SUPABASE_ANON_KEY manquantes.")
    }

    browserClient = createBrowserClient(url, anonKey)
  }
  return browserClient
}

/* Alias attendu ailleurs dans le code */
export const createClient = getSupabaseBrowserClient

export default getSupabaseBrowserClient
