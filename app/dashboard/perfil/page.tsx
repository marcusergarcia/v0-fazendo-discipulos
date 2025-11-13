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

  let nomeDiscipulador: string | null = null

  if (discipulo?.discipulador_id) {
    try {
      const { data: discipuladorProfile, error } = await supabase
        .from("profiles")
        .select("nome_completo")
        .eq("id", discipulo.discipulador_id)
        .maybeSingle()

      if (error) {
        console.error("[v0] Erro ao buscar discipulador:", error)
      } else if (discipuladorProfile) {
        nomeDiscipulador = discipuladorProfile.nome_completo
      } else {
        console.warn("[v0] Perfil do discipulador não encontrado para ID:", discipulo.discipulador_id)
      }
    } catch (err) {
      console.error("[v0] Exceção ao buscar discipulador:", err)
    }
  }

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
