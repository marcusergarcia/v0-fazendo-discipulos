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

export async function resetarProgresso(numero: number) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return

  const { data: discipulo } = await supabase.from("discipulos").select("*").eq("user_id", user.id).single()
  if (!discipulo) return

  await supabase
    .from("progresso_fases")
    .update({
      videos_assistidos: [],
      artigos_lidos: [],
    })
    .eq("discipulo_id", discipulo.id)
    .eq("fase_numero", 1)
    .eq("passo_numero", numero)

  redirect(`/dashboard/passo/${numero}?reset=true`)
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
      fase_numero: 1,
      passo_numero: numero,
      tipo: "video",
      conteudo_id: videoId,
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
  redirect(`/dashboard/passo/${numero}?video=${videoId}`)
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
      fase_numero: 1,
      passo_numero: numero,
      tipo: "artigo",
      conteudo_id: artigoId,
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
  redirect(`/dashboard/passo/${numero}?artigo=${artigoId}`)
}
