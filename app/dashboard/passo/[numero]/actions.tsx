"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

async function getCurrentUser() {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    throw new Error("Usuário não autenticado")
  }

  return user
}

/**
 * Concluir vídeo com reflexão
 * - Busca registro existente tipo="video" para este passo
 * - Se não existe: INSERT novo registro
 * - Se existe: UPDATE adicionando videoId aos arrays conteudos_ids e reflexoes
 */
export async function concluirVideoComReflexao(passoNumero: number, videoId: string, titulo: string, reflexao: string) {
  const adminClient = createAdminClient()

  try {
    const user = await getCurrentUser()
    if (!user) throw new Error("Usuário não autenticado")

    const { data: discipulo } = await adminClient
      .from("discipulos")
      .select("id, fase_atual, user_id, discipulador_id")
      .eq("user_id", user.id)
      .single()

    if (!discipulo) throw new Error("Discípulo não encontrado")

    const { data: reflexaoExistente, error: selectError } = await adminClient
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
      let notificacaoId = null

      // Create notification first if discipulador exists
      if (discipulo.discipulador_id) {
        const { data: notificacao } = await adminClient
          .from("notificacoes")
          .insert({
            user_id: discipulo.discipulador_id,
            discipulo_id: discipulo.id,
            tipo: "reflexao",
            titulo: "Nova reflexão de vídeo",
            mensagem: `Reflexão do vídeo "${titulo}" no Passo ${passoNumero} enviada`,
            lida: false,
          })
          .select()
          .single()

        if (notificacao) {
          notificacaoId = notificacao.id
        }
      }

      const { data: novaReflexao, error: insertError } = await adminClient
        .from("reflexoes_passo")
        .insert({
          discipulo_id: discipulo.id,
          discipulador_id: discipulo.discipulador_id,
          fase_numero: discipulo.fase_atual,
          passo_numero: passoNumero,
          tipo: "video",
          titulo: titulo,
          conteudos_ids: [videoId],
          reflexoes: [
            {
              titulo: titulo,
              reflexao: reflexao,
              conteudo_id: videoId,
              resumo: "",
            },
          ],
          feedbacks: [],
          situacao: "enviado",
          notificacao_id: notificacaoId,
        })
        .select()
        .single()

      if (insertError) throw insertError

      revalidatePath(`/dashboard/passo/${passoNumero}`)
      return { success: true, videoId }
    } else {
      const conteudosIdsAtualizados = [...(reflexaoExistente.conteudos_ids || [])]
      const reflexoesAtualizadas = [...((reflexaoExistente.reflexoes as any[]) || [])]

      if (!conteudosIdsAtualizados.includes(videoId)) {
        conteudosIdsAtualizados.push(videoId)
        reflexoesAtualizadas.push({
          titulo: titulo,
          reflexao: reflexao,
          conteudo_id: videoId,
          resumo: "",
        })
      } else {
        // Update existing reflexao if videoId already exists
        const index = reflexoesAtualizadas.findIndex((r: any) => r.conteudo_id === videoId)
        if (index !== -1) {
          reflexoesAtualizadas[index] = {
            titulo: titulo,
            reflexao: reflexao,
            conteudo_id: videoId,
            resumo: "",
          }
        }
      }

      if (discipulo.discipulador_id) {
        await adminClient.from("notificacoes").insert({
          user_id: discipulo.discipulador_id,
          discipulo_id: discipulo.id,
          tipo: "reflexao",
          titulo: "Nova reflexão de vídeo",
          mensagem: `Reflexão adicional do vídeo "${titulo}" no Passo ${passoNumero} enviada`,
          lida: false,
        })
      }

      const { data: updateData, error: updateError } = await adminClient
        .from("reflexoes_passo")
        .update({
          conteudos_ids: conteudosIdsAtualizados,
          reflexoes: reflexoesAtualizadas,
        })
        .eq("id", reflexaoExistente.id)
        .select()

      if (updateError) throw updateError
      if (!updateData || updateData.length === 0) {
        throw new Error("UPDATE não retornou dados")
      }

      revalidatePath(`/dashboard/passo/${passoNumero}`)
      return { success: true, videoId }
    }
  } catch (error) {
    console.error("Erro em concluirVideoComReflexao:", error)
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
  const adminClient = createAdminClient()

  try {
    const user = await getCurrentUser()
    if (!user) throw new Error("Usuário não autenticado")

    const { data: discipulo } = await adminClient
      .from("discipulos")
      .select("id, fase_atual, discipulador_id")
      .eq("user_id", user.id)
      .single()

    if (!discipulo) throw new Error("Discípulo não encontrado")

    const { data: reflexaoExistente, error: selectError } = await adminClient
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
      let notificacaoId = null

      // Create notification first if discipulador exists
      if (discipulo.discipulador_id) {
        const { data: notificacao } = await adminClient
          .from("notificacoes")
          .insert({
            user_id: discipulo.discipulador_id,
            discipulo_id: discipulo.id,
            tipo: "reflexao",
            titulo: "Nova reflexão de artigo",
            mensagem: `Reflexão do artigo "${titulo}" no Passo ${passoNumero} enviada`,
            lida: false,
          })
          .select()
          .single()

        if (notificacao) {
          notificacaoId = notificacao.id
        }
      }

      const { data: novaReflexao, error: insertError } = await adminClient
        .from("reflexoes_passo")
        .insert({
          discipulo_id: discipulo.id,
          discipulador_id: discipulo.discipulador_id,
          fase_numero: discipulo.fase_atual,
          passo_numero: passoNumero,
          tipo: "artigo",
          titulo: titulo,
          conteudos_ids: [artigoId],
          reflexoes: [
            {
              titulo: titulo,
              reflexao: reflexao,
              conteudo_id: artigoId,
              resumo: "",
            },
          ],
          feedbacks: [],
          situacao: "enviado",
          notificacao_id: notificacaoId,
        })
        .select()
        .single()

      if (insertError) throw insertError

      revalidatePath(`/dashboard/passo/${passoNumero}`)
      return { success: true, artigoId }
    } else {
      const conteudosIdsAtualizados = [...(reflexaoExistente.conteudos_ids || [])]
      const reflexoesAtualizadas = [...((reflexaoExistente.reflexoes as any[]) || [])]

      if (!conteudosIdsAtualizados.includes(artigoId)) {
        conteudosIdsAtualizados.push(artigoId)
        reflexoesAtualizadas.push({
          titulo: titulo,
          reflexao: reflexao,
          conteudo_id: artigoId,
          resumo: "",
        })
      } else {
        // Update existing reflexao if artigoId already exists
        const index = reflexoesAtualizadas.findIndex((r: any) => r.conteudo_id === artigoId)
        if (index !== -1) {
          reflexoesAtualizadas[index] = {
            titulo: titulo,
            reflexao: reflexao,
            conteudo_id: artigoId,
            resumo: "",
          }
        }
      }

      if (discipulo.discipulador_id) {
        await adminClient.from("notificacoes").insert({
          user_id: discipulo.discipulador_id,
          discipulo_id: discipulo.id,
          tipo: "reflexao",
          titulo: "Nova reflexão de artigo",
          mensagem: `Reflexão adicional do artigo "${titulo}" no Passo ${passoNumero} enviada`,
          lida: false,
        })
      }

      const { data: updateData, error: updateError } = await adminClient
        .from("reflexoes_passo")
        .update({
          conteudos_ids: conteudosIdsAtualizados,
          reflexoes: reflexoesAtualizadas,
        })
        .eq("id", reflexaoExistente.id)
        .select()

      if (updateError) throw updateError
      if (!updateData || updateData.length === 0) {
        throw new Error("UPDATE não retornou dados")
      }

      revalidatePath(`/dashboard/passo/${passoNumero}`)
      return { success: true, artigoId }
    }
  } catch (error) {
    console.error("Erro em concluirArtigoComReflexao:", error)
    throw error
  }
}

export async function salvarRascunho(passoNumero: number, formData: FormData) {
  const adminClient = createAdminClient()

  const user = await getCurrentUser()
  if (!user) throw new Error("Não autenticado")

  const { data: discipulo } = await adminClient.from("discipulos").select("id").eq("user_id", user.id).single()
  if (!discipulo) throw new Error("Discípulo não encontrado")

  const rascunho = {
    pergunta: formData.get("resposta_pergunta"),
    missao: formData.get("resposta_missao"),
  }

  await adminClient
    .from("progresso_fases")
    .update({ rascunho_resposta: JSON.stringify(rascunho) })
    .eq("discipulo_id", discipulo.id)

  revalidatePath(`/dashboard/passo/${passoNumero}`)
}

export async function enviarParaValidacao(passoNumero: number, formData: FormData) {
  const adminClient = createAdminClient()

  const user = await getCurrentUser()
  if (!user) throw new Error("Não autenticado")

  const { data: discipulo } = await adminClient.from("discipulos").select("*").eq("user_id", user.id).single()
  if (!discipulo) throw new Error("Discípulo não encontrado")

  revalidatePath(`/dashboard/passo/${passoNumero}`)
  redirect(`/dashboard/passo/${passoNumero}?submitted=true`)
}

export async function resetarProgresso(passoNumero: number, reflexoesIds: string[], perguntasIds: string[]) {
  const adminClient = createAdminClient()

  try {
    const user = await getCurrentUser()
    if (!user) throw new Error("Não autenticado")

    const { data: discipulo } = await adminClient.from("discipulos").select("id").eq("user_id", user.id).single()
    if (!discipulo) throw new Error("Discípulo não encontrado")

    if (reflexoesIds.length > 0) {
      const { error: deleteReflexoesError } = await adminClient.from("reflexoes_passo").delete().in("id", reflexoesIds)

      if (deleteReflexoesError) {
        console.error("Erro ao deletar reflexões:", deleteReflexoesError)
        throw deleteReflexoesError
      }
    }

    if (perguntasIds.length > 0) {
      const { error: deletePerguntasError } = await adminClient
        .from("perguntas_reflexivas")
        .delete()
        .in("id", perguntasIds)

      if (deletePerguntasError) {
        console.error("Erro ao deletar perguntas:", deletePerguntasError)
        throw deletePerguntasError
      }
    }

    const { error: updateError } = await adminClient
      .from("progresso_fases")
      .update({
        videos_assistidos: [],
        artigos_lidos: [],
        reflexoes_concluidas: 0,
        pontuacao_passo_atual: 0,
      })
      .eq("discipulo_id", discipulo.id)

    if (updateError) {
      console.error("Erro ao atualizar progresso:", updateError)
      throw updateError
    }

    revalidatePath(`/dashboard/passo/${passoNumero}`)
    return { success: true }
  } catch (error) {
    console.error("Erro ao resetar progresso:", error)
    return { success: false, error: error.message }
  }
}

export async function buscarReflexoesParaReset(passoNumero: number) {
  const adminClient = createAdminClient()

  const user = await getCurrentUser()
  if (!user) throw new Error("Não autenticado")

  const { data: discipulo } = await adminClient.from("discipulos").select("id").eq("user_id", user.id).single()
  if (!discipulo) throw new Error("Discípulo não encontrado")

  const { data: reflexoes } = await adminClient
    .from("reflexoes_passo")
    .select("*")
    .eq("discipulo_id", discipulo.id)
    .eq("passo_numero", passoNumero)

  const reflexoesExpandidas = (reflexoes || []).flatMap((reflexao) => {
    const reflexoesArray = (reflexao.reflexoes as any[]) || []

    // Return each reflexao object from the array
    return reflexoesArray.map((reflexaoObj: any) => ({
      id: reflexao.id, // ID do registro original (para deletar)
      conteudo_id: reflexaoObj.conteudo_id,
      tipo: reflexao.tipo,
      titulo: reflexaoObj.titulo,
      reflexao: reflexaoObj.reflexao,
      notificacao_id: reflexao.notificacao_id,
    }))
  })

  const { data: perguntasReflexivas } = await adminClient
    .from("perguntas_reflexivas")
    .select("*")
    .eq("discipulo_id", discipulo.id)
    .eq("passo_numero", passoNumero)

  return {
    reflexoes: reflexoesExpandidas,
    perguntasReflexivas: perguntasReflexivas || [],
  }
}

export async function receberRecompensasEAvancar(passoNumero: number) {
  const adminClient = createAdminClient()

  try {
    const user = await getCurrentUser()
    if (!user) throw new Error("Não autenticado")

    const { data: discipulo } = await adminClient.from("discipulos").select("*").eq("user_id", user.id).single()
    if (!discipulo) throw new Error("Discípulo não encontrado")

    const { data: progresso } = await adminClient
      .from("progresso_fases")
      .select("pontuacao_passo_atual")
      .eq("discipulo_id", discipulo.id)
      .single()

    const xpGanho = progresso?.pontuacao_passo_atual || 0

    await adminClient
      .from("discipulos")
      .update({
        xp_total: (discipulo.xp_total || 0) + xpGanho,
        passo_atual: passoNumero + 1,
      })
      .eq("id", discipulo.id)

    await adminClient
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
  const adminClient = createAdminClient()

  try {
    const user = await getCurrentUser()
    if (!user) throw new Error("Não autenticado")

    const { data: discipulo } = await adminClient.from("discipulos").select("*").eq("user_id", user.id).single()
    if (!discipulo) throw new Error("Discípulo não encontrado")

    const respostasArray = Object.keys(respostas).map((key) => {
      const perguntaId = Number.parseInt(key.replace("pergunta", ""))
      return {
        pergunta_id: perguntaId,
        resposta: respostas[key],
      }
    })

    await adminClient.from("perguntas_reflexivas").insert({
      discipulo_id: discipulo.id,
      fase_numero: discipulo.fase_atual,
      passo_numero: passoNumero,
      respostas: respostasArray, // Use array format
      situacao: "enviado",
    })

    const { data: discipuladorRelacao } = await adminClient
      .from("discipulos")
      .select("discipulador_id")
      .eq("id", discipulo.id)
      .single()

    if (discipuladorRelacao?.discipulador_id) {
      await adminClient.from("notificacoes").insert({
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
