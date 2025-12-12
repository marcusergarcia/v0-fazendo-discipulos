"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"
import { getPerguntasPasso } from "@/constants/perguntas-passos"
import { passosConteudo } from "@/constants/passos-conteudo"

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
      .select("id, tipo, conteudos_ids, feedbacks, xp_ganho, discipulo_id, passo_numero, notificacao_id")
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

    if (todosConteudosAprovados && reflexaoAtual.notificacao_id) {
      console.log("[v0] Deletando notificação:", reflexaoAtual.notificacao_id)

      await adminClient.from("reflexoes_passo").update({ notificacao_id: null }).eq("id", reflexaoAtual.id)

      await adminClient.from("notificacoes").delete().eq("id", reflexaoAtual.notificacao_id)
      console.log("[v0] Notificação removida - todos os", data.tipo, "s aprovados")
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
          .select("xp_total, passo_atual, fase_atual")
          .eq("id", data.discipuloId)
          .single()

        console.log(
          "[v0] Discípulo atual - XP:",
          disc?.xp_total,
          "Fase:",
          disc?.fase_atual,
          "Passo:",
          disc?.passo_atual,
        )

        if (disc) {
          const proximoPasso = data.passoAtual + 1
          const proximaFase = Math.ceil(proximoPasso / 10)

          const { error: updateDiscipuloError } = await adminClient
            .from("discipulos")
            .update({
              fase_atual: proximaFase,
              passo_atual: proximoPasso <= 10 ? proximoPasso : disc.passo_atual,
              xp_total: (disc.xp_total || 0) + pontosDoPassoCompleto,
            })
            .eq("id", data.discipuloId)

          if (updateDiscipuloError) {
            console.error("[v0] ERRO ao atualizar discípulo:", updateDiscipuloError)
          } else {
            console.log(
              "[v0] ✅ Discípulo atualizado - Novo passo:",
              proximoPasso,
              "XP total:",
              (disc.xp_total || 0) + pontosDoPassoCompleto,
            )
          }

          const passoData = passosConteudo[data.passoAtual as keyof typeof passosConteudo]
          if (passoData && passoData.recompensa) {
            console.log("[v0] Adicionando insígnia do passo", data.passoAtual, ":", passoData.recompensa)

            // Buscar recompensas atuais
            const { data: recompensasAtuais } = await adminClient
              .from("recompensas")
              .select("insignias, medalhas")
              .eq("discipulo_id", data.discipuloId)
              .single()

            if (recompensasAtuais) {
              const insigniasAtuais = recompensasAtuais.insignias || []

              // Criar string da insígnia no formato "Passo X Concluído"
              const novaInsignia = `Passo ${data.passoAtual} Concluído`

              // Adicionar apenas se ainda não existe
              const jaExiste = insigniasAtuais.includes(novaInsignia)

              if (!jaExiste) {
                const { error: updateRecompensasError } = await adminClient
                  .from("recompensas")
                  .update({
                    insignias: [...insigniasAtuais, novaInsignia],
                  })
                  .eq("discipulo_id", data.discipuloId)

                if (updateRecompensasError) {
                  console.error("[v0] ERRO ao atualizar recompensas:", updateRecompensasError)
                } else {
                  console.log("[v0] ✅ Insígnia adicionada:", novaInsignia)
                }
              } else {
                console.log("[v0] ⚠️ Insígnia já existe, pulando")
              }
            }
          }

          console.log("[v0] ===== PASSO", data.passoAtual, "CONCLUÍDO! PASSO", proximoPasso, "LIBERADO! =====")
          console.log("[v0] 🎉 Modal de celebração aparecerá no próximo login do discípulo")

          return {
            success: true,
            message: `Reflexão aprovada! Passo ${data.passoAtual} concluído. Passo ${proximoPasso} liberado!`,
            xpConcedido: data.xpConcedido,
            celebracao: {
              passoCompletado: data.passoAtual,
              xpGanho: pontosDoPassoCompleto,
              proximoPasso: proximoPasso,
            },
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
    console.log("[v0] Params recebidos:", JSON.stringify(data, null, 2))

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
    const respostaIndex = respostasArray.findIndex((r: any) => r.pergunta_id === data.perguntaId)

    if (respostaIndex === -1) {
      console.error("[v0] ERRO: Resposta não encontrada para pergunta_id", data.perguntaId)
      return { success: false, error: "Resposta não encontrada" }
    }

    respostasArray[respostaIndex] = {
      ...respostasArray[respostaIndex],
      situacao: "aprovado",
      xp_ganho: data.xpConcedido,
      feedback: data.feedback,
      data_aprovacao: new Date().toISOString(),
    }

    const { data: discipulo } = await adminClient
      .from("discipulos")
      .select("discipulador_id")
      .eq("id", data.discipuloId)
      .single()

    const discipuladorId = discipulo?.discipulador_id

    const perguntasEsperadas = getPerguntasPasso(data.passoAtual)
    const totalPerguntasEsperadas = perguntasEsperadas.length

    const perguntasAprovadas = respostasArray.filter((r: any) => r.situacao === "aprovado").length
    const todasAprovadas = perguntasAprovadas === totalPerguntasEsperadas

    const xpTotal = respostasArray
      .filter((r: any) => r.situacao === "aprovado")
      .reduce((sum: number, r: any) => sum + (r.xp_ganho || 0), 0)

    console.log("[v0] Perguntas Aprovadas:", perguntasAprovadas, "/", totalPerguntasEsperadas)

    const updateData: any = {
      respostas: respostasArray,
    }

    if (todasAprovadas) {
      updateData.situacao = "aprovado"
      updateData.xp_ganho = xpTotal
      updateData.data_aprovacao = new Date().toISOString()
      updateData.discipulador_id = discipuladorId
      updateData.feedback_discipulador = "Todas as perguntas reflexivas foram aprovadas"
    }

    const { error: updateError } = await adminClient
      .from("perguntas_reflexivas")
      .update(updateData)
      .eq("id", data.perguntasReflexivasId)

    if (updateError) {
      console.error("[v0] ERRO ao atualizar:", updateError)
      return { success: false, error: updateError.message }
    }

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

    if (todasAprovadas && perguntasReflexivas.notificacao_id) {
      console.log("[v0] Deletando notificação:", perguntasReflexivas.notificacao_id)

      await adminClient
        .from("perguntas_reflexivas")
        .update({ notificacao_id: null })
        .eq("id", data.perguntasReflexivasId)

      await adminClient.from("notificacoes").delete().eq("id", perguntasReflexivas.notificacao_id)
      console.log("[v0] Notificação removida - todas as perguntas aprovadas")

      console.log("[v0] 🚀 CHAMANDO verificarLiberacaoProximoPasso agora...")
      console.log(
        "[v0] Parâmetros: discipuloId =",
        data.discipuloId,
        "passoAtual =",
        data.passoAtual,
        "xpTotal =",
        xpTotal,
      )

      // Verificar e liberar próximo passo automaticamente
      await verificarLiberacaoProximoPasso(adminClient, data.discipuloId, data.passoAtual, xpTotal)

      return {
        success: true,
        message: `Todas as perguntas aprovadas! Passo concluído automaticamente.`,
        todasAprovadas: true,
        xpTotal,
      }
    }

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
  console.log("[v0] ===== VERIFICANDO LIBERAÇÃO DO PRÓXIMO PASSO =====")
  console.log("[v0] Discípulo ID:", discipuloId)
  console.log("[v0] Passo Atual:", passoAtual)

  // Verificar reflexoes_passo (videos e artigos)
  const { data: reflexoesPasso } = await adminClient
    .from("reflexoes_passo")
    .select("tipo, feedbacks, conteudos_ids")
    .eq("discipulo_id", discipuloId)
    .eq("passo_numero", passoAtual)

  console.log("[v0] Reflexões encontradas:", reflexoesPasso?.length)

  if (!reflexoesPasso || reflexoesPasso.length === 0) {
    console.log("[v0] Reflexões de conteúdo ainda pendentes")
    return null
  }

  // Verificar se todos os vídeos e artigos foram aprovados
  const todasReflexoesAprovadas = reflexoesPasso.every((r: any) => {
    const feedbacks = (r.feedbacks as any[]) || []
    const conteudos = r.conteudos_ids || []
    return conteudos.every((conteudoId: string) => feedbacks.some((f: any) => f.conteudo_id === conteudoId))
  })

  console.log("[v0] Todas reflexões aprovadas?", todasReflexoesAprovadas)

  if (!todasReflexoesAprovadas) {
    console.log("[v0] Reflexões de conteúdo ainda pendentes")
    return null
  }

  // Verificar leitura bíblica
  const { data: planoSemana } = await adminClient
    .from("plano_leitura_biblica")
    .select("capitulos_semana")
    .eq("semana", passoAtual)
    .single()

  console.log("[v0] Plano da semana:", planoSemana?.capitulos_semana?.length, "capítulos")

  let leituraConcluida = false
  if (planoSemana) {
    const { data: leituras } = await adminClient
      .from("leituras_capitulos")
      .select("capitulos_lidos")
      .eq("discipulo_id", discipuloId)
      .single()

    const capitulosLidos = new Set(leituras?.capitulos_lidos || [])
    leituraConcluida = planoSemana.capitulos_semana.every((cap: string) => capitulosLidos.has(Number.parseInt(cap)))

    console.log("[v0] Leitura concluída?", leituraConcluida)
    console.log("[v0] Capítulos lidos:", capitulosLidos.size, "/ Esperados:", planoSemana.capitulos_semana.length)
  }

  if (!leituraConcluida) {
    console.log("[v0] Leitura bíblica ainda não foi concluída")
    return null
  }

  console.log("[v0] ===== TODAS AS CONDIÇÕES ATENDIDAS! LIBERANDO PRÓXIMO PASSO =====")

  // Marcar passo como completado e liberar próximo
  const { data: progresso } = await adminClient
    .from("progresso_fases")
    .select("id, pontuacao_passo_atual, celebracao_vista, fase_atual, passo_atual")
    .eq("discipulo_id", discipuloId)
    .single()

  console.log(
    "[v0] Progresso atual - Pontos:",
    progresso?.pontuacao_passo_atual,
    "Celebração vista:",
    progresso?.celebracao_vista,
    "Fase:",
    progresso?.fase_atual,
    "Passo:",
    progresso?.passo_atual,
  )

  if (progresso) {
    const pontosDoPassoCompleto = progresso.pontuacao_passo_atual || 0
    const proximoPasso = passoAtual + 1
    const proximaFase = Math.ceil(proximoPasso / 10)

    const { error: updateProgressoError } = await adminClient
      .from("progresso_fases")
      .update({
        fase_atual: proximaFase,
        passo_atual: proximoPasso,
        pontuacao_passo_atual: 0,
        reflexoes_concluidas: 0,
        videos_assistidos: [],
        artigos_lidos: [],
        celebracao_vista: false,
        pontuacao_passo_anterior: pontosDoPassoCompleto,
      })
      .eq("id", progresso.id)

    if (updateProgressoError) {
      console.error("[v0] ERRO ao atualizar progresso_fases:", updateProgressoError)
    } else {
      console.log("[v0] ✅ progresso_fases atualizado - Fase:", proximaFase, "Passo:", proximoPasso)
      console.log("[v0] ✅ celebracao_vista agora é FALSE")
      console.log("[v0] ✅ pontuacao_passo_anterior salva:", pontosDoPassoCompleto)
    }

    // Transferir XP para o discípulo
    const { data: disc } = await adminClient
      .from("discipulos")
      .select("xp_total, passo_atual, fase_atual")
      .eq("id", discipuloId)
      .single()

    console.log("[v0] Discípulo atual - XP:", disc?.xp_total, "Fase:", disc?.fase_atual, "Passo:", disc?.passo_atual)

    if (disc) {
      const { error: updateDiscipuloError } = await adminClient
        .from("discipulos")
        .update({
          fase_atual: proximaFase,
          passo_atual: proximoPasso <= 10 ? proximoPasso : disc.passo_atual,
          xp_total: (disc.xp_total || 0) + pontosDoPassoCompleto,
        })
        .eq("id", discipuloId)

      if (updateDiscipuloError) {
        console.error("[v0] ERRO ao atualizar discípulo:", updateDiscipuloError)
      } else {
        console.log(
          "[v0] ✅ Discípulo atualizado - Fase:",
          proximaFase,
          "Passo:",
          proximoPasso,
          "XP total:",
          (disc.xp_total || 0) + pontosDoPassoCompleto,
        )
      }

      const passoData = passosConteudo[passoAtual as keyof typeof passosConteudo]
      if (passoData && passoData.recompensa) {
        console.log("[v0] Adicionando insígnia do passo", passoAtual, ":", passoData.recompensa)

        // Buscar recompensas atuais
        const { data: recompensasAtuais } = await adminClient
          .from("recompensas")
          .select("insignias, medalhas")
          .eq("discipulo_id", discipuloId)
          .single()

        if (recompensasAtuais) {
          const insigniasAtuais = recompensasAtuais.insignias || []

          // Criar string da insígnia no formato "Passo X Concluído"
          const novaInsignia = `Passo ${passoAtual} Concluído`

          // Adicionar apenas se ainda não existe
          const jaExiste = insigniasAtuais.includes(novaInsignia)

          if (!jaExiste) {
            const { error: updateRecompensasError } = await adminClient
              .from("recompensas")
              .update({
                insignias: [...insigniasAtuais, novaInsignia],
              })
              .eq("discipulo_id", discipuloId)

            if (updateRecompensasError) {
              console.error("[v0] ERRO ao atualizar recompensas:", updateRecompensasError)
            } else {
              console.log("[v0] ✅ Insígnia adicionada:", novaInsignia)
            }
          } else {
            console.log("[v0] ⚠️ Insígnia já existe, pulando")
          }
        }
      }

      console.log("[v0] ===== PASSO", passoAtual, "CONCLUÍDO! PASSO", proximoPasso, "LIBERADO! =====")
      console.log("[v0] 🎉 Modal de celebração aparecerá no próximo login do discípulo")

      return null
    }
  }

  return null
}

export async function limparTodasNotificacoes() {
  const adminClient = createAdminClient()

  try {
    console.log("[v0] Limpando todas as notificações do discipulador")

    // Buscar o usuário atual
    const {
      data: { user },
      error: userError,
    } = await adminClient.auth.getUser()

    if (userError || !user) {
      console.error("[v0] Erro ao buscar usuário:", userError)
      return { success: false, error: "Usuário não encontrado" }
    }

    // Buscar o perfil do discipulador
    const { data: profile } = await adminClient.from("profiles").select("id").eq("id", user.id).single()

    if (!profile) {
      return { success: false, error: "Perfil não encontrado" }
    }

    // Limpar notificações de reflexões enviadas
    const { data: reflexoesEnviadas } = await adminClient
      .from("reflexoes_passo")
      .update({ notificacao_id: null })
      .eq("discipulador_id", user.id)
      .eq("situacao", "enviado")
      .select()

    // Limpar notificações de perguntas enviadas
    const { data: perguntasEnviadas } = await adminClient
      .from("perguntas_reflexivas")
      .update({ notificacao_id: null })
      .match({ situacao: "enviado" })
      .select()

    // Deletar notificações relacionadas
    const notificacoesIds: string[] = []

    if (reflexoesEnviadas) {
      reflexoesEnviadas.forEach((r: any) => {
        if (r.notificacao_id) notificacoesIds.push(r.notificacao_id)
      })
    }

    if (perguntasEnviadas) {
      perguntasEnviadas.forEach((p: any) => {
        if (p.notificacao_id) notificacoesIds.push(p.notificacao_id)
      })
    }

    if (notificacoesIds.length > 0) {
      await adminClient.from("notificacoes").delete().in("id", notificacoesIds)
    }

    // Deletar notificações de novos discípulos não lidas
    await adminClient
      .from("notificacoes")
      .delete()
      .eq("user_id", profile.id)
      .eq("tipo", "novo_discipulo")
      .eq("lida", false)

    console.log("[v0] Notificações limpas com sucesso")

    revalidatePath("/discipulador")

    return { success: true }
  } catch (error) {
    console.error("[v0] Erro ao limpar notificações:", error)
    return { success: false, error: "Erro ao limpar notificações" }
  }
}
