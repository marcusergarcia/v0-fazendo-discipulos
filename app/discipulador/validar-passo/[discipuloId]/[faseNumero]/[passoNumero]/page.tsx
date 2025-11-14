import { redirect } from 'next/navigation'
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, CheckCircle, XCircle, Award } from 'lucide-react'
import Link from "next/link"

export default async function ValidarPassoPage({
  params,
}: {
  params: Promise<{ discipuloId: string; faseNumero: string; passoNumero: string }>
}) {
  const { discipuloId, faseNumero, passoNumero } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: discipulo } = await supabase
    .from("discipulos")
    .select("*")
    .eq("user_id", discipuloId)
    .eq("discipulador_id", user.id)
    .single()

  if (!discipulo) redirect("/discipulador")

  const { data: progresso } = await supabase
    .from("progresso_fases")
    .select("*")
    .eq("discipulo_id", discipulo.id)
    .eq("fase_numero", parseInt(faseNumero))
    .eq("passo_numero", parseInt(passoNumero))
    .single()

  if (!progresso) redirect("/discipulador")

  const aprovarMissao = async (formData: FormData) => {
    "use server"
    const supabase = await createClient()
    const feedback = formData.get("feedback") as string || "Missão aprovada! Continue assim!"

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    // Dar recompensa de XP (50 XP por passo aprovado)
    const xpGanho = 50
    await supabase
      .from("discipulos")
      .update({ 
        xp_total: (discipulo.xp_total || 0) + xpGanho,
        passo_atual: Math.max(discipulo.passo_atual || 1, parseInt(passoNumero) + 1)
      })
      .eq("id", discipulo.id)

    // Marcar progresso como aprovado
    await supabase
      .from("progresso_fases")
      .update({
        status_validacao: "aprovado",
        completado: true,
        data_validacao: new Date().toISOString(),
        feedback_discipulador: feedback,
        xp_ganho: xpGanho,
      })
      .eq("id", progresso.id)

    // Excluir notificação de missão
    await supabase
      .from("notificacoes")
      .delete()
      .eq("user_id", user.id)
      .eq("tipo", "missao")

    // Enviar mensagem de feedback no chat
    await supabase.from("mensagens").insert({
      discipulo_id: discipulo.id,
      remetente_id: user.id,
      mensagem: `🎉 Missão do Passo ${passoNumero} aprovada! Você ganhou +${xpGanho} XP e liberou o próximo passo!\n\nFeedback: ${feedback}`,
    })

    // Notificar o discípulo
    await supabase.from("notificacoes").insert({
      user_id: discipuloId,
      tipo: "aprovacao",
      titulo: "Missão aprovada!",
      mensagem: `Seu discipulador aprovou a missão do Passo ${passoNumero}. +${xpGanho} XP!`,
      link: `/dashboard/passo/${passoNumero}`,
    })

    redirect("/discipulador")
  }

  const reprovarMissao = async (formData: FormData) => {
    "use server"
    const supabase = await createClient()
    const feedback = formData.get("feedback") as string

    if (!feedback || feedback.trim().length < 10) {
      return
    }

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    // Marcar como reprovado e permitir reenvio
    await supabase
      .from("progresso_fases")
      .update({
        status_validacao: "reprovado",
        feedback_discipulador: feedback,
        enviado_para_validacao: false,
      })
      .eq("id", progresso.id)

    // Excluir notificação de missão
    await supabase
      .from("notificacoes")
      .delete()
      .eq("user_id", user.id)
      .eq("tipo", "missao")

    // Enviar mensagem de feedback no chat
    await supabase.from("mensagens").insert({
      discipulo_id: discipulo.id,
      remetente_id: user.id,
      mensagem: `📝 Sua missão do Passo ${passoNumero} precisa ser revisada.\n\nFeedback: ${feedback}\n\nPor favor, revise e envie novamente.`,
    })

    // Notificar o discípulo
    await supabase.from("notificacoes").insert({
      user_id: discipuloId,
      tipo: "reprovacao",
      titulo: "Missão precisa de revisão",
      mensagem: `Seu discipulador pediu que você revise a missão do Passo ${passoNumero}.`,
      link: `/dashboard/passo/${passoNumero}`,
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
              <h1 className="text-xl font-bold">Validar Missão do Passo {passoNumero}</h1>
              <p className="text-sm text-muted-foreground">
                {discipulo.nome_completo_temp}
              </p>
            </div>
            <Badge variant="outline">{discipulo.nivel_atual}</Badge>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5 text-primary" />
              Missão Prática - Fase {faseNumero} Passo {passoNumero}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-2">Resposta da pergunta:</p>
                <div className="bg-muted p-4 rounded-lg mb-4">
                  <p className="text-base leading-relaxed">{progresso.resposta_pergunta}</p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium mb-2">Missão prática:</p>
                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-base leading-relaxed">{progresso.resposta_missao}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Enviado em {new Date(progresso.data_envio_validacao).toLocaleDateString('pt-BR')}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Aprovar Missão</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={aprovarMissao} className="space-y-4">
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
                Aprovar e Dar Recompensa (+50 XP)
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pedir Revisão</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={reprovarMissao} className="space-y-4">
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
