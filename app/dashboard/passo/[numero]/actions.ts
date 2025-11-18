"use server"

import { createClient } from "@/lib/supabase/server"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { redirect } from 'next/navigation'
import { PASSOS_CONTEUDO } from "@/constants/passos-conteudo"

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

  await supabase
    .from("progresso_fases")
    .update({
      rascunho_resposta: JSON.stringify({ pergunta: respostaPergunta, missao: respostaMissao }),
    })
    .eq("discipulo_id", discipulo.id)
    .eq("fase_numero", 1)
    .eq("passo_numero", numero)

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

  if (!respostaPergunta || !respostaMissao || respostaPergunta.trim().length < 10 || respostaMissao.trim().length < 10) {
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
    tipo_resposta: 'pergunta',
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
    tipo_resposta: 'missao',
    resposta: respostaMissao,
    situacao: "enviado",
    notificacao_id: null, // Não duplicar notificação
    data_envio: new Date().toISOString(),
  })

  if (missaoError) {
    console.error("[v0] Erro ao salvar missão:", missaoError)
    throw new Error("Erro ao enviar missão para avaliação")
  }

  await supabase
    .from("progresso_fases")
    .update({
      resposta_pergunta: respostaPergunta,
      resposta_missao: respostaMissao,
      status_validacao: "pendente",
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
      tipo: todasReflexoes[0].tipo
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
    console.log("[v0] SERVER: Detalhes das reflexões:", reflexoes.map(r => ({
      id: r.id,
      titulo: r.titulo,
      tipo: r.tipo,
      notificacao_id: r.notificacao_id
    })))
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
      error: userError
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
        
        // Coletar IDs das notificações
        const notificacoesIds = reflexoes
          ?.filter(r => r.notificacao_id)
          .map(r => r.notificacao_id) || []
        
        if (notificacoesIds.length > 0) {
          console.log("[v0] Excluindo", notificacoesIds.length, "notificações...")
          const { error: errorNotif } = await supabaseAdmin
            .from("notificacoes")
            .delete()
            .in("id", notificacoesIds)

          if (errorNotif) {
            console.error("[v0] ERRO ao excluir notificações:", errorNotif)
            return { success: false, error: "Erro ao excluir notificações" }
          } else {
            console.log("[v0] ✅ Notificações excluídas com sucesso!")
          }
        } else {
          console.log("[v0] ⚠️ Nenhuma notificação encontrada para excluir (reflexões órfãs)")
        }
      }

      console.log("[v0] Excluindo", reflexoesIds.length, "reflexões DIRETAMENTE pelo ID...")
      const { error: errorExcluir } = await supabaseAdmin
        .from("reflexoes_conteudo")
        .delete()
        .in("id", reflexoesIds)

      if (errorExcluir) {
        console.error("[v0] ERRO ao excluir reflexões:", errorExcluir)
        return { success: false, error: "Erro ao excluir reflexões" }
      }
      
      console.log("[v0] ✅ TODAS as reflexões excluídas com sucesso!")
    }

    console.log("[v0] Resetando progresso do passo...")
    const { error: errorReset } = await supabase
      .from("progresso_fases")
      .update({
        videos_assistidos: [],
        artigos_lidos: [],
        completado: false,
        enviado_para_validacao: false,
        status_validacao: null,
        resposta_pergunta: null,
        resposta_missao: null,
        rascunho_resposta: null,
        data_completado: null,
      })
      .eq("discipulo_id", discipulo.id)
      .eq("fase_numero", 1)
      .eq("passo_numero", numero)

    if (errorReset) {
      console.error("[v0] ERRO ao resetar progresso:", errorReset)
      return { success: false, error: "Erro ao resetar progresso" }
    }

    console.log("[v0] ✅ Progresso resetado com sucesso!")
    console.log("[v0] ===== RESET CONCLUÍDO =====")

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
        situacao: 'enviado', // Marcar como enviado
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
        .update({ videos_assistidos: videosAtuais })
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
        situacao: 'enviado', // Marcar como enviado
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
        .update({ artigos_lidos: artigosAtuais })
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
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  
  if (!user) return { completo: false }

  const { data: discipulo } = await supabase
    .from("discipulos")
    .select("id, passo_atual")
    .eq("user_id", user.id)
    .single()

  if (!discipulo || discipulo.passo_atual !== numero) {
    return { completo: false }
  }

  // Verificar todas as reflexões do passo
  const { data: reflexoes } = await supabase
    .from("reflexoes_conteudo")
    .select("situacao")
    .eq("discipulo_id", discipulo.id)
    .eq("passo_numero", numero)

  const todasReflexoesAprovadas = reflexoes && reflexoes.length > 0 
    ? reflexoes.every(r => r.situacao === 'aprovado')
    : false

  // Verificar respostas do passo
  const { data: respostas } = await supabase
    .from("historico_respostas_passo")
    .select("situacao")
    .eq("discipulo_id", discipulo.id)
    .eq("passo_numero", numero)
    .order("created_at", { ascending: false })
    .limit(1)

  const respostasAprovadas = respostas && respostas.length > 0
    ? respostas[0].situacao === 'aprovado'
    : false

  const passoCompleto = todasReflexoesAprovadas && respostasAprovadas

  return {
    completo: passoCompleto,
    reflexoesAprovadas: todasReflexoesAprovadas,
    respostasAprovadas: respostasAprovadas,
  }
}

export async function liberarProximoPasso() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  
  if (!user) return { success: false, error: "Usuário não autenticado" }

  const { data: discipulo } = await supabase
    .from("discipulos")
    .select("*")
    .eq("user_id", user.id)
    .single()

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

  const { error } = await supabase
    .from("discipulos")
    .update({ passo_atual: proximoPasso })
    .eq("id", discipulo.id)

  if (error) {
    return { success: false, error: "Erro ao liberar próximo passo" }
  }

  return {
    success: true,
    proximoPasso,
  }
}
