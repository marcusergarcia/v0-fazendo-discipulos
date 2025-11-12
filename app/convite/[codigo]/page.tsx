import { createClient } from "@/lib/supabase/server"
import CadastroConviteClient from "./cadastro-convite-client"

export default async function ConvitePage({ params }: { params: Promise<{ codigo: string }> }) {
  const { codigo } = await params

  const supabase = await createClient()

  console.log("[v0] Buscando convite com código:", codigo)

  const { data: convite, error } = await supabase
    .from("convites")
    .select("*")
    .eq("codigo_convite", codigo)
    .eq("usado", false)
    .gt("expira_em", new Date().toISOString())
    .single()

  console.log("[v0] Resultado busca convite:", convite, error)

  // Se convite inválido, mostrar mensagem de erro
  if (error || !convite) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-600 p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Convite Inválido</h1>
          <p className="text-gray-600 mb-6">Este link de convite não é válido, já foi usado ou expirou.</p>
          <a href="/" className="inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition">
            Ir para Home
          </a>
        </div>
      </div>
    )
  }

  const { data: discipuladorData } = await supabase
    .from("discipulos")
    .select("user_id")
    .eq("user_id", convite.discipulador_id)
    .single()

  console.log("[v0] Resultado busca discipulador na tabela discipulos:", discipuladorData)

  // Buscar profile do discipulador
  const { data: discipulador } = await supabase
    .from("profiles")
    .select("nome_completo, email")
    .eq("id", convite.discipulador_id)
    .single()

  console.log("[v0] Resultado busca profile do discipulador:", discipulador)

  return (
    <CadastroConviteClient
      convite={{
        ...convite,
        discipulador: discipulador || { nome_completo: "Desconhecido", email: "" },
      }}
    />
  )
}
