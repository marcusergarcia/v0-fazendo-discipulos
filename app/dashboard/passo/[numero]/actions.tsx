"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

/**
 * Concluir vídeo com reflexão
 * - Busca registro existente tipo="video" para este passo
 * - Se não existe: INSERT novo registro
 * - Se existe: UPDATE adicionando videoId aos arrays conteudos_ids e reflexoes
 */
export async function concluirVideoComReflexao(
  passoNumero: number,
  videoId: string,
  titulo: string,
  reflexao: string,
  discipuloId: string, // Added discipuloId parameter
) {
  const adminClient = createAdminClient()

  try {
    const { data: discipulo } = await adminClient
      .from("discipulos")
      .select("id, fase_atual, user_id, discipulador_id")
      .eq("id", discipuloId)
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

      if (discipulo.discipulador_id) {
        const { data: notificacaoExistente } = await adminClient
          .from("notificacoes")
          .select("id")
          .eq("user_id", discipulo.discipulador_id)
          .eq("discipulo_id", discipulo.id)
          .eq("tipo", "reflexao_video")
          .eq("link", `/discipulador?discipulo=${discipulo.id}&passo=${passoNumero}`)
          .maybeSingle()

        if (notificacaoExistente) {
          notificacaoId = notificacaoExistente.id
        } else {
          const { data: notificacao } = await adminClient
            .from("notificacoes")
            .insert({
              user_id: discipulo.discipulador_id,
              discipulo_id: discipulo.id,
              tipo: "reflexao_video",
              titulo: "Nova reflexão de vídeo",
              mensagem: `Reflexões de vídeo no Passo ${passoNumero}`,
              link: `/discipulador?discipulo=${discipulo.id}&passo=${passoNumero}`,
              lida: false,
            })
            .select()
            .single()

          if (notificacao) {
            notificacaoId = notificacao.id
          }
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
  discipuloId: string,
) {
  const adminClient = createAdminClient()

  try {
    const { data: discipulo } = await adminClient
      .from("discipulos")
      .select("id, fase_atual, discipulador_id")
      .eq("id", discipuloId)
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

      if (discipulo.discipulador_id) {
        const { data: notificacaoExistente } = await adminClient
          .from("notificacoes")
          .select("id")
          .eq("user_id", discipulo.discipulador_id)
          .eq("discipulo_id", discipulo.id)
          .eq("tipo", "reflexao_artigo")
          .eq("link", `/discipulador?discipulo=${discipulo.id}&passo=${passoNumero}`)
          .maybeSingle()

        if (notificacaoExistente) {
          notificacaoId = notificacaoExistente.id
        } else {
          const { data: notificacao } = await adminClient
            .from("notificacoes")
            .insert({
              user_id: discipulo.discipulador_id,
              discipulo_id: discipulo.id,
              tipo: "reflexao_artigo",
              titulo: "Nova reflexão de artigo",
              mensagem: `Reflexões de artigo no Passo ${passoNumero}`,
              link: `/discipulador?discipulo=${discipulo.id}&passo=${passoNumero}`,
              lida: false,
            })
            .select()
            .single()

          if (notificacao) {
            notificacaoId = notificacao.id
          }
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

  const userId = await adminClient
    .from("discipulos")
    .select("user_id")
    .eq("id", formData.get("discipuloId"))
    .single()
    .then((res) => res.data.user_id)
  if (!userId) throw new Error("Não autenticado")

  const { data: discipulo } = await adminClient.from("discipulos").select("id").eq("user_id", userId).single()
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

  const userId = await adminClient
    .from("discipulos")
    .select("user_id")
    .eq("id", formData.get("discipuloId"))
    .single()
    .then((res) => res.data.user_id)

  const { data: discipulo } = await adminClient.from("discipulos").select("*").eq("user_id", userId).single()
  if (!discipulo) throw new Error("Discípulo não encontrado")

  revalidatePath(`/dashboard/passo/${passoNumero}`)
  redirect(`/dashboard/passo/${passoNumero}?submitted=true`)
}

export async function resetarProgresso(
  passoNumero: number,
  reflexoesIds: string[],
  perguntasIds: string[],
  discipuloId: string,
) {
  const adminClient = createAdminClient()

  try {
    const { data: discipulo } = await adminClient.from("discipulos").select("id").eq("id", discipuloId).single()

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

export async function buscarReflexoesParaReset(passoNumero: number, discipuloId: string) {
  const adminClient = createAdminClient()

  const { data: discipulo } = await adminClient.from("discipulos").select("id").eq("id", discipuloId).single()

  if (!discipulo) throw new Error("Discípulo não encontrado")

  // Buscar reflexões (vídeos e artigos)
  const { data: reflexoes } = await adminClient
    .from("reflexoes_passo")
    .select("*")
    .eq("discipulo_id", discipulo.id)
    .eq("passo_numero", passoNumero)

  const videosReflexoes = reflexoes?.filter((r) => r.tipo === "video") || []
  const artigosReflexoes = reflexoes?.filter((r) => r.tipo === "artigo") || []

  // Verificar se algum vídeo tem status "aprovado"
  const temVideoAprovado = videosReflexoes.some((r) => r.situacao === "aprovado")
  // Verificar se algum artigo tem status "aprovado"
  const temArtigoAprovado = artigosReflexoes.some((r) => r.situacao === "aprovado")

  const { data: perguntasReflexivas } = await adminClient
    .from("perguntas_reflexivas")
    .select("*")
    .eq("discipulo_id", discipulo.id)
    .eq("passo_numero", passoNumero)

  // Verificar se alguma pergunta reflexiva tem status "aprovado"
  const temPerguntaAprovada =
    perguntasReflexivas?.some((pr) => {
      if (Array.isArray(pr.respostas)) {
        return pr.respostas.some((r: any) => r.situacao === "aprovado")
      }
      return pr.situacao === "aprovado"
    }) || false

  const reflexoesResetaveis: any[] = []

  // Adicionar vídeos apenas se não houver vídeo aprovado
  if (!temVideoAprovado && videosReflexoes.length > 0) {
    videosReflexoes.forEach((reflexao) => {
      const reflexoesArray = (reflexao.reflexoes as any[]) || []
      reflexoesArray.forEach((reflexaoObj: any) => {
        reflexoesResetaveis.push({
          id: reflexao.id,
          conteudo_id: reflexaoObj.conteudo_id,
          tipo: reflexao.tipo,
          titulo: reflexaoObj.titulo,
          reflexao: reflexaoObj.reflexao,
          notificacao_id: reflexao.notificacao_id,
          situacao: reflexao.situacao,
        })
      })
    })
  }

  // Adicionar artigos apenas se não houver artigo aprovado
  if (!temArtigoAprovado && artigosReflexoes.length > 0) {
    artigosReflexoes.forEach((reflexao) => {
      const reflexoesArray = (reflexao.reflexoes as any[]) || []
      reflexoesArray.forEach((reflexaoObj: any) => {
        reflexoesResetaveis.push({
          id: reflexao.id,
          conteudo_id: reflexaoObj.conteudo_id,
          tipo: reflexao.tipo,
          titulo: reflexaoObj.titulo,
          reflexao: reflexaoObj.reflexao,
          notificacao_id: reflexao.notificacao_id,
          situacao: reflexao.situacao,
        })
      })
    })
  }

  const perguntasResetaveis: any[] = []

  if (!temPerguntaAprovada && perguntasReflexivas && perguntasReflexivas.length > 0) {
    perguntasReflexivas.forEach((pr) => {
      if (Array.isArray(pr.respostas)) {
        pr.respostas.forEach((resposta: any, index: number) => {
          perguntasResetaveis.push({
            ...pr,
            id: pr.id,
            perguntaIndex: index + 1,
            respostaIndividual: resposta,
            situacaoIndividual: resposta.situacao || "pendente",
          })
        })
      } else {
        perguntasResetaveis.push(pr)
      }
    })
  }

  console.log(
    "[v0] Grupos resetáveis - Vídeos:",
    !temVideoAprovado,
    "Artigos:",
    !temArtigoAprovado,
    "Perguntas:",
    !temPerguntaAprovada,
  )
  console.log("[v0] Reflexões resetáveis:", reflexoesResetaveis.length)
  console.log("[v0] Perguntas resetáveis:", perguntasResetaveis.length)

  return {
    reflexoes: reflexoesResetaveis,
    perguntasReflexivas: perguntasResetaveis,
    gruposResetaveis: {
      videos: !temVideoAprovado && videosReflexoes.length > 0,
      artigos: !temArtigoAprovado && artigosReflexoes.length > 0,
      perguntas: !temPerguntaAprovada && perguntasReflexivas && perguntasReflexivas.length > 0,
    },
  }
}

export async function receberRecompensasEAvancar(passoNumero: number, discipuloId: string) {
  const adminClient = createAdminClient()

  try {
    const { data: discipulo } = await adminClient.from("discipulos").select("*").eq("id", discipuloId).single()
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

export async function enviarPerguntasReflexivas(
  passoNumero: number,
  respostas: Record<string, string>,
  discipuloId: string,
) {
  const adminClient = createAdminClient()

  try {
    const { data: discipulo } = await adminClient.from("discipulos").select("*").eq("id", discipuloId).single()

    if (!discipulo) throw new Error("Discípulo não encontrado")

    const respostasArray = Object.keys(respostas).map((key) => {
      const perguntaId = Number.parseInt(key.replace("pergunta", ""))
      return {
        pergunta_id: perguntaId,
        resposta: respostas[key],
      }
    })

    let notificacaoId = null
    if (discipulo.discipulador_id) {
      const { data: notificacaoExistente } = await adminClient
        .from("notificacoes")
        .select("id")
        .eq("user_id", discipulo.discipulador_id)
        .eq("discipulo_id", discipulo.id)
        .eq("tipo", "perguntas_reflexivas")
        .eq("link", `/discipulador?discipulo=${discipulo.id}&passo=${passoNumero}`)
        .maybeSingle()

      if (notificacaoExistente) {
        notificacaoId = notificacaoExistente.id
      } else {
        const { data: notificacao } = await adminClient
          .from("notificacoes")
          .insert({
            user_id: discipulo.discipulador_id,
            discipulo_id: discipulo.id,
            tipo: "perguntas_reflexivas",
            titulo: "Perguntas reflexivas enviadas",
            mensagem: `Perguntas reflexivas do Passo ${passoNumero}`,
            link: `/discipulador?discipulo=${discipulo.id}&passo=${passoNumero}`,
            lida: false,
          })
          .select()
          .single()

        if (notificacao) {
          notificacaoId = notificacao.id
        }
      }
    }

    await adminClient.from("perguntas_reflexivas").insert({
      discipulo_id: discipulo.id,
      discipulador_id: discipulo.discipulador_id,
      fase_numero: discipulo.fase_atual,
      passo_numero: passoNumero,
      respostas: respostasArray,
      situacao: "enviado",
      notificacao_id: notificacaoId,
      data_envio: new Date().toISOString(),
    })

    revalidatePath(`/dashboard/passo/${passoNumero}`)
    return { success: true }
  } catch (error) {
    console.error("Erro ao enviar perguntas reflexivas:", error)
    return { success: false, error: error.message }
  }
}

export async function marcarCelebracaoVista(discipuloId: string, faseNumero: number, passoNumero: number) {
  const adminClient = createAdminClient()

  try {
    const { error } = await adminClient
      .from("progresso_fases")
      .update({ celebracao_vista: true })
      .eq("discipulo_id", discipuloId)

    if (error) {
      console.error("[v0] Erro ao marcar celebração como vista:", error)
      throw error
    }

    console.log("[v0] Celebração marcada como vista com sucesso")
    revalidatePath("/dashboard")
    return { success: true }
  } catch (error) {
    console.error("[v0] Erro em marcarCelebracaoVista:", error)
    return { success: false, error: error.message }
  }
}
