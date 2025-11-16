import { notFound } from 'next/navigation'
import { redirect } from 'next/navigation'
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

  const { data: profile } = await supabase
    .from("profiles")
    .select("nome_completo")
    .eq("id", user.id)
    .single()

  const nomeDiscipulo = profile?.nome_completo || "Sem nome"

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

  const { data: reflexoes } = await supabase
    .from("reflexoes_conteudo")
    .select("*")
    .eq("discipulo_id", discipulo.id)
    .eq("passo_numero", numero)

  console.log("[v0] Reflexões carregadas para o passo", numero, ":", reflexoes?.length || 0)

  let videosAssistidos: any[] = []
  let artigosLidos: any[] = []

  if (reflexoes && reflexoes.length > 0) {
    reflexoes.forEach(reflexao => {
      if (reflexao.tipo === 'video') {
        videosAssistidos.push({
          id: reflexao.conteudo_id,
          xp_ganho: reflexao.xp_ganho || null
        })
      } else if (reflexao.tipo === 'artigo') {
        artigosLidos.push({
          id: reflexao.conteudo_id,
          xp_ganho: reflexao.xp_ganho || null
        })
      }
    })
  }

  if (progressoAtual?.videos_assistidos && Array.isArray(progressoAtual.videos_assistidos)) {
    progressoAtual.videos_assistidos.forEach((v: any) => {
      const videoId = typeof v === 'string' ? v : v.id
      if (videoId && !videosAssistidos.find(vid => vid.id === videoId)) {
        videosAssistidos.push({
          id: videoId,
          xp_ganho: typeof v === 'object' ? v.xp_ganho : null
        })
      }
    })
  }

  if (progressoAtual?.artigos_lidos && Array.isArray(progressoAtual.artigos_lidos)) {
    progressoAtual.artigos_lidos.forEach((a: any) => {
      const artigoId = typeof a === 'string' ? a : a.id
      if (artigoId && !artigosLidos.find(art => art.id === artigoId)) {
        artigosLidos.push({
          id: artigoId,
          xp_ganho: typeof a === 'object' ? a.xp_ganho : null
        })
      }
    })
  }

  console.log("[v0] Videos assistidos:", videosAssistidos.length)
  console.log("[v0] Artigos lidos:", artigosLidos.length)

  const getStatus = () => {
    if (progressoAtual?.completado) return "validado"
    if (progressoAtual?.enviado_para_validacao) return "aguardando"
    return "pendente"
  }

  const status = getStatus()

  return (
    <PassoClient
      numero={numero}
      passo={passo}
      discipulo={{...discipulo, nome_completo: nomeDiscipulo}}
      progresso={progressoAtual}
      passosCompletados={passosCompletados}
      videosAssistidos={videosAssistidos}
      artigosLidos={artigosLidos}
      status={status}
    />
  )
}
