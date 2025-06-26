"use client"

import { createBrowserClient, type SupabaseClient } from "@supabase/ssr"
// Si vous avez généré les types :  import type { Database } from "@/lib/database.types"

/**
 * Singleton côté navigateur pour éviter les recréations du client Supabase.
 * Les variables d’environnement NEXT_PUBLIC_ sont automatiquement injectées
 * sur le bundle client par Vercel / Next .js.
 */
let browserClient: SupabaseClient<any> | undefined

/**
 * getSupabaseBrowserClient :
 *  • Fonction principale utilisée dans vos hooks / composants client.
 *  • Toujours exécutée côté navigateur (fichier 'use client').
 */
export function getSupabaseBrowserClient(): SupabaseClient<any> {
  if (!browserClient) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!url || !anonKey) {
      throw new Error("Les variables NEXT_PUBLIC_SUPABASE_URL ou NEXT_PUBLIC_SUPABASE_ANON_KEY sont manquantes.")
    }

    browserClient = createBrowserClient(url, anonKey)
  }
  return browserClient
}

/**
 * Alias createClient :
 * Certains modules attendent un export nommé `createClient`.
 * Nous le faisons simplement pointer vers `getSupabaseBrowserClient`.
 */
export const createClient = getSupabaseBrowserClient

/**
 * Export par défaut : pour plus de flexibilité d’import.
 */
export default getSupabaseBrowserClient
