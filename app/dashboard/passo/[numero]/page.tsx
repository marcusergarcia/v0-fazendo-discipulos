import { notFound } from "next/navigation"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import PassoClient from "./passo-client"
import { PASSOS_CONTEUDO } from "@/constants/passos-conteudo"

export default async function PassoPage({ params }: { params: Promise<{ numero: string }> }) {
  const { numero: numeroParam } = await params
  const numero = Number.parseInt(numeroParam)

  if (isNaN(numero) || numero < 1 || numero > 10) {
    notFound()
  }

  const passo = PASSOS_CONTEUDO[numero]

  if (!passo) {
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
        fase_atual: 1,
        passo_atual: numero,
        videos_assistidos: [],
        artigos_lidos: [],
        data_inicio: new Date().toISOString(),
      })
      .select()
      .single()

    progressoAtual = novoProgresso
  }

  const passosCompletados = (discipulo.passo_atual || 1) - 1

  const { data: discipuladorData } = await supabase
    .from("discipulos")
    .select("discipulador_id")
    .eq("id", discipulo.id)
    .single()

  const discipuladorId = discipuladorData?.discipulador_id || null

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

  if (numero === 1 || numero === 2 || numero === 3 || numero === 4 || numero === 5 || numero === 6) {
    const { data: leituraCapitulos, error: leituraError } = await supabase
      .from("leituras_capitulos")
      .select("capitulos_lidos")
      .eq("usuario_id", user.id)
      .single()

    const { data: planoSemana, error: planoError } = await supabase
      .from("plano_leitura_biblica")
      .select("semana, tema, descricao, capitulos_semana")
      .eq("semana", numero)
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

  const passoComReflexoes = {
    ...passo,
    videos: (passo.videos || []).map((video: any) => {
      const reflexao = reflexoesPasso?.find((r) => r.tipo === "video" && r.conteudos_ids?.includes(video.id))
      let situacao = null
      if (reflexao && reflexao.reflexoes && reflexao.reflexoes[video.id]) {
        // Reflexão existe, agora verificar se tem feedback
        if (reflexao.feedbacks && Array.isArray(reflexao.feedbacks)) {
          const feedback = reflexao.feedbacks.find((f: any) => f.conteudo_id === video.id)
          if (feedback) {
            situacao = "aprovada"
          } else {
            situacao = "aguardando_aprovacao"
          }
        } else {
          situacao = "aguardando_aprovacao"
        }
      }
      return {
        ...video,
        reflexao_situacao: situacao,
        reflexao_xp: reflexao?.feedbacks?.find((f: any) => f.conteudo_id === video.id)?.xp_ganho || null,
      }
    }),
    artigos: (passo.artigos || []).map((artigo: any) => {
      const reflexao = reflexoesPasso?.find((r) => r.tipo === "artigo" && r.conteudos_ids?.includes(artigo.id))
      let situacao = null
      if (reflexao && reflexao.reflexoes && reflexao.reflexoes[artigo.id]) {
        // Reflexão existe, agora verificar se tem feedback
        if (reflexao.feedbacks && Array.isArray(reflexao.feedbacks)) {
          const feedback = reflexao.feedbacks.find((f: any) => f.conteudo_id === artigo.id)
          if (feedback) {
            situacao = "aprovada"
          } else {
            situacao = "aguardando_aprovacao"
          }
        } else {
          situacao = "aguardando_aprovacao"
        }
      }
      return {
        ...artigo,
        reflexao_situacao: situacao,
        reflexao_xp: reflexao?.feedbacks?.find((f: any) => f.conteudo_id === artigo.id)?.xp_ganho || null,
      }
    }),
  }

  return (
    <PassoClient
      numero={numero}
      passo={passoComReflexoes}
      discipulo={{ ...discipulo, nome_completo: nomeDiscipulo }}
      progresso={progressoAtual}
      passosCompletados={passosCompletados}
      videosAssistidos={videosAssistidos}
      artigosLidos={artigosLidos}
      status={status}
      discipuladorId={discipuladorId}
      statusLeituraSemana={statusLeituraSemana}
      temaSemana={temaSemana}
      descricaoSemana={descricaoSemana}
      perguntasReflexivas={perguntasReflexivas}
      leiturasSemana={leiturasSemana}
      capitulosLidos={capitulosLidos}
    />
  )
}
