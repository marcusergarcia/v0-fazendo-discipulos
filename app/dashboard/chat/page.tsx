import { redirect } from 'next/navigation'
import { createClient } from "@/lib/supabase/server"
import ChatClient from "./chat-client"

export default async function ChatPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: discipulo } = await supabase
    .from("discipulos")
    .select("*")
    .eq("user_id", user.id)
    .single()

  if (!discipulo) redirect("/dashboard")

  const { data: mensagens } = await supabase
    .from("mensagens")
    .select("*")
    .eq("discipulo_id", discipulo.id)
    .order("created_at", { ascending: true })

  const { data: discipuladorInfo } = discipulo.discipulador_id
    ? await supabase
        .from("profiles")
        .select("nome_completo, email")
        .eq("id", discipulo.discipulador_id)
        .single()
    : { data: null }

  if (discipulo.discipulador_id) {
    await supabase
      .from("mensagens")
      .update({ lida: true, data_leitura: new Date().toISOString() })
      .eq("discipulo_id", discipulo.id)
      .eq("remetente_id", discipulo.discipulador_id)
      .eq("lida", false)
  }

  return (
    <ChatClient
      userId={user.id}
      discipuloId={discipulo.id}
      discipuladorId={discipulo.discipulador_id}
      discipuladorNome={discipuladorInfo?.nome_completo || discipuladorInfo?.email || "Discipulador"}
      mensagensIniciais={mensagens || []}
    />
  )
}
