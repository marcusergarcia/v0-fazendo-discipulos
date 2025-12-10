"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

/**
 * Concluir vídeo com reflexão
 * - Busca registro existente tipo="video" para este passo
 * - Se não existe: INSERT novo registro
 * - Se existe: UPDATE adicionando videoId aos arrays conteudos_ids e reflexoes
 */
export async function concluirVideoComReflexao(passoNumero: number, videoId: string, titulo: string, reflexao: string) {
  const supabase = await createClient()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error("Usuário não autenticado")

    // Buscar discípulo
    const { data: discipulo } = await supabase
      .from("discipulos")
      .select("id, fase_atual")
      .eq("user_id", user.id)
      .single()

    if (!discipulo) throw new Error("Discípulo não encontrado")

    const { data: reflexaoExistente, error: selectError } = await supabase
      .from("reflexoes_passo")
      .select("*")
      .eq("discipulo_id", discipulo.id)
      .eq("fase_numero", discipulo.fase_atual)
      .eq("passo_numero", passoNumero)
      .eq("tipo", "video")
      .maybeSingle()

    if (selectError && selectError.code !== "PGRST116") {
      throw selectError
    }

    if (!reflexaoExistente) {
      const { data: novaReflexao, error: insertError } = await supabase
        .from("reflexoes_passo")
        .insert({
          discipulo_id: discipulo.id,
          fase_numero: discipulo.fase_atual,
          passo_numero: passoNumero,
          tipo: "video",
          conteudos_ids: [videoId],
          reflexoes: {
            [videoId]: reflexao,
          },
          feedbacks: [],
        })
        .select()
        .single()

      if (insertError) throw insertError

      // Criar notificação
      const { data: discipuladorRelacao } = await supabase
        .from("discipulos")
        .select("discipulador_id")
        .eq("id", discipulo.id)
        .single()

      if (discipuladorRelacao?.discipulador_id) {
        await supabase.from("notificacoes").insert({
          discipulador_id: discipuladorRelacao.discipulador_id,
          discipulo_id: discipulo.id,
          tipo: "reflexao_enviada",
          mensagem: `Nova reflexão de vídeo "${titulo}" enviada`,
          reflexao_id: novaReflexao.id,
        })
      }

      return { success: true, videoId }
    } else {
      const conteudosIdsAtualizados = reflexaoExistente.conteudos_ids || []
      const reflexoesAtualizadas = (reflexaoExistente.reflexoes as Record<string, string>) || {}

      // Verificar se já existe esta reflexão
      if (conteudosIdsAtualizados.includes(videoId)) {
        // Atualizar reflexão existente
        reflexoesAtualizadas[videoId] = reflexao
      } else {
        // Adicionar nova reflexão
        conteudosIdsAtualizados.push(videoId)
        reflexoesAtualizadas[videoId] = reflexao
      }

      const { error: updateError } = await supabase
        .from("reflexoes_passo")
        .update({
          conteudos_ids: conteudosIdsAtualizados,
          reflexoes: reflexoesAtualizadas,
        })
        .eq("id", reflexaoExistente.id)

      if (updateError) throw updateError

      // Criar/atualizar notificação
      const { data: discipuladorRelacao } = await supabase
        .from("discipulos")
        .select("discipulador_id")
        .eq("id", discipulo.id)
        .single()

      if (discipuladorRelacao?.discipulador_id) {
        await supabase.from("notificacoes").insert({
          discipulador_id: discipuladorRelacao.discipulador_id,
          discipulo_id: discipulo.id,
          tipo: "reflexao_enviada",
          mensagem: `Reflexão de vídeo "${titulo}" atualizada`,
          reflexao_id: reflexaoExistente.id,
        })
      }

      return { success: true, videoId }
    }
  } catch (error) {
    console.error("[SERVER] Erro ao concluir vídeo:", error)
    throw error
  }
}

/**
 * Concluir artigo com reflexão
 * - Busca registro existente tipo="artigo" para este passo
 * - Se não existe: INSERT novo registro
 * - Se existe: UPDATE adicionando artigoId aos arrays conteudos_ids e reflexoes
 */
export async function concluirArtigoComReflexao(
  passoNumero: number,
  artigoId: string,
  titulo: string,
  reflexao: string,
) {
  const supabase = await createClient()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error("Usuário não autenticado")

    const { data: discipulo } = await supabase
      .from("discipulos")
      .select("id, fase_atual")
      .eq("user_id", user.id)
      .single()

    if (!discipulo) throw new Error("Discípulo não encontrado")

    const { data: reflexaoExistente, error: selectError } = await supabase
      .from("reflexoes_passo")
      .select("*")
      .eq("discipulo_id", discipulo.id)
      .eq("fase_numero", discipulo.fase_atual)
      .eq("passo_numero", passoNumero)
      .eq("tipo", "artigo")
      .maybeSingle()

    if (selectError && selectError.code !== "PGRST116") {
      throw selectError
    }

    if (!reflexaoExistente) {
      const { data: novaReflexao, error: insertError } = await supabase
        .from("reflexoes_passo")
        .insert({
          discipulo_id: discipulo.id,
          fase_numero: discipulo.fase_atual,
          passo_numero: passoNumero,
          tipo: "artigo",
          conteudos_ids: [artigoId],
          reflexoes: {
            [artigoId]: reflexao,
          },
          feedbacks: [],
        })
        .select()
        .single()

      if (insertError) throw insertError

      const { data: discipuladorRelacao } = await supabase
        .from("discipulos")
        .select("discipulador_id")
        .eq("id", discipulo.id)
        .single()

      if (discipuladorRelacao?.discipulador_id) {
        await supabase.from("notificacoes").insert({
          discipulador_id: discipuladorRelacao.discipulador_id,
          discipulo_id: discipulo.id,
          tipo: "reflexao_enviada",
          mensagem: `Nova reflexão de artigo "${titulo}" enviada`,
          reflexao_id: novaReflexao.id,
        })
      }

      return { success: true, artigoId }
    } else {
      const conteudosIdsAtualizados = reflexaoExistente.conteudos_ids || []
      const reflexoesAtualizadas = (reflexaoExistente.reflexoes as Record<string, string>) || {}

      if (conteudosIdsAtualizados.includes(artigoId)) {
        reflexoesAtualizadas[artigoId] = reflexao
      } else {
        conteudosIdsAtualizados.push(artigoId)
        reflexoesAtualizadas[artigoId] = reflexao
      }

      const { error: updateError } = await supabase
        .from("reflexoes_passo")
        .update({
          conteudos_ids: conteudosIdsAtualizados,
          reflexoes: reflexoesAtualizadas,
        })
        .eq("id", reflexaoExistente.id)

      if (updateError) throw updateError

      const { data: discipuladorRelacao } = await supabase
        .from("discipulos")
        .select("discipulador_id")
        .eq("id", discipulo.id)
        .single()

      if (discipuladorRelacao?.discipulador_id) {
        await supabase.from("notificacoes").insert({
          discipulador_id: discipuladorRelacao.discipulador_id,
          discipulo_id: discipulo.id,
          tipo: "reflexao_enviada",
          mensagem: `Reflexão de artigo "${titulo}" atualizada`,
          reflexao_id: reflexaoExistente.id,
        })
      }

      return { success: true, artigoId }
    }
  } catch (error) {
    console.error("[SERVER] Erro ao concluir artigo:", error)
    throw error
  }
}

export async function salvarRascunho(passoNumero: number, formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Não autenticado")

  const { data: discipulo } = await supabase.from("discipulos").select("id").eq("user_id", user.id).single()
  if (!discipulo) throw new Error("Discípulo não encontrado")

  const rascunho = {
    pergunta: formData.get("resposta_pergunta"),
    missao: formData.get("resposta_missao"),
  }

  await supabase
    .from("progresso_fases")
    .update({ rascunho_resposta: JSON.stringify(rascunho) })
    .eq("discipulo_id", discipulo.id)

  revalidatePath(`/dashboard/passo/${passoNumero}`)
}

export async function enviarParaValidacao(passoNumero: number, formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Não autenticado")

  const { data: discipulo } = await supabase.from("discipulos").select("*").eq("user_id", user.id).single()
  if (!discipulo) throw new Error("Discípulo não encontrado")

  revalidatePath(`/dashboard/passo/${passoNumero}`)
  redirect(`/dashboard/passo/${passoNumero}?submitted=true`)
}

export async function resetarProgresso(passoNumero: number, reflexoesIds: string[], perguntasIds: string[]) {
  const supabase = await createClient()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error("Não autenticado")

    const { data: discipulo } = await supabase.from("discipulos").select("id").eq("user_id", user.id).single()
    if (!discipulo) throw new Error("Discípulo não encontrado")

    if (reflexoesIds.length > 0) {
      await supabase.from("reflexoes_passo").delete().in("id", reflexoesIds)
    }

    if (perguntasIds.length > 0) {
      await supabase.from("perguntas_reflexivas").delete().in("id", perguntasIds)
    }

    await supabase
      .from("progresso_fases")
      .update({
        videos_assistidos: [],
        artigos_lidos: [],
        reflexoes_concluidas: 0,
        pontuacao_passo_atual: 0,
        rascunho_resposta: null,
      })
      .eq("discipulo_id", discipulo.id)

    revalidatePath(`/dashboard/passo/${passoNumero}`)
    return { success: true }
  } catch (error) {
    console.error("Erro ao resetar progresso:", error)
    return { success: false, error: error.message }
  }
}

export async function buscarReflexoesParaReset(passoNumero: number) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Não autenticado")

  const { data: discipulo } = await supabase.from("discipulos").select("id").eq("user_id", user.id).single()
  if (!discipulo) throw new Error("Discípulo não encontrado")

  const { data: reflexoes } = await supabase
    .from("reflexoes_passo")
    .select("*")
    .eq("discipulo_id", discipulo.id)
    .eq("passo_numero", passoNumero)

  const { data: perguntasReflexivas } = await supabase
    .from("perguntas_reflexivas")
    .select("*")
    .eq("discipulo_id", discipulo.id)
    .eq("passo_numero", passoNumero)

  return {
    reflexoes: reflexoes || [],
    perguntasReflexivas: perguntasReflexivas || [],
  }
}

export async function receberRecompensasEAvancar(passoNumero: number) {
  const supabase = await createClient()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error("Não autenticado")

    const { data: discipulo } = await supabase.from("discipulos").select("*").eq("user_id", user.id).single()
    if (!discipulo) throw new Error("Discípulo não encontrado")

    const { data: progresso } = await supabase
      .from("progresso_fases")
      .select("pontuacao_passo_atual")
      .eq("discipulo_id", discipulo.id)
      .single()

    const xpGanho = progresso?.pontuacao_passo_atual || 0

    await supabase
      .from("discipulos")
      .update({
        xp_total: (discipulo.xp_total || 0) + xpGanho,
        passo_atual: passoNumero + 1,
      })
      .eq("id", discipulo.id)

    await supabase
      .from("progresso_fases")
      .update({
        pontuacao_passo_atual: 0,
        reflexoes_concluidas: 0,
        videos_assistidos: [],
        artigos_lidos: [],
      })
      .eq("discipulo_id", discipulo.id)

    revalidatePath("/dashboard")
    return { success: true, message: `+${xpGanho} XP recebidos!` }
  } catch (error) {
    console.error("Erro ao receber recompensas:", error)
    return { success: false, error: error.message }
  }
}

export async function enviarPerguntasReflexivas(passoNumero: number, respostas: Record<string, string>) {
  const supabase = await createClient()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error("Não autenticado")

    const { data: discipulo } = await supabase.from("discipulos").select("*").eq("user_id", user.id).single()
    if (!discipulo) throw new Error("Discípulo não encontrado")

    await supabase.from("perguntas_reflexivas").insert({
      discipulo_id: discipulo.id,
      passo_numero: passoNumero,
      respostas,
      situacao: "enviado",
    })

    const { data: discipuladorRelacao } = await supabase
      .from("discipulos")
      .select("discipulador_id")
      .eq("id", discipulo.id)
      .single()

    if (discipuladorRelacao?.discipulador_id) {
      await supabase.from("notificacoes").insert({
        discipulador_id: discipuladorRelacao.discipulador_id,
        discipulo_id: discipulo.id,
        tipo: "perguntas_reflexivas",
        mensagem: `Perguntas reflexivas do Passo ${passoNumero} enviadas`,
      })
    }

    revalidatePath(`/dashboard/passo/${passoNumero}`)
    return { success: true }
  } catch (error) {
    console.error("Erro ao enviar perguntas reflexivas:", error)
    return { success: false, error: error.message }
  }
}
