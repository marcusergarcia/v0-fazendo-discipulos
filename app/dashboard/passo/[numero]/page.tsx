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

  const { data: progresso } = await supabase
    .from("progresso_fases")
    .select("*")
    .eq("discipulo_id", discipulo.id)
    .eq("fase_numero", 1)
    .eq("passo_numero", numero)
    .single()

  const { data: todosPassos } = await supabase
    .from("progresso_fases")
    .select("*")
    .eq("discipulo_id", discipulo.id)
    .eq("fase_numero", 1)

  const passosCompletados = todosPassos?.filter((p) => p.completado).length || 0

  let videosAssistidos: string[] = []
  let artigosLidos: string[] = []
  if (progresso?.videos_assistidos) {
    videosAssistidos = progresso.videos_assistidos
  }
  if (progresso?.artigos_lidos) {
    artigosLidos = progresso.artigos_lidos
  }

  const getStatus = () => {
    if (progresso?.completado) return "validado"
    if (progresso?.enviado_para_validacao) return "aguardando"
    return "pendente"
  }

  const status = getStatus()

  return (
    <PassoClient
      numero={numero}
      passo={passo}
      discipulo={discipulo}
      progresso={progresso}
      passosCompletados={passosCompletados}
      videosAssistidos={videosAssistidos}
      artigosLidos={artigosLidos}
      status={status}
    />
  )
}
