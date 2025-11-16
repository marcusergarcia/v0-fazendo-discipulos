"use server"

import { createClient } from "@/lib/supabase/server"
import { redirect } from 'next/navigation'

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
  const respostaPergunta = formData.get("resposta_pergunta") as string
  const respostaMissao = formData.get("resposta_missao") as string

  if (!respostaPergunta || !respostaMissao || respostaMissao.trim().length < 10) {
    return
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return

  const { data: discipulo } = await supabase.from("discipulos").select("*").eq("user_id", user.id).single()

  if (!discipulo) return

  await supabase
    .from("progresso_fases")
    .update({
      resposta_pergunta: respostaPergunta,
      resposta_missao: respostaMissao,
      status_validacao: "pendente",
      enviado_para_validacao: true,
      data_envio_validacao: new Date().toISOString(),
    })
    .eq("discipulo_id", discipulo.id)
    .eq("fase_numero", 1)
    .eq("passo_numero", numero)

  if (discipulo.discipulador_id) {
    await supabase.from("notificacoes").insert({
      user_id: discipulo.discipulador_id,
      tipo: "missao",
      titulo: "Nova missão para validar",
      mensagem: `Seu discípulo enviou a missão do Passo ${numero} para validação.`,
      link: `/discipulador/validar-passo/${discipulo.id}/1/${numero}`,
    })

    // Enviar mensagem automática no chat
    await supabase.from("mensagens").insert({
      discipulo_id: discipulo.id,
      remetente_id: user.id,
      mensagem: `📝 Enviei a missão do Passo ${numero} para você validar!\n\n**Resposta da Pergunta:**\n${respostaPergunta}\n\n**Missão:**\n${respostaMissao}`,
    })
  }

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

export async function resetarProgresso(numero: number, senha: string) {
  console.log("[v0] ===== INICIANDO RESET DE PROGRESSO =====")
  console.log("[v0] Passo número:", numero)
  
  const supabase = await createClient()

  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser()
  
  if (userError || !user) {
    console.log("[v0] ERRO: Usuário não autenticado", userError)
    throw new Error("Usuário não autenticado")
  }

  console.log("[v0] Usuário autenticado:", user.id, user.email)

  const { data: discipulo, error: discipuloError } = await supabase
    .from("discipulos")
    .select("id, discipulador_id")
    .eq("user_id", user.id)
    .single()

  if (discipuloError || !discipulo) {
    console.log("[v0] ERRO ao buscar discípulo:", discipuloError)
    throw new Error("Discípulo não encontrado")
  }

  console.log("[v0] Discípulo encontrado:", discipulo.id)
  console.log("[v0] Discipulador ID:", discipulo.discipulador_id)

  console.log("[v0] Buscando reflexões para excluir...")
  const { data: reflexoes, error: errorBuscarReflexoes } = await supabase
    .from("reflexoes_conteudo")
    .select("id, tipo, titulo")
    .eq("discipulo_id", discipulo.id)
    .eq("fase_numero", 1)
    .eq("passo_numero", numero)

  if (errorBuscarReflexoes) {
    console.log("[v0] ERRO ao buscar reflexões:", errorBuscarReflexoes)
  } else {
    console.log("[v0] Total de reflexões encontradas:", reflexoes?.length || 0)
    console.log("[v0] Reflexões:", reflexoes)

    if (reflexoes && reflexoes.length > 0) {
      const idsReflexoes = reflexoes.map(r => r.id)
      console.log("[v0] IDs das reflexões a excluir:", idsReflexoes)
      
      const { error: errorExcluirReflexoes } = await supabase
        .from("reflexoes_conteudo")
        .delete()
        .in("id", idsReflexoes)

      if (errorExcluirReflexoes) {
        console.log("[v0] ERRO ao excluir reflexões:", errorExcluirReflexoes)
      } else {
        console.log("[v0] ✅ Reflexões excluídas com sucesso!")
      }
    } else {
      console.log("[v0] Nenhuma reflexão encontrada para excluir")
    }
  }

  if (discipulo.discipulador_id) {
    console.log("[v0] Buscando notificações para excluir...")
    const { data: notificacoes, error: errorBuscarNotif } = await supabase
      .from("notificacoes")
      .select("id, titulo, mensagem, link")
      .eq("user_id", discipulo.discipulador_id)

    console.log("[v0] Total de notificações do discipulador:", notificacoes?.length || 0)

    if (notificacoes && notificacoes.length > 0) {
      const notifParaExcluir = notificacoes.filter(n => {
        const mencionaPasso = 
          n.titulo?.includes(`Passo ${numero}`) ||
          n.mensagem?.includes(`Passo ${numero}`) ||
          n.mensagem?.includes(`passo ${numero}`) ||
          n.link?.includes(`/${numero}`)
        
        return mencionaPasso
      })

      console.log("[v0] Notificações relacionadas ao passo:", notifParaExcluir.length)
      console.log("[v0] Notificações para excluir:", notifParaExcluir)

      if (notifParaExcluir.length > 0) {
        const idsNotif = notifParaExcluir.map(n => n.id)
        console.log("[v0] IDs das notificações a excluir:", idsNotif)
        
        const { error: errorExcluirNotif } = await supabase
          .from("notificacoes")
          .delete()
          .in("id", idsNotif)

        if (errorExcluirNotif) {
          console.log("[v0] ERRO ao excluir notificações:", errorExcluirNotif)
        } else {
          console.log("[v0] ✅ Notificações excluídas com sucesso!")
        }
      } else {
        console.log("[v0] Nenhuma notificação relacionada ao passo encontrada")
      }
    }
  }

  console.log("[v0] Resetando progresso...")
  const { error: errorResetProgresso } = await supabase
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
      data_envio_validacao: null,
      data_validacao: null,
      feedback_discipulador: null,
      nota_discipulador: null,
      xp_ganho: 0,
    })
    .eq("discipulo_id", discipulo.id)
    .eq("fase_numero", 1)
    .eq("passo_numero", numero)

  if (errorResetProgresso) {
    console.log("[v0] ERRO ao resetar progresso:", errorResetProgresso)
    throw new Error("Erro ao resetar progresso: " + errorResetProgresso.message)
  }

  console.log("[v0] ✅ Progresso resetado com sucesso!")
  console.log("[v0] ===== RESET CONCLUÍDO COM SUCESSO =====")
  console.log("[v0] Status alterado para: não iniciado no painel do discipulador")

  return { success: true, message: "Progresso resetado com sucesso! Todas as reflexões e notificações foram excluídas." }
}

export async function concluirVideoComReflexao(numero: number, videoId: string, titulo: string, reflexao: string) {
  console.log("[v0] SERVER: concluirVideoComReflexao iniciada")
  console.log("[v0] SERVER: Params:", { numero, videoId, titulo, reflexao: reflexao.substring(0, 50) })
  
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  
  console.log("[v0] SERVER: User ID:", user?.id)
  if (!user) {
    console.log("[v0] SERVER: Usuário não encontrado!")
    return
  }

  const { data: discipulo } = await supabase.from("discipulos").select("*").eq("user_id", user.id).single()
  
  console.log("[v0] SERVER: Discípulo ID:", discipulo?.id)
  console.log("[v0] SERVER: Discipulador ID:", discipulo?.discipulador_id)
  if (!discipulo) {
    console.log("[v0] SERVER: Discípulo não encontrado!")
    return
  }

  console.log("[v0] SERVER: Verificando reflexão existente...")
  const { data: reflexaoExistente } = await supabase
    .from("reflexoes_conteudo")
    .select("id")
    .eq("discipulo_id", discipulo.id)
    .eq("fase_numero", 1)
    .eq("passo_numero", numero)
    .eq("tipo", "video")
    .eq("conteudo_id", videoId)
    .maybeSingle()

  console.log("[v0] SERVER: Reflexão existente?", !!reflexaoExistente)

  if (!reflexaoExistente) {
    console.log("[v0] SERVER: Inserindo nova reflexão...")
    const { error: reflexaoError } = await supabase.from("reflexoes_conteudo").insert({
      discipulo_id: discipulo.id,
      discipulador_id: discipulo.discipulador_id,
      fase_numero: 1,
      passo_numero: numero,
      tipo: "video",
      conteudo_id: videoId,
      titulo: titulo,
      reflexao: reflexao,
    })
    
    if (reflexaoError) {
      console.error("[v0] SERVER: Erro ao inserir reflexão:", reflexaoError)
    } else {
      console.log("[v0] SERVER: Reflexão inserida com sucesso!")
    }
  }

  console.log("[v0] SERVER: Verificando/criando progresso...")
  const { data: progressoExistente } = await supabase
    .from("progresso_fases")
    .select("*")
    .eq("discipulo_id", discipulo.id)
    .eq("fase_numero", 1)
    .eq("passo_numero", numero)
    .maybeSingle()

  if (!progressoExistente) {
    console.log("[v0] SERVER: Criando registro de progresso...")
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
    console.log("[v0] SERVER: Marcando vídeo como assistido...")
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

  if (discipulo.discipulador_id && !reflexaoExistente) {
    console.log("[v0] SERVER: Criando notificação para discipulador...")
    const cincoMinutosAtras = new Date(Date.now() - 5 * 60 * 1000).toISOString()
    
    const { data: notificacaoRecente } = await supabase
      .from("notificacoes")
      .select("id")
      .eq("user_id", discipulo.discipulador_id)
      .eq("tipo", "reflexao")
      .gte("created_at", cincoMinutosAtras)
      .like("mensagem", `%"${titulo}"%`)
      .maybeSingle()

    if (!notificacaoRecente) {
      const { error: notifError } = await supabase.from("notificacoes").insert({
        user_id: discipulo.discipulador_id,
        tipo: "reflexao",
        titulo: "Nova reflexão de vídeo",
        mensagem: `Seu discípulo completou o vídeo "${titulo}" com uma reflexão.`,
        link: `/discipulador`,
      })
      
      if (notifError) {
        console.error("[v0] SERVER: Erro ao criar notificação:", notifError)
      } else {
        console.log("[v0] SERVER: Notificação criada!")
      }
    }
  }

  console.log("[v0] SERVER: Redirecionando...")
  return { success: true, videoId }
}

export async function concluirArtigoComReflexao(numero: number, artigoId: string, titulo: string, reflexao: string) {
  console.log("[v0] SERVER: concluirArtigoComReflexao iniciada")
  console.log("[v0] SERVER: Params:", { numero, artigoId, titulo, reflexao: reflexao.substring(0, 50) })
  
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  
  console.log("[v0] SERVER: User ID:", user?.id)
  if (!user) {
    console.log("[v0] SERVER: Usuário não encontrado!")
    return
  }

  const { data: discipulo } = await supabase.from("discipulos").select("*").eq("user_id", user.id).single()
  
  console.log("[v0] SERVER: Discípulo ID:", discipulo?.id)
  console.log("[v0] SERVER: Discipulador ID:", discipulo?.discipulador_id)
  if (!discipulo) {
    console.log("[v0] SERVER: Discípulo não encontrado!")
    return
  }

  console.log("[v0] SERVER: Verificando reflexão existente...")
  const { data: reflexaoExistente } = await supabase
    .from("reflexoes_conteudo")
    .select("id")
    .eq("discipulo_id", discipulo.id)
    .eq("fase_numero", 1)
    .eq("passo_numero", numero)
    .eq("tipo", "artigo")
    .eq("conteudo_id", artigoId)
    .maybeSingle()

  console.log("[v0] SERVER: Reflexão existente?", !!reflexaoExistente)

  if (!reflexaoExistente) {
    console.log("[v0] SERVER: Inserindo nova reflexão...")
    const { error: reflexaoError } = await supabase.from("reflexoes_conteudo").insert({
      discipulo_id: discipulo.id,
      discipulador_id: discipulo.discipulador_id,
      fase_numero: 1,
      passo_numero: numero,
      tipo: "artigo",
      conteudo_id: artigoId,
      titulo: titulo,
      reflexao: reflexao,
    })
    
    if (reflexaoError) {
      console.error("[v0] SERVER: Erro ao inserir reflexão:", reflexaoError)
    } else {
      console.log("[v0] SERVER: Reflexão inserida com sucesso!")
    }
  }

  console.log("[v0] SERVER: Verificando/criando progresso...")
  const { data: progressoExistente } = await supabase
    .from("progresso_fases")
    .select("*")
    .eq("discipulo_id", discipulo.id)
    .eq("fase_numero", 1)
    .eq("passo_numero", numero)
    .maybeSingle()

  if (!progressoExistente) {
    console.log("[v0] SERVER: Criando registro de progresso...")
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
    console.log("[v0] SERVER: Marcando artigo como lido...")
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

  if (discipulo.discipulador_id && !reflexaoExistente) {
    console.log("[v0] SERVER: Criando notificação para discipulador...")
    const cincoMinutosAtras = new Date(Date.now() - 5 * 60 * 1000).toISOString()
    
    const { data: notificacaoRecente } = await supabase
      .from("notificacoes")
      .select("id")
      .eq("user_id", discipulo.discipulador_id)
      .eq("tipo", "reflexao")
      .gte("created_at", cincoMinutosAtras)
      .like("mensagem", `%"${titulo}"%`)
      .maybeSingle()

    if (!notificacaoRecente) {
      const { error: notifError } = await supabase.from("notificacoes").insert({
        user_id: discipulo.discipulador_id,
        tipo: "reflexao",
        titulo: "Nova reflexão de artigo",
        mensagem: `Seu discípulo leu o artigo "${titulo}" e fez uma reflexão.`,
        link: `/discipulador`,
      })
      
      if (notifError) {
        console.error("[v0] SERVER: Erro ao criar notificação:", notifError)
      } else {
        console.log("[v0] SERVER: Notificação criada!")
      }
    }
  }

  console.log("[v0] SERVER: Redirecionando...")
  return { success: true, artigoId }
}
