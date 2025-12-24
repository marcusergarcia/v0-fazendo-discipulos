"use server"

import { createServerClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function registrarDecisaoPorCristo(data: {
  discipuloId: string
  decisaoPorCristo: boolean
  confissaoFeAssinada: boolean
  nomeAssinatura: string
  jaBatizado: boolean
}) {
  const supabase = await createServerClient()

  try {
    const dataAtual = new Date().toISOString()

    // Atualizar discípulo com decisão e batismo
    const { error: updateError } = await supabase
      .from("discipulos")
      .update({
        decisao_por_cristo: data.decisaoPorCristo,
        data_decisao_por_cristo: dataAtual,
        confissao_fe_assinada: data.confissaoFeAssinada,
        data_assinatura_confissao: dataAtual,
        ja_batizado: data.jaBatizado,
        data_resposta_batismo: dataAtual,
        necessita_fase_batismo: !data.jaBatizado,
      })
      .eq("id", data.discipuloId)

    if (updateError) {
      console.error("[v0] Erro ao atualizar discípulo:", updateError)
      return { success: false, error: updateError.message }
    }

    // Se não foi batizado, ajustar fase para batismo (fase 1.5)
    if (!data.jaBatizado) {
      await supabase
        .from("progresso_fases")
        .update({
          fase_atual: 2, // Fase intermediária de batismo (será 1.5 na UI)
          passo_atual: 1,
          pontuacao_passo_atual: 0,
          celebracao_vista: true, // Já viu a celebração da fase 1
        })
        .eq("discipulo_id", data.discipuloId)

      revalidatePath("/dashboard")
      return {
        success: true,
        message: "Parabéns! Você será direcionado para a fase de preparação para o batismo.",
      }
    }

    // Se já foi batizado, seguir para fase 2 normal
    revalidatePath("/dashboard")
    return {
      success: true,
      message: "Parabéns! Você será direcionado para a Fase 2 - Armadura de Deus.",
    }
  } catch (error) {
    console.error("[v0] Erro ao registrar decisão:", error)
    return { success: false, error: "Erro ao registrar decisão por Cristo" }
  }
}
