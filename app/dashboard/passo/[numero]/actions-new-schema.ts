"use server"

import { createServerClient } from "@/lib/supabase-server"
import { revalidatePath } from "next/cache"

interface ProgressoDiscipulo {
  id: string
  discipulo_id: string
  fase_atual: number
  passo_atual: number
  fases_concluidas: number[]
  passos_concluidos: Array<{ fase: number; passo: number }>
  reflexoes_concluidas: number
  pontuacao_temporaria: number
  videos_assistidos: string[]
  artigos_lidos: string[]
  data_inicio_passo: string
  data_ultimo_passo_concluido: string | null
  dias_no_passo_atual: number
  alertado_tempo_excessivo: boolean
}

/**
 * Avançar para o próximo passo
 * - Marca o passo atual como concluído (adiciona ao array)
 * - Transfere pontuação temporária para discipulos.xp_total
 * - Zera contadores de atividades
 * - Atualiza fase/passo atual
 */
export async function avancarProximoPasso(discipuloId: string) {
  const supabase = await createServerClient()

  try {
    // 1. Buscar progresso atual
    const { data: progresso, error: erroProgresso } = await supabase
      .from("progresso_discipulo")
      .select("*")
      .eq("discipulo_id", discipuloId)
      .single()

    if (erroProgresso || !progresso) {
      throw new Error("Progresso não encontrado")
    }

    // 2. Buscar XP total atual do discípulo
    const { data: discipulo, error: erroDiscipulo } = await supabase
      .from("discipulos")
      .select("xp_total, fase_atual, passo_atual")
      .eq("id", discipuloId)
      .single()

    if (erroDiscipulo || !discipulo) {
      throw new Error("Discípulo não encontrado")
    }

    // 3. Calcular próximo passo (simplificado - ajuste conforme sua lógica)
    const proximoPasso = progresso.passo_atual + 1
    let proximaFase = progresso.fase_atual

    // Se passou de 10 passos, vai para próxima fase
    if (proximoPasso > 10) {
      proximaFase = progresso.fase_atual + 1
      // proximoPasso = 1 (será atualizado abaixo)
    }

    // 4. Marcar passo atual como concluído (adicionar ao array)
    const passosConcluidos = [
      ...(progresso.passos_concluidos || []),
      { fase: progresso.fase_atual, passo: progresso.passo_atual },
    ]

    // Se completou a fase, adicionar ao array de fases concluídas
    const fasesConcluidas = [...(progresso.fases_concluidas || [])]
    if (proximoPasso > 10 && !fasesConcluidas.includes(progresso.fase_atual)) {
      fasesConcluidas.push(progresso.fase_atual)
    }

    // 5. Transferir XP temporário para xp_total e atualizar fase/passo no discipulos
    const novoXpTotal = (discipulo.xp_total || 0) + (progresso.pontuacao_temporaria || 0)

    const { error: erroAtualizarDiscipulo } = await supabase
      .from("discipulos")
      .update({
        xp_total: novoXpTotal,
        fase_atual: proximoPasso > 10 ? proximaFase : progresso.fase_atual,
        passo_atual: proximoPasso > 10 ? 1 : proximoPasso,
      })
      .eq("id", discipuloId)

    if (erroAtualizarDiscipulo) {
      throw new Error("Erro ao atualizar XP e passo do discípulo")
    }

    // 6. Atualizar progresso: zerar atividades, atualizar arrays, atualizar passo atual
    const { error: erroAtualizarProgresso } = await supabase
      .from("progresso_discipulo")
      .update({
        fase_atual: proximoPasso > 10 ? proximaFase : progresso.fase_atual,
        passo_atual: proximoPasso > 10 ? 1 : proximoPasso,
        fases_concluidas: fasesConcluidas,
        passos_concluidos: passosConcluidos,
        // Zerar contadores do novo passo
        reflexoes_concluidas: 0,
        pontuacao_temporaria: 0,
        videos_assistidos: [],
        artigos_lidos: [],
        data_inicio_passo: new Date().toISOString(),
        data_ultimo_passo_concluido: new Date().toISOString(),
        dias_no_passo_atual: 0,
        alertado_tempo_excessivo: false,
      })
      .eq("discipulo_id", discipuloId)

    if (erroAtualizarProgresso) {
      throw new Error("Erro ao atualizar progresso")
    }

    revalidatePath("/dashboard")
    revalidatePath(`/dashboard/passo/${proximoPasso > 10 ? 1 : proximoPasso}`)

    return {
      success: true,
      xpGanho: progresso.pontuacao_temporaria || 0,
      novoXpTotal,
      proximaFase: proximoPasso > 10 ? proximaFase : progresso.fase_atual,
      proximoPasso: proximoPasso > 10 ? 1 : proximoPasso,
    }
  } catch (error) {
    console.error("[v0] Erro ao avançar próximo passo:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro desconhecido",
    }
  }
}

/**
 * Atualizar progresso (marcar vídeo assistido, artigo lido, etc.)
 */
export async function atualizarProgresso(
  discipuloId: string,
  updates: {
    videoId?: string
    artigoId?: string
    reflexoesConcluidas?: number
    pontuacaoGanha?: number
  },
) {
  const supabase = await createServerClient()

  try {
    // Buscar progresso atual
    const { data: progresso, error } = await supabase
      .from("progresso_discipulo")
      .select("*")
      .eq("discipulo_id", discipuloId)
      .single()

    if (error || !progresso) {
      throw new Error("Progresso não encontrado")
    }

    // Construir objeto de atualização
    const atualizacao: any = {}

    if (updates.videoId) {
      const videosAtualizados = [...(progresso.videos_assistidos || [])]
      if (!videosAtualizados.includes(updates.videoId)) {
        videosAtualizados.push(updates.videoId)
      }
      atualizacao.videos_assistidos = videosAtualizados
    }

    if (updates.artigoId) {
      const artigosAtualizados = [...(progresso.artigos_lidos || [])]
      if (!artigosAtualizados.includes(updates.artigoId)) {
        artigosAtualizados.push(updates.artigoId)
      }
      atualizacao.artigos_lidos = artigosAtualizados
    }

    if (updates.reflexoesConcluidas !== undefined) {
      atualizacao.reflexoes_concluidas = (progresso.reflexoes_concluidas || 0) + updates.reflexoesConcluidas
    }

    if (updates.pontuacaoGanha !== undefined) {
      atualizacao.pontuacao_temporaria = (progresso.pontuacao_temporaria || 0) + updates.pontuacaoGanha
    }

    // Atualizar progresso
    const { error: erroUpdate } = await supabase
      .from("progresso_discipulo")
      .update(atualizacao)
      .eq("discipulo_id", discipuloId)

    if (erroUpdate) {
      throw new Error("Erro ao atualizar progresso")
    }

    revalidatePath("/dashboard")
    return { success: true }
  } catch (error) {
    console.error("[v0] Erro ao atualizar progresso:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro desconhecido",
    }
  }
}
