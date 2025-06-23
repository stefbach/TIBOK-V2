"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getSupabaseBrowserClient } from "@/lib/supabase/client" // Utiliser notre client standardisé
// import type { Database } from "@/lib/database.types"; // Implicite via createClient si configuré

import AdminHeader from "@/components/admin/admin-header"
import AdminSidebar from "@/components/admin/admin-sidebar"
import { LanguageProvider } from "@/contexts/language-context"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import { Loader2 } from "lucide-react"

export default function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = getSupabaseBrowserClient() // Utilisation du client de @/lib/supabase/client
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  useEffect(() => {
    console.log("[ProtectedLayout] useEffect triggered. Initializing session check and auth listener.")

    const checkSession = async () => {
      console.log("[ProtectedLayout] checkSession: Called.")
      setIsLoading(true) // Mettre isLoading à true au début de la vérification
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession()

      if (error) {
        console.error("[ProtectedLayout] checkSession: Error getting session:", error)
        setIsAuthenticated(false) // Assumer non authentifié en cas d'erreur
        router.replace("/admin/login")
        setIsLoading(false)
        return
      }

      if (session) {
        console.log("[ProtectedLayout] checkSession: Session found. User ID:", session.user?.id)
        setIsAuthenticated(true)
      } else {
        console.log("[ProtectedLayout] checkSession: No session found. Redirecting to /admin/login.")
        setIsAuthenticated(false)
        router.replace("/admin/login")
      }
      setIsLoading(false)
    }

    checkSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log(
        `[ProtectedLayout] onAuthStateChange: Event - ${event}. Session user ID: ${session?.user?.id ?? "null"}`,
      )

      if (event === "SIGNED_IN") {
        console.log("[ProtectedLayout] onAuthStateChange: SIGNED_IN. Setting isAuthenticated to true.")
        setIsAuthenticated(true)
        // Optionnel: si l'utilisateur est sur la page de login et se connecte, le rediriger.
        // if (router.pathname === '/admin/login') router.replace('/admin');
      } else if (event === "SIGNED_OUT") {
        console.log(
          "[ProtectedLayout] onAuthStateChange: SIGNED_OUT. Setting isAuthenticated to false and redirecting to /admin/login.",
        )
        setIsAuthenticated(false)
        router.replace("/admin/login")
      } else if (event === "USER_UPDATED" || event === "TOKEN_REFRESHED" || event === "INITIAL_SESSION") {
        // Pour INITIAL_SESSION, si la session est null et que l'utilisateur n'est pas sur login, rediriger.
        if (!session && router.pathname !== "/admin/login") {
          // router.pathname n'est pas dispo dans App Router, utiliser usePathname
          console.log(
            "[ProtectedLayout] onAuthStateChange: INITIAL_SESSION with no session. Redirecting to /admin/login.",
          )
          setIsAuthenticated(false)
          router.replace("/admin/login")
        } else if (session) {
          setIsAuthenticated(true)
        }
      }
    })

    return () => {
      console.log("[ProtectedLayout] useEffect cleanup: Unsubscribing from onAuthStateChange.")
      subscription.unsubscribe()
    }
  }, [router, supabase]) // supabase est stable, router peut changer si on utilise next/router au lieu de next/navigation

  if (isLoading) {
    console.log("[ProtectedLayout] Render: isLoading is true. Rendering loading indicator.")
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="flex flex-col items-center">
          <Loader2 className="h-12 w-12 animate-spin text-red-600" />
          <p className="mt-4 text-lg text-gray-700 dark:text-gray-300">Chargement de la session administrateur...</p>
        </div>
      </div>
    )
  }

  console.log(`[ProtectedLayout] Render: isLoading is false. isAuthenticated is ${isAuthenticated}.`)

  if (!isAuthenticated) {
    // Ce log est important. Si on le voit, mais qu'on n'est pas redirigé, il y a un souci.
    // La redirection devrait déjà avoir eu lieu via router.replace() dans useEffect.
    // Si on arrive ici, c'est que la redirection n'a pas encore eu lieu ou a échoué.
    console.log("[ProtectedLayout] Render: Not authenticated. Rendering null (should have been redirected).")
    return null
  }

  console.log("ProtectedAdminLayout: Authenticated, rendering admin content.")
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <LanguageProvider>
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
          <AdminSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
          <div className="flex-1 flex flex-col overflow-hidden">
            <AdminHeader sidebarOpen={isSidebarOpen} setSidebarOpen={setIsSidebarOpen} />
            <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 dark:bg-gray-900 p-4 md:p-6">
              {children}
            </main>
          </div>
        </div>
        <Toaster richColors />
      </LanguageProvider>
    </ThemeProvider>
  )
}
