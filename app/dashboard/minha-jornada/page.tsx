import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function MinhaJornadaPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: discipulo } = await supabase.from("discipulos").select("passo_atual").eq("user_id", user.id).single()

  if (!discipulo) {
    redirect("/aguardando-aprovacao")
  }

  const passoAtual = discipulo.passo_atual || 1
  redirect(`/dashboard/passo/${passoAtual}`)
}
