import { notFound } from "next/navigation"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import PassoClient from "./passo-client"
import { PASSOS_CONTEUDO } from "@/constants/passos-conteudo"

export default async function PassoPage({ params }: { params: Promise<{ numero: string }> }) {
  const { numero: numeroParam } = await params
  const numero = Number.parseInt(numeroParam)

  console.log("[v0] PassoPage - Número recebido:", numero)

  if (isNaN(numero) || numero < 1 || numero > 10) {
    console.log("[v0] PassoPage - Número inválido")
    notFound()
  }

  const passo = PASSOS_CONTEUDO[numero]
  console.log("[v0] PassoPage - Passo encontrado:", !!passo)

  if (!passo) {
    console.log("[v0] PassoPage - Passo não existe no PASSOS_CONTEUDO")
    notFound()
  }

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  console.log("[v0] PassoPage - User ID:", user.id)

  const { data: discipulo, error: discipuloError } = await supabase
    .from("discipulos")
    .select("*")
    .eq("user_id", user.id)
    .single()

  console.log("[v0] PassoPage - Discipulo:", !!discipulo, "Error:", discipuloError)

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

  console.log("[v0] PassoPage - Progresso:", !!progresso, "Error:", progressoError)

  // Se não existe progresso, criar registro inicial
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

    console.log("[v0] PassoPage - Novo progresso criado:", !!novoProgresso, "Error:", novoProgressoError)
    progressoAtual = novoProgresso
  }

  // Passos completados = passo_atual - 1 do discípulo
  const passosCompletados = (discipulo.passo_atual || 1) - 1

  const { data: discipuladorData } = await supabase
    .from("discipulos")
    .select("discipulador_id")
    .eq("id", discipulo.id)
    .single()

  const discipuladorId = discipuladorData?.discipulador_id || null

  const { data: reflexoesPasso } = await supabase
    .from("reflexoes_passo")
    .select("reflexoes, conteudos_ids, situacao")
    .eq("discipulo_id", discipulo.id)
    .eq("passo_numero", numero)
    .maybeSingle()

  const reflexoesIndividuais = reflexoesPasso?.reflexoes || {}

  const { data: perguntasReflexivas } = await supabase
    .from("perguntas_reflexivas")
    .select("*")
    .eq("discipulo_id", discipulo.id)
    .eq("passo_numero", numero)
    .maybeSingle()

  const status = "pendente" // Status simplificado - agora controlado por perguntas_reflexivas

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

    console.log("[v0] PassoPage - Leitura capítulos:", !!leituraCapitulos, "Error:", leituraError)

    // Buscar capítulos da semana específica no plano de leitura
    const { data: planoSemana, error: planoError } = await supabase
      .from("plano_leitura_biblica")
      .select("semana, tema, descricao, capitulos_semana")
      .eq("semana", numero)
      .single()

    console.log("[v0] PassoPage - Plano semana:", !!planoSemana, "Error:", planoError)

    if (leituraCapitulos && planoSemana) {
      capitulosLidos = leituraCapitulos.capitulos_lidos || []
      const capitulosSemana = planoSemana.capitulos_semana || []

      temaSemana = planoSemana.tema || ""
      descricaoSemana = planoSemana.descricao || ""

      leiturasSemana = capitulosSemana.map((cap: number) => ({ id: cap }))

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

  const passoComReflexoes = {
    ...passo,
    videos: (passo.videos || []).map((video: any) => {
      const reflexao = reflexoesIndividuais[video.id]
      return {
        ...video,
        reflexao_situacao: reflexao?.situacao || null,
        reflexao_xp: reflexao?.xp_ganho || null,
      }
    }),
    artigos: (passo.artigos || []).map((artigo: any) => {
      const reflexao = reflexoesIndividuais[artigo.id]
      return {
        ...artigo,
        reflexao_situacao: reflexao?.situacao || null,
        reflexao_xp: reflexao?.xp_ganho || null,
      }
    }),
  }

  console.log("[v0] PassoPage - Renderizando PassoClient")

  return (
    <PassoClient
      numero={numero}
      passo={passoComReflexoes}
      discipulo={{ ...discipulo, nome_completo: nomeDiscipulo }}
      progresso={progressoAtual}
      passosCompletados={passosCompletados}
      videosAssistidos={progressoAtual?.videos_assistidos || []}
      artigosLidos={progressoAtual?.artigos_lidos || []}
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
