import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"

export async function createClient() {
  const cookieStore = await cookies()

  return createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: "pkce",
      storage: {
        getItem: async (key: string) => {
          const cookie = (await cookies()).get(key)
          return cookie?.value ?? null
        },
        setItem: async (key: string, value: string) => {
          try {
            ;(await cookies()).set(key, value, {
              httpOnly: true,
              secure: process.env.NODE_ENV === "production",
              sameSite: "lax",
              maxAge: 60 * 60 * 24 * 7, // 1 week
              path: "/",
            })
          } catch {
            // Ignore errors in middleware
          }
        },
        removeItem: async (key: string) => {
          try {
            ;(await cookies()).delete(key)
          } catch {
            // Ignore errors in middleware
          }
        },
      },
    },
  })
}
