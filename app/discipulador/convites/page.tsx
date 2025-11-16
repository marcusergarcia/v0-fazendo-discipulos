import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import ConvitesClient from "./convites-client"

export default async function ConvitesPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Buscar convites do discipulador
  const { data: convites } = await supabase
    .from("convites")
    .select("*")
    .eq("discipulador_id", user.id)
    .order("data_criacao", { ascending: false })

  return <ConvitesClient convites={convites || []} userId={user.id} />
}
