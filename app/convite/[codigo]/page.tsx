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

  console.log("[v0] Convite encontrado:", convite)
  console.log("[v0] Discipulador ID do convite:", convite?.discipulador_id)

  // Se convite inválido, mostrar mensagem de erro
  if (error || !convite) {
    console.error("[v0] Erro ao buscar convite:", error)
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

  let nomeDiscipulador = "Desconhecido"
  let emailDiscipulador = ""

  if (convite.discipulador_id) {
    // Primeiro tenta buscar em profiles
    const { data: discipulador } = await supabase
      .from("profiles")
      .select("nome_completo, email")
      .eq("id", convite.discipulador_id)
      .maybeSingle()

    console.log("[v0] Discipulador encontrado em profiles:", discipulador)

    if (discipulador) {
      nomeDiscipulador = discipulador.nome_completo || "Desconhecido"
      emailDiscipulador = discipulador.email || ""
    } else {
      // Se não encontrou em profiles, busca em discipulos usando user_id
      console.log("[v0] Não encontrado em profiles, buscando em discipulos...")
      const { data: discipuloInfo } = await supabase
        .from("discipulos")
        .select("nome_completo_temp, email_temporario")
        .eq("user_id", convite.discipulador_id)
        .maybeSingle()

      console.log("[v0] Discipulador encontrado em discipulos:", discipuloInfo)

      if (discipuloInfo) {
        nomeDiscipulador = discipuloInfo.nome_completo_temp || "Desconhecido"
        emailDiscipulador = discipuloInfo.email_temporario || ""
      } else {
        console.error("[v0] PROBLEMA: Nenhum registro encontrado para discipulador_id:", convite.discipulador_id)
      }
    }
  } else {
    console.error("[v0] PROBLEMA: convite.discipulador_id está null ou undefined")
  }

  return (
    <CadastroConviteClient
      convite={{
        ...convite,
        discipulador: {
          nome_completo: nomeDiscipulador,
          email: emailDiscipulador,
        },
      }}
    />
  )
}
