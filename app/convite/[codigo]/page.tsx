import { createClient } from "@/lib/supabase/server"
import CadastroConviteClient from "./cadastro-convite-client"

export default async function ConvitePage({ params }: { params: Promise<{ codigo: string }> }) {
  const { codigo } = await params

  const supabase = await createClient()

  console.log("[v0] Buscando convite com código:", codigo)

  // Verificar se convite existe e é válido (sem exigir login)
  const { data: convite, error } = await supabase
    .from("convites")
    .select("*, discipulador:discipulador_id(nome_completo, email)")
    .eq("codigo_convite", codigo)
    .eq("usado", false)
    .gt("expira_em", new Date().toISOString())
    .single()

  console.log("[v0] Resultado da busca:", { convite, error })
  console.log("[v0] Data atual:", new Date().toISOString())

  // Se convite inválido, mostrar mensagem de erro ao invés de redirecionar
  if (error || !convite) {
    console.log("[v0] Convite inválido - Error:", error?.message)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-600 p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Convite Inválido</h1>
          <p className="text-gray-600 mb-6">Este link de convite não é válido, já foi usado ou expirou.</p>
          <p className="text-xs text-gray-500 mb-4">Código: {codigo}</p>
          <p className="text-xs text-gray-500 mb-6">Erro: {error?.message || "Convite não encontrado"}</p>
          <a href="/" className="inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition">
            Ir para Home
          </a>
        </div>
      </div>
    )
  }

  console.log("[v0] Convite válido encontrado:", convite.codigo_convite)
  return <CadastroConviteClient convite={convite} />
}
