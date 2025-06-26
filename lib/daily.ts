const DAILY_API_URL = "https://api.daily.co/v1"

interface FetchOptions extends RequestInit {
  retries?: number
  retryDelay?: number
}

/**
 * Un wrapper fetch pour interagir avec l'API Daily.co,
 * incluant une logique de tentatives automatiques (retry).
 */
async function fetchWithRetry(endpoint: string, options: FetchOptions = {}): Promise<Response> {
  const { retries = 3, retryDelay = 1000, ...fetchOptions } = options

  const apiKey = process.env.DAILY_API_KEY
  if (!apiKey) {
    // This error will now be caught and displayed more clearly by our API route
    throw new Error(
      "La variable d'environnement DAILY_API_KEY est manquante. Veuillez l'ajouter dans les paramètres de votre projet Vercel.",
    )
  }

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${apiKey}`,
    ...fetchOptions.headers,
  }

  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(`${DAILY_API_URL}${endpoint}`, {
        ...fetchOptions,
        headers,
      })

      if (response.ok) {
        return response
      }

      // Ne pas réessayer pour les erreurs client (4xx)
      if (response.status >= 400 && response.status < 500) {
        const errorData = await response.json()
        console.error(`Erreur client de l'API Daily: ${response.status}`, errorData)
        // Renvoyer la réponse pour que le handler puisse la traiter
        return response
      }

      // Pour les erreurs serveur (5xx), on tente à nouveau
      console.warn(`Erreur serveur de l'API Daily (${response.status}), tentative ${i + 1}/${retries}...`)
    } catch (error) {
      console.error(`Erreur réseau lors de l'appel à l'API Daily, tentative ${i + 1}/${retries}...`, error)
    }
    // Attendre avant la prochaine tentative
    if (i < retries - 1) {
      await new Promise((res) => setTimeout(res, retryDelay * (i + 1)))
    }
  }

  // Si toutes les tentatives échouent, renvoyer une réponse d'erreur
  return new Response(JSON.stringify({ error: "Le service Daily.co est indisponible après plusieurs tentatives." }), {
    status: 503,
    headers: { "Content-Type": "application/json" },
  })
}

export const dailyApi = {
  post: (endpoint: string, body: any, options?: FetchOptions) =>
    fetchWithRetry(endpoint, { method: "POST", body: JSON.stringify(body), ...options }),
  get: (endpoint: string, options?: FetchOptions) => fetchWithRetry(endpoint, { method: "GET", ...options }),
  delete: (endpoint: string, options?: FetchOptions) => fetchWithRetry(endpoint, { method: "DELETE", ...options }),
}
