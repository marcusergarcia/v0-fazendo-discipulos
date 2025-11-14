import { redirect } from 'next/navigation'
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { NotificacoesDropdown } from "@/components/notificacoes-dropdown"
import { Users, MessageCircle, CheckCircle, Clock, TrendingUp, ArrowLeft, Eye } from 'lucide-react'
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default async function DiscipuladorPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: todosDiscipulos, error: errorDiscipulos } = await supabase
    .from("discipulos")
    .select("*")
    .eq("discipulador_id", user.id)

  console.log("[v0] Discipulador ID:", user.id)
  console.log("[v0] Error:", errorDiscipulos)
  console.log("[v0] Todos Discipulos retornados:", JSON.stringify(todosDiscipulos, null, 2))
  console.log("[v0] Quantidade de discipulos:", todosDiscipulos?.length || 0)

  // Se temos discípulos, buscar os perfis separadamente
  const discipulosComPerfil = todosDiscipulos ? await Promise.all(
    todosDiscipulos.map(async (discipulo) => {
      if (discipulo.user_id) {
        const { data: perfil } = await supabase
          .from("profiles")
          .select("nome_completo, email, foto_perfil_url, avatar_url")
          .eq("id", discipulo.user_id)
          .single()
        return { ...discipulo, profiles: perfil }
      }
      return { ...discipulo, profiles: null }
    })
  ) : []

  console.log("[v0] Discipulos com perfil:", JSON.stringify(discipulosComPerfil, null, 2))

  // Filtrar apenas aprovados para mostrar na aba "Meus Discípulos"
  const discipulosAprovados = discipulosComPerfil?.filter(d => d.aprovado_discipulador) || []

  // Filtrar pendentes de aprovação inicial
  const discipulosPendentesAprovacao = discipulosComPerfil?.filter(d => !d.aprovado_discipulador) || []

  const { data: reflexoesPendentes } = await supabase
    .from("reflexoes_conteudo")
    .select(`
      *,
      discipulos!inner(id, user_id, nivel_atual, nome_completo_temp, email_temporario, foto_perfil_url_temp)
    `)
    .in("user_id", discipulosAprovados?.map((d) => d.user_id).filter(Boolean) || [])
    .order("data_criacao", { ascending: false })

  const { data: progressoPendente } = await supabase
    .from("progresso_fases")
    .select(`
      *,
      discipulos!inner(id, user_id, nivel_atual, nome_completo_temp, email_temporario, foto_perfil_url_temp)
    `)
    .eq("status_validacao", "pendente")
    .in("user_id", discipulosAprovados?.map((d) => d.user_id).filter(Boolean) || [])
    .order("created_at", { ascending: false })

  const tarefasPorDiscipulo = discipulosAprovados?.map((discipulo) => {
    const reflexoes = reflexoesPendentes?.filter((r) => r.user_id === discipulo.user_id) || []
    const progressos = progressoPendente?.filter((p) => p.user_id === discipulo.user_id) || []
    return {
      discipulo,
      tarefasPendentes: reflexoes.length + progressos.length,
      reflexoes,
      progressos,
    }
  }) || []

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
                  <p className="text-2xl font-bold">{todosDiscipulos?.length || 0}</p>
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
                    {discipulosPendentesAprovacao.length + (reflexoesPendentes?.length || 0) + (progressoPendente?.length || 0)}
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
                  <p className="text-2xl font-bold">{discipulosAprovados?.filter((d) => d.passo_atual >= 1).length || 0}</p>
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
                    {discipulosAprovados?.filter((d) => d.nivel_atual !== "Explorador").length || 0}
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
              {(discipulosPendentesAprovacao.length + (reflexoesPendentes?.length || 0) + (progressoPendente?.length || 0)) > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {discipulosPendentesAprovacao.length + (reflexoesPendentes?.length || 0) + (progressoPendente?.length || 0)}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="discipulos">Meus Discípulos</TabsTrigger>
            <TabsTrigger value="chat">Conversas</TabsTrigger>
          </TabsList>

          {/* Tab: Pendentes de Validação */}
          <TabsContent value="pendentes" className="space-y-4">
            {discipulosPendentesAprovacao.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Aguardando Aprovação</h3>
                {discipulosPendentesAprovacao.map((discipulo) => (
                  <Card key={discipulo.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-base">
                            {discipulo.nome_completo_temp}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground mt-1">
                            {discipulo.email_temporario}
                          </p>
                        </div>
                        <Badge variant="secondary">Novo Discípulo</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Data de Nascimento</p>
                            <p className="font-medium">
                              {discipulo.data_nascimento_temp 
                                ? new Date(discipulo.data_nascimento_temp).toLocaleDateString('pt-BR')
                                : 'Não informado'}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Gênero</p>
                            <p className="font-medium">{discipulo.genero_temp || 'Não informado'}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Telefone</p>
                            <p className="font-medium">{discipulo.telefone_temp || 'Não informado'}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Igreja</p>
                            <p className="font-medium">{discipulo.igreja_temp || 'Não informado'}</p>
                          </div>
                        </div>
                        <Link href={`/discipulador/aprovar/${discipulo.id}`} className="block">
                          <Button className="w-full" size="sm">
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Revisar e Aprovar Cadastro
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {reflexoesPendentes && reflexoesPendentes.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Reflexões sobre Vídeos/Artigos</h3>
                {reflexoesPendentes.map((reflexao) => (
                  <Card key={reflexao.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-base">
                            {reflexao.discipulos?.nome_completo_temp || reflexao.discipulos?.email_temporario}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground mt-1">
                            {reflexao.tipo === "video" ? "Vídeo" : "Artigo"}: {reflexao.titulo}
                          </p>
                        </div>
                        <Badge variant="outline">{reflexao.discipulos?.nivel_atual}</Badge>
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
                          <Link href={`/discipulador/chat/${reflexao.discipulos?.user_id}`}>
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
                            {progresso.discipulos?.nome_completo_temp || progresso.discipulos?.email_temporario}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground mt-1">
                            Fase {progresso.fase_numero} - Passo {progresso.passo_numero}
                          </p>
                        </div>
                        <Badge variant="outline">{progresso.discipulos?.nivel_atual}</Badge>
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
                            href={`/discipulador/validar-passo/${progresso.discipulos?.user_id}/${progresso.fase_numero}/${progresso.passo_numero}`}
                            className="flex-1"
                          >
                            <Button className="w-full" size="sm">
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Validar Missão
                            </Button>
                          </Link>
                          <Link href={`/discipulador/chat/${progresso.discipulos?.user_id}`}>
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

            {discipulosPendentesAprovacao.length === 0 &&
              (!reflexoesPendentes || reflexoesPendentes.length === 0) &&
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
            {tarefasPorDiscipulo && tarefasPorDiscipulo.length > 0 ? (
              tarefasPorDiscipulo.map(({ discipulo, tarefasPendentes, reflexoes, progressos }) => {
                const nome = discipulo.profiles?.nome_completo || discipulo.nome_completo_temp || discipulo.profiles?.email || discipulo.email_temporario
                const foto = discipulo.profiles?.foto_perfil_url || discipulo.profiles?.avatar_url || discipulo.foto_perfil_url_temp
                const iniciais = nome.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase()

                return (
                  <Card key={discipulo.id}>
                    <CardContent className="py-4">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <Avatar className="w-16 h-16">
                            <AvatarImage src={foto || undefined} alt={nome} />
                            <AvatarFallback className="bg-primary text-primary-foreground">
                              {iniciais}
                            </AvatarFallback>
                          </Avatar>
                          <div className="absolute -bottom-1 -right-1 bg-background border-2 border-background rounded-full px-2 py-0.5">
                            <p className="text-xs font-bold">P{discipulo.passo_atual}</p>
                          </div>
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold">{nome}</h3>
                            <Badge variant="outline" className="text-xs">
                              {discipulo.nivel_atual}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>Fase {discipulo.fase_atual}</span>
                            <span>Passo {discipulo.passo_atual}/10</span>
                            <span>{discipulo.xp_total} XP</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {tarefasPendentes > 0 ? (
                            <>
                              <Badge variant="destructive" className="text-sm px-3 py-1">
                                {tarefasPendentes} {tarefasPendentes === 1 ? "Tarefa" : "Tarefas"}
                              </Badge>
                              <Link href={`/discipulador/tarefas/${discipulo.id}`}>
                                <Button size="sm" variant="default">
                                  <Eye className="w-4 h-4 mr-2" />
                                  Ver Tarefas
                                </Button>
                              </Link>
                            </>
                          ) : (
                            <Badge variant="outline" className="text-sm px-3 py-1 text-muted-foreground">
                              Sem tarefas
                            </Badge>
                          )}
                          <Link href={`/discipulador/chat/${discipulo.id}`}>
                            <Button size="sm" variant="outline">
                              <MessageCircle className="w-4 h-4" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <Users className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <p className="text-lg font-medium">Nenhum discípulo aprovado ainda</p>
                  <p className="text-muted-foreground">Aprove os cadastros pendentes para começar o discipulado.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Tab: Conversas */}
          <TabsContent value="chat" className="space-y-4">
            {discipulosAprovados && discipulosAprovados.length > 0 ? (
              discipulosAprovados.map((discipulo) => (
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
                              {discipulo.profiles?.nome_completo || discipulo.profiles?.email}
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
                  <p className="text-muted-foreground">Aprove discípulos para iniciar conversas.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
