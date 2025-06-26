"use client"

import { createBrowserClient, type SupabaseClient } from "@supabase/ssr"

/**
 * Returns a singleton Supabase browser client.
 */
let browserClient: SupabaseClient<any> | null = null

export function getSupabaseBrowserClient(): SupabaseClient<any> {
  if (!browserClient) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!url || !anonKey) {
      throw new Error(
        "Environment variables NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be defined.",
      )
    }

    browserClient = createBrowserClient(url, anonKey)
  }
  return browserClient
}

/* Alias kept for backward compatibility across the codebase. */
export const createClient = getSupabaseBrowserClient

export default getSupabaseBrowserClient
