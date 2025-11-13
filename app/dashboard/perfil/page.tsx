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

  let nomeDiscipulador = null
  if (discipulo?.discipulador_id) {
    const { data: discipuladorProfile } = await supabase
      .from("profiles")
      .select("nome_completo")
      .eq("id", discipulo.discipulador_id)
      .single()

    nomeDiscipulador = discipuladorProfile?.nome_completo || null
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
