import type { createBrowserClient } from "@supabase/ssr"

const client: ReturnType<typeof createBrowserClient> | null = null

export { createClient } from "./supabase/client"
