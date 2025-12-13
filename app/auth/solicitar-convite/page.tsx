import { createClient } from "@/lib/supabase/server"
import SolicitarConviteClient from "./solicitar-convite-client"

export default async function SolicitarConvitePage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()

  const { data: discipuladoresData, error: discipuladoresError } = await supabase
    .from("profiles")
    .select("id, nome_completo, profile_status, discipulador_status")
    .eq("discipulador_status", "ativo")
    .eq("profile_status", "ativo")

  // Buscar contagem de discípulos para cada discipulador
  const discipuladores = await Promise.all(
    (discipuladoresData || []).map(async (discipulador) => {
      const { count } = await supabase
        .from("discipulos")
        .select("*", { count: "exact", head: true })
        .eq("discipulador_id", discipulador.id)

      return {
        ...discipulador,
        discipulos: [{ count: count || 0 }],
      }
    }),
  )

  console.log("[v0] Discipuladores encontrados:", discipuladores?.length)
  if (discipuladoresError) console.error("[v0] Erro ao buscar discipuladores:", discipuladoresError)

  return <SolicitarConviteClient discipuladores={discipuladores || []} emailInicial={params.email} />
}
