import { redirect } from 'next/navigation'
import { createClient } from "@/lib/supabase/server"
import ChatDiscipuladorClient from "./chat-discipulador-client"

export default async function ChatDiscipuladorPage({
  params,
}: {
  params: Promise<{ discipuloId: string }>
}) {
  const { discipuloId } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  // Buscar informações do discípulo
  const { data: discipulo } = await supabase
    .from("discipulos")
    .select("*, profiles!inner(nome_completo, email)")
    .eq("id", discipuloId)
    .eq("discipulador_id", user.id)
    .single()

  if (!discipulo) redirect("/discipulador")

  // Buscar mensagens entre discipulador e discípulo
  const { data: mensagens } = await supabase
    .from("mensagens")
    .select("*")
    .eq("discipulo_id", discipuloId)
    .order("created_at", { ascending: true })

  const discipuloNome = discipulo.profiles?.nome_completo || discipulo.nome_completo_temp || discipulo.profiles?.email || discipulo.email_temporario

  await supabase
    .from("mensagens")
    .update({ lida: true, data_leitura: new Date().toISOString() })
    .eq("discipulo_id", discipuloId)
    .eq("remetente_id", discipulo.user_id)
    .eq("lida", false)

  return (
    <ChatDiscipuladorClient
      userId={user.id}
      discipuloId={discipuloId}
      discipuloUserId={discipulo.user_id}
      discipuloNome={discipuloNome}
      mensagensIniciais={mensagens || []}
    />
  )
}
