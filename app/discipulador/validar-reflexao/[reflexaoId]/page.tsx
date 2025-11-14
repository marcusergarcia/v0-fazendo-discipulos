import { redirect } from 'next/navigation'
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, CheckCircle, XCircle, Play, ExternalLink } from 'lucide-react'
import Link from "next/link"

export default async function ValidarReflexaoPage({
  params,
}: {
  params: Promise<{ reflexaoId: string }>
}) {
  const { reflexaoId } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: reflexao } = await supabase
    .from("reflexoes_conteudo")
    .select(`
      *,
      discipulos!inner(id, user_id, nivel_atual, nome_completo_temp, email_temporario, xp_total, discipulador_id)
    `)
    .eq("id", reflexaoId)
    .single()

  if (!reflexao || reflexao.discipulos?.discipulador_id !== user.id) {
    redirect("/discipulador")
  }

  const aprovarReflexao = async (formData: FormData) => {
    "use server"
    const supabase = await createClient()
    const feedback = formData.get("feedback") as string || "Reflexão aprovada!"

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    // Dar recompensa de XP
    const xpGanho = 25
    await supabase
      .from("discipulos")
      .update({ 
        xp_total: (reflexao.discipulos.xp_total || 0) + xpGanho 
      })
      .eq("id", reflexao.discipulo_id)

    // Excluir a reflexão após validação
    await supabase
      .from("reflexoes_conteudo")
      .delete()
      .eq("id", reflexaoId)

    // Excluir notificação relacionada
    await supabase
      .from("notificacoes")
      .delete()
      .eq("user_id", user.id)
      .eq("tipo", "reflexao")

    // Enviar mensagem de feedback no chat
    await supabase.from("mensagens").insert({
      discipulo_id: reflexao.discipulo_id,
      remetente_id: user.id,
      mensagem: `✅ Reflexão aprovada! Você ganhou +${xpGanho} XP.\n\nFeedback: ${feedback}`,
    })

    // Notificar o discípulo
    await supabase.from("notificacoes").insert({
      user_id: reflexao.discipulos.user_id,
      tipo: "aprovacao",
      titulo: "Reflexão aprovada!",
      mensagem: `Seu discipulador aprovou sua reflexão sobre "${reflexao.titulo}". +${xpGanho} XP!`,
      link: `/dashboard/chat`,
    })

    redirect("/discipulador")
  }

  const reprovarReflexao = async (formData: FormData) => {
    "use server"
    const supabase = await createClient()
    const feedback = formData.get("feedback") as string || "Por favor, revise sua reflexão."

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    // Excluir a reflexão
    await supabase
      .from("reflexoes_conteudo")
      .delete()
      .eq("id", reflexaoId)

    // Excluir notificação relacionada
    await supabase
      .from("notificacoes")
      .delete()
      .eq("user_id", user.id)
      .eq("tipo", "reflexao")

    // Enviar mensagem de feedback no chat
    await supabase.from("mensagens").insert({
      discipulo_id: reflexao.discipulo_id,
      remetente_id: user.id,
      mensagem: `📝 Sua reflexão sobre "${reflexao.titulo}" precisa ser revisada.\n\nFeedback: ${feedback}`,
    })

    // Notificar o discípulo
    await supabase.from("notificacoes").insert({
      user_id: reflexao.discipulos.user_id,
      tipo: "reprovacao",
      titulo: "Reflexão precisa de revisão",
      mensagem: `Seu discipulador pediu que você revise sua reflexão sobre "${reflexao.titulo}".`,
      link: `/dashboard/chat`,
    })

    redirect("/discipulador")
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/discipulador">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="flex-1">
              <h1 className="text-xl font-bold">Validar Reflexão</h1>
              <p className="text-sm text-muted-foreground">
                {reflexao.discipulos.nome_completo_temp}
              </p>
            </div>
            <Badge variant="outline">{reflexao.discipulos.nivel_atual}</Badge>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {reflexao.tipo === "video" ? (
                <Play className="w-5 h-5 text-primary" />
              ) : (
                <ExternalLink className="w-5 h-5 text-secondary" />
              )}
              {reflexao.tipo === "video" ? "Vídeo" : "Artigo"}: {reflexao.titulo}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-2">Reflexão do discípulo:</p>
                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-base leading-relaxed">{reflexao.reflexao}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Enviado em {new Date(reflexao.data_criacao).toLocaleDateString('pt-BR')}</span>
                <span>•</span>
                <span>Fase {reflexao.fase_numero} - Passo {reflexao.passo_numero}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Aprovar Reflexão</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={aprovarReflexao} className="space-y-4">
              <div>
                <label htmlFor="feedback-aprovar" className="text-sm font-medium mb-2 block">
                  Feedback para o discípulo (opcional)
                </label>
                <Textarea
                  id="feedback-aprovar"
                  name="feedback"
                  placeholder="Escreva um feedback encorajador..."
                  className="min-h-24"
                />
              </div>
              <Button type="submit" size="lg" className="w-full">
                <CheckCircle className="w-4 h-4 mr-2" />
                Aprovar e Dar Recompensa (+25 XP)
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pedir Revisão</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={reprovarReflexao} className="space-y-4">
              <div>
                <label htmlFor="feedback-reprovar" className="text-sm font-medium mb-2 block">
                  Feedback para revisão (obrigatório)
                </label>
                <Textarea
                  id="feedback-reprovar"
                  name="feedback"
                  placeholder="Explique o que precisa ser melhorado..."
                  className="min-h-24"
                  required
                />
              </div>
              <Button type="submit" variant="destructive" size="lg" className="w-full">
                <XCircle className="w-4 h-4 mr-2" />
                Pedir Revisão
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
