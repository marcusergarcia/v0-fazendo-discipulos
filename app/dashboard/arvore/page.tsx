import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft, Users } from "lucide-react"
import { ArvoreDiscipulado } from "@/components/arvore-discipulado"

export default async function ArvoreDiscipuladoPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: todosDiscipulos, error: discipulosError } = await supabase
    .from("discipulos")
    .select(
      "id, user_id, discipulador_id, nivel_atual, fase_atual, xp_total, aprovado_discipulador, status, created_at",
    )
    .eq("status", "ativo")
    .eq("aprovado_discipulador", true)
    .order("created_at")

  console.log("[v0] Discípulos encontrados:", todosDiscipulos?.length, "Erro:", discipulosError)

  // Buscar perfis de todos os usuários
  const { data: perfis } = await supabase.from("profiles").select("id, nome_completo, foto_perfil_url, email")

  // Mapear perfis por ID
  const perfisMap = new Map(perfis?.map((p) => [p.id, p]) || [])

  // Buscar dados do usuário atual
  const { data: discipuloAtual } = await supabase.from("discipulos").select("*").eq("user_id", user.id).single()

  console.log("[v0] Árvore - Dados completos:", {
    totalDiscipulos: todosDiscipulos?.length,
    totalPerfis: perfis?.length,
    discipulos: todosDiscipulos?.map((d) => ({
      userId: d.user_id,
      discipuladorId: d.discipulador_id,
      aprovado: d.aprovado_discipulador,
    })),
  })

  // Construir estrutura de árvore
  const arvoreData = todosDiscipulos?.map((d) => {
    const perfil = perfisMap.get(d.user_id)
    const discipuladorPerfil = d.discipulador_id ? perfisMap.get(d.discipulador_id) : null

    console.log("[v0] Processando discípulo:", {
      userId: d.user_id,
      discipuladorId: d.discipulador_id,
      perfilEncontrado: !!perfil,
      discipuladorPerfilEncontrado: !!discipuladorPerfil,
      nomePerfil: perfil?.nome_completo,
      nomeDiscipulador: discipuladorPerfil?.nome_completo,
    })

    return {
      id: d.id,
      userId: d.user_id,
      discipuladorId: d.discipulador_id,
      nome: perfil?.nome_completo || perfil?.email || "Usuário",
      foto: perfil?.foto_perfil_url || null,
      nivel: d.nivel_atual || "Explorador",
      fase: d.fase_atual || 1,
      xp: d.xp_total || 0,
      discipuladorNome: discipuladorPerfil?.nome_completo || discipuladorPerfil?.email || null,
      isCurrentUser: d.user_id === user.id,
      aprovadoDiscipulador: d.aprovado_discipulador,
    }
  })

  console.log("[v0] Árvore montada:", arvoreData)

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold">Árvore de Discipulado</h1>
                <p className="text-sm text-muted-foreground">Visualize a família espiritual</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Sua Árvore Genealógica Espiritual
            </CardTitle>
            <CardDescription>Veja sua linhagem de discipulado e todos os discípulos conectados a você</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-muted/30 rounded-lg p-4 mb-4">
              <h3 className="font-semibold mb-2">Legenda:</h3>
              <div className="grid sm:grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-primary"></div>
                  <span>Você</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-secondary"></div>
                  <span>Seu Discipulador</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-accent"></div>
                  <span>Seus Discípulos</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-muted"></div>
                  <span>Outros</span>
                </div>
              </div>
            </div>

            <ArvoreDiscipulado data={arvoreData || []} currentUserId={user.id} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
