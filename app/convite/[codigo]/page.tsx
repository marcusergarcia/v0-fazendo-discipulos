import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
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
    console.log("[v0] ==================== BUSCANDO DISCIPULADOR ====================")
    console.log("[v0] Buscando com discipulador_id:", convite.discipulador_id)

    const { data: discipulador, error: profileError } = await supabase
      .from("profiles")
      .select("nome_completo, email, id")
      .eq("id", convite.discipulador_id)
      .maybeSingle()

    console.log("[v0] Resultado busca em profiles:", { discipulador, error: profileError })

    if (discipulador) {
      nomeDiscipulador = discipulador.nome_completo || "Desconhecido"
      emailDiscipulador = discipulador.email || ""
      console.log("[v0] ✅ Nome encontrado em profiles:", nomeDiscipulador)
    } else {
      console.log("[v0] Não encontrado em profiles, buscando em discipulos com user_id...")
      const { data: discipuloInfo, error: discipuloError } = await supabase
        .from("discipulos")
        .select("nome_completo_temp, email_temporario, user_id, id")
        .eq("user_id", convite.discipulador_id)
        .maybeSingle()

      console.log("[v0] Resultado busca em discipulos (user_id):", { discipuloInfo, error: discipuloError })

      if (discipuloInfo) {
        nomeDiscipulador = discipuloInfo.nome_completo_temp || "Desconhecido"
        emailDiscipulador = discipuloInfo.email_temporario || ""
        console.log("[v0] ✅ Nome encontrado em discipulos (user_id):", nomeDiscipulador)
      } else {
        console.log("[v0] Não encontrado como user_id, buscando como discipulador_id ativo...")
        const { data: discipuloMentorado, error: mentoradoError } = await supabase
          .from("discipulos")
          .select("discipulador_id")
          .eq("discipulador_id", convite.discipulador_id)
          .limit(1)
          .maybeSingle()

        console.log("[v0] Resultado busca como discipulador ativo:", { discipuloMentorado, error: mentoradoError })

        if (discipuloMentorado) {
          console.log("[v0] Encontrado como discipulador ativo, buscando auth.users...")
          try {
            const adminClient = createAdminClient()
            const { data: authUser, error: authError } = await adminClient.auth.admin.getUserById(
              convite.discipulador_id,
            )

            console.log("[v0] Resultado busca em auth.users:", { authUser, error: authError })

            if (authUser?.user) {
              nomeDiscipulador =
                authUser.user.user_metadata?.nome_completo || authUser.user.email?.split("@")[0] || "Discipulador"
              emailDiscipulador = authUser.user.email || ""
              console.log("[v0] ✅ Informações encontradas em auth.users")
              console.log("[v0] Nome extraído:", nomeDiscipulador)
              console.log("[v0] Email:", emailDiscipulador)
            } else {
              console.error("[v0] ❌ PROBLEMA: Usuário não encontrado nem em auth.users")
            }
          } catch (authError) {
            console.error("[v0] ❌ Erro ao buscar em auth.users:", authError)
          }
        } else {
          console.error("[v0] ❌ PROBLEMA: Não encontrado em nenhuma tabela")
        }
      }
    }
    console.log("[v0] ==================== FIM BUSCA DISCIPULADOR ====================")
  } else {
    console.error("[v0] ❌ PROBLEMA: convite.discipulador_id está null ou undefined")
  }

  console.log("[v0] Nome final do discipulador:", nomeDiscipulador)
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
