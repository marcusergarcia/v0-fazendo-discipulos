import { notFound } from "next/navigation"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import PassoClient from "./passo-client"
import { PASSOS_CONTEUDO } from "@/constants/passos-evangelho"
import { PASSOS_BATISMO } from "@/constants/passos-batismo"
import { isPassoBatismo, getTotalPassosFase } from "@/constants/fases-passos"

export default async function PassoPage({
  params,
}: {
  params: Promise<{ numero: string }>
}) {
  const { numero: numeroParam } = await params
  const numero = Number.parseInt(numeroParam)

  if (isNaN(numero) || numero < 1) {
    notFound()
  }

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: discipulo, error: discipuloError } = await supabase
    .from("discipulos")
    .select("*")
    .eq("user_id", user.id)
    .single()

  if (!discipulo) {
    redirect("/dashboard")
  }

  const ePassoBatismo = isPassoBatismo(numero)
  const estaEmFaseBatismo = discipulo.necessita_fase_batismo === true && discipulo.ja_batizado === false

  console.log("[v0] Passo Page - numero:", numero)
  console.log("[v0] Passo Page - ePassoBatismo:", ePassoBatismo)
  console.log("[v0] Passo Page - estaEmFaseBatismo:", estaEmFaseBatismo)

  const numeroExibido = ePassoBatismo && estaEmFaseBatismo ? numero - 10 : numero

  let passo
  if (ePassoBatismo && estaEmFaseBatismo) {
    passo = PASSOS_BATISMO[numero as keyof typeof PASSOS_BATISMO]
    console.log("[v0] Buscando passo de batismo - numero:", numero, "encontrado:", !!passo)
  } else if (numero <= 10) {
    passo = PASSOS_CONTEUDO[numero]
    console.log("[v0] Buscando passo de evangelho:", numero, "encontrado:", !!passo)
  }

  if (!passo) {
    console.log("[v0] Passo não encontrado")
    notFound()
  }

  const maxSteps = getTotalPassosFase(discipulo.fase_atual, estaEmFaseBatismo)
  if (numero > maxSteps) {
    notFound()
  }

  const { data: profile } = await supabase.from("profiles").select("nome_completo").eq("id", user.id).single()

  const nomeDiscipulo = profile?.nome_completo || "Sem nome"

  const { data: progresso, error: progressoError } = await supabase
    .from("progresso_fases")
    .select("*")
    .eq("discipulo_id", discipulo.id)
    .maybeSingle()

  let progressoAtual = progresso
  if (!progressoAtual) {
    const { data: novoProgresso, error: novoProgressoError } = await supabase
      .from("progresso_fases")
      .insert({
        discipulo_id: discipulo.id,
        fase_atual: discipulo.fase_atual,
        passo_atual: numero,
        videos_assistidos: [],
        artigos_lidos: [],
        data_inicio: new Date().toISOString(),
      })
      .select()
      .single()

    progressoAtual = novoProgresso
  }

  let passosCompletados
  if (estaEmFaseBatismo) {
    passosCompletados = Math.max(0, numero - 11)
  } else {
    passosCompletados = (discipulo.passo_atual || 1) - 1
  }

  const { data: discipuladorData } = await supabase
    .from("discipulos")
    .select("discipulador_id")
    .eq("id", discipulo.id)
    .single()

  const discipuladorId = discipuladorData?.discipulador_id || null

  let nomeDiscipuladorDiscipulador = null
  if (discipuladorId) {
    const { data: discipuladorProfile } = await supabase
      .from("profiles")
      .select("nome_completo")
      .eq("id", discipuladorId)
      .single()
    nomeDiscipuladorDiscipulador = discipuladorProfile?.nome_completo || "Discipulador"
  }

  const { data: reflexoesPasso, error: reflexoesError } = await supabase
    .from("reflexoes_passo")
    .select("*")
    .eq("discipulo_id", discipulo.id)
    .eq("passo_numero", numero)

  const { data: perguntasReflexivas } = await supabase
    .from("perguntas_reflexivas")
    .select("*")
    .eq("discipulo_id", discipulo.id)
    .eq("passo_numero", numero)
    .maybeSingle()

  const status = "pendente"

  let statusLeituraSemana: "nao_iniciada" | "pendente" | "concluida" = "nao_iniciada"
  let temaSemana = ""
  let descricaoSemana = ""
  let leiturasSemana: any[] = []
  let capitulosLidos: number[] = []

  if (
    numero === 1 ||
    numero === 2 ||
    numero === 3 ||
    numero === 4 ||
    numero === 5 ||
    numero === 6 ||
    numero === 7 ||
    numero === 8 ||
    numero === 9 ||
    numero === 10 ||
    (estaEmFaseBatismo && numero >= 11 && numero <= 22)
  ) {
    const { data: leituraCapitulos, error: leituraError } = await supabase
      .from("leituras_capitulos")
      .select("capitulos_lidos")
      .eq("usuario_id", user.id)
      .single()

    const semanaParaBuscar = estaEmFaseBatismo && numero >= 11 ? numero : numero

    const { data: planoSemana, error: planoError } = await supabase
      .from("plano_leitura_biblica")
      .select("semana, tema, descricao, capitulos_semana")
      .eq("semana", semanaParaBuscar)
      .single()

    if (leituraCapitulos && planoSemana) {
      capitulosLidos = leituraCapitulos.capitulos_lidos || []
      const capitulosSemana = planoSemana.capitulos_semana || []

      temaSemana = planoSemana.tema || ""
      descricaoSemana = planoSemana.descricao || ""

      leiturasSemana = capitulosSemana.map((cap: number) => ({ id: cap }))

      const todosLidos = capitulosSemana.every((cap: number) => capitulosLidos.includes(cap))
      const algumLido = capitulosSemana.some((cap: number) => capitulosLidos.includes(cap))

      if (todosLidos) {
        statusLeituraSemana = "concluida"
      } else if (algumLido) {
        statusLeituraSemana = "pendente"
      } else {
        statusLeituraSemana = "nao_iniciada"
      }
    }
  }

  const videosAssistidos: string[] = []
  const artigosLidos: string[] = []

  if (reflexoesPasso) {
    for (const reflexao of reflexoesPasso) {
      if (reflexao.tipo === "video" && reflexao.conteudos_ids) {
        videosAssistidos.push(...reflexao.conteudos_ids)
      } else if (reflexao.tipo === "artigo" && reflexao.conteudos_ids) {
        artigosLidos.push(...reflexao.conteudos_ids)
      }
    }
  }

  const reflexaoRecord = reflexoesPasso?.[0]
  const feedbacksVideos = passo.videos?.map((video: any) => {
    const feedback = reflexaoRecord?.feedbacks?.find((f: any) => f.conteudo_id === video.id)
    return feedback?.feedback_discipulador || null
  })
  const feedbacksArtigos = passo.artigos?.map((artigo: any) => {
    const feedback = reflexaoRecord?.feedbacks?.find((f: any) => f.conteudo_id === artigo.id)
    return feedback?.feedback_discipulador || null
  })

  const passoComReflexoes = {
    ...passo,
    videos: (passo.videos || []).map((video: any, index: number) => {
      const reflexao = reflexoesPasso?.find((r) => r.tipo === "video" && r.conteudos_ids?.includes(video.id))
      let situacao = null
      let xp = null
      let feedback = null

      if (reflexao && reflexao.reflexoes && Array.isArray(reflexao.reflexoes)) {
        const reflexaoIndividual = reflexao.reflexoes.find((r: any) => r.conteudo_id === video.id)

        if (reflexaoIndividual) {
          if (reflexao.feedbacks && Array.isArray(reflexao.feedbacks)) {
            const feedbackObj = reflexao.feedbacks.find((f: any) => f.conteudo_id === video.id)
            if (feedbackObj) {
              situacao = "aprovado"
              xp = feedbackObj.xp_ganho
              feedback = feedbackObj.feedback_discipulador
            } else {
              situacao = "enviado"
            }
          } else {
            situacao = "enviado"
          }
        }
      }

      return {
        ...video,
        reflexao_situacao: situacao,
        reflexao_xp: xp,
        feedback_discipulador: feedback,
      }
    }),
    artigos: (passo.artigos || []).map((artigo: any, index: number) => {
      const reflexao = reflexoesPasso?.find((r) => r.tipo === "artigo" && r.conteudos_ids?.includes(artigo.id))
      let situacao = null
      let xp = null
      let feedback = null

      if (reflexao && reflexao.reflexoes && Array.isArray(reflexao.reflexoes)) {
        const reflexaoIndividual = reflexao.reflexoes.find((r: any) => r.conteudo_id === artigo.id)

        if (reflexaoIndividual) {
          if (reflexao.feedbacks && Array.isArray(reflexao.feedbacks)) {
            const feedbackObj = reflexao.feedbacks.find((f: any) => f.conteudo_id === artigo.id)
            if (feedbackObj) {
              situacao = "aprovado"
              xp = feedbackObj.xp_ganho
              feedback = feedbackObj.feedback_discipulador
            } else {
              situacao = "enviado"
            }
          } else {
            situacao = "enviado"
          }
        }
      }

      return {
        ...artigo,
        reflexao_situacao: situacao,
        reflexao_xp: xp,
        feedback_discipulador: feedback,
      }
    }),
  }

  const nomeDiscipulador = nomeDiscipuladorDiscipulador

  return (
    <PassoClient
      numero={numero}
      numeroExibido={numeroExibido}
      passo={passoComReflexoes}
      discipulo={{ ...discipulo, nome_completo: nomeDiscipulo }}
      progresso={progressoAtual}
      passosCompletados={passosCompletados}
      videosAssistidos={videosAssistidos}
      artigosLidos={artigosLidos}
      status={status}
      discipuladorId={discipuladorId}
      nomeDiscipulador={nomeDiscipulador}
      statusLeituraSemana={statusLeituraSemana}
      temaSemana={temaSemana}
      descricaoSemana={descricaoSemana}
      perguntasReflexivas={perguntasReflexivas}
      leiturasSemana={leiturasSemana}
      capitulosLidos={capitulosLidos}
      discipuloId={discipulo.id}
      estaEmFaseBatismo={estaEmFaseBatismo}
    />
  )
}
