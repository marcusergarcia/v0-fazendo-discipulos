"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"

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
      data_aprovacao: new Date().toISOString(),
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
      .eq("passo_atual", data.passoAtual)
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

        // Adicionar XP ao total do discípulo
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
