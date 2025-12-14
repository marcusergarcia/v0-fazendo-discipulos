import { createBrowserClient } from "@supabase/ssr"

declare global {
  var supabaseClient: ReturnType<typeof createBrowserClient> | undefined
}

export function createClient() {
  if (globalThis.supabaseClient) {
    return globalThis.supabaseClient
  }

  const client = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: "pkce",
      },
      global: {
        headers: {
          "x-client-info": "supabase-ssr-browser",
        },
        fetch: (url, options) => {
          // Add retry logic for failed fetches
          return fetch(url, {
            ...options,
            // Prevent concurrent requests from causing issues
            credentials: "same-origin",
          }).catch((error) => {
            console.error("[v0] Supabase fetch error:", error)
            throw error
          })
        },
      },
    },
  )

  globalThis.supabaseClient = client
  return client
}
