"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"
import { getPerguntasPasso } from "@/constants/perguntas-passos"

export async function aprovarReflexao(data: {
  reflexaoId: string
  discipuloId: string
  passoAtual: number
  tipo: string
  conteudoId: string
  feedback: string
  xpConcedido: number
}) {
  const adminClient = createAdminClient()

  try {
    console.log("[v0] ===== INICIANDO APROVAÇÃO DE REFLEXÃO (SERVER ACTION) =====")
    console.log("[v0] Reflexão ID:", data.reflexaoId)
    console.log("[v0] Discípulo ID:", data.discipuloId)
    console.log("[v0] Tipo:", data.tipo)
    console.log("[v0] Conteúdo ID:", data.conteudoId)

    const { data: reflexaoAtual, error: selectError } = await adminClient
      .from("reflexoes_passo")
      .select("id, tipo, conteudos_ids, feedbacks, xp_ganho, discipulo_id, passo_numero")
      .eq("id", data.reflexaoId)
      .maybeSingle()

    if (selectError || !reflexaoAtual) {
      console.error("[v0] ERRO: Reflexão não encontrada!", selectError)
      return { success: false, error: "Reflexão não encontrada" }
    }

    const feedbacksArray = (reflexaoAtual.feedbacks as any[]) || []

    // Verificar se já tem feedback para este conteúdo
    const feedbackExistente = feedbacksArray.find((f: any) => f.conteudo_id === data.conteudoId)
    if (feedbackExistente) {
      console.log("[v0] Reflexão já aprovada")
      return { success: false, error: "Reflexão já aprovada" }
    }

    feedbacksArray.push({
      conteudo_id: data.conteudoId,
      feedback_discipulador: data.feedback,
      xp_ganho: data.xpConcedido,
    })

    // Calcular XP total ganho nesta reflexão
    const xpTotalReflexao = feedbacksArray.reduce((sum: number, f: any) => sum + (f.xp_ganho || 0), 0)

    // Verificar se todos os conteúdos foram aprovados
    const conteudosIds = reflexaoAtual.conteudos_ids || []
    const todosConteudosAprovados = conteudosIds.every((id: string) =>
      feedbacksArray.some((f: any) => f.conteudo_id === id),
    )

    const novoStatus = todosConteudosAprovados ? "aprovado" : "enviado"

    // Atualizar reflexão com feedback, xp_ganho e situacao
    const { data: reflexaoAtualizada, error: updateError } = await adminClient
      .from("reflexoes_passo")
      .update({
        feedbacks: feedbacksArray,
        xp_ganho: xpTotalReflexao,
        situacao: novoStatus,
      })
      .eq("id", reflexaoAtual.id)
      .select()

    if (updateError || !reflexaoAtualizada || reflexaoAtualizada.length === 0) {
      console.error("[v0] ERRO ao atualizar reflexão:", updateError)
      return { success: false, error: "Erro ao atualizar reflexão" }
    }

    console.log("[v0] Reflexão atualizada com sucesso - Status:", novoStatus)

    // Atualizar progresso_fases
    const { data: progresso } = await adminClient
      .from("progresso_fases")
      .select("*")
      .eq("discipulo_id", data.discipuloId)
      .single()

    if (progresso) {
      const pontuacaoAtual = progresso.pontuacao_passo_atual || 0
      const reflexoesConcluidas = progresso.reflexoes_concluidas || 0

      await adminClient
        .from("progresso_fases")
        .update({
          pontuacao_passo_atual: pontuacaoAtual + data.xpConcedido,
          reflexoes_concluidas: reflexoesConcluidas + 1,
        })
        .eq("id", progresso.id)

      console.log("[v0] XP adicionado à pontuação do passo:", data.xpConcedido)
    }

    // Deletar notificação relacionada
    const { data: notificacao } = await adminClient
      .from("notificacoes")
      .select("id")
      .eq("reflexao_id", data.reflexaoId)
      .maybeSingle()

    if (notificacao) {
      await adminClient.from("notificacoes").delete().eq("id", notificacao.id)
      console.log("[v0] Notificação deletada")
    }

    // Verificar se todas as reflexões foram aprovadas
    const { data: todasReflexoes } = await adminClient
      .from("reflexoes_passo")
      .select("tipo, conteudos_ids, feedbacks")
      .eq("discipulo_id", data.discipuloId)
      .eq("passo_numero", data.passoAtual)

    let todasReflexoesAprovadas = false
    if (todasReflexoes && todasReflexoes.length > 0) {
      todasReflexoesAprovadas = todasReflexoes.every((r: any) => {
        const feedbacks = (r.feedbacks as any[]) || []
        const conteudos = r.conteudos_ids || []
        return conteudos.every((conteudoId: string) => feedbacks.some((f: any) => f.conteudo_id === conteudoId))
      })
    }

    // Verificar perguntas reflexivas
    const { data: perguntasReflexivas } = await adminClient
      .from("perguntas_reflexivas")
      .select("situacao")
      .eq("discipulo_id", data.discipuloId)
      .eq("passo_numero", data.passoAtual)
      .maybeSingle()

    const perguntasReflexivasAprovadas = perguntasReflexivas?.situacao === "aprovado"

    // Se tudo aprovado, verificar leitura bíblica e liberar próximo passo
    if (todasReflexoesAprovadas && perguntasReflexivasAprovadas) {
      console.log("[v0] Todas reflexões e perguntas aprovadas! Verificando leitura...")

      const { data: planoSemana } = await adminClient
        .from("plano_leitura_biblica")
        .select("capitulos_semana")
        .eq("semana", data.passoAtual)
        .single()

      let leituraBiblicaConcluida = false
      if (planoSemana?.capitulos_semana) {
        const { data: leiturasDiscipulo } = await adminClient
          .from("leituras_capitulos")
          .select("capitulos_lidos")
          .eq("discipulo_id", data.discipuloId)
          .single()

        const capitulosLidos = new Set(leiturasDiscipulo?.capitulos_lidos || [])
        leituraBiblicaConcluida = planoSemana.capitulos_semana.every((cap: string) =>
          capitulosLidos.has(Number.parseInt(cap)),
        )
      }

      if (leituraBiblicaConcluida) {
        // Transferir XP do passo para xp_total
        const { data: progressoCompleto } = await adminClient
          .from("progresso_fases")
          .select("pontuacao_passo_atual")
          .eq("discipulo_id", data.discipuloId)
          .single()

        const pontosDoPassoCompleto = progressoCompleto?.pontuacao_passo_atual || 0

        // Resetar progresso do passo
        await adminClient
          .from("progresso_fases")
          .update({
            pontuacao_passo_atual: 0,
            reflexoes_concluidas: 0,
          })
          .eq("discipulo_id", data.discipuloId)

        // Transferir XP para o discípulo
        const { data: disc } = await adminClient
          .from("discipulos")
          .select("xp_total, passo_atual")
          .eq("id", data.discipuloId)
          .single()

        if (disc) {
          const proximoPasso = data.passoAtual + 1

          await adminClient
            .from("discipulos")
            .update({
              xp_total: (disc.xp_total || 0) + pontosDoPassoCompleto,
              passo_atual: proximoPasso <= 10 ? proximoPasso : disc.passo_atual,
            })
            .eq("id", data.discipuloId)

          console.log("[v0] XP transferido e próximo passo liberado!")

          return {
            success: true,
            message: `Reflexão aprovada! Passo ${data.passoAtual} concluído. Passo ${proximoPasso} liberado!`,
            xpConcedido: data.xpConcedido,
          }
        }
      } else {
        return {
          success: true,
          message: `Reflexão aprovada! +${data.xpConcedido} XP`,
          warning: `Leitura bíblica da semana ${data.passoAtual} ainda não foi concluída`,
          xpConcedido: data.xpConcedido,
        }
      }
    }

    console.log("[v0] ===== APROVAÇÃO CONCLUÍDA COM SUCESSO =====")
    return {
      success: true,
      message: `Reflexão aprovada! +${data.xpConcedido} XP será creditado ao completar o passo`,
      xpConcedido: data.xpConcedido,
    }
  } catch (error) {
    console.error("[v0] Erro ao aprovar reflexão:", error)
    return { success: false, error: "Erro ao aprovar reflexão" }
  } finally {
    revalidatePath("/discipulador")
  }
}

export async function aprovarPerguntaReflexiva(data: {
  perguntasReflexivasId: string
  perguntaId: number
  discipuloId: string
  passoAtual: number
  faseNumero: number
  feedback: string
  xpConcedido: number
}) {
  const adminClient = createAdminClient()

  try {
    console.log("[v0] ===== INICIANDO APROVAÇÃO DE PERGUNTA REFLEXIVA INDIVIDUAL =====")
    console.log("[v0] Perguntas Reflexivas ID:", data.perguntasReflexivasId)
    console.log("[v0] Pergunta ID:", data.perguntaId)

    // Buscar o registro atual
    const { data: perguntasReflexivas, error: selectError } = await adminClient
      .from("perguntas_reflexivas")
      .select("*")
      .eq("id", data.perguntasReflexivasId)
      .maybeSingle()

    if (selectError || !perguntasReflexivas) {
      console.error("[v0] ERRO: Perguntas reflexivas não encontradas!", selectError)
      return { success: false, error: "Perguntas reflexivas não encontradas" }
    }

    const respostasArray = (perguntasReflexivas.respostas as any[]) || []

    // Encontrar a resposta específica desta pergunta
    const respostaIndex = respostasArray.findIndex((r: any) => r.pergunta_id === data.perguntaId)

    if (respostaIndex === -1) {
      console.error("[v0] ERRO: Resposta não encontrada para pergunta_id", data.perguntaId)
      return { success: false, error: "Resposta não encontrada" }
    }

    // Atualizar esta resposta específica com o feedback
    respostasArray[respostaIndex] = {
      ...respostasArray[respostaIndex],
      situacao: "aprovado",
      xp_ganho: data.xpConcedido,
      feedback: data.feedback,
      data_aprovacao: new Date().toISOString(),
    }

    const perguntasEsperadas = getPerguntasPasso(data.passoAtual)
    const totalPerguntasEsperadas = perguntasEsperadas.length

    const perguntasAprovadas = respostasArray.filter((r: any) => r.situacao === "aprovado").length
    const todasAprovadas = perguntasAprovadas === totalPerguntasEsperadas

    const xpTotal = respostasArray
      .filter((r: any) => r.situacao === "aprovado")
      .reduce((sum: number, r: any) => sum + (r.xp_ganho || 0), 0)

    console.log(
      "[v0] Passo:",
      data.passoAtual,
      "- Esperadas:",
      totalPerguntasEsperadas,
      "- Aprovadas:",
      perguntasAprovadas,
      "- Todas aprovadas?",
      todasAprovadas,
      "XP Total:",
      xpTotal,
    )

    // Atualizar o registro
    const updateData: any = {
      respostas: respostasArray,
    }

    // Se todas foram aprovadas, atualizar status global
    if (todasAprovadas) {
      updateData.situacao = "aprovado"
      updateData.xp_ganho = xpTotal
      updateData.data_aprovacao = new Date().toISOString()
    }

    const { error: updateError } = await adminClient
      .from("perguntas_reflexivas")
      .update(updateData)
      .eq("id", data.perguntasReflexivasId)

    if (updateError) {
      console.error("[v0] ERRO ao atualizar:", updateError)
      return { success: false, error: updateError.message }
    }

    // Atualizar progresso_fases
    const { data: progresso } = await adminClient
      .from("progresso_fases")
      .select("*")
      .eq("discipulo_id", data.discipuloId)
      .single()

    if (progresso) {
      const pontuacaoAtual = progresso.pontuacao_passo_atual || 0

      await adminClient
        .from("progresso_fases")
        .update({
          pontuacao_passo_atual: pontuacaoAtual + data.xpConcedido,
        })
        .eq("id", progresso.id)

      console.log("[v0] XP adicionado à pontuação do passo:", data.xpConcedido)
    }

    // Se todas foram aprovadas, deletar notificação
    if (todasAprovadas) {
      const { data: notificacao } = await adminClient
        .from("notificacoes")
        .select("id")
        .eq("tipo", "perguntas_reflexivas")
        .eq("discipulo_id", data.discipuloId)
        .maybeSingle()

      if (notificacao) {
        await adminClient.from("notificacoes").delete().eq("id", notificacao.id)
        console.log("[v0] Notificação removida")
      }

      // Verificar se pode liberar próximo passo
      await verificarLiberacaoProximoPasso(adminClient, data.discipuloId, data.passoAtual, xpTotal)

      console.log("[v0] ===== TODAS PERGUNTAS APROVADAS - XP TOTAL:", xpTotal, "=====")
      return {
        success: true,
        message: `Todas as perguntas aprovadas! +${xpTotal} XP concedido ao discípulo`,
        todasAprovadas: true,
        xpTotal,
      }
    }

    console.log("[v0] ===== APROVAÇÃO DA PERGUNTA", data.perguntaId, "CONCLUÍDA =====")
    return {
      success: true,
      message: `Pergunta ${data.perguntaId} aprovada! +${data.xpConcedido} XP`,
      todasAprovadas: false,
    }
  } catch (error) {
    console.error("[v0] Erro ao aprovar pergunta reflexiva:", error)
    return { success: false, error: "Erro ao aprovar pergunta reflexiva" }
  } finally {
    revalidatePath("/discipulador")
  }
}

async function verificarLiberacaoProximoPasso(
  adminClient: any,
  discipuloId: string,
  passoAtual: number,
  xpPerguntasReflexivas: number,
) {
  // Verificar reflexoes_passo (videos e artigos)
  const { data: reflexoesPasso } = await adminClient
    .from("reflexoes_passo")
    .select("tipo, feedbacks, conteudos_ids")
    .eq("discipulo_id", discipuloId)
    .eq("passo_numero", passoAtual)

  if (!reflexoesPasso || reflexoesPasso.length === 0) {
    console.log("[v0] Reflexões de conteúdo ainda pendentes")
    return
  }

  // Verificar se todos os vídeos e artigos foram aprovados
  const todasReflexoesAprovadas = reflexoesPasso.every((r: any) => {
    const feedbacks = (r.feedbacks as any[]) || []
    const conteudos = r.conteudos_ids || []
    return conteudos.every((conteudoId: string) => feedbacks.some((f: any) => f.conteudo_id === conteudoId))
  })

  if (!todasReflexoesAprovadas) {
    console.log("[v0] Reflexões de conteúdo ainda pendentes")
    return
  }

  // Verificar leitura bíblica
  const { data: planoSemana } = await adminClient
    .from("plano_leitura_biblica")
    .select("capitulos_semana")
    .eq("semana", passoAtual)
    .single()

  let leituraConcluida = false
  if (planoSemana) {
    const { data: leituras } = await adminClient
      .from("leituras_capitulos")
      .select("capitulos_lidos")
      .eq("discipulo_id", discipuloId)
      .single()

    const capitulosLidos = new Set(leituras?.capitulos_lidos || [])
    leituraConcluida = planoSemana.capitulos_semana.every((cap: string) => capitulosLidos.has(Number.parseInt(cap)))
  }

  if (!leituraConcluida) {
    console.log("[v0] Leitura bíblica ainda não foi concluída")
    return
  }

  // Marcar passo como completado e liberar próximo
  const { data: progresso } = await adminClient
    .from("progresso_fases")
    .select("pontuacao_passo_atual")
    .eq("discipulo_id", discipuloId)
    .single()

  if (progresso) {
    const pontosDoPassoCompleto = progresso.pontuacao_passo_atual || 0

    // Resetar progresso do passo
    await adminClient
      .from("progresso_fases")
      .update({
        pontuacao_passo_atual: 0,
        reflexoes_concluidas: 0,
        videos_assistidos: [],
        artigos_lidos: [],
      })
      .eq("discipulo_id", discipuloId)

    // Transferir XP para o discípulo
    const { data: disc } = await adminClient
      .from("discipulos")
      .select("xp_total, passo_atual")
      .eq("id", discipuloId)
      .single()

    if (disc) {
      const proximoPasso = passoAtual + 1

      await adminClient
        .from("discipulos")
        .update({
          xp_total: (disc.xp_total || 0) + pontosDoPassoCompleto,
          passo_atual: proximoPasso <= 10 ? proximoPasso : disc.passo_atual,
        })
        .eq("id", discipuloId)

      console.log("[v0] Passo", passoAtual, "concluído! Passo", proximoPasso, "liberado!")
    }
  }
}
