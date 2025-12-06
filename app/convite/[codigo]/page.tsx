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
  console.log("[v0] Tipo do discipulador_id:", typeof convite?.discipulador_id)
  console.log("[v0] Comprimento do discipulador_id:", convite?.discipulador_id?.length)

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
    console.log("[v0] Valor EXATO do discipulador_id:", JSON.stringify(convite.discipulador_id))

    const { data: discipuladorProfile, error: profileError } = await supabase
      .from("profiles")
      .select("id, nome_completo, email")
      .eq("id", convite.discipulador_id)
      .maybeSingle()

    console.log("[v0] Query em profiles com id:", convite.discipulador_id)
    console.log("[v0] Resultado busca em profiles:")
    console.log("[v0]   - Data encontrada:", discipuladorProfile)
    console.log("[v0]   - Error:", profileError)
    console.log("[v0]   - profileError?.message:", profileError?.message)

    if (discipuladorProfile?.nome_completo) {
      nomeDiscipulador = discipuladorProfile.nome_completo
      emailDiscipulador = discipuladorProfile.email || ""
      console.log("[v0] ✓ Nome encontrado em profiles:", nomeDiscipulador)
    } else {
      console.log("[v0] ✗ Nome NÃO encontrado em profiles")
      console.log("[v0] Tentando buscar em discipulos com user_id...")

      const { data: discipuloRecord, error: discipuloError } = await supabase
        .from("discipulos")
        .select("id, nome_completo_temp, email_temporario, user_id, discipulador_id")
        .eq("user_id", convite.discipulador_id)
        .maybeSingle()

      console.log("[v0] Query em discipulos com user_id:", convite.discipulador_id)
      console.log("[v0] Resultado busca em discipulos:")
      console.log("[v0]   - Data encontrada:", discipuloRecord)
      console.log("[v0]   - Error:", discipuloError)

      if (discipuloRecord?.nome_completo_temp) {
        nomeDiscipulador = discipuloRecord.nome_completo_temp
        emailDiscipulador = discipuloRecord.email_temporario || ""
        console.log("[v0] ✓ Nome encontrado em discipulos:", nomeDiscipulador)
      } else {
        console.log("[v0] ✗ PROBLEMA: Nenhum registro encontrado para discipulador_id:", convite.discipulador_id)
        console.log("[v0] Este ID não existe em profiles NEM em discipulos!")
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
