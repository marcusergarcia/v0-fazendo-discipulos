import { redirect } from 'next/navigation'
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { NotificacoesDropdown } from "@/components/notificacoes-dropdown"
import { Users, MessageCircle, CheckCircle, Clock, TrendingUp, ArrowLeft } from 'lucide-react'
import Link from "next/link"

export default async function DiscipuladorPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  // Buscar discípulos sob sua responsabilidade
  const { data: discipulos } = await supabase
    .from("discipulos")
    .select(`
      *,
      profile:user_id(nome_completo, email)
    `)
    .eq("discipulador_id", user.id)

  // Buscar reflexões pendentes de validação
  const { data: reflexoesPendentes } = await supabase
    .from("reflexoes")
    .select(`
      *,
      discipulo:discipulo_id(id, nivel_atual, profile:user_id(nome_completo, email))
    `)
    .is("validado", null)
    .in("discipulo_id", discipulos?.map((d) => d.id) || [])
    .order("created_at", { ascending: false })

  // Buscar progresso pendente de validação
  const { data: progressoPendente } = await supabase
    .from("progresso_fases")
    .select(`
      *,
      discipulo:discipulo_id(id, nivel_atual, profile:user_id(nome_completo, email))
    `)
    .eq("status_validacao", "pendente")
    .in("discipulo_id", discipulos?.map((d) => d.id) || [])
    .order("created_at", { ascending: false })

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Painel do Discipulador</h1>
              <p className="text-muted-foreground mt-1">Acompanhe e valide seus discípulos</p>
            </div>
            <div className="flex items-center gap-2">
              <NotificacoesDropdown userId={user.id} />
              <Link href="/dashboard">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Estatísticas */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <Users className="w-8 h-8 text-primary" />
                <div className="text-right">
                  <p className="text-2xl font-bold">{discipulos?.length || 0}</p>
                  <p className="text-sm text-muted-foreground">Discípulos</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <Clock className="w-8 h-8 text-warning" />
                <div className="text-right">
                  <p className="text-2xl font-bold">
                    {(reflexoesPendentes?.length || 0) + (progressoPendente?.length || 0)}
                  </p>
                  <p className="text-sm text-muted-foreground">Pendentes</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <CheckCircle className="w-8 h-8 text-success" />
                <div className="text-right">
                  <p className="text-2xl font-bold">{discipulos?.filter((d) => d.passo_atual > 1).length || 0}</p>
                  <p className="text-sm text-muted-foreground">Ativos</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <TrendingUp className="w-8 h-8 text-info" />
                <div className="text-right">
                  <p className="text-2xl font-bold">
                    {discipulos?.filter((d) => d.nivel_atual !== "Explorador").length || 0}
                  </p>
                  <p className="text-sm text-muted-foreground">Avançados</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="pendentes" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pendentes">
              Pendentes de Validação
              {(reflexoesPendentes?.length || 0) + (progressoPendente?.length || 0) > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {(reflexoesPendentes?.length || 0) + (progressoPendente?.length || 0)}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="discipulos">Meus Discípulos</TabsTrigger>
            <TabsTrigger value="chat">Conversas</TabsTrigger>
          </TabsList>

          {/* Tab: Pendentes de Validação */}
          <TabsContent value="pendentes" className="space-y-4">
            {reflexoesPendentes && reflexoesPendentes.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Reflexões sobre Vídeos/Artigos</h3>
                {reflexoesPendentes.map((reflexao) => (
                  <Card key={reflexao.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-base">
                            {reflexao.discipulo?.profile?.nome_completo || reflexao.discipulo?.profile?.email}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground mt-1">
                            {reflexao.tipo === "video" ? "Vídeo" : "Artigo"}: {reflexao.titulo}
                          </p>
                        </div>
                        <Badge variant="outline">{reflexao.discipulo?.nivel_atual}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm font-medium mb-2">Reflexão do discípulo:</p>
                          <p className="text-sm bg-muted p-3 rounded-lg">{reflexao.reflexao}</p>
                        </div>
                        <div className="flex gap-2">
                          <Link href={`/discipulador/validar-reflexao/${reflexao.id}`} className="flex-1">
                            <Button className="w-full" size="sm">
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Validar Reflexão
                            </Button>
                          </Link>
                          <Link href={`/discipulador/chat/${reflexao.discipulo_id}`}>
                            <Button variant="outline" size="sm">
                              <MessageCircle className="w-4 h-4 mr-2" />
                              Conversar
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {progressoPendente && progressoPendente.length > 0 && (
              <div className="space-y-4 mt-6">
                <h3 className="font-semibold text-lg">Missões de Passos</h3>
                {progressoPendente.map((progresso) => (
                  <Card key={progresso.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-base">
                            {progresso.discipulo?.profile?.nome_completo || progresso.discipulo?.profile?.email}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground mt-1">
                            Fase {progresso.fase_numero} - Passo {progresso.passo_numero}
                          </p>
                        </div>
                        <Badge variant="outline">{progresso.discipulo?.nivel_atual}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm font-medium mb-2">Resposta da missão:</p>
                          <p className="text-sm bg-muted p-3 rounded-lg">{progresso.resposta_missao}</p>
                        </div>
                        <div className="flex gap-2">
                          <Link
                            href={`/discipulador/validar-passo/${progresso.discipulo_id}/${progresso.fase_numero}/${progresso.passo_numero}`}
                            className="flex-1"
                          >
                            <Button className="w-full" size="sm">
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Validar Missão
                            </Button>
                          </Link>
                          <Link href={`/discipulador/chat/${progresso.discipulo_id}`}>
                            <Button variant="outline" size="sm">
                              <MessageCircle className="w-4 h-4 mr-2" />
                              Conversar
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {(!reflexoesPendentes || reflexoesPendentes.length === 0) &&
              (!progressoPendente || progressoPendente.length === 0) && (
                <Card>
                  <CardContent className="py-12 text-center">
                    <CheckCircle className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                    <p className="text-lg font-medium">Tudo em dia!</p>
                    <p className="text-muted-foreground">Não há pendências de validação no momento.</p>
                  </CardContent>
                </Card>
              )}
          </TabsContent>

          {/* Tab: Meus Discípulos */}
          <TabsContent value="discipulos" className="space-y-4">
            {discipulos && discipulos.length > 0 ? (
              discipulos.map((discipulo) => (
                <Card key={discipulo.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>{discipulo.profile?.nome_completo || discipulo.profile?.email}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">{discipulo.profile?.email}</p>
                      </div>
                      <Badge>{discipulo.nivel_atual}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Fase Atual</p>
                        <p className="text-lg font-semibold">{discipulo.fase_atual}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Passo Atual</p>
                        <p className="text-lg font-semibold">{discipulo.passo_atual}/10</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">XP Total</p>
                        <p className="text-lg font-semibold">{discipulo.xp_total}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/discipulador/discipulo/${discipulo.id}`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full bg-transparent">
                          Ver Progresso Detalhado
                        </Button>
                      </Link>
                      <Link href={`/discipulador/chat/${discipulo.id}`}>
                        <Button size="sm">
                          <MessageCircle className="w-4 h-4 mr-2" />
                          Chat
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <Users className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <p className="text-lg font-medium">Nenhum discípulo ainda</p>
                  <p className="text-muted-foreground">Quando você tiver discípulos, eles aparecerão aqui.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Tab: Conversas */}
          <TabsContent value="chat" className="space-y-4">
            {discipulos && discipulos.length > 0 ? (
              discipulos.map((discipulo) => (
                <Link key={discipulo.id} href={`/discipulador/chat/${discipulo.id}`}>
                  <Card className="hover:border-primary transition-colors cursor-pointer">
                    <CardContent className="py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <Users className="w-6 h-6 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">
                              {discipulo.profile?.nome_completo || discipulo.profile?.email}
                            </p>
                            <p className="text-sm text-muted-foreground">{discipulo.nivel_atual}</p>
                          </div>
                        </div>
                        <MessageCircle className="w-5 h-5 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <MessageCircle className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <p className="text-lg font-medium">Nenhuma conversa</p>
                  <p className="text-muted-foreground">Comece discipulando alguém para iniciar conversas.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
