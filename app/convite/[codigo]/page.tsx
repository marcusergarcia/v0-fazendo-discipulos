import { createClient } from "@/lib/supabase/server"
import CadastroConviteClient from "./cadastro-convite-client"

export default async function ConvitePage({ params }: { params: Promise<{ codigo: string }> }) {
  const { codigo } = await params

  const supabase = await createClient()

  const { data: convite, error } = await supabase
    .from("convites")
    .select("*")
    .eq("codigo_convite", codigo)
    .eq("usado", false)
    .gt("expira_em", new Date().toISOString())
    .maybeSingle()

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

  console.log("[v0] CONVITE DATA:", JSON.stringify(convite, null, 2))
  console.log("[v0] DISCIPULADOR_ID:", convite.discipulador_id)
  console.log("[v0] DISCIPULADOR_ID TYPE:", typeof convite.discipulador_id)

  let nomeDiscipulador = "Convite Direto"
  let emailDiscipulador = ""

  if (convite.discipulador_id) {
    const { data: rawData, error: rawError } = await supabase
      .rpc("get_profile_name", {
        profile_id: convite.discipulador_id,
      })
      .maybeSingle()

    console.log("[v0] RAW SQL RESULT:", rawData)
    console.log("[v0] RAW SQL ERROR:", rawError)

    // Tentar buscar em profiles primeiro
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("nome_completo, email, id")
      .eq("id", convite.discipulador_id)
      .maybeSingle()

    console.log("[v0] PROFILE QUERY RESULT:", JSON.stringify(profileData, null, 2))
    console.log("[v0] PROFILE QUERY ERROR:", profileError)

    if (profileData?.nome_completo) {
      nomeDiscipulador = profileData.nome_completo
      emailDiscipulador = profileData.email || ""
      console.log("[v0] FOUND IN PROFILES:", nomeDiscipulador)
    } else {
      // Se não encontrou em profiles, buscar em discipulos
      const { data: discipuloData, error: discipuloError } = await supabase
        .from("discipulos")
        .select("nome_completo_temp, email_temporario, user_id, discipulador_id")
        .or(`user_id.eq.${convite.discipulador_id},discipulador_id.eq.${convite.discipulador_id}`)
        .limit(1)
        .maybeSingle()

      console.log("[v0] DISCIPULO QUERY RESULT:", JSON.stringify(discipuloData, null, 2))
      console.log("[v0] DISCIPULO QUERY ERROR:", discipuloError)

      if (discipuloData?.nome_completo_temp) {
        nomeDiscipulador = discipuloData.nome_completo_temp
        emailDiscipulador = discipuloData.email_temporario || ""
        console.log("[v0] FOUND IN DISCIPULOS:", nomeDiscipulador)
      } else {
        // Fallback para mostrar o ID caso não encontre em nenhuma tabela
        console.log("[v0] NOT FOUND IN ANY TABLE, USING ID AS FALLBACK")
        nomeDiscipulador = convite.discipulador_id
      }
    }
  }

  console.log("[v0] FINAL NOME DISCIPULADOR:", nomeDiscipulador)

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
