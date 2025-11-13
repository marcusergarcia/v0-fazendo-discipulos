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

  const { data: discipulo } = await supabase
    .from("discipulos")
    .select("*, discipulador:discipulador_id(nome_completo)")
    .eq("user_id", user.id)
    .single()

  const nomeDiscipulador = (discipulo?.discipulador as any)?.nome_completo || null

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
