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
    .single()

  let progressoAtual = progresso
  if (!progressoAtual && numero === 1) {
    const { data: novoProgresso } = await supabase
      .from("progresso_fases")
      .insert({
        discipulo_id: discipulo.id,
        fase_numero: 1,
        passo_numero: 1,
        nivel: 1,
        videos_assistidos: [],
        artigos_lidos: [],
        completado: false,
        enviado_para_validacao: false,
        data_inicio: new Date().toISOString(),
        reflexoes_concluidas: 0,
        pontuacao_total: 0,
      })
      .select()
      .single()
    
    progressoAtual = novoProgresso
  }

  // Se não tem progresso e está tentando acessar outro passo, redirecionar para passo 1
  if (!progressoAtual && numero !== 1) {
    redirect(`/dashboard/passo/1`)
  }

  const passoAtual = progressoAtual?.passo_numero || 1
  
  // Se tentar acessar passo futuro, redirecionar para o passo atual
  if (numero > passoAtual) {
    redirect(`/dashboard/passo/${passoAtual}`)
  }

  // Verificar se o passo atual está sendo visualizado
  const ehPassoAtual = numero === passoAtual

  const passosCompletados = passoAtual - 1

  let videosAssistidos: string[] = []
  let artigosLidos: string[] = []
  
  // Se estiver visualizando passo anterior, considerar tudo completo
  if (ehPassoAtual) {
    videosAssistidos = progressoAtual?.videos_assistidos || []
    artigosLidos = progressoAtual?.artigos_lidos || []
  } else {
    // Passo anterior já foi completado, marcar tudo como feito
    videosAssistidos = passo.videos.map(v => v.id)
    artigosLidos = passo.artigos.map(a => a.id)
  }

  const getStatus = () => {
    if (!ehPassoAtual) return "validado" // Passos anteriores estão validados
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
      progresso={ehPassoAtual ? progressoAtual : null} // Só passa progresso se for o passo atual
      passosCompletados={passosCompletados}
      videosAssistidos={videosAssistidos}
      artigosLidos={artigosLidos}
      status={status}
    />
  )
}
