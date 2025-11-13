import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { PerfilClient } from "./perfil-client"

export default async function PerfilPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  const { data: discipulo } = await supabase.from("discipulos").select("*").eq("user_id", user.id).single()

  console.log("[v0] User ID:", user.id)
  console.log("[v0] Discipulo data:", discipulo)
  console.log("[v0] Discipulador ID:", discipulo?.discipulador_id)

  let nomeDiscipulador = null
  if (discipulo?.discipulador_id) {
    const { data: discipuladorProfile, error } = await supabase
      .from("profiles")
      .select("nome_completo")
      .eq("id", discipulo.discipulador_id)
      .maybeSingle() // Usa maybeSingle para não dar erro se não encontrar

    console.log("[v0] Discipulador Profile:", discipuladorProfile)
    console.log("[v0] Discipulador Error:", error)

    if (error) {
      console.error("[v0] Erro ao buscar discipulador:", error)
      nomeDiscipulador = "Erro ao carregar"
    } else if (discipuladorProfile) {
      nomeDiscipulador = discipuladorProfile.nome_completo
    } else {
      console.warn("[v0] Discipulador não encontrado para ID:", discipulo.discipulador_id)
      nomeDiscipulador = "Não encontrado"
    }
  }

  console.log("[v0] Nome do Discipulador final:", nomeDiscipulador)

  return (
    <PerfilClient
      profile={profile || null}
      discipulo={discipulo || null}
      userId={user.id}
      userEmail={user.email || ""}
      nomeDiscipulador={nomeDiscipulador}
    />
  )
}
