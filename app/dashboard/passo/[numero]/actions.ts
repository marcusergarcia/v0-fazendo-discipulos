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
    .from("reflexoes_conteudo")
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
      .eq("fase_numero", 1)
      .eq("passo_numero", numero)
      .eq("situacao", "aprovado")

    if (!respostasError && respostas) {
      pontosMantidos = respostas.reduce((total, r) => total + (r.xp_ganho || 0), 0)
      console.log("[v0] 📊 Pontos de perguntas/missões a manter:", pontosMantidos)
    }

    let pontosVideosArtigos = 0
    if (reflexoesIds.length > 0) {
      const { data: reflexoesResetadas } = await supabase
        .from("reflexoes_conteudo")
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
        .from("reflexoes_conteudo")
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
      const { error: errorExcluir } = await supabaseAdmin.from("reflexoes_conteudo").delete().in("id", reflexoesIds)

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

  console.log("[v0] SERVER: Verificando reflexão existente...")
  const { data: reflexaoExistente } = await supabase
    .from("reflexoes_conteudo")
    .select("id, notificacao_id")
    .eq("discipulo_id", discipulo.id)
    .eq("fase_numero", 1)
    .eq("passo_numero", numero)
    .eq("tipo", "video")
    .eq("conteudo_id", videoId)
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
      .from("reflexoes_conteudo")
      .insert({
        discipulo_id: discipulo.id,
        discipulador_id: discipulo.discipulador_id,
        fase_numero: 1,
        passo_numero: numero,
        tipo: "video",
        conteudo_id: videoId,
        titulo: titulo,
        reflexao: reflexao,
        notificacao_id: notificacaoId,
        situacao: "enviado", // Marcar como enviado
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

  console.log("[v0] SERVER: Verificando reflexão existente...")
  const { data: reflexaoExistente } = await supabase
    .from("reflexoes_conteudo")
    .select("id, notificacao_id")
    .eq("discipulo_id", discipulo.id)
    .eq("fase_numero", 1)
    .eq("passo_numero", numero)
    .eq("tipo", "artigo")
    .eq("conteudo_id", artigoId)
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
      console.log("[v0] SERVER: ✅ Notificação criada com ID:", novaNotificacao.id)
      notificacaoId = novaNotificacao.id
    }
  }

  if (!reflexaoExistente) {
    console.log("[v0] SERVER: Inserindo nova reflexão...")
    const { data: novaReflexao, error: reflexaoError } = await supabase
      .from("reflexoes_conteudo")
      .insert({
        discipulo_id: discipulo.id,
        discipulador_id: discipulo.discipulador_id,
        fase_numero: 1,
        passo_numero: numero,
        tipo: "artigo",
        conteudo_id: artigoId,
        titulo: titulo,
        reflexao: reflexao,
        notificacao_id: notificacaoId,
        situacao: "enviado", // Marcar como enviado
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
    .from("reflexoes_conteudo")
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

    // Atualizando recompensas (array de insígnias)...
    console.error("[v0 SERVER] Atualizando recompensas (array de insígnias)...")

    const { data: recompensaExistente, error: fetchRecompensaError } = await supabaseAdmin
      .from("recompensas")
      .select("*")
      .eq("discipulo_id", discipulo.id)
      .maybeSingle()

    if (fetchRecompensaError) {
      console.error("[v0 SERVER] ERRO ao buscar recompensas existentes:", JSON.stringify(fetchRecompensaError))
    }

    const existeRecompensa = !!recompensaExistente
    console.error("[v0 SERVER] Recompensa existente encontrada?", existeRecompensa)

    const novaInsignia = {
      nome: `Passo ${numeroPasso} Concluído`,
      descricao: `Você completou o passo ${numeroPasso} e ganhou ${xpPasso} XP!`,
      passo: numeroPasso,
      fase: faseAtual,
      data: new Date().toISOString(),
    }

    console.error("[v0 SERVER] Nova insígnia a adicionar:", JSON.stringify(novaInsignia))

    if (existeRecompensa) {
      const insigniasAtuais = Array.isArray(recompensaExistente.insignias) ? recompensaExistente.insignias : []

      console.error("[v0 SERVER] Insígnias atuais:", insigniasAtuais.length)

      insigniasAtuais.push(novaInsignia)

      console.error("[v0 SERVER] Atualizando recompensas com admin client...")
      const { data: updatedData, error: updateError } = await supabaseAdmin
        .from("recompensas")
        .update({
          insignias: insigniasAtuais,
          updated_at: new Date().toISOString(),
        })
        .eq("discipulo_id", discipulo.id)
        .select()

      if (updateError) {
        console.error("[v0 SERVER] ERRO COMPLETO ao atualizar recompensas:")
        console.error("[v0 SERVER] - Code:", updateError.code)
        console.error("[v0 SERVER] - Message:", updateError.message)
        console.error("[v0 SERVER] - Details:", updateError.details)
        console.error("[v0 SERVER] - Hint:", updateError.hint)
      } else {
        console.error("[v0 SERVER] Insígnia adicionada com sucesso! Total:", insigniasAtuais.length)
        console.error("[v0 SERVER] Dados atualizados:", JSON.stringify(updatedData))
      }
    } else {
      console.error("[v0 SERVER] Criando novo registro de recompensas com admin client...")

      const { data: insertedData, error: insertError } = await supabaseAdmin
        .from("recompensas")
        .insert({
          discipulo_id: discipulo.id,
          insignias: [novaInsignia],
          medalhas: [],
          armaduras: [],
          nivel: 1,
        })
        .select()

      if (insertError) {
        console.error("[v0 SERVER] ERRO COMPLETO ao criar recompensas:")
        console.error("[v0 SERVER] - Code:", insertError.code)
        console.error("[v0 SERVER] - Message:", insertError.message)
        console.error("[v0 SERVER] - Details:", insertError.details)
        console.error("[v0 SERVER] - Hint:", insertError.hint)
      } else {
        console.error("[v0 SERVER] Recompensas criadas com sucesso!")
        console.error("[v0 SERVER] Dados inseridos:", JSON.stringify(insertedData))
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
      })
      .eq("discipulo_id", discipulo.id)

    if (updateProgressoError) {
      console.error("[v0 SERVER] ERRO ao atualizar próximo passo:", updateProgressoError)
      throw updateProgressoError
    }
    console.error("[v0 SERVER] Próximo passo atualizado com sucesso")

    console.error("[v0 SERVER] Revalidando páginas...")
    revalidatePath(`/dashboard/passo/${numeroPasso}`)
    revalidatePath(`/dashboard/passo/${proximoPasso}`)
    revalidatePath("/dashboard")

    console.error("[v0 SERVER] ===== FIM receberRecompensasEAvancar - SUCESSO =====")

    return {
      success: true,
      message: `Você avançou para o passo ${proximoPasso}!`,
    }
  } catch (error) {
    console.error("[v0 SERVER] ERRO GERAL:", error)
    return {
      error: error instanceof Error ? error.message : "Erro desconhecido",
    }
  }
}

export async function enviarPerguntasReflexivas(
  numero: number,
  respostas: { pergunta1: string; pergunta2: string; pergunta3: string },
) {
  console.log("[v0] SERVER: enviarPerguntasReflexivas iniciada")
  console.log("[v0] SERVER: Passo:", numero)
  console.log("[v0] SERVER: Respostas recebidas:", Object.keys(respostas))

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

  console.log("[v0] SERVER: User ID:", user?.id)
  console.log("[v0] SERVER: User Error:", userError)

  if (!user) {
    console.error("[v0] SERVER: Usuário não autenticado")
    return { success: false, error: "Usuário não autenticado" }
  }

  const { data: discipulo, error: discipuloError } = await supabase
    .from("discipulos")
    .select("*")
    .eq("user_id", user.id)
    .single()

  console.log("[v0] SERVER: Discípulo ID:", discipulo?.id)
  console.log("[v0] SERVER: Discipulador ID:", discipulo?.discipulador_id)
  console.log("[v0] SERVER: Discipulo Error:", discipuloError)

  if (!discipulo) {
    console.error("[v0] SERVER: Discípulo não encontrado")
    return { success: false, error: "Discípulo não encontrado" }
  }

  let notificacaoId: string | null = null
  if (discipulo.discipulador_id) {
    console.log("[v0] SERVER: Criando notificação para discipulador...")

    const { data: novaNotificacao, error: notifError } = await supabaseAdmin
      .from("notificacoes")
      .insert({
        user_id: discipulo.discipulador_id,
        tipo: "perguntas_reflexivas",
        titulo: "Novas perguntas reflexivas",
        mensagem: `Seu discípulo respondeu as 3 perguntas reflexivas do Passo ${numero}.`,
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

  const respostasArray = [
    { pergunta_id: 1, resposta: respostas.pergunta1 },
    { pergunta_id: 2, resposta: respostas.pergunta2 },
    { pergunta_id: 3, resposta: respostas.pergunta3 },
  ]

  console.log("[v0] SERVER: Inserindo perguntas reflexivas na tabela...")

  const { error: insertError } = await supabase.from("perguntas_reflexivas").upsert(
    {
      discipulo_id: discipulo.id,
      fase_numero: discipulo.fase_atual || 1,
      passo_numero: numero,
      respostas: respostasArray, // Array JSONB com as 3 respostas
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
    .from("reflexoes_conteudo")
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
      pontuacao_total: totalPontos,
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
