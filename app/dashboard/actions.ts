"use server"

import { createServerClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function registrarDecisaoPorCristo(data: {
  discipuloId: string
  decisaoPorCristo: boolean
  confissaoFeAssinada: boolean
  nomeAssinatura: string
  dataAssinatura: string
  jaBatizado: boolean
}) {
  const supabase = await createServerClient()

  try {
    console.log("[v0] Registrando decisão por Cristo:", data)

    const dataAtual = new Date().toISOString()

    const { error: updateError } = await supabase
      .from("discipulos")
      .update({
        decisao_por_cristo: data.decisaoPorCristo,
        data_decisao_por_cristo: dataAtual,
        confissao_fe_assinada: data.confissaoFeAssinada,
        data_assinatura_confissao: data.dataAssinatura,
        nome_assinatura_confissao: data.nomeAssinatura,
        ja_batizado: data.jaBatizado,
        data_resposta_batismo: dataAtual,
        necessita_fase_batismo: !data.jaBatizado,
        fase_atual: 1,
        passo_atual: 1,
      })
      .eq("id", data.discipuloId)

    if (updateError) {
      console.error("[v0] Erro ao atualizar discípulo:", updateError)
      return { success: false, error: updateError.message }
    }

    console.log("[v0] Discípulo atualizado com sucesso")

    if (!data.jaBatizado) {
      console.log("[v0] Discípulo não batizado, direcionando para fase intermediária de batismo")

      const { error: progressoError } = await supabase
        .from("progresso_fases")
        .update({
          fase_atual: 1, // Permanece na fase 1, mas com flag de batismo
          passo_atual: 1,
          pontuacao_passo_atual: 0,
          celebracao_vista: true,
          videos_assistidos: [],
          artigos_lidos: [],
        })
        .eq("discipulo_id", data.discipuloId)

      if (progressoError) {
        console.error("[v0] Erro ao atualizar progresso:", progressoError)
      }

      revalidatePath("/dashboard")
      return {
        success: true,
        message: "Parabéns! Você será direcionado para a fase de preparação para o batismo.",
      }
    }

    console.log("[v0] Discípulo já batizado, seguindo para Fase 2 - Armadura de Deus")

    const { error: progressoError } = await supabase
      .from("progresso_fases")
      .update({
        fase_atual: 2, // Fase 2 - Armadura de Deus
        passo_atual: 1,
        pontuacao_passo_atual: 0,
        celebracao_vista: true,
        videos_assistidos: [],
        artigos_lidos: [],
      })
      .eq("discipulo_id", data.discipuloId)

    if (progressoError) {
      console.error("[v0] Erro ao atualizar progresso:", progressoError)
    }

    await supabase.from("discipulos").update({ fase_atual: 2, passo_atual: 1 }).eq("id", data.discipuloId)

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
