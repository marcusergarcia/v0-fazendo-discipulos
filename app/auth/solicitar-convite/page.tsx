import { createClient } from "@/lib/supabase/server"
import SolicitarConviteClient from "./solicitar-convite-client"

export default async function SolicitarConvitePage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()

  const { data: discipuladores, error } = await supabase
    .from("profiles")
    .select(
      `
      id,
      nome_completo,
      profile_status,
      discipulador_status,
      discipulos:discipulos!discipulador_id(count)
      `
    )
    .eq("discipulador_status", "ativo")
    .eq("profile_status", "ativo")

  console.log("[v0] Discipuladores encontrados:", discipuladores?.length)
  if (error) console.error("[v0] Erro ao buscar discipuladores:", error)

  return <SolicitarConviteClient discipuladores={discipuladores || []} emailInicial={params.email} />
}
