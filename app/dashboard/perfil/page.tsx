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

  // Buscar perfil com dados de armadura
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  // Buscar discipulo info
  const { data: discipulo } = await supabase
    .from("discipulos")
    .select("xp, level, level_name")
    .eq("user_id", user.id)
    .single()

  // Converter armadura JSONB para array de peças
  const armaduraData = profile?.armadura || {}
  const pecasArmadura = [
    { id: "capacete", nome: "Capacete da Salvação", desbloqueada: armaduraData.capacete || false },
    { id: "couraca", nome: "Couraça da Justiça", desbloqueada: armaduraData.couraca || false },
    { id: "cinto", nome: "Cinturão da Verdade", desbloqueada: armaduraData.cinto || false },
    { id: "calcado", nome: "Calçado da Paz", desbloqueada: armaduraData.calcado || false },
    { id: "escudo", nome: "Escudo da Fé", desbloqueada: armaduraData.escudo || false },
    { id: "espada", nome: "Espada do Espírito", desbloqueada: armaduraData.espada || false },
  ]

  return <PerfilClient user={user} profile={profile} discipulo={discipulo} pecasArmadura={pecasArmadura} />
}
