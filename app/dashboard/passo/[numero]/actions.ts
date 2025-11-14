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

  const isMultiplicador = discipulo.nivel_atual === "Multiplicador"
  
  if (isMultiplicador) {
    // Multiplicadores têm suas missões auto-aprovadas
    await supabase
      .from("progresso_fases")
      .update({
        resposta_pergunta: respostaPergunta,
        resposta_missao: respostaMissao,
        status_validacao: "aprovado",
        enviado_para_validacao: true,
        data_envio_validacao: new Date().toISOString(),
        data_validacao: new Date().toISOString(),
        completado: true,
        feedback_discipulador: "Missão auto-aprovada para Multiplicador. Continue sua jornada!",
        xp_ganho: 50,
      })
      .eq("discipulo_id", discipulo.id)
      .eq("fase_numero", 1)
      .eq("passo_numero", numero)

    // Adicionar XP
    await supabase
      .from("discipulos")
      .update({ xp_total: (discipulo.xp_total || 0) + 50 })
      .eq("id", discipulo.id)

    redirect(`/dashboard/passo/${numero}?approved=true`)
  } else {
    // Para outros níveis, enviar para validação do discipulador
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

  console.log("[v0] Reset - Discípulo ID:", discipulo.id)
  console.log("[v0] Reset - User ID:", user.id)
  console.log("[v0] Reset - Passo:", numero)

  await supabase
    .from("progresso_fases")
    .update({
      videos_assistidos: [],
      artigos_lidos: [],
      resposta_pergunta: null,
      resposta_missao: null,
      rascunho_resposta: null,
      status_validacao: null,
      enviado_para_validacao: false,
      data_envio_validacao: null,
      data_validacao: null,
      completado: false,
      feedback_discipulador: null,
      xp_ganho: null,
    })
    .eq("discipulo_id", discipulo.id)
    .eq("fase_numero", 1)
    .eq("passo_numero", numero)

  const { data: reflexoesDeleted, error: reflexoesError } = await supabase
    .from("reflexoes_conteudo")
    .delete()
    .eq("discipulo_id", discipulo.id)
    .eq("passo_numero", numero)
    .select()

  console.log("[v0] Reset - Reflexões deletadas:", reflexoesDeleted?.length || 0, reflexoesError)

  if (discipulo.discipulador_id) {
    const { data: mensagensDeleted, error: mensagensError } = await supabase
      .from("mensagens")
      .delete()
      .eq("discipulo_id", discipulo.id)
      .select()

    console.log("[v0] Reset - Mensagens deletadas:", mensagensDeleted?.length || 0, mensagensError)

    // Buscar pelo link que contém o ID do discípulo ou mensagens que mencionam reflexões
    const { data: notifReflexaoDeleted, error: errorReflexao } = await supabase
      .from("notificacoes")
      .delete()
      .eq("user_id", discipulo.discipulador_id)
      .eq("tipo", "reflexao")
      .select()

    console.log("[v0] Reset - Notificações reflexão deletadas:", notifReflexaoDeleted?.length || 0, errorReflexao)

    const { data: notifMissaoDeleted, error: errorMissao } = await supabase
      .from("notificacoes")
      .delete()
      .eq("user_id", discipulo.discipulador_id)
      .eq("tipo", "missao")
      .select()

    console.log("[v0] Reset - Notificações missão deletadas:", notifMissaoDeleted?.length || 0, errorMissao)
  }

  redirect(`/dashboard/passo/${numero}?reset=true`)
}

export async function concluirVideoComReflexao(numero: number, videoId: string, titulo: string, reflexao: string) {
  const supabase = await createClient()

  console.log("[v0] concluirVideoComReflexao recebeu:", { numero, videoId, titulo, reflexao: reflexao?.substring(0, 50) })

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    console.log("[v0] concluirVideoComReflexao - Erro: Usuário não autenticado")
    return
  }

  const { data: discipulo } = await supabase.from("discipulos").select("*").eq("user_id", user.id).single()
  if (!discipulo) {
    console.log("[v0] concluirVideoComReflexao - Erro: Discípulo não encontrado")
    return
  }

  console.log("[v0] concluirVideoComReflexao - Discípulo encontrado:", discipulo.id)

  // Salvar reflexão
  const { data: reflexaoData, error: reflexaoError } = await supabase.from("reflexoes_conteudo").upsert({
    discipulo_id: discipulo.id,
    fase_numero: 1,
    passo_numero: numero,
    tipo: "video",
    conteudo_id: videoId,
    titulo: titulo,
    reflexao: reflexao,
  }).select()

  console.log("[v0] concluirVideoComReflexao - Reflexão salva:", reflexaoData, "Erro:", reflexaoError)

  // Marcar vídeo como assistido
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

  if (discipulo.discipulador_id) {
    const { data: notifData, error: notifError } = await supabase.from("notificacoes").insert({
      user_id: discipulo.discipulador_id,
      tipo: "reflexao",
      titulo: "Nova reflexão de vídeo",
      mensagem: `Seu discípulo completou o vídeo "${titulo}" com uma reflexão.`,
      link: `/discipulador`,
    }).select()

    console.log("[v0] concluirVideoComReflexao - Notificação criada:", notifData, "Erro:", notifError)

    // Enviar no chat
    const { data: msgData, error: msgError } = await supabase.from("mensagens").insert({
      discipulo_id: discipulo.id,
      remetente_id: user.id,
      mensagem: `🎥 Assisti o vídeo "${titulo}" e fiz uma reflexão:\n\n${reflexao}`,
    }).select()

    console.log("[v0] concluirVideoComReflexao - Mensagem criada:", msgData, "Erro:", msgError)
  }

  redirect(`/dashboard/passo/${numero}?video=${videoId}`)
}

export async function concluirArtigoComReflexao(numero: number, artigoId: string, titulo: string, reflexao: string) {
  const supabase = await createClient()

  console.log("[v0] concluirArtigoComReflexao recebeu:", { numero, artigoId, titulo, reflexao: reflexao?.substring(0, 50) })

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    console.log("[v0] concluirArtigoComReflexao - Erro: Usuário não autenticado")
    return
  }

  const { data: discipulo } = await supabase.from("discipulos").select("*").eq("user_id", user.id).single()
  if (!discipulo) {
    console.log("[v0] concluirArtigoComReflexao - Erro: Discípulo não encontrado")
    return
  }

  console.log("[v0] concluirArtigoComReflexao - Discípulo encontrado:", discipulo.id)

  // Salvar reflexão
  const { data: reflexaoData, error: reflexaoError } = await supabase.from("reflexoes_conteudo").upsert({
    discipulo_id: discipulo.id,
    fase_numero: 1,
    passo_numero: numero,
    tipo: "artigo",
    conteudo_id: artigoId,
    titulo: titulo,
    reflexao: reflexao,
  }).select()

  console.log("[v0] concluirArtigoComReflexao - Reflexão salva:", reflexaoData, "Erro:", reflexaoError)

  // Marcar artigo como lido
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

  if (discipulo.discipulador_id) {
    const { data: notifData, error: notifError } = await supabase.from("notificacoes").insert({
      user_id: discipulo.discipulador_id,
      tipo: "reflexao",
      titulo: "Nova reflexão de artigo",
      mensagem: `Seu discípulo leu o artigo "${titulo}" e fez uma reflexão.`,
      link: `/discipulador`,
    }).select()

    console.log("[v0] concluirArtigoComReflexao - Notificação criada:", notifData, "Erro:", notifError)

    // Enviar no chat
    const { data: msgData, error: msgError } = await supabase.from("mensagens").insert({
      discipulo_id: discipulo.id,
      remetente_id: user.id,
      mensagem: `📖 Li o artigo "${titulo}" e fiz uma reflexão:\n\n${reflexao}`,
    }).select()

    console.log("[v0] concluirArtigoComReflexao - Mensagem criada:", msgData, "Erro:", msgError)
  }

  redirect(`/dashboard/passo/${numero}?artigo=${artigoId}`)
}
