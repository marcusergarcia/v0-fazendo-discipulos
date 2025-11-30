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

  const { data: discipulo } = await supabase.from("discipulos").select("*").eq("user_id", user.id).single()

  if (!discipulo) {
    redirect("/dashboard")
  }

  const { data: profile } = await supabase.from("profiles").select("nome_completo").eq("id", user.id).single()

  const nomeDiscipulo = profile?.nome_completo || "Sem nome"

  const { data: discipuladorData } = await supabase
    .from("discipulos")
    .select("discipulador_id")
    .eq("id", discipulo.id)
    .single()

  const discipuladorId = discipuladorData?.discipulador_id || null

  const { data: progresso } = await supabase
    .from("progresso_fases")
    .select("*")
    .eq("discipulo_id", discipulo.id)
    .eq("fase_numero", 1)
    .eq("passo_numero", numero)
    .maybeSingle()

  // Se não existe progresso, criar registro inicial
  let progressoAtual = progresso
  if (!progressoAtual) {
    const { data: novoProgresso } = await supabase
      .from("progresso_fases")
      .insert({
        discipulo_id: discipulo.id,
        fase_numero: 1,
        passo_numero: numero,
        videos_assistidos: [],
        artigos_lidos: [],
        completado: false,
        enviado_para_validacao: false,
        data_inicio: new Date().toISOString(),
      })
      .select()
      .single()

    progressoAtual = novoProgresso
  }

  const { data: todosPassos } = await supabase
    .from("progresso_fases")
    .select("*")
    .eq("discipulo_id", discipulo.id)
    .eq("fase_numero", 1)

  const passosCompletados = todosPassos?.filter((p) => p.completado).length || 0

  let videosAssistidos: string[] = []
  let artigosLidos: string[] = []
  if (progressoAtual?.videos_assistidos) {
    videosAssistidos = progressoAtual.videos_assistidos
  }
  if (progressoAtual?.artigos_lidos) {
    artigosLidos = progressoAtual.artigos_lidos
  }

  const { data: reflexoesPasso } = await supabase
    .from("reflexoes_conteudo")
    .select("conteudo_id, tipo, situacao, xp_ganho")
    .eq("discipulo_id", discipulo.id)
    .eq("passo_numero", numero)

  const status = "pendente" // Status simplificado - agora controlado por perguntas_reflexivas

  let statusLeituraSemana: "nao_iniciada" | "pendente" | "concluida" = "nao_iniciada"
  let temaSemana = ""
  let descricaoSemana = ""

  if (numero === 1 || numero === 2 || numero === 3) {
    // Buscar capítulos lidos do discípulo
    const { data: leituraCapitulos } = await supabase
      .from("leituras_capitulos")
      .select("capitulos_lidos")
      .eq("discipulo_id", discipulo.id)
      .single()

    // Buscar capítulos da semana específica no plano de leitura
    const { data: planoSemana } = await supabase
      .from("plano_leitura_biblica")
      .select("semana, tema, descricao, capitulos_semana")
      .eq("semana", numero)
      .single()

    if (leituraCapitulos && planoSemana) {
      const capitulosLidos = leituraCapitulos.capitulos_lidos || []
      const capitulosSemana = planoSemana.capitulos_semana || []

      temaSemana = planoSemana.tema || ""
      descricaoSemana = planoSemana.descricao || ""

      // Verificar se TODOS os capítulos da semana foram lidos
      const todosLidos = capitulosSemana.every((cap: number) => capitulosLidos.includes(cap))
      // Verificar se ALGUM capítulo foi lido
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

  // Adicionar informações de situação aos vídeos e artigos
  const passoComReflexoes = {
    ...passo,
    videos: passo.videos?.map((video: any) => {
      const reflexao = reflexoesPasso?.find((r) => r.conteudo_id === video.id && r.tipo === "video")
      return {
        ...video,
        reflexao_situacao: reflexao?.situacao || null,
        reflexao_xp: reflexao?.xp_ganho || null,
      }
    }),
    artigos: passo.artigos?.map((artigo: any) => {
      const reflexao = reflexoesPasso?.find((r) => r.conteudo_id === artigo.id && r.tipo === "artigo")
      return {
        ...artigo,
        reflexao_situacao: reflexao?.situacao || null,
        reflexao_xp: reflexao?.xp_ganho || null,
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
    />
  )
}
