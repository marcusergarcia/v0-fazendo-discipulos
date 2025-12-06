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

  let nomeDiscipulador = "Convite Direto"
  let emailDiscipulador = ""

  if (convite.discipulador_id) {
    // Tentar buscar em profiles primeiro
    const { data: profileData } = await supabase
      .from("profiles")
      .select("nome_completo, email")
      .eq("id", convite.discipulador_id)
      .maybeSingle()

    if (profileData?.nome_completo) {
      nomeDiscipulador = profileData.nome_completo
      emailDiscipulador = profileData.email || ""
    } else {
      // Se não encontrou em profiles, buscar em discipulos
      const { data: discipuloData } = await supabase
        .from("discipulos")
        .select("nome_completo_temp, email_temporario")
        .or(`user_id.eq.${convite.discipulador_id},discipulador_id.eq.${convite.discipulador_id}`)
        .limit(1)
        .maybeSingle()

      if (discipuloData?.nome_completo_temp) {
        nomeDiscipulador = discipuloData.nome_completo_temp
        emailDiscipulador = discipuloData.email_temporario || ""
      } else {
        // Fallback para mostrar o ID caso não encontre em nenhuma tabela
        nomeDiscipulador = convite.discipulador_id
      }
    }
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
