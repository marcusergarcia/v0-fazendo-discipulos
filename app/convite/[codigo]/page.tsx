import { createClient } from "@/lib/supabase/server"
import CadastroConviteClient from "./cadastro-convite-client"

export default async function ConvitePage({ params }: { params: Promise<{ codigo: string }> }) {
  const { codigo } = await params

  const supabase = await createClient()

  console.log("[v0] ==================== PÁGINA DE CONVITE ====================")
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
    console.log("[v0] ==== BUSCANDO NOME DO DISCIPULADOR ====")
    console.log("[v0] discipulador_id do convite:", convite.discipulador_id)

    const { data: discipuladorProfile, error: profileError } = await supabase
      .from("profiles")
      .select("id, nome_completo, email")
      .eq("id", convite.discipulador_id)
      .maybeSingle()

    console.log("[v0] Resultado busca em profiles:")
    console.log("[v0]   - Data:", discipuladorProfile)
    console.log("[v0]   - Error:", profileError)

    if (discipuladorProfile?.nome_completo) {
      nomeDiscipulador = discipuladorProfile.nome_completo
      emailDiscipulador = discipuladorProfile.email || ""
      console.log("[v0] ✓ Nome encontrado em profiles:", nomeDiscipulador)
    } else {
      console.log("[v0] ✗ Nome NÃO encontrado em profiles, tentando discipulos...")

      const { data: discipuloByUserId, error: discipuloError1 } = await supabase
        .from("discipulos")
        .select("id, nome_completo_temp, email_temporario, user_id, discipulador_id")
        .eq("user_id", convite.discipulador_id)
        .maybeSingle()

      console.log("[v0] Resultado busca em discipulos por user_id:")
      console.log("[v0]   - Data:", discipuloByUserId)
      console.log("[v0]   - Error:", discipuloError1)

      if (discipuloByUserId?.nome_completo_temp) {
        nomeDiscipulador = discipuloByUserId.nome_completo_temp
        emailDiscipulador = discipuloByUserId.email_temporario || ""
        console.log("[v0] ✓ Nome encontrado em discipulos (user_id):", nomeDiscipulador)
      } else {
        console.log("[v0] ✗ Nome NÃO encontrado por user_id, buscando qualquer registro deste discipulador...")

        const { data: discipulosByDiscipuladorId, error: discipuloError2 } = await supabase
          .from("discipulos")
          .select("id, nome_completo_temp, email_temporario, user_id, discipulador_id")
          .eq("discipulador_id", convite.discipulador_id)
          .limit(1)

        console.log("[v0] Resultado busca em discipulos por discipulador_id:")
        console.log("[v0]   - Data (array):", discipulosByDiscipuladorId)
        console.log("[v0]   - Error:", discipuloError2)
        console.log("[v0]   - Quantidade de registros:", discipulosByDiscipuladorId?.length)

        if (discipulosByDiscipuladorId && discipulosByDiscipuladorId.length > 0) {
          console.log("[v0] Esta pessoa discipula alguém! Buscando o registro do próprio discipulador...")

          const { data: perfilDoDiscipulador, error: perfilError } = await supabase
            .from("discipulos")
            .select("id, nome_completo_temp, email_temporario, user_id")
            .eq("user_id", convite.discipulador_id)
            .maybeSingle()

          console.log("[v0] Perfil do próprio discipulador:")
          console.log("[v0]   - Data:", perfilDoDiscipulador)
          console.log("[v0]   - Error:", perfilError)

          if (perfilDoDiscipulador?.nome_completo_temp) {
            nomeDiscipulador = perfilDoDiscipulador.nome_completo_temp
            emailDiscipulador = perfilDoDiscipulador.email_temporario || ""
            console.log("[v0] ✓ Nome encontrado no perfil do discipulador:", nomeDiscipulador)
          } else {
            console.log("[v0] ✗ PROBLEMA: Esta pessoa discipula outros mas não tem registro próprio!")
            console.log("[v0] Tentando buscar nome via auth.users...")
          }
        } else {
          console.log("[v0] ✗ Nenhum registro encontrado em discipulos")
        }
      }
    }

    console.log("[v0] ==== FIM BUSCA NOME ====")
  }

  console.log("[v0] NOME FINAL QUE SERÁ EXIBIDO:", nomeDiscipulador)
  console.log("[v0] EMAIL FINAL:", emailDiscipulador)
  console.log("[v0] ==================== FIM PÁGINA DE CONVITE ====================")

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
