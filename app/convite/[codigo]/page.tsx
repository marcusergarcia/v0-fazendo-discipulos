import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import CadastroConviteClient from "./cadastro-convite-client"

export default async function ConvitePage({ params }: { params: Promise<{ codigo: string }> }) {
  const { codigo } = await params
  const supabase = await createClient()

  // Verificar se convite existe e é válido
  const { data: convite, error } = await supabase
    .from("convites")
    .select("*, discipulador:discipulador_id(nome_completo, email)")
    .eq("codigo_convite", codigo)
    .eq("usado", false)
    .gt("expira_em", new Date().toISOString())
    .single()

  if (error || !convite) {
    redirect("/auth/login?error=convite_invalido")
  }

  return <CadastroConviteClient convite={convite} />
}
