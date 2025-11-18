import { redirect } from 'next/navigation'
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, MessageCircle, CheckCircle, Clock, TrendingUp, ArrowLeft, Video, FileText } from 'lucide-react'
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { PASSOS_CONTEUDO } from "@/constants/passos-conteudo"
import { ReflexoesClient } from "./discipulador-reflexoes-client"
import { generateAvatar, calcularIdade } from "@/lib/generate-avatar"
import AvaliarRespostasModal from "@/components/avaliar-respostas-modal"

export default async function DiscipuladorPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: discipulos } = await supabase
    .from("discipulos")
    .select("*")
    .eq("discipulador_id", user.id)
    .eq("aprovado_discipulador", true)

  const discipulosComPerfil = await Promise.all(
    (discipulos || []).map(async (disc) => {
      const { data: profile } = await supabase
        .from("profiles")
        .select("nome_completo, email, foto_perfil_url, avatar_url, genero, data_nascimento, etnia")
        .eq("id", disc.user_id)
        .maybeSingle()

      return { ...disc, profile }
    })
  )

  const discipuloIds = discipulos?.map(d => d.id) || []
  
  const { data: todasReflexoes } = await supabase
    .from("reflexoes_conteudo")
    .select("*, situacao")
    .eq("discipulador_id", user.id)

  const { data: progressosPendentes } = await supabase
    .from("progresso_fases")
    .select("*")
    .in("discipulo_id", discipuloIds)
    .eq("status_validacao", "pendente")

  const { data: respostasHistorico } = await supabase
    .from("historico_respostas_passo")
    .select("*")
    .in("discipulo_id", discipuloIds)

  console.log("[v0] Respostas do histórico:", respostasHistorico)

  const dadosPorDiscipulo = await Promise.all(
    discipulosComPerfil.map(async (discipulo) => {
      const reflexoesDiscipulo = todasReflexoes?.filter(r => r.discipulo_id === discipulo.id) || []
      const progressosDiscipulo = progressosPendentes?.filter(p => p.discipulo_id === discipulo.id) || []

      const respostasDiscipulo = respostasHistorico?.filter(r => r.discipulo_id === discipulo.id) || []

      const { data: progressoAtual } = await supabase
        .from("progresso_fases")
        .select("*")
        .eq("discipulo_id", discipulo.id)
        .eq("passo_numero", discipulo.passo_atual)
        .maybeSingle()

      const conteudoPasso = PASSOS_CONTEUDO[discipulo.passo_atual as keyof typeof PASSOS_CONTEUDO]
      const tarefas = []

      if (conteudoPasso) {
        conteudoPasso.videos?.forEach((video) => {
          const videoAssistido = progressoAtual?.videos_assistidos 
            ? (progressoAtual.videos_assistidos as any[]).find((v: any) => v.id === video.id)
            : null
          
          const reflexao = reflexoesDiscipulo.find(r => r.conteudo_id === video.id && r.tipo === 'video')
          
          tarefas.push({
            id: video.id,
            tipo: 'video',
            titulo: video.titulo,
            concluido: !!videoAssistido,
            reflexao: reflexao ? {
              ...reflexao,
              xp_ganho: reflexao.xp_ganho || null,
              situacao: reflexao.situacao || null
            } : null,
            xp: reflexao?.xp_ganho || null,
            situacao: reflexao?.situacao || null
          })
        })

        conteudoPasso.artigos?.forEach((artigo) => {
          const artigoLido = progressoAtual?.artigos_lidos
            ? (progressoAtual.artigos_lidos as any[]).find((a: any) => a.id === artigo.id)
            : null
          
          const reflexao = reflexoesDiscipulo.find(r => r.conteudo_id === artigo.id && r.tipo === 'artigo')
          
          tarefas.push({
            id: artigo.id,
            tipo: 'artigo',
            titulo: artigo.titulo,
            concluido: !!artigoLido,
            reflexao: reflexao ? {
              ...reflexao,
              xp_ganho: reflexao.xp_ganho || null,
              situacao: reflexao.situacao || null
            } : null,
            xp: reflexao?.xp_ganho || null,
            situacao: reflexao?.situacao || null
          })
        })
        
        const respostaPergunta = respostasDiscipulo.find(
          r => r.passo_numero === discipulo.passo_atual && 
               r.fase_numero === discipulo.fase_atual && 
               r.tipo_resposta === 'pergunta'
        )
        
        const respostaMissao = respostasDiscipulo.find(
          r => r.passo_numero === discipulo.passo_atual && 
               r.fase_numero === discipulo.fase_atual && 
               r.tipo_resposta === 'missao'
        )
        
        if (conteudoPasso.perguntaChave) {
          tarefas.push({
            id: 'pergunta-responder',
            tipo: 'pergunta',
            titulo: conteudoPasso.perguntaChave,
            concluido: !!(respostaPergunta?.resposta),
            resposta: respostaPergunta || null,
            xp: respostaPergunta?.xp_ganho || null,
            situacao: respostaPergunta?.situacao || null
          })
        }
        
        if (conteudoPasso.missao) {
          tarefas.push({
            id: 'missao-pratica',
            tipo: 'missao',
            titulo: conteudoPasso.missao,
            concluido: !!(respostaMissao?.resposta),
            resposta: respostaMissao || null,
            xp: respostaMissao?.xp_ganho || null,
            situacao: respostaMissao?.situacao || null
          })
        }
      }

      return {
        discipulo,
        tarefasPendentes: reflexoesDiscipulo.length + progressosDiscipulo.length,
        tarefas,
        progressoAtual,
      }
    })
  )

  const totalPendentes = dadosPorDiscipulo.reduce((sum, d) => sum + d.tarefasPendentes, 0)

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Painel do Discipulador</h1>
              <p className="text-muted-foreground mt-1">Acompanhe e valide seus discípulos</p>
            </div>
            <Link href="/dashboard">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
            </Link>
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
                  <p className="text-2xl font-bold">{totalPendentes}</p>
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
                  <p className="text-2xl font-bold">{discipulos?.filter((d) => d.passo_atual >= 1).length || 0}</p>
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

        {discipulosComPerfil.length > 0 ? (
          <Tabs defaultValue={discipulosComPerfil[0].id} className="space-y-6">
            <TabsList className="w-full justify-start overflow-x-auto">
              {discipulosComPerfil.map((disc) => {
                const nome = disc.profile?.nome_completo || disc.nome_completo_temp || disc.profile?.email || disc.email_temporario
                const pendentes = dadosPorDiscipulo.find(d => d.discipulo.id === disc.id)?.tarefasPendentes || 0
                
                return (
                  <TabsTrigger key={disc.id} value={disc.id} className="gap-2">
                    {nome.split(" ")[0]}
                    {pendentes > 0 && (
                      <Badge variant="destructive" className="ml-1 px-1.5 py-0.5 text-xs">
                        {pendentes}
                      </Badge>
                    )}
                  </TabsTrigger>
                )
              })}
            </TabsList>

            {dadosPorDiscipulo.map(({ discipulo, tarefas, tarefasPendentes, progressoAtual }) => {
              const nome = discipulo.profile?.nome_completo || discipulo.nome_completo_temp || discipulo.profile?.email || discipulo.email_temporario
              const fotoUrl = discipulo.profile?.foto_perfil_url || discipulo.profile?.avatar_url || discipulo.foto_perfil_url_temp
              const idade = calcularIdade(discipulo.profile?.data_nascimento || discipulo.data_nascimento_temp)
              const genero = discipulo.profile?.genero || discipulo.genero_temp
              const etnia = discipulo.profile?.etnia || discipulo.etnia_temp
              
              const foto = fotoUrl || generateAvatar({ genero, idade, etnia })
              
              const iniciais = nome.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase()

              return (
                <TabsContent key={discipulo.id} value={discipulo.id} className="space-y-6">
                  {/* Card do Discípulo */}
                  <Card>
                    <CardContent className="py-6">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="relative">
                          <Avatar className="w-20 h-20">
                            <AvatarImage src={foto || "/placeholder.svg"} alt={nome} />
                            <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                              {iniciais}
                            </AvatarFallback>
                          </Avatar>

                          <div className="absolute -bottom-1 -right-1 bg-background border-2 border-background rounded-full px-2.5 py-1">
                            <p className="text-xs font-bold">P{discipulo.passo_atual}</p>
                          </div>
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h2 className="text-2xl font-bold">{nome}</h2>
                            <Badge variant="outline">{discipulo.nivel_atual}</Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>Fase {discipulo.fase_atual}</span>
                            <span>Passo {discipulo.passo_atual}/10</span>
                            <span>{discipulo.xp_total} XP</span>
                          </div>
                        </div>

                        <Link href={`/discipulador/chat/${discipulo.id}`}>
                          <Button>
                            <MessageCircle className="w-4 h-4 mr-2" />
                            Conversar
                          </Button>
                        </Link>
                      </div>

                      {tarefas.length > 0 && (
                        <div className="space-y-2">
                          <h3 className="font-semibold text-lg mb-3">Tarefas do Passo Atual</h3>
                          {tarefas.map((tarefa) => (
                            <div 
                              key={tarefa.id}
                              className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                            >
                              <div className={`p-2 rounded ${
                                tarefa.tipo === 'video' ? 'bg-red-100 text-red-600' : 
                                tarefa.tipo === 'artigo' ? 'bg-blue-100 text-blue-600' :
                                tarefa.tipo === 'pergunta' ? 'bg-orange-100 text-orange-600' :
                                'bg-purple-100 text-purple-600'
                              }`}>
                                {tarefa.tipo === 'video' ? <Video className="w-5 h-5" /> : 
                                 tarefa.tipo === 'artigo' ? <FileText className="w-5 h-5" /> : 
                                 <FileText className="w-5 h-5" />}
                              </div>

                              <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">{tarefa.titulo}</p>
                                <p className="text-sm text-muted-foreground capitalize">
                                  {tarefa.tipo === 'pergunta' ? 'Pergunta para Responder' : 
                                   tarefa.tipo === 'missao' ? 'Missão Prática' : 
                                   tarefa.tipo}
                                </p>
                              </div>

                              <div className="flex items-center gap-2">
                                {(tarefa.tipo === 'pergunta' || tarefa.tipo === 'missao') ? (
                                  tarefa.situacao === 'aprovado' ? (
                                    <Badge variant="default" className="bg-green-600 hover:bg-green-700">
                                      <CheckCircle className="w-3 h-3 mr-1" />
                                      Aprovado {tarefa.xp}XP
                                    </Badge>
                                  ) : tarefa.situacao === 'enviado' ? (
                                    <AvaliarRespostasModal
                                      resposta={tarefa.resposta}
                                      discipuloNome={nome}
                                      onAprovado={() => {}}
                                    />
                                  ) : (
                                    <Badge variant="outline" className="text-muted-foreground">
                                      Não iniciado
                                    </Badge>
                                  )
                                ) : (
                                  <>
                                    <ReflexoesClient
                                      reflexao={tarefa.reflexao}
                                      discipuloId={discipulo.id}
                                      discipuloNome={nome}
                                      xp={tarefa.xp}
                                      situacao={tarefa.situacao}
                                    />
                                    {!tarefa.reflexao && !tarefa.xp && (
                                      tarefa.concluido ? (
                                        <Badge variant="outline">Concluído</Badge>
                                      ) : (
                                        <Badge variant="outline" className="text-muted-foreground">
                                          Não iniciado
                                        </Badge>
                                      )
                                    )}
                                  </>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {tarefas.length === 0 && (
                        <div className="text-center py-8">
                          <p className="text-muted-foreground">Nenhuma tarefa disponível para este passo</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              )
            })}
          </Tabs>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Users className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg font-medium">Nenhum discípulo aprovado ainda</p>
              <p className="text-muted-foreground">Aprove os cadastros pendentes para começar o discipulado.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
