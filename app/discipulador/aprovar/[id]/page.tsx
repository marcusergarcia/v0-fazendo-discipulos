import { createClient } from "@/lib/supabase/server"
import { redirect } from 'next/navigation'
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

  const { data: discipulo, error } = await supabase
    .from("discipulos")
    .select("*")
    .eq("id", id)
    .eq("discipulador_id", user.id)
    .eq("aprovado_discipulador", false)
    .is("user_id", null) // Apenas os que ainda não foram aprovados
    .single()

  if (error || !discipulo) {
    redirect("/discipulador/aprovar")
  }

  return <AprovarDiscipuloClient discipulo={discipulo} />
}
