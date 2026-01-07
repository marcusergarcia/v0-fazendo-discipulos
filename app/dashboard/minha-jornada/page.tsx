import { createServerClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import MinhaJornadaClient from "./minha-jornada-client"

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

  const passoAtual = discipulo?.passo_atual || 1

  return <MinhaJornadaClient passoAtual={passoAtual} />
}
