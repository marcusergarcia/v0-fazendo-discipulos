import { redirect } from 'next/navigation'
import { createClient } from "@/lib/supabase/server"
import ChatClient from "./chat-client"

export default async function ChatComPage({
  params,
}: {
  params: Promise<{ userId: string }>
}) {
  const { userId: outroUserId } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  // Busca informações do discípulo logado
  const { data: discipulo } = await supabase
    .from("discipulos")
    .select("*")
    .eq("user_id", user.id)
    .single()

  if (!discipulo) redirect("/dashboard")

  // Busca informações do outro usuário
  const { data: outroUsuario } = await supabase
    .from("profiles")
    .select("nome_completo, email")
    .eq("id", outroUserId)
    .single()

  // Determina qual discipulo_id usar nas mensagens
  let discipuloIdConversa = discipulo.id

  // Se estou conversando com um dos meus discípulos, precisa buscar o ID dele na tabela discipulos
  if (outroUserId !== discipulo.discipulador_id) {
    const { data: outroDiscipulo } = await supabase
      .from("discipulos")
      .select("id")
      .eq("user_id", outroUserId)
      .single()

    if (outroDiscipulo) {
      discipuloIdConversa = outroDiscipulo.id
    }
  }

  // Busca mensagens entre os dois usuários
  const { data: mensagens } = await supabase
    .from("mensagens")
    .select("*")
    .eq("discipulo_id", discipuloIdConversa)
    .or(`remetente_id.eq.${user.id},remetente_id.eq.${outroUserId}`)
    .order("created_at", { ascending: true })

  // Marca mensagens do outro usuário como lidas
  await supabase
    .from("mensagens")
    .update({ lida: true, data_leitura: new Date().toISOString() })
    .eq("discipulo_id", discipuloIdConversa)
    .eq("remetente_id", outroUserId)
    .eq("lida", false)

  return (
    <ChatClient
      userId={user.id}
      discipuloIdConversa={discipuloIdConversa}
      outroUserId={outroUserId}
      outroUsuarioNome={outroUsuario?.nome_completo || outroUsuario?.email || "Usuário"}
      mensagensIniciais={mensagens || []}
    />
  )
}
