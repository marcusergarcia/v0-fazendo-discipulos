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

  let videosAssistidos: string[] = []
  let artigosLidos: string[] = []
  if (progressoAtual?.videos_assistidos) {
    videosAssistidos = progressoAtual.videos_assistidos
  }
  if (progressoAtual?.artigos_lidos) {
    artigosLidos = progressoAtual.artigos_lidos
  }

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
