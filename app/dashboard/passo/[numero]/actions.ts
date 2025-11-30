"use server"

import { createClient } from "@/lib/supabase/server"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { redirect } from "next/navigation"
import { PASSOS_CONTEUDO } from "@/constants/passos-conteudo"
import { revalidatePath } from "next/cache"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function salvarRascunho(numero: number, formData: FormData) {
  const supabase = await createClient()
  const respostaPergunta = formData.get("resposta_pergunta") as string
  const respostaMissao = formData.get("resposta_missao") as string

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return

  const { data: discipulo } = await supabase.from("discipulos").select("*").eq("user_id", user.id).single()

  if (!discipulo) return

  redirect(`/dashboard/passo/${numero}?saved=true`)
}

export async function enviarParaValidacao(numero: number, formData: FormData) {
  const supabase = await createClient()
  const supabaseAdmin = createSupabaseClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  const respostaPergunta = formData.get("resposta_pergunta") as string
  const respostaMissao = formData.get("resposta_missao") as string

  if (
    !respostaPergunta ||
    !respostaMissao ||
    respostaPergunta.trim().length < 10 ||
    respostaMissao.trim().length < 10
  ) {
    throw new Error("Por favor, preencha ambas as respostas com pelo menos 10 caracteres")
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return

  const { data: discipulo } = await supabase.from("discipulos").select("*").eq("user_id", user.id).single()
  if (!discipulo) return

  const conteudoPasso = PASSOS_CONTEUDO[numero as keyof typeof PASSOS_CONTEUDO]

  let notificacaoId: string | null = null
  if (discipulo.discipulador_id) {
    const { data: novaNotificacao } = await supabaseAdmin
      .from("notificacoes")
      .insert({
        user_id: discipulo.discipulador_id,
        tipo: "respostas_passo",
        titulo: "Novas respostas para avaliar",
        mensagem: `Seu discípulo enviou as respostas do Passo ${numero} para avaliação.`,
        link: `/discipulador`,
        lida: false,
      })
      .select("id")
      .single()

    if (novaNotificacao) {
      notificacaoId = novaNotificacao.id
    }
  }

  const { error: perguntaError } = await supabase.from("historico_respostas_passo").insert({
    discipulo_id: discipulo.id,
    discipulador_id: discipulo.discipulador_id,
    fase_numero: discipulo.fase_atual || 1,
    passo_numero: numero,
    tipo_resposta: "pergunta",
    resposta: respostaPergunta,
    situacao: "enviado",
    notificacao_id: notificacaoId,
    data_envio: new Date().toISOString(),
  })

  if (perguntaError) {
    console.error("[v0] Erro ao salvar pergunta:", perguntaError)
    throw new Error("Erro ao enviar pergunta para avaliação")
  }

  const { error: missaoError } = await supabase.from("historico_respostas_passo").insert({
    discipulo_id: discipulo.id,
    discipulador_id: discipulo.discipulador_id,
    fase_numero: discipulo.fase_atual || 1,
    passo_numero: numero,
    tipo_resposta: "missao",
    resposta: respostaMissao,
    situacao: "enviado",
    notificacao_id: null,
    data_envio: new Date().toISOString(),
  })

  if (missaoError) {
    console.error("[v0] Erro ao salvar missão:", missaoError)
    throw new Error("Erro ao enviar missão para avaliação")
  }

  await supabase
    .from("progresso_fases")
    .update({
      enviado_para_validacao: true,
    })
    .eq("discipulo_id", discipulo.id)
    .eq("fase_numero", discipulo.fase_atual || 1)
    .eq("passo_numero", numero)

  redirect(`/dashboard/passo/${numero}?sent=true`)
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
    .eq("fase_numero", 1)
    .eq("passo_numero", numero)
    .single()

  const videosAtuais = (progresso?.videos_assistidos as string[]) || []
  if (!videosAtuais.includes(videoId)) {
    videosAtuais.push(videoId)
    await supabase
      .from("progresso_fases")
      .update({ videos_assistidos: videosAtuais })
      .eq("discipulo_id", discipulo.id)
      .eq("fase_numero", 1)
      .eq("passo_numero", numero)
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
    .eq("fase_numero", 1)
    .eq("passo_numero", numero)
    .single()

  const artigosAtuais = (progresso?.artigos_lidos as string[]) || []
  if (!artigosAtuais.includes(artigoId)) {
    artigosAtuais.push(artigoId)
    await supabase
      .from("progresso_fases")
      .update({ artigos_lidos: artigosAtuais })
      .eq("discipulo_id", discipulo.id)
      .eq("fase_numero", 1)
      .eq("passo_numero", numero)
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
    return []
  }

  const { data: discipulo, error: discipuloError } = await supabase
    .from("discipulos")
    .select("id")
    .eq("user_id", user.id)
    .single()

  console.log("[v0] SERVER: Discípulo encontrado:", discipulo?.id)

  if (discipuloError || !discipulo) {
    console.error("[v0] SERVER: Erro ao buscar discípulo:", discipuloError)
    return []
  }

  console.log("[v0] SERVER: Buscando TODAS as reflexões do discípulo...")
  const { data: todasReflexoes } = await supabase
    .from("reflexoes_conteudo")
    .select("*")
    .eq("discipulo_id", discipulo.id)

  console.log("[v0] SERVER: Total de reflexões no banco:", todasReflexoes?.length || 0)
  if (todasReflexoes && todasReflexoes.length > 0) {
    console.log("[v0] SERVER: Exemplo de reflexão:", {
      id: todasReflexoes[0].id,
      fase_numero: todasReflexoes[0].fase_numero,
      passo_numero: todasReflexoes[0].passo_numero,
      tipo: todasReflexoes[0].tipo,
    })
  }

  console.log("[v0] SERVER: Buscando reflexões - discipulo_id:", discipulo.id, "passo:", numero)

  const { data: reflexoes, error } = await supabase
    .from("reflexoes_conteudo")
    .select("*")
    .eq("discipulo_id", discipulo.id)
    .eq("passo_numero", numero)

  if (error) {
    console.error("[v0] SERVER: Erro ao buscar reflexões:", error)
    return []
  }

  console.log("[v0] SERVER: Reflexões do passo", numero, "encontradas:", reflexoes?.length || 0)
  if (reflexoes && reflexoes.length > 0) {
    console.log(
      "[v0] SERVER: Detalhes das reflexões:",
      reflexoes.map((r) => ({
        id: r.id,
        titulo: r.titulo,
        tipo: r.tipo,
        notificacao_id: r.notificacao_id,
      })),
    )
  }

  return reflexoes || []
}

export async function resetarProgresso(numero: number, reflexoesIds: string[]) {
  console.log("[v0] ===== INICIANDO RESET DE PROGRESSO =====")
  console.log("[v0] Passo número:", numero)
  console.log("[v0] IDs das reflexões a excluir:", reflexoesIds)

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

    const { data: progressoAtual, error: progressoError } = await supabase
      .from("progresso_fases")
      .select("*")
      .eq("discipulo_id", discipulo.id)
      .eq("fase_numero", 1)
      .eq("passo_numero", numero)
      .single()

    if (progressoError) {
      console.log("[v0] Aviso: Progresso não encontrado, criando novo")
    }

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

    if (reflexoesIds.length > 0) {
      console.log("[v0] Buscando reflexões com seus IDs de notificações...")
      const { data: reflexoes, error: errorBuscar } = await supabase
        .from("reflexoes_conteudo")
        .select("id, notificacao_id")
        .in("id", reflexoesIds)

      if (errorBuscar) {
        console.log("[v0] ERRO ao buscar reflexões:", errorBuscar)
      } else {
        console.log("[v0] Reflexões encontradas:", reflexoes)

        const notificacoesIds = reflexoes?.filter((r) => r.notificacao_id).map((r) => r.notificacao_id) || []

        if (notificacoesIds.length > 0) {
          console.log("[v0] Excluindo", notificacoesIds.length, "notificações...")
          const { error: errorNotif } = await supabaseAdmin.from("notificacoes").delete().in("id", notificacoesIds)

          if (errorNotif) {
            console.error("[v0] ERRO ao excluir notificações:", errorNotif)
            return { success: false, error: "Erro ao excluir notificações" }
          } else {
            console.log("[v0] ✅ Notificações excluídas com sucesso!")
          }
        } else {
          console.log("[v0] ⚠️ Nenhuma notificação encontrada para excluir")
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

    if (pontosVideosArtigos > 0) {
      const { error: xpError } = await supabase.rpc("decrement_xp", {
        discipulo_id: discipulo.id,
        xp_amount: pontosVideosArtigos,
      })

      if (xpError) {
        console.log("[v0] Tentando decrementar XP manualmente...")
        const { data: discipuloAtual } = await supabase
          .from("discipulos")
          .select("xp_total")
          .eq("id", discipulo.id)
          .single()

        const novoXp = Math.max(0, (discipuloAtual?.xp_total || 0) - pontosVideosArtigos)

        await supabase.from("discipulos").update({ xp_total: novoXp }).eq("id", discipulo.id)

        console.log("[v0] XP decrementado manualmente:", pontosVideosArtigos, "pontos")
      } else {
        console.log("[v0] ✅ XP decrementado via RPC:", pontosVideosArtigos, "pontos")
      }
    }

    console.log("[v0] Resetando progresso do passo...")
    const { error: errorReset } = await supabase
      .from("progresso_fases")
      .update({
        videos_assistidos: [],
        artigos_lidos: [],
        reflexoes_concluidas: 0,
        pontuacao_total: pontosMantidos, // Mantém pontos de perguntas/missões
        completado: false,
        enviado_para_validacao: false,
      })
      .eq("discipulo_id", discipulo.id)
      .eq("fase_numero", 1)
      .eq("passo_numero", numero)

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
    .eq("fase_numero", 1)
    .eq("passo_numero", numero)
    .maybeSingle()

  if (!progressoExistente) {
    await supabase.from("progresso_fases").insert({
      discipulo_id: discipulo.id,
      fase_numero: 1,
      passo_numero: numero,
      videos_assistidos: [videoId],
      artigos_lidos: [],
      reflexoes_concluidas: 1, // Incrementar reflexões concluídas
      pontuacao_total: 10, // Adicionar pontuação total
      completado: false,
      enviado_para_validacao: false,
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
          pontuacao_total: progressoExistente.pontuacao_total + 10, // Adicionar pontuação total
        })
        .eq("discipulo_id", discipulo.id)
        .eq("fase_numero", 1)
        .eq("passo_numero", numero)

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
    .eq("fase_numero", 1)
    .eq("passo_numero", numero)
    .maybeSingle()

  if (!progressoExistente) {
    await supabase.from("progresso_fases").insert({
      discipulo_id: discipulo.id,
      fase_numero: 1,
      passo_numero: numero,
      videos_assistidos: [],
      artigos_lidos: [artigoId],
      reflexoes_concluidas: 1, // Incrementar reflexões concluídas
      pontuacao_total: 10, // Adicionar pontuação total
      completado: false,
      enviado_para_validacao: false,
      data_inicio: new Date().toISOString(),
    })
  } else {
    const artigosAtuais = (progressoExistente.artigos_lidos as string[]) || []
    if (!artigosAtuais.includes(artigoId)) {
      artigosAtuais.push(artigoId)
      const { error: progressoError } = await supabase
        .from("progresso_fases")
        .update({
          artigos_lidos: artigosAtuais,
          reflexoes_concluidas: progressoExistente.reflexoes_concluidas + 1, // Incrementar reflexões concluídas
          pontuacao_total: progressoExistente.pontuacao_total + 10, // Adicionar pontuação total
        })
        .eq("discipulo_id", discipulo.id)
        .eq("fase_numero", 1)
        .eq("passo_numero", numero)

      if (progressoError) {
        console.error("[v0] SERVER: Erro ao atualizar progresso:", progressoError)
      } else {
        console.log("[v0] SERVER: Artigo marcado como lido!")
      }
    }
  }

  return { success: true, artigoId }
}

export async function verificarConclusaoPasso(numero: number) {
  console.log("[v0] 🔍 Verificando conclusão do Passo:", numero)

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    console.log("[v0] ❌ Usuário não autenticado")
    return { completo: false }
  }

  const { data: discipulo } = await supabase
    .from("discipulos")
    .select("id, passo_atual")
    .eq("user_id", user.id)
    .single()

  if (!discipulo || discipulo.passo_atual !== numero) {
    console.log("[v0] ❌ Discípulo não encontrado ou não está neste passo")
    return { completo: false }
  }

  // Verificar todas as reflexões do passo
  const { data: reflexoes } = await supabase
    .from("reflexoes_conteudo")
    .select("situacao")
    .eq("discipulo_id", discipulo.id)
    .eq("passo_numero", numero)

  console.log("[v0] 📝 Reflexões encontradas:", reflexoes?.length)

  const todasReflexoesAprovadas =
    reflexoes && reflexoes.length > 0 ? reflexoes.every((r) => r.situacao === "aprovado") : false

  console.log("[v0] ✅ Todas reflexões aprovadas?", todasReflexoesAprovadas)

  const { data: perguntasReflexivas } = await supabase
    .from("historico_respostas_passo")
    .select("situacao, tipo_resposta, conteudo_id")
    .eq("discipulo_id", discipulo.id)
    .eq("passo_numero", numero)
    .eq("tipo_resposta", "reflexao_guiada")
    .order("created_at", { ascending: false })

  console.log("[v0] 💬 Perguntas reflexivas encontradas:", perguntasReflexivas?.length)

  // Verificar se todas as 3 perguntas reflexivas foram aprovadas
  const pergunta1Aprovada = perguntasReflexivas?.some((r) => r.conteudo_id === 1 && r.situacao === "aprovado")
  const pergunta2Aprovada = perguntasReflexivas?.some((r) => r.conteudo_id === 2 && r.situacao === "aprovado")
  const pergunta3Aprovada = perguntasReflexivas?.some((r) => r.conteudo_id === 3 && r.situacao === "aprovado")
  const todasPerguntasReflexivasAprovadas = pergunta1Aprovada && pergunta2Aprovada && pergunta3Aprovada

  console.log("[v0] ❓ Pergunta reflexiva 1 aprovada?", pergunta1Aprovada)
  console.log("[v0] ❓ Pergunta reflexiva 2 aprovada?", pergunta2Aprovada)
  console.log("[v0] ❓ Pergunta reflexiva 3 aprovada?", pergunta3Aprovada)
  console.log("[v0] ✅ Todas perguntas reflexivas aprovadas?", todasPerguntasReflexivasAprovadas)

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

  console.log("[v0] 📖 Capítulos da semana:", capitulosSemana.length)
  console.log("[v0] ✅ Capítulos lidos:", capitulosLidos.filter((id: number) => capitulosSemana.includes(id)).length)
  console.log("[v0] 📚 Leitura semanal concluída?", leituraSemanalConcluida)

  const podeReceberRecompensas = todasReflexoesAprovadas && todasPerguntasReflexivasAprovadas && leituraSemanalConcluida

  console.log("[v0] 🎁 Pode receber recompensas?", podeReceberRecompensas)

  return {
    completo: podeReceberRecompensas,
    reflexoesAprovadas: todasReflexoesAprovadas,
    perguntasReflexivasAprovadas: todasPerguntasReflexivasAprovadas,
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
  const verificacao = await verificarConclusaoPasso(passoAtual)

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

    console.error("[v0 SERVER] Buscando progresso do passo...")
    const { data: progresso, error: progressoError } = await supabase
      .from("progresso_fases")
      .select("*")
      .eq("discipulo_id", discipulo.id)
      .eq("passo_numero", numeroPasso)
      .single()

    if (progressoError || !progresso) {
      console.error("[v0 SERVER] ERRO ao buscar progresso:", progressoError)
      throw new Error("Progresso não encontrado")
    }

    console.error("[v0 SERVER] Progresso encontrado - ID:", progresso.id)
    console.error("[v0 SERVER] Pontos do passo:", progresso.pontuacao_total)
    console.error("[v0 SERVER] Completado?", progresso.completado)
    console.error("[v0 SERVER] Fase atual:", progresso.fase_numero)

    if (isPrMarcus) {
      console.error("[v0 SERVER] Executando aprovação automática para Pr. Marcus...")
      const resultadoAprovacao = await aprovarTarefasPrMarcusAutomatico(numeroPasso)
      if (resultadoAprovacao.error) {
        console.error("[v0 SERVER] ERRO na aprovação automática:", resultadoAprovacao.error)
        throw new Error(resultadoAprovacao.error)
      }
      console.error("[v0 SERVER] Aprovação automática concluída com sucesso")
    }

    const faseAtual = progresso.fase_numero
    const proximoPasso = numeroPasso === 10 ? 1 : numeroPasso + 1
    const proximaFase = numeroPasso === 10 ? faseAtual + 1 : faseAtual

    console.error("[v0 SERVER] Cálculo próximo passo/fase:")
    console.error("[v0 SERVER] - Fase atual:", faseAtual)
    console.error("[v0 SERVER] - Passo atual:", numeroPasso)
    console.error("[v0 SERVER] - Próxima fase:", proximaFase)
    console.error("[v0 SERVER] - Próximo passo:", proximoPasso)

    const novoXpTotal = (discipulo.xp_total || 0) + (progresso.pontuacao_total || 0)
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

    console.error("[v0 SERVER] Marcando progresso como completado...")
    const { error: validarError } = await supabase
      .from("progresso_fases")
      .update({
        completado: true,
        data_completado: new Date().toISOString(),
      })
      .eq("id", progresso.id)

    if (validarError) {
      console.error("[v0 SERVER] ERRO ao marcar progresso como completado:", validarError)
      throw validarError
    }

    console.error("[v0 SERVER] Progresso marcado como completado")

    console.error("[v0 SERVER] Atualizando recompensas (array de insígnias)...")

    // Buscar ou criar registro de recompensas
    const { data: recompensaExistente } = await supabase
      .from("recompensas")
      .select("*")
      .eq("discipulo_id", discipulo.id)
      .single()

    const novaInsignia = {
      nome: `Passo ${numeroPasso} Concluído`,
      descricao: `Você completou o passo ${numeroPasso} e ganhou ${progresso.pontuacao_total} XP!`,
      passo: numeroPasso,
      fase: faseAtual,
    }

    if (recompensaExistente) {
      // Adicionar insígnia ao array existente
      const insigniasAtuais = recompensaExistente.insignias || []
      insigniasAtuais.push(novaInsignia)

      const { error: recompensasError } = await supabase
        .from("recompensas")
        .update({
          insignias: insigniasAtuais,
          updated_at: new Date().toISOString(),
        })
        .eq("discipulo_id", discipulo.id)

      if (recompensasError) {
        console.error("[v0 SERVER] ERRO ao atualizar recompensas:", recompensasError)
      } else {
        console.error("[v0 SERVER] Insígnia adicionada ao array existente")
      }
    } else {
      // Criar novo registro com a primeira insígnia
      const { error: recompensasError } = await supabase.from("recompensas").insert({
        discipulo_id: discipulo.id,
        insignias: [novaInsignia],
        medalhas: [],
        armaduras: [],
        nivel: 1,
      })

      if (recompensasError) {
        console.error("[v0 SERVER] ERRO ao criar recompensas:", recompensasError)
      } else {
        console.error("[v0 SERVER] Novo registro de recompensas criado com primeira insígnia")
      }
    }

    console.error("[v0 SERVER] Criando próximo passo:", proximoPasso, "na fase:", proximaFase)
    const { error: novoProgressoError } = await supabase.from("progresso_fases").upsert(
      {
        discipulo_id: discipulo.id,
        fase_numero: proximaFase,
        passo_numero: proximoPasso,
        pontuacao_total: 0,
        reflexoes_concluidas: 0,
        videos_assistidos: [],
        artigos_lidos: [],
        completado: false,
        enviado_para_validacao: false,
        dias_no_passo: 1,
      },
      {
        onConflict: "discipulo_id,fase_numero,passo_numero",
        ignoreDuplicates: true,
      },
    )

    if (novoProgressoError) {
      console.error("[v0 SERVER] ERRO ao criar próximo passo:", novoProgressoError)
      throw novoProgressoError
    }
    console.error("[v0 SERVER] Próximo passo criado/verificado com sucesso")

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
