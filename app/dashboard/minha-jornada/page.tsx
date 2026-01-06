import { createServerClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export default async function MinhaJornadaPage() {
  const cookieStore = await cookies()
  const supabase = createServerClient(cookieStore)

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: discipulo } = await supabase.from("discipulos").select("passo_atual").eq("id", user.id).single()

  if (!discipulo) {
    redirect("/aguardando-aprovacao")
  }

  const passoAtual = discipulo.passo_atual || 1
  redirect(`/dashboard/passo/${passoAtual}`)
}
