import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import ConvitesClient from "./convites-client"

export default async function ConvitesPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  console.log("[v0] ==================== PÁGINA DE CONVITES ====================")
  console.log("[v0] user.id do auth.getUser():", user.id)
  console.log("[v0] user.email do auth.getUser():", user.email)
  console.log("[v0] Tipo do user.id:", typeof user.id)
  console.log("[v0] Comprimento do user.id:", user.id.length)

  // Buscar convites do discipulador
  const { data: convites } = await supabase
    .from("convites")
    .select("*")
    .eq("discipulador_id", user.id)
    .order("data_criacao", { ascending: false })

  console.log("[v0] Convites encontrados para este user.id:", convites?.length || 0)
  console.log("[v0] ==================== FIM PÁGINA DE CONVITES ====================")

  return <ConvitesClient convites={convites || []} userId={user.id} />
}
