import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import MarcoFeClient from "./marco-fe-client"

export default async function MarcoFePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Buscar dados do discípulo
  const { data: discipulo } = await supabase.from("discipulos").select("*").eq("user_id", user.id).single()

  if (!discipulo) {
    redirect("/dashboard")
  }

  // Verificar se completou o passo 10 da fase 1
  if (discipulo.passo_atual < 10 || discipulo.fase_atual < 1) {
    redirect("/dashboard")
  }

  // Se já assinou, redirecionar conforme status de batismo
  if (discipulo.confissao_fe_assinada) {
    if (discipulo.eh_batizado === false && !discipulo.fase_intermediaria_concluida) {
      redirect("/dashboard/batismo/passo/1")
    } else {
      redirect("/dashboard")
    }
  }

  return <MarcoFeClient discipulo={discipulo} />
}
