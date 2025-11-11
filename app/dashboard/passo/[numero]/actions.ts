"use server"

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

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
      rascunho_resposta: JSON.stringify({ pergunta: respostaPergunta, missao: respostaMissao }),
      enviado_para_validacao: true,
      data_envio_validacao: new Date().toISOString(),
    })
    .eq("discipulo_id", discipulo.id)
    .eq("fase_numero", 1)
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
