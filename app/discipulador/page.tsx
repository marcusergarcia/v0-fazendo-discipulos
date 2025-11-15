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

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function DiscipuladorPage() {
  console.log("[v0] >>>>>>> COMPONENT STARTED <<<<<<<")
  
  const supabase = await createClient()
  console.log("[v0] Supabase client created")

  const {
    data: { user },
  } = await supabase.auth.getUser()
  
  console.log("[v0] User fetched:", user?.id)
  
  if (!user) redirect("/auth/login")

  const { data: discipuladorData } = await supabase
    .from("discipulos")
    .select("id")
    .eq("user_id", user.id)
    .single()

  console.log("[v0] ===== INICIO DEBUG PAINEL DISCIPULADOR =====")
  console.log("[v0] User auth ID (Marcus):", user.id)
  console.log("[v0] Discipulador data:", discipuladorData)

  const { data: todosDiscipulos, error: errorDiscipulos } = await supabase
    .from("discipulos")
    .select("*")
    .eq("discipulador_id", user.id)

  console.log("[v0] Query todosDiscipulos WHERE discipulador_id =", user.id)
  console.log("[v0] Error buscar discipulos:", errorDiscipulos)
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

  console.log("[v0] Discipulos aprovados:", discipulosAprovados.length)
  console.log("[v0] Discipulos aprovados IDs para buscar reflexoes:", discipulosAprovados.map(d => d.id))

  // Filtrar pendentes de aprovação inicial
  const discipulosPendentesAprovacao = discipulosComPerfil?.filter(d => !d.aprovado_discipulador) || []

  const { data: todasReflexoes, error: errorTodasReflexoes } = await supabase
    .from("reflexoes_conteudo")
    .select("*")
    .order("data_criacao", { ascending: false })

  console.log("[v0] === TODAS REFLEXOES NO BANCO ===")
  console.log("[v0] Total reflexões no banco:", todasReflexoes?.length || 0)
  console.log("[v0] Reflexões:", JSON.stringify(todasReflexoes, null, 2))
  console.log("[v0] Error buscar todas reflexões:", errorTodasReflexoes)

  const idsParaBuscar = discipulosAprovados?.map((d) => d.id).filter(Boolean) || []
  console.log("[v0] === BUSCAR REFLEXÕES DOS APROVADOS ===")
  console.log("[v0] IDs dos discípulos aprovados:", idsParaBuscar)
  
  let reflexoesPendentes: any[] = []
  let errorReflexoes = null
  
  if (idsParaBuscar.length > 0) {
    const result = await supabase
      .from("reflexoes_conteudo")
      .select("*")
      .in("discipulo_id", idsParaBuscar)
      .order("data_criacao", { ascending: false })
    
    reflexoesPendentes = result.data || []
    errorReflexoes = result.error
    
    console.log("[v0] Query executada: SELECT * FROM reflexoes_conteudo WHERE discipulo_id IN", idsParaBuscar)
  }

  console.log("[v0] Reflexões dos aprovados retornadas:", reflexoesPendentes?.length || 0)
  console.log("[v0] Reflexões dos aprovados:", JSON.stringify(reflexoesPendentes, null, 2))
  console.log("[v0] Error reflexões dos aprovados:", errorReflexoes)

  const reflexoesComDiscipulo = reflexoesPendentes ? await Promise.all(
    reflexoesPendentes.map(async (reflexao) => {
      const discipulo = discipulosAprovados.find(d => d.id === reflexao.discipulo_id)
      return { ...reflexao, discipulos: discipulo }
    })
  ) : []

  console.log("[v0] Reflexoes com discipulo vinculado:", reflexoesComDiscipulo.length)

  const { data: progressoPendente, error: errorProgresso } = await supabase
    .from("progresso_fases")
    .select("*")
    .eq("status_validacao", "pendente")
    .eq("enviado_para_validacao", true)
    .in("discipulo_id", discipulosAprovados?.map((d) => d.id).filter(Boolean) || [])
    .order("created_at", { ascending: false })

  console.log("[v0] Progresso pendente retornado:", JSON.stringify(progressoPendente, null, 2))
  console.log("[v0] Error progresso:", errorProgresso)

  const progressoComDiscipulo = progressoPendente ? await Promise.all(
    progressoPendente.map(async (progresso) => {
      const discipulo = discipulosAprovados.find(d => d.id === progresso.discipulo_id)
      return { ...progresso, discipulos: discipulo }
    })
  ) : []

  const tarefasPorDiscipulo = discipulosAprovados.map((discipulo) => {
    console.log("[v0] ===== PROCESSANDO DISCIPULO =====")
    console.log("[v0] Discipulo ID:", discipulo.id)
    console.log("[v0] Discipulo Nome:", discipulo.nome_completo_temp)
    console.log("[v0] Total reflexoesComDiscipulo:", reflexoesComDiscipulo?.length || 0)
    console.log("[v0] Todas reflexoes com IDs:", reflexoesComDiscipulo?.map(r => ({ 
      reflexao_id: r.id, 
      discipulo_id: r.discipulo_id,
      discipulo_id_tipo: typeof r.discipulo_id,
      reflexao_conteudo: r.reflexao?.substring(0, 50)
    })))
    console.log("[v0] Discipulo.id tipo:", typeof discipulo.id)
    
    const reflexoes = reflexoesComDiscipulo?.filter((r) => {
      const match = r.discipulo_id === discipulo.id
      console.log("[v0] Comparando reflexao discipulo_id", r.discipulo_id, "(tipo:", typeof r.discipulo_id, ") com discipulo.id", discipulo.id, "(tipo:", typeof discipulo.id, ") = match:", match)
      return match
    }) || []
    
    console.log("[v0] Reflexoes FILTRADAS para este discipulo:", reflexoes.length)
    console.log("[v0] Reflexoes FILTRADAS detalhadas:", JSON.stringify(reflexoes, null, 2))
    
    const progressos = progressoComDiscipulo?.filter((p) => p.discipulo_id === discipulo.id) || []
    const totalTarefas = reflexoes.length + progressos.length
    
    console.log("[v0] Progressos:", progressos.length)
    console.log("[v0] Total tarefas (reflexoes + progressos):", totalTarefas)
    console.log("[v0] ===== FIM PROCESSANDO DISCIPULO =====")
    
    return {
      discipulo,
      totalTarefas,
      reflexoes,
      progressos,
    }
  })

  const totalTarefasPendentes = tarefasPorDiscipulo.reduce((acc, t) => acc + t.totalTarefas, 0)

  console.log("[v0] ===== FIM DEBUG PAINEL DISCIPULADOR =====")

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Painel do Discipulador v2.0</h1>
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
                  <p className="text-2xl font-bold">{discipulosAprovados.length}</p>
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
                  <p className="text-2xl font-bold">{discipulosPendentesAprovacao.length}</p>
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
                  <p className="text-2xl font-bold">{discipulosAprovados.filter(d => d.passo_atual >= 1).length}</p>
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
                  <p className="text-2xl font-bold">{discipulosAprovados.filter(d => d.nivel_atual !== "Explorador").length}</p>
                  <p className="text-sm text-muted-foreground">Avançados</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="discipulos" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pendentes">
              Pendentes de Validação
              {discipulosPendentesAprovacao.length > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {discipulosPendentesAprovacao.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="discipulos">
              Meus Discípulos
              {totalTarefasPendentes > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {totalTarefasPendentes}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="chat">Conversas</TabsTrigger>
          </TabsList>

          <TabsContent value="pendentes" className="space-y-4">
            {discipulosPendentesAprovacao.length > 0 ? (
              discipulosPendentesAprovacao.map((discipulo) => (
                <Card key={discipulo.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-base">{discipulo.nome_completo_temp}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">{discipulo.email_temporario}</p>
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
              ))
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <CheckCircle className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <p className="text-lg font-medium">Tudo em dia!</p>
                  <p className="text-muted-foreground">Não há novos discípulos aguardando aprovação.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="discipulos" className="space-y-4">
            {tarefasPorDiscipulo.length > 0 ? (
              tarefasPorDiscipulo.map(({ discipulo, totalTarefas, reflexoes, progressos }) => {
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
                          {totalTarefas > 0 ? (
                            <>
                              <Badge variant="destructive" className="text-sm px-3 py-1">
                                {totalTarefas} {totalTarefas === 1 ? "Tarefa" : "Tarefas"}
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
                          <Link href={`/discipulador/chat/${discipulo.user_id}`}>
                            <Button size="sm" variant="outline">
                              <MessageCircle className="w-4 h-4" />
                            </Button>
                          </Link>
                        </div>
                      </div>

                      {(reflexoes.length > 0 || progressos.length > 0) && (
                        <div className="mt-4 pt-4 border-t space-y-3">
                          <h4 className="font-medium text-sm">Tarefas Pendentes:</h4>
                          
                          {reflexoes.map((reflexao) => (
                            <div key={reflexao.id} className="bg-muted p-3 rounded-lg space-y-2">
                              <div className="flex items-center justify-between">
                                <p className="text-sm font-medium">
                                  📝 Reflexão - Fase {reflexao.fase_numero} Passo {reflexao.passo_numero}
                                </p>
                                <Badge variant="secondary" className="text-xs">Reflexão</Badge>
                              </div>
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {reflexao.reflexao || "Sem conteúdo"}
                              </p>
                              <Link href={`/discipulador/validar-reflexao/${reflexao.id}`}>
                                <Button size="sm" className="w-full">
                                  <CheckCircle className="w-3 h-3 mr-2" />
                                  Validar Reflexão
                                </Button>
                              </Link>
                            </div>
                          ))}

                          {progressos.map((progresso) => (
                            <div key={progresso.id} className="bg-muted p-3 rounded-lg space-y-2">
                              <div className="flex items-center justify-between">
                                <p className="text-sm font-medium">
                                  🎯 Missão - Fase {progresso.fase_numero} Passo {progresso.passo_numero}
                                </p>
                                <Badge variant="secondary" className="text-xs">Missão</Badge>
                              </div>
                              <p className="text-sm text-muted-foreground line-clamp-2">{progresso.resposta_missao}</p>
                              <Link href={`/discipulador/validar-passo/${discipulo.user_id}/${progresso.fase_numero}/${progresso.passo_numero}`}>
                                <Button size="sm" className="w-full">
                                  <CheckCircle className="w-3 h-3 mr-2" />
                                  Validar Missão
                                </Button>
                              </Link>
                            </div>
                          ))}
                        </div>
                      )}
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

          <TabsContent value="chat" className="space-y-4">
            {discipulosAprovados.length > 0 ? (
              discipulosAprovados.map((discipulo) => (
                <Link key={discipulo.id} href={`/discipulador/chat/${discipulo.user_id}`}>
                  <Card className="hover:border-primary transition-colors cursor-pointer">
                    <CardContent className="py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <Avatar className="w-12 h-12">
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {discipulo.nome_completo_temp?.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{discipulo.nome_completo_temp}</p>
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
