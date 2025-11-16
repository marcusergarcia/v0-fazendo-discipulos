"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { createSupabaseClient } from "@supabase/supabase-js"

export async function aprovarReflexaoAction(
  reflexaoId: string,
  discipuloId: string,
  xpConcedido: number,
  feedback: string
) {
  try {
    const supabaseAdmin = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    console.log("[v0] Aprovando reflexão server-side:", reflexaoId, "XP:", xpConcedido)

    // Atualizar reflexão com xp_ganho, feedback e data de aprovação
    const { error: updateError } = await supabaseAdmin
      .from("reflexoes_conteudo")
      .update({ 
        xp_ganho: xpConcedido,
        feedback_discipulador: feedback,
        data_aprovacao: new Date().toISOString()
      })
      .eq("id", reflexaoId)

    if (updateError) {
      console.error("[v0] Erro ao atualizar reflexão:", updateError)
      throw updateError
    }

    console.log("[v0] Reflexão atualizada com sucesso")

    // Atualizar pontuação no progresso
    const { data: progresso } = await supabaseAdmin
      .from("progresso_fases")
      .select("pontuacao_total")
      .eq("discipulo_id", discipuloId)
      .single()

    if (progresso) {
      const { error: progressoError } = await supabaseAdmin
        .from("progresso_fases")
        .update({ 
          pontuacao_total: (progresso.pontuacao_total || 0) + xpConcedido 
        })
        .eq("discipulo_id", discipuloId)

      if (progressoError) {
        console.error("[v0] Erro ao atualizar progresso:", progressoError)
      }
    }

    // Atualizar XP total do discípulo
    const { data: disc } = await supabaseAdmin
      .from("discipulos")
      .select("xp_total")
      .eq("id", discipuloId)
      .single()

    if (disc) {
      const { error: discError } = await supabaseAdmin
        .from("discipulos")
        .update({ xp_total: (disc.xp_total || 0) + xpConcedido })
        .eq("id", discipuloId)

      if (discError) {
        console.error("[v0] Erro ao atualizar XP do discípulo:", discError)
      }
    }

    console.log("[v0] XP adicionado ao discípulo")

    // Revalidar as páginas que exibem essas informações
    revalidatePath("/discipulador")
    revalidatePath("/dashboard")
    revalidatePath(`/dashboard/passo/[numero]`, 'page')

    return { success: true, message: `Reflexão aprovada! +${xpConcedido} XP concedido ao discípulo` }
  } catch (error) {
    console.error("[v0] Erro ao aprovar reflexão:", error)
    return { success: false, message: "Erro ao aprovar reflexão. Tente novamente." }
  }
}
