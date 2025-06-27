import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

// Fonction pour mettre à jour la session (similaire à votre updateSession actuel mais utilisant supabase-ssr)
// et potentiellement récupérer des données utilisateur pour les vérifications.
async function updateSessionAndGetUser(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
        },
      },
    },
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Si l'utilisateur existe, nous pourrions aussi récupérer son profil ici
  // pour vérifier profile_completed, etc.
  // Pour l'instant, nous retournons juste l'utilisateur et la réponse.
  // Exemple (nécessite que la table 'profiles' et la colonne 'profile_completed' existent):
  let userProfile = null
  if (user) {
    const { data: profile } = await supabase
      .from("profiles") // ou 'Users' selon votre schéma final pour ce flag
      .select("profile_completed, id") // 'id' pour confirmer que c'est le bon profil
      .eq("id", user.id)
      .single()
    userProfile = profile
  }

  return { supabase, user, userProfile, supabaseResponse }
}

export async function middleware(request: NextRequest) {
  console.log("[Middleware] Requête reçue pour:", request.nextUrl.pathname)
  const { supabase, user, userProfile, supabaseResponse } = await updateSessionAndGetUser(request)
  const { pathname } = request.nextUrl

  // Définir les routes publiques (accessibles sans authentification)
  const publicPaths = ["/", "/start-consultation", "/auth/callback", "/api/auth", "/payment"] // Ajoutez d'autres routes publiques au besoin

  // Définir les routes protégées qui nécessitent un profil complet et un abonnement actif
  // (Exemple: toutes les routes sous /dashboard et /consultation/[id])
  const protectedPaths = ["/dashboard", "/consultation"] // Utilisez des préfixes

  const isPublicPath = publicPaths.some(
    (path) =>
      pathname === path || (path.endsWith("/") && pathname.startsWith(path)) || pathname.startsWith("/api/auth"),
  )
  const isApiPath = pathname.startsWith("/api/") // Exclure les API de la logique de redirection UI pour l'instant, sauf /api/auth

  console.log(
    `[Middleware] Path: ${pathname}, User: ${user?.id}, Profile: ${JSON.stringify(userProfile)}, IsPublic: ${isPublicPath}`,
  )

  // Si l'utilisateur n'est pas connecté et essaie d'accéder à une route non publique (et non API)
  if (!user && !isPublicPath && !isApiPath) {
    console.log(
      "[Middleware] Utilisateur non connecté tentant d'accéder à une route protégée. Redirection vers /start-consultation.",
    )
    const redirectUrl = new URL("/start-consultation", request.url)
    redirectUrl.searchParams.set("next", pathname) // Garder la page de destination
    return NextResponse.redirect(redirectUrl)
  }

  // Si l'utilisateur est connecté
  if (user) {
    // Si l'utilisateur est connecté et essaie d'accéder à /start-consultation (sauf si c'est pour compléter le profil)
    // et que son profil est déjà complet, le rediriger vers le dashboard.
    // La vérification de `profile_completed` se fait ici.
    if (pathname === "/start-consultation" && userProfile?.profile_completed) {
      // TODO: Ajouter une vérification de l'abonnement actif ici.
      // Si abonnement actif, rediriger vers dashboard. Sinon, peut-être vers une page de paiement/abonnement.
      console.log(
        "[Middleware] Utilisateur connecté avec profil complet sur /start-consultation. Redirection vers /dashboard.",
      )
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }

    // Logique de protection des routes basée sur profile_completed et abonnement
    const needsProtection = protectedPaths.some((path) => pathname.startsWith(path))
    if (needsProtection) {
      if (!userProfile?.profile_completed) {
        console.log(
          "[Middleware] Accès à une route protégée sans profil complet. Redirection vers /start-consultation?step=3.",
        )
        const redirectUrl = new URL("/start-consultation", request.url)
        redirectUrl.searchParams.set("step", "3") // Étape des informations personnelles
        redirectUrl.searchParams.set("message", "complete_profile_required")
        return NextResponse.redirect(redirectUrl)
      }

      // TODO: Vérification de l'abonnement actif
      // const { data: activeSubscription } = await supabase
      //   .from('subscriptions')
      //   .select('*')
      //   .eq('user_id', user.id)
      //   .eq('status', 'active')
      //   .maybeSingle();
      //
      // if (!activeSubscription) {
      //   console.log('[Middleware] Accès à une route protégée sans abonnement actif. Redirection vers /payment ou /select-plan.');
      //   // Déterminer la bonne page de redirection (ex: /payment?reason=no_subscription)
      //   return NextResponse.redirect(new URL('/payment?reason=no_subscription', request.url));
      // }
      console.log("[Middleware] Accès autorisé à la route protégée pour utilisateur avec profil complet:", pathname)
    }
  }

  // Si aucune redirection n'est nécessaire, retourner la réponse de mise à jour de session.
  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
