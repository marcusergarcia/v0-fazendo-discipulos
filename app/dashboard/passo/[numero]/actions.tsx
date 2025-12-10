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

    console.log("[v0] concluirVideoComReflexao - videoId:", videoId, "titulo:", titulo)

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

    console.log("[v0] reflexaoExistente:", reflexaoExistente ? "SIM" : "NÃO")

    if (!reflexaoExistente) {
      console.log("[v0] Inserindo novo registro tipo=video")

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
      console.log("[v0] Registro inserido com sucesso, id:", novaReflexao.id)

      return { success: true, videoId }
    } else {
      console.log("[v0] Atualizando registro existente, id:", reflexaoExistente.id)
      console.log("[v0] conteudos_ids ANTES:", reflexaoExistente.conteudos_ids)
      console.log("[v0] reflexoes ANTES:", Object.keys(reflexaoExistente.reflexoes || {}))

      const conteudosIdsAtualizados = [...(reflexaoExistente.conteudos_ids || [])]
      const reflexoesAtualizadas = { ...((reflexaoExistente.reflexoes as Record<string, string>) || {}) }

      if (!conteudosIdsAtualizados.includes(videoId)) {
        conteudosIdsAtualizados.push(videoId)
        console.log("[v0] Adicionando videoId ao array:", videoId)
      } else {
        console.log("[v0] videoId já existe no array, apenas atualizando reflexão")
      }
      reflexoesAtualizadas[videoId] = reflexao

      console.log("[v0] conteudos_ids DEPOIS:", conteudosIdsAtualizados)
      console.log("[v0] reflexoes DEPOIS:", Object.keys(reflexoesAtualizadas))

      const { error: updateError } = await supabase
        .from("reflexoes_passo")
        .update({
          conteudos_ids: conteudosIdsAtualizados,
          reflexoes: reflexoesAtualizadas,
        })
        .eq("id", reflexaoExistente.id)

      if (updateError) {
        console.error("[v0] ERRO no UPDATE:", updateError)
        throw updateError
      }

      console.log("[v0] UPDATE executado com sucesso")

      return { success: true, videoId }
    }
  } catch (error) {
    console.error("[v0] ERRO GERAL em concluirVideoComReflexao:", error)
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

    console.log("[v0] concluirArtigoComReflexao - artigoId:", artigoId, "titulo:", titulo)

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

    console.log("[v0] reflexaoExistente:", reflexaoExistente ? "SIM" : "NÃO")

    if (!reflexaoExistente) {
      console.log("[v0] Inserindo novo registro tipo=artigo")

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
      console.log("[v0] Registro inserido com sucesso, id:", novaReflexao.id)

      return { success: true, artigoId }
    } else {
      console.log("[v0] Atualizando registro existente, id:", reflexaoExistente.id)
      console.log("[v0] conteudos_ids ANTES:", reflexaoExistente.conteudos_ids)
      console.log("[v0] reflexoes ANTES:", Object.keys(reflexaoExistente.reflexoes || {}))

      const conteudosIdsAtualizados = [...(reflexaoExistente.conteudos_ids || [])]
      const reflexoesAtualizadas = { ...((reflexaoExistente.reflexoes as Record<string, string>) || {}) }

      if (!conteudosIdsAtualizados.includes(artigoId)) {
        conteudosIdsAtualizados.push(artigoId)
        console.log("[v0] Adicionando artigoId ao array:", artigoId)
      } else {
        console.log("[v0] artigoId já existe no array, apenas atualizando reflexão")
      }
      reflexoesAtualizadas[artigoId] = reflexao

      console.log("[v0] conteudos_ids DEPOIS:", conteudosIdsAtualizados)
      console.log("[v0] reflexoes DEPOIS:", Object.keys(reflexoesAtualizadas))

      const { error: updateError } = await supabase
        .from("reflexoes_passo")
        .update({
          conteudos_ids: conteudosIdsAtualizados,
          reflexoes: reflexoesAtualizadas,
        })
        .eq("id", reflexaoExistente.id)

      if (updateError) {
        console.error("[v0] ERRO no UPDATE:", updateError)
        throw updateError
      }

      console.log("[v0] UPDATE executado com sucesso")

      return { success: true, artigoId }
    }
  } catch (error) {
    console.error("[v0] ERRO GERAL em concluirArtigoComReflexao:", error)
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
        user_id: discipuladorRelacao.discipulador_id,
        discipulo_id: discipulo.id,
        tipo: "perguntas_reflexivas",
        titulo: "Perguntas reflexivas enviadas",
        mensagem: `Perguntas reflexivas do Passo ${passoNumero} enviadas`,
        lida: false,
      })
    }

    revalidatePath(`/dashboard/passo/${passoNumero}`)
    return { success: true }
  } catch (error) {
    console.error("Erro ao enviar perguntas reflexivas:", error)
    return { success: false, error: error.message }
  }
}
