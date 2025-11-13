import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import AprovarDiscipuloClient from "./aprovar-discipulo-client"

export default async function AprovarDiscipuloPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: discipulo } = await supabase.from("profiles").select("*").eq("id", id).eq("status", "inativo").single()

  const { data: discipuloData } = await supabase
    .from("discipulos")
    .select("*")
    .eq("user_id", id)
    .eq("discipulador_id", user.id)
    .eq("status", "inativo")
    .single()

  if (!discipulo || !discipuloData) {
    redirect("/discipulador")
  }

  return <AprovarDiscipuloClient discipulo={discipulo} discipuloData={discipuloData} />
}
