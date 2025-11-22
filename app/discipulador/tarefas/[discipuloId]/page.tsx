import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, CheckCircle, FileText, Video } from "lucide-react"
import Link from "next/link"
import { AprovarTarefaForm } from "./aprovar-tarefa-form"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default async function TarefasDiscipuloPage({
  params,
}: {
  params: Promise<{ discipuloId: string }>
}) {
  const { discipuloId } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  console.log("[v0] TarefasDiscipuloPage - User ID:", user.id)
  console.log("[v0] TarefasDiscipuloPage - Discipulo ID buscado:", discipuloId)

  // Buscar informações do discípulo
  const { data: discipulo, error: discipuloError } = await supabase
    .from("discipulos")
    .select(`
      *,
      profile:user_id(nome_completo, email, foto_perfil_url, avatar_url)
    `)
    .eq("id", discipuloId)
    .eq("discipulador_id", user.id)
    .single()

  console.log("[v0] Discípulo encontrado:", discipulo ? "SIM" : "NÃO")
  if (discipuloError) console.log("[v0] Erro ao buscar discípulo:", discipuloError)

  if (!discipulo) {
    redirect("/discipulador")
  }

  const { data: notificacoesDebug, error: notifDebugError } = await supabase
    .from("notificacoes")
    .select("*")
    .eq("user_id", user.id)
    .eq("discipulo_id", discipuloId)

  console.log("[v0] 🔔 NOTIFICAÇÕES EXISTENTES para este discípulo:", notificacoesDebug?.length || 0)
  if (notificacoesDebug && notificacoesDebug.length > 0) {
    notificacoesDebug.forEach((notif) => {
      console.log("[v0] Notificação:", {
        id: notif.id,
        tipo: notif.tipo,
        reflexao_id: notif.reflexao_id,
        discipulo_id: notif.discipulo_id,
        user_id: notif.user_id,
        lida: notif.lida,
      })
    })
  }
  if (notifDebugError) console.log("[v0] Erro ao buscar notificações debug:", notifDebugError)

  // Buscar progresso com missão ou pergunta enviadas para validação
  const { data: progressos, error: progressosError } = await supabase
    .from("progresso_fases")
    .select("*")
    .eq("discipulo_id", discipuloId)
    .eq("enviado_para_validacao", true)
    .order("created_at", { ascending: false })

  console.log("[v0] Progressos pendentes:", progressos?.length || 0)
  if (progressosError) console.log("[v0] Erro ao buscar progressos:", progressosError)

  // Filtrar apenas reflexões com situação 'enviado' (pendentes de aprovação)
  const { data: reflexoes, error: reflexoesError } = await supabase
    .from("reflexoes_conteudo")
    .select("*")
    .eq("discipulo_id", discipuloId)
    .eq("situacao", "enviado")
    .order("data_criacao", { ascending: false })

  console.log("[v0] 📹 Reflexões enviadas encontradas:", reflexoes?.length || 0)
  console.log(
    "[v0] Detalhes das reflexões:",
    reflexoes?.map((r) => ({ id: r.id, titulo: r.titulo, situacao: r.situacao })) || [],
  )
  if (reflexoesError) console.log("[v0] Erro ao buscar reflexões:", reflexoesError)

  const nome =
    discipulo.profile?.nome_completo ||
    discipulo.nome_completo_temp ||
    discipulo.profile?.email ||
    discipulo.email_temporario
  const foto = discipulo.profile?.foto_perfil_url || discipulo.profile?.avatar_url || discipulo.foto_perfil_url_temp
  const iniciais = nome
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase()

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Link href="/discipulador">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
            </Link>
            <div className="flex items-center gap-3 flex-1">
              <Avatar className="w-12 h-12">
                <AvatarImage src={foto || undefined} alt={nome} />
                <AvatarFallback className="bg-primary text-primary-foreground">{iniciais}</AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold">{nome}</h1>
                <p className="text-muted-foreground">
                  {discipulo.nivel_atual} - Fase {discipulo.fase_atual}, Passo {discipulo.passo_atual}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Missões de Passos Pendentes */}
        {progressos && progressos.length > 0 && (
          <div>
            <h2 className="text-xl font-bold mb-4">Missões de Passos Pendentes</h2>
            <div className="grid gap-4">
              {progressos.map((progresso) => (
                <Card key={progresso.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">
                        Fase {progresso.fase_numero} - Passo {progresso.passo_numero}
                      </CardTitle>
                      <Badge variant="warning">Aguardando Validação</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm font-medium mb-2">Resposta da Missão:</p>
                      <div className="bg-muted p-4 rounded-lg">
                        <p className="text-sm whitespace-pre-wrap">{progresso.resposta_missao}</p>
                      </div>
                    </div>
                    <AprovarTarefaForm tipo="progresso" tarefaId={progresso.id} discipuloId={discipuloId} xpBase={50} />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Reflexões sobre Conteúdos */}
        {reflexoes && reflexoes.length > 0 && (
          <div>
            <h2 className="text-xl font-bold mb-4">Reflexões sobre Conteúdos</h2>
            <div className="grid gap-4">
              {reflexoes.map((reflexao) => (
                <Card key={reflexao.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {reflexao.tipo === "video" ? (
                          <Video className="w-4 h-4 text-primary" />
                        ) : (
                          <FileText className="w-4 h-4 text-primary" />
                        )}
                        <CardTitle className="text-base">
                          {reflexao.titulo ||
                            `${reflexao.tipo === "video" ? "Vídeo" : "Artigo"} - Fase ${reflexao.fase_numero}, Passo ${reflexao.passo_numero}`}
                        </CardTitle>
                      </div>
                      <Badge variant="secondary">Reflexão</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm font-medium mb-2">Reflexão do Discípulo:</p>
                      <div className="bg-muted p-4 rounded-lg">
                        <p className="text-sm whitespace-pre-wrap">{reflexao.reflexao}</p>
                      </div>
                    </div>
                    <AprovarTarefaForm tipo="reflexao" tarefaId={reflexao.id} discipuloId={discipuloId} xpBase={20} />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {(!progressos || progressos.length === 0) && (!reflexoes || reflexoes.length === 0) && (
          <Card>
            <CardContent className="py-12 text-center">
              <CheckCircle className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg font-medium">Nenhuma tarefa pendente</p>
              <p className="text-muted-foreground">Este discípulo está em dia com suas atividades.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
