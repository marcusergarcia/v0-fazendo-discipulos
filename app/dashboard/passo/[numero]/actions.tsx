"use server"

import { createClient } from "@/lib/supabase/server"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function salvarRascunho(numero: number, formData: FormData) {
  console.log("[v0] salvarRascunho é obsoleto e não faz nada")
  redirect(`/dashboard/passo/${numero}`)
}

export async function enviarParaValidacao(numero: number, formData: FormData) {
  console.log("[v0] enviarParaValidacao é obsoleto - use enviarPerguntasReflexivas")
  redirect(`/dashboard/passo/${numero}`)
}

export async function marcarVideoAssistido(numero: number, videoId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return

  const { data: discipulo } = await supabase.from("discipulos").select("*").eq("user_id", user.id).single()
  if (!discipulo) return

  const { data: progresso } = await supabase
    .from("progresso_fases")
    .select("videos_assistidos")
    .eq("discipulo_id", discipulo.id)
    .single()

  const videosAtuais = (progresso?.videos_assistidos as string[]) || []
  if (!videosAtuais.includes(videoId)) {
    videosAtuais.push(videoId)
    await supabase.from("progresso_fases").update({ videos_assistidos: videosAtuais }).eq("discipulo_id", discipulo.id)
  }

  redirect(`/dashboard/passo/${numero}?video=${videoId}`)
}

export async function marcarArtigoLido(numero: number, artigoId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return

  const { data: discipulo } = await supabase.from("discipulos").select("*").eq("user_id", user.id).single()
  if (!discipulo) return

  const { data: progresso } = await supabase
    .from("progresso_fases")
    .select("artigos_lidos")
    .eq("discipulo_id", discipulo.id)
    .single()

  const artigosAtuais = (progresso?.artigos_lidos as string[]) || []
  if (!artigosAtuais.includes(artigoId)) {
    artigosAtuais.push(artigoId)
    await supabase.from("progresso_fases").update({ artigos_lidos: artigosAtuais }).eq("discipulo_id", discipulo.id)
  }

  redirect(`/dashboard/passo/${numero}?artigo=${artigoId}`)
}

export async function buscarReflexoesParaReset(numero: number) {
  console.log("[v0] SERVER: buscarReflexoesParaReset iniciada - Passo:", numero)

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  console.log("[v0] SERVER: User ID:", user?.id)

  if (!user) {
    console.error("[v0] SERVER: Erro - Usuário não autenticado")
    return { reflexoes: [], perguntasReflexivas: [] }
  }

  const { data: discipulo, error: discipuloError } = await supabase
    .from("discipulos")
    .select("id")
    .eq("user_id", user.id)
    .single()

  console.log("[v0] SERVER: Discípulo encontrado:", discipulo?.id)

  if (discipuloError || !discipulo) {
    console.error("[v0] SERVER: Erro ao buscar discípulo:", discipuloError)
    return { reflexoes: [], perguntasReflexivas: [] }
  }

  console.log("[v0] SERVER: Buscando reflexões de vídeos/artigos - discipulo_id:", discipulo.id, "passo:", numero)

  const { data: reflexoes, error } = await supabase
    .from("reflexoes_passo")
    .select("*")
    .eq("discipulo_id", discipulo.id)
    .eq("passo_numero", numero)

  if (error) {
    console.error("[v0] SERVER: Erro ao buscar reflexões:", error)
  }

  console.log("[v0] SERVER: Reflexões do passo", numero, "encontradas:", reflexoes?.length || 0)

  console.log("[v0] SERVER: Buscando perguntas reflexivas - discipulo_id:", discipulo.id, "passo:", numero)

  const { data: perguntasReflexivas, error: errorPerguntas } = await supabase
    .from("perguntas_reflexivas")
    .select("*")
    .eq("discipulo_id", discipulo.id)
    .eq("passo_numero", numero)

  if (errorPerguntas) {
    console.error("[v0] SERVER: Erro ao buscar perguntas reflexivas:", errorPerguntas)
  }

  console.log("[v0] SERVER: Perguntas reflexivas do passo", numero, "encontradas:", perguntasReflexivas?.length || 0)

  return {
    reflexoes: reflexoes || [],
    perguntasReflexivas: perguntasReflexivas || [],
  }
}

export async function resetarProgresso(numero: number, reflexoesIds: string[], perguntasReflexivasIds: string[]) {
  console.log("[v0] ===== INICIANDO RESET DE PROGRESSO =====")
  console.log("[v0] Passo número:", numero)
  console.log("[v0] IDs das reflexões a excluir:", reflexoesIds)
  console.log("[v0] IDs das perguntas reflexivas a excluir:", perguntasReflexivasIds)

  try {
    const supabase = await createClient()
    const supabaseAdmin = createSupabaseClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      console.log("[v0] ERRO: Usuário não autenticado", userError)
      return { success: false, error: "Usuário não autenticado" }
    }

    console.log("[v0] Usuário autenticado:", user.id)

    const { data: discipulo, error: discipuloError } = await supabase
      .from("discipulos")
      .select("id, discipulador_id")
      .eq("user_id", user.id)
      .single()

    if (discipuloError || !discipulo) {
      console.log("[v0] ERRO ao buscar discípulo:", discipuloError)
      return { success: false, error: "Discípulo não encontrado" }
    }

    console.log("[v0] Discípulo ID:", discipulo.id)

    let pontosMantidos = 0

    const { data: respostas, error: respostasError } = await supabase
      .from("historico_respostas_passo")
      .select("xp_ganho, situacao")
      .eq("discipulo_id", discipulo.id)
      .eq("passo_numero", numero)
      .eq("situacao", "aprovado")

    if (!respostasError && respostas) {
      pontosMantidos = respostas.reduce((total, r) => total + (r.xp_ganho || 0), 0)
      console.log("[v0] 📊 Pontos de perguntas/missões a manter:", pontosMantidos)
    }

    let pontosVideosArtigos = 0
    if (reflexoesIds.length > 0) {
      const { data: reflexoesResetadas } = await supabase
        .from("reflexoes_passo")
        .select("xp_ganho")
        .in("id", reflexoesIds)
        .eq("situacao", "aprovado")

      if (reflexoesResetadas) {
        pontosVideosArtigos = reflexoesResetadas.reduce((total, r) => total + (r.xp_ganho || 0), 0)
        console.log("[v0] 📊 Pontos de vídeos/artigos a remover:", pontosVideosArtigos)
      }
    }

    console.log("[v0] SERVER: resetarProgresso iniciada - Passo:", numero)
    console.log("[v0] SERVER: Reflexões para excluir:", reflexoesIds.length)
    console.log("[v0] SERVER: Perguntas reflexivas para excluir:", perguntasReflexivasIds.length)
    console.log("[v0] SERVER: Perguntas IDs:", perguntasReflexivasIds)

    if (perguntasReflexivasIds.length > 0) {
      console.log("[v0] SERVER: Deletando perguntas reflexivas...")

      const validPerguntasIds = perguntasReflexivasIds.filter((id) => id !== undefined && id !== null)
      console.log("[v0] SERVER: Valid perguntas IDs:", validPerguntasIds.length)

      if (validPerguntasIds.length > 0) {
        for (const id of validPerguntasIds) {
          console.log("[v0] SERVER: Deletando pergunta id:", id)

          const { data: notificacao } = await supabaseAdmin
            .from("notificacoes")
            .select("notificacao_id")
            .eq("id", id)
            .single()
          const notificacaoId = notificacao?.notificacao_id

          if (notificacaoId) {
            const { error: deleteNotifError } = await supabaseAdmin
              .from("notificacoes")
              .delete()
              .eq("id", notificacaoId)
            if (deleteNotifError) {
              console.error("[v0] SERVER: Erro ao deletar notificação da pergunta:", deleteNotifError)
            }
          }

          const { error: deletePerguntaError } = await supabaseAdmin.from("perguntas_reflexivas").delete().eq("id", id)
          if (deletePerguntaError) {
            console.error("[v0] SERVER: Erro ao deletar pergunta reflexiva:", deletePerguntaError)
            throw deletePerguntaError
          } else {
            console.log("[v0] SERVER: Pergunta reflexiva deletada com sucesso - ID:", id)
          }
        }
      } else {
        console.log("[v0] SERVER: Nenhum ID válido de pergunta reflexiva para deletar")
      }
    } else {
      console.log("[v0] SERVER: Nenhuma pergunta reflexiva para excluir")
    }

    if (reflexoesIds.length > 0) {
      console.log("[v0] Buscando reflexões com seus IDs de notificações...")
      const { data: reflexoes, error: errorBuscar } = await supabaseAdmin
        .from("reflexoes_passo")
        .select("id, notificacao_id")
        .in("id", reflexoesIds)

      if (errorBuscar) {
        console.log("[v0] ERRO ao buscar reflexões:", errorBuscar)
        return { success: false, error: "Erro ao buscar reflexões" }
      } else {
        console.log("[v0] Reflexões encontradas:", reflexoes)

        const notificacoesIds = reflexoes?.filter((r) => r.notificacao_id).map((r) => r.notificacao_id) || []

        if (notificacoesIds.length > 0) {
          console.log("[v0] Excluindo", notificacoesIds.length, "notificações...")
          const { error: errorNotif } = await supabaseAdmin.from("notificacoes").delete().in("id", notificacoesIds)

          if (errorNotif) {
            console.error("[v0] SERVER: Erro ao excluir notificações:", errorNotif)
            return { success: false, error: "Erro ao excluir notificações" }
          } else {
            console.log("[v0] ✅ Notificações excluídas com sucesso!")
          }
        }
      }

      console.log("[v0] Excluindo", reflexoesIds.length, "reflexões...")
      const { error: errorExcluir } = await supabaseAdmin.from("reflexoes_passo").delete().in("id", reflexoesIds)

      if (errorExcluir) {
        console.error("[v0] ERRO ao excluir reflexões:", errorExcluir)
        return { success: false, error: "Erro ao excluir reflexões" }
      }

      console.log("[v0] ✅ TODAS as reflexões excluídas com sucesso!")
    }

    const totalPontosRemover = pontosVideosArtigos

    if (totalPontosRemover > 0) {
      const { error: xpError } = await supabase.rpc("decrement_xp", {
        discipulo_id: discipulo.id,
        xp_amount: totalPontosRemover,
      })

      if (xpError) {
        console.log("[v0] Tentando decrementar XP manualmente...")
        const { data: discipuloAtual } = await supabase
          .from("discipulos")
          .select("xp_total")
          .eq("id", discipulo.id)
          .single()

        const novoXp = Math.max(0, (discipuloAtual?.xp_total || 0) - totalPontosRemover)

        await supabase.from("discipulos").update({ xp_total: novoXp }).eq("id", discipulo.id)

        console.log("[v0] XP decrementado manualmente:", totalPontosRemover, "pontos")
      } else {
        console.log("[v0] ✅ XP decrementado via RPC:", totalPontosRemover, "pontos")
      }
    }

    console.log("[v0] Resetando progresso do passo...")
    const { error: errorReset } = await supabase
      .from("progresso_fases")
      .update({
        videos_assistidos: [],
        artigos_lidos: [],
        reflexoes_concluidas: 0,
        pontuacao_passo_atual: pontosMantidos, // Mantém pontos de perguntas/missões
      })
      .eq("discipulo_id", discipulo.id)

    if (errorReset) {
      console.error("[v0] ERRO ao resetar progresso:", errorReset)
      return { success: false, error: "Erro ao resetar progresso" }
    }

    console.log("[v0] ✅ Progresso resetado com sucesso!")
    console.log("[v0] 📊 Pontos mantidos (perguntas/missões):", pontosMantidos)
    console.log("[v0] 📊 Pontos removidos (vídeos/artigos):", pontosVideosArtigos)

    return { success: true, message: "Progresso resetado com sucesso!" }
  } catch (error: any) {
    console.error("[v0] ERRO INESPERADO:", error)
    return { success: false, error: error.message || "Erro inesperado ao resetar progresso" }
  }
}

export async function concluirVideoComReflexao(numero: number, videoId: string, titulo: string, reflexao: string) {
  console.log("[v0] SERVER: concluirVideoComReflexao iniciada")
  console.log("[v0] SERVER: Params:", { numero, videoId, titulo, reflexao: reflexao.substring(0, 50) })

  const supabase = await createClient()
  const supabaseAdmin = createSupabaseClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  console.log("[v0] SERVER: User ID:", user?.id)
  if (!user) {
    console.log("[v0] SERVER: Usuário não encontrado!")
    throw new Error("Usuário não autenticado")
  }

  const { data: discipulo } = await supabase.from("discipulos").select("*").eq("user_id", user.id).single()

  console.log("[v0] SERVER: Discípulo ID:", discipulo?.id)
  console.log("[v0] SERVER: Discipulador ID:", discipulo?.discipulador_id)
  if (!discipulo) {
    console.log("[v0] SERVER: Discípulo não encontrado!")
    throw new Error("Discípulo não encontrado")
  }

  const { data: reflexaoExistente } = await supabase
    .from("reflexoes_passo")
    .select("id, notificacao_id, conteudos_ids, reflexoes, feedbacks")
    .eq("discipulo_id", discipulo.id)
    .eq("fase_numero", 1)
    .eq("passo_numero", numero)
    .eq("tipo", "video")
    .maybeSingle()

  console.log("[v0] SERVER: Registro tipo=video existente?", !!reflexaoExistente)
  console.log("[v0] SERVER: conteudos_ids atuais:", reflexaoExistente?.conteudos_ids)
  console.log("[v0] SERVER: videoId sendo adicionado:", videoId)

  let notificacaoId: string | null = null

  if (reflexaoExistente) {
    console.log("[v0] SERVER: Atualizando registro existente...")

    const conteudosIdsAtualizados = [...(reflexaoExistente.conteudos_ids || [])]
    if (!conteudosIdsAtualizados.includes(videoId)) {
      conteudosIdsAtualizados.push(videoId)
      console.log("[v0] SERVER: VideoId adicionado ao array:", videoId)
    } else {
      console.log("[v0] SERVER: VideoId já existe no array:", videoId)
    }

    console.log("[v0] SERVER: conteudos_ids atualizados:", conteudosIdsAtualizados)

    const reflexoesAtualizadas = {
      ...(reflexaoExistente.reflexoes || {}),
      [videoId]: reflexao,
    }

    console.log("[v0] SERVER: reflexoes keys atualizadas:", Object.keys(reflexoesAtualizadas))

    const feedbacksAtualizados = ((reflexaoExistente.feedbacks as any[]) || []).filter(
      (f: any) => f.conteudo_id !== videoId,
    )

    console.log("[v0] SERVER: feedbacks após remoção:", feedbacksAtualizados.length)

    const { data: updateData, error: updateError } = await supabase
      .from("reflexoes_passo")
      .update({
        conteudos_ids: conteudosIdsAtualizados,
        reflexoes: reflexoesAtualizadas,
        feedbacks: feedbacksAtualizados,
        situacao: "enviado",
      })
      .eq("id", reflexaoExistente.id)
      .select()

    if (updateError) {
      console.log("[v0] SERVER: ❌ Erro ao atualizar reflexão:", updateError)
      throw new Error(`Erro ao atualizar reflexão: ${updateError.message}`)
    }

    console.log("[v0] SERVER: ✅ Reflexão atualizada com sucesso!")
    console.log("[v0] SERVER: Dados atualizados:", updateData)

    if (discipulo.discipulador_id) {
      console.log("[v0] SERVER: Criando notificação para reflexão atualizada...")
      const { data: novaNotificacao, error: notifError } = await supabaseAdmin
        .from("notificacoes")
        .insert({
          user_id: discipulo.discipulador_id,
          tipo: "reflexao",
          titulo: "Reflexão de vídeo enviada",
          mensagem: `Seu discípulo enviou uma reflexão do vídeo "${titulo}" no Passo ${numero}.`,
          link: `/discipulador`,
          reflexao_id: reflexaoExistente.id,
        })
        .select("id")
        .single()

      if (notifError) {
        console.error("[v0] SERVER: Erro ao criar notificação:", notifError)
      } else {
        console.log("[v0] SERVER: ✅ Notificação criada com ID:", novaNotificacao.id)
      }
    }
  } else {
    if (discipulo.discipulador_id) {
      console.log("[v0] SERVER: Criando notificação para discipulador...")

      const { data: novaNotificacao, error: notifError } = await supabaseAdmin
        .from("notificacoes")
        .insert({
          user_id: discipulo.discipulador_id,
          tipo: "reflexao",
          titulo: "Nova reflexão de vídeo",
          mensagem: `Seu discípulo completou o vídeo "${titulo}" com uma reflexão no Passo ${numero}.`,
          link: `/discipulador`,
        })
        .select("id")
        .single()

      if (notifError) {
        console.error("[v0] SERVER: Erro ao criar notificação:", notifError)
      } else {
        console.log("[v0] SERVER: ✅ Notificação criada com ID:", novaNotificacao.id)
        notificacaoId = novaNotificacao.id
      }
    }

    console.log("[v0] SERVER: Inserindo novo registro tipo=video...")
    const { data: novaReflexao, error: reflexaoError } = await supabase
      .from("reflexoes_passo")
      .insert({
        discipulo_id: discipulo.id,
        discipulador_id: discipulo.discipulador_id,
        fase_numero: 1,
        passo_numero: numero,
        tipo: "video",
        conteudos_ids: [videoId],
        titulo: titulo,
        reflexoes: { [videoId]: reflexao },
        feedbacks: [],
        notificacao_id: notificacaoId,
        situacao: "enviado",
      })
      .select("id")
      .single()

    if (reflexaoError) {
      console.error("[v0] SERVER: Erro ao inserir reflexão:", reflexaoError)
      throw new Error("Erro ao salvar reflexão")
    } else {
      console.log("[v0] SERVER: ✅ Reflexão inserida com sucesso! ID:", novaReflexao.id)

      if (notificacaoId) {
        const { error: updateError } = await supabaseAdmin
          .from("notificacoes")
          .update({ reflexao_id: novaReflexao.id })
          .eq("id", notificacaoId)

        if (updateError) {
          console.error("[v0] SERVER: Erro ao atualizar notificação:", updateError)
        } else {
          console.log("[v0] SERVER: ✅ Notificação atualizada com reflexao_id")
        }
      }
    }
  }

  const { data: progressoExistente } = await supabase
    .from("progresso_fases")
    .select("*")
    .eq("discipulo_id", discipulo.id)
    .maybeSingle()

  if (!progressoExistente) {
    await supabase.from("progresso_fases").insert({
      discipulo_id: discipulo.id,
      fase_atual: discipulo.fase_atual || 1,
      passo_atual: numero,
      videos_assistidos: [videoId],
      artigos_lidos: [],
      reflexoes_concluidas: 1, // Incrementar reflexões concluídas
      pontuacao_passo_atual: 10, // Adicionar pontuação total
      data_inicio: new Date().toISOString(),
    })
  } else {
    const videosAtuais = (progressoExistente.videos_assistidos as string[]) || []
    if (!videosAtuais.includes(videoId)) {
      videosAtuais.push(videoId)
      const { error: progressoError } = await supabase
        .from("progresso_fases")
        .update({
          videos_assistidos: videosAtuais,
          reflexoes_concluidas: progressoExistente.reflexoes_concluidas + 1, // Incrementar reflexões concluídas
          pontuacao_passo_atual: (progressoExistente.pontuacao_passo_atual || 0) + 10, // Adicionar pontuação total
        })
        .eq("discipulo_id", discipulo.id)

      if (progressoError) {
        console.error("[v0] SERVER: Erro ao atualizar progresso:", progressoError)
      } else {
        console.log("[v0] SERVER: Vídeo marcado como assistido!")
      }
    }
  }

  // </CHANGE> Add revalidatePath to update UI after submission
  // The page will update when the modal closes and user navigates
  return { success: true, videoId }
}

export async function concluirArtigoComReflexao(numero: number, artigoId: string, titulo: string, reflexao: string) {
  console.log("[v0] SERVER: concluirArtigoComReflexao iniciada")
  console.log("[v0] SERVER: Params:", { numero, artigoId, titulo, reflexao: reflexao.substring(0, 50) })

  const supabase = await createClient()
  const supabaseAdmin = createSupabaseClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  console.log("[v0] SERVER: User ID:", user?.id)
  if (!user) {
    console.log("[v0] SERVER: Usuário não encontrado!")
    throw new Error("Usuário não autenticado")
  }

  const { data: discipulo } = await supabase.from("discipulos").select("*").eq("user_id", user.id).single()

  console.log("[v0] SERVER: Discípulo ID:", discipulo?.id)
  console.log("[v0] SERVER: Discipulador ID:", discipulo?.discipulador_id)
  if (!discipulo) {
    console.log("[v0] SERVER: Discípulo não encontrado!")
    throw new Error("Discípulo não encontrado")
  }

  const { data: reflexaoExistente } = await supabase
    .from("reflexoes_passo")
    .select("id, notificacao_id, conteudos_ids, reflexoes")
    .eq("discipulo_id", discipulo.id)
    .eq("fase_numero", 1)
    .eq("passo_numero", numero)
    .eq("tipo", "artigo")
    .contains("conteudos_ids", [artigoId])
    .maybeSingle()

  console.log("[v0] SERVER: Reflexão existente?", !!reflexaoExistente)

  let notificacaoId: string | null = null

  if (!reflexaoExistente && discipulo.discipulador_id) {
    console.log("[v0] SERVER: Criando notificação para discipulador...")

    const { data: novaNotificacao, error: notifError } = await supabaseAdmin
      .from("notificacoes")
      .insert({
        user_id: discipulo.discipulador_id,
        tipo: "reflexao",
        titulo: "Nova reflexão de artigo",
        mensagem: `Seu discípulo leu o artigo "${titulo}" e fez uma reflexão no Passo ${numero}.`,
        link: `/discipulador`,
      })
      .select("id")
      .single()

    if (notifError) {
      console.error("[v0] SERVER: Erro ao criar notificação:", notifError)
    } else {
      console.log("[v0] SERVER: Notificação criada com ID:", novaNotificacao.id)
      notificacaoId = novaNotificacao.id
    }
  }

  if (!reflexaoExistente) {
    console.log("[v0] SERVER: Inserindo nova reflexão...")
    const { data: novaReflexao, error: reflexaoError } = await supabase
      .from("reflexoes_passo")
      .insert({
        discipulo_id: discipulo.id,
        discipulador_id: discipulo.discipulador_id,
        fase_numero: 1,
        passo_numero: numero,
        tipo: "artigo",
        conteudos_ids: [artigoId],
        titulo: titulo,
        reflexoes: { [artigoId]: reflexao },
        notificacao_id: notificacaoId,
        situacao: "enviado", // Marcar como enviado
      })
      .select("id")
      .single()

    if (reflexaoError) {
      console.error("[v0] SERVER: Erro ao inserir reflexão:", reflexaoError)
      throw new Error("Erro ao salvar reflexão")
    } else {
      console.log("[v0] SERVER: Reflexão inserida com sucesso! ID:", novaReflexao.id)

      if (notificacaoId) {
        const { error: updateError } = await supabaseAdmin
          .from("notificacoes")
          .update({ reflexao_id: novaReflexao.id })
          .eq("id", notificacaoId)

        if (updateError) {
          console.error("[v0] SERVER: Erro ao atualizar notificação:", updateError)
        } else {
          console.log("[v0] SERVER: Notificação atualizada com reflexao_id")
        }
      }
    }
  }

  const { data: progressoExistente } = await supabase
    .from("progresso_fases")
    .select("*")
    .eq("discipulo_id", discipulo.id)
    .maybeSingle()

  if (!progressoExistente) {
    await supabase.from("progresso_fases").insert({
      discipulo_id: discipulo.id,
      fase_atual: discipulo.fase_atual || 1,
      passo_atual: numero,
      videos_assistidos: [],
      artigos_lidos: [artigoId],
      reflexoes_concluidas: 1, // Incrementar reflexões concluídas
      pontuacao_passo_atual: 10, // Adicionar pontuação total
      data_inicio: new Date().toISOString(),
    })
  } else {
    const artigosAtuais = (progressoExistente.artigos_lidos as string[]) || []
    if (!artigosAtuais.includes(artigoId)) {
      artigosAtuais.push(artigoId)
      await supabase
        .from("progresso_fases")
        .update({
          artigos_lidos: artigosAtuais,
          reflexoes_concluidas: progressoExistente.reflexoes_concluidas + 1, // Incrementar reflexões concluídas
          pontuacao_passo_atual: (progressoExistente.pontuacao_passo_atual || 0) + 10, // Adicionar pontuação total
        })
        .eq("discipulo_id", discipulo.id)
    }
  }

  // </CHANGE> Removed revalidatePath calls that were causing "Failed to fetch" errors
  // The page will update when the modal closes and user navigates
  return { success: true, artigoId }
}

export async function verificarCondicoesPasso(numero: number) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    console.error("[v0] SERVER: Usuário não autenticado")
    return { completo: false }
  }

  const { data: discipulo } = await supabase
    .from("discipulos")
    .select("id, passo_atual")
    .eq("user_id", user.id)
    .single()

  if (!discipulo || discipulo.passo_atual !== numero) {
    console.log("[v0] SERVER: Discípulo não encontrado ou não está neste passo")
    return { completo: false }
  }

  // Verificar todas as reflexões do passo
  const { data: reflexoes } = await supabase
    .from("reflexoes_passo")
    .select("situacao")
    .eq("discipulo_id", discipulo.id)
    .eq("passo_numero", numero)

  console.log("[v0] SERVER: Reflexões encontradas:", reflexoes?.length)

  const todasReflexoesAprovadas =
    reflexoes && reflexoes.length > 0 ? reflexoes.every((r) => r.situacao === "aprovado") : false

  console.log("[v0] SERVER: ✅ Todas reflexões aprovadas?", todasReflexoesAprovadas)

  // Verificar perguntas reflexivas (nova tabela)
  const { data: perguntasReflexivas } = await supabase
    .from("perguntas_reflexivas")
    .select("situacao")
    .eq("discipulo_id", discipulo.id)
    .eq("passo_numero", numero)
    .maybeSingle()

  const perguntasReflexivasAprovadas = perguntasReflexivas?.situacao === "aprovado"

  console.log("[v0] SERVER: ✅ Perguntas reflexivas aprovadas?", perguntasReflexivasAprovadas)

  // Verificar respostas do passo (pergunta E missão)
  const { data: respostas } = await supabase
    .from("historico_respostas_passo")
    .select("situacao")
    .eq("discipulo_id", discipulo.id)
    .eq("passo_numero", numero)

  console.log("[v0] SERVER: 💬 Respostas encontradas:", respostas?.length)

  const respostasAprovadas = respostas?.every((r) => r.situacao === "aprovado") || false

  console.log("[v0] SERVER: ❓ Respostas aprovadas?", respostasAprovadas)

  const { data: leituraCapitulos } = await supabase
    .from("leituras_capitulos")
    .select("capitulos_lidos")
    .eq("discipulo_id", discipulo.id)
    .single()

  // Buscar capítulos da semana atual (baseado no passo)
  const { data: planoLeitura } = await supabase
    .from("plano_leitura_biblica")
    .select("capitulos_semana")
    .eq("fase", 1)
    .eq("semana", numero)
    .single()

  const capitulosLidos = leituraCapitulos?.capitulos_lidos || []
  const capitulosSemana = planoLeitura?.capitulos_semana || []

  // Verificar se TODOS os capítulos da semana foram lidos
  const leituraSemanalConcluida = capitulosSemana.every((capId: number) => capitulosLidos.includes(capId))

  console.log("[v0] SERVER: 📖 Capítulos da semana:", capitulosSemana.length)
  console.log(
    "[v0] SERVER: ✅ Capítulos lidos:",
    capitulosLidos.filter((id: number) => capitulosSemana.includes(id)).length,
  )
  console.log("[v0] SERVER: 📚 Leitura semanal concluída?", leituraSemanalConcluida)

  const passoCompleto = todasReflexoesAprovadas && perguntasReflexivasAprovadas && leituraSemanalConcluida

  console.log("[v0] SERVER: 🎉 PASSO COMPLETO?", passoCompleto)

  return {
    completo: passoCompleto,
    reflexoesAprovadas: todasReflexoesAprovadas,
    perguntasReflexivasAprovadas: perguntasReflexivasAprovadas,
    respostasAprovadas: respostasAprovadas,
    leituraSemanalConcluida: leituraSemanalConcluida,
  }
}

export async function liberarProximoPasso() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { success: false, error: "Usuário não autenticado" }

  const { data: discipulo } = await supabase.from("discipulos").select("*").eq("user_id", user.id).single()

  if (!discipulo) {
    return { success: false, error: "Discípulo não encontrado" }
  }

  const passoAtual = discipulo.passo_atual
  const verificacao = await verificarCondicoesPasso(passoAtual)

  if (!verificacao.completo) {
    return {
      success: false,
      error: "Você precisa ter todas as reflexões e respostas aprovadas primeiro",
    }
  }

  // Liberar próximo passo
  const proximoPasso = passoAtual + 1

  if (proximoPasso > 10) {
    return { success: false, error: "Você já completou todos os passos!" }
  }

  const { error } = await supabase.from("discipulos").update({ passo_atual: proximoPasso }).eq("id", discipulo.id)

  if (error) {
    return { success: false, error: "Erro ao liberar próximo passo" }
  }

  // Adicionar a lógica para resetar o 'enviado_para_validacao' aqui, caso necessário,
  // ou chamar a nova função 'marcarEnviadoParaValidacao' se o fluxo for diferente.
  // Por enquanto, assumimos que avançar de passo já resetará o estado de validação,
  // ou que a lógica de validação é tratada separadamente.

  return {
    success: true,
    proximoPasso,
  }
}

export async function aprovarTarefasPrMarcusAutomatico(numeroPasso: number) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Usuário não autenticado" }
  }

  // Verificar se é o Pr. Marcus
  const PR_MARCUS_ID = "f7ff6309-32a3-45c8-96a6-b76a687f2e7a"
  if (user.id !== PR_MARCUS_ID) {
    return { error: "Esta função é apenas para o Pr. Marcus" }
  }

  try {
    // Executar a função SQL que aprova tudo com 30 XP
    const { data, error } = await supabase.rpc("aprovar_tarefas_pr_marcus", {
      p_numero_passo: numeroPasso,
    })

    if (error) throw error

    return { success: true, data }
  } catch (error) {
    console.error("Erro ao aprovar tarefas automaticamente:", error)
    return { error: "Erro ao aprovar tarefas automaticamente" }
  }
}

export async function receberRecompensasEAvancar(numeroPasso: number) {
  console.error("[v0 SERVER] ===== INÍCIO receberRecompensasEAvancar =====")
  console.error("[v0 SERVER] Passo número:", numeroPasso)

  const supabase = await createClient()
  const supabaseAdmin = createSupabaseClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  console.error("[v0 SERVER] User ID:", user?.id)

  if (!user) {
    console.error("[v0 SERVER] ERRO: Usuário não autenticado")
    return { error: "Usuário não autenticado" }
  }

  const PR_MARCUS_ID = "f7ff6309-32a3-45c8-96a6-b76a687f2e7a"
  const isPrMarcus = user.id === PR_MARCUS_ID

  console.error("[v0 SERVER] É Pr. Marcus?", isPrMarcus)

  try {
    console.error("[v0 SERVER] Buscando discípulo...")
    const { data: discipulo, error: discipuloError } = await supabase
      .from("discipulos")
      .select("id, xp_total, fase_atual, passo_atual")
      .eq("user_id", user.id)
      .single()

    if (discipuloError || !discipulo) {
      console.error("[v0 SERVER] ERRO ao buscar discípulo:", discipuloError)
      throw new Error("Discípulo não encontrado")
    }

    console.error("[v0 SERVER] Discípulo encontrado:", discipulo.id)
    console.error("[v0 SERVER] XP atual:", discipulo.xp_total)
    console.error("[v0 SERVER] Passo atual do discípulo:", discipulo.passo_atual)

    console.error("[v0 SERVER] Buscando progresso do discípulo...")
    const { data: progresso, error: progressoError } = await supabase
      .from("progresso_fases")
      .select("*")
      .eq("discipulo_id", discipulo.id)
      .single()

    if (progressoError || !progresso) {
      console.error("[v0 SERVER] ERRO ao buscar progresso:", progressoError)
      throw new Error("Progresso não encontrado")
    }

    console.error("[v0 SERVER] Progresso encontrado - ID:", progresso.id)
    console.error("[v0 SERVER] Pontos do passo:", progresso.pontuacao_passo_atual)
    console.error("[v0 SERVER] Fase atual no progresso:", progresso.fase_atual)
    console.error("[v0 SERVER] Passo atual no progresso:", progresso.passo_atual)

    if (discipulo.passo_atual > numeroPasso) {
      console.error("[v0 SERVER] ERRO: Usuário já avançou deste passo")
      throw new Error("Você já avançou deste passo")
    }

    if (isPrMarcus) {
      console.error("[v0 SERVER] Executando aprovação automática para Pr. Marcus...")
      const resultadoAprovacao = await aprovarTarefasPrMarcusAutomatico(numeroPasso)
      if (resultadoAprovacao.error) {
        console.error("[v0 SERVER] ERRO na aprovação automática:", resultadoAprovacao.error)
        throw new Error(resultadoAprovacao.error)
      }
      console.error("[v0 SERVER] Aprovação automática concluída com sucesso")
    }

    const faseAtual = discipulo.fase_atual
    const proximoPasso = numeroPasso === 10 ? 1 : numeroPasso + 1
    const proximaFase = numeroPasso === 10 ? faseAtual + 1 : faseAtual

    console.error("[v0 SERVER] Cálculo próximo passo/fase:")
    console.error("[v0 SERVER] - Fase atual:", faseAtual)
    console.error("[v0 SERVER] - Passo atual:", numeroPasso)
    console.error("[v0 SERVER] - Próxima fase:", proximaFase)
    console.error("[v0 SERVER] - Próximo passo:", proximoPasso)

    const xpPasso = progresso.pontuacao_passo_atual || 0
    const novoXpTotal = (discipulo.xp_total || 0) + xpPasso
    console.error("[v0 SERVER] Novo XP total:", novoXpTotal)

    console.error("[v0 SERVER] Atualizando discípulo...")
    const { error: updateDiscipuloError } = await supabase
      .from("discipulos")
      .update({
        xp_total: novoXpTotal,
        fase_atual: proximaFase,
        passo_atual: proximoPasso,
      })
      .eq("id", discipulo.id)

    if (updateDiscipuloError) {
      console.error("[v0 SERVER] ERRO ao atualizar discípulo:", updateDiscipuloError)
      throw updateDiscipuloError
    }

    console.error("[v0 SERVER] Discípulo atualizado com sucesso")

    console.error("[v0 SERVER] Adicionando insígnia ao array...")

    const insignia = `Passo ${numeroPasso} Concluído`

    // Buscar recompensas atuais
    const { data: recompensaAtual, error: fetchRecompensaError } = await supabaseAdmin
      .from("recompensas")
      .select("insignias")
      .eq("discipulo_id", discipulo.id)
      .single()

    if (fetchRecompensaError) {
      console.error("[v0 SERVER] ERRO ao buscar recompensas:", fetchRecompensaError)
    } else {
      // Adicionar nova insígnia ao array existente
      const insigniasAtuais = Array.isArray(recompensaAtual?.insignias) ? recompensaAtual.insignias : []

      const novasInsignias = [...insigniasAtuais, insignia]

      const { error: insigniaError } = await supabaseAdmin
        .from("recompensas")
        .update({ insignias: novasInsignias })
        .eq("discipulo_id", discipulo.id)

      if (insigniaError) {
        console.error("[v0 SERVER] ERRO ao adicionar insígnia:", insigniaError)
      } else {
        console.error("[v0 SERVER] Insígnia adicionada com sucesso!")
      }
    }

    console.log("[v0 SERVER] Atualizando progresso para próximo passo...")

    const { error: updateProgressoError } = await supabaseAdmin
      .from("progresso_fases")
      .update({
        fase_atual: proximaFase,
        passo_atual: proximoPasso,
        pontuacao_passo_atual: 0,
        reflexoes_concluidas: 0,
        videos_assistidos: [],
        artigos_lidos: [],
        enviado_para_validacao: false, // Resetar para false ao avançar
      })
      .eq("discipulo_id", discipulo.id)

    if (updateProgressoError) {
      console.error("[v0 SERVER] ERRO ao atualizar próximo passo:", updateProgressoError)
      throw updateProgressoError
    }
    console.error("[v0 SERVER] Próximo passo atualizado com sucesso")

    console.error("[v0 SERVER] Revalidando cache...")
    revalidatePath("/dashboard")

    console.error("[v0 SERVER] ===== FIM receberRecompensasEAvancar - SUCESSO =====")

    return {
      success: true,
      message: `Você avançou para o passo ${proximoPasso}!`,
      proximoPasso: proximoPasso,
    }
  } catch (error) {
    console.error("[v0 SERVER] ERRO GERAL:", error)
    return {
      error: error instanceof Error ? error.message : "Erro desconhecido",
    }
  }
}

export async function enviarPerguntasReflexivas(numero: number, respostas: Record<string, string>) {
  console.log("[v0] SERVER: enviarPerguntasReflexivas iniciada")
  console.log("[v0] SERVER: Passo:", numero)
  console.log("[v0] SERVER: Respostas recebidas:", Object.keys(respostas))

  const supabaseAdmin = createSupabaseClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    console.error("[v0] SERVER: Usuário não autenticado")
    return { success: false, error: "Usuário não autenticado" }
  }

  console.log("[v0] SERVER: Buscando discípulo...")
  const { data: discipulo, error: discipuloError } = await supabase
    .from("discipulos")
    .select("*")
    .eq("user_id", user.id)
    .single()

  if (discipuloError || !discipulo) {
    console.error("[v0] SERVER: Erro ao buscar discípulo:", discipuloError)
    return { success: false, error: "Discípulo não encontrado" }
  }

  let notificacaoId: string | null = null
  if (discipulo.discipulador_id) {
    console.log("[v0] SERVER: Criando notificação para discipulador...")

    const numPerguntas = Object.keys(respostas).length

    const { data: novaNotificacao, error: notifError } = await supabaseAdmin
      .from("notificacoes")
      .insert({
        user_id: discipulo.discipulador_id,
        tipo: "perguntas_reflexivas",
        titulo: "Novas perguntas reflexivas",
        mensagem: `Seu discípulo respondeu as ${numPerguntas} perguntas reflexivas do Passo ${numero}.`,
        link: `/discipulador`,
      })
      .select("id")
      .single()

    if (notifError) {
      console.error("[v0] SERVER: Erro ao criar notificação:", notifError)
    } else {
      console.log("[v0] SERVER: Notificação criada com ID:", novaNotificacao.id)
      notificacaoId = novaNotificacao.id
    }
  }

  const respostasArray = Object.keys(respostas)
    .sort() // Garante ordem pergunta1, pergunta2, pergunta3, pergunta4...
    .map((key, index) => ({
      pergunta_id: index + 1,
      resposta: respostas[key],
    }))

  console.log("[v0] SERVER: Inserindo perguntas reflexivas na tabela...")
  console.log("[v0] SERVER: Respostas array:", respostasArray)

  const { error: insertError } = await supabase.from("perguntas_reflexivas").upsert(
    {
      discipulo_id: discipulo.id,
      fase_numero: discipulo.fase_atual || 1,
      passo_numero: numero,
      respostas: respostasArray, // Array JSONB com todas as respostas
      situacao: "enviado",
      xp_ganho: 0,
      discipulador_id: discipulo.discipulador_id,
      notificacao_id: notificacaoId,
      data_envio: new Date().toISOString(),
    },
    {
      onConflict: "discipulo_id,fase_numero,passo_numero",
    },
  )

  if (insertError) {
    console.error("[v0] SERVER: Erro ao inserir perguntas reflexivas:", insertError)
    return { success: false, error: "Erro ao enviar perguntas reflexivas" }
  }

  console.log("[v0] SERVER: Perguntas reflexivas enviadas com sucesso!")
  revalidatePath(`/dashboard/passo/${numero}`)

  return { success: true }
}

export async function recalcularProgressoPasso(numero: number) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    console.error("[v0] SERVER: Usuário não autenticado")
    return { success: false, error: "Usuário não autenticado" }
  }

  const { data: discipulo, error: discipuloError } = await supabase
    .from("discipulos")
    .select("id")
    .eq("user_id", user.id)
    .single()

  if (discipuloError || !discipulo) {
    console.error("[v0] SERVER: Erro ao buscar discípulo:", discipuloError)
    return { success: false, error: "Discípulo não encontrado" }
  }

  const { data: reflexoes, error: reflexoesError } = await supabase
    .from("reflexoes_passo")
    .select("xp_ganho")
    .eq("discipulo_id", discipulo.id)
    .eq("passo_numero", numero)
    .eq("situacao", "aprovado")

  let pontosVideosArtigos = 0
  if (!reflexoesError && reflexoes) {
    pontosVideosArtigos = reflexoes.reduce((total, r) => total + (r.xp_ganho || 0), 0)
    console.log("[v0] SERVER: Pontos de vídeos/artigos a remover:", pontosVideosArtigos)
  }

  const { data: perguntasReflexivas, error: perguntasReflexivasError } = await supabase
    .from("perguntas_reflexivas")
    .select("xp_ganho")
    .eq("discipulo_id", discipulo.id)
    .eq("passo_numero", numero)
    .eq("situacao", "aprovado")

  let pontosPerguntasReflexivas = 0
  if (!perguntasReflexivasError && perguntasReflexivas) {
    pontosPerguntasReflexivas = perguntasReflexivas.reduce((total, r) => total + (r.xp_ganho || 0), 0)
    console.log("[v0] SERVER: Pontos de perguntas reflexivas a manter:", pontosPerguntasReflexivas)
  }

  const totalPontos = pontosPerguntasReflexivas

  const { error: updateProgressoError } = await supabase
    .from("progresso_fases")
    .update({
      pontuacao_passo_atual: totalPontos,
    })
    .eq("discipulo_id", discipulo.id)
    .eq("fase_numero", 1)
    .eq("passo_numero", numero)

  if (updateProgressoError) {
    console.error("[v0] SERVER: Erro ao atualizar progresso:", updateProgressoError)
    return { success: false, error: "Erro ao atualizar progresso" }
  }

  return { success: true, message: "Progresso recalculado com sucesso!" }
}

export async function buscarTarefasPasso(numero: number) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const { data: discipulo } = await supabase.from("discipulos").select("*").eq("user_id", user.id).single()

  if (!discipulo) {
    return null
  }

  console.log("[v0] SERVER: Buscando reflexões para discípulo", discipulo.id, "no passo", numero)

  const { data: reflexoes, error } = await supabase
    .from("reflexoes_passo")
    .select("*")
    .eq("discipulo_id", discipulo.id)
    .eq("passo_numero", numero)

  if (error) {
    console.error("[v0] SERVER: Erro ao buscar reflexões:", error)
  }

  console.log("[v0] SERVER: Reflexões do passo", numero, "encontradas:", reflexoes?.length || 0)

  console.log("[v0] SERVER: Buscando perguntas reflexivas - discipulo_id:", discipulo.id, "passo:", numero)

  const { data: perguntasReflexivas, error: errorPerguntas } = await supabase
    .from("perguntas_reflexivas")
    .select("*")
    .eq("discipulo_id", discipulo.id)
    .eq("passo_numero", numero)

  if (errorPerguntas) {
    console.error("[v0] SERVER: Erro ao buscar perguntas reflexivas:", errorPerguntas)
  }

  console.log("[v0] SERVER: Perguntas reflexivas do passo", numero, "encontradas:", perguntasReflexivas?.length || 0)

  return {
    reflexoes: reflexoes || [],
    perguntasReflexivas: perguntasReflexivas || [],
  }
}

export async function resetarReflexoes(numero: number) {
  const supabase = await createClient()
  const supabaseAdmin = createSupabaseClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    console.error("[v0] SERVER: Usuário não autenticado")
    return { success: false, error: "Usuário não autenticado" }
  }

  const { data: discipulo } = await supabase.from("discipulos").select("id").eq("user_id", user.id).single()

  if (!discipulo) {
    console.error("[v0] SERVER: Discípulo não encontrado")
    return { success: false, error: "Discípulo não encontrado" }
  }

  try {
    const { error: deleteReflexoesError } = await supabaseAdmin
      .from("reflexoes_passo")
      .delete()
      .eq("discipulo_id", discipulo.id)
      .eq("passo_numero", numero)

    if (deleteReflexoesError) {
      console.error("[v0] SERVER: Erro ao deletar reflexões:", deleteReflexoesError)
      return { success: false, error: "Erro ao deletar reflexões" }
    }

    const { error: deletePerguntasError } = await supabaseAdmin
      .from("perguntas_reflexivas")
      .delete()
      .eq("discipulo_id", discipulo.id)
      .eq("passo_numero", numero)

    if (deletePerguntasError) {
      console.error("[v0] SERVER: Erro ao deletar perguntas reflexivas:", deletePerguntasError)
      return { success: false, error: "Erro ao deletar perguntas reflexivas" }
    }

    return { success: true, message: "Reflexões resetadas com sucesso!" }
  } catch (error) {
    console.error("[v0] SERVER: Erro ao resetar reflexões:", error)
    return { success: false, error: "Erro ao resetar reflexões" }
  }
}

export async function salvarReflexaoVideo(numero: number, videoId: string, titulo: string, reflexao: string) {
  const supabase = await createClient()
  const supabaseAdmin = createSupabaseClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    console.error("[v0] SERVER: Usuário não autenticado")
    return { success: false, error: "Usuário não autenticado" }
  }

  const { data: discipulo } = await supabase.from("discipulos").select("*").eq("user_id", user.id).single()

  if (!discipulo) {
    console.error("[v0] SERVER: Discípulo não encontrado")
    return { success: false, error: "Discípulo não encontrado" }
  }

  console.log("[v0] SERVER: Verificando reflexão existente...")
  const { data: reflexaoExistente } = await supabase
    .from("reflexoes_passo")
    .select("id, notificacao_id, conteudos_ids, reflexoes")
    .eq("discipulo_id", discipulo.id)
    .eq("fase_numero", 1)
    .eq("passo_numero", numero)
    .eq("tipo", "video")
    .contains("conteudos_ids", [videoId])
    .maybeSingle()

  console.log("[v0] SERVER: Reflexão existente?", !!reflexaoExistente)

  let notificacaoId: string | null = null

  if (!reflexaoExistente && discipulo.discipulador_id) {
    console.log("[v0] SERVER: Criando notificação para discipulador...")

    const { data: novaNotificacao, error: notifError } = await supabaseAdmin
      .from("notificacoes")
      .insert({
        user_id: discipulo.discipulador_id,
        tipo: "reflexao",
        titulo: "Nova reflexão de vídeo",
        mensagem: `Seu discípulo completou o vídeo "${titulo}" com uma reflexão no Passo ${numero}.`,
        link: `/discipulador`,
      })
      .select("id")
      .single()

    if (notifError) {
      console.error("[v0] SERVER: Erro ao criar notificação:", notifError)
    } else {
      console.log("[v0] SERVER: ✅ Notificação criada com ID:", novaNotificacao.id)
      notificacaoId = novaNotificacao.id
    }
  }

  if (!reflexaoExistente) {
    console.log("[v0] SERVER: Inserindo nova reflexão...")
    const { data: novaReflexao, error: reflexaoError } = await supabase
      .from("reflexoes_passo")
      .insert({
        discipulo_id: discipulo.id,
        discipulador_id: discipulo.discipulador_id,
        fase_numero: 1,
        passo_numero: numero,
        tipo: "video",
        conteudos_ids: [videoId],
        titulo: titulo,
        reflexoes: { [videoId]: reflexao },
        notificacao_id: notificacaoId,
        situacao: "enviado", // Marcar como enviado
      })
      .select("id")
      .single()

    if (reflexaoError) {
      console.error("[v0] SERVER: Erro ao inserir reflexão:", reflexaoError)
      return { success: false, error: "Erro ao salvar reflexão" }
    } else {
      console.log("[v0] SERVER: ✅ Reflexão inserida com sucesso! ID:", novaReflexao.id)

      if (notificacaoId) {
        const { error: updateError } = await supabaseAdmin
          .from("notificacoes")
          .update({ reflexao_id: novaReflexao.id })
          .eq("id", notificacaoId)

        if (updateError) {
          console.error("[v0] SERVER: Erro ao atualizar notificação:", updateError)
        } else {
          console.log("[v0] SERVER: ✅ Notificação atualizada com reflexao_id")
        }
      }
    }
  }

  const { data: progressoExistente } = await supabase
    .from("progresso_fases")
    .select("*")
    .eq("discipulo_id", discipulo.id)
    .maybeSingle()

  if (!progressoExistente) {
    await supabase.from("progresso_fases").insert({
      discipulo_id: discipulo.id,
      fase_atual: discipulo.fase_atual || 1,
      passo_atual: numero,
      videos_assistidos: [videoId],
      artigos_lidos: [],
      reflexoes_concluidas: 1, // Incrementar reflexões concluídas
      pontuacao_passo_atual: 10, // Adicionar pontuação total
      data_inicio: new Date().toISOString(),
    })
  } else {
    const videosAtuais = (progressoExistente.videos_assistidos as string[]) || []
    if (!videosAtuais.includes(videoId)) {
      videosAtuais.push(videoId)
      await supabase
        .from("progresso_fases")
        .update({
          videos_assistidos: videosAtuais,
          reflexoes_concluidas: progressoExistente.reflexoes_concluidas + 1, // Incrementar reflexões concluídas
          pontuacao_passo_atual: (progressoExistente.pontuacao_passo_atual || 0) + 10, // Adicionar pontuação total
        })
        .eq("discipulo_id", discipulo.id)
    }
  }

  return { success: true, videoId }
}

export async function salvarReflexaoArtigo(numero: number, artigoId: string, titulo: string, reflexao: string) {
  const supabase = await createClient()
  const supabaseAdmin = createSupabaseClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    console.error("[v0] SERVER: Usuário não autenticado")
    return { success: false, error: "Usuário não autenticado" }
  }

  const { data: discipulo } = await supabase.from("discipulos").select("*").eq("user_id", user.id).single()

  if (!discipulo) {
    console.error("[v0] SERVER: Discípulo não encontrado")
    return { success: false, error: "Discípulo não encontrado" }
  }

  console.log("[v0] SERVER: Verificando reflexão existente...")
  const { data: reflexaoExistente } = await supabase
    .from("reflexoes_passo")
    .select("id, notificacao_id, conteudos_ids, reflexoes")
    .eq("discipulo_id", discipulo.id)
    .eq("fase_numero", 1)
    .eq("passo_numero", numero)
    .eq("tipo", "artigo")
    .contains("conteudos_ids", [artigoId])
    .maybeSingle()

  console.log("[v0] SERVER: Reflexão existente?", !!reflexaoExistente)

  let notificacaoId: string | null = null

  if (!reflexaoExistente && discipulo.discipulador_id) {
    console.log("[v0] SERVER: Criando notificação para discipulador...")

    const { data: novaNotificacao, error: notifError } = await supabaseAdmin
      .from("notificacoes")
      .insert({
        user_id: discipulo.discipulador_id,
        tipo: "reflexao",
        titulo: "Nova reflexão de artigo",
        mensagem: `Seu discípulo leu o artigo "${titulo}" e fez uma reflexão no Passo ${numero}.`,
        link: `/discipulador`,
      })
      .select("id")
      .single()

    if (notifError) {
      console.error("[v0] SERVER: Erro ao criar notificação:", notifError)
    } else {
      console.log("[v0] SERVER: Notificação criada com ID:", novaNotificacao.id)
      notificacaoId = novaNotificacao.id
    }
  }

  if (!reflexaoExistente) {
    console.log("[v0] SERVER: Inserindo nova reflexão...")
    const { data: novaReflexao, error: reflexaoError } = await supabase
      .from("reflexoes_passo")
      .insert({
        discipulo_id: discipulo.id,
        discipulador_id: discipulo.discipulador_id,
        fase_numero: 1,
        passo_numero: numero,
        tipo: "artigo",
        conteudos_ids: [artigoId],
        titulo: titulo,
        reflexoes: { [artigoId]: reflexao },
        notificacao_id: notificacaoId,
        situacao: "enviado", // Marcar como enviado
      })
      .select("id")
      .single()

    if (reflexaoError) {
      console.error("[v0] SERVER: Erro ao inserir reflexão:", reflexaoError)
      return { success: false, error: "Erro ao salvar reflexão" }
    } else {
      console.log("[v0] SERVER: Reflexão inserida com sucesso! ID:", novaReflexao.id)

      if (notificacaoId) {
        const { error: updateError } = await supabaseAdmin
          .from("notificacoes")
          .update({ reflexao_id: novaReflexao.id })
          .eq("id", notificacaoId)

        if (updateError) {
          console.error("[v0] SERVER: Erro ao atualizar notificação:", updateError)
        } else {
          console.log("[v0] SERVER: Notificação atualizada com reflexao_id")
        }
      }
    }
  }

  const { data: progressoExistente } = await supabase
    .from("progresso_fases")
    .select("*")
    .eq("discipulo_id", discipulo.id)
    .maybeSingle()

  if (!progressoExistente) {
    await supabase.from("progresso_fases").insert({
      discipulo_id: discipulo.id,
      fase_atual: discipulo.fase_atual || 1,
      passo_atual: numero,
      videos_assistidos: [],
      artigos_lidos: [artigoId],
      reflexoes_concluidas: 1, // Incrementar reflexões concluídas
      pontuacao_passo_atual: 10, // Adicionar pontuação total
      data_inicio: new Date().toISOString(),
    })
  } else {
    const artigosAtuais = (progressoExistente.artigos_lidos as string[]) || []
    if (!artigosAtuais.includes(artigoId)) {
      artigosAtuais.push(artigoId)
      await supabase
        .from("progresso_fases")
        .update({
          artigos_lidos: artigosAtuais,
          reflexoes_concluidas: progressoExistente.reflexoes_concluidas + 1, // Incrementar reflexões concluídas
          pontuacao_passo_atual: (progressoExistente.pontuacao_passo_atual || 0) + 10, // Adicionar pontuação total
        })
        .eq("discipulo_id", discipulo.id)
    }
  }

  return { success: true, artigoId }
}

export async function verificarPassoCompleto(numero: number) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    console.error("[v0] SERVER: Usuário não autenticado")
    return { completo: false }
  }

  const { data: discipulo } = await supabase
    .from("discipulos")
    .select("id, passo_atual")
    .eq("user_id", user.id)
    .single()

  if (!discipulo || discipulo.passo_atual !== numero) {
    console.log("[v0] SERVER: Discípulo não encontrado ou não está neste passo")
    return { completo: false }
  }

  // Verificar todas as reflexões do passo
  const { data: reflexoes } = await supabase
    .from("reflexoes_passo")
    .select("situacao")
    .eq("discipulo_id", discipulo.id)
    .eq("passo_numero", numero)

  console.log("[v0] SERVER: Reflexões encontradas:", reflexoes?.length)

  const todasReflexoesAprovadas =
    reflexoes && reflexoes.length > 0 ? reflexoes.every((r) => r.situacao === "aprovado") : false

  console.log("[v0] SERVER: Todas reflexões aprovadas?", todasReflexoesAprovadas)

  // Verificar perguntas reflexivas (nova tabela)
  const { data: perguntasReflexivas } = await supabase
    .from("perguntas_reflexivas")
    .select("situacao")
    .eq("discipulo_id", discipulo.id)
    .eq("passo_numero", numero)
    .maybeSingle()

  const perguntasReflexivasAprovadas = perguntasReflexivas?.situacao === "aprovado"

  console.log("[v0] SERVER: Perguntas reflexivas aprovadas?", perguntasReflexivasAprovadas)

  // Verificar respostas do passo (pergunta E missão)
  const { data: respostas } = await supabase
    .from("historico_respostas_passo")
    .select("situacao")
    .eq("discipulo_id", discipulo.id)
    .eq("passo_numero", numero)

  console.log("[v0] SERVER: Respostas encontradas:", respostas?.length)

  const respostasAprovadas = respostas?.every((r) => r.situacao === "aprovado") || false

  console.log("[v0] SERVER: Respostas aprovadas?", respostasAprovadas)

  const { data: leituraCapitulos } = await supabase
    .from("leituras_capitulos")
    .select("capitulos_lidos")
    .eq("discipulo_id", discipulo.id)
    .single()

  // Buscar capítulos da semana atual (baseado no passo)
  const { data: planoLeitura } = await supabase
    .from("plano_leitura_biblica")
    .select("capitulos_semana")
    .eq("fase", 1)
    .eq("semana", numero)
    .single()

  const capitulosLidos = leituraCapitulos?.capitulos_lidos || []
  const capitulosSemana = planoLeitura?.capitulos_semana || []

  // Verificar se TODOS os capítulos da semana foram lidos
  const leituraSemanalConcluida = capitulosSemana.every((capId: number) => capitulosLidos.includes(capId))

  console.log("[v0] SERVER: Capítulos da semana:", capitulosSemana.length)
  console.log(
    "[v0] SERVER: Capítulos lidos:",
    capitulosLidos.filter((id: number) => capitulosSemana.includes(id)).length,
  )
  console.log("[v0] SERVER: Leitura semanal concluída?", leituraSemanalConcluida)

  const passoCompleto = todasReflexoesAprovadas && perguntasReflexivasAprovadas && leituraSemanalConcluida

  console.log("[v0] SERVER: PASSO COMPLETO?", passoCompleto)

  return {
    completo: passoCompleto,
    reflexoesAprovadas: todasReflexoesAprovadas,
    perguntasReflexivasAprovadas: perguntasReflexivasAprovadas,
    respostasAprovadas: respostasAprovadas,
    leituraSemanalConcluida: leituraSemanalConcluida,
  }
}

export async function marcarEnviadoParaValidacao(discipuloId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from("progresso_fases")
    .update({ enviado_para_validacao: true })
    .eq("discipulo_id", discipuloId)

  if (error) {
    console.error("[v0 SERVER] ERRO ao marcar como enviado:", error)
    return { error: error.message }
  }

  return { success: true }
}
