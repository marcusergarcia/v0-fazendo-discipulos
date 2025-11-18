import { redirect } from 'next/navigation'
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MessageCircle, User, Users, ArrowLeft } from 'lucide-react'
import Link from "next/link"

export default async function ChatSelectionPage() {
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

  const { data: discipuladorProfile } = discipulo.discipulador_id
    ? await supabase
        .from("profiles")
        .select("id, nome_completo, email")
        .eq("id", discipulo.discipulador_id)
        .single()
    : { data: null }

  const { data: meusDiscipulos } = await supabase
    .from("discipulos")
    .select("id, nome_completo_temp, user_id")
    .eq("discipulador_id", user.id)

  console.log("[v0] Meus discípulos encontrados:", meusDiscipulos)

  // Busca profiles dos discípulos separadamente
  let discipulosComProfiles = []
  if (meusDiscipulos && meusDiscipulos.length > 0) {
    const userIds = meusDiscipulos.map(d => d.user_id)
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, nome_completo, email")
      .in("id", userIds)

    console.log("[v0] Profiles dos discípulos:", profiles)

    discipulosComProfiles = meusDiscipulos.map(disc => {
      const profile = profiles?.find(p => p.id === disc.user_id)
      return {
        ...disc,
        profile
      }
    })
  }

  // Conta mensagens não lidas do discipulador
  const { count: mensagensNaoLidasDiscipulador } = discipulo.discipulador_id
    ? await supabase
        .from("mensagens")
        .select("*", { count: "exact", head: true })
        .eq("discipulo_id", discipulo.id)
        .eq("remetente_id", discipulo.discipulador_id)
        .eq("lida", false)
    : { count: 0 }

  // Conta mensagens não lidas de cada discípulo
  const discipulosComMensagens = await Promise.all(
    discipulosComProfiles.map(async (disc) => {
      const { count } = await supabase
        .from("mensagens")
        .select("*", { count: "exact", head: true })
        .eq("discipulo_id", disc.id)
        .eq("remetente_id", disc.user_id)
        .eq("lida", false)

      return {
        ...disc,
        mensagensNaoLidas: count || 0,
      }
    })
  )

  console.log("[v0] Discípulos com mensagens:", discipulosComMensagens)

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <Link href="/dashboard">
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Voltar ao Dashboard
          </Button>
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Conversas</h1>
        <p className="text-muted-foreground">
          Escolha com quem você gostaria de conversar
        </p>
      </div>

      <div className="space-y-6">
        {/* Conversa com o discipulador */}
        {discipulo.discipulador_id && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Meu Discipulador
              </CardTitle>
              <CardDescription>
                Converse com seu discipulador sobre dúvidas, progressos e desafios
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href={`/dashboard/chat/com/${discipulo.discipulador_id}`}>
                <Button className="w-full" variant="default">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Conversar com {discipuladorProfile?.nome_completo || discipuladorProfile?.email || "Discipulador"}
                  {mensagensNaoLidasDiscipulador > 0 && (
                    <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                      {mensagensNaoLidasDiscipulador}
                    </span>
                  )}
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Lista de discípulos */}
        {discipulosComMensagens && discipulosComMensagens.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Meus Discípulos
              </CardTitle>
              <CardDescription>
                Acompanhe e converse com seus discípulos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {discipulosComMensagens.map((disc) => {
                  const nomeDiscipulo = disc.profile?.nome_completo || disc.nome_completo_temp || disc.profile?.email || "Discípulo"
                  
                  return (
                    <Link key={disc.id} href={`/dashboard/chat/com/${disc.user_id}`}>
                      <Button className="w-full justify-between" variant="outline">
                        <span className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          {nomeDiscipulo}
                        </span>
                        {disc.mensagensNaoLidas > 0 && (
                          <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                            {disc.mensagensNaoLidas}
                          </span>
                        )}
                      </Button>
                    </Link>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Mensagem quando não há ninguém para conversar */}
        {!discipulo.discipulador_id && (!discipulosComMensagens || discipulosComMensagens.length === 0) && (
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
              <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Você ainda não tem conversas disponíveis.</p>
              <p className="text-sm mt-2">
                Quando você tiver um discipulador ou discípulos, poderá conversar com eles aqui.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
