import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import AprovarDiscipuloClient from "./aprovar-discipulo-client"

export default async function AprovarDiscipuloPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: perfil, error: perfilError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .eq("status", "inativo")
    .single()

  if (perfilError || !perfil) {
    console.error("[v0] Perfil não encontrado ou já aprovado:", id)
    redirect("/discipulador/aprovar")
  }

  // Buscar dados do discípulo
  const { data: discipuloData, error: discipuloError } = await supabase
    .from("discipulos")
    .select("*")
    .eq("user_id", id)
    .eq("discipulador_id", user.id)
    .eq("status", "inativo")
    .single()

  if (discipuloError || !discipuloData) {
    console.error("[v0] Discípulo não encontrado ou não pertence a este discipulador:", id)
    redirect("/discipulador/aprovar")
  }

  return <AprovarDiscipuloClient discipulo={perfil} discipuloData={discipuloData} />
}
