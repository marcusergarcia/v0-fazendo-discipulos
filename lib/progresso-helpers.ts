"use server"

import { createClient } from "@/lib/supabase/server"

/**
 * Atualiza o progresso do passo atual (sem avançar)
 */
export async function atualizarProgressoPasso(
  discipuloId: string,
  dados: {
    videosAssistidos?: string[]
    artigosLidos?: string[]
    reflexoesConcluidas?: number
    pontuacaoPassoAtual?: number
    diasNoPasso?: number
    alertadoTempoExcessivo?: boolean
    enviadoParaValidacao?: boolean
  },
) {
  const supabase = await createClient()

  const updates: any = {}
  if (dados.videosAssistidos !== undefined) updates.videos_assistidos = dados.videosAssistidos
  if (dados.artigosLidos !== undefined) updates.artigos_lidos = dados.artigosLidos
  if (dados.reflexoesConcluidas !== undefined) updates.reflexoes_concluidas = dados.reflexoesConcluidas
  if (dados.pontuacaoPassoAtual !== undefined) updates.pontuacao_passo_atual = dados.pontuacaoPassoAtual
  if (dados.diasNoPasso !== undefined) updates.dias_no_passo = dados.diasNoPasso
  if (dados.alertadoTempoExcessivo !== undefined) updates.alertado_tempo_excessivo = dados.alertadoTempoExcessivo
  if (dados.enviadoParaValidacao !== undefined) updates.enviado_para_validacao = dados.enviadoParaValidacao

  const { error } = await supabase.from("progresso_discipulo").update(updates).eq("discipulo_id", discipuloId)

  if (error) {
    console.error("[v0] Erro ao atualizar progresso:", error)
    throw error
  }

  return { sucesso: true }
}

/**
 * Avança para o próximo passo
 * - Transfere XP do passo atual para discipulos.xp_total
 * - Zera contadores (vídeos, artigos, reflexões, pontuação)
 * - Adiciona passo atual aos arrays de concluídos
 */
export async function avancarProximoPasso(discipuloId: string, novaFase: number, novoPasso: number) {
  const supabase = await createClient()

  console.log("[v0] Avançando passo:", {
    discipuloId,
    novaFase,
    novoPasso,
  })

  // Chama a função do PostgreSQL que faz tudo atomicamente
  const { data, error } = await supabase.rpc("avancar_proximo_passo", {
    p_discipulo_id: discipuloId,
    p_nova_fase: novaFase,
    p_novo_passo: novoPasso,
  })

  if (error) {
    console.error("[v0] Erro ao avançar passo:", error)
    throw error
  }

  console.log("[v0] Passo avançado com sucesso:", data)
  return data
}

/**
 * Busca o progresso completo de um discípulo
 */
export async function buscarProgressoDiscipulo(discipuloId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("progresso_discipulo")
    .select("*")
    .eq("discipulo_id", discipuloId)
    .single()

  if (error) {
    console.error("[v0] Erro ao buscar progresso:", error)
    return null
  }

  return data
}

/**
 * Cria registro de progresso inicial para novo discípulo
 */
export async function criarProgressoInicial(discipuloId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("progresso_discipulo")
    .insert({
      discipulo_id: discipuloId,
      fase_atual: 1,
      passo_atual: 1,
      videos_assistidos: [],
      artigos_lidos: [],
      reflexoes_concluidas: 0,
      pontuacao_passo_atual: 0,
    })
    .select()
    .single()

  if (error) {
    console.error("[v0] Erro ao criar progresso inicial:", error)
    throw error
  }

  return data
}
